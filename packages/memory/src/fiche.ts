import { z } from 'zod';

export const SCHEMA_VERSION = '1';

const Lifecycle = z.enum(['captured','triaged','distilled','audited','active','superseded','archived','rejected-kept','capture_failed']);
const Trust = z.enum(['trusted','untrusted','low']);
const Kind = z.enum(['skill','agent','rule','command','resource','register']);
const DocType = z.enum(['tutorial','howto','reference','explanation']);
const Actionability = z.enum(['project','area','resource','archive']);
const ReviewerVerdict = z.enum(['PASS','NEEDS_WORK','BLOCK']); // = quality_score (Q3)

export const FicheSchema = z.object({
  id: z.string(), slug: z.string(), source_key: z.string(),
  part_of: z.string().nullable().default(null),
  order: z.number().int().nullable().default(null),
  manifest: z.object({ kind: z.string(), role: z.string() }).nullable().default(null),
  derived_from: z.string(), sources: z.array(z.string()).default([]),
  lifecycle: Lifecycle, superseded_by: z.string().nullable().default(null),
  trust: Trust, ocr_confidence: z.number().nullable().default(null),
  retrieval_context: z.string().nullable().default(null),
  quality_score: ReviewerVerdict.nullable().default(null),
  kind: Kind, register: z.string(), scope: z.enum(['project','global']),
  doc_type: DocType, actionability: Actionability, lane: z.string(),
  intake_decision: z.string().optional(), next_audit: z.string().optional(),
  freshness: z.object({ ttl_days: z.number().int() }).optional(),
  schema_version: z.string().default(SCHEMA_VERSION),
  tags: z.array(z.string()).default([]), domain: z.string().optional(),
}).passthrough();

export type Fiche = z.infer<typeof FicheSchema>;

// DATA, not hardcoded logic. Adding a future state = one row.
export const LEGAL_TRANSITIONS: Record<string, string[]> = {
  captured:        ['triaged','capture_failed','rejected-kept'],
  triaged:         ['distilled','rejected-kept','capture_failed'],
  distilled:       ['audited','rejected-kept'],
  audited:         ['active','rejected-kept'],
  active:          ['superseded','archived'],
  superseded:      ['archived'],
  'rejected-kept': [],
  archived:        [],
  capture_failed:  ['triaged','rejected-kept'],
};
// INVARIANT: no edge deletes an id-bearing entry (archive-never-delete, ADR 0008 §5).

export function isLegalTransition(from: string, to: string): boolean {
  return (LEGAL_TRANSITIONS[from] ?? []).includes(to);
}
