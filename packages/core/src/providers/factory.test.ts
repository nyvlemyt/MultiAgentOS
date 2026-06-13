import { describe, it, expect, vi, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRouterLLM } from './factory.js';
import type { LLMClient } from '../llm.js';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..');
const repoConfig = resolve(repoRoot, 'config/model-routing.json');

let dir: string | undefined;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function tmpFile(name: string, content: string): string {
  dir ??= mkdtempSync(join(tmpdir(), 'mas-factory-'));
  const p = join(dir, name);
  writeFileSync(p, content);
  return p;
}

const claudeStub: LLMClient = {
  call: vi.fn(async () => ({
    text: 'claude',
    inputTokens: 1,
    outputTokens: 1,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    quotaUnits: 0,
    model: 'm',
  })),
};

describe('createRouterLLM', () => {
  it('repo defaults (no keys, no accounts) ⇒ undefined, zero network', () => {
    const fetchSpy = vi.fn();
    const router = createRouterLLM({
      configPath: repoConfig,
      envPath: '/nonexistent/.env.local',
      claudeFactory: () => claudeStub,
      fetchImpl: fetchSpy,
    });
    expect(router).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('gemini key in .env.local ⇒ router routes memory domain to gemini (mock fetch)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const envPath = tmpFile('.env.local', 'GEMINI_API_KEY=test-key\n');
    const fetchSpy = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'hi' }] } }],
          usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 },
        }),
        { status: 200 },
      ),
    );
    const router = createRouterLLM({
      configPath: repoConfig,
      envPath,
      claudeFactory: () => claudeStub,
      fetchImpl: fetchSpy,
    });
    expect(router).toBeDefined();
    const resp = await router!.call({ system: '', user: 'u', model: 'm', mode: 'eco', domain: 'memory' });
    expect(resp.provider).toBe('gemini-free');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('declared claude accounts ⇒ router with per-account clients', async () => {
    const factorySpy = vi.fn(() => claudeStub);
    const configPath = tmpFile(
      'model-routing.json',
      JSON.stringify({
        claude_accounts: [{ id: 'pro20', configDir: '/profiles/pro20' }],
        paid_apis_enabled: false,
        providers: {},
        domains: { planning: { primary: 'claude', fallback: [] } },
      }),
    );
    const router = createRouterLLM({
      configPath,
      envPath: '/nonexistent/.env.local',
      claudeFactory: factorySpy,
    });
    expect(router).toBeDefined();
    const resp = await router!.call({ system: '', user: 'u', model: 'm', mode: 'eco', domain: 'planning' });
    expect(resp.provider).toBe('pro20');
    expect(factorySpy).toHaveBeenCalledWith(
      expect.objectContaining({ extraEnv: expect.objectContaining({ CLAUDE_CONFIG_DIR: '/profiles/pro20' }) }),
    );
  });
});
