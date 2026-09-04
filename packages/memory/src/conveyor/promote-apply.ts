// packages/memory/src/conveyor/promote-apply.ts
// On-disk applier for the promotion stage (ADR 0008 clauses 4/5/11). This is the FIRST caller of
// applySupersede/markSuperseded (supersede-apply.ts): distillation only ever recorded a
// `supersede-pending` line, deliberately leaving the flip to promotion so an unaudited draft could
// never seize a trusted fiche's authority. Promotion is where that deferred flip finally happens.
//
// One fiche file in → judge → the state machine plans → exactly one write:
//   promoted → applySupersede (flip any active same-source_key fiche to `superseded` + link it,
//              then land this fiche as `active`) + one `promote` log line
//   held     → quality_score stamped, lifecycle untouched  + one `promote-hold` log line
//   rejected → lifecycle `rejected-kept` (archived, file kept) + one `promote-reject` log line
//   skipped  → NOTHING written, no LLM call spent
// A fiche is never hard-deleted, and `trust` is never rewritten: promotion advances the lifecycle,
// it does not launder the source's security tag. NOT in the @mas/memory barrel.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import matter from 'gray-matter';
import { FicheSchema } from '../fiche';
import { applySupersede, asStr } from './supersede-apply';
import {
  judgeFiche, planPromotion, promotePromptEstimate,
  type PromoteDeps, type PromotionOutcome, type QualityVerdict,
} from './promote';

export interface PromoteApplyDeps extends PromoteDeps {
  /** The fiche store (docs/knowledge). */
  dir: string;
  /** Consolidation-log path — the committed audit trail (ADR 0008 clause 13). */
  logPath: string;
  /** Injected date (deterministic). */
  date: string;
  keeper: string;
  /** Explicit human approval to promote non-`trusted` fiches (see PromotionOpts). */
  approveUntrusted?: boolean;
}

export interface PromoteFileResult {
  path: string;
  id: string;
  /** `failed` = the fiche could not be judged or written (visible, never silent). */
  outcome: PromotionOutcome | 'failed';
  /** Lifecycle on disk AFTER the apply. */
  lifecycle: string;
  verdict?: QualityVerdict;
  findings?: string[];
  /** Path of a fiche flipped to `superseded` by this promotion. */
  superseded?: string;
  reason?: string;
}

/** A fiche's immutable slug path inside the store (STRUCTURE.md §5: `<id>.md`). */
export function fichePath(dir: string, id: string): string {
  return join(dir, `${id}.md`);
}

/** Pre-flight estimate for a fiche file, so a batch can gate the spend before reading further. */
export function promoteFileEstimate(path: string): number {
  const parsed = matter(readFileSync(path, 'utf8'));
  const data = parsed.data as Record<string, unknown>;
  const id = asStr(data.id) || basename(path);
  return promotePromptEstimate({
    id, title: id, docType: asStr(data.doc_type) || 'reference', trust: 'untrusted', body: parsed.content,
  });
}

const LOG_EVENT: Record<Exclude<PromotionOutcome, 'skipped'>, string> = {
  promoted: 'promote',
  held: 'promote-hold',
  rejected: 'promote-reject',
};

function logLine(
  event: string, id: string, lane: string, deps: PromoteApplyDeps, note: string,
): string {
  return `${deps.date} | ${event} | ids=${id} | lane=${lane} | keeper=${deps.keeper} | note=${note}\n`;
}

function writeFiche(path: string, frontmatter: Record<string, unknown>, body: string): void {
  writeFileSync(path, matter.stringify(body, frontmatter), 'utf8');
}

const failed = (path: string, id: string, lifecycle: string, reason: string): PromoteFileResult =>
  ({ path, id, outcome: 'failed', lifecycle, reason });

/**
 * Judge and promote ONE fiche file. Reads the fiche, refuses anything that is not a well-formed
 * candidate BEFORE spending an LLM call, calls the judge once, then lets planPromotion pick the
 * legal write. Returns what happened — nothing is ever silently dropped.
 */
export async function promoteFile(path: string, deps: PromoteApplyDeps): Promise<PromoteFileResult> {
  const parsed = matter(readFileSync(path, 'utf8'));
  const raw = parsed.data as Record<string, unknown>;
  const id = asStr(raw.id) || basename(path).replace(/\.md$/, '');
  const onDisk = asStr(raw.lifecycle);

  // Guard 1 — the store is keyed by id: a file whose name diverges from its id would make
  // applySupersede write a SECOND file at `<id>.md` and orphan this one.
  if (basename(path) !== `${id}.md`) {
    return { path, id, outcome: 'skipped', lifecycle: onDisk, reason: `filename '${basename(path)}' does not match id '${id}'` };
  }

  // Guard 2 — idempotent re-runs: only a fiche in the review state is a candidate. Checked before
  // the judge so replaying `--all` over a promoted corpus costs zero tokens.
  const preflight = planPromotion({ lifecycle: onDisk, trust: 'untrusted' }, 'PASS', deps);
  if (preflight.outcome === 'skipped') {
    return { path, id, outcome: 'skipped', lifecycle: onDisk, reason: preflight.reason };
  }

  // Guard 3 — never make a malformed fiche ACTIVE: an active fiche is retrieved and acted on by
  // agents, and the CI gardien would RED the repo on it.
  const fiche = FicheSchema.safeParse(raw);
  if (!fiche.success) {
    return failed(path, id, onDisk, `frontmatter is not FicheSchema-valid: ${fiche.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
  }

  const judgment = await judgeFiche({
    id, title: id, docType: fiche.data.doc_type, trust: fiche.data.trust, body: parsed.content,
  }, deps);

  const plan = planPromotion({ lifecycle: onDisk, trust: fiche.data.trust }, judgment.verdict, deps);
  const base = { path, id, verdict: judgment.verdict, findings: judgment.findings };
  const lane = fiche.data.lane;
  // quality_score is recorded on EVERY judged outcome — a held fiche keeps its score so a later
  // pass (or the cockpit) can see it was reviewed and why it did not move.
  const scored = { ...raw, quality_score: judgment.verdict };

  if (plan.outcome === 'promoted') {
    const applied = applySupersede(deps.dir, deps.logPath, {
      id, source_key: fiche.data.source_key, lane,
      frontmatter: scored, body: parsed.content,
    }, { date: deps.date, keeper: deps.keeper });
    // The approval is recorded in the log, not just honoured: an untrusted fiche that went active
    // must say WHO let it through when the trail is read back months later.
    const approval = deps.approveUntrusted && fiche.data.trust !== 'trusted' ? ' · human-approved-untrusted' : '';
    const note = `${judgment.verdict} · ${plan.path.join('→')}${approval}`;
    appendFileSync(deps.logPath, logLine(LOG_EVENT.promoted, id, lane, deps, note), 'utf8');
    return { ...base, outcome: 'promoted', lifecycle: plan.target, ...(applied.superseded ? { superseded: applied.superseded } : {}) };
  }

  writeFiche(path, { ...scored, lifecycle: plan.target }, parsed.content);
  appendFileSync(deps.logPath, logLine(LOG_EVENT[plan.outcome as 'held' | 'rejected'], id, lane, deps, `${judgment.verdict} · ${plan.reason ?? ''}`), 'utf8');
  return { ...base, outcome: plan.outcome, lifecycle: plan.target, ...(plan.reason ? { reason: plan.reason } : {}) };
}

/** Judge and promote one fiche by id. Returns null when the id has no file in the store. */
export async function promoteId(id: string, deps: PromoteApplyDeps): Promise<PromoteFileResult | null> {
  const path = fichePath(deps.dir, id);
  return existsSync(path) ? promoteFile(path, deps) : null;
}
