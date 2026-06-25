# Phase 9 · Wave 0c — BUILD REPORT (Tier A roster at best level)

> Branch `phase/9c-roster` (cut from tip A `d3cd68e`). PR **DRAFT only**, base
> `phase/9-audit-0a0b`. Cycle: prepare → do → self-verify → Checker → cross-Reviewer
> → gate. Companion docs: `plan.md`, `checker-verdict.md`, `reviewer-verdict.md`.

## 1. Goal

Bring the Tier A agent roster to its best level: promote the **Agent Evaluator**
(RES-043 agent-as-judge) into a full Tier A fiche and wire it into the 0b review
loop as a **distinct, advisory, non-blocking** rubric judge; **split** the
mission-planner (one-shot DAG author) from a new **orchestrator** (dispatch-loop
governor); add a runtime `validateFiche()` guard (audit U3); and reconcile
`AGENTS.md` (audit U2). No new framework, no PAYG, ≤7 tools/agent.

## 2. Build stack (commits `d3cd68e..695007e`, 5 commits — pre-this-session)

| Commit | Item | What |
|--------|------|------|
| `431db30` | plan | Wave plan: evaluator promotion + orchestrator split + U2/U3 |
| `dbe3396` | A+B+C+E1 | `'evaluator'` ReviewKind (core/llm.ts) · `realAgentEvaluator` (reviewers.ts) · wired advisory into `runReviewPhase` · `fiches/agent-evaluator.md` + avatar |
| `af3ff8d` | C3+E2 | `fiches/orchestrator.md` + avatar; `mission-planner.md` narrowed to one-shot DAG author |
| `55330e7` | D (U3) | `validateFiche()` in registry.ts; `loadTierAFiches` throws on missing key; reviewer/sec-reviewer gain `limits:` |
| `695007e` | F (U2) | `AGENTS.md` reconciled (§1 58→60, §3 9-row roster, §4, §7 tree, §10 → validateFiche) |

## 3. Close-out session additions (this session, `695007e..HEAD`)

The build stack was Checker-PASS + Reviewer-PASS over `..695007e`. Both verdicts
surfaced non-blocking findings; this session resolves them and writes the missing
audit trail (plan Item G).

| Item | Source finding | Resolution |
|------|----------------|------------|
| 1 — audit trail | plan Item G missing | this `build-report.md` + the 2 verdicts committed |
| 2 — UI roster drift | Reviewer #1 | `apps/web/lib/fixtures.ts` `tierAFixture` 6→9 (adds quality-controller, orchestrator, agent-evaluator); 9 avatars resolved in `apps/web/public/avatars/` (created the missing `quality-controller.svg` — the fiche referenced it but no file existed anywhere) |
| 3 — §4 off-by-one | Reviewer #2 | `AGENTS.md` §4 header "(9 more)" → "(8 more — quality-controller shipped)" |
| 4 — harden validateFiche | Checker MINOR | `validateFiche` now asserts `permissions.{fs_write,shell,network}` exist + are string\|boolean; RED test added; all 9 shipped fiches still return `[]` |
| 5 — cover catch branch | Checker MINOR | `dispatch-evaluator.test.ts` adds a case omitting the agent-evaluator seed → mission still `validated` + `agent_evaluation_error` fires (covers dispatch.ts:509-511) |
| 6 — tech-debt card | Checker §7 MINOR | `docs/backlog/dispatch-split-review-phase.md` — extract `runCriticGates()`; DEFERRED, **no dispatch.ts logic touched this session** |

## 4. Exit criteria (CAMPAIGN §5 "Sortie 0c")

- **C1** agent-evaluator complete Tier A fiche (all §2 keys + `escalate_when`, RES-043 lineage, avatar) — **MET** (`dbe3396`).
- **C2** `realAgentEvaluator` wired in `runReviewPhase`, distinct + advisory + logged `agent_evaluation`, green test — **MET** (`dbe3396`; non-blocking verified adversarially — never enters `verdicts[]`).
- **C3** planner/orchestrator split, both complete fiches + avatars — **MET** (`af3ff8d`).
- **C4** `validateFiche()` rejects missing key, all 9 pass; reviewer/sec gain `limits` — **MET** (`55330e7`) + **hardened** this session (permission sub-keys).
- **C5** AGENTS.md reconciled — **MET** (`695007e`) + §4 count fixed this session.
- **C6** 5 checks green + Sonar exit 0 + Checker PASS + cross-Reviewer PASS — see §5 (Sonar = post-push 5th check).

## 5. Verification (this session, full tree)

Numbers recorded in `checker-verdict.md` (refreshed over the full `d3cd68e..HEAD`
range). Per-item TDD: item 4 RED (`expected [] to include 'permissions.network'`)
→ GREEN after the guard landed; item 5 GREEN on add (catch branch already present).

5 checks: `pnpm -r test` · `pnpm lint` (PAYG guard PASS) · `pnpm build` ·
`pnpm --filter @mas/web smoke` · `scripts/sonar-pr-issues.sh <pr>` exit 0 (the 5th
check — a green gate alone is not enough, CLAUDE.md §7).

## 6. Invariants held

§5 no destructive/out-of-sandbox op (evaluator runs in the review phase only,
read-only fiche perms). §8 no `data/memory/` write. §11 no `@anthropic-ai/sdk`
import, `packages/core/src/providers/` untouched (LLM injected, never instantiated
in reviewers.ts). RES-043: the doer never validated its own work — Checker and
cross-Reviewer stayed independent.

## 7. Residual / deferred

- `dispatch.ts` 1026 lines + `runReviewPhase` 105 lines exceed §7 thresholds
  (pre-existing) → tech-debt card (item 6), DEFERRED to an attended PR.
- Strict 0c hard-stop: **do not start 0d** (Skill Router / QMD / arsenal) — next
  session. Leave the DRAFT stack (0b → A → 0c) committed; never merge to main.
