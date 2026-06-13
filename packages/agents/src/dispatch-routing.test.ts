import { describe, it, expect, beforeEach, vi } from 'vitest';

const llmCall = vi.fn(async () => ({
  text: '[test-mock] done',
  inputTokens: 100,
  outputTokens: 50,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  quotaUnits: 0,
  model: 'claude-haiku-4-5',
  sessionId: 'sess',
}));
const routerCall = vi.fn(async () => ({
  text: '[router-mock] done',
  inputTokens: 10,
  outputTokens: 5,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  quotaUnits: 0,
  model: 'claude-haiku-4-5',
  provider: 'gemini-free',
}));

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({ call: llmCall })),
    createRouterLLM: vi.fn(() => undefined),
  };
});

// Deterministic skill registry: every skill resolves to the 'search' domain.
vi.mock('@mas/skills', () => ({
  scanOrchestratorSkills: vi.fn(() => []),
  SkillRouter: class {
    buildPromptContext(): string {
      return '';
    }
    domainFor(): string {
      return 'search';
    }
  },
}));

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRouterLLM } from '@mas/core';
import { planMission, runMission, executeNextTask } from './dispatch';
import { useTestDb, seedAgentsRoster, seedProject, seedMission } from './testing';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

useTestDb(MIGRATIONS);

beforeEach(async () => {
  delete process.env.MAS_MOCK_LLM;
  vi.mocked(createRouterLLM).mockReturnValue(undefined);
  llmCall.mockClear();
  routerCall.mockClear();
  await seedProject('proj-routing');
  await seedAgentsRoster();
  await seedMission('m-routing', 'proj-routing');
  await planMission('m-routing');
  await runMission('m-routing');
});

describe('dispatch — Phase 3.5 routing wiring', () => {
  it("sets LLMRequest.domain from the task's skill domain tags", async () => {
    const r = await executeNextTask('m-routing');
    expect(r.kind).toBe('task_done');
    expect(llmCall).toHaveBeenCalledWith(expect.objectContaining({ domain: 'search' }));
  });

  it('uses the router client when createRouterLLM returns one', async () => {
    vi.mocked(createRouterLLM).mockReturnValue({ call: routerCall });
    const r = await executeNextTask('m-routing');
    expect(r.kind).toBe('task_done');
    expect(routerCall).toHaveBeenCalledTimes(1);
    expect(llmCall).not.toHaveBeenCalled();
  });

  it('falls back to claudeCodeLLM when no non-default source is enabled', async () => {
    const r = await executeNextTask('m-routing');
    expect(r.kind).toBe('task_done');
    expect(llmCall).toHaveBeenCalledTimes(1);
  });

  it('MAS_MOCK_LLM seam stays first — router never consulted', async () => {
    process.env.MAS_MOCK_LLM = '1';
    vi.mocked(createRouterLLM).mockClear();
    const r = await executeNextTask('m-routing');
    expect(r.kind).toBe('task_done');
    expect(createRouterLLM).not.toHaveBeenCalled();
    expect(llmCall).not.toHaveBeenCalled();
    delete process.env.MAS_MOCK_LLM;
  });
});
