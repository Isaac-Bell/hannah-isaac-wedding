// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getCountdown } from "./countdown";

describe("countdown", () => {
  it("splits remaining time into units", () => {
    expect(
      getCountdown(
        new Date("2026-01-03T02:03:04Z"),
        new Date("2026-01-01T00:00:00Z"),
      ),
    ).toEqual({ days: 2, hours: 2, minutes: 3, seconds: 4, complete: false });
  });
  it("does not return negative time", () => {
    expect(
      getCountdown(new Date("2025-01-01"), new Date("2026-01-01")).complete,
    ).toBe(true);
  });
});
