import "server-only";

import { and, asc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  guestResponses,
  guests,
  invitationSessions,
  invitations,
  partyResponses,
} from "@/db/schema";
import { getAllowedOptionalEvents } from "./events";
import type {
  AuthenticatedRsvpIdentity,
  GuestResponseWrite,
  PartyResponseWrite,
  RsvpHousehold,
  RsvpRepository,
  RsvpTransaction,
} from "./types";

type Database = ReturnType<typeof getDatabase>;
type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
type QueryExecutor = Database | DatabaseTransaction;

async function loadHousehold(
  database: QueryExecutor,
  invitationId: string,
): Promise<RsvpHousehold | null> {
  const invitationRows = await database
    .select({ id: invitations.id, partyName: invitations.partyName })
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);
  const invitation = invitationRows[0];
  if (!invitation) return null;

  const [partyRows, guestRows] = await Promise.all([
    database
      .select()
      .from(partyResponses)
      .where(eq(partyResponses.invitationId, invitationId))
      .limit(1),
    database
      .select({ guest: guests, response: guestResponses })
      .from(guests)
      .leftJoin(guestResponses, eq(guestResponses.guestId, guests.id))
      .where(eq(guests.invitationId, invitationId))
      .orderBy(asc(guests.createdAt), asc(guests.id)),
  ]);
  const partyResponse = partyRows[0];

  return {
    invitationId: invitation.id,
    partyName: invitation.partyName,
    response: partyResponse
      ? {
          contactEmail: partyResponse.contactEmail,
          contactPhone: partyResponse.contactPhone,
          message: partyResponse.message,
          songRequest: partyResponse.songRequest,
          submittedAt: partyResponse.submittedAt,
          updatedAt: partyResponse.updatedAt,
        }
      : null,
    guests: guestRows.map(({ guest, response }) => ({
      id: guest.id,
      fullName: [guest.firstName, guest.lastName].filter(Boolean).join(" "),
      guestType: guest.guestType,
      isOptional: guest.isOptional,
      allowedEvents: getAllowedOptionalEvents(guest.guestType),
      response: response
        ? {
            attending: response.attending,
            dietaryRequirements: response.dietaryRequirements,
            accessibilityRequirements: response.accessibilityRequirements,
            eventChoices: response.eventChoices,
            updatedAt: response.updatedAt,
          }
        : null,
    })),
  };
}

class PostgresRsvpTransaction implements RsvpTransaction {
  constructor(private readonly transaction: DatabaseTransaction) {}

  async lockAndRevalidateSession(
    identity: AuthenticatedRsvpIdentity,
    now: Date,
  ) {
    // Serialize household writes. The unique indexes remain the final guard
    // against duplicates, while the lock gives concurrent tabs deterministic
    // last-write-wins behavior and a single final updatedAt value.
    await this.transaction.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`rsvp:${identity.invitationId}`}, 0))`,
    );
    const rows = await this.transaction
      .select({ id: invitationSessions.id })
      .from(invitationSessions)
      .innerJoin(
        invitations,
        eq(invitationSessions.invitationId, invitations.id),
      )
      .where(
        and(
          eq(invitationSessions.id, identity.sessionId),
          eq(invitationSessions.invitationId, identity.invitationId),
          isNull(invitationSessions.revokedAt),
          gt(invitationSessions.expiresAt, now),
          eq(invitations.isActive, true),
          or(isNull(invitations.expiresAt), gt(invitations.expiresAt, now)),
        ),
      )
      .limit(1)
      .for("update");
    return rows.length === 1;
  }

  loadHousehold(invitationId: string) {
    return loadHousehold(this.transaction, invitationId);
  }

  async upsertPartyResponse(input: PartyResponseWrite) {
    await this.transaction
      .insert(partyResponses)
      .values(input)
      .onConflictDoUpdate({
        target: partyResponses.invitationId,
        set: {
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          message: input.message,
          songRequest: input.songRequest,
          updatedAt: input.updatedAt,
        },
      });
  }

  async upsertGuestResponse(input: GuestResponseWrite) {
    await this.transaction
      .insert(guestResponses)
      .values(input)
      .onConflictDoUpdate({
        target: guestResponses.guestId,
        set: {
          attending: input.attending,
          dietaryRequirements: input.dietaryRequirements,
          accessibilityRequirements: input.accessibilityRequirements,
          eventChoices: input.eventChoices,
          updatedAt: input.updatedAt,
        },
      });
  }
}

export class PostgresRsvpRepository implements RsvpRepository {
  private readonly database = getDatabase();

  loadHousehold(invitationId: string) {
    return loadHousehold(this.database, invitationId);
  }

  transaction<T>(work: (transaction: RsvpTransaction) => Promise<T>) {
    return this.database.transaction((transaction) =>
      work(new PostgresRsvpTransaction(transaction)),
    );
  }
}
