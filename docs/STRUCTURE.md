# STRUCTURE.md — MultiAgentOS Docs & Code Charter

Single source of truth for taxonomy, naming, test placement, and the "adding anything" ritual. Anything not contracted here defers to CLAUDE.md §3 (repo layout) and §7 (conventions); this charter elaborates them and never contradicts them.

> **Naming exception:** this file is intentionally ALLCAPS — the single allowed exception to the kebab-case naming rule in §2 below, matching the root-charter convention of `CLAUDE.md` / `AGENTS.md`. No other path may use ALLCAPS or otherwise break §2.

## 1. Taxonomy (the backbone lanes)

The taxonomy is a stable spine of lanes plus a free emergent layer. Lane is a FRONTMATTER field, never a renamed folder. Semantic, stable paths:

- `docs/resources/` (raw → QMD `mas-resources`) · `docs/knowledge/` (distilled → `mas-knowledge`)
- `docs/rules/` + the charter (code standards, CI) · `docs/decisions/` (ADR)
- `docs/workflows/` (runbooks → `mas-workflows`) · `maps/` (MOC entry points) · `archive/` (rejected-kept + superseded, cold but QMD-retrievable, never hard-delete)

Backbone enums (required, closed): `kind` × `register` × `scope` × `doc_type` × `actionability` × `lifecycle`.

Emergent (free): `tags[]` + `domain` + MOC.

## 2. Naming

kebab-case; zero space/emoji in any path; ISO dates (`YYYY-MM-DD`). (This is why `docs/claude doc/` and `docs/ressources/` are renamed — §6 below.)

## 3. Code convention (graved, unchanged)

These restate CLAUDE.md §3/§7 as charter law; they are gravings, not new choices:

- Tests co-located (`.test.ts` beside source — Vitest standard, no migration to `__tests__/`).
- Monorepo layout (CLAUDE.md §3); binary thresholds fn<50 · file<800 · nesting≤4 · coverage≥80 (advisory).
- Single LLM injection point: `packages/core/src/llm.ts`. Providers via ports/adapters.

## 4. Distillation body templates (one per doc_type — frozen before any distillation)

Every distilled fiche writes ONE body. These four Diátaxis skeletons are frozen now, before any backfill or first distillation, so the corpus is never re-distilled to standardize a body shape later. Pick the skeleton by the fiche's `doc_type`; the deferred quality rubric scores the body against its template.

### tutorial

`## Goal` · `## Prerequisites` · `## Steps` (numbered, each verifiable) · `## Result` · `## Next`

### howto

`## Problem` · `## Solution` (numbered steps) · `## Variations` · `## Pitfalls`

### reference

`## Summary` (1 line) · `## Fields/API` (table) · `## Constraints` · `## Examples`

### explanation

`## Thesis` · `## Context` · `## Reasoning` · `## Trade-offs` · `## See also` (`[[links]]`)

## 5. ID / slug allocation (immutable anchor)

The id/slug is minted once and never moves. The algorithm is deterministic so two ingestions of the same source resolve to the same id:

- slug = kebab( `<kind>-<stem>` ); stem derives from `source_key`:
  - URL `source_key` → host + last meaningful path segment.
  - content-hash `source_key` → `<title-kebab>-<hash[:8]>`.
- charset `[a-z0-9-]` only; accents stripped; spaces→`-`; repeats collapsed.
- IMMUTABLE after first mint (renaming the file never changes id/slug).
- collisions: append `-2`, `-3`, … deterministically (first-come keeps the bare slug).
- id = slug (1:1) for v1; reserved to diverge later. Enforced by the Round-2 CI gardien.

## 6. Canonical raw home + rename decision (Round-2 step-0, before any source_key minted)

The raw lane has one canonical home, chosen now while nothing is keyed yet — because a rename after ingestion would break every `source_key`/`derived_from`:

- CANONICAL: `docs/resources/` (English, no churn — nothing is keyed yet).
- DECISION: rename `docs/ressources/ → docs/resources/` and fix the space in `docs/claude doc/` via `git mv` + sweep refs in CLAUDE.md/ADRs/.gitignore (`docs/ressources/*.pdf`, `docs/ressources/md/`, l.70-80) in ONE Round-2 step-0 commit (Q4). History preserved; no redirect.
- A rename AFTER ingestion would break every `source_key`/`derived_from` — hence step-0.

## 7. Relations (summary — full contract in ADR 0008)

Every fiche declares its links, and all of them must resolve. Summary of the relation set (the full contract — directions, required-ness, and per-relation resolvability rules — is the table in ADR 0008 clause 6):

`derived_from` (required on distillation) · `sources[]` · `part_of`/`order` · `superseded_by` · MOC membership · `[[wikilink]]`. All must be resolvable (the CI gardian enforces this, Round 2).

## 8. schema_version

Every fiche carries a schema version from doc 1 so the corpus can migrate without a fork:

Current = `'1'`. Every fiche carries it from doc 1. Bump = idempotent migration runner keyed off the version; cross-project register refuses a fiche newer than the host (ADR 0008 clause 10).

> Governance events → `docs/knowledge/consolidation-log.md`.
