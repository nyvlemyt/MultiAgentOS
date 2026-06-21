import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async () => ({
        text: '[test-mock] task executed',
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

import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, and } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, tasks, events } from '@mas/db';
import { SkillRouter, mergeSkillMetas, scanOrchestratorSkills, loadLibraryIndex } from '@mas/skills';
import { planMission } from './dispatch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const MIGRATIONS_FOLDER = resolve(REPO_ROOT, 'packages/db/migrations');
const PILOT = 'security-defensive-specialist';
const CYBER_PREFIX = 'cyber:';

function libraryRouter(): SkillRouter {
  return new SkillRouter(
    mergeSkillMetas(scanOrchestratorSkills(REPO_ROOT), loadLibraryIndex(REPO_ROOT)),
  );
}

const AGENT_IDS = [
  'mission-planner',
  'skill-router',
  'design-ux-architect',
  'engineering-frontend-developer',
  'sec-reviewer',
  'reviewer',
  PILOT,
];

async function seedSecurityMission(missionId: string) {
  const db = getDb();
  await db.insert(projects).values({
    id: 'arsenal-proj',
    name: 'Arsenal Project',
    slug: 'arsenal',
    path: join(tmpdir(), 'mas-arsenal-project'),
    type: 'other',
    createdAt: new Date(),
    lastActiveAt: new Date(),
  });
  for (const id of AGENT_IDS) {
    await db.insert(agents).values({
      id,
      tier: 'A',
      fichePath: `fiches/${id}.md`,
      name: id,
      model: 'claude-haiku-4-5',
      enabled: true,
      totalRuns: 0,
      totalTokens: 0,
      successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId,
    projectId: 'arsenal-proj',
    title: 'Security hardening sweep',
    objective: 'Run a defensive cyber threat assessment and harden the project.',
    status: 'draft',
    risk: 'low',
    budgetTokens: 30000,
    spentTokens: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

let dbPath: string;

beforeEach(() => {
  delete process.env.MAS_MOCK_LLM;
  process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
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
  delete process.env.MAS_ROUTING_CONFIG;
});

describe('dispatch — arsenal vivant (test 6)', () => {
  it('routes a cyber task to the pilot and persists cyber:* skills + a degraded decision event', async () => {
    const MID = 'mid_arsenal';
    await seedSecurityMission(MID);
    await planMission(MID);

    const db = getDb();
    const router = libraryRouter();

    const cyberTasks = (await db.select().from(tasks).where(eq(tasks.missionId, MID)))
      .filter((t) => t.agentId === PILOT);
    expect(cyberTasks.length).toBeGreaterThan(0);

    const cyberTask = cyberTasks[0]!;
    const skillIds = JSON.parse(cyberTask.skillsJson ?? '[]') as string[];
    expect(skillIds.length).toBeGreaterThan(0);

    // At least one selected skill belongs to the cyber arsenal slice.
    const hasCyber = skillIds.some((id) => {
      const meta = router.all().find((s) => s.id === id);
      return meta?.cluster?.startsWith(CYBER_PREFIX) ?? false;
    });
    expect(hasCyber).toBe(true);

    // The decision event proves the real engine ran (degraded + selected skills).
    const decisions = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'skill_router_decision')));
    const pilotDecision = decisions
      .map((e) => ({ taskId: e.taskId, payload: JSON.parse(e.payloadJson) as { degraded?: boolean; skills?: string[] } }))
      .find((d) => d.taskId === cyberTask.id);
    expect(pilotDecision).toBeDefined();
    expect(pilotDecision!.payload.degraded).toBe(true);
    expect(pilotDecision!.payload.skills).toEqual(skillIds);
  });
});
