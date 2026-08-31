import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { MemoryStore, MEMORY_KEEPER_AGENT, withProvenance } from './registers';

export interface SeedResult {
  imported: string[];
  skipped: string[];
  /** Fiches routées vers le miroir études (P1-14) — hors contexte mission. */
  etudes: string[];
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const MISSION_GRADE = new Set(['active', 'audited']);

/**
 * P1-14 (décision 2026-08-31) : une fiche `untrusted` non promue est du STOCK
 * (cours, matière ingérée) — elle ne doit pas entrer dans le contexte mission.
 * Le tri suit le cycle de vie, pas une taxonomie nouvelle : promouvoir la fiche
 * (`active`/`audited`, P1-6) la fait migrer vers la mémoire mission au seed suivant.
 * Un fichier sans frontmatter est du savoir curé historique → mission.
 */
function isEtude(content: string): boolean {
  try {
    const d = matter(content).data as Record<string, unknown>;
    if (typeof d.lifecycle !== 'string') return false;
    return d.trust === 'untrusted' && !MISSION_GRADE.has(d.lifecycle);
  } catch {
    return false;
  }
}

function etudeFile(etudesRoot: string, source: string): string {
  const flat = source.replaceAll(/[/\\]/g, '__');
  return join(etudesRoot, flat.endsWith('.md') ? flat : `${flat}.md`);
}

/**
 * PERSISTENCE BRIDGE (CLAUDE.md §13, ADR 0003). Idempotently import every
 * docs/knowledge/*.md (incl. vibeflow/INDEX.md) into data/memory/_global/knowledge/
 * with `source:` provenance, so build-time knowledge flows into runtime memory.
 * Fiches études (cf. isEtude) sont miroir-ées à part sous `etudesRoot` — indexées
 * par la collection QMD `mas-etudes`, jamais par le contexte mission.
 * Re-running skips files already present — no duplicates.
 */
export function seedGlobalKnowledge(store: MemoryStore, knowledgeDir: string, etudesRoot?: string): SeedResult {
  const imported: string[] = [];
  const skipped: string[] = [];
  const etudes: string[] = [];
  for (const file of walkMd(knowledgeDir).sort((a, b) => a.localeCompare(b))) {
    const rel = relative(knowledgeDir, file).replaceAll(/[/\\]/g, '/');
    const source = `docs/knowledge/${rel}`;
    const content = readFileSync(file, 'utf8');
    if (etudesRoot !== undefined && isEtude(content)) {
      const target = etudeFile(etudesRoot, source);
      if (existsSync(target)) {
        skipped.push(source);
        continue;
      }
      mkdirSync(etudesRoot, { recursive: true });
      writeFileSync(target, withProvenance(source, content), 'utf8');
      etudes.push(source);
      continue;
    }
    if (store.hasKnowledge(source)) {
      skipped.push(source);
      continue;
    }
    store.writeKnowledge(source, content);
    imported.push(source);
  }
  return { imported, skipped, etudes };
}

export interface RunSeedOpts {
  /** Root of the memory store, e.g. data/memory. */
  memoryRoot: string;
  /** Directory of build-time knowledge to import, e.g. docs/knowledge. */
  knowledgeDir: string;
  /** Miroir études (P1-14). Défaut : dossier `etudes` voisin du memory root (data/etudes). */
  etudesRoot?: string;
}

/**
 * Bridge runner: construct a Keeper-identity MemoryStore and seed it. The store
 * is built here (not passed in) so callers (CLI, worker bootstrap) cannot smuggle
 * a non-Keeper writer past the §8 lock.
 */
export function runSeed({ memoryRoot, knowledgeDir, etudesRoot }: RunSeedOpts): SeedResult {
  const store = new MemoryStore({ root: memoryRoot, writerAgent: MEMORY_KEEPER_AGENT });
  return seedGlobalKnowledge(store, knowledgeDir, etudesRoot ?? join(memoryRoot, '..', 'etudes'));
}
