# Checker / self-audit verdict — `.md` Excellence (round 1) — 2026-06-27

Branch `claude/md-excellence-fixes` @ `c106e36` (waves 1–4 applied, 5 commits).
**Local 5-check gate: TEST=0 · LINT=0 · BUILD=0 · SMOKE=0 (4/5 green). Sonar NOT yet run (branch not pushed).**

Round-1 adversarial re-audit = 21 strict `Explore` agents (sonnet), one per changed doc, §6 rubric, every claim disk-verified. Verdict: **NEEDS_WORK** — 9 docs need a round-2 pass. **14 of 21 are excellent/good** (AGENTS, SKILLS_REGISTRY, ADR 0002/0004/0009, 4 of 5 fiches, mas-memory-keeper, tier-b-system, etc.). §5 refuted items correctly untouched.

## Round-2 fix list (worst-first)

### A — self-inflicted (MY wave-3 edits — fix first)
1. **`.claude/skills/mas-skill-router/SKILL.md` S6 (line 109)** — the criterion I added, *"Only L1 summaries were read…"*, is **process-phrasing, not observable** (no output field records reads). Reword to an output-checkable assertion or drop it. (The exact failure mode the wave was meant to remove.)
2. **mas-skill-router S2 (line 114)** — cites `TOKEN_STRATEGY §6` (Caveman gate); the loading rule is **§5** (Loading rules). Fix §6→§5.
3. **`packages/agents/fiches/architect.md` F2** — effective tools = 3 favorite + 1 required + 4 runtime = **8 > 7**. Drop one favorite_skill (e.g. `doc-coauthoring`, covered by `superpowers:writing-plans`) → 7. (I added its Trigger, so it's in scope.)

### B — trivial path drift (1-line each, high value)
4. **`TOKEN_STRATEGY.md` lines 5, 53** — `packages/core/llm.ts` → `packages/core/src/llm.ts`.
5. **`ROADMAP.md` line 81** — `packages/core/permissions.ts` → `packages/core/src/permissions.ts`.
6. **`CLAUDE.md` §3 (line 44)** — `packages/tokens/` package doesn't exist (logic lives in `apps/web/lib/tokens.ts` + `packages/agents/src/budget-gate.ts`). Mark planned or remove the layout row.

### C — skill When-NOT in frontmatter (cosmetic S7)
7. **mas-reviewer** + **mas-sec-reviewer** descriptions — add a one-clause When-NOT to the frontmatter `description` (body already has it). mas-sec-reviewer = "good", reviewer = "needs-work".

### D — pre-existing content gaps (larger; consider separate PR / backlog)
8. **`PRODUCT_SPEC.md`** (4 fails): (a) duplicate `### 4.1` heading (one is `4.1 Visual identity`, other `4.1 Command Center` — renumber); (b) §9 "Out / deferred" lists features that **shipped** (ideas/priorities routes, autopilot.ts, templates.ts, multi-mission maxGlobalConcurrent=4) — move to "In"; (c) §8 "Key indices" claims `(task_id,created_at)` + `(scope,scope_id,period)` that don't exist in `schema.ts` (real: `(missionId,createdAt)`, `(agentId,createdAt)`); (d) line 250 bare `(§8 doctrine)` self-resolves to Data-model — point to CLAUDE.md §8.
9. **`docs/decisions/0006-risk-scoring-4axes.md` A7** — cites `config/project-stack-mappings.json` as existing (lines 6/14/26/67/74); it does **not** exist (planned ECC import). Reword to "planned" (consistent with the Proposed status).
10. **`docs/decisions/PIVOT_BRIEF.md` A4/A5** — no explicit why-rejected for Voie 1/2 and no Consequences section. It's a relay doc delegating to ADR 0001 → either add a 2-line Consequences + why-rejected, or accept as a documented exception (it's not a standalone ADR).

## Recommendation
Do A+B+C now (≈10 small edits, all in waves 2–4 scope) → re-audit those 9 docs → push → DRAFT PR → **Sonar (5th check)**. Treat D (PRODUCT_SPEC §8/§9 + ADR 0006 + PIVOT_BRIEF) as a **second PR or backlog card** — it's pre-existing drift beyond the md-excellence wave scope and PRODUCT_SPEC §8/§9 deserve a deliberate rewrite, not a rushed patch. Do NOT merge (phase-gate: user merges).
