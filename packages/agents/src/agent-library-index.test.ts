import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanAgentLibrary, buildAgentLibraryIndex, loadAgentLibraryIndex } from './library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

describe('agent library index (ECC harvest mirror)', () => {
  it('scans the harvested Tier B fiches with id + role', () => {
    const metas = scanAgentLibrary(REPO_ROOT);
    expect(metas.length).toBeGreaterThanOrEqual(30);
    for (const m of metas) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
    }
  });

  it('build then load round-trips to the same metas', () => {
    const built = buildAgentLibraryIndex(REPO_ROOT);
    const loaded = loadAgentLibraryIndex(REPO_ROOT);
    expect(loaded).toEqual(built);
  });
});
