import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb } from '@mas/db';
import {
  getAgentConfig,
  saveAgentConfig,
  agentSkills,
  autonomyRaiseNeedsConfirm,
  budgetRaiseNeedsConfirm,
} from './agent-config';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');
const AGENT = 'engineering-frontend-developer'; // Frontend Developer, tier B, claude-sonnet-4-6

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-cfg-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('getAgentConfig', () => {
  it('returns fixture defaults when no override row exists', async () => {
    const cfg = await getAgentConfig(getDb(), AGENT, 'p1');
    expect(cfg.name).toBe('Frontend Developer');
    expect(cfg.tier).toBe('B');
    expect(cfg.model).toBe('claude-sonnet-4-6');
    expect(cfg.autonomy).toBe('manual');
    expect(cfg.effortMode).toBe('eco');
    expect(cfg.budgetCap).toBe(20000);
    expect(cfg.enabledSkills).toBeNull();
  });

  it('lets the override win field-by-field, falling back to defaults for null fields', async () => {
    await saveAgentConfig(getDb(), AGENT, 'p1', { model: 'claude-opus-4-8', autonomy: 'autonomous' });
    const cfg = await getAgentConfig(getDb(), AGENT, 'p1');
    expect(cfg.model).toBe('claude-opus-4-8');
    expect(cfg.autonomy).toBe('autonomous');
    expect(cfg.effortMode).toBe('eco'); // not overridden → default
    expect(cfg.budgetCap).toBe(20000);
  });

  it('scopes overrides per project', async () => {
    await saveAgentConfig(getDb(), AGENT, 'p1', { autonomy: 'autopilot' });
    const other = await getAgentConfig(getDb(), AGENT, 'p2');
    expect(other.autonomy).toBe('manual');
  });
});

describe('saveAgentConfig', () => {
  it('upserts a partial patch without wiping previously-set fields', async () => {
    await saveAgentConfig(getDb(), AGENT, 'p1', { budgetCap: 50000 });
    await saveAgentConfig(getDb(), AGENT, 'p1', { effortMode: 'expert' });
    const cfg = await getAgentConfig(getDb(), AGENT, 'p1');
    expect(cfg.budgetCap).toBe(50000);
    expect(cfg.effortMode).toBe('expert');
  });

  it('persists an enabledSkills allowlist round-trip', async () => {
    await saveAgentConfig(getDb(), AGENT, 'p1', { enabledSkills: ['frontend-design', 'caveman'] });
    const cfg = await getAgentConfig(getDb(), AGENT, 'p1');
    expect(cfg.enabledSkills).toEqual(['frontend-design', 'caveman']);
  });
});

describe('agentSkills', () => {
  const cat = [
    { id: 's1', tags: ['x'], usedBy: [AGENT] },
    { id: 's2', tags: [], usedBy: [] },
  ];

  it('defaults enabled from the catalogue usedBy when no allowlist', () => {
    const rows = agentSkills(AGENT, null, cat);
    expect(rows.find((r) => r.id === 's1')!.enabled).toBe(true);
    expect(rows.find((r) => r.id === 's2')!.enabled).toBe(false);
  });

  it('lets the allowlist override the default enabled state', () => {
    const rows = agentSkills(AGENT, ['s2'], cat);
    expect(rows.find((r) => r.id === 's1')!.enabled).toBe(false);
    expect(rows.find((r) => r.id === 's2')!.enabled).toBe(true);
  });
});

describe('autonomyRaiseNeedsConfirm (§5 habit)', () => {
  it('confirms a raise to autonomous or autopilot', () => {
    expect(autonomyRaiseNeedsConfirm('assisted', 'autonomous')).toBe(true);
    expect(autonomyRaiseNeedsConfirm('manual', 'autopilot')).toBe(true);
  });
  it('does not confirm lowers or moves into manual/assisted', () => {
    expect(autonomyRaiseNeedsConfirm('autopilot', 'autonomous')).toBe(false);
    expect(autonomyRaiseNeedsConfirm('manual', 'assisted')).toBe(false);
    expect(autonomyRaiseNeedsConfirm('autonomous', 'autonomous')).toBe(false);
  });
});

describe('budgetRaiseNeedsConfirm', () => {
  it('confirms only when the cap increases', () => {
    expect(budgetRaiseNeedsConfirm(20000, 50000)).toBe(true);
    expect(budgetRaiseNeedsConfirm(20000, 20000)).toBe(false);
    expect(budgetRaiseNeedsConfirm(20000, 10000)).toBe(false);
  });
});
