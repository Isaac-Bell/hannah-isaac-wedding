import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockGuests, RSVPPreview } from "./RSVPPreview";

describe("RSVPPreview", () => {
  it("renders attendance controls from static mock guests", () => {
    render(<RSVPPreview />);
    for (const guest of mockGuests)
      expect(
        screen.getByRole("group", { name: guest.name }),
      ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Attending")).toHaveLength(
      mockGuests.length,
    );
  });
});
