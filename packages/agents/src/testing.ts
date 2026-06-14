import { beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, agents, missions } from '@mas/db';

/**
 * Shared diff-test fixtures (sandbox-diff + review-gate suites). Hoisted here to
 * keep a single source of truth and avoid Sonar duplication across test files.
 */
export function makeTempGitRepo(prefix = 'mas-repo-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  writeFileSync(join(dir, 'file.txt'), 'hello\nworld\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-q', '-m', 'base'], { cwd: dir });
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
  'skill-router',
  'design-ux-architect',
  'engineering-frontend-developer',
  'quality-controller',
  'sec-reviewer',
  'reviewer',
] as const;

export async function seedAgentsRoster(): Promise<void> {
  const db = getDb();
  for (const id of TIER_A_ROSTER) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
}

export async function seedProject(id: string, name = id): Promise<void> {
  const db = getDb();
  await db.insert(projects).values({
    id, name, slug: id, path: join(tmpdir(), id), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
}

export async function seedMission(missionId: string, projectId: string): Promise<void> {
  const db = getDb();
  await db.insert(missions).values({
    id: missionId, projectId, title: 'Build settings page',
    objective: 'Add a settings page', status: 'draft', risk: 'low',
    budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
}
