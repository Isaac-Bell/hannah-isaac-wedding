// @vitest-environment node

import { describe, expect, it } from "vitest";
import { saveRsvp } from "./service";
import type {
  AuthenticatedRsvpIdentity,
  GuestResponseWrite,
  PartyResponseWrite,
  RsvpHousehold,
  RsvpRepository,
  RsvpTransaction,
} from "./types";

const invitationId = "11111111-1111-4111-8111-111111111111";
const otherInvitationId = "22222222-2222-4222-8222-222222222222";
const firstGuestId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const secondGuestId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const otherGuestId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const identity: AuthenticatedRsvpIdentity = {
  sessionId: "session-one",
  invitationId,
};
const now = new Date("2026-07-22T18:30:00Z");

function household(
  id = invitationId,
  guestIds = [firstGuestId, secondGuestId],
): RsvpHousehold {
  return {
    invitationId: id,
    partyName: id === invitationId ? "Rivera Household" : "Other Household",
    response: null,
    guests: guestIds.map((guestId, index) => ({
      id: guestId,
      fullName: index === 0 ? "Alex Rivera" : "Sam Rivera",
      guestType: "named",
      isOptional: false,
      allowedEvents:
        index === 0
          ? [
              {
                key: "welcome-gathering",
                label: "Welcome gathering",
                description: "Details to be confirmed.",
              },
            ]
          : [],
      response: null,
    })),
  };
}

function validSubmission() {
  return {
    contactEmail: "alex@example.com",
    contactPhone: "",
    songRequest: "September - Earth, Wind & Fire",
    message: "We cannot wait!",
    guests: [
      {
        guestId: firstGuestId,
        attending: true,
        dietaryRequirements: "Vegetarian",
        accessibilityRequirements: "",
        eventChoices: { "welcome-gathering": true },
      },
      {
        guestId: secondGuestId,
        attending: false,
        dietaryRequirements: "This must be cleared",
        accessibilityRequirements: "This must also be cleared",
        eventChoices: {},
      },
    ],
  };
}

class FakeRsvpRepository implements RsvpRepository, RsvpTransaction {
  households = new Map<string, RsvpHousehold>([
    [invitationId, household()],
    [otherInvitationId, household(otherInvitationId, [otherGuestId])],
  ]);
  partyResponses = new Map<string, PartyResponseWrite>();
  guestResponses = new Map<string, GuestResponseWrite>();
  sessionValid = true;
  failOnGuestId: string | null = null;
  loadedInvitationIds: string[] = [];
  private transactionQueue: Promise<void> = Promise.resolve();

  async transaction<T>(work: (transaction: RsvpTransaction) => Promise<T>) {
    let release = () => {};
    const previous = this.transactionQueue;
    this.transactionQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    const partySnapshot = new Map(this.partyResponses);
    const guestSnapshot = new Map(this.guestResponses);
    try {
      return await work(this);
    } catch (error) {
      this.partyResponses = partySnapshot;
      this.guestResponses = guestSnapshot;
      throw error;
    } finally {
      release();
    }
  }

  async lockAndRevalidateSession(candidate: AuthenticatedRsvpIdentity) {
    return (
      this.sessionValid &&
      candidate.sessionId === identity.sessionId &&
      candidate.invitationId === identity.invitationId
    );
  }

  async loadHousehold(id: string) {
    this.loadedInvitationIds.push(id);
    return this.households.get(id) ?? null;
  }

  async upsertPartyResponse(input: PartyResponseWrite) {
    this.partyResponses.set(input.invitationId, input);
  }

  async upsertGuestResponse(input: GuestResponseWrite) {
    if (input.guestId === this.failOnGuestId) throw new Error("write failed");
    this.guestResponses.set(input.guestId, input);
  }
}

describe("authenticated household RSVP service", () => {
  it("loads guests only for the authenticated invitation", async () => {
    const repository = new FakeRsvpRepository();
    const result = await saveRsvp({
      repository,
      identity,
      rawSubmission: validSubmission(),
      now,
    });
    expect(result.ok).toBe(true);
    expect(repository.loadedInvitationIds).toEqual([invitationId]);
    expect([...repository.guestResponses.keys()]).toEqual([
      firstGuestId,
      secondGuestId,
    ]);
  });

  it("rejects an unknown guest ID", async () => {
    const repository = new FakeRsvpRepository();
    const submission = validSubmission();
    submission.guests[0].guestId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const result = await saveRsvp({
      repository,
      identity,
      rawSubmission: submission,
    });
    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    expect(repository.partyResponses.size).toBe(0);
  });

  it("rejects a guest belonging to another invitation", async () => {
    const repository = new FakeRsvpRepository();
    const submission = validSubmission();
    submission.guests[0].guestId = otherGuestId;
    const result = await saveRsvp({
      repository,
      identity,
      rawSubmission: submission,
    });
    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    expect(repository.guestResponses.has(otherGuestId)).toBe(false);
  });

  it("rejects missing attendance", async () => {
    const repository = new FakeRsvpRepository();
    const submission = validSubmission() as Record<string, unknown> & {
      guests: Array<Record<string, unknown>>;
    };
    delete submission.guests[0].attending;
    const result = await saveRsvp({
      repository,
      identity,
      rawSubmission: submission,
    });
    expect(result).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("validates contact data and requires at least one contact method", async () => {
    const repository = new FakeRsvpRepository();
    const invalidEmail = { ...validSubmission(), contactEmail: "not-an-email" };
    const invalidResult = await saveRsvp({
      repository,
      identity,
      rawSubmission: invalidEmail,
    });
    expect(invalidResult).toMatchObject({ ok: false, reason: "invalid" });

    const missingContact = {
      ...validSubmission(),
      contactEmail: "",
      contactPhone: "",
    };
    const missingResult = await saveRsvp({
      repository,
      identity,
      rawSubmission: missingContact,
    });
    expect(missingResult).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("clears details and event choices for non-attending guests", async () => {
    const repository = new FakeRsvpRepository();
    const result = await saveRsvp({
      repository,
      identity,
      rawSubmission: validSubmission(),
      now,
    });
    expect(result.ok).toBe(true);
    expect(repository.guestResponses.get(secondGuestId)).toMatchObject({
      attending: false,
      dietaryRequirements: null,
      accessibilityRequirements: null,
      eventChoices: {},
    });
  });

  it("rejects unknown and ineligible optional events", async () => {
    const repository = new FakeRsvpRepository();
    expect(
      await saveRsvp({
        repository,
        identity,
        rawSubmission: {
          ...validSubmission(),
          guests: validSubmission().guests.map((guest, index) => ({
            ...guest,
            eventChoices: index === 0 ? { "after-party": true } : {},
          })),
        },
      }),
    ).toMatchObject({ ok: false, reason: "invalid" });

    const ineligible = validSubmission();
    ineligible.guests[1].attending = true;
    ineligible.guests[1].eventChoices = { "welcome-gathering": true };
    expect(
      await saveRsvp({ repository, identity, rawSubmission: ineligible }),
    ).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("inserts once and updates the same response rows later", async () => {
    const repository = new FakeRsvpRepository();
    await saveRsvp({
      repository,
      identity,
      rawSubmission: validSubmission(),
      now,
    });
    const changed = validSubmission();
    changed.message = "Updated message";
    changed.guests[0].dietaryRequirements = "Gluten free";
    await saveRsvp({
      repository,
      identity,
      rawSubmission: changed,
      now: new Date(now.getTime() + 60_000),
    });
    expect(repository.partyResponses.size).toBe(1);
    expect(repository.guestResponses.size).toBe(2);
    expect(repository.partyResponses.get(invitationId)?.message).toBe(
      "Updated message",
    );
    expect(
      repository.guestResponses.get(firstGuestId)?.dietaryRequirements,
    ).toBe("Gluten free");
  });

  it("rolls back every write when a guest upsert fails", async () => {
    const repository = new FakeRsvpRepository();
    repository.failOnGuestId = secondGuestId;
    await expect(
      saveRsvp({ repository, identity, rawSubmission: validSubmission(), now }),
    ).rejects.toThrow("write failed");
    expect(repository.partyResponses.size).toBe(0);
    expect(repository.guestResponses.size).toBe(0);
  });

  it("serializes concurrent saves without creating duplicate rows", async () => {
    const repository = new FakeRsvpRepository();
    const first = validSubmission();
    first.message = "First tab";
    const second = validSubmission();
    second.message = "Second tab";
    await Promise.all([
      saveRsvp({ repository, identity, rawSubmission: first, now }),
      saveRsvp({
        repository,
        identity,
        rawSubmission: second,
        now: new Date(now.getTime() + 1_000),
      }),
    ]);
    expect(repository.partyResponses.size).toBe(1);
    expect(repository.guestResponses.size).toBe(2);
    expect(repository.partyResponses.get(invitationId)?.message).toBe(
      "Second tab",
    );
  });

  it("refuses a session that fails transactional revalidation", async () => {
    const repository = new FakeRsvpRepository();
    repository.sessionValid = false;
    expect(
      await saveRsvp({
        repository,
        identity,
        rawSubmission: validSubmission(),
      }),
    ).toEqual({ ok: false, reason: "unauthenticated" });
    expect(repository.partyResponses.size).toBe(0);
  });
});
