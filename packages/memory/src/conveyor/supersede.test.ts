import { describe, it, expect } from 'vitest';
import {
  planSupersede,
  markSuperseded,
  type ExistingFiche,
} from './supersede';

const opts = { date: '2026-06-28', keeper: 'memory-keeper' };

const activeOld: ExistingFiche = {
  id: 'fiche-old',
  source_key: 'sha256:same',
  lifecycle: 'active',
  lane: 'knowledge',
};

describe('planSupersede (keyed on source_key — archive-never-delete)', () => {
  it('returns null when no active fiche shares the source_key (fresh ADD)', () => {
    expect(planSupersede([], { id: 'fiche-new', source_key: 'sha256:same' }, opts)).toBeNull();
    expect(
      planSupersede([{ ...activeOld, source_key: 'sha256:other' }], { id: 'fiche-new', source_key: 'sha256:same' }, opts),
    ).toBeNull();
  });

  it('plans a supersede when an active fiche shares the source_key', () => {
    const plan = planSupersede([activeOld], { id: 'fiche-new', source_key: 'sha256:same' }, opts);
    expect(plan).not.toBeNull();
    expect(plan).toMatchObject({ supersededId: 'fiche-old', supersededBy: 'fiche-new' });
  });

  it('emits a consolidation-log line in the frozen format', () => {
    const plan = planSupersede([activeOld], { id: 'fiche-new', source_key: 'sha256:same' }, opts)!;
    // FORMAT: <ISO-date> | <event> | ids=<csv> | lane=<lane> | keeper=<who> | note=<short>
    expect(plan.logLine).toMatch(
      /^2026-06-28 \| supersede \| ids=fiche-old,fiche-new \| lane=knowledge \| keeper=memory-keeper \| note=/,
    );
  });

  it('ignores non-active matches (captured / superseded / archived) — only active is legally superseded', () => {
    for (const lifecycle of ['captured', 'superseded', 'archived', 'rejected-kept']) {
      expect(
        planSupersede([{ ...activeOld, lifecycle }], { id: 'fiche-new', source_key: 'sha256:same' }, opts),
      ).toBeNull();
    }
  });

  it('never supersedes itself (same id) — no cycle', () => {
    expect(
      planSupersede([activeOld], { id: 'fiche-old', source_key: 'sha256:same' }, opts),
    ).toBeNull();
  });

  it('prefers the incoming lane, falling back to the existing fiche lane', () => {
    const withLane = planSupersede([activeOld], { id: 'n', source_key: 'sha256:same', lane: 'archive' }, opts)!;
    expect(withLane.logLine).toContain('lane=archive');
    const noLane = planSupersede([{ ...activeOld, lane: 'workflows' }], { id: 'n', source_key: 'sha256:same' }, opts)!;
    expect(noLane.logLine).toContain('lane=workflows');
  });
});

describe('markSuperseded (legal lifecycle flip, no mutation)', () => {
  it('flips active → superseded and sets superseded_by, returning a new object', () => {
    const fm = { id: 'fiche-old', lifecycle: 'active', tags: ['x'] };
    const out = markSuperseded(fm, 'fiche-new');
    expect(out).toMatchObject({ lifecycle: 'superseded', superseded_by: 'fiche-new', tags: ['x'] });
    expect(fm.lifecycle).toBe('active'); // input untouched
  });

  it('throws when the current lifecycle cannot legally transition to superseded', () => {
    expect(() => markSuperseded({ lifecycle: 'archived' }, 'x')).toThrow(/transition|superseded|legal/i);
    expect(() => markSuperseded({ lifecycle: 'captured' }, 'x')).toThrow();
  });
});
