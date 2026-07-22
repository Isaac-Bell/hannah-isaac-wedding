export const RSVP_OPTIONAL_EVENTS = [
  {
    key: "welcome-gathering",
    label: "Welcome gathering",
    description: "Timing and location will be shared once confirmed.",
    eligibleGuestTypes: ["named"],
  },
] as const;

export type RsvpOptionalEventKey = (typeof RSVP_OPTIONAL_EVENTS)[number]["key"];

export function getAllowedOptionalEvents(guestType: string) {
  return RSVP_OPTIONAL_EVENTS.filter((event) =>
    (event.eligibleGuestTypes as readonly string[]).includes(guestType),
  ).map(({ key, label, description }) => ({ key, label, description }));
}
