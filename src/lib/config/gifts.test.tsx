import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GiftOptions } from "@/components/gifts/GiftOptions";
import { parseGiftEnvironment } from "./env";

describe("gift configuration", () => {
  it("builds without providers and hides them", () => {
    const configuration = parseGiftEnvironment({});
    const html = renderToStaticMarkup(
      <GiftOptions configuration={configuration} />,
    );
    expect(html).toContain("Details coming soon");
    expect(html).not.toContain("Zelle");
    expect(html).not.toContain("PayPal.Me");
  });
  it("rejects non-PayPal.Me and insecure URLs", () => {
    expect(() =>
      parseGiftEnvironment({
        GIFT_PAYPAL_ME_URL: "https://example.com/person",
      }),
    ).toThrow();
    expect(() =>
      parseGiftEnvironment({
        GIFT_PAYPAL_ME_URL: "http://paypal.me/person",
      }),
    ).toThrow();
  });
  it("renders a configured Zelle copy value only in the protected component", () => {
    const configuration = parseGiftEnvironment({
      GIFT_ZELLE_RECIPIENT_NAME: "Example Recipient",
      GIFT_ZELLE_EMAIL: "gift@example.invalid",
    });
    const html = renderToStaticMarkup(
      <GiftOptions configuration={configuration} />,
    );
    expect(html).toContain("gift@example.invalid");
    expect(html).toContain("Copy");
  });
});
