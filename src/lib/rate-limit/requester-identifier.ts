import "server-only";

import { resolveRequesterIdentifier } from "./requester-headers";

export function getServerRequesterIdentifier(
  headers: { get(name: string): string | null },
  trustProxyHeaders: boolean,
) {
  return resolveRequesterIdentifier(headers, { trustProxyHeaders });
}
