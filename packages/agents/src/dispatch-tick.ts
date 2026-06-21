import { randomUUID } from 'node:crypto';
import { getDb, events } from '@mas/db';
import { executeNextTask, listDispatchableMissions } from './dispatch';
import { checkDispatchBudget, type BudgetStatus } from './budget-gate';

export interface DispatchTickConfig {
  readonly maxConcurrentPerProject: number;
  readonly maxGlobalConcurrent: number;
}

export interface DispatchAdvance {
  readonly missionId: string;
  readonly projectId: string;
  readonly kind: string;
}

export interface DispatchSkip {
  readonly missionId: string;
  readonly projectId: string;
  readonly reason: 'project_cap' | 'global_cap' | 'budget_exceeded';
}

export interface DispatchTickResult {
  readonly advanced: DispatchAdvance[];
  readonly skipped: DispatchSkip[];
}

// Minimal mission row shape the selection needs — keeps selectForTick pure
// (no DB / LLM) and unit-testable.
interface SelectableMission {
  readonly id: string;
  readonly projectId: string;
  readonly createdAt: Date;
}

/**
 * Deterministic concurrency selection. Sort by createdAt then id, apply the
 * per-project cap first (overflow → project_cap), then the global cap over the
 * taken set (overflow → global_cap). Pure: takes plain mission rows, no DB/LLM.
 */
export function selectForTick<M extends SelectableMission>(
  missionRows: readonly M[],
  config: DispatchTickConfig,
): { selected: M[]; skipped: DispatchSkip[] } {
  const ordered = [...missionRows].sort((a, b) => {
    const byTime = a.createdAt.getTime() - b.createdAt.getTime();
    return byTime === 0 ? a.id.localeCompare(b.id) : byTime;
  });

  const skipped: DispatchSkip[] = [];
  const perProjectTaken: M[] = [];
  const countByProject = new Map<string, number>();

  for (const m of ordered) {
    const taken = countByProject.get(m.projectId) ?? 0;
    if (taken >= config.maxConcurrentPerProject) {
      skipped.push({ missionId: m.id, projectId: m.projectId, reason: 'project_cap' });
      continue;
    }
    countByProject.set(m.projectId, taken + 1);
    perProjectTaken.push(m);
  }

  const selected: M[] = [];
  for (const m of perProjectTaken) {
    if (selected.length >= config.maxGlobalConcurrent) {
      skipped.push({ missionId: m.id, projectId: m.projectId, reason: 'global_cap' });
    } else {
      selected.push(m);
    }
  }

  return { selected, skipped };
}

/**
 * One dispatch pass: pick missions within the concurrency budget and advance
 * each one task. better-sqlite3 is synchronous per statement and executeNextTask
 * uses an atomic task-claim, so concurrent advance via Promise.all is safe.
 * Mission/task DB access is self-resolved via getDb() inside the dispatch
 * helpers, so no Db handle is threaded here.
 */
async function logBudgetExceeded(status: BudgetStatus): Promise<void> {
  await getDb().insert(events).values({
    id: `evt_${randomUUID()}`,
    type: 'budget_exceeded',
    payloadJson: JSON.stringify({ window: status.window, day: status.day, week: status.week }),
    tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheCreation: 0, quotaUnits: 0,
    risk: 'low',
    createdAt: new Date(),
  });
}

export async function runDispatchTick(
  config: DispatchTickConfig,
): Promise<DispatchTickResult> {
  const dispatchable = await listDispatchableMissions();

  // Pre-flight token-budget gate (CLAUDE.md §6, §11): once a day/week window is
  // exhausted, advance nothing and pause until the operator raises the cap or
  // the window rolls over. Emitted once per blocked tick for the meter/feed.
  const budget = await checkDispatchBudget();
  if (budget.blocked) {
    await logBudgetExceeded(budget);
    return {
      advanced: [],
      skipped: dispatchable.map((m) => ({
        missionId: m.id,
        projectId: m.projectId,
        reason: 'budget_exceeded' as const,
      })),
    };
  }

  const { selected, skipped } = selectForTick(dispatchable, config);

  const advanced = await Promise.all(
    selected.map(async (m) => {
      const res = await executeNextTask(m.id);
      return { missionId: m.id, projectId: m.projectId, kind: res.kind };
    }),
  );

  return { advanced, skipped };
}
