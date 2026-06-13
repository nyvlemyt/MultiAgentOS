import { describe, it, expect, vi, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadEnvLocal, resolveProviderStatus } from './credentials.js';
import type { ProviderDef } from './types.js';

const gemini: ProviderDef = { id: 'gemini-free', kind: 'gemini', apiKeyEnv: 'GEMINI_API_KEY' };
const openai: ProviderDef = { id: 'openai', kind: 'openai', apiKeyEnv: 'OPENAI_API_KEY', paid: true };

describe('loadEnvLocal', () => {
  let dir: string | undefined;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = undefined;
  });

  it('parses KEY=VALUE lines, ignoring comments and blanks', () => {
    dir = mkdtempSync(join(tmpdir(), 'mas-env-'));
    const file = join(dir, '.env.local');
    writeFileSync(file, '# comment\nGEMINI_API_KEY=abc123\n\nOPENAI_API_KEY="quoted"\n');
    const env = loadEnvLocal(file);
    expect(env.GEMINI_API_KEY).toBe('abc123');
    expect(env.OPENAI_API_KEY).toBe('quoted');
  });

  it('returns empty object when file is missing — never crashes', () => {
    expect(loadEnvLocal('/nonexistent/.env.local')).toEqual({});
  });
});

describe('resolveProviderStatus', () => {
  it('missing key ⇒ disabled with warning, never crash', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const status = resolveProviderStatus(gemini, {}, false);
    expect(status).toEqual({ id: 'gemini-free', enabled: false, reason: 'missing_key' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('gemini-free'));
    warn.mockRestore();
  });

  it('key present ⇒ enabled', () => {
    const status = resolveProviderStatus(gemini, { GEMINI_API_KEY: 'k' }, false);
    expect(status).toEqual({ id: 'gemini-free', enabled: true });
  });

  it('paid provider with key but paid_apis_enabled=false ⇒ disabled', () => {
    const status = resolveProviderStatus(openai, { OPENAI_API_KEY: 'k' }, false);
    expect(status).toEqual({ id: 'openai', enabled: false, reason: 'paid_apis_disabled' });
  });

  it('paid provider with key and paid_apis_enabled=true ⇒ enabled', () => {
    const status = resolveProviderStatus(openai, { OPENAI_API_KEY: 'k' }, true);
    expect(status).toEqual({ id: 'openai', enabled: true });
  });

  it('claude-account kind needs no key ⇒ always enabled', () => {
    const def: ProviderDef = { id: 'claude:main', kind: 'claude-account' };
    expect(resolveProviderStatus(def, {}, false)).toEqual({ id: 'claude:main', enabled: true });
  });
});
