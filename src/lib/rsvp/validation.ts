import { z } from "zod";
import { RSVP_OPTIONAL_EVENTS } from "./events";

export const RSVP_FIELD_LIMITS = {
  dietaryRequirements: 500,
  accessibilityRequirements: 500,
  message: 1200,
  songRequest: 160,
  phone: 32,
} as const;

const blankToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
};

function optionalText(maximum: number, message: string) {
  return z.preprocess(blankToNull, z.string().max(maximum, message).nullable());
}

const optionalEmail = z.preprocess(
  blankToNull,
  z
    .email("Enter a valid email address.")
    .max(254, "Email address is too long.")
    .transform((value) => value.toLowerCase())
    .nullable(),
);

const optionalPhone = z.preprocess(
  blankToNull,
  z
    .string()
    .max(RSVP_FIELD_LIMITS.phone, "Phone number is too long.")
    .refine((value) => /^[+()\- .0-9]+$/.test(value), {
      message: "Enter a valid phone number.",
    })
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }, "Enter a phone number with 7 to 15 digits.")
    .nullable(),
);

const knownEventKeys = new Set<string>(
  RSVP_OPTIONAL_EVENTS.map((event) => event.key),
);

const guestResponseSchema = z
  .object({
    guestId: z.uuid("Guest identifier is invalid."),
    attending: z.boolean({ error: "Choose attending or not attending." }),
    dietaryRequirements: optionalText(
      RSVP_FIELD_LIMITS.dietaryRequirements,
      "Dietary requirements must be 500 characters or fewer.",
    ),
    accessibilityRequirements: optionalText(
      RSVP_FIELD_LIMITS.accessibilityRequirements,
      "Accessibility requirements must be 500 characters or fewer.",
    ),
    eventChoices: z.record(z.string(), z.boolean()).default({}),
  })
  .strict()
  .superRefine((guest, context) => {
    for (const key of Object.keys(guest.eventChoices)) {
      if (!knownEventKeys.has(key)) {
        context.addIssue({
          code: "custom",
          message: "This optional event is not recognized.",
          path: ["eventChoices", key],
        });
      }
    }
  })
  .transform((guest) =>
    guest.attending
      ? guest
      : {
          ...guest,
          dietaryRequirements: null,
          accessibilityRequirements: null,
          eventChoices: {},
        },
  );

export const rsvpSubmissionSchema = z
  .object({
    contactEmail: optionalEmail,
    contactPhone: optionalPhone,
    songRequest: optionalText(
      RSVP_FIELD_LIMITS.songRequest,
      "Song request must be 160 characters or fewer.",
    ),
    message: optionalText(
      RSVP_FIELD_LIMITS.message,
      "Message must be 1,200 characters or fewer.",
    ),
    guests: z
      .array(guestResponseSchema)
      .min(1, "At least one guest is required."),
  })
  .strict()
  .superRefine((submission, context) => {
    if (!submission.contactEmail && !submission.contactPhone) {
      const message = "Provide an email address or phone number.";
      context.addIssue({ code: "custom", message, path: ["contactEmail"] });
      context.addIssue({ code: "custom", message, path: ["contactPhone"] });
    }
    const seen = new Set<string>();
    submission.guests.forEach((guest, index) => {
      if (seen.has(guest.guestId)) {
        context.addIssue({
          code: "custom",
          message: "A guest response was submitted more than once.",
          path: ["guests", index, "guestId"],
        });
      }
      seen.add(guest.guestId);
    });
  });

export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;

export type RsvpFieldErrors = Record<string, string[]>;

export function validationErrorsForForm(
  issues: z.core.$ZodIssue[],
  rawSubmission: unknown,
): RsvpFieldErrors {
  const errors: RsvpFieldErrors = {};
  const rawGuests =
    typeof rawSubmission === "object" &&
    rawSubmission !== null &&
    "guests" in rawSubmission &&
    Array.isArray(rawSubmission.guests)
      ? rawSubmission.guests
      : [];

  for (const issue of issues) {
    let key = "form";
    const [first, second, third, fourth] = issue.path;
    if (first === "guests" && typeof second === "number") {
      const rawGuest = rawGuests[second];
      const guestId =
        typeof rawGuest === "object" &&
        rawGuest !== null &&
        "guestId" in rawGuest &&
        typeof rawGuest.guestId === "string"
          ? rawGuest.guestId
          : `guest-${second}`;
      if (third === "eventChoices" && typeof fourth === "string") {
        key = `event:${guestId}:${fourth}`;
      } else if (third === "dietaryRequirements") {
        key = `dietary:${guestId}`;
      } else if (third === "accessibilityRequirements") {
        key = `accessibility:${guestId}`;
      } else {
        key = `attendance:${guestId}`;
      }
    } else if (typeof first === "string") {
      key = first;
    }
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
}
