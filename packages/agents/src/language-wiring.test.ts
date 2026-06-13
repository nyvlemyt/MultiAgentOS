import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const capturedSystems: string[] = [];
vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: { system: string }) => {
        capturedSystems.push(req.system);
        return {
          text: '[test-mock] task executed',
          inputTokens: 220, outputTokens: 80, cacheReadTokens: 60,
          cacheCreationTokens: 20, quotaUnits: 0, model: 'claude-haiku-4-5',
          sessionId: 'test-session-id',
        };
      }),
    })),
  };
});

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, projects } from '@mas/db';
import { planMission, runMission, executeNextTask } from './dispatch';
import { useTestDb, seedAgentsRoster, seedProject, seedMission } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

useTestDb(MIGRATIONS_FOLDER);
beforeEach(() => {
  capturedSystems.length = 0;
});
afterEach(() => {
  delete process.env.MAS_MOCK_LLM;
});

async function runFirstTask(projectId: string, missionId: string) {
  await seedProject(projectId);
  await seedAgentsRoster();
  await seedMission(missionId, projectId);
  await planMission(missionId);
  await runMission(missionId);
  await executeNextTask(missionId);
}

describe('language directive wiring (executeTaskWithLLM)', () => {
  it('injects the French directive for an fr (default) project', async () => {
    await runFirstTask('p_fr', 'm_fr');
    expect(capturedSystems.length).toBeGreaterThan(0);
    expect(capturedSystems[0]).toContain('Respond in French.');
    expect(capturedSystems[0]).not.toContain('Respond in English.');
  });

  it('injects the English directive for an en project', async () => {
    await seedProject('p_en');
    await getDb().update(projects).set({ language: 'en' }).where(eq(projects.id, 'p_en'));
    await seedAgentsRoster();
    await seedMission('m_en', 'p_en');
    await planMission('m_en');
    await runMission('m_en');
    await executeNextTask('m_en');
    expect(capturedSystems[0]).toContain('Respond in English.');
  });

  it('adds no LLM call beyond the task itself (mock seam unchanged)', async () => {
    await runFirstTask('p_count', 'm_count');
    // One execution task → exactly one system assembled and sent.
    expect(capturedSystems.length).toBe(1);
  });
});
