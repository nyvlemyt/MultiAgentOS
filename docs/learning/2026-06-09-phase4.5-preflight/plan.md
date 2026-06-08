# Phase 4.5 · Memory & Knowledge Intake — Pre-flight Plan

**Date**: 2026-06-09 · **Prereq**: Phase 4 verified merge-ready (`docs/learning/2026-06-08-phase4-memory/build-report.md` §Checker) · **Architecture**: `docs/decisions/0004-memory-intake-and-auto-capture.md` · **Re-sequenced before Phase 3.5** (ROADMAP "Build order").

> Status: **pre-flight only** — not built. Build starts on user "go Phase 4.5". This pack = ADR 0004 + this plan + `build-prompt.md`.

## 0. Pre-flight ritual (CLAUDE.md §13 — do this BEFORE coding)

Targeted intake-audit (method: `docs/workflows/intake-audit-template.md`) of the resources that feed *this* phase, then distill into `docs/knowledge/`:
- **agentmemory** (`docs/knowledge/memory-patterns.md §agentmemory`) — decide: optional auto-capture backend or not now. KILL criterion: if it adds an MCP process for retrieval the gate doesn't need → defer (keep behind the seam).
- **close-out ritual** (`docs/knowledge/project-doctrine.md`) — already chosen in Phase 4; confirm the auto-fire shape.
- **intake-audit skill** (`docs/backlog/intake-audit-skill.md`) — the §12 skill structure to author.
- **classifier signals** — what cheap signals exist (task tags from Phase 3 domain taxonomy, source kind). Self-audit: is the ≤5 cap + §11 still honored end-to-end?

Distill kept items into `docs/knowledge/` (and a `mas-*` skill / CLAUDE.md rule only if it becomes a rule). Scope to the phase, not the whole batch.

## 1. Build steps (TDD, commit + verify each; Conventional Commits ≤60 chars)

**Producer half (build this before 3.5):**

1. **`mission-complete` auto-capture hook** — worker fires the close-out ritual at mission end → `captureCandidates()` (existing seam) → `memory_candidates` (pending). No new write path. TDD: a completed mission yields pending rows, no register write.
2. **Intake module** (`packages/memory/src/intake.ts`) — ingest a source (note/skill/pattern first; repo/course behind the security gate) → an intake dossier record + a candidate. Multi-source typed input.
3. **Classifier** (`packages/memory/src/classifier.ts`) — deterministic rules → `{register, scope}`; light-LLM fallback (via `@mas/core` `llm.ts`, eco) only on abstain, logged to `/trace`. TDD: rule hits never call the LLM; abstain path is logged.
4. **Security gate wiring** — before repo ingestion / code exec, require `mas-sec-reviewer` PASS; `risk:blocking` → human. TDD: ingest-without-PASS is rejected.
5. **Auto-file trusted sources** — `config/intake.trust.json` allowlist → Keeper auto-promotion (still write-locked path). TDD: trusted source auto-promotes; untrusted lands in inbox.
6. **`intake-audit` skill** — author under `.claude/skills/intake-audit/SKILL.md` per CLAUDE.md §12 (read `docs/knowledge/skills-reference.md` + `prompting-anthropic.md` first). Summary (L1 ≤200 tok) + body (L2 full).
7. **Memory Center filter** — `/memory` gains an intake-source filter over candidates.

**Receptacle half (can follow 3.5 if phase is split — see ADR 0004 scope risk):**

8. Ideas Inbox (`/ideas`), Decision Log, deadlines/milestones, prioritization, Project Health, budget projection — per the existing ROADMAP Phase 4.5 receptacle spec (deterministic scoring, no LLM). Dossiers from step 2 land here.

## 2. Files to create / modify

| File | Action |
|---|---|
| `apps/worker/src/*` (mission loop) | **modify** — emit/handle `mission-complete`; fire auto-capture hook |
| `packages/memory/src/intake.ts` | **create** — multi-source ingest → dossier + candidate |
| `packages/memory/src/classifier.ts` | **create** — deterministic register+scope, LLM fallback on abstain |
| `packages/memory/src/capture.ts` | **modify** — expose auto-fire entry; keep `captureCandidates()` seam unchanged |
| `packages/agents/src/dispatch.ts` | **modify** — security-gate intake path via `mas-sec-reviewer`; set classifier LLM domain=`memory` |
| `packages/db/src/schema.ts` + migration | **modify** — `memory_candidates` intake-provenance cols (`source_kind`, `dossier_path`, `classifier_decision`, `auto_filed`) |
| `config/intake.trust.json` | **create** — trusted-source allowlist (empty default, schema-only — mirror `permissions.json`) |
| `.claude/skills/intake-audit/SKILL.md` | **create** — §12-structured skill |
| `apps/web/app/memory/*` | **modify** — intake-source filter |
| `apps/web/app/ideas/*`, `/api/ideas/*` | **create** — receptacle kanban (if not split out) |
| `apps/web/app/api/decisions/*` | **create** — Decision Log endpoints |
| `docs/knowledge/*` | **modify** — distilled pre-flight learnings |

## 3. Tests to create / adapt

- `packages/memory/src/intake.test.ts` — source → dossier + candidate; candidate-only (no register write).
- `packages/memory/src/classifier.test.ts` — rule cases hit deterministically (0 LLM calls, assert via `MAS_MOCK_LLM` + a call-count spy); abstain → fallback logged.
- `packages/memory/src/auto-capture.test.ts` (or extend `capture.test.ts`) — `mission-complete` → pending rows, no direct write.
- `packages/agents/src/dispatch.test.ts` — **adapt**: intake without `mas-sec-reviewer` PASS rejected; `risk:blocking` pauses. (Note the existing `MAS_MOCK_LLM` env sensitivity — keep using the canonical `pnpm -r test`.)
- `packages/db` migration test — new columns apply clean + backfill.
- Web smoke — `/memory` intake filter; `/ideas` kanban + convert-to-mission (receptacle).
- Trust allowlist test — auto-file vs inbox routing.

## 4. Risks

| Risk | Mitigation |
|---|---|
| Repo ingestion = arbitrary read/exec hole | Hard `mas-sec-reviewer` PASS gate (ADR 0004 §6); external tree read-only; writes only under `data/` |
| LLM classifier creep → quota burn | Deterministic rules first; LLM only on abstain, logged; eco effort; assert 0-LLM on rule hits in tests |
| Auto-file bypasses §8 write-lock | Auto-file routes through the Keeper promote path; it skips *manual triage*, never the writer |
| Phase scope too large (producer+receptacle) | ADR 0004 split option: producer before 3.5, receptacle after |
| Auto-capture pollutes memory with noise | Candidate-only + ritual's 3-question filter; Keeper triage; trust list is opt-in and empty by default |
| `mission-complete` double-fire / idempotency | Reuse Phase 4 idempotency pattern (candidate dedupe by taskId); test replay |

## 5. Deferrals (out of Phase 4.5)

- **agentmemory** auto-capture backend adoption — only after its own intake-audit (kept behind the seam).
- **QMD** retriever swap — ADR 0003, Phase 4.x.
- **Graphify** codebase indexing for Context Manager — future ADR 0006.
- **Cross-project second-brain promotion** — `docs/backlog/second-brain-cross-project.md`, candidate ADR.
- 2 prompt-cache breakpoints in `claudeCodeLLM` — SDK limitation (Phase 4 deferral), still 4.x.

## 6. Validation criteria before merge (Phase 4.5 DoD)

All of ADR 0004's exit criteria + ROADMAP Phase 4.5 exit criteria (P1–P5 producer, 1–7 receptacle), specifically:
1. Completed mission auto-fires capture → pending candidates, **no manual step, no direct write** (test).
2. Intake dossier produced + classified (correct register+scope); rule hits use **0 LLM** (test asserts call count); abstain logged.
3. Security gate rejects repo ingest / code exec without `mas-sec-reviewer` PASS (test); `risk:blocking` always human.
4. `intake-audit` skill exists with §12 structure; produces a dossier for a sample item.
5. ≤5 global-injection cap intact; auto-capture adds **zero** startup injection.
6. Auto-file only for allowlisted sources; everything else → inbox.
7. **4/4 green** via canonical commands: `pnpm -r test` · `pnpm lint` (PAYG guard + tsc) · `pnpm build` · `pnpm --filter @mas/web smoke`. (Use canonical `pnpm -r test` — do **not** export `MAS_MOCK_LLM` globally; see Phase 4 Checker note.)
8. No scope creep: no QMD / Graphify / router / non-Anthropic provider code (§11).
9. Branch `phase/4.5-memory-intake` off `phase/4-memory` (or off `main` once 4 is merged). Never pushed/merged without explicit human approval.

## 7. Checklist (copy to TodoWrite at build start)

- [ ] Pre-flight intake-audit (agentmemory / ritual / intake-audit / classifier signals) → distill to `docs/knowledge/`
- [ ] `mission-complete` auto-capture hook (TDD)
- [ ] `intake.ts` multi-source → dossier + candidate (TDD)
- [ ] `classifier.ts` deterministic-first + logged LLM fallback (TDD)
- [ ] Security gate wiring via `mas-sec-reviewer` (TDD)
- [ ] Auto-file trust allowlist + `config/intake.trust.json` (TDD)
- [ ] `intake-audit` SKILL.md (§12 structure)
- [ ] DB migration: intake-provenance columns
- [ ] `/memory` intake-source filter
- [ ] Receptacle (`/ideas`, Decision Log, prioritization) — or split per ADR 0004
- [ ] Distill pre-flight learnings into `docs/knowledge/`
- [ ] 4/4 canonical checks green; build-report; STOP for review
