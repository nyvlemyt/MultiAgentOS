// packages/memory/src/conveyor/distill-apply.ts
// On-disk writer for a distilled fiche (design spec §5 Brique 6, ADR 0008 §4/§5). Distinct from
// supersede-apply.ts (the Keeper-side PROMOTE writer, which lands a fiche as `active`): this writer
// lands a fiche as `distilled` — the review state, never auto-promoted. When an ACTIVE fiche already
// shares the incoming source_key, it does NOT flip that trusted fiche (that would auto-promote the
// unaudited draft's authority); it records a PENDING supersede via planSupersede so the collision is
// visible and the flip happens later, at promotion, through applySupersede. An id-bearing entry is
// never hard-deleted. NOT in the @mas/memory barrel.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { planSupersede, type ExistingFiche, type SupersedePlan } from './supersede';
import type { DistilledFiche } from './distill';

export interface WriteDistilledResult {
  /** Absolute path of the distilled fiche written. */
  written: string;
  /** Present when an active same-key fiche exists — the flip is deferred to promotion (not applied here). */
  supersedePending?: SupersedePlan;
}

/** Frontmatter scalar → string; non-string collapses to '' (avoids '[object Object]', S6551). */
function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/** Scan the fiche store for the existing (id, source_key, lifecycle) tuples planSupersede reasons over. */
function scanExisting(dir: string): ExistingFiche[] {
  if (!existsSync(dir)) return [];
  const out: ExistingFiche[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const data = matter(readFileSync(join(dir, f), 'utf8')).data as Record<string, unknown>;
    out.push({ id: asStr(data.id), source_key: asStr(data.source_key), lifecycle: asStr(data.lifecycle), lane: data.lane as string | undefined });
  }
  return out;
}

/**
 * Write a distilled fiche to `<dir>/<id>.md` (its immutable slug path), landing it at `distilled`.
 * If an active fiche shares the incoming source_key, append ONE `supersede-pending` consolidation-log
 * line (via planSupersede) and return the plan — the active fiche is left untouched. Re-writing the
 * same id overwrites that draft in place (same id ≠ supersede, no cycle). `date` injected.
 */
export function writeDistilledFiche(
  dir: string,
  logPath: string,
  fiche: DistilledFiche,
  opts: { date: string; keeper: string },
): WriteDistilledResult {
  mkdirSync(dir, { recursive: true });
  const { id, source_key, lane } = fiche.frontmatter;

  const plan = planSupersede(scanExisting(dir), { id, source_key, lane }, opts);
  if (plan) {
    appendFileSync(logPath, `${plan.logLine.replace('| supersede |', '| supersede-pending |')}\n`, 'utf8');
  }

  const written = join(dir, `${id}.md`);
  writeFileSync(written, matter.stringify(fiche.body, { ...fiche.frontmatter, lifecycle: 'distilled' }), 'utf8');
  return plan ? { written, supersedePending: plan } : { written };
}
