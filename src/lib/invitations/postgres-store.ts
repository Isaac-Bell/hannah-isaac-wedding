import "server-only";

import { and, count, eq, gte, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  invitationAttempts,
  invitationSessions,
  invitations,
} from "@/db/schema";
import type { InvitationRecord, InvitationStore, SessionRecord } from "./types";
import { evaluateInvitationRateLimit } from "@/lib/rate-limit/invitation";

function mapInvitation(row: typeof invitations.$inferSelect): InvitationRecord {
  return {
    id: row.id,
    partyName: row.partyName,
    codeHash: row.codeHash,
    isActive: row.isActive,
    expiresAt: row.expiresAt,
  };
}

export class PostgresInvitationStore implements InvitationStore {
  private readonly db = getDatabase();

  async recordFailedAttemptIfAllowed(input: {
    requesterHash: string;
    codeFingerprint: string;
    attemptedAt: Date;
    since: Date;
  }) {
    return this.db.transaction(async (transaction) => {
      // Transaction-scoped advisory locks serialize contenders for both keys,
      // closing the count-then-insert race across application instances.
      const lockKeys = [input.requesterHash, input.codeFingerprint].sort();
      for (const lockKey of lockKeys) {
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
        );
      }
      const [requesterRows, codeRows] = await Promise.all([
        transaction
          .select({ value: count() })
          .from(invitationAttempts)
          .where(
            and(
              eq(invitationAttempts.requesterHash, input.requesterHash),
              eq(invitationAttempts.succeeded, false),
              gte(invitationAttempts.attemptedAt, input.since),
            ),
          ),
        transaction
          .select({ value: count() })
          .from(invitationAttempts)
          .where(
            and(
              eq(invitationAttempts.codeFingerprint, input.codeFingerprint),
              eq(invitationAttempts.succeeded, false),
              gte(invitationAttempts.attemptedAt, input.since),
            ),
          ),
      ]);
      const decision = evaluateInvitationRateLimit({
        requester: requesterRows[0]?.value ?? 0,
        code: codeRows[0]?.value ?? 0,
      });
      if (decision.allowed) {
        await transaction.insert(invitationAttempts).values({
          requesterHash: input.requesterHash,
          codeFingerprint: input.codeFingerprint,
          attemptedAt: input.attemptedAt,
          succeeded: false,
        });
      }
      return decision;
    });
  }

  async recordSuccessfulAttempt(input: {
    requesterHash: string;
    codeFingerprint: string;
    attemptedAt: Date;
  }) {
    await this.db
      .insert(invitationAttempts)
      .values({ ...input, succeeded: true });
  }

  async findInvitationByHash(codeHash: string) {
    const rows = await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.codeHash, codeHash))
      .limit(1);
    return rows[0] ? mapInvitation(rows[0]) : null;
  }

  async createSession(input: {
    invitationId: string;
    tokenHash: string;
    expiresAt: Date;
    now: Date;
  }): Promise<SessionRecord> {
    const inserted = await this.db
      .insert(invitationSessions)
      .values({
        invitationId: input.invitationId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        lastSeenAt: input.now,
      })
      .returning();
    const session = inserted[0];
    const invitation = await this.findInvitationById(input.invitationId);
    if (!session || !invitation)
      throw new Error("Could not create invitation session");
    return { ...session, invitation };
  }

  async findSessionByHash(tokenHash: string): Promise<SessionRecord | null> {
    const rows = await this.db
      .select({ session: invitationSessions, invitation: invitations })
      .from(invitationSessions)
      .innerJoin(
        invitations,
        eq(invitationSessions.invitationId, invitations.id),
      )
      .where(eq(invitationSessions.tokenHash, tokenHash))
      .limit(1);
    const row = rows[0];
    return row
      ? { ...row.session, invitation: mapInvitation(row.invitation) }
      : null;
  }

  async touchSession(id: string, now: Date) {
    await this.db
      .update(invitationSessions)
      .set({ lastSeenAt: now })
      .where(eq(invitationSessions.id, id));
  }

  async revokeSession(id: string, now: Date) {
    await this.db
      .update(invitationSessions)
      .set({ revokedAt: now })
      .where(eq(invitationSessions.id, id));
  }

  private async findInvitationById(id: string) {
    const rows = await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.id, id))
      .limit(1);
    return rows[0] ? mapInvitation(rows[0]) : null;
  }
}
