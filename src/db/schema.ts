import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    partyName: text("party_name").notNull(),
    codeHash: text("code_hash").notNull(),
    maximumGuests: integer("maximum_guests").notNull(),
    email: text("email"),
    phone: text("phone"),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("invitations_code_hash_idx").on(table.codeHash)],
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .references(() => invitations.id, { onDelete: "cascade" })
      .notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    guestType: text("guest_type").notNull(),
    isOptional: boolean("is_optional").default(false).notNull(),
    ...timestamps,
  },
  (table) => [index("guests_invitation_id_idx").on(table.invitationId)],
);

export const partyResponses = pgTable(
  "party_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .references(() => invitations.id, { onDelete: "cascade" })
      .notNull(),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    message: text("message"),
    songRequest: text("song_request"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("party_responses_invitation_id_idx").on(table.invitationId),
  ],
);

export const guestResponses = pgTable(
  "guest_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    guestId: uuid("guest_id")
      .references(() => guests.id, { onDelete: "cascade" })
      .notNull(),
    attending: boolean("attending"),
    dietaryRequirements: text("dietary_requirements"),
    accessibilityRequirements: text("accessibility_requirements"),
    eventChoices: jsonb("event_choices")
      .$type<Record<string, boolean>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("guest_responses_guest_id_idx").on(table.guestId)],
);

export const giftPayments = pgTable(
  "gift_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id").references(() => invitations.id, {
      onDelete: "set null",
    }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    guestName: text("guest_name"),
    message: text("message"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("gift_payments_provider_id_idx").on(
      table.provider,
      table.providerPaymentId,
    ),
  ],
);

export const invitationSessions = pgTable(
  "invitation_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .references(() => invitations.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("invitation_sessions_token_hash_idx").on(table.tokenHash),
    index("invitation_sessions_invitation_id_idx").on(table.invitationId),
    index("invitation_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const invitationAttempts = pgTable(
  "invitation_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterHash: text("requester_hash").notNull(),
    codeFingerprint: text("code_fingerprint").notNull(),
    succeeded: boolean("succeeded").default(false).notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("invitation_attempts_requester_time_idx").on(
      table.requesterHash,
      table.attemptedAt,
    ),
    index("invitation_attempts_code_time_idx").on(
      table.codeFingerprint,
      table.attemptedAt,
    ),
  ],
);

export const invitationRelations = relations(invitations, ({ many, one }) => ({
  guests: many(guests),
  response: one(partyResponses),
  giftPayments: many(giftPayments),
  sessions: many(invitationSessions),
}));
export const guestRelations = relations(guests, ({ one }) => ({
  invitation: one(invitations, {
    fields: [guests.invitationId],
    references: [invitations.id],
  }),
  response: one(guestResponses),
}));
