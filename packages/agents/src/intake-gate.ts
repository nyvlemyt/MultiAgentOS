import { randomUUID } from 'node:crypto';
import { events, type getDb } from '@mas/db';
import { mockSecReviewer } from '@mas/core';
import { intakeSource, type IntakeSourceInput, type IntakeResult } from '@mas/memory';

type Db = ReturnType<typeof getDb>;

const GATED_KINDS = new Set(['repo', 'course']);

export interface GatedIntakeInput extends IntakeSourceInput {
  /** True when the source's code would be executed (install scripts, builds…). */
  execute?: boolean;
}

export type GatedIntakeResult =
  | ({ kind: 'ingested' } & IntakeResult)
  | { kind: 'rejected'; reason: string }
  | { kind: 'paused_for_human'; reason: string };

/**
 * §5 / ADR 0004 §6 intake gate. Repo/course sources must get a mas-sec-reviewer
 * PASS before intakeSource runs; executing source code is risk:blocking and
 * ALWAYS pauses for a human, regardless of any verdict. Nothing is written
 * (no dossier, no candidate) until the gate clears.
 */
export async function runGatedIntake(
  db: Db,
  src: GatedIntakeInput,
  opts: { intakeDir: string },
): Promise<GatedIntakeResult> {
  if (!GATED_KINDS.has(src.kind) && !src.execute) {
    const res = await intakeSource(db, src, { intakeDir: opts.intakeDir });
    return { kind: 'ingested', ...res };
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
  return { kind: 'ingested', ...res };
}
