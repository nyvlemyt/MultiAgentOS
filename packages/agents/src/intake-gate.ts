import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { events, type getDb } from '@mas/db';
import { mockSecReviewer } from '@mas/core';
import {
  intakeSource,
  classifyByRulesOnly,
  promoteCandidate,
  GLOBAL_PROJECT,
  type IntakeSourceInput,
  type IntakeResult,
  type MemoryStore,
} from '@mas/memory';

type Db = ReturnType<typeof getDb>;

const GATED_KINDS = new Set(['repo', 'course']);

export interface GatedIntakeInput extends IntakeSourceInput {
  /** True when the source's code would be executed (install scripts, builds…). */
  execute?: boolean;
}

export interface IntakeTrust {
  /** Allowlisted source identifiers (url or title prefixes). Empty by default. */
  trustedSources: string[];
}

export interface GatedIntakeOpts {
  intakeDir: string;
  /** Trust allowlist (prod: config/intake.trust.json). Absent = nothing trusted. */
  trust?: IntakeTrust;
  /** Keeper store for auto-file promotion. Absent = no auto-file. */
  store?: MemoryStore;
}

export type GatedIntakeResult =
  | ({ kind: 'ingested'; autoFiled: boolean } & IntakeResult)
  | { kind: 'rejected'; reason: string }
  | { kind: 'paused_for_human'; reason: string };

/** Load config/intake.trust.json (schema mirrors permissions.json — empty default). */
export function loadIntakeTrust(repoRoot: string): IntakeTrust {
  try {
    const raw = JSON.parse(readFileSync(join(repoRoot, 'config/intake.trust.json'), 'utf8'));
    return { trustedSources: Array.isArray(raw.trusted_sources) ? raw.trusted_sources : [] };
  } catch {
    return { trustedSources: [] };
  }
}

function isTrusted(src: GatedIntakeInput, trust?: IntakeTrust): boolean {
  if (!trust || trust.trustedSources.length === 0) return false;
  const idents = [src.url, src.title].filter(Boolean) as string[];
  return trust.trustedSources.some((t) => idents.some((id) => id.startsWith(t)));
}

/**
 * ADR 0004 §7 auto-file: a trusted source skips MANUAL TRIAGE only — promotion
 * still runs through promoteCandidate behind the Keeper write-lock (§8), and
 * only when the deterministic rules classify it (abstain → inbox, zero LLM).
 * Any failure (e.g. non-keeper store) leaves the candidate pending.
 */
async function tryAutoFile(
  db: Db,
  src: GatedIntakeInput,
  res: IntakeResult,
  opts: GatedIntakeOpts,
): Promise<boolean> {
  if (!opts.store || !isTrusted(src, opts.trust)) return false;
  const decision = classifyByRulesOnly({
    body: src.body,
    projectId: src.projectId,
    sourceKind: src.kind,
  });
  if (!decision) return false;
  try {
    await promoteCandidate(
      db,
      res.candidateId,
      {
        projectId: decision.scope === 'global' ? GLOBAL_PROJECT : src.projectId ?? GLOBAL_PROJECT,
        kind: decision.register,
        title: src.title,
      },
      opts.store,
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * §5 / ADR 0004 §6 intake gate. Repo/course sources must get a mas-sec-reviewer
 * PASS before intakeSource runs; executing source code is risk:blocking and
 * ALWAYS pauses for a human, regardless of any verdict. Nothing is written
 * (no dossier, no candidate) until the gate clears.
 */
export async function runGatedIntake(
  db: Db,
  src: GatedIntakeInput,
  opts: GatedIntakeOpts,
): Promise<GatedIntakeResult> {
  if (!GATED_KINDS.has(src.kind) && !src.execute) {
    const res = await intakeSource(db, src, { intakeDir: opts.intakeDir });
    const autoFiled = await tryAutoFile(db, src, res, opts);
    return { kind: 'ingested', autoFiled, ...res };
  }

  const risk = src.execute ? 'blocking' : 'high';
  const reviewId = `intake_${randomUUID()}`;

  if (risk === 'blocking') {
    // §5: blocking never auto-proceeds, even on a PASS verdict.
    await db.insert(events).values({
      id: `evt_${randomUUID()}`,
      type: 'validation_requested',
      risk,
      payloadJson: JSON.stringify({ reason: 'intake source-code execution', title: src.title, url: src.url }),
      createdAt: new Date(),
    });
    return { kind: 'paused_for_human', reason: 'source-code execution is risk:blocking (§5)' };
  }

  const verdict = mockSecReviewer(reviewId, { risk });
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    agentId: undefined,
    type: 'sec_review_verdict',
    risk,
    payloadJson: JSON.stringify({ ...verdict, source: src.url ?? src.title }),
    createdAt: new Date(),
  });

  if (verdict.verdict !== 'PASS') {
    return { kind: 'rejected', reason: `mas-sec-reviewer ${verdict.verdict}` };
  }

  const res = await intakeSource(db, src, { intakeDir: opts.intakeDir, secReviewPass: true });
  const autoFiled = await tryAutoFile(db, src, res, opts);
  return { kind: 'ingested', autoFiled, ...res };
}
