type HeaderReader = { get(name: string): string | null };

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 128) : null;
}

export function resolveRequesterIdentifier(
  headers: HeaderReader,
  options: { trustProxyHeaders: boolean },
) {
  if (options.trustProxyHeaders) {
    const forwarded = [
      headers.get("cf-connecting-ip"),
      headers.get("x-real-ip"),
      headers.get("x-forwarded-for")?.split(",")[0],
    ];
    for (const candidate of forwarded) {
      const value = clean(candidate);
      if (value) return `proxy:${value}`;
    }
  }
  const userAgent = clean(headers.get("user-agent")) ?? "unknown-agent";
  const language = clean(headers.get("accept-language")) ?? "unknown-language";
  return `direct:${userAgent}|${language}`;
}
