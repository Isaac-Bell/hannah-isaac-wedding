import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
});

const coreServerEnvironmentSchema = databaseEnvironmentSchema.extend({
  INVITATION_CODE_PEPPER: z.string().min(32),
  TRUST_PROXY_HEADERS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const travelEnvironmentSchema = z.object({
  TRAVEL_AIRPORT_INFO_URL: z
    .url()
    .refine(
      (value) => new URL(value).protocol === "https:",
      "Airport URL must use HTTPS",
    )
    .optional(),
});

export const paypalMeUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  return (
    url.protocol === "https:" &&
    (hostname === "paypal.me" || hostname === "www.paypal.me")
  );
}, "GIFT_PAYPAL_ME_URL must be an HTTPS PayPal.Me URL");

const giftEnvironmentSchema = z.object({
  GIFT_ZELLE_RECIPIENT_NAME: z.string().trim().min(1).optional(),
  GIFT_ZELLE_EMAIL: z.email().optional(),
  GIFT_ZELLE_PHONE: z.string().trim().min(7).optional(),
  GIFT_PAYPAL_ME_URL: paypalMeUrlSchema.optional(),
});

export function getPublicEnvironment() {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function getDatabaseUrl(): string {
  return databaseEnvironmentSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
  }).DATABASE_URL;
}

export function getCoreServerEnvironment() {
  return coreServerEnvironmentSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    INVITATION_CODE_PEPPER: process.env.INVITATION_CODE_PEPPER,
    TRUST_PROXY_HEADERS: process.env.TRUST_PROXY_HEADERS,
  });
}

export function getTravelEnvironment() {
  return parseTravelEnvironment(process.env);
}

export function parseTravelEnvironment(
  values: Record<string, string | undefined>,
) {
  return travelEnvironmentSchema.parse({
    TRAVEL_AIRPORT_INFO_URL:
      values.TRAVEL_AIRPORT_INFO_URL?.trim() || undefined,
  });
}

export function getGiftEnvironment() {
  return parseGiftEnvironment(process.env);
}

export function parseGiftEnvironment(
  values: Record<string, string | undefined>,
) {
  return giftEnvironmentSchema.parse({
    GIFT_ZELLE_RECIPIENT_NAME:
      values.GIFT_ZELLE_RECIPIENT_NAME?.trim() || undefined,
    GIFT_ZELLE_EMAIL: values.GIFT_ZELLE_EMAIL?.trim() || undefined,
    GIFT_ZELLE_PHONE: values.GIFT_ZELLE_PHONE?.trim() || undefined,
    GIFT_PAYPAL_ME_URL: values.GIFT_PAYPAL_ME_URL?.trim() || undefined,
  });
}
