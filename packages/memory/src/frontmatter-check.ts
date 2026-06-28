import { FicheSchema, LEGAL_TRANSITIONS } from './fiche';

// CI gardien validator (Brique 1d, fiche-contract spec §6). Reads
// LEGAL_TRANSITIONS as DATA and rejects illegal lifecycle states, orphan
// terminal states (`superseded` without `superseded_by`), and unresolvable
// relations. Two-tier severity (design spec §4.4):
//   - tier1  → identity-only; rich backbone fields grandfathered on legacy docs;
//              orphan body wikilinks tolerated as warnings (legacy corpus).
//   - strict → full backbone contract (FicheSchema) + body wikilinks must resolve.

export type FicheTier = 'strict' | 'tier1';

export interface CheckOpts {
  knownPaths: Set<string>; // resolvable targets: tracked file paths ∪ every fiche id/slug
  tier: FicheTier;
}

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

const TIER1_IDENTITY = ['id', 'slug', 'source_key', 'lifecycle', 'trust'] as const;
const RELATION_FIELDS = ['derived_from', 'part_of', 'superseded_by'] as const;
const LIFECYCLE_STATES = new Set(Object.keys(LEGAL_TRANSITIONS));

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

type Frontmatter = Record<string, unknown>;

function checkIdentity(fm: Frontmatter, errors: string[]): void {
  for (const field of TIER1_IDENTITY) {
    if (!isNonEmptyString(fm[field])) errors.push(`${field}: missing tier-1 identity field`);
  }
}

function checkLifecycle(fm: Frontmatter, errors: string[]): void {
  const lifecycle = fm.lifecycle;
  if (typeof lifecycle !== 'string' || !LIFECYCLE_STATES.has(lifecycle)) {
    errors.push(`lifecycle: illegal or missing state '${String(lifecycle)}' (not in LEGAL_TRANSITIONS)`);
    return;
  }
  if (lifecycle === 'superseded' && !isNonEmptyString(fm.superseded_by)) {
    errors.push(`superseded_by: a 'superseded' fiche must name its successor (orphan terminal)`);
  }
}

function checkRelations(fm: Frontmatter, known: Set<string>, errors: string[]): void {
  for (const field of RELATION_FIELDS) {
    const v = fm[field];
    if (isNonEmptyString(v) && !known.has(v)) {
      errors.push(`${field}: unresolvable relation target '${v}'`);
    }
  }
  if (Array.isArray(fm.sources)) {
    for (const s of fm.sources) {
      if (isNonEmptyString(s) && !known.has(s)) {
        errors.push(`sources: unresolvable relation target '${s}'`);
      }
    }
  }
}

function checkBackbone(fm: Frontmatter, errors: string[]): void {
  const parsed = FicheSchema.safeParse(fm);
  if (parsed.success) return;
  for (const issue of parsed.error.issues) {
    errors.push(`${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
}

export function checkFiche(fm: Frontmatter, opts: CheckOpts): CheckResult {
  const errors: string[] = [];
  checkLifecycle(fm, errors);
  checkIdentity(fm, errors);
  checkRelations(fm, opts.knownPaths, errors);
  if (opts.tier === 'strict') checkBackbone(fm, errors);
  return { errors: unique(errors), warnings: [] };
}

// Strip fenced code blocks and inline code so a documented `[[BDR-001]]` example
// (legacy doctrine prose) is never mistaken for a live relation (the trap).
function stripCode(body: string): string {
  return body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
}

export function scanWikilinks(body: string): string[] {
  // String scan (no regex) so the `]]` terminator can never backtrack — a
  // `[[…]]` regex trips Sonar S8786 and JS has no atomic groups to pin it.
  // For each `[[`, take the span up to the next `]]` and drop any `|alias`.
  // Code spans are stripped first so a `[[BDR-001]]` example in prose is never
  // read as a live relation (the trap).
  const text = stripCode(body);
  const targets: string[] = [];
  let cursor = 0;
  for (;;) {
    const open = text.indexOf('[[', cursor);
    if (open === -1) break;
    const close = text.indexOf(']]', open + 2);
    if (close === -1) break;
    const inner = text.slice(open + 2, close);
    const pipe = inner.indexOf('|');
    const target = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
    if (target.length > 0) targets.push(target);
    cursor = close + 2;
  }
  return unique(targets);
}

export function checkBody(body: string, opts: CheckOpts): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const target of scanWikilinks(body)) {
    if (opts.knownPaths.has(target)) continue;
    const msg = `[[${target}]]: unresolvable wikilink`;
    if (opts.tier === 'strict') errors.push(msg);
    else warnings.push(msg);
  }
  return { errors, warnings };
}
