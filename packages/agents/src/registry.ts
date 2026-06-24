import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';

export interface AgentFiche {
  id: string;
  name: string;
  emoji?: string;
  avatar?: string;
  tier: 'A' | 'B';
  role: string;
  domains: string[];
  responsibilities: string[];
  limits: string[];
  favorite_skills: string[];
  required_skills: string[];
  permissions: { fs_write: string | boolean; shell: boolean | string; network: string | boolean };
  budget: { default_tokens: number; model: string };
  quality_criteria: string[];
  output_format: 'json' | 'markdown' | 'patch';
  common_mistakes: string[];
  escalate_when: string[];
  status_visible?: boolean;
  body: string;
  fichePath: string;
}

const FICHES_DIR = resolve(process.cwd(), 'packages/agents/fiches');

// Mandatory frontmatter keys per the canonical Tier A schema (AGENTS.md §2).
// `emoji`, `avatar`, `status_visible` are optional and excluded on purpose.
// String keys must be non-empty; array keys must be non-empty arrays; object
// keys (permissions/budget) must be objects. This is the runtime guard AGENTS.md
// §10 promises (Phase 9 · 0c, finding U3) — U1 (a mandatory key silently missing)
// proved typing alone catches nothing.
const STRING_KEYS = ['id', 'name', 'tier', 'role', 'output_format'] as const;
const ARRAY_KEYS = [
  'domains',
  'responsibilities',
  'limits',
  'favorite_skills',
  'required_skills',
  'quality_criteria',
  'common_mistakes',
  'escalate_when',
] as const;
const OBJECT_KEYS = ['permissions', 'budget'] as const;
// `permissions` must carry these three sub-keys — the §5 risk gate reads them to
// decide what an agent may do. A typing-clean fiche can still ship a permissions
// object that silently omits one (U3 hardening, Phase 9 · 0c). Each must be
// string ('scoped') or boolean.
const PERMISSION_SUBKEYS = ['fs_write', 'shell', 'network'] as const;

/**
 * Validate a parsed fiche's frontmatter against the §2 schema. Returns the list
 * of missing/empty mandatory keys (empty array ⇒ valid). Does not throw.
 */
export function validateFiche(data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  for (const key of STRING_KEYS) {
    const v = data[key];
    if (typeof v !== 'string' || v.trim() === '') missing.push(key);
  }
  for (const key of ARRAY_KEYS) {
    const v = data[key];
    if (!Array.isArray(v) || v.length === 0) missing.push(key);
  }
  for (const key of OBJECT_KEYS) {
    const v = data[key];
    if (v === null || typeof v !== 'object' || Array.isArray(v)) missing.push(key);
  }
  const perms = data.permissions;
  if (perms !== null && typeof perms === 'object' && !Array.isArray(perms)) {
    for (const sub of PERMISSION_SUBKEYS) {
      const pv = (perms as Record<string, unknown>)[sub];
      if (typeof pv !== 'string' && typeof pv !== 'boolean') missing.push(`permissions.${sub}`);
    }
  }
  return missing;
}

export function loadTierAFiches(dir: string = FICHES_DIR): AgentFiche[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const errors: string[] = [];
  const fiches = files.map((file) => {
    const fullPath = join(dir, file);
    const raw = readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);
    const missing = validateFiche(data as Record<string, unknown>);
    if (missing.length > 0) {
      errors.push(`${file}: missing/empty mandatory keys → ${missing.join(', ')}`);
    }
    return {
      ...(data as Omit<AgentFiche, 'body' | 'fichePath'>),
      body: content.trim(),
      fichePath: fullPath,
    };
  });
  if (errors.length > 0) {
    throw new Error(`Invalid Tier A fiche(s) (AGENTS.md §2/§10):\n${errors.join('\n')}`);
  }
  return fiches;
}
