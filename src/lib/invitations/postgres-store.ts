import "server-only";

import { and, count, eq, gte } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  invitationAttempts,
  invitationSessions,
  invitations,
} from "@/db/schema";
import type { InvitationRecord, InvitationStore, SessionRecord } from "./types";

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

  async countAttempts(
    requesterHash: string,
    codeFingerprint: string,
    since: Date,
  ) {
    const [requesterRows, codeRows] = await Promise.all([
      this.db
        .select({ value: count() })
        .from(invitationAttempts)
        .where(
          and(
            eq(invitationAttempts.requesterHash, requesterHash),
            gte(invitationAttempts.attemptedAt, since),
          ),
        ),
      this.db
        .select({ value: count() })
        .from(invitationAttempts)
        .where(
          and(
            eq(invitationAttempts.codeFingerprint, codeFingerprint),
            gte(invitationAttempts.attemptedAt, since),
          ),
        ),
    ]);
    return {
      requester: requesterRows[0]?.value ?? 0,
      code: codeRows[0]?.value ?? 0,
    };
  }

  async recordAttempt(input: {
    requesterHash: string;
    codeFingerprint: string;
    succeeded: boolean;
    attemptedAt: Date;
  }) {
    await this.db.insert(invitationAttempts).values(input);
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
