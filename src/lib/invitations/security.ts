import "server-only";

export interface InvitationCodeHasher {
  hash(code: string): Promise<string>;
  verify(code: string, hash: string): Promise<boolean>;
}

export type InvitationAttempt = { identifier: string; attemptedAt: Date };
