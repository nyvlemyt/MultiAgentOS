import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, and } from 'drizzle-orm';
import { getDb, projects, events } from '@mas/db';
import { MemoryStore, MEMORY_KEEPER_AGENT } from '@mas/memory';
import { planMission, runMission, executeNextTask } from './dispatch';
import { useTestDb, seedAgentsRoster, seedProject, seedMission } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');
const PROJECT_ID = 'otakugo';

let memRoot: string;

useTestDb(MIGRATIONS_FOLDER);
beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
  memRoot = mkdtempSync(join(tmpdir(), 'mas-inj-'));
  process.env.MAS_MEMORY_ROOT = memRoot;
});
afterEach(() => {
  rmSync(memRoot, { recursive: true, force: true });
  delete process.env.MAS_MEMORY_ROOT;
  delete process.env.MAS_MOCK_LLM;
});

async function seedProjectAndMission(missionId: string) {
  const db = getDb();
  const exists = await db.select().from(projects).where(eq(projects.id, PROJECT_ID));
  if (exists.length === 0) {
    await seedProject(PROJECT_ID, 'OtakuGO');
    await seedAgentsRoster();
  }
  await seedMission(missionId, PROJECT_ID);
}

async function runFirstTask(missionId: string) {
  await planMission(missionId);
  await runMission(missionId);
  await executeNextTask(missionId);
  const db = getDb();
  const done = await db
    .select()
    .from(events)
    .where(and(eq(events.missionId, missionId), eq(events.type, 'task_done')));
  return JSON.parse(done[0]!.payloadJson) as {
    memoryContextChars: number;
    memoryProjectEntries: number;
  };
}

describe('two-mission memory injection (Trace diff of system prompts)', () => {
  it('mission 1 injects no memory; mission 2 injects mission-1 memory', async () => {
    await seedProjectAndMission('m1');
    const p1 = await runFirstTask('m1');
    expect(p1.memoryContextChars).toBe(0);
    expect(p1.memoryProjectEntries).toBe(0);

    // Between missions, the Memory Keeper promotes a decision from mission 1.
    const keeper = new MemoryStore({ root: memRoot, writerAgent: MEMORY_KEEPER_AGENT });
    keeper.append(PROJECT_ID, 'decisions', {
      title: 'Settings uses shadcn/ui Tabs',
      body: 'Mission 1 decided settings page uses shadcn/ui Tabs over a custom nav.',
    });

    await seedProjectAndMission('m2');
    const p2 = await runFirstTask('m2');
    expect(p2.memoryContextChars).toBeGreaterThan(0);
    expect(p2.memoryProjectEntries).toBe(1);
  });
});
