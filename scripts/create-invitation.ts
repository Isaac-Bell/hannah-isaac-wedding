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
    if (process.argv[index] === flag && process.argv[index + 1]) {
      values.push(process.argv[index + 1]);
    }
  }
  return values;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

const partyName = valuesFor("--party-name")[0];
const guestNames = valuesFor("--guest");
const mode = valuesFor("--environment")[0];
const confirmsProduction = process.argv.includes("--confirm-production");

if (
  !partyName ||
  guestNames.length === 0 ||
  !["development", "production"].includes(mode ?? "")
) {
  throw new Error(
    'Usage: npm run invite:create -- --environment development --party-name "Test Household" --guest "Guest One"',
  );
}
if (mode === "production" && !confirmsProduction) {
  throw new Error(
    "Refusing production invitation creation without --confirm-production",
  );
}

const environment = getCoreServerEnvironment();
const client = postgres(environment.DATABASE_URL, { max: 1, prepare: false });
const database = drizzle(client);
let createdCode: string | undefined;

try {
  for (let attempt = 0; attempt < 5 && !createdCode; attempt += 1) {
    const candidate = generateInvitationCode();
    try {
      await database.transaction(async (transaction) => {
        const inserted = await transaction
          .insert(invitations)
          .values({
            partyName,
            codeHash: deriveInvitationCodeHash(
              candidate,
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
      createdCode = candidate;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  if (!createdCode) {
    throw new Error(
      "Could not generate a unique invitation code after 5 attempts",
    );
  }
  process.stdout.write(`Invitation creation mode: ${mode}\n`);
  process.stdout.write(`INVITATION CODE (shown once): ${createdCode}\n`);
} finally {
  await client.end();
}
