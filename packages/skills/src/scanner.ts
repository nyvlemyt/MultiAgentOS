import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type { SkillMeta, Domain } from './types.js';

export const ORCHESTRATOR_SKILL_IDS = [
  'mas-mission-planner',
  'mas-skill-router',
  'mas-context-manager',
  'mas-memory-keeper',
  'mas-reviewer',
  'mas-sec-reviewer',
] as const;

const VALID_DOMAINS: readonly Domain[] = [
  'research', 'code-execution', 'code-review', 'planning',
  'memory', 'security', 'ux', 'writing', 'search',
];

/** Validate a frontmatter domain against the fixed taxonomy; warn + fall back instead of casting blindly. */
function coerceDomain(raw: unknown, id: string): Domain {
  if (typeof raw === 'string' && (VALID_DOMAINS as readonly string[]).includes(raw)) {
    return raw as Domain;
  }
  console.warn(`[scanner] ${id}: invalid/missing domain "${String(raw)}" — defaulting to 'planning'`);
  return 'planning';
}

// L1 summary budget is ≤200 tokens (CLAUDE.md §6/§12); ~800 chars is a safe ceiling.
const SUMMARY_MAX_CHARS = 800;

/** Coerce an unknown frontmatter value to a string (avoids "[object Object]"). */
function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return fallback;
}

/** Parse YAML frontmatter between --- markers without external deps. */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match?.[1]) return {};
  const fm: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val.startsWith('[')) {
      try { fm[key] = JSON.parse(val); } catch { fm[key] = val; }
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

export function scanOrchestratorSkills(repoRoot: string): SkillMeta[] {
  const results: SkillMeta[] = [];
  for (const id of ORCHESTRATOR_SKILL_IDS) {
    const skillPath = join(repoRoot, '.claude', 'skills', id, 'SKILL.md');
    if (!existsSync(skillPath)) {
      console.warn(`[scanner] SKILL.md not found: ${skillPath}`);
      continue;
    }
    const raw = readFileSync(skillPath, 'utf8');
    const fm = parseFrontmatter(raw);
    results.push({
      id,
      name: str(fm['name'], id),
      description: str(fm['description']),
      domain: coerceDomain(fm['domain'], id),
      summary: (str(fm['summary']) || str(fm['description'])).slice(0, SUMMARY_MAX_CHARS),
      tags: Array.isArray(fm['tags']) ? fm['tags'].map(String) : [],
      path: skillPath,
    });
  }
  return results;
}

export function writeSummaryCache(cacheDir: string, meta: SkillMeta): void {
  const dir = join(cacheDir, meta.id);
  mkdirSync(dir, { recursive: true });
  const content = [
    '---',
    `domain: ${meta.domain}`,
    `tags: ${JSON.stringify(meta.tags)}`,
    '---',
    '',
    meta.summary,
    '',
  ].join('\n');
  writeFileSync(join(dir, 'summary.md'), content, 'utf8');
}

// ----------------------------------------------------------------------------
// Cold-library arsenal (ECC harvest) — see ADR 0005.
// The 220 boosted SKILL.md files live in packages/skills/library/<slug>/ and are
// NOT auto-injected into .claude/skills/ (TOKEN_STRATEGY §6). They are scanned
// into a router-readable index.json and promoted to active on demand.
// ----------------------------------------------------------------------------

const LIBRARY_REL = join('packages', 'skills', 'library');
const LIBRARY_INDEX_REL = join(LIBRARY_REL, 'index.json');

/** Library harvest clusters → the fixed 9-domain router taxonomy. */
const CLUSTER_DOMAIN: Record<string, Domain> = {
  'skill:core-agent': 'planning',
  'skill:core-eval': 'code-review',
  'skill:core-security': 'security',
  'skill:core-memory': 'memory',
  'skill:core-research': 'research',
  'skill:core-skills-mgmt': 'planning',
  'skill:core-token': 'planning',
  'skill:eng-arch': 'code-execution',
  'skill:eng-lang': 'code-execution',
  'skill:data-ml': 'code-execution',
  'skill:misc': 'writing',
  'skill:vertical': 'research',
};

/** Map a library cluster tag to a router domain; unknown/missing → 'planning'. */
export function clusterToDomain(cluster: string | undefined): Domain {
  if (cluster && cluster in CLUSTER_DOMAIN) return CLUSTER_DOMAIN[cluster]!;
  return 'planning';
}

/** Parse one library SKILL.md into a SkillMeta (L1 — frontmatter only). */
function parseLibrarySkill(slug: string, skillPath: string): SkillMeta {
  const fm = parseFrontmatter(readFileSync(skillPath, 'utf8'));
  const cluster = str(fm['cluster']) || undefined;
  return {
    id: slug,
    name: str(fm['name'], slug),
    description: str(fm['description']),
    domain: clusterToDomain(cluster),
    summary: (str(fm['summary']) || str(fm['description'])).slice(0, SUMMARY_MAX_CHARS),
    tags: cluster ? [cluster] : [],
    path: skillPath,
    origin: str(fm['origin']) || undefined,
    cluster,
    tier: str(fm['tier']) || undefined,
  };
}

/** Scan every packages/skills/library/<slug>/SKILL.md into L1 SkillMeta[]. */
export function scanLibrarySkills(repoRoot: string): SkillMeta[] {
  const libDir = join(repoRoot, LIBRARY_REL);
  if (!existsSync(libDir)) return [];
  const results: SkillMeta[] = [];
  for (const entry of readdirSync(libDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillPath = join(libDir, entry.name, 'SKILL.md');
    if (!existsSync(skillPath)) continue;
    results.push(parseLibrarySkill(entry.name, skillPath));
  }
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

/** Generate packages/skills/library/index.json from the scanned library. */
export function buildLibraryIndex(repoRoot: string): SkillMeta[] {
  const metas = scanLibrarySkills(repoRoot);
  writeFileSync(
    join(repoRoot, LIBRARY_INDEX_REL),
    JSON.stringify(metas, null, 2) + '\n',
    'utf8',
  );
  return metas;
}

/** Cheap runtime path: read the prebuilt index.json (no per-file scan). */
export function loadLibraryIndex(repoRoot: string): SkillMeta[] {
  const indexPath = join(repoRoot, LIBRARY_INDEX_REL);
  if (!existsSync(indexPath)) return [];
  return JSON.parse(readFileSync(indexPath, 'utf8')) as SkillMeta[];
}

/**
 * Promote a cold library skill to an active Claude Code skill by copying its
 * SKILL.md into .claude/skills/<slug>/. This is the on-demand opposite of the
 * library's default cold state (ADR 0005). Returns the destination path.
 */
export function promoteSkill(repoRoot: string, slug: string): string {
  const src = join(repoRoot, LIBRARY_REL, slug, 'SKILL.md');
  if (!existsSync(src)) {
    throw new Error(`[promoteSkill] library skill not found: ${slug}`);
  }
  const destDir = join(repoRoot, '.claude', 'skills', slug);
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, 'SKILL.md');
  copyFileSync(src, dest);
  return dest;
}
