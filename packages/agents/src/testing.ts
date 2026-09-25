import { beforeEach, afterEach, vi } from 'vitest';
import { unlinkSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { and, eq } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, tasks, events } from '@mas/db';

const git = promisify(execFile);

/**
 * Shared diff-test fixtures (sandbox-diff + review-gate suites). Hoisted here to
 * keep a single source of truth and avoid Sonar duplication across test files.
 * Uses the async execFile form (not execFileSync) so it doesn't trip the S4036
 * PATH hotspot, mirroring sandbox-diff.ts.
 */
export async function makeTempGitRepo(prefix = 'mas-repo-'): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  await git('git', ['init', '-q'], { cwd: dir });
  await git('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  await git('git', ['config', 'user.name', 'Test'], { cwd: dir });
  writeFileSync(join(dir, 'file.txt'), 'hello\nworld\n');
  await git('git', ['add', '-A'], { cwd: dir });
  await git('git', ['commit', '-q', '-m', 'base'], { cwd: dir });
  return dir;
}

/** A clean unified diff that turns 'hello' into 'goodbye' in file.txt. */
export const CLEAN_TEST_DIFF = [
  'diff --git a/file.txt b/file.txt',
  'index 0000000..1111111 100644',
  '--- a/file.txt',
  '+++ b/file.txt',
  '@@ -1,2 +1,2 @@',
  '-hello',
  '+goodbye',
  ' world',
  '',
].join('\n');

export const GARBAGE_TEST_DIFF = 'this is not a diff at all\n@@ broken @@\n';

/**
 * A non-git temp dir seeded with the same file.txt the diff fixtures target.
 * Exercises sandbox-diff's "source is not a repo → git-init the sandbox" path.
 */
export function makeTempNonRepo(prefix = 'mas-nonrepo-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  writeFileSync(join(dir, 'file.txt'), 'hello\nworld\n');
  return dir;
}

/**
 * Test-only helpers (not exported from the package index). Deduplicate the
 * per-suite DB boilerplate and the project/mission/roster fixtures shared by
 * the dispatch-flow tests.
 */
export function useTestDb(migrationsFolder: string): void {
  let dbPath: string;
  beforeEach(() => {
    dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
    migrate(getDb(dbPath), { migrationsFolder });
  });
  afterEach(() => {
    closeDb();
    unlinkSync(dbPath);
  });
}

export const TIER_A_ROSTER = [
  'mission-planner',
  'orchestrator',
  'skill-router',
  'design-ux-architect',
  'engineering-frontend-developer',
  'quality-controller',
  'sec-reviewer',
  'reviewer',
  'agent-evaluator',
] as const;

export async function seedAgents(ids: readonly string[]): Promise<void> {
  const db = getDb();
  for (const id of ids) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
}

export async function seedAgentsRoster(): Promise<void> {
  await seedAgents(TIER_A_ROSTER);
}

export async function seedProject(id: string, name = id): Promise<void> {
  const db = getDb();
  await db.insert(projects).values({
    id, name, slug: id, path: join(tmpdir(), id), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
}

export async function seedMission(
  missionId: string,
  projectId: string,
  opts: { title?: string; objective?: string } = {},
): Promise<void> {
  const db = getDb();
  await db.insert(missions).values({
    id: missionId, projectId,
    title: opts.title ?? 'Build settings page',
    objective: opts.objective ?? 'Add a settings page',
    status: 'draft', risk: 'low',
    budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
}

// ---------------------------------------------------------------------------
// Shared harness for the dispatch-flow suites that drive the real dispatch path
// against a fresh env-driven DB, with @mas/core mocked (mockTierBCore) or the
// deterministic mockLLM (`mockLlm` option). One copy here instead of one per
// suite — Sonar's new-code duplication gate caught the fourth copy.
// ---------------------------------------------------------------------------

/**
 * The @mas/core mock used by those suites: a critic call (reviewKind set) gets a
 * deterministic, parseable verdict so CI stays live-model-free; any other call
 * returns the producer text the suite decides (constant, per-test, or stateful —
 * the callback receives the request, so a suite can also record its prompts).
 * Call it from inside the vi.mock factory via `await import('./testing')` — the
 * factory is hoisted, so it cannot see static imports.
 */
export function mockTierBCore(
  actual: typeof import('@mas/core'),
  producerText: (req: import('@mas/core').LLMRequest) => string,
) {
  const base = {
    inputTokens: 220,
    outputTokens: 80,
    cacheReadTokens: 60,
    cacheCreationTokens: 20,
    quotaUnits: 0,
    model: 'claude-haiku-4-5',
    sessionId: 'test-session-id',
  };
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => ({
        text: req.reviewKind ? actual.mockVerdictText(req.reviewKind, req.user) : producerText(req),
        ...base,
      })),
    })),
  };
}

export interface DispatchHarnessOptions {
  /** mkdtemp prefix — `repoDir` becomes a fresh git repo per test. */
  repoPrefix?: string;
  /**
   * MAS_MOCK_LLM=1 so selectLLM short-circuits to the deterministic mockLLM.
   * Default: cleared, so the suite's own claudeCodeLLM mock is what runs.
   */
  mockLlm?: boolean;
}

/**
 * Env-driven DB + temp-repo harness: fresh SQLite through MAS_DB_PATH, the
 * routing config pointed at a missing file (single provider, no live router, no
 * plan-cap override), MAS_MOCK_LLM cleared or set per `mockLlm`. `dbPath` and
 * `repoDir` are per-test values — read them inside the test, after beforeEach
 * has run.
 */
export function useDispatchHarness(
  migrationsFolder: string,
  opts: DispatchHarnessOptions = {},
): { repoDir: string; dbPath: string } {
  const ctx = { repoDir: '', dbPath: '' };
  beforeEach(async () => {
    if (opts.mockLlm) process.env.MAS_MOCK_LLM = '1';
    else delete process.env.MAS_MOCK_LLM;
    process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
    const dir = join(tmpdir(), 'mas-test');
    mkdirSync(dir, { recursive: true });
    ctx.dbPath = join(dir, `${randomUUID()}.db`);
    process.env.MAS_DB_PATH = ctx.dbPath;
    migrate(getDb(), { migrationsFolder });
    if (opts.repoPrefix) ctx.repoDir = await makeTempGitRepo(opts.repoPrefix);
  });
  afterEach(() => {
    closeDb();
    try { unlinkSync(ctx.dbPath); } catch { /* ignore */ }
    delete process.env.MAS_DB_PATH;
    delete process.env.MAS_ROUTING_CONFIG;
    delete process.env.MAS_MOCK_LLM;
  });
  return ctx;
}

export interface TierBSeed {
  missionId: string;
  projectId: string;
  name: string;
  slug: string;
  repoDir: string;
  agentIds: readonly string[];
  missionTitle: string;
  objective: string;
  missionBudget: number;
  task: { title: string; description: string; budgetTokens: number };
}

/** Project at repoDir + roster + a `planned` mission + one `todo` low-risk task delegated to agentIds[0]. Returns the task id. */
export async function seedTierBMission(seed: TierBSeed): Promise<string> {
  const db = getDb();
  await db.insert(projects).values({
    id: seed.projectId, name: seed.name, slug: seed.slug, path: seed.repoDir, type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  await seedAgents(seed.agentIds);
  await db.insert(missions).values({
    id: seed.missionId, projectId: seed.projectId, title: seed.missionTitle, objective: seed.objective,
    status: 'planned', risk: 'low', budgetTokens: seed.missionBudget, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  const taskId = `${seed.missionId}_t1`;
  await db.insert(tasks).values({
    id: taskId, missionId: seed.missionId, title: seed.task.title, description: seed.task.description,
    status: 'todo', risk: 'low', agentId: seed.agentIds[0],
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: seed.task.budgetTokens, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  return taskId;
}

/** All events of one type for a mission (the usual assertion query). */
export function eventsOfType(missionId: string, type: string) {
  return getDb().select().from(events).where(and(eq(events.missionId, missionId), eq(events.type, type)));
}
