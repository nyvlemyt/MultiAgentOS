# Phase 4.5-receptacle · Ideas / Decisions / Prioritization — Pre-flight Plan

**Date**: 2026-06-13 · **Prereq**: Phase 4.5-producer merged (PR #6), Phase 3.5 merged (PR #7) · **Architecture**: ADR 0004 §B (receptacle), ROADMAP "Phase 4.5 · B. Receptacle" · **Branch**: `phase/4.5-receptacle` (off main).

> The producer half (auto-capture, intake, classifier, gate) shipped already. This is the **receptacle**: an idea/decision becomes a prioritized mission. **Deterministic only — no LLM, no new providers.**

## 0. Pre-flight findings (audit, 2026-06-13)

- **No `proposeMemory`/decision-candidate path exists** (capture uses `captureCandidates`). → MVP **decisions = user-logged manually** (exit criterion #2). The "Memory Keeper proposes a decision" path is **deferred** (note in build-report; reuse `memory_candidates` later, not a new writer). Keeps §8 intact.
- **Missions are real DB-backed** (`missions` table, drizzle). The **Command Center page is still fixture-driven** (`@/lib/fixtures`). → The deadline badge + Top-priorities card + decision widget must read the **real DB** via small server components/helpers; do NOT rewrite the whole Command Center — add real-data cards alongside.
- **Intake dossiers** exist (`docs/intake/*.md`) — ADR 0004 says a dossier feeds the Ideas Inbox. → Wire a lightweight "create idea from dossier" entry (manual: a `sourceDossier` field on the idea), not an auto-importer.
- **Migration** will be `0005` (last is `0004`). One migration: `ideas` + `decisions` tables + `deadline`/`milestone`/`priority_score` on `missions`.
- **Scoring is pure arithmetic** (ROADMAP formula) — assert via unit test, zero LLM.

## 1. Build steps (TDD, commit + verify each)

1. **Migration 0005 + schema** — `ideas` (id, title, body, scope global|project, projectId?, status enum inbox|to_clarify|prioritized|converted|archived, priorityScore, impact, urgency, effortEst, costEstTokens, sourceDossier?, ideaIdLink, createdAt, updatedAt); `decisions` (id, scope, projectId?, source enum user|mission|validation|agent, sourceMissionId?, sourceTaskId?, title, body, createdAt); `missions` += `deadline` (epoch, nullable), `milestone` (text, nullable), `priorityScore` (int 0–100, default 0). Applies clean + legacy rows unaffected. TDD (db round-trip).
2. **Scoring lib** (`packages/core/src/prioritize.ts` or `apps/web/lib/`): pure `score({impact,urgency,effortEst,riskScore}) = impact*.35 + urgency*.30 + (100-effortEst)*.20 + (100-riskScore)*.15`. TDD: known inputs → known score; clamp 0–100.
3. **Ideas API + `/ideas` kanban** — CRUD routes (`/api/ideas/*`): create, move status, convert-to-mission (creates a `missions` row in `draft`, links `idea.ideaIdLink`→mission, marks idea `converted`). Kanban columns Inbox→To clarify→Prioritized→Converted→Archived. TDD on the API + a smoke for the board.
4. **Decision Log** — `/api/decisions` (create manual; list). Embedded widgets: Command Center sidebar (last 5 global), `/projects/[slug]` section, `/missions/[id]` section. No `/decisions` route. TDD create + render.
5. **Deadlines/milestones on missions** — inputs in mission create form + detail page; Command Center badge when `deadline < now + 7d`; unrealistic-flag arithmetic (`deadline < createdAt + spentTokens/monthlyRate*30d`). TDD the date logic (pure).
6. **`/priorities` route** — top-N board sorted by `priorityScore`, filter by project, 0–100 sliders persist via `/api/missions/[id]` (or ideas). Top-3 surfaced in Command Center "Top priorities" card (replaces the static Recommendations placeholder). TDD slider persist.
7. **Project Health widget** — server-computed at read time (no table): `{missionsTotal, missionsDone, missionsBlocked, lastActivity, budgetUsedPct, nextDeadline, openIdeas, pendingValidations}`. Rendered in `/projects/[slug]` header + `/projects` list row. TDD the aggregation.
8. **/tokens "Remaining capacity"** — `(monthlyCapCents - spentCents)/avgMissionCostCents → ~N missions`, rolling 30-day avg, "< 1 mission" floor. TDD arithmetic.

## 2. Files

| File | Action |
|---|---|
| `packages/db/src/schema.ts` + `migrations/0005_*` | create tables + columns |
| `apps/web/lib/prioritize.ts` (+ test) | scoring + capacity arithmetic |
| `apps/web/app/(cockpit)/ideas/page.tsx` + `IdeasKanbanClient.tsx` | kanban |
| `apps/web/app/api/ideas/*` | CRUD + convert-to-mission |
| `apps/web/app/api/decisions/*` | log + list |
| `apps/web/app/(cockpit)/priorities/page.tsx` | top-N board + sliders |
| `apps/web/app/(cockpit)/page.tsx` | Top-priorities card + deadline badge + decision widget (real DB cards) |
| `apps/web/app/(cockpit)/projects/[slug]/page.tsx`, `projects/page.tsx` | Health widget + decision section |
| `apps/web/app/(cockpit)/missions/[id]/` + create form | deadline/milestone inputs + decision section |
| `apps/web/app/(cockpit)/tokens/page.tsx` | remaining-capacity widget |
| `apps/web/tests/smoke.spec.ts` | /ideas, /priorities, convert-to-mission, decision log |

## 3. Risks

| Risk | Mitigation |
|---|---|
| Touching fixture-driven Command Center breaks existing smoke | Add real-DB cards beside fixtures; keep existing headings; smoke asserts new + old |
| Scope blowout (8 surfaces) | Build order is DoD order; each step ships independently; stop at exit criteria |
| convert-to-mission double-creates | idempotent: guard on `idea.status==='converted'` (mirror Phase 1 idempotency) |
| Decision "agent-proposed" path scope creep | MVP = manual log only; Keeper-proposed deferred (no proposeMemory yet) |
| Smoke needs seeded ideas/decisions | extend `@mas/db` seed with a couple of ideas + a decision + a deadlined mission |

## 4. DoD (gate = ROADMAP receptacle exit criteria 1–7)

1. `/ideas` kanban renders; create → move to Prioritized → convert-to-mission works end-to-end (smoke).
2. A decision logged manually from Command Center appears in `/projects/[slug]` (smoke).
3. A mission `deadline` within 7d shows a warning badge on Command Center (test + smoke).
4. `/priorities` lists missions by `priorityScore`; editing a score via sliders persists (test).
5. Project Health widget shows correct aggregates after seed + lifecycle (test).
6. `/tokens` "Remaining capacity" shows a non-zero mission estimate (test).
7. **No LLM anywhere** in the receptacle (grep: no `llm`/`claudeCodeLLM`/router import in new files).
8. 4/4 canonical green: `pnpm -r test` · `pnpm lint` · `pnpm build` · `lsof -ti:3000|xargs kill` then `pnpm --filter @mas/web smoke`.
9. No scope creep: no provider/router changes, no QMD/Graphify, producer half untouched.
