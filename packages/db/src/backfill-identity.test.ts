import { describe, it, expect } from 'vitest';
import { stampIdentity, allocateSlug } from './backfill-identity';

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
});

describe('allocateSlug', () => {
  it('kebab-cases and suffixes collisions', () => {
    const taken = new Set(['anthropic-prompting']);
    expect(allocateSlug('Anthropic Prompting', taken)).toBe('anthropic-prompting-2');
  });
});
