import { describe, it, expect } from 'vitest';
import { buildManifest, isMultiPart, type ManifestInput, type SourcePart } from './manifest';

const parts: SourcePart[] = [
  { heading: 'Lesson 1 — Intro', markdown: 'intro body' },
  { heading: 'Lesson 2 — Core', markdown: 'core body' },
  { heading: 'Lesson 3 — Wrap', markdown: 'wrap body' },
];

const input: ManifestInput = {
  parentId: 'course-x',
  sourceKey: 'sha256:abc',
  derivedFrom: 'docs/resources/course-x.pdf',
  title: 'Course X',
  trust: 'untrusted',
  parts,
};

describe('isMultiPart', () => {
  it('is true for ≥2 parts, false otherwise', () => {
    expect(isMultiPart(parts)).toBe(true);
    expect(isMultiPart([parts[0]!])).toBe(false);
    expect(isMultiPart([])).toBe(false);
  });
});

describe('buildManifest (parent/child — a 12-lesson course never splits into orphans)', () => {
  it('emits exactly 1 manifest + N children', () => {
    const nodes = buildManifest(input);
    expect(nodes).toHaveLength(4);
    expect(nodes.filter((n) => n.role === 'manifest')).toHaveLength(1);
    expect(nodes.filter((n) => n.role === 'child')).toHaveLength(3);
  });

  it('manifest is the parent: part_of=null, order=null, id=parentId', () => {
    const [manifest] = buildManifest(input);
    expect(manifest).toMatchObject({
      id: 'course-x',
      part_of: null,
      order: null,
      role: 'manifest',
      title: 'Course X',
    });
  });

  it('children carry part_of=parentId and a 1-based order in source sequence', () => {
    const children = buildManifest(input).filter((n) => n.role === 'child');
    expect(children.map((c) => c.part_of)).toEqual(['course-x', 'course-x', 'course-x']);
    expect(children.map((c) => c.order)).toEqual([1, 2, 3]);
    expect(children.map((c) => c.title)).toEqual(['Lesson 1 — Intro', 'Lesson 2 — Core', 'Lesson 3 — Wrap']);
    expect(children.map((c) => c.markdown)).toEqual(['intro body', 'core body', 'wrap body']);
  });

  it('all nodes share the source provenance (source_key, derived_from, trust)', () => {
    for (const n of buildManifest(input)) {
      expect(n.source_key).toBe('sha256:abc');
      expect(n.derived_from).toBe('docs/resources/course-x.pdf');
      expect(n.trust).toBe('untrusted');
    }
  });

  it('manifest markdown is a MOC table-of-contents referencing every child in order', () => {
    const nodes = buildManifest(input);
    const manifest = nodes[0]!;
    const children = nodes.slice(1);
    for (const c of children) {
      expect(manifest.markdown).toContain(c.title);
      expect(manifest.markdown).toContain(`[[${c.id}]]`);
    }
    // ordered: Lesson 1 appears before Lesson 2
    expect(manifest.markdown.indexOf('Lesson 1')).toBeLessThan(manifest.markdown.indexOf('Lesson 2'));
  });

  it('accepts an injected child-id strategy', () => {
    const nodes = buildManifest(input, {
      childId: (parentId, order) => `${parentId}--c${order}`,
    });
    expect(nodes.filter((n) => n.role === 'child').map((c) => c.id)).toEqual([
      'course-x--c1',
      'course-x--c2',
      'course-x--c3',
    ]);
  });

  it('throws on a non-multi-part source (caller must gate with isMultiPart)', () => {
    expect(() => buildManifest({ ...input, parts: [parts[0]!] })).toThrow(/multi-part/i);
  });
});
