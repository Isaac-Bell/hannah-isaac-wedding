export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const REQUESTER_ATTEMPT_LIMIT = 10;
export const CODE_ATTEMPT_LIMIT = 5;

export function evaluateInvitationRateLimit(counts: {
  requester: number;
  code: number;
}) {
  const allowed =
    counts.requester < REQUESTER_ATTEMPT_LIMIT &&
    counts.code < CODE_ATTEMPT_LIMIT;
  return {
    allowed,
    retryAfterSeconds: allowed ? undefined : RATE_LIMIT_WINDOW_MS / 1000,
  };
}
