# Phase 4.5-receptacle — Build Report

**Date**: 2026-06-13 · **Branch**: `phase/4.5-receptacle` · **Architecture**: ADR 0004 §B, ROADMAP "Phase 4.5 · B. Receptacle" · **Plan**: `docs/learning/2026-06-13-phase4.5-receptacle-preflight/plan.md`

The receptacle half: an idea/decision becomes a prioritized mission. **Deterministic only — zero LLM** (grep-verified). Built TDD, one commit per step.

## Done

| # | Step | Artifacts |
|---|------|-----------|
| 1 | Migration 0005 + schema | `packages/db/migrations/0005_ordinary_vengeance.sql`, `ideas` + `decisions` tables, `missions += deadline/milestone/priorityScore`. Round-trip test `receptacle-schema.test.ts` (3). Legacy rows unaffected (`priorityScore` defaults 0). |
| 2 | Scoring + capacity arithmetic | `apps/web/lib/prioritize.ts` — `priorityScore` (ROADMAP formula, clamp 0–100), `remainingCapacity`, `isDeadlineSoon`, `isDeadlineUnrealistic`, `avgMissionCostCents`. `prioritize.test.ts` (14). |
| 3 | Ideas Inbox kanban + API + convert | `lib/ideas.ts` (`createIdea`/`moveIdea`/`updateIdeaScores`/`convertIdeaToMission`), `/api/ideas` (GET/POST), `/api/ideas/[id]` (PATCH sliders), `/[id]/status`, `/[id]/convert`. `/ideas` page + `IdeasKanbanClient`. Columns Inbox→To clarify→Prioritized→Converted→Archived. Convert is **idempotent** (guard on `status==='converted'`, mirrors Phase 1). `ideas.test.ts` (7) + smoke. |
| 4 | Decision Log | `lib/decisions.ts` (`createDecision`/`listDecisions`), `/api/decisions` (GET/POST). `DecisionLog` widget embedded in Command Center (last-5 global), `/projects/[slug]`, `/missions/[id]`. **No `/decisions` route.** `decisions.test.ts` (4) + smoke. |
| 5 | Mission deadlines/milestones | `/api/missions/[id]/meta` (PATCH deadline+milestone), `MissionDeadlineEditor` on mission detail, deadline badge on detail + Command Center "Deadlines" card (`deadline < now+7d`). Date logic pure + tested (in `prioritize.test.ts`). |
| 6 | `/priorities` board | `lib/missions.ts` (`setMissionPriority` clamp, `topMissionsByPriority`), `/api/missions/[id]/priority` (PATCH). `/priorities` page + `PrioritiesClient` 0–100 sliders that persist; project filter. Top-3 card in Command Center **replaces** the static Recommendations placeholder. `missions.test.ts` (2) + smoke. |
| 7 | Project Health widget | `lib/health.ts` `computeProjectHealth` (server-computed, no table): missionsTotal/Done/Blocked, lastActivity, budgetUsedPct, nextDeadline, openIdeas, pendingValidations. `ProjectHealthBar` in `/projects/[slug]` header + `/projects` list rows (list now DB-backed). `health.test.ts` (2). |
| 8 | `/tokens` Remaining capacity | `getRemainingCapacity` in `lib/tokens.ts` — `(cap−spent)/avgMissionCost` over rolling 30-day window (quotaUnits cents proxy); "< 1 mission" floor, "—" when no history. Card on `/tokens`. `capacity.test.ts` (2). |

Nav: `Ideas` + `Priorities` added to the sidebar. Seed extended with 2 ideas (otakugo), 1 decision, and a deadlined+prioritized seed mission (deadline +3d, priorityScore 72) so smoke can assert.

## Deferred (intentional, per plan / §8)

- **Keeper-proposed decisions** (`source ∈ {mission, validation, agent}`): the `decisions.source` enum reserves room, but MVP logs **user** decisions only. No `proposeMemory` seam exists yet, so no memory writer was added — **§8 single-writer invariant intact**. Wire when the seam lands (reuse `memory_candidates`, not a new writer).
- **Standalone mission "create form"**: no mission-creation UI exists in the app yet (Phase 1 ran off the seed; missions now also arrive via idea→convert). Deadline/milestone inputs were added to the **mission detail** page. A dedicated create form is out of receptacle scope — note for Phase 7 (project/mission wizards).
- **Intake-dossier → idea auto-import**: `ideas.sourceDossier` column exists for the manual link (ADR 0004); no auto-importer built (plan §0).

## DoD status (plan §4 = ROADMAP receptacle exit 1–7 + no-LLM + 4/4)

1. ✅ `/ideas` kanban renders; create → move → convert-to-mission end-to-end (smoke: idempotent convert).
2. ✅ Decision logged manually from Command Center appears on `/projects/[slug]` (smoke).
3. ✅ Mission deadline within 7d → Command Center warning badge (test + smoke `deadline-card`).
4. ✅ `/priorities` lists missions by `priorityScore`; slider edit persists (test + smoke `priority-row`).
5. ✅ Project Health aggregates correct after seed (test, 2 cases incl. empty).
6. ✅ `/tokens` remaining-capacity shows a non-zero estimate (test).
7. ✅ **No LLM** anywhere in receptacle (grep: no `llm`/`@mas/core`/`router`/`provider` import in any new file).
8. ✅ 4/4 canonical green:
   - `pnpm -r test` → all packages pass (web 34 tests across 8 files).
   - `pnpm lint` → SDK-PAYG guard PASS + tsc clean.
   - `pnpm build` → all routes compiled (`/ideas`, `/priorities` present).
   - `pnpm --filter @mas/web smoke` → **27 passed** (incl. 5 new receptacle specs).
9. ✅ No scope creep: no provider/router changes, no QMD/Graphify, producer half untouched.

## Commits

```
4581e20 feat(4.5r): migration 0005 — ideas, decisions, mission planning cols
1be50d0 feat(4.5r): deterministic prioritize lib (score, capacity, deadlines)
307d100 feat(4.5r): ideas inbox kanban + /api/ideas CRUD + convert-to-mission
5f2410b feat(4.5r): decision log + /api/decisions + CC/project/mission widgets
1976785 feat(4.5r): mission deadline/milestone editor + CC deadline badge
51a8522 feat(4.5r): /priorities board with persisting sliders + CC top-3 card
ac49a0d feat(4.5r): server-computed project health widget on project pages
56084fc feat(4.5r): /tokens remaining-capacity widget (rolling 30-day avg)
30300c2 test(4.5r): seed ideas/decision/deadline + receptacle smoke specs
```

## STOP

Awaiting review. Did **not** start Phase 5 or 3.5b. New branch only — not pushed, not merged.
