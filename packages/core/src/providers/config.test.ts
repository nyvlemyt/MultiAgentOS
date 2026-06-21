import { describe, it, expect, vi } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadRoutingConfig,
  buildSourceStatuses,
  resolveProviderPlans,
  planWarnings,
  DOMAINS,
} from './config.js';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..');
const configPath = resolve(repoRoot, 'config/model-routing.json');

describe('loadRoutingConfig', () => {
  it('loads the repo config: paid OFF, no accounts, all 9 domains mapped', () => {
    const cfg = loadRoutingConfig(configPath);
    expect(cfg.paid_apis_enabled).toBe(false);
    expect(cfg.claude_accounts).toEqual([]);
    for (const d of DOMAINS) {
      expect(cfg.domains[d], `domain ${d}`).toBeDefined();
    }
    expect(cfg.domains['code-execution']!.primary).toBe('claude');
    expect(cfg.domains['code-execution']!.fallback).toEqual([]);
  });

  it('missing file ⇒ safe defaults (everything routes to claude), never crash', () => {
    const cfg = loadRoutingConfig('/nonexistent/model-routing.json');
    expect(cfg.paid_apis_enabled).toBe(false);
    expect(cfg.providers).toEqual({});
    expect(cfg.domains).toEqual({});
  });
});

describe('resolveProviderPlans', () => {
  it('reads the Claude Max plan + each provider plan from the repo config', () => {
    const plans = resolveProviderPlans(loadRoutingConfig(configPath));
    expect(plans.get('claude')).toMatchObject({ tier: 'max', billing: 'subscription', monthlyCostEur: 100 });
    expect(plans.get('gemini-free')).toMatchObject({ tier: 'free', billing: 'free' });
    expect(plans.get('openai')).toMatchObject({ billing: 'payg' });
  });

  it('omits sources whose plan is undeclared', () => {
    const plans = resolveProviderPlans({
      claude_accounts: [], paid_apis_enabled: false, providers: {}, domains: {},
    });
    expect(plans.size).toBe(0);
  });
});

describe('planWarnings', () => {
  it('repo config is fully declared ⇒ no warnings for enabled sources', () => {
    const cfg = loadRoutingConfig(configPath);
    // only the claude pool is enabled by default; it has a declared plan.
    expect(planWarnings(cfg, {})).toEqual([]);
  });

  it('warns when the Claude pool plan is missing', () => {
    const cfg = { claude_accounts: [], paid_apis_enabled: false, providers: {}, domains: {} };
    expect(planWarnings(cfg, {})).toContainEqual(expect.stringContaining('Claude pool'));
  });

  it('warns when an enabled provider has no plan', () => {
    const cfg = {
      claude_accounts: [], paid_apis_enabled: false,
      claude_plan: { tier: 'max', billing: 'subscription' as const },
      providers: { 'gemini-free': { id: 'gemini-free', kind: 'gemini' as const, apiKeyEnv: 'GEMINI_API_KEY' } },
      domains: {},
    };
    expect(planWarnings(cfg, { GEMINI_API_KEY: 'k' })).toContainEqual(
      expect.stringContaining('gemini-free'),
    );
  });
});

describe('buildSourceStatuses', () => {
  it('default env: claude pool enabled, gemini disabled (no key), paid providers disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const cfg = loadRoutingConfig(configPath);
    const statuses = buildSourceStatuses(cfg, {});
    expect(statuses.get('claude')?.enabled).toBe(true);
    expect(statuses.get('gemini-free')).toMatchObject({ enabled: false, reason: 'missing_key' });
    expect(statuses.get('openai')).toMatchObject({ enabled: false, reason: 'paid_apis_disabled' });
    expect(statuses.get('perplexity')).toMatchObject({
      enabled: false,
      reason: 'paid_apis_disabled',
    });
    warn.mockRestore();
  });

  it('gemini key present ⇒ gemini enabled, paid still off', () => {
    const cfg = loadRoutingConfig(configPath);
    const statuses = buildSourceStatuses(cfg, { GEMINI_API_KEY: 'k' });
    expect(statuses.get('gemini-free')?.enabled).toBe(true);
    expect(statuses.get('openai')?.enabled).toBe(false);
  });

  it('paid_apis_enabled + keys ⇒ openai/perplexity enabled', () => {
    const cfg = {
      ...loadRoutingConfig(configPath),
      paid_apis_enabled: true,
    };
    const statuses = buildSourceStatuses(cfg, {
      OPENAI_API_KEY: 'k1',
      PERPLEXITY_API_KEY: 'k2',
    });
    expect(statuses.get('openai')?.enabled).toBe(true);
    expect(statuses.get('perplexity')?.enabled).toBe(true);
  });
});
