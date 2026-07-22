import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(guest)/actions", () => ({
  forgetDeviceAction: vi.fn(),
}));

import { GuestNavigation } from "./GuestNavigation";

describe("GuestNavigation", () => {
  it("keeps RSVP navigation and the forget-device action available", () => {
    render(<GuestNavigation partyName="Rivera Household" />);
    expect(screen.getAllByRole("link", { name: "RSVP" })).not.toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Forget this device" }),
    ).toBeInTheDocument();
  });
});
