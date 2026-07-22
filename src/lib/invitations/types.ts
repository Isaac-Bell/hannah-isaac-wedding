export type InvitationRecord = {
  id: string;
  partyName: string;
  codeHash: string;
  isActive: boolean;
  expiresAt: Date | null;
};

export type SessionRecord = {
  id: string;
  invitationId: string;
  tokenHash: string;
  expiresAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
  invitation: InvitationRecord;
};

export interface InvitationStore {
  recordFailedAttemptIfAllowed(input: {
    requesterHash: string;
    codeFingerprint: string;
    attemptedAt: Date;
    since: Date;
  }): Promise<{ allowed: boolean; retryAfterSeconds?: number }>;
  recordSuccessfulAttempt(input: {
    requesterHash: string;
    codeFingerprint: string;
    attemptedAt: Date;
  }): Promise<void>;
  findInvitationByHash(codeHash: string): Promise<InvitationRecord | null>;
  createSession(input: {
    invitationId: string;
    tokenHash: string;
    expiresAt: Date;
    now: Date;
  }): Promise<SessionRecord>;
  findSessionByHash(tokenHash: string): Promise<SessionRecord | null>;
  touchSession(id: string, now: Date): Promise<void>;
  revokeSession(id: string, now: Date): Promise<void>;
}
