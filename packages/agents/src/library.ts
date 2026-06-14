import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export interface LibraryAgentFiche {
  id: string;
  name: string;
  description: string;
  color?: string;
  emoji?: string;
  vibe?: string;
  body: string;
  fichePath: string;
}

// Resolve the repo-root .claude/agents defensively, mirroring getSkillRouter()
// in dispatch.ts: under a bundler (Next webpack RSC) import.meta.url is not a
// file: URL, so fileURLToPath rejects — degrade to an empty list rather than
// crash. Tests and the worker pass an explicit dir.
function defaultFichesDir(): string | undefined {
  try {
    const here = fileURLToPath(new URL('.', import.meta.url));
    const repoRoot = resolve(here, '../../..');
    return resolve(repoRoot, '.claude/agents');
  } catch {
    return undefined;
  }
}

export function loadTierBFiches(dir: string = defaultFichesDir() ?? ''): LibraryAgentFiche[] {
  if (!dir) return [];
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const fiches: LibraryAgentFiche[] = [];
  for (const file of files) {
    const fullPath = join(dir, file);
    const { data, content } = matter(readFileSync(fullPath, 'utf-8'));
    const name = typeof data.name === 'string' ? data.name : undefined;
    const description = typeof data.description === 'string' ? data.description : undefined;
    // Skip non-agent docs (EXECUTIVE-BRIEF, QUICKSTART, nexus-strategy) that
    // lack both a name and a description frontmatter field.
    if (!name && !description) continue;
    fiches.push({
      id: file.slice(0, -'.md'.length),
      name: name ?? file.slice(0, -'.md'.length),
      description: description ?? '',
      color: typeof data.color === 'string' ? data.color : undefined,
      emoji: typeof data.emoji === 'string' ? data.emoji : undefined,
      vibe: typeof data.vibe === 'string' ? data.vibe : undefined,
      body: content.trim(),
      fichePath: fullPath,
    });
  }
  return fiches;
}

export function loadTierBFiche(id: string, dir?: string): LibraryAgentFiche {
  const fiche = loadTierBFiches(dir).find((f) => f.id === id);
  if (!fiche) throw new Error(`Tier B fiche not found: ${id}`);
  return fiche;
}

export interface DelegationEntry {
  readonly fiche: string;
  readonly calledBy: readonly string[];
  readonly useCase: string;
}

// The 8 MVP Tier B agents wired in this slice — the rows of AGENTS.md §6.
export const TIER_B_DELEGATION_MAP: Readonly<Record<string, DelegationEntry>> = {
  'engineering-software-architect': {
    fiche: 'engineering-software-architect',
    calledBy: ['Mission Planner', 'Architect'],
    useCase: 'ADRs, system design',
  },
  'engineering-frontend-developer': {
    fiche: 'engineering-frontend-developer',
    calledBy: ['Frontend Builder'],
    useCase: 'UI changes, components',
  },
  'engineering-backend-architect': {
    fiche: 'engineering-backend-architect',
    calledBy: ['Backend Builder'],
    useCase: 'API design, data flow',
  },
  'design-ux-architect': {
    fiche: 'design-ux-architect',
    calledBy: ['UX/UI Critic'],
    useCase: 'UX flow design',
  },
  'design-ui-designer': {
    fiche: 'design-ui-designer',
    calledBy: ['Frontend Builder', 'UX Critic'],
    useCase: 'Visual polish, component libraries',
  },
  'engineering-technical-writer': {
    fiche: 'engineering-technical-writer',
    calledBy: ['Docs Writer'],
    useCase: 'README, ADRs, user-facing docs',
  },
  'testing-performance-benchmarker': {
    fiche: 'testing-performance-benchmarker',
    calledBy: ['Reviewer'],
    useCase: 'Perf gates before validation',
  },
  'testing-reality-checker': {
    fiche: 'testing-reality-checker',
    calledBy: ['Reviewer', 'Sec Reviewer'],
    useCase: 'Default-to-needs-work gate before archive',
  },
};
