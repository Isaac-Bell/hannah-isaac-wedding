export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimiter {
  check(key: string): Promise<RateLimitDecision>;
}
