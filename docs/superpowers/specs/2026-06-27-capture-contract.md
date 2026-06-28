# Spec — Capture Contract (Brique 3)

- **Date**: 2026-06-27
- **Statut**: Round-1 (doc-only). This is the **Brique 3 capture contract** — Round-2 implements it in `packages/memory` (extending the `captureCandidates` seam in `packages/memory/src/capture.ts`). **v1 wires the drop-folder + CLI gates; the other 3 gates are backlog leaves on the same seam.** Nothing here is wired into the build yet: no code added, no migration run, no `capture.ts`/`schema.ts` edit.
- **Source of truth**: ADR `docs/decisions/0008-living-knowledge-os.md` + the fiche-contract spec `docs/superpowers/specs/2026-06-27-fiche-contract.md` (candidate row shape + the one migration — field names must match it exactly) + ADR `docs/decisions/0004-memory-intake-and-auto-capture.md` (intake dossier + deterministic-first classifier, §5).
- **Origin**: design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` §5 Brique 3 + §3 (the reuse table) + §8 (single-writer).

---

## The one door

Five gates — drop-folder (docs/resources/inbox/) · CLI (pnpm mas capture <path|url>) · URL paste · upload UI · chat intent (capture:) — ALL terminate at captureCandidates(), writing memory_candidates(status=pending) with provenance columns (source_kind, source_key, dossier_path, classifier_decision, trust). NO gate writes docs/knowledge, data/memory, or an index directly (§8). v1 wires drop-folder + CLI; the other 3 gates are backlog leaves on the SAME seam.

## Guarantees (live INSIDE captureCandidates, never per-gate)

(a) Admission SAS: a candidate needs a resolvable source + non-empty title/summary + ≥1 classification signal, else rejected-at-the-door-with-a-reason (zero-signal junk never becomes pending).
(b) Dead-letter: extractor crash / OCR-empty / 404-paywall / oversize / double-abstain ⇒ status=capture_failed + reason, visible+relaunchable in the cockpit Inbox, never a silent disappearance.
(c) intake-audit dossier first; deterministic-first classifier (ADR 0004 §5) tags {register, scope, trust}; Keeper promotes.

## Supersede write-path (v1 — moved from backlog)

promoteCandidate is append-only today → every re-ingest of an updated source mints a duplicate active entry. v1 ships the source_key-keyed write-path: match on source_key → flip the old entry to lifecycle=superseded + set superseded_by + append one line to docs/knowledge/consolidation-log.md. ONLY the LLM ADD/UPDATE/NONE auto-judge defers (its socket = source_key + superseded_by + states, all shipped).

## Candidate row shape (after the Task-4 migration)

The `memory_candidates` row that every gate writes through `captureCandidates` is — after the **one** migration defined in the fiche-contract spec (Migration section) — exactly:

| Column | Note |
|---|---|
| `id` | existing |
| `source_task_id` | existing |
| `type` | existing |
| `body` | existing |
| `status` | existing enum, now **gains `capture_failed`** (was `['pending','accepted','rejected']`) — the dead-letter state |
| `source_kind` | existing (intake provenance) |
| `dossier_path` | existing (intake-audit dossier) |
| `classifier_decision` | existing |
| `auto_filed` | existing |
| `created_at` | existing |
| `source_key` | **NEW** — TEXT + non-unique index; the supersede/idempotence/dedup match key |
| `trust` | **NEW** — enum `{ trusted \| untrusted \| low }`; security invariant (untrusted-never-auto-promote, §114 anti-injection) |

Only those **3 deltas** are new (the `source_key` column, the `trust` enum column, and the `capture_failed` value added to the `status` enum). No field is named in this contract that the fiche-contract spec / migration does not define. The contract must be complete **before the first capture write** — a pre-column row would have `trust` NULL = risk of auto-promoting an unvetted source.

The **promoted fiche** that a candidate becomes (after the Keeper promotes it) follows the `FicheSchema` in the fiche-contract spec §1 — the candidate row is the inbox staging shape; the fiche is the corpus shape. Cross-reference that spec for the full promoted-fiche field set.

## Classifier — deterministic-first (reaffirmed)

The classifier is **deterministic rules first, light LLM only on abstain** (ADR 0004 §5): a rule table maps a candidate/dossier to `{register, scope, trust}` from cheap signals (source type, keywords, the emitting task's tags, explicit user tag). Only on **abstain** does a single light subscription LLM call classify, and that call is logged to `/trace`. No embeddings, no PAYG (§11). A **double-abstain** (rules abstain → LLM abstains) is a dead-letter trigger (above), not a silent drop.

## Why the SAS + dead-letter live inside the callee

Because the Admission SAS and the dead-letter path live **inside `captureCandidates` itself** — not re-implemented per gate — every future gate (URL paste, upload UI, chat intent, and any later hook) **inherits junk-rejection and the never-silent failure path for free**, simply by calling the seam. A new gate cannot accidentally admit zero-signal junk or silently lose a failed capture: those invariants are a property of the door, not of who knocks on it. This is the §8 "one door" guarantee made operational.
