import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './client';
import { projects } from './schema';
import { setupTempDb } from './testing';

setupTempDb();

describe('Phase 3.5b migration 0006 — projects.language', () => {
  it('defaults new rows to fr', async () => {
    const db = getDb();
    await db.insert(projects).values({
      id: 'p_default',
      name: 'Default',
      slug: 'default',
      path: join(tmpdir(), 'p'),
      type: 'other',
    });
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_default'));
    expect(row?.language).toBe('fr');
  });

  it('round-trips an en project', async () => {
    const db = getDb();
    await db.insert(projects).values({
      id: 'p_en',
      name: 'English',
      slug: 'english',
      path: join(tmpdir(), 'e'),
      type: 'other',
      language: 'en',
    });
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_en'));
    expect(row?.language).toBe('en');
  });

  it('backfills legacy rows (inserted without the column) to fr', async () => {
    const db = getDb();
    // Simulate a legacy row written before the column existed: write via raw SQL
    // omitting language; the column default must supply 'fr'.
    const legacyPath = join(tmpdir(), 'l');
    db.run(
      sql`INSERT INTO projects (id, name, slug, path, type, createdAt, lastActiveAt) VALUES ('p_legacy', 'Legacy', 'legacy', ${legacyPath}, 'other', 0, 0)`,
    );
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_legacy'));
    expect(row?.language).toBe('fr');
  });
});
