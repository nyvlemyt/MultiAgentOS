import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
  readdirSync,
  copyFileSync,
} from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
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

/**
 * Parse SKILL.md YAML frontmatter with a real YAML engine (gray-matter → js-yaml),
 * so block scalars (`description: |`, `summary: >-`), nested maps (`metadata:`) and
 * flow arrays resolve to their values. The former line-based parser stored the bare
 * indicator ("|", ">-") for 820 of 877 library skills (2026-09-02), blinding the
 * router. Malformed YAML → {} + warning: one bad file degrades to a degenerate
 * entry (caught by findDegenerateEntries) instead of aborting the whole scan.
 */
export function parseSkillFrontmatter(raw: string, id = '?'): Record<string, unknown> {
  try {
    // gray-matter memoizes by full file content when called WITHOUT options — an
    // empty options object opts out (877 files × body = pointless retention).
    const data: Record<string, unknown> = matter(raw, {}).data;
    return data;
  } catch (e) {
    const reason = e instanceof Error ? (e.message.split('\n')[0] ?? e.message) : String(e);
    console.warn(`[scanner] ${id}: unparseable frontmatter — ${reason}`);
    return {};
  }
}

/** L1 summaries are prompt-injected one per line: fold newlines + indentation into single spaces. */
function oneLine(s: string): string {
  return s.replaceAll(/\s+/g, ' ').trim();
}

const YAML_BLOCK_INDICATORS = new Set(['|', '|-', '|+', '>', '>-', '>+']);

export interface DegenerateEntry {
  id: string;
  field: 'description' | 'summary';
  value: string;
}

/**
 * An L1 entry is degenerate when its description or summary is blank or a bare YAML
 * block-scalar indicator — the exact symptom of the 2026-09-02 index bug. The router
 * reads only these two fields, so a degenerate entry is an invisible skill.
 */
export function findDegenerateEntries(metas: readonly SkillMeta[]): DegenerateEntry[] {
  const out: DegenerateEntry[] = [];
  for (const m of metas) {
    for (const field of ['description', 'summary'] as const) {
      const value = m[field].trim();
      if (value === '' || YAML_BLOCK_INDICATORS.has(value)) out.push({ id: m.id, field, value: m[field] });
    }
  }
  return out;
}

/** One-line report for guard/CLI messages: `id.field="value"`, capped at 10 entries. */
export function describeDegenerateEntries(entries: readonly DegenerateEntry[]): string {
  const shown = entries.slice(0, 10).map((d) => `${d.id}.${d.field}=${JSON.stringify(d.value)}`);
  if (entries.length > 10) shown.push(`… +${entries.length - 10} more`);
  return `${entries.length} degenerate L1 field(s): ${shown.join(', ')}`;
}

export function scanOrchestratorSkills(repoRoot: string): SkillMeta[] {
  const results: SkillMeta[] = [];
  for (const id of ORCHESTRATOR_SKILL_IDS) {
    const skillPath = join(repoRoot, '.claude', 'skills', id, 'SKILL.md');
    if (!existsSync(skillPath)) {
      console.warn(`[scanner] SKILL.md not found: ${skillPath}`);
      continue;
    }
    const fm = parseSkillFrontmatter(readFileSync(skillPath, 'utf8'), id);
    const description = str(fm['description']).trim();
    results.push({
      id,
      name: str(fm['name'], id),
      description,
      domain: coerceDomain(fm['domain'], id),
      summary: oneLine(str(fm['summary']) || description).slice(0, SUMMARY_MAX_CHARS),
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

/**
 * Harvest provenance (origin / cluster / tier) lives under a nested `metadata:` map
 * in every library SKILL.md; a top-level key is accepted as a legacy fallback.
 */
function libraryField(fm: Record<string, unknown>, key: string): string | undefined {
  const meta = fm['metadata'];
  const nested = isRecord(meta) ? meta[key] : undefined;
  return str(nested) || str(fm[key]) || undefined;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Parse one library SKILL.md into a SkillMeta (L1 — frontmatter only). */
function parseLibrarySkill(slug: string, skillPath: string): SkillMeta {
  const fm = parseSkillFrontmatter(readFileSync(skillPath, 'utf8'), slug);
  const cluster = libraryField(fm, 'cluster');
  const description = str(fm['description']).trim();
  return {
    id: slug,
    name: str(fm['name'], slug),
    description,
    domain: clusterToDomain(cluster),
    summary: oneLine(str(fm['summary']) || description).slice(0, SUMMARY_MAX_CHARS),
    tags: cluster ? [cluster] : [],
    path: skillPath,
    origin: libraryField(fm, 'origin'),
    cluster,
    tier: libraryField(fm, 'tier'),
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

/**
 * Generate packages/skills/library/index.json from the scanned library. Refuses to
 * write when any entry is degenerate (blank / bare YAML indicator): a broken index
 * silently blinds mas-skill-router, a loud build failure gets fixed.
 */
export function buildLibraryIndex(repoRoot: string): SkillMeta[] {
  const metas = scanLibrarySkills(repoRoot);
  const degenerate = findDegenerateEntries(metas);
  if (degenerate.length > 0) {
    throw new Error(`[buildLibraryIndex] refusing to write index.json — ${describeDegenerateEntries(degenerate)}`);
  }
  // Write atomically: index.json is a shared generated artifact that other
  // packages read at runtime (and concurrently, under the root test runner).
  // A plain write exposes readers to a truncated file; tmp + rename never does.
  const indexOut = join(repoRoot, LIBRARY_INDEX_REL);
  const tmpOut = `${indexOut}.tmp-${process.pid}`;
  writeFileSync(tmpOut, JSON.stringify(metas, null, 2) + '\n', 'utf8');
  renameSync(tmpOut, indexOut);
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
