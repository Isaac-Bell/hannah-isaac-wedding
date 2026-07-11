export const INVITATION_CODE_ERROR =
  "We couldn’t use that invitation code. Check the code and try again.";

export function normalizeInvitationCode(value: string): string {
  const compact = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return compact.length > 4
    ? `${compact.slice(0, 4)}-${compact.slice(4)}`
    : compact;
}

export function isInvitationCodeValid(value: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizeInvitationCode(value));
}
