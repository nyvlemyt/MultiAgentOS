# Spec — Conveyor Extractors + Pipeline (Brique 6, increment 2)

- **Date**: 2026-06-28
- **Statut**: build-now increment. Continues the chain `#53 (fiche contract) → #54 (conveyor core + capture SAS) → #55 (this)`.
- **Branch**: `knowledge-os/brique-6-extractors` off `origin/knowledge-os/brique-1` (tip `4a2a7a8`, carries #54). PR base = `knowledge-os/brique-1`.
- **Parent plan**: `docs/superpowers/plans/2026-06-27-knowledge-os-round2-conveyor.md` (the DEFER list of #54).
- **Contracts (frozen, build against — never re-decide)**:
  - ADR `docs/decisions/0008-living-knowledge-os.md` clauses 4–6, 11.
  - Design spec `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` §5 Brique 6 + §9 Round-2 item 8.
  - Capture contract `docs/superpowers/specs/2026-06-27-capture-contract.md`.
  - Fiche contract `docs/superpowers/specs/2026-06-27-fiche-contract.md`.
- **Frozen sockets this increment fills** (all shipped in #54, verified present):
  - `packages/memory/src/conveyor/extractor.ts` — `Extractor`, `ExtractorRegistry`, `ExtractResult { markdown, source_key, trust, ocr_confidence? }`.
  - `conveyor/manifest.ts` — `buildManifest`, `isMultiPart`, `SourcePart`, `ManifestNode`.
  - `conveyor/admission.ts` — `admit`, `deadLetterReason`, `DeadLetterCause`.
  - `conveyor/anti-injection.ts` — `wrapUntrusted`, `canAutoPromote`.
  - `conveyor/supersede.ts` — `planSupersede`, `markSuperseded` (the pure planning halves; this increment adds the on-disk applier).
  - `capture.ts` — `captureCandidates` → `CaptureResult { pending, failed, rejected }` (the one door).
  - `classifier.ts` — `classifyByRulesOnly`, `classifyCandidate`.
  - `registers.ts` — `promoteCandidate`, `MemoryStore`.
  - `fiche.ts` — `FicheSchema`, `isLegalTransition`, `LEGAL_TRANSITIONS`.

---

## 1. Why this increment exists

#54 froze the conveyor *interface* and built the *pure core* (extractor registry, anti-injection wrap, manifest split, admission SAS, keyed-supersede plan, the hardened `captureCandidates` door). It deliberately deferred everything whose normalization quirks "ne sont connaissables que d'un vrai fichier déposé" (design spec §5 Brique 6). The 3 real governance PDFs are now in hand (`docs/ressources/*.pdf`, tools verified: markitdown 0.1.6, pdftotext 26.04.0, python 3.13.7), so the extractor internals can be written against a real file instead of blind.

This increment makes the conveyor **operable end-to-end for the PDF path**: drop a PDF (or point the CLI at one) → clean markdown → admission → deterministic classify → manifest split → a `pending` candidate at the one door, plus the on-disk supersede applier so a re-ingest flips the old fiche instead of minting a duplicate.

## 2. Scope (frozen by user — "boost et je valide", 2026-06-28)

### BUILD now
1. **`conveyor/extractors/pdf.ts`** — PDF → `ExtractResult` via MarkItDown subprocess + `pdftotext` cross-check ([[feedback_pdf-to-md-reads]]).
2. **`conveyor/manifest.ts` extension — files-as-parts** (grouping **decision A**, frozen): a folder = one *matière* → 1 manifest-mother (MOC table-of-contents) + 1 child per file, reusing `buildManifest`. Idempotent per-file add via `source_key`.
3. **`conveyor/pipeline.ts`** — `extract → admission SAS → deterministic-rules classify → manifest → write (captureCandidates)`. Anti-injection wrap before any LLM stage; budget-gated LLM-on-abstain seam (default OFF, §11-safe).
4. **On-disk supersede applier** — applies `planSupersede`/`markSuperseded` (DB lifecycle flip + `docs/knowledge/consolidation-log.md` append) bolted onto `registers.ts promoteCandidate`.
5. **CLI `pnpm mas capture <path|url>` + `--inbox`** — the drop-folder gate (`docs/resources/inbox/`).
6. **Wiring** — pipeline terminates at `captureCandidates` (the one door); pdf extractor registered into a shared registry.

### DEFER (named prise, not buildable blind)
- **URL extractor** (`extractors/url.ts`, Defuddle + Turndown) — no fixture in hand. *Prise: `ExtractorRegistry` open-string kind, `unknown → capture_failed`.*
- **LLM atomic distillation → `docs/knowledge`** (the `distill` conveyor stage that writes a distilled fiche body) — Tranche 2 + cockpit Brique 5. *Prise: `derived_from` + `quality_score` reserved; `wrapUntrusted` + budget gate already shipped; the capture path writes the raw markdown candidate, the Keeper distills on promote.*
- **`docs/ressources/ → docs/resources/` rename + ref sweep** — that is design-spec §9 **Round-2 step-0** (item 6.0, ADR Q4), a separate single commit *before any `source_key` is minted at scale*. NOT this increment. The CLI takes an explicit path, so v1 verification runs against the existing `docs/ressources/*.pdf` regardless of folder name. The `--inbox` drop folder is created fresh at `docs/resources/inbox/` (gitignored, no legacy files to move).
- **DOCX/PPTX/YouTube/OCR extractors**, **content-hash near-dup (SimHash)**, **image/table richness + `ocr_confidence` populated** — backlog leaves, all with prises shipped.

## 3. Design decisions (spec-level — grounded in frozen contracts, surfaced for PR review)

### D1 — PDF extractor: markitdown primary, pdftotext cross-check, never-silent
- **Primary**: `python3 -m markitdown <path>` (stdout = markdown). markitdown preserves structure (headings/lists) but **mangles tables** ([[feedback_pdf-to-md-reads]]).
- **Cross-check**: `pdftotext -layout <path> -` (stdout = plain text). Two roles:
  - **Liveness/empty guard**: if markitdown returns near-empty (`< MIN_CHARS` after trim) but pdftotext has real text → markitdown under-extracted → **fall back to the pdftotext text** (wrapped as a fenced plain-text block) rather than lose content. If *both* are empty → dead-letter `ocr_empty` (a scanned/image PDF with no text layer; real OCR is a deferred leaf).
  - **Coverage signal**: record a coverage ratio (`markitdownChars / pdftotextChars`) in the result metadata for later table-richness triage; it does **not** gate v1.
- **`source_key`** = `pdf:<sha256(file-bytes)>` — content-addressed, stable across renames, idempotent re-ingest. (Fiche contract: "content-hash" for non-URL sources.)
- **`trust`** = `'untrusted'` **always** — a dropped external file is untrusted free text (anti-injection §114). `canAutoPromote('untrusted') === false` → never auto-promoted regardless of allowlist. `ocr_confidence` left `undefined` (markitdown is text extraction, not OCR — the OCR-low→`trust:low` gate stays reserved for the deferred OCR leaf).
- **Determinism seam**: the subprocess invocations are injected as a `PdfRunner` dependency (`{ markitdown(path), pdftotext(path) }`). TDD passes a fake runner (zero subprocess); the real runner (`node:child_process execFileSync`, no shell, args as array → no injection) is used by the CLI and by the end-to-end verification against the 3 PDFs. **Crash** in either subprocess → caught → mapped to dead-letter `extractor_crash` by the pipeline (the extractor throws a typed error; it never returns a half-result).

### D2 — manifest files-as-parts (grouping decision A)
- New pure helper `buildFileManifest(input)` in `manifest.ts`:
  - Input: `{ parentId, title, trust, derivedFrom, files: { sourceKey, heading, markdown }[] }`.
  - Each file → one `SourcePart`; `source_key` is **per-file** (each child keeps its own content-hash so a single updated file supersedes only its child).
  - Reuses `buildManifest` for the mother+children split. The mother's `source_key` = `matiere:<slug(title)>` (a stable group key, distinct from any file hash — re-adding a file to the matière matches the child key, never the mother).
  - Single file → `isMultiPart` false → caller emits one flat candidate, no manifest (no orphan-of-one).
- The manifest mother + children are emitted as **N+1 candidates** through `captureCandidates`, the mother carrying the MOC body, each child carrying `part_of`/`order` provenance in its body header (the candidate row has no `part_of` column — that lives on the promoted *fiche*; the candidate stages it in the body + `source_key`).

### D3 — pipeline classify: rules-first, §11-safe by default, budget-gated LLM-on-abstain
- The capture path runs **`classifyByRulesOnly(body)`** — zero LLM, zero spend, §11-safe by construction (mirrors the close-out ritual ethos).
- **Abstain (rules return null)**: the candidate is still admitted as `pending` with `classifier_decision = 'abstain — needs human triage'`. It is **never silently mis-filed** and **never auto-filed** (classifier.ts: "an abstaining trusted candidate stays in the inbox").
- The **budget-gated LLM-on-abstain** path is built + tested but **default OFF**: `runCapturePipeline` accepts optional `{ llm, budget }`. When both are supplied and rules abstain, it calls `evaluateBudget(...)` *before* the LLM call; if blocked → the candidate is dead-lettered/paused with `budget_exceeded` (never a silent quota bomb — design spec §5 "un drop de 50 PDF sans ça = bombe de quota"); else it runs `classifyCandidate` with the body **wrapped via `wrapUntrusted`** before reaching the model. This satisfies the non-negotiable budget + anti-injection guardrails while keeping the CLI default a pure deterministic, zero-spend run.
- **Candidate shape** the pipeline writes (within the frozen row — no new columns):
  - `type: 'reference'` (external document), `sourceKind: undefined` (the closed enum `note|skill|pattern|repo|course|mission` has no value for a generic conveyor resource; provenance rides `source_key` + body, not a forced enum mismatch — a dedicated `resource` provenance value is a backlog leaf with its own migration). `source_key` = the pdf/matière key. `trust: 'untrusted'`. `classifier_decision` = the rule name or `abstain`. `body` = the clean markdown (mother = MOC; child = `<!-- part_of: … order: n -->` header + its markdown).

### D4 — on-disk supersede applier
- New `applySupersede` in `registers.ts`, called inside `promoteCandidate` when the incoming candidate's `source_key` matches a live (active) fiche:
  - reads existing fiche frontmatter, runs `markSuperseded(frontmatter, incomingId)` (guarded by `isLegalTransition`), rewrites the superseded file in place (status-flip, **never hard-delete** — ADR 0008 §5).
  - appends one line to `docs/knowledge/consolidation-log.md` via the `planSupersede(...).logLine` format (`<date> | supersede | ids=… | lane=… | keeper=… | note=…`).
  - Memory-Keeper-guarded (reuses `MemoryStore` writer-identity check, §8). `date` injected (deterministic tests).
- For v1, the "fiche store" the applier reads/writes is the existing register markdown surface; the keyed match operates on `source_key` carried on promoted entries. The pure `planSupersede`/`markSuperseded` remain the frozen socket; this is their first on-disk caller (the LLM ADD/UPDATE/NONE auto-judge stays deferred — its socket is the same `source_key` + `superseded_by`).

### D5 — `mas` CLI
- New `packages/memory/src/mas-cli.ts`, run via `tsx` (mirrors `seed-cli.ts`/`doctor-cli.ts`, including the `findRepoRoot` walk-up).
- Subcommands:
  - `capture <path|url>` — resolve extractor by inferred kind (`.pdf` → `pdf`; anything else / URL → currently `unknown_source_kind` dead-letter until the URL leaf lands, **never a silent skip**), run `runCapturePipeline`, print a `CaptureResult` summary (`pending`/`failed`/`rejected` counts + ids).
  - `--inbox [dir]` — process every file under `docs/resources/inbox/` (default), one pipeline run each, aggregate the summary. Creates the dir if absent.
- Package scripts: `@mas/memory` gains `"mas": "tsx src/mas-cli.ts"`; root `package.json` gains `"mas": "pnpm --filter @mas/memory mas"` so `pnpm mas capture <path>` works. Args after `--` pass through (`pnpm mas capture -- docs/ressources/foo.pdf`); the CLI also reads bare argv for the common case.
- **§11 safety**: the CLI default path is zero-LLM (rules-only). The LLM-on-abstain flag is opt-in (`--classify-llm`) and budget-gated.

## 4. Non-negotiable guardrails (design spec §5 Brique 6 — all preserved)
- **Budget**: any LLM-touching stage is gated by `evaluateBudget`/`checkDispatchBudget`; a batch checks budget *before* each call and pauses with `budget_exceeded`. v1 default runs no LLM, so the bomb risk is structurally absent; the gate is built+tested for the opt-in path and the deferred distill stage's prise.
- **Anti-injection**: untrusted body is `wrapUntrusted`-fenced before any LLM stage; candidate tagged `trust: untrusted`; never auto-promoted.
- **One door**: the pipeline writes **only** through `captureCandidates` — it never writes `docs/knowledge`, `data/memory`, or an index directly (§8). The supersede applier is the Keeper-guarded promote path, not a capture-side write.
- **Never-silent**: extractor crash / empty / oversize / unknown-kind → `capture_failed` + reason, visible + relaunchable; abstain → pending+flagged, never dropped.
- **§11 billing**: no `@anthropic-ai/sdk` import; LLM only via the injected `LLMClient` seam (mock in tests); no raw key.
- **Barrel hygiene**: conveyor units + pipeline are **not** re-exported through `@mas/memory`'s `index.ts` (Brique 1d Next-smoke-overflow rule) — consumed only by the CLI via relative imports.

## 5. Done-criteria (this increment)
- TDD on each new unit: pdf extractor (markitdown-primary · pdftotext fallback-on-empty · both-empty→`ocr_empty` · crash→typed throw · content-hash `source_key` · `trust:untrusted`); manifest files-as-parts (mother MOC + per-file children · single-file→no-manifest · per-file `source_key`); pipeline (extract→SAS→rules-classify→manifest→captureCandidates · abstain→pending+flagged · unknown-kind→dead-letter · budget-blocked→pause · anti-injection wrap applied); supersede applier (active match→flip+log-append · no-match→plain append · illegal transition→throw · never hard-delete); CLI (`capture` summary · `--inbox` aggregate · unknown kind→dead-letter not skip).
- **5-check gate green on HEAD**: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar (`scripts/sonar-pr-issues.sh <pr>` exit 0 **and** `qualitygates/project_status == OK`, analysis sha == HEAD).
- **End-to-end**: `pnpm mas capture` on the 3 real PDFs produces clean markdown candidates; one grouping (matière→manifest) case verified.
- PR opened **as draft** off `knowledge-os/brique-1`.

## 6. Out of scope (explicit)
URL/DOCX/PPTX/YouTube/OCR extractors · LLM distillation to `docs/knowledge` · the `docs/ressources→docs/resources` rename · cockpit Brique 5 Inbox UI · the LLM ADD/UPDATE/NONE auto-judge · SimHash near-dup · recall-gate promotion. Each has a named prise in the design spec §9 backlog.
