// The project's FIRST network-egress control (CLAUDE.md §5). Every outbound fetch the conveyor
// makes passes through assertFetchAllowed: scheme allowlist + host allowlist + SSRF/DNS-rebind
// block. This is the runtime enforcement the schema-only allowed_hosts field always promised
// (docs/backlog/allowed-hosts-runtime-gate.md). DNS is injected so units run with zero network.
export class BlockedHostError extends Error {
  constructor(public readonly target: string, reason: string) {
    super(`blocked outbound fetch: ${target} — ${reason}`);
    this.name = 'BlockedHostError';
  }
}

export interface NetGuardDeps {
  /** Exact-match host allowlist from config/permissions.json#allowed_hosts. Empty ⇒ deny all. */
  allowedHosts: string[];
  /** DNS seam: the IPs a host resolves to (injected; real impl uses node:dns/promises lookup). */
  resolve: (host: string) => Promise<string[]>;
}

/** Private / loopback / link-local / unspecified ranges, v4 + v6 (incl. v4-mapped v6). */
export function isPrivateIp(ip: string): boolean {
  const addr = ip.toLowerCase().replace(/^::ffff:/, '');
  if (addr.includes('.')) {
    const o = addr.split('.').map((n) => Number(n));
    if (o.length !== 4 || o.some((n) => Number.isNaN(n))) return true; // unparsable ⇒ treat as unsafe
    const [a, b] = o as [number, number, number, number];
    return a === 127 || a === 10 || a === 0 || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31);
  }
  // IPv6: ::1 loopback, :: unspecified, fc00::/7 ULA (fc/fd), fe80::/10 link-local (fe8–feb).
  return addr === '::1' || addr === '::' || /^f[cd]/.test(addr) || /^fe[89ab]/.test(addr);
}

/** Throws BlockedHostError unless: scheme is http(s), host ∈ allowlist, and every resolved IP is public. */
export async function assertFetchAllowed(rawUrl: string, deps: NetGuardDeps): Promise<URL> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new BlockedHostError(rawUrl, 'malformed URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new BlockedHostError(rawUrl, `scheme ${u.protocol} not allowed`);
  }
  const host = u.hostname.toLowerCase();
  const allow = deps.allowedHosts.map((h) => h.toLowerCase());
  if (!allow.includes(host)) {
    throw new BlockedHostError(rawUrl, `host ${host} not in allowed_hosts`);
  }
  const ips = await deps.resolve(host);
  if (ips.length === 0) {
    throw new BlockedHostError(rawUrl, `host ${host} did not resolve`);
  }
  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new BlockedHostError(rawUrl, `host ${host} resolves to private/internal IP ${ip}`);
    }
  }
  return u;
}
