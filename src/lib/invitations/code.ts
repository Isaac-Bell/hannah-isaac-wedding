import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeInvitationCode(value: string): string {
  const compact = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return compact.length > 4
    ? `${compact.slice(0, 4)}-${compact.slice(4)}`
    : compact;
}

export function isInvitationCodeFormat(value: string): boolean {
  return /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(
    normalizeInvitationCode(value),
  );
}

export function generateInvitationCode(random = randomBytes): string {
  const bytes = random(8);
  const compact = Array.from(
    bytes,
    (byte) => ALPHABET[byte % ALPHABET.length],
  ).join("");
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function derive(value: string, pepper: string, purpose: string): string {
  return createHmac("sha256", pepper)
    .update(`${purpose}\0${value}`)
    .digest("hex");
}

export function deriveInvitationCodeHash(code: string, pepper: string): string {
  return derive(normalizeInvitationCode(code), pepper, "invitation-code-v1");
}

export function deriveSessionTokenHash(token: string, pepper: string): string {
  return derive(token, pepper, "invitation-session-v1");
}

export function deriveRequesterHash(
  identifier: string,
  pepper: string,
): string {
  return derive(identifier, pepper, "invitation-requester-v1");
}

export function secureHashEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
