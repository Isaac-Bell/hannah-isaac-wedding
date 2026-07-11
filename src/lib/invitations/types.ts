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
  revokedAt: Date | null;
  invitation: InvitationRecord;
};

export interface InvitationStore {
  countAttempts(
    requesterHash: string,
    codeFingerprint: string,
    since: Date,
  ): Promise<{ requester: number; code: number }>;
  recordAttempt(input: {
    requesterHash: string;
    codeFingerprint: string;
    succeeded: boolean;
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
