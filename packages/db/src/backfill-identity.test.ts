import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { stampIdentity, allocateSlug, runBackfill } from './backfill-identity';

describe('stampIdentity (tier-1, zero-LLM, idempotent)', () => {
  const raw = '---\ntitle: X\n---\nbody';
  it('adds id/slug/source_key/lifecycle/trust/schema_version when absent', () => {
    const out = stampIdentity(raw, { path: 'docs/knowledge/x.md', contentHash: 'sha256:deadbeef' });
    expect(out.frontmatter.lifecycle).toBe('active');
    expect(out.frontmatter.trust).toBe('trusted');
    expect(out.frontmatter.schema_version).toBe('1');
    expect(out.frontmatter.source_key).toBe('sha256:deadbeef');
    expect(out.changed).toBe(true);
  });
  it('is idempotent — a second pass changes nothing', () => {
    const once = stampIdentity(raw, { path: 'docs/knowledge/x.md', contentHash: 'sha256:deadbeef' });
    const twice = stampIdentity(once.text, { path: 'docs/knowledge/x.md', contentHash: 'sha256:deadbeef' });
    expect(twice.changed).toBe(false);
    expect(twice.text).toBe(once.text);
  });
  it('never overwrites an existing immutable id (collision-suffixed slugs are caller-resolved)', () => {
    const withId = '---\nid: res-fixed\nslug: fixed\n---\nb';
    const out = stampIdentity(withId, { path: 'p.md', contentHash: 'sha256:x' });
    expect(out.frontmatter.id).toBe('res-fixed');
  });
  it('falls back to a hash-derived slug when kebab is empty (non-ASCII basename, no title/H1)', () => {
    const out = stampIdentity('---\n---\nbody', { path: '日本語.md', contentHash: 'sha256:abcd1234ef567890' });
    const slug = out.frontmatter.slug as string;
    expect(slug.length).toBeGreaterThan(0);
    expect(slug.startsWith('doc-')).toBe(true);
  });
});

describe('allocateSlug', () => {
  it('kebab-cases and suffixes collisions', () => {
    const taken = new Set(['anthropic-prompting']);
    expect(allocateSlug('Anthropic Prompting', taken)).toBe('anthropic-prompting-2');
  });
});

describe('runBackfill (filesystem)', () => {
  let dir: string;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('dry-run reports changes but leaves files byte-identical', () => {
    dir = mkdtempSync(join(tmpdir(), 'mas-bf-'));
    const a = join(dir, 'a.md');
    const b = join(dir, 'b.md');
    const aBytes = '---\ntitle: Alpha\n---\nalpha body';
    const bBytes = '# Beta\n\nbeta body';
    writeFileSync(a, aBytes, 'utf8');
    writeFileSync(b, bBytes, 'utf8');

    const res = runBackfill([dir], { dryRun: true });
    expect(res.changed).toBe(2);
    expect(readFileSync(a, 'utf8')).toBe(aBytes);
    expect(readFileSync(b, 'utf8')).toBe(bBytes);
  });

  it('apply stamps files then a second pass is idempotent', () => {
    dir = mkdtempSync(join(tmpdir(), 'mas-bf-'));
    const a = join(dir, 'a.md');
    const b = join(dir, 'b.md');
    writeFileSync(a, '---\ntitle: Alpha\n---\nalpha body', 'utf8');
    writeFileSync(b, '# Beta\n\nbeta body', 'utf8');

    const first = runBackfill([dir]);
    expect(first.changed).toBe(2);
    const aAfter = readFileSync(a, 'utf8');
    const bAfter = readFileSync(b, 'utf8');

    const second = runBackfill([dir]);
    expect(second).toEqual({ scanned: 2, changed: 0, errors: [] });
    expect(readFileSync(a, 'utf8')).toBe(aAfter);
    expect(readFileSync(b, 'utf8')).toBe(bAfter);
  });

  it('skips a missing root instead of throwing', () => {
    const res = runBackfill(['/no/such/dir-zzz']);
    expect(res).toEqual({ scanned: 0, changed: 0, errors: [] });
  });

  it('reserves an existing slug first, so a colliding doc gets the -2 suffix', () => {
    dir = mkdtempSync(join(tmpdir(), 'mas-bf-'));
    const owner = join(dir, 'a-owner.md');
    const other = join(dir, 'z-other.md');
    writeFileSync(owner, '---\nslug: widget\n---\n# Widget\n\nowner', 'utf8');
    writeFileSync(other, '# Widget\n\nother', 'utf8');

    runBackfill([dir]);

    expect(matter(readFileSync(owner, 'utf8')).data.slug).toBe('widget');
    expect(matter(readFileSync(other, 'utf8')).data.slug).toBe('widget-2');
  });
});
