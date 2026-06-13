# Phase 4.5 — pre-flight intake-audit (build-time, 2026-06-12)

Method: `docs/workflows/intake-audit-template.md`, scoped to the 4 items the build prompt names.
Architecture already decided in ADR 0004 — this audit confirms/refines, it does not re-litigate.

## 1. agentmemory (auto-capture backend)

- **Identity**: 12 hooks + 8 skills + MCP stdio server (53 tools), RRF retrieval, 20.5k stars, single maintainer.
- **Fit**: only the capture hooks matter here; retrieval is already served by FTS5 (ADR 0003).
- **Costs**: install = new MCP stdio process per session; maintenance = young single-maintainer repo; removal = low *if* kept behind `captureCandidates()`.
- **KILL criterion hit**: adds an MCP process for retrieval the gate doesn't need.
- **Decision: `defer`** (unchanged from ADR 0004 §Decision 1). The seam stays the only door; re-audit when 4.x opens.

## 2. Close-out ritual (auto-fire shape)

- **Confirmed shape**: fire inside `runReviewPhase()` (dispatch.ts) when the mission reaches `validated` *or* `blocked` — NOT in the worker loop only. Rationale: `executeNextTask` is the single chokepoint crossed by both the worker AND the web inline path; a worker-only hook would silently skip missions executed inline by Next.
- **Zero-LLM**: candidates derive deterministically from existing rows (tasks, events, validations) — the 3 ritual questions map to: decisions ← approved/rejected validations + sec verdicts; blockers ← blocked outcome; learnings/journal ← mission summary line.
- **Idempotency**: dedupe before insert — skip if a candidate already exists for the mission's capture anchor task (replay-safe; mirrors the Phase 4 validation-idempotency pattern).
- **Decision: `keep`** (primary capture path, §11-safe by construction).

## 3. intake-audit skill

- **Form settled** in backlog: a *skill*, not a rule, not an agent (≤7-tool discipline).
- **Decision: `adapt`** — author at `.claude/skills/intake-audit/SKILL.md` per CLAUDE.md §12 (L1 ≤200 tok + L2 lifecycle body), template content lifted from `intake-audit-template.md`.

## 4. Classifier signals (deterministic-first)

Cheap signals available *today*, in priority order:
1. **`source_kind`** (note/skill/pattern/repo/course) — strong prior: skill→LRN, pattern→LRN, repo/course→reference→LRN or EVAL.
2. **Candidate `type`** (Phase 4 enum user/feedback/project/reference) — feedback→LRN global, project→BDR/journal project.
3. **Keyword table** on body head: "decided/décidé/chose/rejected" → BDR; "learned/pattern/TIL" → LRN; "blocked/bloqué/stuck" → BLK; "eval/benchmark/score" → EVAL; date-prefixed/diary → journal.
4. **Explicit user tag** (UI) — always wins.
- **Abstain** = no rule fires → single eco LLM call via `packages/core/src/llm.ts`, logged to events (`/trace`), domain=memory.
- **Decision: `keep`** — distilled into `docs/knowledge/memory-patterns.md §Classifier signals`.

## Self-audit (≤5 cap + §11 end-to-end)

- Injection cap ≤5 enforced in `buildMemoryContext` (Phase 4 test) — intake adds **zero** startup injection; auto-capture writes candidates only. PASS.
- No PAYG surface added: classifier fallback goes through `llm.ts`; lint guard already CI-active. PASS.
