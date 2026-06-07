import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
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

/** Parse YAML frontmatter between --- markers without external deps. */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match || !match[1]) return {};
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
      name: String(fm['name'] ?? id),
      description: String(fm['description'] ?? ''),
      domain: coerceDomain(fm['domain'], id),
      summary: String(fm['summary'] ?? fm['description'] ?? '').slice(0, SUMMARY_MAX_CHARS),
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
