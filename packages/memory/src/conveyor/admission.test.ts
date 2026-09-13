import { describe, it, expect } from 'vitest';
import { admit, deadLetterReason, type AdmissionInput, type DeadLetterCause } from './admission';

const ok: AdmissionInput = { body: 'a real distilled note', signals: ['project'] };

describe('admit (Admission SAS — zero-signal junk never becomes pending)', () => {
  it('admits a candidate with a resolvable source, content, and ≥1 signal', () => {
    expect(admit(ok)).toEqual({ ok: true });
  });

  it('admits content carried by title/summary alone (no body)', () => {
    expect(admit({ body: '', title: 'A Title', signals: ['reference'] })).toEqual({ ok: true });
  });

  it('rejects an unresolvable source with a reason', () => {
    const v = admit({ ...ok, sourceResolvable: false });
    expect(v.ok).toBe(false);
    expect(v.ok === false && v.reason).toMatch(/unresolvable|source/i);
  });

  it('rejects empty content (title/summary/body all blank), even whitespace-only', () => {
    const v = admit({ body: '   ', title: '', summary: '  ', signals: ['x'] });
    expect(v.ok).toBe(false);
    expect(v.ok === false && v.reason).toMatch(/empty|content/i);
  });

  it('rejects when there is no classification signal', () => {
    expect(admit({ body: 'text', signals: [] }).ok).toBe(false);
    expect(admit({ body: 'text', signals: ['', '   '] }).ok).toBe(false);
    expect(admit({ body: 'text' }).ok).toBe(false);
  });
});

describe('deadLetterReason (never a silent disappearance — visible + relaunchable)', () => {
  const causes: DeadLetterCause[] = [
    'extractor_crash',
    'ocr_empty',
    'paywall_404',
    'oversize',
    'double_abstain',
    'unknown_source_kind',
  ];

  it('maps every cause to a non-empty, cause-tagged reason', () => {
    for (const c of causes) {
      const r = deadLetterReason(c);
      expect(r).toContain('capture_failed');
      expect(r).toContain(c);
    }
  });

  it('appends a detail when provided', () => {
    expect(deadLetterReason('unknown_source_kind', 'docx')).toContain('docx');
    expect(deadLetterReason('extractor_crash', 'TimeoutError')).toContain('TimeoutError');
  });
});
