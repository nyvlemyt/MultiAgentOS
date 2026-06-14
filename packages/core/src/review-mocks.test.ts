import { describe, it, expect } from 'vitest';
import { mockCodeReviewer, mockRealityChecker } from './llm';

describe('mockCodeReviewer', () => {
  it('passes with an info finding when a diff is present', () => {
    const v = mockCodeReviewer('t1', { hasDiff: true });
    expect(v.taskId).toBe('t1');
    expect(v.verdict).toBe('PASS');
    expect(v.findings.some((f) => f.severity === 'info')).toBe(true);
    expect(v.findings.some((f) => f.severity === 'warn')).toBe(false);
  });

  it('adds a warn finding when there is no diff', () => {
    const v = mockCodeReviewer('t2', { hasDiff: false });
    expect(v.verdict).toBe('PASS');
    expect(v.findings.some((f) => f.severity === 'warn')).toBe(true);
  });
});

describe('mockRealityChecker', () => {
  it('defaults to NEEDS_WORK without evidence', () => {
    const v = mockRealityChecker('t3', { evidence: false });
    expect(v.verdict).toBe('NEEDS_WORK');
  });

  it('passes only with overwhelming evidence', () => {
    const v = mockRealityChecker('t4', { evidence: true });
    expect(v.verdict).toBe('PASS');
  });
});
