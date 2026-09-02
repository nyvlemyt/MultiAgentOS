import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildLibraryIndex,
  findDegenerateEntries,
  parseSkillFrontmatter,
  scanLibrarySkills,
} from './scanner.js';
import type { SkillMeta } from './types.js';

// Mirrors packages/skills/library/accessibility/SKILL.md — the real-world shape that
// broke the index on 2026-09-02: literal block description, folded block summary,
// provenance under a nested `metadata:` map.
const BLOCK_SCALAR_SKILL = [
  '---',
  'name: accessibility',
  'description: |',
  '  Design, implement, and audit inclusive digital products against WCAG 2.2 Level AA.',
  '  Do NOT use for visual/brand design choices (use frontend-design).',
  'summary: >-',
  '  WCAG 2.2 AA implementation + audit skill. Maps each UI component to POUR attributes',
  '  (Perceivable/Operable/Understandable/Robust). Process: identify role → perceivable.',
  'metadata:',
  '  origin: affaan-m/ecc',
  '  license: MIT',
  '  cluster: skill:core-eval',
  '  tier: T2',
  '  status: library',
  '---',
  '',
  '# Accessibility',
  '',
  'Full L2 body — never indexed.',
].join('\n');

describe('parseSkillFrontmatter', () => {
  it('resolves a literal block scalar (description: |) to its multi-line text', () => {
    const fm = parseSkillFrontmatter(BLOCK_SCALAR_SKILL);
    expect(fm['description']).toBe(
      'Design, implement, and audit inclusive digital products against WCAG 2.2 Level AA.\n' +
        'Do NOT use for visual/brand design choices (use frontend-design).\n',
    );
  });

  it('resolves a folded block scalar (summary: >-) to one line, no trailing newline', () => {
    const fm = parseSkillFrontmatter(BLOCK_SCALAR_SKILL);
    expect(fm['summary']).toBe(
      'WCAG 2.2 AA implementation + audit skill. Maps each UI component to POUR attributes ' +
        '(Perceivable/Operable/Understandable/Robust). Process: identify role → perceivable.',
    );
  });

  it('keeps nested maps nested, quoted strings intact, flow arrays as arrays', () => {
    const fm = parseSkillFrontmatter(BLOCK_SCALAR_SKILL);
    expect(fm['metadata']).toEqual({
      origin: 'affaan-m/ecc',
      license: 'MIT',
      cluster: 'skill:core-eval',
      tier: 'T2',
      status: 'library',
    });
    const quoted = parseSkillFrontmatter(
      '---\nname: x\ndescription: "Quoted: with a colon"\ntags: ["a","b"]\n---\nbody',
    );
    expect(quoted['description']).toBe('Quoted: with a colon');
    expect(quoted['tags']).toEqual(['a', 'b']);
  });

  it('returns {} when there is no frontmatter or the YAML is malformed', () => {
    expect(parseSkillFrontmatter('# just a heading')).toEqual({});
    expect(parseSkillFrontmatter('---\nname: [unclosed\n---\nbody', 'broken')).toEqual({});
  });
});

describe('findDegenerateEntries', () => {
  const healthy: SkillMeta = {
    id: 'ok',
    name: 'ok',
    description: 'Real description.',
    domain: 'planning',
    summary: 'Real summary.',
    tags: [],
    path: 'ok/SKILL.md',
  };

  it('returns [] for a healthy index', () => {
    expect(findDegenerateEntries([healthy])).toEqual([]);
  });

  it('flags bare YAML block indicators and blank fields, per field', () => {
    const suspects: SkillMeta[] = [
      { ...healthy, id: 'literal', description: '|' },
      { ...healthy, id: 'folded', summary: '>-' },
      { ...healthy, id: 'blank', description: '   ' },
      { ...healthy, id: 'empty', summary: '' },
    ];
    expect(findDegenerateEntries(suspects)).toEqual([
      { id: 'literal', field: 'description', value: '|' },
      { id: 'folded', field: 'summary', value: '>-' },
      { id: 'blank', field: 'description', value: '   ' },
      { id: 'empty', field: 'summary', value: '' },
    ]);
  });
});

describe('scanLibrarySkills on a block-scalar library (temp repo root)', () => {
  let root: string;

  function writeSkill(slug: string, content: string): void {
    const dir = join(root, 'packages', 'skills', 'library', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), content, 'utf8');
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'mas-skills-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('indexes the resolved description and summary, never the YAML indicator', () => {
    writeSkill('accessibility', BLOCK_SCALAR_SKILL);
    const metas = scanLibrarySkills(root);
    expect(metas).toHaveLength(1);
    const meta = metas[0]!;
    expect(meta.description).not.toBe('|');
    expect(meta.description).toContain('WCAG 2.2 Level AA');
    expect(meta.description.endsWith('\n')).toBe(false);
    expect(meta.summary).not.toBe('>-');
    expect(meta.summary).toContain('POUR attributes');
  });

  it('reads origin / cluster / tier from the nested metadata map', () => {
    writeSkill('accessibility', BLOCK_SCALAR_SKILL);
    const meta = scanLibrarySkills(root)[0]!;
    expect(meta.origin).toBe('affaan-m/ecc');
    expect(meta.cluster).toBe('skill:core-eval');
    expect(meta.tier).toBe('T2');
    expect(meta.domain).toBe('code-review'); // skill:core-eval → code-review
    expect(meta.tags).toEqual(['skill:core-eval']);
  });

  it('falls back to a one-line description when summary is absent', () => {
    writeSkill(
      'no-summary',
      ['---', 'name: no-summary', 'description: |', '  First line.', '  Second line.', 'metadata:', '  cluster: skill:eng-lang', '---', ''].join('\n'),
    );
    const meta = scanLibrarySkills(root)[0]!;
    expect(meta.description).toBe('First line.\nSecond line.');
    expect(meta.summary).toBe('First line. Second line.');
    expect(meta.domain).toBe('code-execution');
  });

  it('buildLibraryIndex refuses to write an index that has degenerate entries', () => {
    writeSkill('accessibility', BLOCK_SCALAR_SKILL);
    writeSkill('empty-shell', ['---', 'name: empty-shell', 'description: ""', '---', ''].join('\n'));
    expect(() => buildLibraryIndex(root)).toThrow(/empty-shell/);
    expect(existsSync(join(root, 'packages', 'skills', 'library', 'index.json'))).toBe(false);
  });
});
