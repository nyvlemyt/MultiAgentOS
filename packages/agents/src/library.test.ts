import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierBFiches, loadTierBFiche, TIER_B_DELEGATION_MAP } from './library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, '../../../.claude/agents');

const MAPPED_IDS = [
  'engineering-software-architect',
  'engineering-frontend-developer',
  'engineering-backend-architect',
  'design-ux-architect',
  'design-ui-designer',
  'engineering-technical-writer',
  'testing-performance-benchmarker',
  'testing-reality-checker',
];

const SKIPPED_DOCS = ['EXECUTIVE-BRIEF', 'QUICKSTART', 'nexus-strategy'];

describe('loadTierBFiches', () => {
  it('loads the 8 mapped agent fiches', () => {
    const fiches = loadTierBFiches(AGENTS_DIR);
    const ids = new Set(fiches.map((f) => f.id));
    for (const id of MAPPED_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it('skips docs lacking both name and description', () => {
    const fiches = loadTierBFiches(AGENTS_DIR);
    const ids = new Set(fiches.map((f) => f.id));
    for (const doc of SKIPPED_DOCS) {
      expect(ids.has(doc)).toBe(false);
    }
  });

  it('derives id from the filename without .md', () => {
    const fiches = loadTierBFiches(AGENTS_DIR);
    const fe = fiches.find((f) => f.id === 'engineering-frontend-developer');
    expect(fe).toBeDefined();
    expect(fe?.name).toBe('Frontend Developer');
    expect(fe?.body.length).toBeGreaterThan(0);
  });

  it('degrades to [] for a non-existent dir', () => {
    expect(loadTierBFiches('/no/such/dir/at/all')).toEqual([]);
  });
});

describe('loadTierBFiche', () => {
  it('loads a single mapped fiche by id', () => {
    const fiche = loadTierBFiche('design-ui-designer', AGENTS_DIR);
    expect(fiche.id).toBe('design-ui-designer');
    expect(fiche.name.length).toBeGreaterThan(0);
  });

  it('throws on an unknown id', () => {
    expect(() => loadTierBFiche('no-such-agent', AGENTS_DIR)).toThrow();
  });
});

describe('TIER_B_DELEGATION_MAP', () => {
  it('has exactly 9 entries', () => {
    expect(Object.keys(TIER_B_DELEGATION_MAP)).toHaveLength(9);
  });

  it('every fiche id resolves to a real fiche on disk', () => {
    for (const entry of Object.values(TIER_B_DELEGATION_MAP)) {
      const fiche = loadTierBFiche(entry.fiche, AGENTS_DIR);
      expect(fiche.id).toBe(entry.fiche);
    }
  });
});
