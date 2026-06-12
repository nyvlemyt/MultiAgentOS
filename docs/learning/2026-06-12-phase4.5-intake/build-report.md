# Phase 4.5 (producer) — build report (2026-06-12)

**Branch**: `phase/4.5-memory-intake` (off `phase/4-memory`, 13 commits ahead of main at branch point — PR #5 merge pending).
**Scope decision at kickoff**: **producer-only** (Doer steps 1–7), per the build-prompt default and ADR 0004 scope-risk clause. Receptacle (Ideas/Decisions/prioritization UI) deferred to after Phase 3.5; ROADMAP "Build order" updated.

## Done (all TDD — red watched before green, every step committed)

| Step | Artifact | Commit |
|---|---|---|
| Pre-flight | `preflight-audit.md` + classifier-signals distilled into `docs/knowledge/memory-patterns.md` | `7424a91` |
| 1. Auto-capture hook | `packages/memory/src/auto-capture.ts` (`runCloseOutRitual`), fired in `runReviewPhase` (web+worker chokepoint), idempotent via `auto_capture_fired` event, best-effort | `ca20d10` |
| 2. Intake module | `packages/memory/src/intake.ts` — note/skill/pattern direct; repo/course refused without PASS; dossier `docs/intake/<date>-<slug>.md` + candidate via the seam | `df78ee7` |
| 3. Classifier | `packages/memory/src/classifier.ts` — user-tag → keywords → source-kind; DI'd light-LLM only on abstain + `onLlmFallback` notification | `77fa79e` |
| 4. Security gate | `packages/agents/src/intake-gate.ts` (`runGatedIntake`) — sec_review_verdict logged; `execute:true` = risk:blocking → always human | `2ecd11a` |
| 5. Trust auto-file | `config/intake.trust.json` (empty, mirrors permissions.json) + `tryAutoFile` through `promoteCandidate`/Keeper lock; rules-only (abstain → inbox, zero LLM) | `97f5de5` |
| 6. intake-audit skill | `.claude/skills/intake-audit/SKILL.md` (§12 structure, L1 ≤200 tok) + sample dossier (agentmemory → `backlog_next`) | `f006ecd` |
| 7. Provenance + UI | Migration `0004` (source_kind/dossier_path/classifier_decision/auto_filed) + `/memory` intake-source filter + source badge + smoke test | `5d04666` |

## DoD status (build-prompt gate)

- ✅ Completed mission auto-fires capture → pending candidates, no manual step, no direct write — `auto-capture-wiring.test.ts` (existsSync(memRoot)=false) + `auto-capture.test.ts`.
- ✅ Intake dossier produced + classified; rule hits = 0 LLM (spy asserts in `classifier.test.ts`); abstain → single logged call (`onLlmFallback` captured).
- ✅ Security gate rejects repo/course without PASS (`intake-gate.test.ts`, `intake.test.ts`); risk:blocking always pauses for human (validation_requested event asserted).
- ✅ intake-audit skill with §12 structure; sample dossier produced (P4).
- ✅ ≤5 injection cap intact (`context.test.ts` untouched, green); auto-capture adds zero startup injection (candidates only).
- ✅ Auto-file only for allowlisted sources; unlisted and abstaining → inbox; non-keeper store cannot promote (write-lock proven).
- ✅ 4/4 canonical: `pnpm -r test` **80/80** · `pnpm lint` (PAYG guard PASS + tsc clean) · `pnpm build` OK · `pnpm --filter @mas/web smoke` **20/20** (port 3000 freed first).

## Deferred (NOT done — reasons)

- **Receptacle half (step 8)** — `/ideas` kanban, Decision Log, deadlines/milestones, `/priorities`, Project Health, budget projection. Reason: kickoff split per ADR 0004 (producer before 3.5); receptacle follows 3.5.
- **Prod wiring of the classifier's LLM fallback** — the abstain path is DI'd + unit-tested, but no production caller triggers it yet: manual promote = explicit user choice (user-tag rule), auto-file = rules-only **by design**. Wiring an eco-LLM classify-on-promote lands with the receptacle UI (where unclassified candidates get bulk-triaged). Zero quota burned until then (§11-positive).
- **agentmemory backend** — re-audited 2026-06-12 → `backlog_next` 4.x (`docs/intake/2026-06-12-agentmemory-auto-capture-backend.md`).
- **QMD / Graphify / router** — unchanged deferrals (ADR 0003 / future ADR 0006 / Phase 3.5).

## Phase gate

Stopping here per CLAUDE.md §10. Phase 3.5 NOT started.
Checker prompt: `docs/learning/2026-06-09-phase4.5-preflight/build-prompt.md §②` (scope it to the producer half).

## Checker verdict — 2026-06-13

Independent Checker run: **PASS — all 9 checks green, 4/4 canonical verified in-session.**
Findings (1 warn, 5 info, none blocking) and their disposition:

| Severity | Finding | Disposition |
|---|---|---|
| warn | Gate's non-PASS rejection branch (`intake-gate.ts` BLOCK verdict) is dead code under `mockSecReviewer` (PASS for everything except blocking, which short-circuits earlier) — untested | **Backlog**: test it when the real sec-reviewer replaces the mock (Phase 5/6). DoD met via `intake.ts` module-level refusal. |
| info | `tryAutoFile` swallowed promotion failures silently (no /trace signal) | **Fixed post-checker**: catch now inserts an `auto_file_error` event; test asserts it. |
| info | Classifier LLM fallback has no production caller yet | Disclosed in §Deferred — wires with the receptacle. §11-positive. |
| info | Gate built as `intake-gate.ts` instead of plan.md's "in dispatch.ts" | Doc drift only; functionally equivalent + safer (module-level refusal in `intake.ts` as second layer). |
| info | ADR 0004 still "Proposed" | **Fixed post-checker**: flipped to Accepted. |
| info | Migration 0004 missing trailing newline | **Fixed post-checker**. |
