// Wires config + credentials + provider clients into a RouterLLMClient.
// Returns undefined when no non-default source is enabled — the dispatcher then
// keeps the plain claudeCodeLLM path (Phase 3.5 step 4, ADR 0002).

import type { LLMClient } from '../llm.js';
import { RouterLLMClient, type RouterEvent } from '../llm.router.js';
import { claudeCodeLLM, type ClaudeCodeLLMOptions } from '../llm.real.js';
import { claudeAccountLLM } from './claude-account.js';
import { loadRoutingConfig, buildSourceStatuses, CLAUDE_POOL } from './config.js';
import { loadEnvLocal } from './credentials.js';
import { geminiLLM } from './gemini.js';
import { openaiLLM } from './openai.js';
import { perplexityLLM } from './perplexity.js';
import type { FetchLike } from './http.js';

export interface CreateRouterLLMOptions {
  configPath: string;
  envPath: string;
  claudeOpts?: ClaudeCodeLLMOptions;
  onEvent?: (evt: RouterEvent) => void;
  /** Injectables for tests — zero network, zero quota. */
  claudeFactory?: (opts: ClaudeCodeLLMOptions) => LLMClient;
  fetchImpl?: FetchLike;
  /** Persisted quota windows to restore (source id → blockedAt ms). */
  initialBlocked?: Readonly<Record<string, number>>;
  /** Persist hook fired when a source is quota-blocked (5b). */
  onBlock?: (sourceId: string, blockedAt: number) => void;
}

export function createRouterLLM(opts: CreateRouterLLMOptions): LLMClient | undefined {
  const config = loadRoutingConfig(opts.configPath);
  const env = loadEnvLocal(opts.envPath);
  const statuses = buildSourceStatuses(config, env);
  const claudeFactory = opts.claudeFactory ?? claudeCodeLLM;

  const enabledProviders = [...statuses.values()].filter(
    (s) => s.enabled && s.id !== CLAUDE_POOL,
  );
  const nonDefaultSources = enabledProviders.length + config.claude_accounts.length;
  if (nonDefaultSources === 0) return undefined;

  const clients = new Map<string, LLMClient>();
  const claudeBase = claudeFactory(opts.claudeOpts ?? {});
  clients.set(CLAUDE_POOL, {
    async call(req) {
      const resp = await claudeBase.call(req);
      return { ...resp, provider: resp.provider ?? CLAUDE_POOL };
    },
  });
  for (const acc of config.claude_accounts) {
    clients.set(acc.id, claudeAccountLLM(acc, opts.claudeOpts ?? {}, claudeFactory));
  }
  for (const def of Object.values(config.providers)) {
    if (!statuses.get(def.id)?.enabled) continue;
    const key = def.apiKeyEnv ? env[def.apiKeyEnv]! : '';
    if (def.kind === 'gemini') clients.set(def.id, geminiLLM(def, key, opts.fetchImpl));
    else if (def.kind === 'openai') clients.set(def.id, openaiLLM(def, key, opts.fetchImpl));
    else if (def.kind === 'perplexity') clients.set(def.id, perplexityLLM(def, key, opts.fetchImpl));
  }

  return new RouterLLMClient({
    config,
    env,
    clients,
    onEvent: opts.onEvent,
    initialBlocked: opts.initialBlocked,
    onBlock: opts.onBlock,
  });
}
