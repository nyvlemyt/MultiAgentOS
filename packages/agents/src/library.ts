import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type { DomainScope } from '@mas/skills';

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

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

// Parse a single fiche file. Returns undefined for non-agent docs
// (EXECUTIVE-BRIEF, QUICKSTART, nexus-strategy) lacking both name + description.
function parseFiche(dir: string, file: string): LibraryAgentFiche | undefined {
  const fullPath = join(dir, file);
  const { data, content } = matter(readFileSync(fullPath, 'utf-8'));
  const name = str(data.name);
  const description = str(data.description);
  if (!name && !description) return undefined;
  const id = file.slice(0, -'.md'.length);
  return {
    id,
    name: name ?? id,
    description: description ?? '',
    color: str(data.color),
    emoji: str(data.emoji),
    vibe: str(data.vibe),
    body: content.trim(),
    fichePath: fullPath,
  };
}

export function loadTierBFiches(dir: string = defaultFichesDir() ?? ''): LibraryAgentFiche[] {
  if (!dir) return [];
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  return files
    .map((file) => parseFiche(dir, file))
    .filter((f): f is LibraryAgentFiche => f !== undefined);
}

export function loadTierBFiche(id: string, dir?: string): LibraryAgentFiche {
  const fiche = loadTierBFiches(dir).find((f) => f.id === id);
  if (!fiche) throw new Error(`Tier B fiche not found: ${id}`);
  return fiche;
}

// ----------------------------------------------------------------------------
// Cold agent-library arsenal (ECC harvest) — mirror of the skills library index
// (packages/skills/src/scanner.ts). The harvested Tier B fiches live in
// packages/agents/library/<id>.md and are NOT auto-registered; they are scanned
// into a router-readable index.json and loaded on demand. The index.json is a
// GENERATED build artifact (regen via `pnpm --filter @mas/agents build-library-index`)
// and is gitignored (see CLAUDE.md §3).
// ----------------------------------------------------------------------------

const AGENT_LIBRARY_REL = join('packages', 'agents', 'library');
const AGENT_LIBRARY_INDEX_REL = join(AGENT_LIBRARY_REL, 'index.json');

export interface AgentLibraryMeta {
  id: string;
  name: string;
  role: string;
  tier?: string;
  domains: string[];
  emoji?: string;
  path: string;
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** Parse one library fiche into L1 metadata (frontmatter only). */
function parseLibraryFiche(file: string, fullPath: string): AgentLibraryMeta | undefined {
  let data: Record<string, unknown>;
  try {
    data = matter(readFileSync(fullPath, 'utf-8')).data;
  } catch {
    // Malformed YAML frontmatter — skip rather than crash the whole scan.
    return undefined;
  }
  const id = str(data.id) ?? file.slice(0, -'.md'.length);
  const name = str(data.name);
  const role = str(data.role) ?? str(data.description);
  if (!name && !role) return undefined;
  return {
    id,
    name: name ?? id,
    role: role ?? '',
    tier: str(data.tier),
    domains: strArray(data.domains),
    emoji: str(data.emoji),
    path: fullPath,
  };
}

/** Scan every packages/agents/library/<id>.md into L1 AgentLibraryMeta[]. */
export function scanAgentLibrary(repoRoot: string): AgentLibraryMeta[] {
  const dir = join(repoRoot, AGENT_LIBRARY_REL);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseLibraryFiche(f, join(dir, f)))
    .filter((m): m is AgentLibraryMeta => m !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Generate packages/agents/library/index.json from the scanned library. */
export function buildAgentLibraryIndex(repoRoot: string): AgentLibraryMeta[] {
  const metas = scanAgentLibrary(repoRoot);
  writeFileSync(
    join(repoRoot, AGENT_LIBRARY_INDEX_REL),
    JSON.stringify(metas, null, 2) + '\n',
    'utf8',
  );
  return metas;
}

/** Cheap runtime path: read the prebuilt agent index.json (no per-file scan). */
export function loadAgentLibraryIndex(repoRoot: string): AgentLibraryMeta[] {
  const indexPath = join(repoRoot, AGENT_LIBRARY_INDEX_REL);
  if (!existsSync(indexPath)) return [];
  return JSON.parse(readFileSync(indexPath, 'utf8')) as AgentLibraryMeta[];
}

export interface DelegationEntry {
  readonly fiche: string;
  readonly calledBy: readonly string[];
  readonly useCase: string;
  /**
   * Which slice of the cold arsenal this agent draws from (Wave 2). Absent ⇒
   * empty scope ⇒ the whole arsenal is eligible. Passed to selectLibrarySkills.
   */
  readonly scope?: DomainScope;
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
  // Wave 2 pilot — proves the cold arsenal is live. Scope is the UNION of the
  // 10 domain:'security' skills (cluster skill:core-security) and the 657
  // cyber:* skills (domain:'planning'), per selectLibrarySkills' scope semantics.
  'security-defensive-specialist': {
    fiche: 'security-defensive-specialist',
    calledBy: ['Mission Planner', 'Sec Reviewer'],
    useCase: 'Defensive cyber tasks: detection, mitigation, hardening, analysis',
    scope: { domain: 'security', clusterPrefix: 'cyber:' },
  },
};

/**
 * Resolve an agent's arsenal scope. Pure + deterministic: unknown agent or an
 * agent with no declared scope ⇒ empty scope (whole arsenal eligible).
 */
export function domainScopeFor(agentId: string | undefined | null): DomainScope {
  if (!agentId) return {};
  return TIER_B_DELEGATION_MAP[agentId]?.scope ?? {};
}
