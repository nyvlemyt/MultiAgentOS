// Admission SAS + dead-letter taxonomy (capture-contract §"Guarantees", design spec §5 Brique 6).
// These guarantees live INSIDE captureCandidates (not per gate), so every future capture gate
// inherits junk-rejection and the never-silent failure path for free (the §8 "one door" rule).

/** Dead-letter triggers → `status='capture_failed'` + reason, visible + relaunchable in the cockpit Inbox. */
export type DeadLetterCause =
  | 'extractor_crash'
  | 'ocr_empty'
  | 'paywall_404'
  | 'oversize'
  | 'double_abstain'
  | 'unknown_source_kind';

export interface AdmissionInput {
  body: string;
  title?: string;
  summary?: string;
  /** Explicit `false` ⇒ the source (path/URL) did not resolve. `undefined` ⇒ not applicable (e.g. ritual capture). */
  sourceResolvable?: boolean;
  /** Classification signals (candidate type, source kind, keywords, explicit user tag). */
  signals?: string[];
}

export type AdmissionVerdict = { ok: true } | { ok: false; reason: string };

const nonBlank = (s: string | undefined): boolean => (s ?? '').trim().length > 0;

/**
 * Admission SAS: a candidate needs (1) a resolvable source, (2) non-empty content
 * (title | summary | body), and (3) ≥1 classification signal — else rejected-at-the-door
 * with a reason. Zero-signal junk never becomes a pending row.
 */
export function admit(input: AdmissionInput): AdmissionVerdict {
  if (input.sourceResolvable === false) {
    return { ok: false, reason: 'unresolvable source (path/URL did not resolve)' };
  }
  if (!nonBlank(input.title) && !nonBlank(input.summary) && !nonBlank(input.body)) {
    return { ok: false, reason: 'empty content (no title, summary, or body)' };
  }
  if (!(input.signals ?? []).some(nonBlank)) {
    return { ok: false, reason: 'no classification signal' };
  }
  return { ok: true };
}

const CAUSE_PHRASE: Record<DeadLetterCause, string> = {
  extractor_crash: 'extractor crashed',
  ocr_empty: 'extraction produced no text (OCR empty)',
  paywall_404: 'source unreachable (404 / paywall)',
  oversize: 'source exceeds the size limit',
  double_abstain: 'classifier double-abstain (rules + LLM)',
  unknown_source_kind: 'no extractor registered for this source kind',
};

/** Human reason persisted alongside a `capture_failed` row. */
export function deadLetterReason(cause: DeadLetterCause, detail?: string): string {
  const base = `capture_failed: ${cause} — ${CAUSE_PHRASE[cause]}`;
  return nonBlank(detail) ? `${base} (${detail})` : base;
}
