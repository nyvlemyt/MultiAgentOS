import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { schema, budgets } from '@mas/db';
import { eq } from 'drizzle-orm';
import { checkBudget, recordUsage, ensureMissionBudgetRow, BudgetExceededError } from './budget.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const MIGRATIONS = resolve(REPO_ROOT, 'packages/db/migrations');

function makeTestDb() {
  const raw = new Database(':memory:');
  raw.pragma('journal_mode = WAL');
  raw.pragma('foreign_keys = ON');
  const db = drizzle(raw, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}

// ---- BudgetExceededError -------------------------------------------------------

describe('BudgetExceededError', () => {
  it('is an Error subclass', () => {
    const e = new BudgetExceededError('global', 'day');
    expect(e).toBeInstanceOf(Error);
    expect(e.scope).toBe('global');
    expect(e.period).toBe('day');
  });
});

// ---- checkBudget ---------------------------------------------------------------

describe('checkBudget', () => {
  it('does not throw when under cap with no estimation', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'b1',
      scope: 'global',
      period: 'month',
      tokensCap: 1_000_000,
      tokensSpent: 0,
      moneyCapCents: 1500,
      moneySpentCents: 100,
    });
    await expect(checkBudget({ db, missionId: undefined })).resolves.toBeUndefined();
  });

  it('throws when spent + estimated would exceed global day cap', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'b_day',
      scope: 'global',
      period: 'day',
      tokensCap: 1_000_000,
      tokensSpent: 0,
      moneyCapCents: 300,
      moneySpentCents: 290,
    });
    // 290 + 15 = 305 > 300 → should throw
    await expect(checkBudget({ db, missionId: undefined, estimatedCostCents: 15 }))
      .rejects.toBeInstanceOf(BudgetExceededError);
  });

  it('does not throw when spent + estimated is exactly at cap', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'b_day2',
      scope: 'global',
      period: 'day',
      tokensCap: 1_000_000,
      tokensSpent: 0,
      moneyCapCents: 300,
      moneySpentCents: 285,
    });
    // 285 + 15 = 300 = cap → NOT over cap, should NOT throw
    await expect(checkBudget({ db, missionId: undefined, estimatedCostCents: 15 }))
      .resolves.toBeUndefined();
  });

  it('throws when global day cap already hit (even with 0 estimated)', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'b_day3',
      scope: 'global',
      period: 'day',
      tokensCap: 100,
      tokensSpent: 100,
      moneyCapCents: 300,
      moneySpentCents: 300,
    });
    await expect(checkBudget({ db, missionId: undefined, estimatedCostCents: 0 }))
      .rejects.toBeInstanceOf(BudgetExceededError);
  });

  it('throws when mission token cap hit', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await db.insert(budgets).values({
      id: `budget_mission_${missionId}`,
      scope: 'mission',
      scopeId: missionId,
      period: 'mission',
      tokensCap: 500,
      tokensSpent: 500,
      moneyCapCents: 0,
      moneySpentCents: 0,
    });
    await expect(checkBudget({ db, missionId })).rejects.toBeInstanceOf(BudgetExceededError);
  });
});

// ---- recordUsage ---------------------------------------------------------------

describe('recordUsage', () => {
  it('increments tokensSpent and moneySpentCents on global budget rows', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values([
      { id: 'b_d', scope: 'global', period: 'day', tokensCap: 1_000_000, tokensSpent: 0, moneyCapCents: 300, moneySpentCents: 0 },
      { id: 'b_m', scope: 'global', period: 'month', tokensCap: 5_000_000, tokensSpent: 0, moneyCapCents: 1500, moneySpentCents: 0 },
    ]);
    const mockRes = {
      text: 'hi', inputTokens: 100, outputTokens: 50,
      cacheReadTokens: 0, cacheCreationTokens: 0,
      costCents: 1, model: 'claude-haiku-4-5-20251001',
    };
    await recordUsage({ db, response: mockRes });
    const [dayRow] = await db.select().from(budgets).where(eq(budgets.id, 'b_d'));
    expect(dayRow!.tokensSpent).toBe(150);
    expect(dayRow!.moneySpentCents).toBe(1);
    const [monthRow] = await db.select().from(budgets).where(eq(budgets.id, 'b_m'));
    expect(monthRow!.tokensSpent).toBe(150);
    expect(monthRow!.moneySpentCents).toBe(1);
  });

  it('also updates mission budget row when missionId provided', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await db.insert(budgets).values({
      id: `budget_mission_${missionId}`,
      scope: 'mission',
      scopeId: missionId,
      period: 'mission',
      tokensCap: 20_000,
      tokensSpent: 0,
      moneyCapCents: 0,
      moneySpentCents: 0,
    });
    const mockRes = {
      text: 'hi', inputTokens: 200, outputTokens: 80,
      cacheReadTokens: 0, cacheCreationTokens: 0,
      costCents: 2, model: 'claude-haiku-4-5-20251001',
    };
    await recordUsage({ db, response: mockRes, missionId });
    const [mRow] = await db.select().from(budgets).where(eq(budgets.scopeId, missionId));
    expect(mRow!.tokensSpent).toBe(280);
  });
});

// ---- ensureMissionBudgetRow ----------------------------------------------------

describe('ensureMissionBudgetRow', () => {
  it('creates a budget row for a new mission', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 });
    const [row] = await db.select().from(budgets).where(eq(budgets.scopeId, missionId));
    expect(row!.scope).toBe('mission');
    expect(row!.tokensCap).toBe(20_000);
  });

  it('is idempotent — second call does not throw', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 });
    await expect(ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 })).resolves.toBeUndefined();
  });
});
