// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  authenticateInvitationCode,
  enforceInvitationSession,
  loadInvitationSession,
  revokeInvitationSession,
} from "./access";
import {
  deriveInvitationCodeHash,
  deriveSessionTokenHash,
  generateInvitationCode,
  normalizeInvitationCode,
} from "./code";
import type { InvitationRecord, InvitationStore, SessionRecord } from "./types";

const pepper = "test-pepper-that-is-at-least-thirty-two-characters";
const now = new Date("2026-07-12T00:00:00Z");
const code = "H6KM-9Q2P";

class FakeStore implements InvitationStore {
  attempts = { requester: 0, code: 0 };
  invitations = new Map<string, InvitationRecord>();
  sessions = new Map<string, SessionRecord>();
  successfulAttempts = 0;
  touchCount = 0;
  async recordFailedAttemptIfAllowed() {
    const allowed = this.attempts.requester < 10 && this.attempts.code < 5;
    if (allowed) {
      this.attempts.requester += 1;
      this.attempts.code += 1;
    }
    return { allowed, retryAfterSeconds: allowed ? undefined : 900 };
  }
  async recordSuccessfulAttempt() {
    this.successfulAttempts += 1;
  }
  async findInvitationByHash(hash: string) {
    return this.invitations.get(hash) ?? null;
  }
  async createSession(input: {
    invitationId: string;
    tokenHash: string;
    expiresAt: Date;
    now: Date;
  }) {
    const invitation = [...this.invitations.values()].find(
      (item) => item.id === input.invitationId,
    )!;
    const session: SessionRecord = {
      id: "session-1",
      ...input,
      lastSeenAt: input.now,
      revokedAt: null,
      invitation,
    };
    this.sessions.set(input.tokenHash, session);
    return session;
  }
  async findSessionByHash(hash: string) {
    return this.sessions.get(hash) ?? null;
  }
  async touchSession(id: string, lastSeenAt: Date) {
    this.touchCount += 1;
    for (const [hash, session] of this.sessions)
      if (session.id === id)
        this.sessions.set(hash, { ...session, lastSeenAt });
  }
  async revokeSession(id: string, revokedAt: Date) {
    for (const [hash, session] of this.sessions)
      if (session.id === id) this.sessions.set(hash, { ...session, revokedAt });
  }
}

function invitation(
  overrides: Partial<InvitationRecord> = {},
): InvitationRecord {
  return {
    id: "invitation-1",
    partyName: "Test Household",
    codeHash: deriveInvitationCodeHash(code, pepper),
    isActive: true,
    expiresAt: null,
    ...overrides,
  };
}

describe("invitation codes", () => {
  it("generates the non-ambiguous display format", () => {
    expect(generateInvitationCode((size) => Buffer.alloc(size, 2))).toMatch(
      /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/,
    );
  });
  it("normalizes codes", () =>
    expect(normalizeInvitationCode("h6km 9q2p")).toBe(code));
  it("derives deterministic keyed hashes", () => {
    expect(deriveInvitationCodeHash(code, pepper)).toBe(
      deriveInvitationCodeHash("h6km9q2p", pepper),
    );
    expect(deriveInvitationCodeHash(code, pepper)).not.toBe(
      deriveInvitationCodeHash(code, `${pepper}!`),
    );
  });
});

describe("invitation lookup", () => {
  it("creates a session for a valid invitation", async () => {
    const store = new FakeStore();
    store.invitations.set(invitation().codeHash, invitation());
    const result = await authenticateInvitationCode({
      code,
      requesterIdentifier: "requester",
      pepper,
      store,
      now,
      getRandomBytes: (size) => Buffer.alloc(size, 7),
    });
    expect(result.ok).toBe(true);
    expect(store.successfulAttempts).toBe(1);
    expect(store.sessions.size).toBe(1);
  });
  it.each([
    ["invalid", null],
    ["disabled", invitation({ isActive: false })],
    ["expired", invitation({ expiresAt: new Date("2026-01-01") })],
  ])("rejects %s invitations generically", async (_name, record) => {
    const store = new FakeStore();
    if (record) store.invitations.set(record.codeHash, record);
    expect(
      (
        await authenticateInvitationCode({
          code,
          requesterIdentifier: "requester",
          pepper,
          store,
          now,
        })
      ).ok,
    ).toBe(false);
  });
  it("blocks repeated failed attempts", async () => {
    const store = new FakeStore();
    for (let index = 0; index < 5; index += 1) {
      const result = await authenticateInvitationCode({
        code,
        requesterIdentifier: "requester",
        pepper,
        store,
        now,
      });
      expect(result).toMatchObject({ ok: false, reason: "invalid" });
    }
    const result = await authenticateInvitationCode({
      code,
      requesterIdentifier: "requester",
      pepper,
      store,
      now,
    });
    expect(result).toMatchObject({ ok: false, reason: "rate-limited" });
  });

  it("keeps requester and code failure limits independent", async () => {
    const requesterLimited = new FakeStore();
    requesterLimited.attempts = { requester: 10, code: 0 };
    const requesterResult = await authenticateInvitationCode({
      code,
      requesterIdentifier: "requester",
      pepper,
      store: requesterLimited,
      now,
    });
    expect(requesterResult).toMatchObject({
      ok: false,
      reason: "rate-limited",
    });
    const codeLimited = new FakeStore();
    codeLimited.attempts = { requester: 0, code: 5 };
    const codeResult = await authenticateInvitationCode({
      code,
      requesterIdentifier: "other",
      pepper,
      store: codeLimited,
      now,
    });
    expect(codeResult).toMatchObject({ ok: false, reason: "rate-limited" });
  });

  it("allows repeated successful logins without consuming failure limits", async () => {
    const store = new FakeStore();
    const record = invitation();
    store.invitations.set(record.codeHash, record);
    for (let index = 0; index < 5; index += 1) {
      expect(
        (
          await authenticateInvitationCode({
            code,
            requesterIdentifier: "requester",
            pepper,
            store,
            now,
          })
        ).ok,
      ).toBe(true);
    }
    expect(store.successfulAttempts).toBe(5);
    expect(store.attempts).toEqual({ requester: 0, code: 0 });
  });

  it("does not erase unrelated attacker failures after a success", async () => {
    const store = new FakeStore();
    store.attempts = { requester: 4, code: 3 };
    const record = invitation();
    store.invitations.set(record.codeHash, record);
    expect(
      (
        await authenticateInvitationCode({
          code,
          requesterIdentifier: "legitimate",
          pepper,
          store,
          now,
        })
      ).ok,
    ).toBe(true);
    expect(store.attempts).toEqual({ requester: 4, code: 3 });
  });
});

describe("sessions and protected access", () => {
  async function sessionFixture(
    expiresAt = new Date("2026-08-12"),
    lastSeenAt = now,
  ) {
    const store = new FakeStore();
    const record = invitation();
    store.invitations.set(record.codeHash, record);
    const token = "raw-session-token";
    const hash = deriveSessionTokenHash(token, pepper);
    store.sessions.set(hash, {
      id: "session-1",
      invitationId: record.id,
      tokenHash: hash,
      expiresAt,
      lastSeenAt,
      revokedAt: null,
      invitation: record,
    });
    return { store, token };
  }
  it("loads an authenticated travel-page session", async () => {
    const { store, token } = await sessionFixture();
    const session = await loadInvitationSession({ token, pepper, store, now });
    expect(
      enforceInvitationSession(session, () => {
        throw new Error("redirect");
      }).invitation.partyName,
    ).toBe("Test Household");
    expect(store.touchCount).toBe(0);
  });
  it("redirects unauthenticated protected access", () => {
    expect(() =>
      enforceInvitationSession(null, () => {
        throw new Error("redirect:/invite");
      }),
    ).toThrow("redirect:/invite");
  });
  it("expires sessions", async () => {
    const { store, token } = await sessionFixture(new Date("2026-01-01"));
    expect(
      await loadInvitationSession({ token, pepper, store, now }),
    ).toBeNull();
  });
  it("revokes sessions", async () => {
    const { store, token } = await sessionFixture();
    await revokeInvitationSession({ token, pepper, store, now });
    expect(
      await loadInvitationSession({ token, pepper, store, now }),
    ).toBeNull();
  });

  it("touches a session only after fifteen minutes", async () => {
    const oldLastSeen = new Date(now.getTime() - 16 * 60 * 1000);
    const { store, token } = await sessionFixture(
      new Date("2026-08-12"),
      oldLastSeen,
    );
    await loadInvitationSession({ token, pepper, store, now });
    expect(store.touchCount).toBe(1);
  });
});
