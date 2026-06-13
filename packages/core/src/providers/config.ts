import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { resolveProviderStatus } from './credentials.js';
import type { RoutingConfig, SourceStatus } from './types.js';

/** Phase 3 skill-domain taxonomy — the routing key space (ROADMAP addendum). */
export const DOMAINS = [
  'research',
  'code-execution',
  'code-review',
  'planning',
  'memory',
  'security',
  'ux',
  'writing',
  'search',
] as const;

/** The pooled-Claude-accounts source id used in domain tables. */
export const CLAUDE_POOL = 'claude';

const routingSchema = z.object({
  claude_accounts: z
    .array(z.object({ id: z.string(), configDir: z.string(), plan: z.string().optional() }))
    .default([]),
  paid_apis_enabled: z.boolean().default(false),
  providers: z
    .record(
      z.object({
        id: z.string(),
        kind: z.enum(['claude-account', 'gemini', 'openai', 'perplexity']),
        apiKeyEnv: z.string().optional(),
        model: z.string().optional(),
        baseUrl: z.string().optional(),
        paid: z.boolean().optional(),
      }),
    )
    .default({}),
  domains: z
    .record(z.object({ primary: z.string(), fallback: z.array(z.string()).default([]) }))
    .default({}),
});

const SAFE_DEFAULTS: RoutingConfig = {
  claude_accounts: [],
  paid_apis_enabled: false,
  providers: {},
  domains: {},
};

/** Load config/model-routing.json. Missing or invalid file ⇒ safe defaults (Claude-only). */
export function loadRoutingConfig(filePath: string): RoutingConfig {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return SAFE_DEFAULTS;
  }
  const parsed = routingSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.warn(`[providers] invalid model-routing.json — falling back to Claude-only:`, parsed.error.message);
    return SAFE_DEFAULTS;
  }
  return parsed.data;
}

/**
 * Enabled/disabled per source. The Claude pool is always enabled (subscription
 * login, no API key); other providers go through the credentials rules.
 */
export function buildSourceStatuses(
  cfg: RoutingConfig,
  env: Record<string, string>,
): Map<string, SourceStatus> {
  const statuses = new Map<string, SourceStatus>();
  statuses.set(CLAUDE_POOL, { id: CLAUDE_POOL, enabled: true });
  for (const def of Object.values(cfg.providers)) {
    statuses.set(def.id, resolveProviderStatus(def, env, cfg.paid_apis_enabled));
  }
  return statuses;
}
