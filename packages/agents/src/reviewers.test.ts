import { describe, it, expect } from 'vitest';
import { mockLLM } from '@mas/core';
import {
  parseVerdict,
  realReviewer,
  realSecReviewer,
  realQualityController,
  realCodeReviewer,
  realAgentEvaluator,
} from './reviewers';

describe('parseVerdict', () => {
  it('parses a PASS verdict', () => {
    const v = parseVerdict('t1', '## Verdict\nPASS\n\n## Findings\n- [info] all good');
    expect(v.taskId).toBe('t1');
    expect(v.verdict).toBe('PASS');
    expect(v.findings.some((f) => f.severity === 'info')).toBe(true);
  });

  it('parses a NEEDS_WORK verdict with findings', () => {
    const v = parseVerdict('t2', '## Verdict\nNEEDS_WORK\n\n## Findings\n- [warn] add tests');
    expect(v.verdict).toBe('NEEDS_WORK');
    expect(v.findings.some((f) => f.severity === 'warn' && f.message.includes('add tests'))).toBe(true);
  });

  it('maps NEEDS_CHANGES to NEEDS_WORK', () => {
    const v = parseVerdict('t3', '## Verdict\nNEEDS_CHANGES\n\n## Findings\n- [warn] x');
    expect(v.verdict).toBe('NEEDS_WORK');
  });

  it('parses a BLOCK verdict', () => {
    const v = parseVerdict('t4', '## Verdict\nBLOCK\n\n## Findings\n- [block] secret write');
    expect(v.verdict).toBe('BLOCK');
    expect(v.findings.some((f) => f.severity === 'block')).toBe(true);
  });

  it('fail-safes unparseable text to NEEDS_WORK (never silent PASS)', () => {
    const v = parseVerdict('t5', 'the model rambled and produced no verdict header');
    expect(v.verdict).toBe('NEEDS_WORK');
    expect(v.findings.some((f) => f.message.includes('could not parse verdict'))).toBe(true);
  });
});

describe('real critics under the deterministic mock LLM', () => {
  const llm = mockLLM();

  it('realReviewer returns PASS by default', async () => {
    const v = await realReviewer(llm, {
      taskId: 't1',
      brief: { title: 'Ship feature', description: 'do the thing' },
      lastMessage: 'done',
    });
    expect(v.verdict).toBe('PASS');
  });

  it('realReviewer returns NEEDS_WORK on the sentinel', async () => {
    const v = await realReviewer(llm, {
      taskId: 't1',
      brief: { title: '[needs-work] flaky', description: 'do the thing' },
      lastMessage: 'done',
    });
    expect(v.verdict).toBe('NEEDS_WORK');
  });

  it('realQualityController returns BLOCK on the qc-block sentinel', async () => {
    const v = await realQualityController(llm, {
      taskId: 't1',
      taskTitles: ['ok task', '[qc-block] bad commit'],
    });
    expect(v.verdict).toBe('BLOCK');
  });

  it('realSecReviewer returns BLOCK on a blocking-risk task', async () => {
    const v = await realSecReviewer(llm, {
      taskId: 't1',
      risk: 'blocking',
      brief: { title: 'force push', description: 'git push --force' },
    });
    expect(v.verdict).toBe('BLOCK');
  });

  it('realSecReviewer maps NEEDS_CHANGES to NEEDS_WORK', async () => {
    const v = await realSecReviewer(llm, {
      taskId: 't1',
      risk: 'high',
      brief: { title: '[needs-work] ambiguous', description: 'unclear scope' },
    });
    expect(v.verdict).toBe('NEEDS_WORK');
  });

  it('realCodeReviewer returns PASS by default and embeds the code-review label', async () => {
    const v = await realCodeReviewer(llm, {
      taskId: 't1',
      brief: { title: 'Polish navbar', description: 'spacing' },
      diff: 'diff --git a/x b/x',
    });
    expect(v.verdict).toBe('PASS');
    expect(v.findings.some((f) => f.message.includes('code-review'))).toBe(true);
  });

  it('realAgentEvaluator scores deliver (PASS) by default with the agent-eval label', async () => {
    const v = await realAgentEvaluator(llm, {
      taskId: 't1',
      brief: { title: 'Ship feature', description: 'do the thing' },
      lastMessage: 'done',
    });
    expect(v.verdict).toBe('PASS');
    expect(v.findings.some((f) => f.message.includes('agent-eval'))).toBe(true);
  });

  it('realAgentEvaluator returns NEEDS_WORK (fix) on the sentinel', async () => {
    const v = await realAgentEvaluator(llm, {
      taskId: 't1',
      brief: { title: '[needs-work] thin', description: 'no evidence' },
      lastMessage: 'done',
    });
    expect(v.verdict).toBe('NEEDS_WORK');
  });
});
