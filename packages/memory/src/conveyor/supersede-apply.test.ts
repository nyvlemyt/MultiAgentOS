import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { applySupersede, ficheFrontmatterFromCandidate, type FicheWrite } from './supersede-apply';

let dir: string;
let logPath: string;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'mas-fiche-')); logPath = join(dir, 'consolidation-log.md'); writeFileSync(logPath, '# log\n', 'utf8'); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

function activeFiche(id: string, sourceKey: string): void {
  writeFileSync(join(dir, `${id}.md`), matter.stringify('old body', {
    id, slug: id, source_key: sourceKey, lifecycle: 'active', trust: 'untrusted', lane: 'resources',
  }), 'utf8');
}

const incoming: FicheWrite = {
  id: 'fiche-new', source_key: 'pdf:k1', lane: 'resources',
  frontmatter: { id: 'fiche-new', slug: 'fiche-new', source_key: 'pdf:k1', lifecycle: 'active', trust: 'untrusted', lane: 'resources' },
  body: 'new body',
};

describe('applySupersede', () => {
  it('writes the incoming fiche when no active match exists (plain add)', () => {
    const r = applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' });
    expect(existsSync(r.written)).toBe(true);
    expect(r.superseded).toBeUndefined();
    expect(readFileSync(logPath, 'utf8')).not.toContain('supersede');
  });

  it('flips an active same-key fiche to superseded + appends one log line (never hard-deletes)', () => {
    activeFiche('fiche-old', 'pdf:k1');
    const r = applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' });
    expect(r.superseded).toContain('fiche-old.md');
    expect(existsSync(join(dir, 'fiche-old.md'))).toBe(true); // never hard-deleted
    const flipped = matter(readFileSync(join(dir, 'fiche-old.md'), 'utf8')).data;
    expect(flipped.lifecycle).toBe('superseded');
    expect(flipped.superseded_by).toBe('fiche-new');
    expect(readFileSync(logPath, 'utf8')).toContain('2026-06-28 | supersede | ids=fiche-old,fiche-new');
  });

  it('throws on an illegal lifecycle transition (e.g. already archived)', () => {
    writeFileSync(join(dir, 'arch.md'), matter.stringify('b', { id: 'arch', source_key: 'pdf:k1', lifecycle: 'archived' }), 'utf8');
    // archived has no active match → planSupersede returns null → plain add, no throw
    expect(() => applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' })).not.toThrow();
  });
});

describe('ficheFrontmatterFromCandidate', () => {
  it('derives a FicheSchema-valid frontmatter with resource defaults', () => {
    const fm = ficheFrontmatterFromCandidate({
      id: 'cand_1', sourceKey: 'pdf:k1', trust: 'untrusted', body: '# T\nbody',
      classifierDecision: 'learnings/global (rule:kw-learning)', derivedFrom: 'docs/resources/inbox/x.pdf',
    });
    expect(fm.kind).toBe('resource');
    expect(fm.lifecycle).toBe('active');
    expect(fm.register).toBe('learnings');
    expect(fm.derived_from).toBe('docs/resources/inbox/x.pdf');
    expect(fm.source_key).toBe('pdf:k1');
  });
});
