import { describe, it, expect } from 'vitest';
import { mockQualityController } from './llm';

describe('mockQualityController', () => {
  it('returns PASS when no process violation is flagged', () => {
    const v = mockQualityController('task1', { taskTitles: ['Build settings page', 'Wire API'] });
    expect(v.verdict).toBe('PASS');
    expect(v.taskId).toBe('task1');
    expect(v.findings.length).toBeGreaterThan(0);
  });

  it('returns BLOCK when a task carries the process-violation sentinel', () => {
    const v = mockQualityController('task1', {
      taskTitles: ['Build settings page', '[qc-block] non-conventional commit'],
    });
    expect(v.verdict).toBe('BLOCK');
    expect(v.findings.some((f) => f.severity === 'block')).toBe(true);
  });
});
