import { describe, it, expect } from 'vitest';
import { EMPTY_PERMISSIONS, type LLMClient, type LLMRequest } from '@mas/core';
import { resolveTaskRisk } from './dispatch';

// resolveTaskRisk is the risk-decision unit extracted from planMission's per-task
// loop (F-FN-2): classify → take the stricter of classified vs planner risk →
// consult the Sec Reviewer ONLY when the rule classifier abstains. No DB.
//
// A throwing LLM stub proves the §5 always-gate + benign paths never consult the
// model (needsLLMFallback === false), so plan-time risk stays quota-free.
const throwingLlm: LLMClient = {
  call: (_req: LLMRequest) => {
    throw new Error('resolveTaskRisk must not call the LLM when the rule classifier is decisive');
  },
};

describe('resolveTaskRisk', () => {
  it('escalates a §5 always-gate task (rm) to blocking without an LLM call', async () => {
    const { finalRisk, classified } = await resolveTaskRisk(
      { title: 'Clean build dir', description: 'run rm -rf build', taskId: 't1' },
      'low',
      EMPTY_PERMISSIONS,
      throwingLlm,
    );
    expect(finalRisk).toBe('blocking');
    expect(classified.rule).toBe('rm');
    expect(classified.needsLLMFallback).toBe(false);
  });

  it('leaves a benign task at low without an LLM call', async () => {
    const { finalRisk } = await resolveTaskRisk(
      { title: 'Write the README intro', description: 'add a short paragraph', taskId: 't2' },
      'low',
      EMPTY_PERMISSIONS,
      throwingLlm,
    );
    expect(finalRisk).toBe('low');
  });

  it('keeps the stricter planner risk when the classifier is lower', async () => {
    const { finalRisk } = await resolveTaskRisk(
      { title: 'Write the README intro', description: 'add a short paragraph', taskId: 't3' },
      'high',
      EMPTY_PERMISSIONS,
      throwingLlm,
    );
    expect(finalRisk).toBe('high');
  });
});
