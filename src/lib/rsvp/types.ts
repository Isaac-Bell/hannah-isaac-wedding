import type { RsvpSubmission } from "./validation";

export type RsvpOptionalEvent = {
  key: string;
  label: string;
  description: string;
};

export type RsvpGuest = {
  id: string;
  fullName: string;
  guestType: string;
  isOptional: boolean;
  allowedEvents: RsvpOptionalEvent[];
  response: {
    attending: boolean | null;
    dietaryRequirements: string | null;
    accessibilityRequirements: string | null;
    eventChoices: Record<string, boolean>;
    updatedAt: Date;
  } | null;
};

export type RsvpHousehold = {
  invitationId: string;
  partyName: string;
  guests: RsvpGuest[];
  response: {
    contactEmail: string | null;
    contactPhone: string | null;
    message: string | null;
    songRequest: string | null;
    submittedAt: Date;
    updatedAt: Date;
  } | null;
};

export type AuthenticatedRsvpIdentity = {
  sessionId: string;
  invitationId: string;
};

export type PartyResponseWrite = Pick<
  RsvpSubmission,
  "contactEmail" | "contactPhone" | "message" | "songRequest"
> & {
  invitationId: string;
  submittedAt: Date;
  updatedAt: Date;
};

export type GuestResponseWrite = RsvpSubmission["guests"][number] & {
  updatedAt: Date;
};

export interface RsvpTransaction {
  lockAndRevalidateSession(
    identity: AuthenticatedRsvpIdentity,
    now: Date,
  ): Promise<boolean>;
  loadHousehold(invitationId: string): Promise<RsvpHousehold | null>;
  upsertPartyResponse(input: PartyResponseWrite): Promise<void>;
  upsertGuestResponse(input: GuestResponseWrite): Promise<void>;
}

export interface RsvpRepository {
  loadHousehold(invitationId: string): Promise<RsvpHousehold | null>;
  transaction<T>(
    work: (transaction: RsvpTransaction) => Promise<T>,
  ): Promise<T>;
}
