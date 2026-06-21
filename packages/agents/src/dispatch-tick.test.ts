import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, budgets, events } from '@mas/db';
import { selectForTick, runDispatchTick, type DispatchTickConfig } from './dispatch-tick';
import { seedDispatchableMission as seedMission } from './fixtures';
import { useTestDb } from './testing';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

type Row = { id: string; projectId: string; createdAt: Date };

function row(id: string, projectId: string, ms: number): Row {
  return { id, projectId, createdAt: new Date(ms) };
}

describe('selectForTick — pure selection', () => {
  it('applies the per-project cap, overflow → project_cap', () => {
    const missionsIn = [row('a', 'p1', 1), row('b', 'p1', 2), row('c', 'p1', 3)];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 1, maxGlobalConcurrent: 10 };
    const { selected, skipped } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['a']);
    expect(skipped).toEqual([
      { missionId: 'b', projectId: 'p1', reason: 'project_cap' },
      { missionId: 'c', projectId: 'p1', reason: 'project_cap' },
    ]);
  });

  it('applies the global cap after the per-project cap, overflow → global_cap', () => {
    const missionsIn = [
      row('a', 'p1', 1),
      row('b', 'p2', 2),
      row('c', 'p3', 3),
    ];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 1, maxGlobalConcurrent: 2 };
    const { selected, skipped } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['a', 'b']);
    expect(skipped).toEqual([{ missionId: 'c', projectId: 'p3', reason: 'global_cap' }]);
  });

  it('orders deterministically by createdAt then id', () => {
    const missionsIn = [
      row('z', 'p2', 5),
      row('a', 'p1', 5),
      row('m', 'p3', 1),
    ];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 5, maxGlobalConcurrent: 5 };
    const { selected } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['m', 'a', 'z']);
  });
});

describe('runDispatchTick — integration (mock LLM)', () => {
  useTestDb(MIGRATIONS_FOLDER);
  beforeEach(() => {
    process.env.MAS_MOCK_LLM = '1';
  });
  afterEach(() => {
    delete process.env.MAS_MOCK_LLM;
  });

  it('advances one mission per project across two projects', async () => {
    await seedMission('m1', 'p1');
    await seedMission('m2', 'p2');
    const result = await runDispatchTick({ maxConcurrentPerProject: 1, maxGlobalConcurrent: 4 });
    expect(result.advanced.map((a) => a.missionId).sort((a, b) => a.localeCompare(b))).toEqual(['m1', 'm2']);
    expect(result.skipped).toEqual([]);
  });

  it('caps per project: 3 missions, perProjectCap 1 → 1 advanced, 2 skipped project_cap', async () => {
    await seedMission('a1', 'p1');
    await seedMission('a2', 'p1');
    await seedMission('a3', 'p1');
    const result = await runDispatchTick({ maxConcurrentPerProject: 1, maxGlobalConcurrent: 4 });
    expect(result.advanced.length).toBe(1);
    expect(result.skipped.length).toBe(2);
    expect(result.skipped.every((s) => s.reason === 'project_cap')).toBe(true);
  });

  it('halts every mission and emits budget_exceeded when the month cap is reached', async () => {
    // No plan override (config absent) → cap comes from the month budgets row.
    process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
    const db = getDb();
    await db.insert(budgets).values({
      id: 'b_month', scope: 'global', period: 'month', tokensCap: 1000,
    });
    await db.insert(events).values({
      id: `evt_${randomUUID()}`, type: 'llm_call',
      tokensIn: 800, tokensOut: 400, cacheRead: 0, cacheCreation: 0, quotaUnits: 0,
      risk: 'low', createdAt: new Date(),
    });
    await seedMission('m1', 'p1');

    const result = await runDispatchTick({ maxConcurrentPerProject: 1, maxGlobalConcurrent: 4 });
    expect(result.advanced).toEqual([]);
    expect(result.skipped).toEqual([{ missionId: 'm1', projectId: 'p1', reason: 'budget_exceeded' }]);

    const emitted = await db.select().from(events).where(eq(events.type, 'budget_exceeded'));
    expect(emitted).toHaveLength(1);
    expect(JSON.parse(emitted[0]!.payloadJson ?? '{}').window).toBe('month');

    delete process.env.MAS_ROUTING_CONFIG;
  });
});
