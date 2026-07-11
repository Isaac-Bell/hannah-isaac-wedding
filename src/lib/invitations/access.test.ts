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
  recorded: boolean[] = [];
  async countAttempts() {
    return this.attempts;
  }
  async recordAttempt(input: { succeeded: boolean }) {
    this.recorded.push(input.succeeded);
  }
  async findInvitationByHash(hash: string) {
    return this.invitations.get(hash) ?? null;
  }
  async createSession(input: {
    invitationId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    const invitation = [...this.invitations.values()].find(
      (item) => item.id === input.invitationId,
    )!;
    const session: SessionRecord = {
      id: "session-1",
      ...input,
      revokedAt: null,
      invitation,
    };
    this.sessions.set(input.tokenHash, session);
    return session;
  }
  async findSessionByHash(hash: string) {
    return this.sessions.get(hash) ?? null;
  }
  async touchSession() {}
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
    expect(store.recorded).toEqual([true]);
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
  it("rejects rate-limited attempts before lookup", async () => {
    const store = new FakeStore();
    store.attempts = { requester: 10, code: 0 };
    expect(
      await authenticateInvitationCode({
        code,
        requesterIdentifier: "requester",
        pepper,
        store,
        now,
      }),
    ).toEqual({ ok: false, reason: "rate-limited" });
  });
});

describe("sessions and protected access", () => {
  async function sessionFixture(expiresAt = new Date("2026-08-12")) {
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
});
