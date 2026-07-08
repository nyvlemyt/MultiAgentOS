import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { Fiche } from '../fiche';
import { writeDistilledFiche } from './distill-apply';

let dir: string;
let logPath: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mas-distill-'));
  logPath = join(dir, 'consolidation-log.md');
  writeFileSync(logPath, '# log\n', 'utf8');
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

function fiche(id: string, sourceKey: string): { frontmatter: Fiche; body: string } {
  return {
    frontmatter: {
      id, slug: id, source_key: sourceKey, part_of: null, order: null, manifest: null,
      derived_from: 'docs/resources/inbox/x.pdf', sources: [], lifecycle: 'distilled',
      superseded_by: null, trust: 'untrusted', ocr_confidence: null, retrieval_context: null,
      quality_score: null, kind: 'resource', register: 'learnings', scope: 'global',
      doc_type: 'reference', actionability: 'resource', lane: 'knowledge', schema_version: '1',
      tags: [],
    },
    body: '# X\n\n## Summary\n\nbody\n',
  };
}

function writeActive(id: string, sourceKey: string): void {
  writeFileSync(join(dir, `${id}.md`), matter.stringify('old', {
    id, slug: id, source_key: sourceKey, lifecycle: 'active', trust: 'trusted', lane: 'knowledge',
  }), 'utf8');
}

const opts = { date: '2026-07-08', keeper: 'memory-keeper' };

describe('writeDistilledFiche', () => {
  it('writes the fiche at distilled status (plain add, no collision)', () => {
    const r = writeDistilledFiche(dir, logPath, fiche('resource-a', 'pdf:a'), opts);
    expect(existsSync(r.written)).toBe(true);
    const data = matter(readFileSync(r.written, 'utf8')).data;
    expect(data.lifecycle).toBe('distilled');
    expect(r.supersedePending).toBeUndefined();
    expect(readFileSync(logPath, 'utf8')).not.toContain('supersede');
  });

  it('never auto-promotes: the written fiche stays distilled even if the model tried active', () => {
    const f = fiche('resource-b', 'pdf:b');
    // the frontmatter arrives already forced to distilled by distill(); the applier must not lift it.
    const r = writeDistilledFiche(dir, logPath, f, opts);
    expect(matter(readFileSync(r.written, 'utf8')).data.lifecycle).toBe('distilled');
  });

  it('routes a same-source collision through planSupersede WITHOUT overwriting the active fiche', () => {
    writeActive('resource-old', 'pdf:same');
    const r = writeDistilledFiche(dir, logPath, fiche('resource-new', 'pdf:same'), opts);
    // the active fiche is NOT touched (no silent overwrite, no auto-flip of a trusted fiche).
    const oldData = matter(readFileSync(join(dir, 'resource-old.md'), 'utf8')).data;
    expect(oldData.lifecycle).toBe('active');
    expect(existsSync(join(dir, 'resource-old.md'))).toBe(true); // never hard-deleted
    // a pending supersede is recorded (visible), naming both ids.
    expect(r.supersedePending).toMatchObject({ supersededId: 'resource-old', supersededBy: 'resource-new' });
    expect(readFileSync(logPath, 'utf8')).toContain('supersede-pending');
    expect(readFileSync(logPath, 'utf8')).toContain('resource-old,resource-new');
  });

  it('re-distilling the same id overwrites its own draft in place (not a supersede)', () => {
    writeDistilledFiche(dir, logPath, fiche('resource-c', 'pdf:c'), opts);
    const r = writeDistilledFiche(dir, logPath, fiche('resource-c', 'pdf:c'), opts);
    expect(r.supersedePending).toBeUndefined(); // same id ≠ supersede (no cycle)
    expect(readFileSync(logPath, 'utf8')).not.toContain('supersede');
  });
});
