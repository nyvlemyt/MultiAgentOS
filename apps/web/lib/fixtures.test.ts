import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_TIER_A } from '@mas/db';
import { tierAFixture, orbitNodes } from './fixtures';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

describe('tierAFixture ↔ seed roster sync', () => {
  it('covers exactly the Tier A ids seeded by @mas/db', () => {
    const fixtureIds = tierAFixture.map((a) => a.id).sort((x, y) => x.localeCompare(y));
    const seedIds = SEED_TIER_A.map((a) => a.id).sort((x, y) => x.localeCompare(y));
    expect(fixtureIds).toEqual(seedIds);
  });

  it('has an existing avatar SVG under public/avatars for every Tier A agent', () => {
    for (const a of tierAFixture) {
      expect(a.avatarPath, `${a.id} has no avatarPath`).toBeTruthy();
      const file = resolve(PUBLIC_DIR, a.avatarPath!.replace(/^\//, ''));
      expect(existsSync(file), `missing avatar file for ${a.id}: ${a.avatarPath}`).toBe(true);
    }
  });

  it('exposes every Tier A agent as an orbit node', () => {
    const nodeIds = new Set(orbitNodes.map((n) => n.id));
    for (const a of SEED_TIER_A) {
      expect(nodeIds.has(a.id), `orbitNodes misses ${a.id}`).toBe(true);
    }
  });
});
