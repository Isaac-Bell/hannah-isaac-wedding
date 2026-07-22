import { loadEnvConfig } from "@next/env";
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  guestResponses,
  guests,
  invitations,
  partyResponses,
} from "../src/db/schema";
import { getDatabaseUrl } from "../src/lib/config/env";

loadEnvConfig(process.cwd());

function valueFor(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const environment = valueFor("--environment");
  const partyName = valueFor("--party-name")?.trim();
  const confirmed = process.argv.includes("--confirm-reset");

  if (environment !== "development" || !partyName || !confirmed) {
    throw new Error(
      'Usage: npm run rsvp:reset -- --environment development --party-name "Test Household" --confirm-reset',
    );
  }

  const databaseUrl = getDatabaseUrl();
  const hostname = new URL(databaseUrl).hostname;
  if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname)) {
    throw new Error("RSVP reset is restricted to a local development database");
  }

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const database = drizzle(client);
  try {
    const result = await database.transaction(async (transaction) => {
      const matches = await transaction
        .select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.partyName, partyName));
      if (matches.length !== 1) {
        throw new Error(
          matches.length === 0
            ? "No development household matched that party name"
            : "More than one household matched; no RSVP data was changed",
        );
      }
      const invitationId = matches[0].id;
      await transaction.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${`rsvp:${invitationId}`}, 0))`,
      );
      const householdGuests = await transaction
        .select({ id: guests.id })
        .from(guests)
        .where(eq(guests.invitationId, invitationId));
      const guestIds = householdGuests.map((guest) => guest.id);
      const removedGuestResponses = guestIds.length
        ? await transaction
            .delete(guestResponses)
            .where(inArray(guestResponses.guestId, guestIds))
            .returning({ id: guestResponses.id })
        : [];
      const removedPartyResponses = await transaction
        .delete(partyResponses)
        .where(eq(partyResponses.invitationId, invitationId))
        .returning({ id: partyResponses.id });
      return {
        guestResponses: removedGuestResponses.length,
        partyResponses: removedPartyResponses.length,
      };
    });
    process.stdout.write(
      `Development RSVP reset complete: ${result.partyResponses} household response and ${result.guestResponses} guest responses removed.\n`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "RSVP reset failed");
  process.exitCode = 1;
});
