import { describe, it, expect, beforeEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getDb, projects } from '@mas/db';
import { setupTempDb } from '@mas/db/testing';
import { setProjectLanguage, PROJECT_LANGUAGES } from './projects';

setupTempDb();
beforeEach(async () => {
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
});

describe('setProjectLanguage', () => {
  it('persists en and returns the updated project', async () => {
    const proj = await setProjectLanguage(getDb(), 'p1', 'en');
    expect(proj?.language).toBe('en');
    const [row] = await getDb().select().from(projects);
    expect(row?.language).toBe('en');
  });

  it('returns null for an unknown project id', async () => {
    const proj = await setProjectLanguage(getDb(), 'nope', 'en');
    expect(proj).toBeNull();
  });

  it('exposes the supported language enum', () => {
    expect(PROJECT_LANGUAGES).toEqual(['fr', 'en']);
  });
});
