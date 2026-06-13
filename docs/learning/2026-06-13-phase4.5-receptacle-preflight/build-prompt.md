# Phase 4.5-receptacle · Ideas / Decisions / Prioritization — ready-to-paste prompts

Pre-flight done (plan in this folder). Branch `phase/4.5-receptacle` exists (off main). **Deterministic only — no LLM.**

> Single slice — no split. If the 8 surfaces overrun the budget, ship steps 1–6 (the DoD-graded ones) and report 7–8 as deferred.

---

## ① DOER — paste this to build the receptacle

```
Build Phase 4.5-receptacle (Ideas Inbox / Decision Log / Prioritization) of MultiAgentOS on the
existing branch phase/4.5-receptacle.

Read first: CLAUDE.md (§5, §6, §8), ROADMAP.md "Phase 4.5 · B. Receptacle" + its exit criteria,
docs/decisions/0004-memory-intake-and-auto-capture.md (§Consequences — receptacle after 3.5),
docs/learning/2026-06-13-phase4.5-receptacle-preflight/plan.md (build steps + DoD).
Pre-flight is done — do NOT redo it. THEN build.

Rules:
- DETERMINISTIC ONLY. No LLM, no @mas/core llm, no router, no providers. Scoring is pure arithmetic.
  Grep-clean: no llm/claudeCodeLLM import in any new receptacle file.
- §8 intact: do NOT add a memory writer. Decisions at MVP = user-logged manually (exit criterion #2);
  the Keeper-proposed-decision path is DEFERRED (no proposeMemory exists yet) — note it, don't build it.
- Command Center is fixture-driven today; ADD real-DB cards beside the fixtures (Top priorities,
  deadline badge, last-5 decisions). Do NOT rewrite the page or remove existing headings (smoke depends
  on them).
- convert-to-mission is idempotent (guard on idea.status==='converted', mirror Phase 1).
- TDD (superpowers:test-driven-development). Canonical `pnpm -r test` — never export MAS_MOCK_LLM
  globally. Conventional Commits ≤60 chars. New branch only — never push to main, never merge.
- Token budget this session: 50k. At 80%, pause and report.

Build in this order, committing + verifying each (plan.md §1 has details):
1. Migration 0005 + schema: ideas table, decisions table, missions += deadline/milestone/priorityScore.
   Applies clean, legacy rows unaffected. TDD round-trip.
2. apps/web/lib/prioritize.ts: score = impact*.35 + urgency*.30 + (100-effortEst)*.20 +
   (100-riskScore)*.15, clamp 0–100; + remaining-capacity arithmetic. TDD.
3. /ideas kanban (Inbox→To clarify→Prioritized→Converted→Archived) + /api/ideas CRUD +
   convert-to-mission (creates draft mission, links idea→mission, marks idea converted). TDD + smoke.
4. Decision Log: /api/decisions (manual create + list); embed last-5 in Command Center sidebar,
   a section in /projects/[slug] and /missions/[id]. No /decisions route. TDD.
5. Mission deadline/milestone inputs (create form + detail); Command Center warning badge when
   deadline < now+7d; unrealistic-flag arithmetic. TDD the date logic.
6. /priorities route: top-N sorted by priorityScore, filter by project, 0–100 sliders persist;
   Top-3 card in Command Center (replaces the static Recommendations placeholder). TDD persist.
7. Project Health widget (server-computed, no table) in /projects/[slug] header + /projects list. TDD.
8. /tokens "Remaining capacity" widget (rolling 30-day avg → ~N missions, "<1 mission" floor). TDD.

Extend @mas/db seed with a couple of ideas + one decision + a deadlined mission so smoke can assert.

Definition of Done = plan.md §4 (ROADMAP receptacle exit criteria 1–7 + no-LLM + 4/4 canonical:
pnpm -r test · pnpm lint · pnpm build · lsof -ti:3000|xargs kill then pnpm --filter @mas/web smoke).

Then write docs/learning/<date>-phase4.5-receptacle/build-report.md (done / deferred+reason /
DoD status / commit list) and STOP for my review. Do NOT start Phase 5 or 3.5b.
```

---

## ② CHECKER — paste in a separate session to verify

```
Verify Phase 4.5-receptacle (Ideas / Decisions / Prioritization) of MultiAgentOS against its exit
criteria. Read-only — do NOT fix, report.

Read: ROADMAP.md "Phase 4.5 · B. Receptacle" exit criteria,
docs/learning/2026-06-13-phase4.5-receptacle-preflight/plan.md §4 (DoD), the build-report under
docs/learning/, docs/decisions/0004-memory-intake-and-auto-capture.md.

Method: canonical `pnpm -r test` (never export MAS_MOCK_LLM globally — known env artifact).

Check, each PASS/FAIL with evidence:
1. /ideas kanban renders; create → move to Prioritized → convert-to-mission end-to-end (find the
   test + smoke); convert is idempotent (guard on converted).
2. A decision logged manually from Command Center appears in /projects/[slug] (find the path).
3. Mission deadline within 7d → warning badge on Command Center (test/smoke).
4. /priorities sorts by priorityScore; slider edit persists (test). Score formula is the exact
   ROADMAP arithmetic, clamped 0–100.
5. Project Health widget aggregates correctly after seed (test).
6. /tokens "Remaining capacity" shows a non-zero estimate (test).
7. NO LLM in the receptacle: grep new files for llm/claudeCodeLLM/router/providers — must be empty.
   §8 intact (no new memory writer; decisions are user-logged; Keeper-proposed path deferred).
8. Migration 0005 applies clean; legacy rows unaffected (find the round-trip test).
9. No scope creep: no provider/router change, no QMD/Graphify, producer half untouched; no real
   API keys; .env.local gitignored.
10. 4/4 canonical green (paste output).

Output verdict PASS / NEEDS_WORK / BLOCK with findings. Then WRITE the full verdict (markdown +
ReviewerVerdict JSON) to docs/learning/<date>-phase4.5-receptacle/checker-verdict.md and commit it
(docs-only commit) so the main session reads it without copy-paste. Do not modify any other file.
```
