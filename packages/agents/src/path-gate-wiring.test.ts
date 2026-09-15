import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDispatchHarness, seedTierBMission, eventsOfType } from './testing';

// End-to-end proof of the §5 PATH gate: a Tier-B producer whose diff would write
// outside project.path must PAUSE for a human (needs_validation + pending
// validation row, risk escalated to blocking) — never finish as task_done, and
// never reach the LLM critics. The producer's diff is swapped per test so the
// same harness covers `..` traversal and a REAL on-disk symlink escape (which
// proves the real fs realpath is the injected seam, not a stub).
const producer = vi.hoisted(() => ({ diff: '' }));

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const { mockTierBCore } = await import('./testing');
  return mockTierBCore(actual, () => `Here is the change:\n\`\`\`diff\n${producer.diff}\n\`\`\``);
});

import { mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, tasks, validations } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'pathgate-proj';
const DELEGATION_AGENT = 'design-ui-designer';
const PAUSED = 'paused_for_validation';
const TRAVERSAL_TARGET = '../outside.txt';
const SYMLINK_TARGET = 'link/evil.txt';

const h = useDispatchHarness(MIGRATIONS_FOLDER, 'mas-pathgate-');
let outsideDir: string;
beforeEach(() => {
  outsideDir = mkdtempSync(join(tmpdir(), 'mas-outside-'));
});
afterEach(() => {
  try { rmSync(outsideDir, { recursive: true, force: true }); } catch { /* ignore */ }
});

async function runOnce(missionId: string) {
  const taskId = await seedTierBMission({
    missionId, projectId: PROJECT_ID, name: 'Path gate', slug: 'pathgate', repoDir: h.repoDir,
    agentIds: [DELEGATION_AGENT, 'reviewer', 'quality-controller', 'sec-reviewer'],
    missionTitle: 'Path gate mission', objective: 'Edit file.txt', missionBudget: 20000,
    task: { title: 'Edit file.txt', description: 'Change hello to goodbye in file.txt.', budgetTokens: 5000 },
  });
  await runMission(missionId);
  const res = await executeNextTask(missionId);
  const db = getDb();
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  const pending = await db.select().from(validations).where(eq(validations.taskId, taskId));
  return { res, task, pending };
}

describe('§5 path gate — a diff that traverses out of the project', () => {
  const MID = 'mid_pathgate_traversal';
  beforeEach(() => {
    producer.diff = `--- a/${TRAVERSAL_TARGET}\n+++ b/${TRAVERSAL_TARGET}\n@@ -1 +1 @@\n-a\n+b`;
  });

  it('pauses for human validation instead of finishing the task', async () => {
    const { res, task } = await runOnce(MID);
    expect(res.kind).toBe(PAUSED);
    expect(task?.status).toBe('needs_validation');
  });

  it('escalates the task to blocking and opens a pending validation naming the target', async () => {
    const { task, pending } = await runOnce(MID);
    expect(task?.risk).toBe('blocking');
    expect(pending).toHaveLength(1);
    expect(pending[0]?.status).toBe('pending');
    expect(pending[0]?.actionSummary).toContain(TRAVERSAL_TARGET);
  });

  it('logs a risk_classified event citing the path-escape rule', async () => {
    await runOnce(MID);
    const evs = await eventsOfType(MID, 'risk_classified');
    expect(evs).toHaveLength(1);
    const payload = JSON.parse(evs[0]!.payloadJson) as { rule: string; from: string; to: string; target: string };
    expect(payload).toMatchObject({ rule: 'path-escape', from: 'low', to: 'blocking', target: TRAVERSAL_TARGET });
  });

  it('never reaches the LLM critics — no tier_b_review event, no task_done', async () => {
    await runOnce(MID);
    expect(await eventsOfType(MID, 'tier_b_review')).toEqual([]);
    expect(await eventsOfType(MID, 'task_done')).toEqual([]);
  });
});

describe('§5 path gate — a diff that escapes through a real symlink', () => {
  const MID = 'mid_pathgate_symlink';
  beforeEach(() => {
    symlinkSync(outsideDir, join(h.repoDir, 'link'));
    producer.diff = `--- /dev/null\n+++ b/${SYMLINK_TARGET}\n@@ -0,0 +1 @@\n+pwned`;
  });

  it('pauses, escalates to blocking, and names the symlink escape', async () => {
    const { res, task, pending } = await runOnce(MID);
    expect(res.kind).toBe(PAUSED);
    expect(task?.risk).toBe('blocking');
    expect(pending[0]?.actionSummary).toContain(SYMLINK_TARGET);
    const [ev] = await eventsOfType(MID, 'risk_classified');
    const payload = JSON.parse(ev!.payloadJson) as { reason: string };
    expect(payload.reason).toMatch(/symlink escapes/);
  });
});
