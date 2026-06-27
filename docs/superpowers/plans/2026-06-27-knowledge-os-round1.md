# Living Knowledge OS — Round 1 Implementation Plan (doc-only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the five Round-1 deliverables (base audit + ADR + two contract specs + the STRUCTURE.md charter with its 6 frozen foundations) so that the Round-2 build inherits *frozen, internally-consistent contracts* — and nothing more (no code, no machine).

**Architecture:** Round 1 is **doc-only**. It writes decision/spec/charter documents that Round 2 implements. The hard part is *completeness of the foundation*: every contract, invariant, ID rule, relation, lifecycle edge, and reserved socket must be settled here so Round 2 never forces a corpus-wide rewrite. Verification is **document coherence + cross-reference resolvability + an adversarial Checker pass**, not built tooling — the CI gardien/linter is a Round-2 deliverable.

**Tech Stack:** Markdown + a single authoritative Zod schema (TypeScript, authored as the *contract text* inside the fiche-contract spec — not wired into the build in Round 1). Reference docs: `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` (the revised design spec, §13 = the revision charter), `docs/knowledge/*`, CLAUDE.md §5/§6/§7/§8/§11/§12/§13/§14, ADR 0003/0004/0005/0007.

**Scope boundary (do NOT cross in Round 1):** no migration code, no gardien CI script, no extractor, no QMD collection registration, no cockpit code, no `git mv` of `docs/ressources/`. Those are Round-2 (the design spec §9 Round 2). Round 1 only *decides and freezes* them on paper. The 5-checks barrier applies to code; Round 1 touches no code, so the only gate is doc coherence + Checker.

---

## Locked decisions carried into Round 1 (user "go", 2026-06-27)

These are the 6 residual questions, answered with the recommended defaults the user accepted. The ADR (Task 2) records them as decisions; later tasks cite them. If the user later overrides, only the ADR + the citing task change.

| # | Question | Locked answer |
|---|---|---|
| Q1 | Promotion judge model | **Sonnet at distillation** (volume) · **Opus only at promotion** (rare, high-stakes). Subscription pool, never PAYG (§11). |
| Q2 | Budget-pause threshold under continuous distill-time scoring | **Set at Round-2 conveyor build** as a *config* value (sized to N-fiche × Sonnet cost), not hardcoded; ADR records the *posture*, not a number. |
| Q3 | `quality-score` block shape | **Enum `ReviewerVerdict` = `PASS | NEEDS_WORK | BLOCK`** (reuse `mas-reviewer` vocabulary). Optional dimension breakdown reservable later with no migration. |
| Q4 | Folder rename mechanics | **`git mv` + sweep all `docs/ressources`/`claude doc` refs (CLAUDE.md, ADRs, `.gitignore`) in one Round-2 step-0 commit.** History preserved, no redirect to maintain. Round 1 only records the decision + freezes `docs/resources/` as canonical. |
| Q5 | `schema_version` initial + cross-project policy | Initial **`'1'`**; bump ships with an idempotent migration runner keyed off the version; cross-project register **refuses** a fiche whose `schema_version` > host. |
| Q6 | Contextual-Retrieval build trigger | **No blind number.** Reserve `retrieval_context` now; set the concrete recall@k gap predicate **after the first golden-set baseline run** (Round 2+). |

**Pre-flight (CLAUDE.md §13) — every task's Step 1 reads the relevant `docs/knowledge/` files before writing.** Skipping = mediocre output (§12).

---

## File Structure (what Round 1 creates)

| File | Responsibility | Task |
|---|---|---|
| `docs/audits/2026-06-27-base-audit.md` | 9-pillar read-only audit of the base vs our resources + state-of-art → constat/gravité/remédiation; feeds ADR + Round-2 backlog | 1 |
| `docs/decisions/0008-living-knowledge-os.md` | The architecture decision: frontiers, single-corpus bridge, taxonomy backbone+emergent+3-occurrence, lifecycle state-machine + CLOSED transitions, archive-never-delete, **relations-model contract**, schema-versioning lifecycle, portable contract, quality posture, consolidation-log canonical path | 2 |
| `docs/STRUCTURE.md` | The charter / single source of truth for docs+code structure: taxonomy (§6), code convention (§7), **+ the 6 frozen foundations** (distillation templates, ID/slug rule, folder-rename decision, relations summary, consolidation-log format, schema_version current) | 3 |
| `docs/knowledge/consolidation-log.md` | The append-only governance trail file (created with header + documented line-format; first real lines land in Round 2) | 3 |
| `docs/superpowers/specs/2026-06-27-fiche-contract.md` | Brique 1 spec: the authoritative Zod fiche schema (all field groups, closed backbone enums, `.passthrough()` for emergent, reserved sockets, the `memory_candidates` migration scope, the CLOSED legal-transition data-map) | 4 |
| `docs/superpowers/specs/2026-06-27-capture-contract.md` | Brique 3 spec: the single `captureCandidates` seam, admission-SAS, dead-letter (`capture_failed`), keyed supersede write-path, candidate row shape, classifier-first | 5 |
| `docs/learning/2026-06-27/checker-verdict.md` | Adversarial Checker verdict on Round-1 coherence (per the user's verdict-to-file convention) | 6 |

---

## Task 1: Base audit report (9 pillars)

**Files:**
- Create: `docs/audits/2026-06-27-base-audit.md`

- [ ] **Step 1: Pre-flight reads**

Read, in order: `docs/knowledge/project-doctrine.md`, `docs/knowledge/memory-patterns.md`, `docs/knowledge/continuous-learning-and-memory-lifecycle.md`, `docs/knowledge/agent-patterns.md`, `docs/knowledge/skills-reference.md`, `docs/knowledge/production-patterns.md`, `docs/knowledge/vibeflow/INDEX.md`, and the design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` (§8 defines this audit). This is the §13 pre-flight; the audit *confronts* the base against this knowledge.

- [ ] **Step 2: Write the audit skeleton (9 pillars, fixed shape)**

Create `docs/audits/2026-06-27-base-audit.md` with this exact frame. Each pillar is one section with a 3-column finding table — **constat / gravité (low|medium|high|blocking) / remédiation (→ charte | → ADR | → Round-2 backlog card)**:

```markdown
# Base Audit — Living Knowledge OS (Round 1, read-only)
- Date: 2026-06-27
- Method: docs/workflows/intake-audit-template.md applied per pillar; confront base vs docs/knowledge + state-of-art.
- Feeds: ADR 0008 (decisions), docs/STRUCTURE.md (conventions), design spec §9 Round-2 backlog (cards).

## Pillar 1 — Memory (5-register, capture, consolidation lifecycle)
| Constat | Gravité | Remédiation |
|---|---|---|
| … | … | → … |

## Pillar 2 — Task decomposition (mas-mission-planner DAG)
## Pillar 3 — Agent creation (Tier A fiches, ≤7 tools)
## Pillar 4 — Agent↔agent communication (loop events, handoffs)
## Pillar 5 — Skill creation (lifecycle structure, L1/L2)
## Pillar 6 — Skill selection (router, three-tier)
## Pillar 7 — Main orchestrator (dispatch, runDispatchTick)
## Pillar 8 — Docs structure (taxonomy, naming, the mess §1 names)
## Pillar 9 — Code architecture & design-patterns (monorepo, llm.ts injection, ports/adapters)

## Synthèse — top findings by gravité, and what each one feeds
```

- [ ] **Step 3: Fill each pillar with grounded findings**

For each pillar: read the relevant repo area (e.g. Pillar 1 → `packages/memory/src/*`; Pillar 9 → `packages/*/src` layout + `packages/core/src/llm.ts`), state **only facts grounded in code/docs**, assign gravité, and route every remédiation to charte / ADR / a named Round-2 backlog card. No vague "could be cleaner". *(At execution under subagent-driven mode this step MAY fan out one read-only agent per pillar; the orchestrator merges into the single file.)*

- [ ] **Step 4: Verify (acceptance criteria — binary)**

- All 9 pillars present, each with ≥1 finding row.
- Every finding has a gravité enum value and a remédiation that names its destination (charte / ADR 0008 / a Round-2 backlog card title).
- Synthèse lists the high/blocking findings.
- Zero ungrounded claims (each constat traceable to a file or a doc).

- [ ] **Step 5: Commit**

```bash
git add docs/audits/2026-06-27-base-audit.md
git commit -m "docs(audit): base 9-pillar audit (Round 1)"
```

---

## Task 2: ADR 0008 — Living Knowledge OS

**Files:**
- Create: `docs/decisions/0008-living-knowledge-os.md` (verify 0008 is the next free number across main + open branches at write-time; renumber if taken)

- [ ] **Step 1: Pre-flight reads (CLAUDE.md §12 — mandatory for any ADR)**

Read `docs/knowledge/project-doctrine.md` (5-register architecture), `docs/knowledge/memory-patterns.md`, `docs/knowledge/continuous-learning-and-memory-lifecycle.md`, and the design spec §2/§4/§5(Brique 2)/§6/§13. Read an existing ADR for house style: `docs/decisions/0004-memory-intake-and-auto-capture.md`.

- [ ] **Step 2: Write the ADR (standard ADR shape, decisions enumerated)**

Create the ADR with `Status: accepted`, `Context`, `Decision`, `Consequences`. The **Decision** section graves these clauses verbatim-precise (each is a corpus invariant or contract):

```markdown
## Decision

1. **Frontiers** — project memory at `data/memory/<projectId>/`, global at `data/memory/_global/` (CLAUDE.md §8). Memory Keeper is the only writer (§8).
2. **Single corpus, two faces** — build-time `docs/knowledge/` ⇄ runtime `data/memory/` is ONE corpus bridged by the §13 persistence bridge; neither diverges.
3. **Taxonomy** — backbone (stable, carried by the frontmatter `lane` field, ~7 lanes, NOT renamed folders) + emergent (`tags[]`/`domain`/MOC). The **3-occurrence rule** (2=coincidence, >5=late) is a first-class promotion rule; L1→L2→L3 hardening (DURCIR) recorded as frontmatter back-references + one line in the consolidation log.
4. **Lifecycle state machine** — `captured→triaged→distilled→audited→active→superseded→archived` (+ `rejected-kept`, `capture_failed`). The **legal-transition table is CLOSED on day 1** and emitted as a committed DATA map (JSON/TS const read as data), including: `capture_failed` re-entry, `superseded→archived`, `rejected-kept` terminal-but-retrievable, and an explicit **no-hard-delete edge**. Adding a future state = one data row, never a guardian rewrite.
5. **Archive-never-delete** — supersede = status-flip + `superseded_by`; an entry with an `id` is never hard-deleted.
6. **Relations-model contract** — the relation set is first-class (see table); the CI gardian (Round 2) enforces resolvability. A future graph is a projection of this, never a re-author.
7. **Notion index = one audited source** mapped onto the neutral spine; it supersedes nothing and is not the schema.
8. **Charter** — single frontmatter + CI gardien + QMD collections + single-writer (§8); the charter lives in `docs/STRUCTURE.md`.
9. **Portable contract** — `schema_version` + lane definitions + classifier rule-table + QMD collection set are EXTERNAL config files (mirror `config/model-routing.json`), travelling with a project register. A child reads the versioned, data-not-code pack with zero refactor.
10. **schema_version lifecycle** — initial `'1'`; a bump ships with an idempotent migration runner that keys off the version; the backfill runner and the cross-project register both read it; the register **refuses** a fiche whose `schema_version` exceeds the host's (Q5).
11. **Quality posture (revision 2026-06-27)** — judge AT distillation = **Sonnet**; promotion = **Opus** (Q1); subscription pool, never PAYG (§11). `quality-score` = enum `ReviewerVerdict` (Q3). Budget-pause MECHANISM kept (anti-runaway, §6/§11.bis); the threshold is a Round-2 config value (Q2); the dead "~20 €" ceiling is removed as a design factor (100 € Max).
12. **Contextual-Retrieval** — deferred-with-socket: `retrieval_context` reserved now; the recall@k build-trigger is set after the first golden-set baseline (Q6). GraphRAG / homemade RRF / homemade cross-encoder stay rejected on merit (QMD subsumes them; it already ships `qwen3-reranker-0.6b`).
13. **Consolidation log** — canonical path `docs/knowledge/consolidation-log.md` (committed audit trail); per-project runtime mirrors under `data/memory/<id>/` are Round-2+.
```

Add the **relations table** in the Decision (or Consequences):

```markdown
| Relation | Direction | Required? | Resolvability rule (gardian, Round 2) |
|---|---|---|---|
| `derived_from` | fiche → rawResourcePath | yes, on any distillation | path must exist under docs/resources/** |
| `sources[]` | fiche → [path|url] | optional | each entry resolvable (path exists / URL well-formed) |
| `part_of` | child → parentId | nullable | parentId must be an existing fiche id |
| `order` | int, with part_of | with part_of | integer ≥ 0 |
| `superseded_by` | fiche → fiche id | set when lifecycle=superseded | target id exists and is not itself superseded by this one (no cycle) |
| MOC membership | fiche ↔ MOC | optional | via `[[wikilink]]` resolvable to an existing slug |
| `[[wikilink]]` | fiche → fiche | free | resolves to an existing slug |
```

- [ ] **Step 3: Wire the back-reference**

The design spec Brique 2 says this ADR is where `second-brain-cross-project` points. Add to the ADR a line referencing `docs/backlog/second-brain-cross-project.md`; do NOT edit other files in Round 1 (the spec already references "the ADR").

- [ ] **Step 4: Verify (acceptance criteria — binary)**

- All 13 decision clauses present and each is unambiguous (a Round-2 engineer could implement without guessing).
- The relations table lists all 7 relations with direction + resolvability.
- The 6 locked answers (Q1–Q6) are each traceable to a clause.
- No clause contradicts the design spec §13 (spot-check: cut-line stays 6 briques; judge = Claude pool; no live "~20 €").
- ADR number is free; status = accepted.

- [ ] **Step 5: Commit**

```bash
git add docs/decisions/0008-living-knowledge-os.md
git commit -m "docs(adr): 0008 Living Knowledge OS — corpus contract + invariants"
```

---

## Task 3: STRUCTURE.md charter + the 6 frozen foundations

**Files:**
- Create: `docs/STRUCTURE.md`
- Create: `docs/knowledge/consolidation-log.md`

- [ ] **Step 1: Pre-flight reads**

Read the design spec §6 (taxonomy), §7 (code convention), §13.3 (the 6 foundations), and ADR 0008 (Task 2). Read CLAUDE.md §3 (layout) and §7 (conventions) — STRUCTURE.md is referenced from there.

- [ ] **Step 2: Write `docs/STRUCTURE.md` — sections 1–3 (taxonomy + code convention)**

```markdown
# STRUCTURE.md — MultiAgentOS Docs & Code Charter
Single source of truth for taxonomy, naming, test placement, and the "adding anything" ritual.

## 1. Taxonomy (the backbone lanes)
Lane is a FRONTMATTER field, never a renamed folder. Semantic, stable paths:
- docs/resources/ (raw → QMD mas-resources) · docs/knowledge/ (distilled → mas-knowledge)
- docs/rules/ + the charter (code standards, CI) · docs/decisions/ (ADR)
- docs/workflows/ (runbooks → mas-workflows) · maps/ (MOC entry points) · archive/ (rejected-kept + superseded, cold but QMD-retrievable, never hard-delete)
Backbone enums (required, closed): kind × register × scope × doc_type × actionability × lifecycle.
Emergent (free): tags[] + domain + MOC.

## 2. Naming
kebab-case; zero space/emoji in any path; ISO dates (YYYY-MM-DD). (This is why `docs/claude doc/` and `docs/ressources/` are renamed — §6 below.)

## 3. Code convention (graved, unchanged)
- Tests co-located (.test.ts beside source — Vitest standard, no migration to __tests__/).
- Monorepo layout (CLAUDE.md §3); binary thresholds fn<50 · file<800 · nesting≤4 · coverage≥80 (advisory).
- Single LLM injection point: packages/core/src/llm.ts. Providers via ports/adapters.
```

- [ ] **Step 3: Write `docs/STRUCTURE.md` — section 4: Distillation BODY templates (foundation a)**

Freeze one Diátaxis body skeleton per `doc_type`. Author these exact skeletons:

```markdown
## 4. Distillation body templates (one per doc_type — frozen before any distillation)

### tutorial
## Goal · ## Prerequisites · ## Steps (numbered, each verifiable) · ## Result · ## Next

### howto
## Problem · ## Solution (numbered steps) · ## Variations · ## Pitfalls

### reference
## Summary (1 line) · ## Fields/API (table) · ## Constraints · ## Examples

### explanation
## Thesis · ## Context · ## Reasoning · ## Trade-offs · ## See also ([[links]])
```

The deferred quality rubric scores against these. Each distilled `.md` body MUST match its `doc_type` skeleton.

- [ ] **Step 4: Write `docs/STRUCTURE.md` — section 5: ID/slug allocation (foundation b)**

```markdown
## 5. ID / slug allocation (immutable anchor)
- slug = kebab( `<kind>-<stem>` ); stem derives from source_key:
  - URL source_key → host + last meaningful path segment.
  - content-hash source_key → `<title-kebab>-<hash[:8]>`.
- charset [a-z0-9-] only; accents stripped; spaces→'-'; repeats collapsed.
- IMMUTABLE after first mint (renaming the file never changes id/slug).
- collisions: append `-2`, `-3`, … deterministically (first-come keeps the bare slug).
- id = slug (1:1) for v1; reserved to diverge later. Enforced by the Round-2 CI gardian.
```

- [ ] **Step 5: Write `docs/STRUCTURE.md` — section 6: Canonical paths + folder-rename decision (foundation c)**

```markdown
## 6. Canonical raw home + rename decision (Round-2 step-0, before any source_key minted)
- CANONICAL: `docs/resources/` (English, no churn — nothing is keyed yet).
- DECISION: rename `docs/ressources/ → docs/resources/` and fix the space in `docs/claude doc/`
  via `git mv` + sweep refs in CLAUDE.md/ADRs/.gitignore (`docs/ressources/*.pdf`, `docs/ressources/md/`, l.70-80) in ONE Round-2 step-0 commit (Q4). History preserved; no redirect.
- A rename AFTER ingestion would break every source_key/derived_from — hence step-0.
```

- [ ] **Step 6: Write `docs/STRUCTURE.md` — section 7: Relations summary (foundation d) + section 8: schema_version (foundation f)**

```markdown
## 7. Relations (summary — full contract in ADR 0008)
derived_from (required on distillation) · sources[] · part_of/order · superseded_by · MOC membership · [[wikilink]]. All must be resolvable (gardian enforces, Round 2).

## 8. schema_version
Current = '1'. Every fiche carries it from doc 1. Bump = idempotent migration runner keyed off the version; cross-project register refuses a fiche newer than the host (ADR 0008 §10/§11).
```

- [ ] **Step 7: Create the consolidation log (foundation e)**

Create `docs/knowledge/consolidation-log.md`:

```markdown
# Consolidation Log (append-only, Keeper-written)
Audit trail for taxonomy/lifecycle governance events. One line per event, newest at bottom.

FORMAT: `<ISO-date> | <event> | ids=<comma-sep> | lane=<lane> | keeper=<who> | note=<short>`
EVENTS: supersede | lane-promote(L1→L2|L2→L3) | archive | reject-kept | merge
(First real lines land in Round 2 when the supersede write-path goes live.)

---
```

Add a one-line pointer in `docs/STRUCTURE.md` §7/§8 area: "Governance events → `docs/knowledge/consolidation-log.md`."

- [ ] **Step 8: Verify (acceptance criteria — binary)**

- STRUCTURE.md has all 8 sections; all 6 foundations (a–f) present and concrete (a Round-2 engineer needs no further decision).
- The 4 Diátaxis skeletons exist; the ID/slug algorithm is unambiguous (collision + immutability stated); the rename decision names the exact Round-2 mechanic; consolidation-log file exists with format + header.
- No naming-rule self-violation (STRUCTURE.md itself is kebab? it is an uppercase convention file — allowed as a root charter; note it as the single ALLCAPS exception).
- Cross-refs to ADR 0008 resolve.

- [ ] **Step 9: Commit**

```bash
git add docs/STRUCTURE.md docs/knowledge/consolidation-log.md
git commit -m "docs(charter): STRUCTURE.md + 6 frozen foundations + consolidation log"
```

---

## Task 4: Fiche-contract spec (Brique 1)

**Files:**
- Create: `docs/superpowers/specs/2026-06-27-fiche-contract.md`

- [ ] **Step 1: Pre-flight reads**

Read design spec §5 Brique 1 + Brique 1·bis, ADR 0008, STRUCTURE.md (§4/§5/§7/§8), and the real schema `packages/db/src/schema.ts:224` (the `memory_candidates` table) + `packages/memory/src/arsenal.ts` (the `ArsenalStub` + lenient `parseFrontmatter` this extends).

- [ ] **Step 2: Write the authoritative Zod fiche schema as the contract**

The spec's core is one fenced TypeScript block — the *contract text* Round 2 implements (NOT wired now). Closed enums for the backbone, `.passthrough()` for emergent, reserved nullable sockets:

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

- [ ] **Step 3: Write the legal-transition DATA map**

Specify the CLOSED transition table as a committed data map (Round 2 reads it as data):

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

- [ ] **Step 4: Write the `memory_candidates` migration scope (one migration)**

```markdown
## Migration (ONE) — packages/db/src/schema.ts memory_candidates
The §3 prose ("capture writes source_key") outruns the live table (l.224 has none of these). Add in ONE migration:
- `source_key` TEXT + non-unique index (match key for idempotence/supersede/dedup).
- status enum gains `capture_failed` (currently ['pending','accepted','rejected'], l.229).
- `trust` enum column { trusted | untrusted | low } (security invariant: untrusted-never-auto-promote, §114).
Contract must be complete before the first capture write.
```

- [ ] **Step 5: Document each field group + parsing rule + CI gardian behavior (prose)**

Add prose sections: field-group rationale (IDENTITY/STRUCTURE/PROVENANCE/LIFECYCLE/TRUST/RETRIEVAL&QUALITY/GOVERNANCE/EMERGENT); the `.passthrough()` + closed-backbone rule; and a forward note that the Round-2 CI gardian reads `LEGAL_TRANSITIONS` as data, rejects illegal jumps / orphan terminal states / unresolvable `derived_from`+`[[wikilink]]`+`part_of`+`superseded_by`, severity = 2-tier (§4.4).

- [ ] **Step 6: Verify (acceptance criteria — binary)**

- Every field group from design spec §5 Brique 1 is present in `FicheSchema`.
- All 8 reserved sockets present: `source_key`, `superseded_by`, `part_of`/`order`/`manifest`, `ocr_confidence`, `retrieval_context`, `quality_score`, `schema_version`, plus the migration's 3 candidate columns.
- Backbone enums closed; `.passthrough()` present for emergent; `lane` is a free string (appendable).
- `LEGAL_TRANSITIONS` covers all 9 lifecycle states incl. capture_failed re-entry, superseded→archived, rejected-kept terminal, no-delete invariant noted.
- `quality_score` = `ReviewerVerdict` enum (Q3).
- Field names match what ADR 0008 + STRUCTURE.md reference (e.g. `superseded_by`, not `supersededBy`, in frontmatter context).

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/specs/2026-06-27-fiche-contract.md
git commit -m "docs(spec): fiche-contract (Brique 1) — Zod schema + transitions + migration"
```

---

## Task 5: Capture-contract spec (Brique 3)

**Files:**
- Create: `docs/superpowers/specs/2026-06-27-capture-contract.md`

- [ ] **Step 1: Pre-flight reads**

Read design spec §5 Brique 3 + §3 (table) + §8 (single-writer), ADR 0004 (intake + auto-capture), and `packages/memory/src/capture.ts` (the `captureCandidates` seam this extends) + the fiche-contract spec (Task 4, for the candidate row shape).

- [ ] **Step 2: Write the single-seam contract**

```markdown
## The one door
Five gates — drop-folder (docs/resources/inbox/) · CLI (pnpm mas capture <path|url>) · URL paste · upload UI · chat intent (capture:) — ALL terminate at captureCandidates(), writing memory_candidates(status=pending) with provenance columns (source_kind, source_key, dossier_path, classifier_decision, trust). NO gate writes docs/knowledge, data/memory, or an index directly (§8). v1 wires drop-folder + CLI; the other 3 gates are backlog leaves on the SAME seam.
```

- [ ] **Step 3: Write the three guarantees (SAS + dead-letter + classify), INSIDE the callee**

```markdown
## Guarantees (live INSIDE captureCandidates, never per-gate)
(a) Admission SAS: a candidate needs a resolvable source + non-empty title/summary + ≥1 classification signal, else rejected-at-the-door-with-a-reason (zero-signal junk never becomes pending).
(b) Dead-letter: extractor crash / OCR-empty / 404-paywall / oversize / double-abstain ⇒ status=capture_failed + reason, visible+relaunchable in the cockpit Inbox, never a silent disappearance.
(c) intake-audit dossier first; deterministic-first classifier (ADR 0004 §5) tags {register, scope, trust}; Keeper promotes.
```

- [ ] **Step 4: Write the keyed supersede write-path (v1 build-now)**

```markdown
## Supersede write-path (v1 — moved from backlog)
promoteCandidate is append-only today → every re-ingest of an updated source mints a duplicate active entry. v1 ships the source_key-keyed write-path: match on source_key → flip the old entry to lifecycle=superseded + set superseded_by + append one line to docs/knowledge/consolidation-log.md. ONLY the LLM ADD/UPDATE/NONE auto-judge defers (its socket = source_key + superseded_by + states, all shipped).
```

- [ ] **Step 5: Document the candidate row shape + classifier-first (prose)**

State the exact `memory_candidates` row shape after the Task-4 migration (`source_key`, `trust`, `capture_failed` available); reaffirm classifier deterministic-first (ADR 0004 §5); cross-ref the fiche-contract spec for the promoted fiche shape.

- [ ] **Step 6: Verify (acceptance criteria — binary)**

- All 5 gates listed; all converge on `captureCandidates`; "no gate writes corpus directly" stated.
- SAS + dead-letter explicitly *inside the callee* (not per-gate).
- Keyed supersede write-path present as v1; only LLM auto-judge deferred (with its named socket).
- Row shape matches the Task-4 migration columns (no field named here that the fiche spec doesn't define).
- `capture_failed` path is "visible + relaunchable, never silent".

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/specs/2026-06-27-capture-contract.md
git commit -m "docs(spec): capture-contract (Brique 3) — one seam + SAS + dead-letter + supersede"
```

---

## Task 6: Round-1 consistency self-review + adversarial Checker + gate

**Files:**
- Create: `docs/learning/2026-06-27/checker-verdict.md`

- [ ] **Step 1: Author self-review (cross-document consistency)**

Re-read all five Round-1 docs together and confirm, in a short checklist note appended to the verdict file's top:
- Field/enum names are identical across ADR 0008 ↔ STRUCTURE.md ↔ fiche-contract ↔ capture-contract (e.g. `superseded_by`, `capture_failed`, `ReviewerVerdict`, the 9 lifecycle states).
- The 6 locked answers (Q1–Q6) are each reflected in the ADR and not contradicted elsewhere.
- Every design-spec §13 build-now item that is a *Round-1 contract* (not a Round-2 build) is graved somewhere; every Round-1 foundation (a–f) has a home.
- No stale "~20 €" as a live justification; judge = Claude pool; cut-line = 6 briques.

- [ ] **Step 2: Dispatch an adversarial Checker subagent (verdict to file)**

Per the user's verdict-to-file convention, dispatch one Checker (general-purpose or Reality Checker agent) with this brief: *"Read the 5 Round-1 docs + the design spec §13 + this plan's acceptance criteria. For each task's acceptance criteria, return SATISFIED/FAILED with evidence line numbers. Flag any cross-document name mismatch, any unresolvable cross-reference, any Round-2 scope leak (code/machine that slipped into Round 1), and any contradiction with the locked decisions. Write the verdict to `docs/learning/2026-06-27/checker-verdict.md` as PASS / NEEDS_WORK / BLOCK with findings."*

- [ ] **Step 3: Resolve findings**

If the Checker returns NEEDS_WORK or BLOCK, fix the named docs and re-run the relevant acceptance criteria. Loop until PASS (bounded: if 2 rounds don't reach PASS, surface to the user).

- [ ] **Step 4: Verify (acceptance criteria — binary)**

- Checker verdict = PASS, written to `docs/learning/2026-06-27/checker-verdict.md`.
- All five deliverables committed; `git status` clean.
- No code changed (Round 1 doc-only) → 5-checks barrier N/A; confirm `git diff --stat main` shows only `docs/**`.

- [ ] **Step 5: Commit + STOP at the gate**

```bash
git add docs/learning/2026-06-27/checker-verdict.md
git commit -m "docs(learning): Round-1 checker verdict (PASS) + self-review"
```

> **STOP / gate** — present the Round-1 deliverables to the user (§14: essentiel-first + plan + reco). Do NOT start Round 2 (the build) without explicit user "go". Round-2 step-0 is the `docs/ressources/→docs/resources/` rename before any `source_key` is minted.

---

## Self-Review (run by the plan author, done)

**1. Spec coverage:** Design spec §9 Round 1 lists: (1) audit → Task 1; (2) ADR → Task 2; (3) fiche-Zod spec → Task 4; (4) capture spec → Task 5; (5) STRUCTURE.md + the 6 foundations frozen → Task 3. §13.3 foundations a–f → Task 3 (a,b,c,e + STRUCTURE refs to d,f) + Task 2 (d relations contract, f schema-version lifecycle). The 8 reserved sockets → Task 4 schema. Backfill END-STATE → recorded in ADR (cites design §4.4). All covered.

**2. Placeholder scan:** No "TBD"/"add validation"/"similar to Task N". Each doc step carries the actual skeleton/enum/table content. The two large prose deliverables (audit, ADR prose) give exact section frames + binary acceptance criteria rather than pre-written paragraphs (correct for doc authoring — the content is the engineer's grounded analysis, the *shape* is fixed).

**3. Type consistency:** Lifecycle states, `Trust`, `Kind`, `ReviewerVerdict`, `superseded_by`, `capture_failed`, `source_key`, `schema_version` are spelled identically in Task 2 (ADR), Task 3 (STRUCTURE), Task 4 (schema), Task 5 (capture). `LEGAL_TRANSITIONS` keys = the 9 `Lifecycle` enum members. `quality_score : ReviewerVerdict` consistent with Q3.

**Boundary check:** No task writes code, runs a migration, registers a QMD collection, or does the `git mv`. All Round-2 work is explicitly deferred. ✓
