import {
  rsvpSubmissionSchema,
  type RsvpFieldErrors,
  type RsvpSubmission,
  validationErrorsForForm,
} from "./validation";
import type {
  AuthenticatedRsvpIdentity,
  RsvpRepository,
  RsvpTransaction,
} from "./types";

export type SaveRsvpResult =
  | {
      ok: true;
      savedAt: Date;
      submission: RsvpSubmission;
    }
  | {
      ok: false;
      reason: "invalid";
      fieldErrors: RsvpFieldErrors;
    }
  | { ok: false; reason: "unauthenticated" };

function addError(errors: RsvpFieldErrors, field: string, message: string) {
  errors[field] = [...(errors[field] ?? []), message];
}

function ownershipErrors(
  submission: RsvpSubmission,
  household: NonNullable<Awaited<ReturnType<RsvpTransaction["loadHousehold"]>>>,
) {
  const errors: RsvpFieldErrors = {};
  const expected = new Map(household.guests.map((guest) => [guest.id, guest]));
  const received = new Set(submission.guests.map((guest) => guest.guestId));

  for (const guest of submission.guests) {
    const ownedGuest = expected.get(guest.guestId);
    if (!ownedGuest) {
      addError(
        errors,
        `attendance:${guest.guestId}`,
        "This guest is not part of your invitation.",
      );
      continue;
    }
    const allowedKeys = new Set(
      ownedGuest.allowedEvents.map((event) => event.key),
    );
    for (const eventKey of Object.keys(guest.eventChoices)) {
      if (!allowedKeys.has(eventKey)) {
        addError(
          errors,
          `event:${guest.guestId}:${eventKey}`,
          "This event is not available for this guest.",
        );
      }
    }
  }

  for (const guest of household.guests) {
    if (!received.has(guest.id)) {
      addError(
        errors,
        `attendance:${guest.id}`,
        `Choose an attendance response for ${guest.fullName}.`,
      );
    }
  }
  return errors;
}

export async function saveRsvp(input: {
  repository: RsvpRepository;
  identity: AuthenticatedRsvpIdentity;
  rawSubmission: unknown;
  now?: Date;
}): Promise<SaveRsvpResult> {
  const now = input.now ?? new Date();
  return input.repository.transaction(async (transaction) => {
    const authenticated = await transaction.lockAndRevalidateSession(
      input.identity,
      now,
    );
    if (!authenticated) return { ok: false, reason: "unauthenticated" };

    const household = await transaction.loadHousehold(
      input.identity.invitationId,
    );
    if (!household || household.guests.length === 0) {
      return {
        ok: false,
        reason: "invalid",
        fieldErrors: {
          form: ["We couldn’t find guests attached to this invitation."],
        },
      };
    }

    const parsed = rsvpSubmissionSchema.safeParse(input.rawSubmission);
    if (!parsed.success) {
      return {
        ok: false,
        reason: "invalid",
        fieldErrors: validationErrorsForForm(
          parsed.error.issues,
          input.rawSubmission,
        ),
      };
    }

    const fieldErrors = ownershipErrors(parsed.data, household);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, reason: "invalid", fieldErrors };
    }

    await transaction.upsertPartyResponse({
      invitationId: input.identity.invitationId,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      message: parsed.data.message,
      songRequest: parsed.data.songRequest,
      submittedAt: now,
      updatedAt: now,
    });
    for (const guest of parsed.data.guests) {
      const allowedKeys = new Set(
        household.guests
          .find((candidate) => candidate.id === guest.guestId)!
          .allowedEvents.map((event) => event.key),
      );
      await transaction.upsertGuestResponse({
        ...guest,
        eventChoices: Object.fromEntries(
          Object.entries(guest.eventChoices).filter(([key]) =>
            allowedKeys.has(key),
          ),
        ),
        updatedAt: now,
      });
    }
    return { ok: true, savedAt: now, submission: parsed.data };
  });
}
