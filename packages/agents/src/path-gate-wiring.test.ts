import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makeTempGitRepo } from './testing';

// End-to-end proof of the §5 PATH gate: a Tier-B producer whose diff would write
// outside project.path must PAUSE for a human (needs_validation + pending
// validation row, risk escalated to blocking) — never finish as task_done, and
// never reach the LLM critics. The producer's diff is swapped per test so the
// same harness covers `..` traversal and a REAL on-disk symlink escape (which
// proves the real fs realpath is the injected seam, not a stub).
const producer = vi.hoisted(() => ({ diff: '' }));

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => ({
        text: req.reviewKind
          ? actual.mockVerdictText(req.reviewKind, req.user)
          : `Here is the change:\n\`\`\`diff\n${producer.diff}\n\`\`\``,
        inputTokens: 220,
        outputTokens: 80,
        cacheReadTokens: 60,
        cacheCreationTokens: 20,
        quotaUnits: 0,
        model: 'claude-haiku-4-5',
        sessionId: 'test-session-id',
      })),
    })),
  };
});

import { unlinkSync, mkdirSync, mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, and } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, tasks, events, validations } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'pathgate-proj';
const DELEGATION_AGENT = 'design-ui-designer';
const AGENT_IDS = [DELEGATION_AGENT, 'reviewer', 'quality-controller', 'sec-reviewer'];
const PAUSED = 'paused_for_validation';
const TRAVERSAL_TARGET = '../outside.txt';
const SYMLINK_TARGET = 'link/evil.txt';

let dbPath: string;
let repoDir: string;
let outsideDir: string;

beforeEach(async () => {
  delete process.env.MAS_MOCK_LLM;
  process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
  const dir = join(tmpdir(), 'mas-test');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  repoDir = await makeTempGitRepo('mas-pathgate-');
  outsideDir = mkdtempSync(join(tmpdir(), 'mas-outside-'));
});

afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  try { rmSync(outsideDir, { recursive: true, force: true }); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_ROUTING_CONFIG;
});

async function seed(missionId: string): Promise<string> {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'Path gate', slug: 'pathgate', path: repoDir, type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  for (const id of AGENT_IDS) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId, projectId: PROJECT_ID, title: 'Path gate mission',
    objective: 'Edit file.txt', status: 'planned', risk: 'low',
    budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  const taskId = `${missionId}_t1`;
  await db.insert(tasks).values({
    id: taskId, missionId, title: 'Edit file.txt', description: 'Change hello to goodbye in file.txt.',
    status: 'todo', risk: 'low', agentId: DELEGATION_AGENT,
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: 5000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  return taskId;
}

async function eventsOfType(missionId: string, type: string) {
  const db = getDb();
  return db.select().from(events).where(and(eq(events.missionId, missionId), eq(events.type, type)));
}

async function runOnce(missionId: string) {
  const taskId = await seed(missionId);
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
    symlinkSync(outsideDir, join(repoDir, 'link'));
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
