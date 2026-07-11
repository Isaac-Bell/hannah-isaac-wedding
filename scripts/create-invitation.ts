import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { guests, invitations } from "../src/db/schema";
import { getCoreServerEnvironment } from "../src/lib/config/env";
import {
  deriveInvitationCodeHash,
  generateInvitationCode,
} from "../src/lib/invitations/code";

function valuesFor(flag: string) {
  const values: string[] = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === flag && process.argv[index + 1])
      values.push(process.argv[index + 1]);
  }
  return values;
}

const partyName = valuesFor("--party-name")[0];
const guestNames = valuesFor("--guest");
const confirmsProduction = process.argv.includes("--confirm-production");

if (!partyName || guestNames.length === 0) {
  throw new Error(
    'Usage: npm run invite:create -- --party-name "Test Household" --guest "Guest One"',
  );
}
if (process.env.NODE_ENV === "production" && !confirmsProduction) {
  throw new Error(
    "Refusing production invitation creation without --confirm-production",
  );
}

const environment = getCoreServerEnvironment();
const client = postgres(environment.DATABASE_URL, { max: 1, prepare: false });
const database = drizzle(client);
const code = generateInvitationCode();

try {
  await database.transaction(async (transaction) => {
    const inserted = await transaction
      .insert(invitations)
      .values({
        partyName,
        codeHash: deriveInvitationCodeHash(
          code,
          environment.INVITATION_CODE_PEPPER,
        ),
        maximumGuests: guestNames.length,
      })
      .returning({ id: invitations.id });
    const invitationId = inserted[0]?.id;
    if (!invitationId) throw new Error("Invitation insert failed");
    await transaction.insert(guests).values(
      guestNames.map((fullName) => {
        const [firstName, ...lastParts] = fullName.trim().split(/\s+/);
        return {
          invitationId,
          firstName: firstName || "Guest",
          lastName: lastParts.join(" "),
          guestType: "named",
        };
      }),
    );
  });
  process.stdout.write(`DEVELOPMENT INVITATION CODE (shown once): ${code}\n`);
} finally {
  await client.end();
}
