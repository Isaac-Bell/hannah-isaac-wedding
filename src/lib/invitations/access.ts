import { randomBytes } from "node:crypto";
import {
  deriveInvitationCodeHash,
  deriveRequesterHash,
  deriveSessionTokenHash,
  isInvitationCodeFormat,
  normalizeInvitationCode,
  secureHashEquals,
} from "./code";
import type { InvitationStore, SessionRecord } from "./types";
import {
  evaluateInvitationRateLimit,
  RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/invitation";

export const INVITATION_ERROR =
  "We couldn’t use that invitation code. Check the code and try again.";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

type AuthenticateInput = {
  code: string;
  requesterIdentifier: string;
  pepper: string;
  store: InvitationStore;
  now?: Date;
  getRandomBytes?: (size: number) => Buffer;
};

export type AuthenticateResult =
  | { ok: false; reason: "invalid" | "rate-limited" }
  | { ok: true; token: string; expiresAt: Date; session: SessionRecord };

export async function authenticateInvitationCode({
  code,
  requesterIdentifier,
  pepper,
  store,
  now = new Date(),
  getRandomBytes = randomBytes,
}: AuthenticateInput): Promise<AuthenticateResult> {
  const normalized = normalizeInvitationCode(code);
  const codeFingerprint = deriveInvitationCodeHash(normalized, pepper);
  const requesterHash = deriveRequesterHash(requesterIdentifier, pepper);
  const counts = await store.countAttempts(
    requesterHash,
    codeFingerprint,
    new Date(now.getTime() - RATE_LIMIT_WINDOW_MS),
  );
  if (!evaluateInvitationRateLimit(counts).allowed) {
    return { ok: false, reason: "rate-limited" };
  }

  const invitation = isInvitationCodeFormat(normalized)
    ? await store.findInvitationByHash(codeFingerprint)
    : null;
  const valid =
    invitation !== null &&
    invitation.isActive &&
    (!invitation.expiresAt || invitation.expiresAt > now) &&
    secureHashEquals(codeFingerprint, invitation.codeHash);
  await store.recordAttempt({
    requesterHash,
    codeFingerprint,
    succeeded: valid,
    attemptedAt: now,
  });
  if (!valid || !invitation) return { ok: false, reason: "invalid" };

  const token = getRandomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const session = await store.createSession({
    invitationId: invitation.id,
    tokenHash: deriveSessionTokenHash(token, pepper),
    expiresAt,
    now,
  });
  return { ok: true, token, expiresAt, session };
}

export async function loadInvitationSession(input: {
  token: string | undefined;
  pepper: string;
  store: InvitationStore;
  now?: Date;
}) {
  if (!input.token) return null;
  const now = input.now ?? new Date();
  const session = await input.store.findSessionByHash(
    deriveSessionTokenHash(input.token, input.pepper),
  );
  if (!session) return null;
  const valid =
    !session.revokedAt &&
    session.expiresAt > now &&
    session.invitation.isActive &&
    (!session.invitation.expiresAt || session.invitation.expiresAt > now);
  if (!valid) {
    if (!session.revokedAt) await input.store.revokeSession(session.id, now);
    return null;
  }
  await input.store.touchSession(session.id, now);
  return session;
}

export async function revokeInvitationSession(input: {
  token: string | undefined;
  pepper: string;
  store: InvitationStore;
  now?: Date;
}) {
  if (!input.token) return;
  const session = await input.store.findSessionByHash(
    deriveSessionTokenHash(input.token, input.pepper),
  );
  if (session && !session.revokedAt) {
    await input.store.revokeSession(session.id, input.now ?? new Date());
  }
}

export function enforceInvitationSession<T>(
  session: T | null,
  onUnauthenticated: () => never,
): T {
  if (!session) return onUnauthenticated();
  return session;
}
