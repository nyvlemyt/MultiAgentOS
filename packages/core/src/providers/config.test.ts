import { describe, it, expect, vi } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRoutingConfig, buildSourceStatuses, DOMAINS } from './config.js';

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
