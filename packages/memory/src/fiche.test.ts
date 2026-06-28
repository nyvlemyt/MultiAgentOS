import { describe, it, expect } from 'vitest';
import { FicheSchema, LEGAL_TRANSITIONS, isLegalTransition, SCHEMA_VERSION } from './fiche';

const base = {
  id: 'res-anthropic-prompting', slug: 'anthropic-prompting', source_key: 'sha256:abc',
  derived_from: 'docs/resources/anthropic-prompting.pdf',
  lifecycle: 'active', trust: 'trusted',
  kind: 'resource', register: 'reference', scope: 'global',
  doc_type: 'reference', actionability: 'resource', lane: 'knowledge',
};

describe('FicheSchema', () => {
  it('accepts a minimal valid fiche and applies defaults', () => {
    const f = FicheSchema.parse(base);
    expect(f.schema_version).toBe('1');
    expect(f.part_of).toBeNull();
    expect(f.sources).toEqual([]);
    expect(f.tags).toEqual([]);
  });
  it('rejects an out-of-backbone lifecycle value', () => {
    expect(() => FicheSchema.parse({ ...base, lifecycle: 'live' })).toThrow();
  });
  it('tolerates unknown emergent keys (passthrough)', () => {
    const f = FicheSchema.parse({ ...base, some_emergent_tag: 'x' }) as Record<string, unknown>;
    expect(f.some_emergent_tag).toBe('x');
  });
  it('keeps lane a free string (appendable enum carried as data)', () => {
    expect(() => FicheSchema.parse({ ...base, lane: 'a-brand-new-lane' })).not.toThrow();
  });
});

describe('LEGAL_TRANSITIONS', () => {
  it('captured can go to triaged but never straight to active', () => {
    expect(isLegalTransition('captured', 'triaged')).toBe(true);
    expect(isLegalTransition('captured', 'active')).toBe(false);
  });
  it('superseded is archive-only, never back to active', () => {
    expect(isLegalTransition('superseded', 'archived')).toBe(true);
    expect(isLegalTransition('superseded', 'active')).toBe(false);
  });
  it('capture_failed can re-enter at triaged (after a fixed extractor)', () => {
    expect(isLegalTransition('capture_failed', 'triaged')).toBe(true);
  });
  it('archived and rejected-kept are terminal', () => {
    expect(LEGAL_TRANSITIONS.archived).toEqual([]);
    expect(LEGAL_TRANSITIONS['rejected-kept']).toEqual([]);
  });
});
