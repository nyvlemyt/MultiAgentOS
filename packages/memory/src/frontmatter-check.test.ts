import { describe, it, expect } from 'vitest';
import { checkFiche, scanWikilinks, checkBody } from './frontmatter-check';

const known = new Set(['docs/resources/raw.md', 'docs/knowledge/x.md']);

const richFiche = {
  id: 'res-x',
  slug: 'x',
  source_key: 'sha256:x',
  lifecycle: 'active',
  trust: 'trusted',
  derived_from: 'docs/resources/raw.md',
  schema_version: '1',
  kind: 'resource',
  register: 'reference',
  scope: 'global',
  doc_type: 'reference',
  actionability: 'resource',
  lane: 'knowledge',
};

describe('checkFiche', () => {
  it('passes a full backbone fiche in strict tier', () => {
    expect(checkFiche(richFiche, { knownPaths: known, tier: 'strict' }).errors).toEqual([]);
  });

  it('flags an illegal lifecycle value (not in LEGAL_TRANSITIONS)', () => {
    const r = checkFiche({ ...richFiche, lifecycle: 'live' }, { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /lifecycle/.test(e))).toBe(true);
  });

  it('flags superseded without superseded_by (orphan terminal)', () => {
    const fm = {
      id: 'res-x',
      slug: 'x',
      source_key: 'k',
      lifecycle: 'superseded',
      trust: 'trusted',
      derived_from: 'docs/resources/raw.md',
    };
    const r = checkFiche(fm, { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /superseded_by/.test(e))).toBe(true);
  });

  it('passes superseded WITH a resolvable superseded_by', () => {
    const fm = {
      ...richFiche,
      lifecycle: 'superseded',
      superseded_by: 'docs/knowledge/x.md',
    };
    const r = checkFiche(fm, { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /superseded_by/.test(e))).toBe(false);
  });

  it('flags an unresolvable derived_from', () => {
    const fm = {
      id: 'res-x',
      slug: 'x',
      source_key: 'k',
      lifecycle: 'active',
      trust: 'trusted',
      derived_from: 'docs/resources/nope.md',
    };
    const r = checkFiche(fm, { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /derived_from/.test(e))).toBe(true);
  });

  it('flags an unresolvable entry in sources[]', () => {
    const fm = { ...richFiche, sources: ['docs/knowledge/x.md', 'docs/knowledge/ghost.md'] };
    const r = checkFiche(fm, { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /sources/.test(e))).toBe(true);
  });

  it('resolves a relation target by id/slug, not only by path', () => {
    const fm = { ...richFiche, derived_from: 'res-parent' };
    const withId = new Set([...known, 'res-parent']);
    expect(checkFiche(fm, { knownPaths: withId, tier: 'strict' }).errors).toEqual([]);
  });

  it('tier-1 mode only requires identity, grandfathers rich fields', () => {
    const fm = {
      id: 'res-x',
      slug: 'x',
      source_key: 'k',
      lifecycle: 'active',
      trust: 'trusted',
      derived_from: 'docs/resources/raw.md',
    };
    expect(checkFiche(fm, { knownPaths: known, tier: 'tier1' }).errors).toEqual([]);
  });

  it('tier-1 mode still flags a missing identity field', () => {
    const fm = { slug: 'x', source_key: 'k', lifecycle: 'active', trust: 'trusted' };
    const r = checkFiche(fm, { knownPaths: known, tier: 'tier1' });
    expect(r.errors.some((e) => /^id:/.test(e))).toBe(true);
  });
});

describe('scanWikilinks', () => {
  it('extracts prose wikilink targets', () => {
    expect(scanWikilinks('see [[feedback_phase-gates]] and [[res-x]]')).toEqual([
      'feedback_phase-gates',
      'res-x',
    ]);
  });

  it('ignores wikilinks inside inline code (the BDR-001 trap)', () => {
    expect(scanWikilinks('Obsidian graph view on the wikilinks `[[BDR-001]]`.')).toEqual([]);
  });

  it('ignores wikilinks inside a fenced code block', () => {
    const body = ['```', 'example: [[BDR-001]]', '```', 'real [[res-x]]'].join('\n');
    expect(scanWikilinks(body)).toEqual(['res-x']);
  });
});

describe('checkBody (legacy-doc wikilink tolerance — tier-1 trap)', () => {
  it('tier-1 tolerates an orphan body wikilink as a WARNING, never an error', () => {
    const r = checkBody('a dangling [[BDR-001]] in prose', { knownPaths: known, tier: 'tier1' });
    expect(r.errors).toEqual([]);
    expect(r.warnings.some((w) => /BDR-001/.test(w))).toBe(true);
  });

  it('strict tier promotes an unresolvable body wikilink to an error', () => {
    const r = checkBody('a dangling [[BDR-001]] in prose', { knownPaths: known, tier: 'strict' });
    expect(r.errors.some((e) => /BDR-001/.test(e))).toBe(true);
  });

  it('a resolvable body wikilink produces neither error nor warning', () => {
    const withId = new Set([...known, 'res-x']);
    const r = checkBody('see [[res-x]]', { knownPaths: withId, tier: 'strict' });
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });
});
