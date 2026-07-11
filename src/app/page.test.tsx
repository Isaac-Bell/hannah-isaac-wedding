import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";
import { siteConfig } from "@/lib/config/site";

describe("homepage", () => {
  it("renders the couple and provisional configured date", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: siteConfig.coupleNames }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.weddingDateDisplay)).toBeInTheDocument();
    expect(
      screen.getByText(
        `${siteConfig.weddingLocationCity}, ${siteConfig.weddingLocationRegion}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(siteConfig.dateStatus).length).toBeGreaterThan(
      0,
    );
  });
});
