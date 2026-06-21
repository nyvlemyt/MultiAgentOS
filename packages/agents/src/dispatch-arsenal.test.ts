import { describe, it, expect } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq } from 'drizzle-orm';
import { getDb, tasks, events } from '@mas/db';
import { SkillRouter, mergeSkillMetas, scanOrchestratorSkills, loadLibraryIndex } from '@mas/skills';
import { planMission } from './dispatch';
import { useTestDb, seedAgents, seedProject, seedMission, TIER_A_ROSTER } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const MIGRATIONS_FOLDER = resolve(REPO_ROOT, 'packages/db/migrations');
const PILOT = 'security-defensive-specialist';
const CYBER_PREFIX = 'cyber:';

useTestDb(MIGRATIONS_FOLDER);

function libraryRouter(): SkillRouter {
  return new SkillRouter(
    mergeSkillMetas(scanOrchestratorSkills(REPO_ROOT), loadLibraryIndex(REPO_ROOT)),
  );
}

// planMission makes no LLM call (deterministic planner + scoped library
// selection with no ranker), so no @mas/core mock is needed — only a DB + a
// roster that includes the defensive pilot for the FK on the cyber task.
async function seedSecurityMission(missionId: string): Promise<void> {
  await seedProject('arsenal-proj', 'Arsenal Project');
  await seedAgents([...TIER_A_ROSTER, PILOT]);
  await seedMission(missionId, 'arsenal-proj', {
    title: 'Security hardening sweep',
    objective: 'Run a defensive cyber threat assessment and harden the project.',
  });
}

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
