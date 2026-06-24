import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, and } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, tasks, events } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';
import type { ReviewerVerdict } from '@mas/core';

// Deterministic mock LLM — the review phase critics emit a parseable verdict.
const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'eval-proj';

let dbPath: string;

beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-test');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
});

afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_MOCK_LLM;
});

async function seed(missionId: string, { withEvaluator = true } = {}): Promise<void> {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'Eval', slug: 'eval', path: '/tmp/eval', type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  // events.agentId FKs to agents.id — seed every agent the review phase logs.
  // Omitting agent-evaluator simulates a stale DB so the advisory log's FK insert
  // fails and the dispatch catch-branch (dispatch.ts:509-511) fires instead.
  const agentIds = ['context-manager', 'quality-controller', 'reviewer'];
  if (withEvaluator) agentIds.push('agent-evaluator');
  for (const id of agentIds) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId, projectId: PROJECT_ID, title: 'Eval mission', objective: 'Write a doc',
    status: 'planned', risk: 'low', budgetTokens: 50000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  // agentId NOT in TIER_B_DELEGATION_MAP → raw path, no diff gate.
  await db.insert(tasks).values({
    id: `${missionId}_t1`, missionId, title: 'Draft the README', description: 'Two paragraphs.',
    status: 'todo', risk: 'low', agentId: 'context-manager',
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: 50000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

describe('runReviewPhase — Agent Evaluator wiring (Phase 9 · 0c, RES-043)', () => {
  it('logs an advisory agent_evaluation event and still validates the mission', async () => {
    const MID = 'mid_eval';
    await seed(MID);
    await runMission(MID);

    // Tick 1: run the single task to done. Tick 2: all done → review phase.
    expect((await executeNextTask(MID)).kind).toBe('task_done');
    expect((await executeNextTask(MID)).kind).toBe('mission_complete');

    const db = getDb();
    const evals = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'agent_evaluation')));

    // The transverse judge ran exactly once, tagged to its own agent id.
    expect(evals).toHaveLength(1);
    expect(evals[0]?.agentId).toBe('agent-evaluator');
    const verdict = JSON.parse(evals[0]!.payloadJson) as ReviewerVerdict;
    expect(['PASS', 'NEEDS_WORK', 'BLOCK']).toContain(verdict.verdict);

    // Advisory: the evaluator does NOT block — a clean mission still validates.
    const [m] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('validated');
  });

  it('falls back to agent_evaluation_error and still validates when the agent-evaluator row is absent', async () => {
    const MID = 'mid_eval_missing';
    await seed(MID, { withEvaluator: false });
    await runMission(MID);

    expect((await executeNextTask(MID)).kind).toBe('task_done');
    expect((await executeNextTask(MID)).kind).toBe('mission_complete');

    const db = getDb();
    // The advisory log's FK insert fails → the catch-branch fires an error event.
    const errs = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'agent_evaluation_error')));
    expect(errs).toHaveLength(1);

    // No successful agent_evaluation event was written.
    const ok = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'agent_evaluation')));
    expect(ok).toHaveLength(0);

    // Best-effort: a missing evaluator row must NOT stall the mission at review.
    const [m] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('validated');
  });
});
