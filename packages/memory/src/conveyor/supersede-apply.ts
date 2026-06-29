// packages/memory/src/conveyor/supersede-apply.ts
// On-disk applier for the keyed-supersede plan (design spec §5/§9.8, ADR 0008 §5). The pure
// planSupersede/markSuperseded (supersede.ts) are the frozen socket; this is their first disk caller:
// match an active fiche on source_key → flip it to `superseded` (status-flip, NEVER hard-delete) +
// append one consolidation-log line, then write the incoming as active. Keeper-side (promote), not a
// capture-side write. NOT in the @mas/memory barrel. LLM ADD/UPDATE/NONE auto-judge stays deferred.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { planSupersede, markSuperseded, type ExistingFiche } from './supersede';

export interface FicheWrite {
  id: string;
  source_key: string;
  lane?: string;
  /** Full FicheSchema-shaped frontmatter for the new active fiche. */
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ApplyResult {
  written: string;
  superseded?: string;
  logLine?: string;
}

interface Scanned { path: string; data: Record<string, unknown>; content: string; ef: ExistingFiche }

function scan(dir: string): Scanned[] {
  if (!existsSync(dir)) return [];
  const out: Scanned[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const path = join(dir, f);
    const parsed = matter(readFileSync(path, 'utf8'));
    const data = parsed.data as Record<string, unknown>;
    out.push({
      path, data, content: parsed.content,
      ef: { id: String(data.id ?? ''), source_key: String(data.source_key ?? ''), lifecycle: String(data.lifecycle ?? ''), lane: data.lane as string | undefined },
    });
  }
  return out;
}

/**
 * Apply the supersede plan on disk. If an active fiche shares the incoming source_key, flip it to
 * superseded (guarded by isLegalTransition inside markSuperseded) + append one log line; the victim
 * file is rewritten in place, never deleted. Always writes the incoming fiche as active. `date`
 * injected (deterministic).
 */
export function applySupersede(dir: string, logPath: string, incoming: FicheWrite, opts: { date: string; keeper: string }): ApplyResult {
  mkdirSync(dir, { recursive: true });
  const existing = scan(dir);
  const plan = planSupersede(existing.map((e) => e.ef), { id: incoming.id, source_key: incoming.source_key, lane: incoming.lane }, opts);

  let supersededPath: string | undefined;
  let logLine: string | undefined;
  if (plan) {
    const victim = existing.find((e) => e.ef.id === plan.supersededId)!;
    writeFileSync(victim.path, matter.stringify(victim.content, markSuperseded(victim.data, plan.supersededBy)), 'utf8');
    supersededPath = victim.path;
    logLine = plan.logLine;
    appendFileSync(logPath, `${plan.logLine}\n`, 'utf8');
  }

  const written = join(dir, `${incoming.id}.md`);
  writeFileSync(written, matter.stringify(incoming.body, { ...incoming.frontmatter, lifecycle: 'active' }), 'utf8');
  return { written, superseded: supersededPath, logLine };
}

export interface CandidateForFiche {
  id: string;
  sourceKey: string;
  trust: 'trusted' | 'untrusted' | 'low';
  body: string;
  classifierDecision?: string;
  /** Raw source path/URL — fills the REQUIRED FicheSchema `derived_from`. */
  derivedFrom: string;
}

const VALID_REGISTERS = new Set(['decisions', 'learnings', 'blockers', 'journal', 'evals']);

/** First token of `classifierDecision` that is a real register, else 'learnings' (ingested-resource default). */
function registerFromDecision(decision: string | undefined): string {
  const head = (decision ?? '').split(/[/\s]/)[0] ?? '';
  return VALID_REGISTERS.has(head) ? head : 'learnings';
}

/**
 * Build a FicheSchema-valid frontmatter from a promoted candidate. The LLM body distillation is
 * deferred — v1 promotes with the captured markdown as body; a later distill pass supersedes it in
 * place via the same source_key. Resource defaults: kind=resource, doc_type=reference,
 * actionability=resource, lane=resources, scope=global.
 */
export function ficheFrontmatterFromCandidate(cand: CandidateForFiche): Record<string, unknown> {
  return {
    id: cand.id, slug: cand.id, source_key: cand.sourceKey,
    derived_from: cand.derivedFrom, lifecycle: 'active', trust: cand.trust,
    kind: 'resource', register: registerFromDecision(cand.classifierDecision),
    scope: 'global', doc_type: 'reference', actionability: 'resource', lane: 'resources',
    schema_version: '1',
  };
}
