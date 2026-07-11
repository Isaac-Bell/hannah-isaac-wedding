import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvitationCodeInput } from "./InvitationCodeInput";
import { INVITATION_CODE_ERROR } from "@/lib/invitations/code";

describe("InvitationCodeInput", () => {
  it("presents accessible generic feedback for an empty code", () => {
    render(<InvitationCodeInput />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent(INVITATION_CODE_ERROR);
    expect(screen.getByLabelText("Invitation code")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Invitation code")).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("invitation-error"),
    );
  });

  it("presents a safe demonstration response for a valid format", () => {
    render(<InvitationCodeInput />);
    fireEvent.change(screen.getByLabelText("Invitation code"), {
      target: { value: "h6km9q2p" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "This code format is valid. Secure invitation lookup will be connected in the next sprint.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
