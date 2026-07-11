import { describe, expect, it } from "vitest";
import { isInvitationCodeValid, normalizeInvitationCode } from "./code";

describe("invitation codes", () => {
  it("normalizes case, punctuation, and hyphenation", () => {
    expect(normalizeInvitationCode("h6km 9q2p")).toBe("H6KM-9Q2P");
  });
  it("rejects an empty code", () => {
    expect(isInvitationCodeValid("")).toBe(false);
  });
});
