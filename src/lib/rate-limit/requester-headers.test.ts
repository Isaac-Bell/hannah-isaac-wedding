// @vitest-environment node

import { describe, expect, it } from "vitest";
import { resolveRequesterIdentifier } from "./requester-headers";

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null };
}

describe("requester header resolution", () => {
  it("uses the Cloudflare header before other trusted proxy headers", () => {
    expect(
      resolveRequesterIdentifier(
        headers({
          "cf-connecting-ip": "203.0.113.1",
          "x-real-ip": "203.0.113.2",
          "x-forwarded-for": "203.0.113.3, 10.0.0.1",
        }),
        { trustProxyHeaders: true },
      ),
    ).toBe("proxy:203.0.113.1");
  });

  it("falls through to x-real-ip and then the first forwarded value", () => {
    expect(
      resolveRequesterIdentifier(headers({ "x-real-ip": "203.0.113.2" }), {
        trustProxyHeaders: true,
      }),
    ).toBe("proxy:203.0.113.2");
    expect(
      resolveRequesterIdentifier(
        headers({ "x-forwarded-for": "203.0.113.3, 10.0.0.1" }),
        { trustProxyHeaders: true },
      ),
    ).toBe("proxy:203.0.113.3");
  });

  it("ignores spoofable proxy headers unless proxy trust is enabled", () => {
    expect(
      resolveRequesterIdentifier(
        headers({
          "cf-connecting-ip": "203.0.113.1",
          "user-agent": "Example Browser",
          "accept-language": "en-NZ",
        }),
        { trustProxyHeaders: false },
      ),
    ).toBe("direct:Example Browser|en-NZ");
  });
});
