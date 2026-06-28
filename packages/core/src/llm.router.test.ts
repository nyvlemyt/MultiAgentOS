import { describe, it, expect, vi } from 'vitest';
import type { LLMClient, LLMRequest, LLMResponse } from './llm.js';
import { RouterLLMClient, type RouterEvent } from './llm.router.js';
import { loadRoutingConfig } from './providers/config.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');
const cfg = loadRoutingConfig(resolve(repoRoot, 'config/model-routing.json'));

function reqFor(domain?: string): LLMRequest {
  return { system: 's', user: 'u', model: 'm', mode: 'eco', domain };
}

function okClient(id: string): LLMClient & { call: ReturnType<typeof vi.fn> } {
  return {
    call: vi.fn(
      async (): Promise<LLMResponse> => ({
        text: `from ${id}`,
        inputTokens: 1,
        outputTokens: 1,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        quotaUnits: 0,
        model: 'm',
        provider: id,
      }),
    ),
  };
}

function coded(status: number): Error {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

interface Harness {
  router: RouterLLMClient;
  clients: Record<string, ReturnType<typeof okClient>>;
  events: RouterEvent[];
}

function makeRouter(opts: { paid?: boolean; geminiKey?: boolean } = {}): Harness {
  const clients = {
    claude: okClient('claude'),
    'gemini-free': okClient('gemini-free'),
    openai: okClient('openai'),
    perplexity: okClient('perplexity'),
  };
  const events: RouterEvent[] = [];
  const router = new RouterLLMClient({
    config: { ...cfg, paid_apis_enabled: opts.paid ?? false },
    env: opts.geminiKey === false ? {} : { GEMINI_API_KEY: 'k', OPENAI_API_KEY: 'k', PERPLEXITY_API_KEY: 'k' },
    clients: new Map(Object.entries(clients)),
    onEvent: (e) => events.push(e),
    sleep: async () => {},
  });
  return { router, clients, events };
}

describe('domain resolution (paid OFF — defaults per §11.bis)', () => {
  const expected: Record<string, string> = {
    // paid primaries disabled ⇒ chain walks to first enabled source
    search: 'gemini-free',
    research: 'gemini-free',
    'code-review': 'claude',
    ux: 'claude',
    writing: 'gemini-free',
    // enabled primaries hit directly
    'code-execution': 'claude',
    planning: 'claude',
    // memory is quality-default since Brique 6 (ADR 0008 clause 11): strong subscription primary.
    memory: 'claude',
    security: 'claude',
  };

  for (const [domain, source] of Object.entries(expected)) {
    it(`${domain} → ${source}`, async () => {
      const { router, clients } = makeRouter();
      const resp = await router.call(reqFor(domain));
      expect(resp.provider).toBe(source);
      expect(clients[source].call).toHaveBeenCalledTimes(1);
    });
  }

  it('unmapped domain → default claude', async () => {
    const { router } = makeRouter();
    const resp = await router.call(reqFor('astrology'));
    expect(resp.provider).toBe('claude');
  });

  it('no domain at all → default claude', async () => {
    const { router } = makeRouter();
    const resp = await router.call(reqFor());
    expect(resp.provider).toBe('claude');
  });
});

describe('paid ON', () => {
  it('research → perplexity', async () => {
    const { router } = makeRouter({ paid: true });
    const resp = await router.call(reqFor('research'));
    expect(resp.provider).toBe('perplexity');
  });

  it('code-execution stays hard-pinned to claude (§11.bis rule 4)', async () => {
    const { router, clients } = makeRouter({ paid: true });
    const resp = await router.call(reqFor('code-execution'));
    expect(resp.provider).toBe('claude');
    expect(clients.openai.call).not.toHaveBeenCalled();
    expect(clients.perplexity.call).not.toHaveBeenCalled();
  });
});

describe('failover taxonomy (ADR 0002 Q2)', () => {
  it('429 ⇒ mark source blocked, fail over, emit provider_fallback', async () => {
    const { router, clients, events } = makeRouter();
    clients['gemini-free'].call.mockRejectedValueOnce(coded(429));
    const resp = await router.call(reqFor('search'));
    expect(resp.provider).toBe('claude');
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'provider_fallback',
        from: 'gemini-free',
        to: 'claude',
        reason: 'quota',
      }),
    );
    // window now blocked: next search call skips gemini entirely
    clients['gemini-free'].call.mockClear();
    const resp2 = await router.call(reqFor('search'));
    expect(resp2.provider).toBe('claude');
    expect(clients['gemini-free'].call).not.toHaveBeenCalled();
    expect(router.getWindowState('gemini-free')).toBe('blocked');
  });

  it('QUOTA_EXHAUSTED code (Agent SDK rate_limit) classifies as quota too', async () => {
    const { router, clients, events } = makeRouter();
    clients['gemini-free'].call.mockRejectedValueOnce(
      Object.assign(new Error('window'), { code: 'QUOTA_EXHAUSTED' }),
    );
    // search keeps the gemini-free → claude chain (memory is now claude-primary since Brique 6).
    const resp = await router.call(reqFor('search'));
    expect(resp.provider).toBe('claude');
    expect(events[0]).toMatchObject({ type: 'provider_fallback', reason: 'quota' });
  });

  it('529 ⇒ bounded retry SAME source, never failover', async () => {
    const { router, clients, events } = makeRouter();
    clients['gemini-free'].call.mockRejectedValueOnce(coded(529));
    const resp = await router.call(reqFor('search'));
    expect(resp.provider).toBe('gemini-free');
    expect(clients['gemini-free'].call).toHaveBeenCalledTimes(2);
    expect(clients.claude.call).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    expect(router.getWindowState('gemini-free')).toBe('fresh');
  });

  it('529 retries exhausted ⇒ propagate error, still no failover', async () => {
    const { router, clients } = makeRouter();
    clients['gemini-free'].call.mockRejectedValue(coded(529));
    await expect(router.call(reqFor('search'))).rejects.toMatchObject({ status: 529 });
    expect(clients.claude.call).not.toHaveBeenCalled();
  });

  it('all sources in chain blocked ⇒ throws last quota error', async () => {
    const { router, clients } = makeRouter();
    clients['gemini-free'].call.mockRejectedValue(coded(429));
    clients.claude.call.mockRejectedValue(coded(429));
    await expect(router.call(reqFor('search'))).rejects.toMatchObject({ status: 429 });
  });

  it('claude pool expands to declared accounts: 429 on first ⇒ second account', async () => {
    const clients = {
      pro20: okClient('pro20'),
      max100: okClient('max100'),
    };
    const events: RouterEvent[] = [];
    const router = new RouterLLMClient({
      config: {
        ...cfg,
        claude_accounts: [
          { id: 'pro20', configDir: '/p/pro20' },
          { id: 'max100', configDir: '/p/max100' },
        ],
      },
      env: {},
      clients: new Map(Object.entries(clients)),
      onEvent: (e) => events.push(e),
      sleep: async () => {},
    });
    const first = await router.call(reqFor('code-execution'));
    expect(first.provider).toBe('pro20');
    clients.pro20.call.mockRejectedValueOnce(coded(429));
    const second = await router.call(reqFor('code-execution'));
    expect(second.provider).toBe('max100');
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'provider_fallback', from: 'pro20', to: 'max100' }),
    );
  });

  it('hydrates from initialBlocked: recent ts → blocked, stale ts → fresh', () => {
    const clients = { claude: okClient('claude'), 'gemini-free': okClient('gemini-free') };
    const router = new RouterLLMClient({
      config: cfg,
      env: { GEMINI_API_KEY: 'k' },
      clients: new Map(Object.entries(clients)),
      now: () => 10_000,
      blockedTtlMs: 1000,
      initialBlocked: { 'gemini-free': 9_500, claude: 1_000 },
    });
    expect(router.getWindowState('gemini-free')).toBe('blocked');
    expect(router.getWindowState('claude')).toBe('fresh');
  });

  it('fires onBlock with (id, now) on a quota block', async () => {
    const clients = { claude: okClient('claude'), 'gemini-free': okClient('gemini-free') };
    const onBlock = vi.fn();
    const router = new RouterLLMClient({
      config: cfg,
      env: { GEMINI_API_KEY: 'k' },
      clients: new Map(Object.entries(clients)),
      sleep: async () => {},
      now: () => 42_000,
      onBlock,
    });
    clients['gemini-free'].call.mockRejectedValueOnce(coded(429));
    await router.call(reqFor('search'));
    expect(onBlock).toHaveBeenCalledWith('gemini-free', 42_000);
  });

  it('blocked window resets after TTL', async () => {
    const clients = { claude: okClient('claude'), 'gemini-free': okClient('gemini-free') };
    let t = 0;
    const router = new RouterLLMClient({
      config: cfg,
      env: { GEMINI_API_KEY: 'k' },
      clients: new Map(Object.entries(clients)),
      sleep: async () => {},
      now: () => t,
      blockedTtlMs: 1000,
    });
    clients['gemini-free'].call.mockRejectedValueOnce(coded(429));
    await router.call(reqFor('search'));
    expect(router.getWindowState('gemini-free')).toBe('blocked');
    t = 2000;
    expect(router.getWindowState('gemini-free')).toBe('fresh');
    const resp = await router.call(reqFor('search'));
    expect(resp.provider).toBe('gemini-free');
  });
});
