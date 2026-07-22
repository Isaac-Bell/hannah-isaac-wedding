import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RsvpSubmissionStatus } from "./RsvpSubmissionStatus";

describe("RsvpSubmissionStatus", () => {
  it("renders a saved timestamp in an accessible status", () => {
    render(<RsvpSubmissionStatus updatedAt="2026-07-22T18:30:00.000Z" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Previously submitted. Last saved",
    );
    expect(screen.getByRole("status")).toHaveTextContent("CT");
  });

  it("renders the never-submitted state", () => {
    render(<RsvpSubmissionStatus updatedAt={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("not submitted");
  });
});
