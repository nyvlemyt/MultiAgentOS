# `.md` Excellence — round 2 — execution + re-audit verdict — 2026-06-27

Branch `claude/md-excellence-fixes`. Continues round-1 (`2026-06-27-md-checker-verdict.md` → NEEDS_WORK, 9-item round-2 fix list). This pass executed **A + B + C** (the 7 in-scope findings) and deferred **D** (pre-existing content drift) to a backlog card, per the round-1 recommendation.

## What was applied (10 edits / 7 docs)

### A — self-inflicted (wave-3 edits, fixed first)
1. `mas-skill-router` S6 (VC line) — replaced process-phrasing *"Only L1 summaries were read…"* with an **output-checkable** assertion: every emitted skill `id` resolves to an L1 index entry, output names skills by `id`, embeds no L2 body prose.
2. `mas-skill-router` — Cold-Library cross-ref `TOKEN_STRATEGY §6` → **§5** (loading rules; §6 is the Caveman gate). Disk-verified the heading numbers.
3. `architect.md` F2 — dropped `doc-coauthoring` from `favorite_skills` (→ 2 fav + 1 req + 4 runtime = **7**, satisfies ≤7-tools). No dangling ref: `doc-coauthoring` stays a valid skill in catalog/registry, just no longer an architect favorite.

### B — path drift (real paths disk-verified)
4. `TOKEN_STRATEGY.md` (§1 + §6) — `packages/core/llm.ts` → `packages/core/src/llm.ts` (both occurrences).
5. `ROADMAP.md` L81 — `packages/core/permissions.ts` → `…/src/permissions.ts`; **also L111** (same-class) `packages/core/llm.ts` → `…/src/llm.ts`.
6. `CLAUDE.md` §3 — removed phantom `packages/tokens/` row (no such package; `memory/` now the `└──` leaf) + one-line note pointing to the real homes (`apps/web/lib/tokens.ts` + `packages/agents/src/budget-gate.ts`). File still **196 lines** (≤200 ✓).

### C — skill When-NOT in frontmatter `description`
7. `mas-reviewer` + `mas-sec-reviewer` — added a When-NOT clause mirroring each body's `## When NOT to Use`.

## Adversarial re-audit (7 strict verifiers, one per touched doc, §6 rubric, disk-grounded)

- **All 7 round-1 findings confirmed RESOLVED on disk.** mas-reviewer = clean PASS. architect + CLAUDE verifiers errored on structured output → **manually disk-verified** (architect = 7 tools ✓; CLAUDE = 196 lines, tree well-formed, no phantom ✓).
- **2 new in-scope micro-fixes surfaced and applied:**
  - `mas-skill-router` VC escalation parenthetical `(trade/buy/sell/…)` was a loose subset of the authoritative **Escalation Signals** list (even held terms absent from it) → replaced with a pointer to that section (single-source).
  - `mas-sec-reviewer` body said "the Code Reviewer" while the new description + Related-Skills say `mas-reviewer` (same entity, line 110) → aligned body L11 + L20 to `mas-reviewer` (kills the internal naming drift).

## Deferred to backlog (pre-existing, larger — round-1 item D class)

- **`quota-window-doc-schema-drift.md`** (new card) — TOKEN_STRATEGY §1/§3/§8 present a 5-hour-window quota model keyed `(subscriptionUserId, windowStart)` that the shipped `budgets` table does not implement (real: `(scope, scopeId, period)`; `windowStart` belongs to `schedules`). Plus §4 caching present-tense over-claim (`data/context-packs`/`mission-summaries` dirs absent) and PRODUCT_SPEC §8 index drift. Design-intent vs implementation gap — deserves a deliberate reconciliation, not a rushed patch. **No runtime defect.**
- **ROADMAP L343/L429** roster counts ("8 Tier B", "AGENTS §3 6→7") sit inside **phase-plan descriptions** (frozen plan-history, e.g. the 0c to-do), not present-tense claims → left as written (same discipline as not rewriting learning reports).

## Gate

Round-1 + round-2 tree: local 4-check **TEST · LINT · BUILD · SMOKE all green** (TEST 147 / SMOKE 32). Sonar (5th check) pending push.

## Verdict: **PASS** (round-2 scope A+B+C complete + 2 re-audit micro-fixes; D carded). Push → DRAFT PR → Sonar → user merges (phase gate).
