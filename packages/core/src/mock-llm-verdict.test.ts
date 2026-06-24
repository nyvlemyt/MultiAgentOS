import { describe, it, expect } from 'vitest';
import { mockLLM, mockVerdictText } from './llm';

describe('mockVerdictText (Phase 9 · 0b determinism seam)', () => {
  it('defaults to PASS with the kind label embedded', () => {
    const text = mockVerdictText('code', 'Task: polish navbar\n\nImprove spacing.');
    expect(text).toContain('## Verdict');
    expect(text).toContain('PASS');
    expect(text).toContain('code-review');
  });

  it('emits BLOCK on the qc-block sentinel', () => {
    const text = mockVerdictText('qc', 'Task titles: [qc-block] non-conventional commit');
    expect(text).toContain('BLOCK');
    expect(text).toContain('quality-control');
    expect(text).toContain('- [block]');
  });

  it('emits BLOCK on the sec-block sentinel', () => {
    expect(mockVerdictText('sec', 'risk=blocking, rm -rf')).toContain('BLOCK');
    expect(mockVerdictText('sec', '[sec-block] secret write')).toContain('BLOCK');
  });

  it('emits NEEDS_WORK on the needs-work sentinel', () => {
    const text = mockVerdictText('reviewer', 'Task: x\n\n[needs-work] missing tests');
    expect(text).toContain('NEEDS_WORK');
    expect(text).toContain('review');
  });
});

describe('mockLLM review-awareness', () => {
  it('returns a parseable verdict when reviewKind is set', async () => {
    const llm = mockLLM();
    const resp = await llm.call({
      system: 's',
      user: '[needs-work] do more',
      model: 'claude-sonnet-4-6',
      mode: 'standard',
      reviewKind: 'reviewer',
    });
    expect(resp.text).toContain('## Verdict');
    expect(resp.text).toContain('NEEDS_WORK');
  });

  it('returns the plain ack when reviewKind is absent', async () => {
    const llm = mockLLM();
    const resp = await llm.call({
      system: 's',
      user: 'just a task',
      model: 'claude-haiku-4-5',
      mode: 'standard',
    });
    expect(resp.text).toContain('[mock:claude-haiku-4-5]');
    expect(resp.text).not.toContain('## Verdict');
  });
});
