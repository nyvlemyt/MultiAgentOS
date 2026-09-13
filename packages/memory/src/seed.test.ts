import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryStore, MEMORY_KEEPER_AGENT } from './registers';
import { seedGlobalKnowledge, runSeed } from './seed';
import { FtsRetriever } from './retriever';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = resolve(__dirname, '../../..', 'docs/knowledge');

let root: string;
function keeperStore() {
  return new MemoryStore({ root, writerAgent: MEMORY_KEEPER_AGENT });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-seed-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('seedGlobalKnowledge (persistence bridge)', () => {
  it('imports every docs/knowledge .md (incl. vibeflow/INDEX) with source provenance', () => {
    const res = seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    expect(res.imported.length).toBeGreaterThanOrEqual(17);
    expect(res.imported.some((s) => s.endsWith('vibeflow/INDEX.md'))).toBe(true);
    const docs = keeperStore().knowledgeDocs();
    expect(docs.every((d) => d.source.includes('docs/knowledge'))).toBe(true);
  });

  it('is idempotent — re-running creates no duplicate docs', () => {
    seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    const after1 = keeperStore().knowledgeDocs().length;
    const res2 = seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    expect(res2.skipped.length).toBeGreaterThan(0);
    expect(keeperStore().knowledgeDocs()).toHaveLength(after1);
  });

  it('BRIDGE GATE: every build-time fact is retrievable from runtime memory', () => {
    seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    const r = new FtsRetriever();
    r.index(keeperStore().allDocs());
    for (const fact of ['BDR', 'Mem0 cloud', '95% builders', '40% Gartner']) {
      const hits = r.query(fact);
      expect(hits.length, `fact not retrievable: "${fact}"`).toBeGreaterThan(0);
      expect(hits[0]!.source, `fact "${fact}" not traced to knowledge`).toContain('docs/knowledge');
    }
  });

  it('the write path is Keeper-locked (seed via a non-Keeper store throws)', () => {
    const intruder = new MemoryStore({ root, writerAgent: 'mission-planner' });
    expect(() => seedGlobalKnowledge(intruder, KNOWLEDGE_DIR)).toThrow();
  });
});

describe('runSeed (bridge runner — builds the Keeper store internally)', () => {
  it('seeds knowledge into memoryRoot and is idempotent', () => {
    const res = runSeed({ memoryRoot: root, knowledgeDir: KNOWLEDGE_DIR });
    expect(res.imported.length).toBeGreaterThanOrEqual(17);
    const count = keeperStore().knowledgeDocs().length;

    const res2 = runSeed({ memoryRoot: root, knowledgeDir: KNOWLEDGE_DIR });
    expect(res2.imported).toHaveLength(0);
    expect(res2.skipped.length).toBeGreaterThan(0);
    expect(keeperStore().knowledgeDocs()).toHaveLength(count);
  });
});

describe('routage études vs savoir mission (P1-14, décision 2026-08-31)', () => {
  const CURATED = '---\nid: fiche-pattern\nlifecycle: active\ntrust: trusted\n---\n\n# Patterns agents\n';
  const COURS = '---\nid: fiche-cours\nlifecycle: distilled\ntrust: untrusted\n---\n\n# S5 - Théorie du signal — Fourier\n';

  function makeDirs() {
    const kn = join(root, 'kn');
    const etudes = join(root, 'etudes');
    mkdirSync(kn, { recursive: true });
    writeFileSync(join(kn, 'pattern.md'), CURATED, 'utf8');
    writeFileSync(join(kn, 'cours.md'), COURS, 'utf8');
    return { kn, etudes };
  }

  it('une fiche untrusted non promue part dans le miroir études, pas dans la mémoire mission', () => {
    const { kn, etudes } = makeDirs();
    const res = seedGlobalKnowledge(keeperStore(), kn, etudes);
    expect(res.imported).toHaveLength(1);
    expect(res.etudes).toHaveLength(1);
    const missionDocs = keeperStore().knowledgeDocs();
    expect(missionDocs).toHaveLength(1);
    expect(missionDocs[0]!.body).toContain('Patterns agents');
    expect(existsSync(join(etudes, 'docs__knowledge__cours.md'))).toBe(true);
  });

  it('le miroir études garde un frontmatter lisible (provenance après le bloc ---)', () => {
    const { kn, etudes } = makeDirs();
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    const f = readdirSync(etudes).find((n) => n.endsWith('cours.md'))!;
    const raw = readFileSync(join(etudes, f), 'utf8');
    expect(raw.startsWith('---\n')).toBe(true);
    expect(raw).toContain('<!-- source: ');
  });

  it('routage idempotent — un second seed ne duplique rien', () => {
    const { kn, etudes } = makeDirs();
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    const res2 = seedGlobalKnowledge(keeperStore(), kn, etudes);
    expect(res2.imported).toHaveLength(0);
    expect(res2.etudes).toHaveLength(0);
    expect(readdirSync(etudes)).toHaveLength(1);
  });

  it('une fiche promue MIGRE : elle entre en mémoire mission ET quitte le miroir études', () => {
    const { kn, etudes } = makeDirs();
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    const mirrored = join(etudes, 'docs__knowledge__cours.md');
    expect(existsSync(mirrored)).toBe(true);

    // La promotion (mas promote) fait passer la fiche à `active` dans docs/knowledge.
    writeFileSync(join(kn, 'cours.md'), COURS.replace('lifecycle: distilled', 'lifecycle: active'), 'utf8');
    const res = seedGlobalKnowledge(keeperStore(), kn, etudes);

    expect(res.imported).toContain('docs/knowledge/cours.md');
    expect(res.migrated).toContain('docs/knowledge/cours.md');
    expect(existsSync(mirrored)).toBe(false); // plus de jumeau obsolète
    const missionDocs = keeperStore().knowledgeDocs();
    expect(missionDocs.some((d) => d.body.includes('Fourier'))).toBe(true);
  });

  it('la migration est idempotente — un troisième seed ne re-signale rien', () => {
    const { kn, etudes } = makeDirs();
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    writeFileSync(join(kn, 'cours.md'), COURS.replace('lifecycle: distilled', 'lifecycle: active'), 'utf8');
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    const res3 = seedGlobalKnowledge(keeperStore(), kn, etudes);
    expect(res3.migrated).toEqual([]);
    expect(res3.imported).toEqual([]);
  });

  it('une fiche encore distilled ne migre pas (le miroir reste la seule copie)', () => {
    const { kn, etudes } = makeDirs();
    seedGlobalKnowledge(keeperStore(), kn, etudes);
    const res2 = seedGlobalKnowledge(keeperStore(), kn, etudes);
    expect(res2.migrated).toEqual([]);
    expect(existsSync(join(etudes, 'docs__knowledge__cours.md'))).toBe(true);
    expect(keeperStore().knowledgeDocs().some((d) => d.body.includes('Fourier'))).toBe(false);
  });

  it('sans frontmatter (fichier curé historique) → mémoire mission', () => {
    const kn = join(root, 'kn2');
    mkdirSync(kn, { recursive: true });
    writeFileSync(join(kn, 'legacy.md'), '# Doctrine projet\n\nfait durable.', 'utf8');
    const res = seedGlobalKnowledge(keeperStore(), kn, join(root, 'etudes2'));
    expect(res.imported).toHaveLength(1);
    expect(res.etudes).toHaveLength(0);
  });
});
