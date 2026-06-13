import { readFileSync } from 'node:fs';
import type { ProviderDef, SourceStatus } from './types.js';

/** Parse a .env.local file. Missing/unreadable file ⇒ {} (§11.bis rule 3: never crash). */
export function loadEnvLocal(filePath: string): Record<string, string> {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return {};
  }
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/**
 * Decide whether a provider source is usable. Missing key ⇒ disabled + startup
 * warning; paid providers stay off unless paid_apis_enabled (CLAUDE.md §11.bis).
 */
export function resolveProviderStatus(
  def: ProviderDef,
  env: Record<string, string>,
  paidApisEnabled: boolean,
): SourceStatus {
  if (def.kind === 'claude-account') return { id: def.id, enabled: true };
  if (def.paid && !paidApisEnabled) {
    return { id: def.id, enabled: false, reason: 'paid_apis_disabled' };
  }
  if (def.apiKeyEnv && !env[def.apiKeyEnv]) {
    console.warn(
      `[providers] ${def.id}: ${def.apiKeyEnv} not set in .env.local — provider disabled.`,
    );
    return { id: def.id, enabled: false, reason: 'missing_key' };
  }
  return { id: def.id, enabled: true };
}
