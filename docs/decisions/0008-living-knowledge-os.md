# ADR 0008 — Living Knowledge OS (corpus contract + invariants)

- **Status**: Accepted
- **Date**: 2026-06-27
- **Origin**: Round-1 (doc-only) of the design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` (Brique 2, §6, §13) + the Round-1 plan; deciders Melvyn + Claude. Fed by the base audit `docs/audits/2026-06-27-base-audit.md`.

## Context

The MultiAgentOS "base" today is a **library without a filing plan**: resources land wherever there is room (loose PDFs at the root of `docs/`, a folder with a space in its name, raw PDFs mixed with their `.md` siblings, duplicates, no table of contents, no naming rule, no structure charter). The code architecture itself is clean (a bounded-package monorepo); the disorder is in the **knowledge corpus**, not the source tree. The base audit (`docs/audits/2026-06-27-base-audit.md`) confirms this and feeds the remediation that this ADR governs.

The real problem is not "tidy up once". The user keeps bringing new resources, courses, web findings, and notes — each shaped differently and unstructured — and the Notion index he supplied is **one sampled source from a third party, not the law**. So the goal is a **living knowledge OS**: an organ that digests *any* source into a classified, distilled, indexed, retrievable fiche, operable by MAOS agents and reproducible across child projects. Tidying the existing base becomes the **first pass** of that machine, not a one-off cleanup.

Two constraints changed on 2026-06-27 and reshape the posture. First, **the budget moved 20 € → 100 €/month (Claude Max)**: the budget *discipline* (the `budgets` table, pause-on-cap, never PAYG, CLAUDE.md §11/§11.bis) stays whole, but the old "~20 €" ceiling is no longer a design factor — any decision that was justified "because 20 €" is re-decided here. Second, the user's directive is **completeness over YAGNI** ([[feedback_completeness-over-yagni]]): foundations, contracts, and invariants are frozen at 100 % **now**; only a *reversible leaf* may be deferred, and only when a **named socket** in the schema makes the future add-on require zero foundation rework.

This ADR is the **paper layer**. It records the contracts and invariants that Round-2 will build against, so the build round inherits a frozen corpus shape and never has to rewrite the corpus to satisfy a late decision. It writes one file only; no code, no migration, no `git mv`, no QMD registration happens here. This ADR is the target of `docs/backlog/second-brain-cross-project.md` (the cross-project second-brain card points here, per design spec Brique 2).

The decision below graves 13 clauses. Their substance is **corpus invariants and contracts** — paths, enum values, field names, and rules are load-bearing and are reproduced exactly. The six user-locked answers (Q1–Q6, design spec §13.5 annex) are honored and each is traceable to a clause (mapping in Consequences).

## Decision

1. **Frontiers** — project memory at `data/memory/<projectId>/`, global at `data/memory/_global/` (CLAUDE.md §8). Memory Keeper is the only writer (§8).
2. **Single corpus, two faces** — build-time `docs/knowledge/` ⇄ runtime `data/memory/` is ONE corpus bridged by the §13 persistence bridge; neither diverges.
3. **Taxonomy** — backbone (stable, carried by the frontmatter `lane` field, ~7 lanes, NOT renamed folders) + emergent (`tags[]`/`domain`/MOC). The **3-occurrence rule** (2=coincidence, >5=late) is a first-class promotion rule; L1→L2→L3 hardening (DURCIR) recorded as frontmatter back-references + one line in the consolidation log.
4. **Lifecycle state machine** — `captured→triaged→distilled→audited→active→superseded→archived` (+ `rejected-kept`, `capture_failed`). The **legal-transition table is CLOSED on day 1** and emitted as a committed DATA map (JSON/TS const read as data), including: `capture_failed` re-entry, `superseded→archived`, `rejected-kept` terminal-but-retrievable, and an explicit **no-hard-delete edge**. Adding a future state = one data row, never a guardian rewrite.
5. **Archive-never-delete** — supersede = status-flip + `superseded_by`; an entry with an `id` is never hard-deleted.
6. **Relations-model contract** — the relation set is first-class (see table below); the CI gardian (Round 2) enforces resolvability. A future graph is a projection of this, never a re-author.
7. **Notion index = one audited source** mapped onto the neutral spine; it supersedes nothing and is not the schema.
8. **Charter** — single frontmatter + CI gardien + QMD collections + single-writer (§8); the charter lives in `docs/STRUCTURE.md`.
9. **Portable contract** — `schema_version` + lane definitions + classifier rule-table + QMD collection set are EXTERNAL config files (mirror `config/model-routing.json`), travelling with a project register. A child reads the versioned, data-not-code pack with zero refactor.
10. **schema_version lifecycle** — initial `'1'`; a bump ships with an idempotent migration runner that keys off the version; the backfill runner and the cross-project register both read it; the register **refuses** a fiche whose `schema_version` exceeds the host's (Q5).
11. **Quality posture (revision 2026-06-27)** — judge AT distillation = **Sonnet**; promotion = **Opus** (Q1); subscription pool, never PAYG (§11). `quality-score` = enum `ReviewerVerdict` (Q3). Budget-pause MECHANISM kept (anti-runaway, §6/§11.bis); the threshold is a Round-2 config value (Q2); the dead "~20 €" ceiling is removed as a design factor (100 € Max).
12. **Contextual-Retrieval** — deferred-with-socket: `retrieval_context` reserved now; the recall@k build-trigger is set after the first golden-set baseline (Q6). GraphRAG / homemade RRF / homemade cross-encoder stay rejected on merit (QMD subsumes them; it already ships `qwen3-reranker-0.6b`).
13. **Consolidation log** — canonical path `docs/knowledge/consolidation-log.md` (committed audit trail); per-project runtime mirrors under `data/memory/<id>/` are Round-2+.

### Relations-model contract (clause 6)

The relation set below is a first-class corpus contract. The CI gardian (Round 2, mirror of `scripts/lint-no-sdk-payg.sh`) validates each committed frontmatter under `docs/resources/**` and `docs/knowledge/**` and **rejects** any unresolvable relation. A future knowledge graph is a *projection* of this table, never a re-authoring of it.

| Relation | Direction | Required? | Resolvability rule (gardian, Round 2) |
|---|---|---|---|
| `derived_from` | fiche → rawResourcePath | yes, on any distillation | path must exist under docs/resources/** |
| `sources[]` | fiche → [path\|url] | optional | each entry resolvable (path exists / URL well-formed) |
| `part_of` | child → parentId | nullable | parentId must be an existing fiche id |
| `order` | int, with part_of | with part_of | integer ≥ 0 |
| `superseded_by` | fiche → fiche id | set when lifecycle=superseded | target id exists and is not itself superseded by this one (no cycle) |
| MOC membership | fiche ↔ MOC | optional | via `[[wikilink]]` resolvable to an existing slug |
| `[[wikilink]]` | fiche → fiche | free | resolves to an existing slug |

## Consequences

**What becomes true / easier**

- **Round-2 build never forces a corpus-wide rewrite.** Because the lifecycle table (clause 4), the relation set (clause 6), the ID/slug and provenance contracts (clauses 5–6), and the body/quality contracts (clauses 11–12) are frozen as paper now, the build round inherits a settled corpus shape. Late decisions become *one data row* or *one config value*, never a re-distillation of the corpus.
- **Cross-project portability is concrete.** `schema_version` + lane definitions + classifier rule-table + QMD collection set are external config (clauses 9–10), so a registered child project inherits the same governance by copying a versioned, data-not-code pack — the reproducibility artifact the second-brain card asks for. (This ADR is the target of `docs/backlog/second-brain-cross-project.md`.)
- **Archive-never-delete safety.** Supersede is a status-flip + `superseded_by` (clauses 4–5); an entry with an `id` is never hard-deleted, so links survive re-ingestion and rename, and `rejected-kept` material stays retrievable in the cold tier.
- **Taxonomy evolves by addition, not rewrite.** The backbone is an *appendable* enum carried by the `lane` field (clause 3); the parser is lenient/passthrough for emergent `tags[]`/`domain`. Promotion is the objective 3-occurrence rule, so the spine grows without churning folder paths.

**Costs accepted**

- **A CLOSED transition table that must be edited as data.** Clause 4 forbids ad-hoc guardian edits; every future state/transition is a committed data row, which is more discipline than a free-form check but is the price of a stable invariant.
- **A backfill obligation in Round 2.** The 1132 legacy docs must be stamped (tier-1 identity now, tier-2 rich fields at-touch) so they are legal targets of `superseded_by`/`derived_from`; the gardian must not RED the repo on day 1.
- **schema-version discipline.** Every fiche carries `schema_version` from doc 1 (clause 10); each bump ships an idempotent migration runner, and the cross-project register refuses a fiche whose version exceeds the host's.

**Trace map — the six locked answers (Q1–Q6, design spec §13.5)**

- **Q1** (judge family) → **clause 11**: Sonnet at distillation, Opus at promotion, subscription pool, never PAYG.
- **Q2** (budget-pause threshold) → **clause 11**: the mechanism is kept; the number is a Round-2 config value, not graved here.
- **Q3** (`quality-score` shape) → **clause 11**: enum `ReviewerVerdict` = `PASS | NEEDS_WORK | BLOCK`.
- **Q4** (folder rename) → **clause 8 / `docs/STRUCTURE.md`**: Round 1 only records the decision and freezes `docs/resources/` as the canonical path; the actual rename is a Round-2 step-0 `git mv` + ref sweep in a single commit, before any `source_key` is minted.
- **Q5** (`schema_version`) → **clause 10**: initial `'1'`; bump ships an idempotent migration runner; the cross-project register refuses a fiche whose `schema_version` exceeds the host's.
- **Q6** (Contextual-Retrieval trigger) → **clause 12**: `retrieval_context` reserved now; the recall@k build-trigger is set after the first golden-set baseline (no blind number).

**Anti-divergence invariants (re-stated for the build round)**

- The `docs/knowledge/ ⇄ data/memory/` bridge stays ONE corpus (clause 2).
- No capture door writes `docs/knowledge/`, `data/memory/`, or an index directly — everything goes through the single `captureCandidates()` seam and the Memory Keeper write-lock (clause 1, §8).
- No untrusted source is ever auto-promoted (the `trust` invariant carried alongside this contract).
- The v1 cut-line stays **6 briques** (design spec §13): completeness here means graving every foundation + socket, not building all 21 backlog features.
