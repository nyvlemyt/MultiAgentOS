# Spec — Fiche Contract (Brique 1)

- **Date**: 2026-06-27
- **Statut**: Round-1 (doc-only). The TypeScript blocks below are **CONTRACT TEXT** — Round-2 implements them in `packages/memory` (extending `ArsenalStub` + the lenient `parseFrontmatter` in `packages/memory/src/arsenal.ts`). **Nothing here is wired into the build yet.** No code added to `packages/`, no migration run, no `schema.ts` edit.
- **Source of truth**: ADR `docs/decisions/0008-living-knowledge-os.md` (field names + lifecycle states must match it exactly) + `docs/STRUCTURE.md` (body templates §4, ID/slug §5, relations §7, schema_version §8).
- **Origin**: design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` §5 Brique 1 + Brique 1·bis, §13.1/§13.4 (the 8 reserved sockets).

---

## 1. The authoritative fiche schema (CONTRACT TEXT)

```typescript
// CONTRACT (Round-2 implements in packages/memory). Closed = backbone; passthrough = emergent.
const Lifecycle = z.enum(['captured','triaged','distilled','audited','active','superseded','archived','rejected-kept','capture_failed']);
const Trust = z.enum(['trusted','untrusted','low']);
const Kind = z.enum(['skill','agent','rule','command','resource','register']);
const DocType = z.enum(['tutorial','howto','reference','explanation']);
const Actionability = z.enum(['project','area','resource','archive']);
const ReviewerVerdict = z.enum(['PASS','NEEDS_WORK','BLOCK']); // = quality-score (Q3)

export const FicheSchema = z.object({
  // IDENTITY
  id: z.string(), slug: z.string(), source_key: z.string(),            // allocation: STRUCTURE.md §5
  // STRUCTURE (parent/child)
  part_of: z.string().nullable().default(null), order: z.number().int().nullable().default(null),
  manifest: z.object({ kind: z.string(), role: z.string() }).nullable().default(null),
  // PROVENANCE
  derived_from: z.string(), sources: z.array(z.string()).default([]),
  // LIFECYCLE
  lifecycle: Lifecycle, superseded_by: z.string().nullable().default(null),
  // TRUST
  trust: Trust, ocr_confidence: z.number().nullable().default(null),
  // RETRIEVAL & QUALITY
  retrieval_context: z.string().nullable().default(null),             // Contextual-Retrieval socket
  quality_score: ReviewerVerdict.nullable().default(null),
  // GOVERNANCE
  kind: Kind, register: z.string(), scope: z.enum(['project','global']),
  doc_type: DocType, actionability: Actionability, lane: z.string(),  // lane = appendable enum (data, STRUCTURE §1)
  intake_decision: z.string().optional(), next_audit: z.string().optional(),
  freshness: z.object({ ttl_days: z.number().int() }).optional(),
  schema_version: z.string().default('1'),
  // EMERGENT (free)
  tags: z.array(z.string()).default([]), domain: z.string().optional(),
}).passthrough(); // tolerate unknown emergent keys; backbone stays closed
```

## 2. Legal lifecycle transitions (CONTRACT TEXT — DATA map)

```typescript
// Legal lifecycle transitions (DATA, not hardcoded logic). Round-2 gardian validates against this.
export const LEGAL_TRANSITIONS: Record<string, string[]> = {
  captured:     ['triaged','capture_failed','rejected-kept'],
  triaged:      ['distilled','rejected-kept','capture_failed'],
  distilled:    ['audited','rejected-kept'],
  audited:      ['active','rejected-kept'],
  active:       ['superseded','archived'],
  superseded:   ['archived'],            // never back to active; archive-only
  'rejected-kept': [],                    // terminal but QMD-retrievable
  archived:     [],                       // terminal
  capture_failed: ['triaged','rejected-kept'], // re-entry after a fixed extractor
};
// INVARIANT: no edge deletes an id-bearing entry (archive-never-delete, ADR 0008 §5).
```

## Migration (ONE) — packages/db/src/schema.ts memory_candidates
The §3 prose ("capture writes source_key") outruns the live table (l.224 has none of these). Add in ONE migration:
- `source_key` TEXT + non-unique index (match key for idempotence/supersede/dedup).
- status enum gains `capture_failed` (currently ['pending','accepted','rejected'], l.229).
- `trust` enum column { trusted | untrusted | low } (security invariant: untrusted-never-auto-promote, §114).
Contract must be complete before the first capture write.

## 4. Field-group rationale

Each group is in the contract **now** (not deferred) because every group either anchors an invariant or reserves a socket whose retrofit would force a corpus-wide rewrite (design spec §5 Brique 1, §13.1).

- **IDENTITY** (`id`, `slug`, `source_key`) — the immutable anchor. `source_key` (canonical URL / content-hash) makes re-ingestion **idempotent**: a second ingest of the same source resolves to the same `id`, so links survive a rename instead of minting a duplicate. Allocation algorithm: STRUCTURE.md §5 (kebab, immutable after first mint, collisions suffixed). *(Brique 1 — IDENTITÉ bullet.)*
- **STRUCTURE** (`part_of`, `order`, `manifest`) — parent/child for multi-part sources (a course, a book, a multi-chapter PDF). Delivered **empty in B1** because the fields are cheap now but ruinous to retrofit: already-minted orphans collide under the idempotence rule. Intelligent auto-chunking is deferred. *(Brique 1 — STRUCTURE bullet, §13.1 #8.)*
- **PROVENANCE** (`derived_from`, `sources[]`) — `derived_from` is **mandatory on any distillation** (the raw resource path it came from); `sources[]` lists supporting references. Both are first-class relations whose resolvability the Round-2 CI gardian checks (ADR 0008 clause 6). *(Brique 1 — PROVENANCE bullet.)*
- **LIFECYCLE** (`lifecycle`, `superseded_by`) — the single state field driving the gardian, the supersede write-path, archive, and the dead-letter path. The legal-transition table (§2) is **closed on day 1** and emitted as DATA. `superseded_by` is the archive-never-delete pointer. *(Brique 1 — CYCLE DE VIE bullet, ADR 0008 §4–5.)*
- **TRUST** (`trust`, `ocr_confidence`) — `trust { trusted | untrusted | low }` is a **security invariant**: an untrusted source is never auto-promoted (anti-injection, design spec §114). `ocr_confidence` is **reserved** (nullable) — no extractor populates it yet, but the OCR-low→`trust:low` door closes now. *(Brique 1 — CONFIANCE bullet.)*
- **RETRIEVAL & QUALITY** (`retrieval_context`, `quality_score`) — `retrieval_context` is the **Contextual-Retrieval socket** (nullable, deferred-with-socket, gated on a recall@k miss). `quality_score` ships in B1 so the *when-to-judge* is a toggle, never a schema migration; its shape = `ReviewerVerdict` enum (Q3). *(Brique 1 — RÉCUPÉRATION & QUALITÉ bullet, §2/§13.)*
- **GOVERNANCE** (`kind`, `register`, `scope`, `doc_type`, `actionability`, `lane`, `intake_decision`, `next_audit`, `freshness`, `schema_version`) — `kind` gains `resource` (and `register`) beside `skill|agent|rule|command`; `doc_type` is Diátaxis; `actionability` is PARA; `lane` is the appendable backbone enum carried as a **field, not a renamed folder**. `schema_version` is on **every fiche from doc 1** for portable cross-project migration. Lanes + classifier rules + QMD collection set are externalized as config (mirror `config/model-routing.json`), not TS constants. *(Brique 1 — GOUVERNANCE bullet, §13.1 #7.)*
- **EMERGENT** (`tags[]`, `domain`) — free, lenient layer for the Zettelkasten/MOC growth path. A new theme lives here, never as a new backbone lane. *(Brique 1 — Backbone vs Émergent, §6.)*

## 5. Parsing rule

The schema parser is **`.passthrough()`/lenient** — a mirror of the tolerant `parseFrontmatter` in `arsenal.ts` — for the emergent layer (`tags[]`, `domain`, and any unknown emergent key): unknown keys are tolerated, never rejected. The **backbone is the only CLOSED part**: `Lifecycle`, `Trust`, `Kind`, `DocType`, `Actionability`, `ReviewerVerdict`, and `scope` are closed enums. Consequence: a taxonomy change adds a value to an enum (and a line/row to the data map), it **never rewrites the parser**. `lane` is deliberately a free string (appendable enum carried as data, STRUCTURE.md §1), **not** a closed enum.

## 6. CI gardian forward-note (Round 2)

The Round-2 CI gardian (mirror of `scripts/lint-no-sdk-payg.sh`, via `zod-matter`/`gray-matter`) reads `LEGAL_TRANSITIONS` **as data** and rejects:
- **illegal lifecycle jumps** (e.g. `captured → active` without passing through audit);
- **orphan terminal states** — `superseded` without a `superseded_by` set;
- **unresolvable relations** — `derived_from`, `[[wikilink]]`, `part_of`, `superseded_by`, and each entry of `sources[]` must resolve (per the ADR 0008 clause-6 resolvability rules).

**Severity = 2-tier** (design spec §4.4 / Brique 1 gardian §):
- **strict** on every new/touched file;
- **tier-1 identity** (`id`/`slug`/`source_key`/`lifecycle=active`/`trust=trusted`) stamped on **all legacy** docs (mechanical, zero-LLM) so every legacy doc is a legal target of `superseded_by`/`derived_from`;
- **tier-2 rich fields** (`doc_type`/`actionability`/distilled body) **grandfathered** until the declared **END-STATE coverage threshold** removes the grandfather branch — no permanent forked contract.

Adding a future lifecycle state = one data row in `LEGAL_TRANSITIONS`, never a gardian rewrite. Adding a lane = one appended `lane` value. This is the meta-socket: taxonomy evolves by addition.
