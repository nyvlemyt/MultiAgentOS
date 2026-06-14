import { describe, it, expect } from 'vitest';
import { mockSecReviewer } from './llm';
import type { Risk } from './types';

// Sec Reviewer is the mandatory §5 gate before any risk:high / risk:blocking
// task. The mock returns BLOCK ONLY for 'blocking' (the always-gated tier) and
// PASS otherwise — covering the BLOCK decision boundary the dispatch review
// phase relies on (CLAUDE.md §5).
describe('mockSecReviewer — BLOCK decision boundary', () => {
  it('returns BLOCK for a blocking-risk task', () => {
    const v = mockSecReviewer('t1', { risk: 'blocking' });
    expect(v.verdict).toBe('BLOCK');
    expect(v.taskId).toBe('t1');
  });

  it.each<Risk>(['low', 'medium', 'high'])('returns PASS for %s-risk', (risk) => {
    expect(mockSecReviewer('t', { risk }).verdict).toBe('PASS');
  });

  it('always carries at least one finding with a valid severity', () => {
    const v = mockSecReviewer('t2', { risk: 'blocking' });
    expect(v.findings.length).toBeGreaterThan(0);
    for (const f of v.findings) {
      expect(['info', 'warn', 'block']).toContain(f.severity);
    }
  });
});
