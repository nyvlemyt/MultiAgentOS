// Phase 3.5 multi-source router (ADR 0002). Resolves LLMRequest.domain to the
// first ENABLED source with a FRESH quota window, walking the config fallback
// chain. Failover taxonomy (ADR 0002 Q2): 429/quota = window exhausted ⇒ mark
// blocked + fail over; 529/overloaded = transient capacity ⇒ bounded retry on
// the SAME source, never failover.

import type { LLMClient, LLMRequest, LLMResponse } from './llm.js';
import { buildSourceStatuses, CLAUDE_POOL } from './providers/config.js';
import type { RoutingConfig, SourceStatus } from './providers/types.js';

export interface RouterEvent {
  type: 'provider_fallback';
  from: string;
  to: string;
  reason: 'quota';
}

export type WindowState = 'fresh' | 'blocked';

export interface RouterLLMClientOptions {
  config: RoutingConfig;
  /** Provider keys (from .env.local) — drives enabled/disabled statuses. */
  env: Record<string, string>;
  /** Source id → client. Must include CLAUDE_POOL ('claude'). */
  clients: Map<string, LLMClient>;
  onEvent?: (evt: RouterEvent) => void;
  /** Injectable for tests; defaults to real setTimeout backoff. */
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  /** How long a quota-blocked window stays blocked. Default 5 h (subscription window). */
  blockedTtlMs?: number;
  /** Retries on 529 before propagating. */
  maxOverloadedRetries?: number;
  /**
   * Hydrate the block map at construction (source id → blockedAt ms). Lets a
   * db-aware caller restore persisted windows without coupling core to @mas/db.
   */
  readonly initialBlocked?: Readonly<Record<string, number>>;
  /** Fired when a source is quota-blocked; the caller persists it (5b). */
  readonly onBlock?: (sourceId: string, blockedAt: number) => void;
}

function classify(err: unknown): 'quota' | 'overloaded' | 'other' {
  const e = err as { status?: number; code?: string };
  if (e?.status === 429 || e?.code === 'QUOTA_EXHAUSTED') return 'quota';
  if (e?.status === 529 || e?.code === 'OVERLOADED') return 'overloaded';
  return 'other';
}

export class RouterLLMClient implements LLMClient {
  private readonly statuses: Map<string, SourceStatus>;
  private readonly blockedAt = new Map<string, number>();
  private readonly opts: RouterLLMClientOptions;

  constructor(opts: RouterLLMClientOptions) {
    this.opts = opts;
    this.statuses = buildSourceStatuses(opts.config, opts.env);
    // Declared accounts are pool members: each is an enabled source (ADR 0002 §2).
    for (const acc of opts.config.claude_accounts) {
      this.statuses.set(acc.id, { id: acc.id, enabled: true });
    }
    for (const [id, at] of Object.entries(opts.initialBlocked ?? {})) {
      this.blockedAt.set(id, at);
    }
  }

  /** CLAUDE_POOL resolves to the declared accounts in order, or itself when none. */
  private expandPool(id: string): string[] {
    if (id !== CLAUDE_POOL) return [id];
    const accounts = this.opts.config.claude_accounts;
    return accounts.length > 0 ? accounts.map((a) => a.id) : [CLAUDE_POOL];
  }

  getWindowState(sourceId: string): WindowState {
    const at = this.blockedAt.get(sourceId);
    if (at === undefined) return 'fresh';
    const ttl = this.opts.blockedTtlMs ?? 5 * 60 * 60 * 1000;
    const now = (this.opts.now ?? Date.now)();
    if (now - at >= ttl) {
      this.blockedAt.delete(sourceId);
      return 'fresh';
    }
    return 'blocked';
  }

  /** Ordered candidate chain for a domain, before window filtering. */
  private chainFor(domain: string | undefined): string[] {
    // §11.bis rule 4: execution is Claude-only, whatever the config says.
    if (domain === 'code-execution') return [CLAUDE_POOL];
    const route = domain ? this.opts.config.domains[domain] : undefined;
    if (!route) return [CLAUDE_POOL];
    const chain = [route.primary, ...route.fallback];
    return chain.includes(CLAUDE_POOL) ? chain : [...chain, CLAUDE_POOL];
  }

  private candidatesFor(domain: string | undefined): string[] {
    return this.chainFor(domain).flatMap((id) => this.expandPool(id)).filter(
      (id) =>
        this.statuses.get(id)?.enabled &&
        this.opts.clients.has(id) &&
        this.getWindowState(id) === 'fresh',
    );
  }

  async call(req: LLMRequest): Promise<LLMResponse> {
    const candidates = this.candidatesFor(req.domain);
    let lastError: unknown = new Error(
      `[router] no enabled source for domain '${req.domain ?? '(none)'}'`,
    );

    for (let i = 0; i < candidates.length; i++) {
      const id = candidates[i]!;
      const client = this.opts.clients.get(id)!;
      try {
        const resp = await this.callWithOverloadRetry(client, req);
        return { ...resp, provider: resp.provider ?? id };
      } catch (err) {
        lastError = err;
        const kind = classify(err);
        if (kind === 'quota') {
          const blockedAt = (this.opts.now ?? Date.now)();
          this.blockedAt.set(id, blockedAt);
          this.opts.onBlock?.(id, blockedAt);
          const next = candidates[i + 1];
          if (next) {
            this.opts.onEvent?.({ type: 'provider_fallback', from: id, to: next, reason: 'quota' });
            continue;
          }
        }
        throw err;
      }
    }
    throw lastError;
  }

  private async callWithOverloadRetry(client: LLMClient, req: LLMRequest): Promise<LLMResponse> {
    const max = this.opts.maxOverloadedRetries ?? 2;
    const sleep = this.opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
    for (let attempt = 0; ; attempt++) {
      try {
        return await client.call(req);
      } catch (err) {
        if (classify(err) !== 'overloaded' || attempt >= max) throw err;
        await sleep(2 ** attempt * 1000);
      }
    }
  }
}
