export type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
};

export function getCountdown(target: Date, now = new Date()): CountdownValue {
  const remaining = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    complete: remaining === 0,
  };
}
