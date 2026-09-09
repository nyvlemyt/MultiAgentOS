import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import { backfillDir, backfillProvenance } from './provenance-backfill-cli';

const HASH = 'f'.repeat(64);
const ADDRESS = `sha256:${HASH}`;

function fiche(derivedFrom: string | null, sourceKey: string = ADDRESS): string {
  const fm = {
    id: 'resource-x-ffffffff', slug: 'resource-x-ffffffff', source_key: sourceKey,
    ...(derivedFrom === null ? {} : { derived_from: derivedFrom }),
    lifecycle: 'distilled', trust: 'untrusted', schema_version: '1',
  };
  return matter.stringify('# X\n\nbody stays intact.\n', fm);
}

describe('backfillProvenance (one fiche)', () => {
  it('rewrites a machine-local absolute derived_from to the fiche own source_key', () => {
    const raw = fiche('/Users/melvyn/repo/data/sas/quai/x.md');
    const r = backfillProvenance(raw);
    expect(r.changed).toBe(true);
    const { data, content } = matter(r.out);
    expect(data.derived_from).toBe(ADDRESS);
    expect(content).toContain('body stays intact.');
  });

  it('rewrites a Windows-absolute derived_from too (two-machine corpus)', () => {
    const r = backfillProvenance(fiche('C:\\repo\\data\\sas\\quai\\x.md'));
    expect(r.changed).toBe(true);
    expect(matter(r.out).data.derived_from).toBe(ADDRESS);
  });

  it('is idempotent: a portable derived_from passes through byte-identical', () => {
    const first = backfillProvenance(fiche('/abs/path/x.md'));
    const second = backfillProvenance(first.out);
    expect(second.changed).toBe(false);
    expect(second.out).toBe(first.out);
  });

  it('leaves a fiche without derived_from untouched', () => {
    const raw = fiche(null);
    const r = backfillProvenance(raw);
    expect(r.changed).toBe(false);
    expect(r.out).toBe(raw);
  });

  it('leaves a repo-relative derived_from (legacy docs/resources path) untouched', () => {
    const raw = fiche('docs/resources/raw.md');
    const r = backfillProvenance(raw);
    expect(r.changed).toBe(false);
    expect(r.out).toBe(raw);
  });

  it('reports (never silently skips) an absolute derived_from with no usable source_key', () => {
    const r = backfillProvenance(fiche('/abs/path/x.md', 'not-a-content-address'));
    expect(r.changed).toBe(false);
    expect(r.error).toMatch(/source_key/);
  });
});

describe('backfillDir (replayable batch)', () => {
  let dir: string;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'mas-provenance-')); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('rewrites only the broken fiches and is a no-op on the second run', () => {
    writeFileSync(join(dir, 'broken.md'), fiche('/abs/data/sas/quai/x.md'), 'utf8');
    writeFileSync(join(dir, 'clean.md'), fiche(ADDRESS), 'utf8');
    writeFileSync(join(dir, 'notes.txt'), 'not markdown', 'utf8');

    const first = backfillDir(dir);
    expect(first.rewritten).toEqual([join(dir, 'broken.md')]);
    expect(first.untouched).toBe(1);
    expect(first.failed).toEqual([]);
    expect(matter(readFileSync(join(dir, 'broken.md'), 'utf8')).data.derived_from).toBe(ADDRESS);

    const second = backfillDir(dir);
    expect(second.rewritten).toEqual([]);
    expect(second.untouched).toBe(2);
  });

  it('surfaces per-file failures without stopping the batch', () => {
    writeFileSync(join(dir, 'bad.md'), fiche('/abs/x.md', ''), 'utf8');
    writeFileSync(join(dir, 'ok.md'), fiche('/abs/y.md'), 'utf8');
    const r = backfillDir(dir);
    expect(r.rewritten).toEqual([join(dir, 'ok.md')]);
    expect(r.failed).toHaveLength(1);
    expect(r.failed[0]!.file).toBe(join(dir, 'bad.md'));
  });
});
