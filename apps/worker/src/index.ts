import { argv } from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  listDispatchableMissions,
  executeNextTask,
  runAutopilotTick,
  buildDailyReport,
  emitDailyReport,
  hasDailyReportFor,
} from '@mas/agents';
import { getDb } from '@mas/db';

const TICK_MS = 1500;
const DAY_MS = 24 * 60 * 60 * 1000;

type Db = ReturnType<typeof getDb>;

let busy = false;

/**
 * One worker tick. Advances dispatchable missions, then runs the autopilot pass
 * (which only auto-runs risk ≤ maxRisk — the §5 gate is never bypassed) and
 * emits the daily report at most once per local day. `now` is explicit so the
 * tick is deterministic in tests.
 */
export async function tick(db: Db, now: Date): Promise<void> {
  const dispatchable = await listDispatchableMissions();
  for (const m of dispatchable) {
    const res = await executeNextTask(m.id);
    if (res.kind === 'task_done') {
      console.log(`[worker] task done in ${m.id}: ${res.taskId}`);
    } else if (res.kind === 'paused_for_validation') {
      console.log(`[worker] mission ${m.id} paused — task ${res.taskId} needs validation`);
    } else if (res.kind === 'mission_complete') {
      console.log(`[worker] mission ${m.id} complete (validated)`);
    }
  }

  const auto = await runAutopilotTick(db, now);
  if (auto.ran.length > 0 || auto.skippedHighRisk.length > 0) {
    console.log(`[worker] autopilot ran=${auto.ran.length} skippedHighRisk=${auto.skippedHighRisk.length}`);
  }

  await maybeEmitDailyReport(db, now);
}

/** Emit a daily report covering the last 24h, at most once per local day. */
export async function maybeEmitDailyReport(db: Db, now: Date): Promise<void> {
  const date = now.toISOString().slice(0, 10);
  if (await hasDailyReportFor(db, date)) return;
  const since = new Date(now.getTime() - DAY_MS);
  const report = await buildDailyReport(db, { since, until: now });
  await emitDailyReport(db, report);
  console.log(`[worker] daily report emitted for ${date}`);
}

async function safeTick(): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    await tick(getDb(), new Date());
  } catch (e) {
    console.error('[worker:tick]', e);
  } finally {
    busy = false;
  }
}

async function main() {
  if (process.env.ANTHROPIC_API_KEY) {
    console.error(
      '[worker] ANTHROPIC_API_KEY is set — refusing to start. ' +
        'MultiAgentOS uses subscription billing only. See CLAUDE.md §11.',
    );
    process.exit(1);
  }
  console.log('[worker] alive');
  // touch the DB once to surface init errors early
  getDb();
  setInterval(() => {
    safeTick().then(undefined, (e) => console.error('[worker:interval]', e));
  }, TICK_MS);
}

// Only auto-start when run as the entry point; importing (tests) must not boot
// the interval loop.
const isEntry = argv[1] !== undefined && import.meta.url === pathToFileURL(argv[1]).href;
if (isEntry) {
  try {
    await main();
  } catch (e) {
    console.error('[worker] fatal', e);
    process.exit(1);
  }
}
