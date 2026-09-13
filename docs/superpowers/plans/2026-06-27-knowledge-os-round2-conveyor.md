# Brique 6 — Ingestion Conveyor (Round-2 sub-plan)

- **Date**: 2026-06-28
- **Parent plan**: `docs/superpowers/plans/2026-06-27-knowledge-os-round2.md` §Task 3
- **Contracts**: ADR `docs/decisions/0008-living-knowledge-os.md` (clauses 4–6, 11) · design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` §5 Brique 6 + §9.8 · capture-contract `docs/superpowers/specs/2026-06-27-capture-contract.md`
- **Branch**: `knowledge-os/brique-6` (off `knowledge-os/brique-1` tip `c3e25db`, chains PR #53)

## Why this is split (frozen core now, extractor internals later)

The design spec freezes the **interface** at B6 but writes the **extractor internals against a real dropped file** — "leurs quirks de normalisation ne sont connaissables que d'un vrai fichier déposé — les bâtir à l'aveugle = re-faire" (§5 Brique 6). So this session builds the **pure core** (deterministic, TDD-able with zero real source) and defers anything that needs a real PDF/URL in hand.

## Build NOW — pure units, TDD, in `packages/memory/src/conveyor/` (NOT re-exported through the `@mas/memory` barrel — same Next-smoke-overflow rule as the Brique 1d gardien)

| Unit | Responsibility | Purity |
|---|---|---|
| `extractor.ts` | **FROZEN** `ExtractResult { markdown, source_key, trust, ocr_confidence? }` + `Extractor = (sourceKind: string, source: string) => Promise<ExtractResult>` + `ExtractorRegistry` keyed on an **open** string kind; unknown kind → dead-letter (`capture_failed`). | pure |
| `anti-injection.ts` | Hardened-prompt wrap: untrusted body is **DATA, never an instruction**, delimited + break-out-escaped, before any LLM stage; `canAutoPromote(trust)` ⇒ `true` only for `trusted` (untrusted/low never auto-promote). | pure |
| `manifest.ts` | Parent/child split: a multi-part source → 1 manifest fiche (provenance + MOC table-of-contents) + N atomic children carrying `part_of` + `order` (LlamaIndex document+nodes; a 12-lesson course never splits into 12 orphans). | pure |
| `admission.ts` | Admission SAS (`admit`): resolvable source + non-empty content + ≥1 classification signal, else reject-with-reason. Dead-letter taxonomy (`deadLetterReason`): extractor crash / ocr-empty / paywall-404 / oversize / double-abstain / unknown-source-kind ⇒ `capture_failed` + reason. | pure |
| `supersede.ts` | `planSupersede(existing, incoming, {date, keeper})` keyed on `source_key` → `{ supersededId, supersededBy, logLine }` (consolidation-log format `<date> | supersede | ids=… | lane=… | keeper=… | note=…`); `markSuperseded(frontmatter, by)` = legal lifecycle-flip `active→superseded` + `superseded_by` (guarded by `isLegalTransition`). | pure |

Plus, **not** pure but in-scope:
- **`capture.ts` hardening** (the one door, capture-contract §"Guarantees live INSIDE captureCandidates"): `CaptureCandidate` gains `sourceKey` / `trust` / SAS inputs / a `captureFailed` dead-letter marker; the seam runs the SAS at the door, writes `capture_failed` rows for dead-letters, never persists SAS-rejected junk, and returns a structured `CaptureResult { pending, failed, rejected }` (the data shape Brique 5's Inbox renders). Callers `auto-capture.ts` + `intake.ts` updated.
- **Config flip** (`config/model-routing.json` domain `memory`, decision §13.2 quality-default): `gemini-free`-primary → `{ "primary": "claude", "fallback": ["gemini-free"] }`, dropping the paid `openai` from this domain — classify + distill permanently shape the corpus, so they run on the strong subscription model. Assertion added in `config.test.ts`.

## DEFER — needs a real dropped file (own follow-up once a source lands in `docs/resources/inbox/`)

- `extractors/url.ts` (Defuddle + Turndown) + `extractors/pdf.ts` (MarkItDown subprocess + `pdftotext` cross-check) **internals**.
- `pipeline.ts` wiring (`normalize → classify → distill → index`) + the budget gate's live `budgets`-table check per LLM call.
- CLI `pnpm mas capture <path|url>` + the drop-folder watcher gate.
- On-disk **applier** of the supersede plan in `registers.ts promoteCandidate` (DB lifecycle-flip + `consolidation-log.md` append) — the pure `planSupersede`/`markSuperseded` are its frozen socket.

## Done-criteria (this session)

TDD on each pure unit (manifest split · anti-injection wrap + break-out escape · SAS admit · dead-letter classification · supersede match + legal flip); capture-seam hardening with no untrusted auto-promotion and a never-silent dead-letter; config flip asserted; the 5-check gate green on HEAD (`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar exit 0 + gate OK).
