import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RsvpActionState } from "@/lib/rsvp/action-state";
import { RsvpForm, type RsvpFormHousehold } from "./RsvpForm";

const household: RsvpFormHousehold = {
  partyName: "Rivera Household",
  contactEmail: "alex@example.com",
  contactPhone: "",
  songRequest: "September",
  message: "See you soon",
  guests: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      fullName: "Alex Rivera",
      allowedEvents: [
        {
          key: "welcome-gathering",
          label: "Welcome gathering",
          description: "Details to be confirmed.",
        },
      ],
      response: {
        attending: true,
        dietaryRequirements: "Vegetarian",
        accessibilityRequirements: "",
        eventChoices: { "welcome-gathering": true },
      },
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      fullName: "Sam Rivera",
      allowedEvents: [],
      response: {
        attending: false,
        dietaryRequirements: "",
        accessibilityRequirements: "",
        eventChoices: {},
      },
    },
  ],
};

describe("RsvpForm", () => {
  it("renders both real household guests and prefills saved responses", () => {
    render(
      <RsvpForm
        action={vi.fn(async (state: RsvpActionState) => state)}
        household={household}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Alex Rivera" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Sam Rivera" }),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Attending")[0]).toBeChecked();
    expect(screen.getAllByLabelText("Regretfully no")[1]).toBeChecked();
    expect(screen.getByDisplayValue("alex@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Vegetarian")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Welcome gathering/ }),
    ).toBeChecked();
  });

  it("preserves details when moving backward and forward", () => {
    render(
      <RsvpForm
        action={vi.fn(async (state: RsvpActionState) => state)}
        household={household}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to details" }),
    );
    const email = screen.getByLabelText("Contact email");
    fireEvent.change(email, { target: { value: "updated@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to details" }),
    );
    expect(screen.getByDisplayValue("updated@example.com")).toBeInTheDocument();
  });

  it("announces successful saves and renders the saved timestamp", async () => {
    const action = vi.fn(async (): Promise<RsvpActionState> => ({
      status: "success",
      message: "Your RSVP has been saved.",
      fieldErrors: {},
      savedAt: "2026-07-22T18:30:00.000Z",
      attempt: 1,
    }));
    render(<RsvpForm action={action} household={household} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to details" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save RSVP" }));
    await waitFor(() => expect(action).toHaveBeenCalled());
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your RSVP has been saved. Last updated",
    );
  });
});
