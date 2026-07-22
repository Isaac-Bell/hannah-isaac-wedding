// @vitest-environment node

import { describe, expect, it } from "vitest";
import { rsvpSubmissionFromFormData } from "./form-data";
import { rsvpSubmissionSchema } from "./validation";

const guestId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("RSVP form data", () => {
  it("normalizes an absent non-attending guest detail section", () => {
    const formData = new FormData();
    formData.set("guestId", guestId);
    formData.set(`attendance:${guestId}`, "no");
    formData.set("contactEmail", "guest@example.com");
    formData.set("contactPhone", "");
    formData.set("songRequest", "");
    formData.set("message", "");
    const parsed = rsvpSubmissionSchema.parse(
      rsvpSubmissionFromFormData(formData),
    );
    expect(parsed.guests[0]).toMatchObject({
      attending: false,
      dietaryRequirements: null,
      accessibilityRequirements: null,
      eventChoices: {},
    });
  });

  it("preserves injected guest and event keys for server rejection", () => {
    const injectedId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const formData = new FormData();
    formData.set("guestId", guestId);
    formData.set(`attendance:${guestId}`, "yes");
    formData.set(`attendance:${injectedId}`, "yes");
    formData.set(`event:${injectedId}:unknown-event`, "true");
    formData.set("contactEmail", "guest@example.com");
    formData.set("contactPhone", "");
    formData.set("songRequest", "");
    formData.set("message", "");
    const raw = rsvpSubmissionFromFormData(formData);
    expect(raw.guests).toHaveLength(2);
    expect(rsvpSubmissionSchema.safeParse(raw).success).toBe(false);
  });
});
