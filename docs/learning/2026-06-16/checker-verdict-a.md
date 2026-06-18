# Checker Verdict — Agent Control Panel

Date: 2026-06-18
Branch: `phase/agent-control-panel` · PR #31 · HEAD `f3622b2`
Spec: `docs/superpowers/specs/2026-06-16-agent-control-panel-design.md`

## Verdict: **PASS** (one trivial check-4 fix applied by Checker — see Finding 1; must be pushed + Sonar re-confirmed before merge)

The feature meets the spec point-by-point. All five verification checks are green
locally. The only red was `pnpm --filter @mas/web smoke`, and the cause was **not**
agent-control-panel code — it was a pre-existing seed gap from the merged
mission-conversations feature (migration 0010). One-line micro-fix applied.

---

## Spec compliance (point by point)

1. **`agent_overrides` scoped, `(agentId, projectId)` NOT NULL** — ✅
   `schema.ts`: both `notNull()`, plus `unique('agent_overrides_agent_project_unq')`
   on `(agentId, projectId)`. `getAgentConfig` filters on both; `saveAgentConfig`
   upserts with `onConflictDoUpdate` on the unique target.

2. **Project page never writes a file** — ✅
   `projects/[slug]/agents/[agentId]/page.tsx` renders `AgentControlPanel mode="override"`
   (Profil/Skills editable → DB; Fiche read-only, `revisions=[]`, `needCleanup=false`).
   Its only mutations are `updateAgentConfig` / `toggleAgentSkill`, both pure DB upserts.
   No `writeFiche`/`saveFiche` reachable from this page.

3. **Base page writes the real `.md` + snapshots into `fiche_revisions` (with summary)
   BEFORE write** — ✅
   `writeFiche` snapshots the prior file content into `fiche_revisions` (id, agentId,
   content=prior, summary, savedAt) *then* writes, *then* prunes. `saveFiche` computes
   `ficheSaveSummary(prev, next)`. Base page = `agents/[id]/page.tsx` `mode="fiche"`.
   Snapshot is skipped only when no prior file exists (create case) — correct.

4. **`pruneFicheRevisions` = keep last 10 AND purge >30d; `revisionsNeedCleanup` bounds** — ✅
   `survivors = rows.filter((r,i) => i < 10 && r.savedAt >= cutoff)`; everything else
   deleted (whichever prunes more, as specified). Test seeds 12 fresh + 2 stale →
   keeps 10, deletes 4, all survivors ≤30d. `revisionsNeedCleanup`: `>10` OR any older
   than cutoff; boundary tests confirm 10-fresh=false, 11=true, 31d=true, exactly-30d=false.

5. **Confirm on autonomy↑ / budget↑ / fiche save / restore** — ✅
   - Autonomy raise → `autonomyRaiseNeedsConfirm` (only to autonomous/autopilot AND higher
     rank); budget raise → `budgetRaiseNeedsConfirm` (next > prev). `ProfilTab.onSave`
     opens `ConfirmDialog` when either is true, else commits directly. Lowers + manual/
     assisted save directly (§5 habit). Unit-tested.
   - Fiche save → `ConfirmDialog` "Écrire la fiche sur disque" before `saveFiche`.
   - Restore → `ConfirmDialog` "Restaurer cette révision" before `restoreFicheRevision`.

6. **Tabs correct + project/base mirror** — ✅
   Tabs: Profil · Skills · Fiche · Activité. `mode="override"` → Profil/Skills editable,
   Fiche read-only. `mode="fiche"` → Profil/Skills read-only (Profil shows the
   "édite via override / onglet Fiche" hint), Fiche editable with editor+history subtabs.
   Mirror matches the spec table.

7. **No write outside sandbox / `.claude/agents` / `packages/agents` (§5)** — ✅
   `agent-fiche.ts` `DEFAULT_ROOTS` = `.claude/agents` (Tier B) + `packages/agents/fiches`
   (Tier A); `locateFiche` only ever targets `<root>/<id>.md`. No path comes from user
   input; agentId is validated against `allAgents` in both pages (`notFound()` otherwise).
   Tests inject an explicit tmp `roots`. DB upserts touch only `data/mas.db`.

8. **Vitest coverage** — ✅
   - `agent-config.test.ts`: merge precedence (override > default), partial patch keeps
     prior fields, missing row → defaults, per-project scoping, `enabledSkills` round-trip,
     `agentSkills` allowlist, autonomy/budget gating functions.
   - `agent-fiche.test.ts`: readFiche found/miss, writeFiche snapshot-then-write,
     no-snapshot-on-create, restore round-trip (incl. pre-restore snapshot), prune
     keep-10/drop-30d, `ficheSaveSummary` +/–/equal, `revisionsNeedCleanup` boundaries.
   - Smoke (`smoke.spec.ts`) covers base-agent route render + tab presence.

---

## Findings

1. **[FIXED by Checker — trivial] Smoke seed not idempotent → `pnpm --filter @mas/web
   smoke` failed on reseed.** Root cause: `conversations.mission_id → missions` is
   `ON DELETE NO ACTION` (RESTRICT, from migration 0010 mission-conversations, merged
   into this branch) and `conversations` was missing from the seed wipe block, so
   `DELETE FROM missions` threw `FOREIGN KEY constraint failed` whenever
   `data/test/mas-smoke.db` already held seeded rows. **Not agent-control-panel code.**
   Fix: added `await db.delete(conversations)` to the wipe block in
   `packages/db/src/seed.ts` (messages cascade-delete with it). Smoke now passes
   31/31 twice in a row (idempotent). **REQUIRED before merge:** commit + push this fix
   and re-confirm Sonar on the new HEAD (the Sonar run below is for `f3622b2`, which
   predates the fix; the change is a single delete line in `seed.ts`, not analysed
   new UI code).

2. **[Note, no action] Sonar results below reflect HEAD `f3622b2`** (the fix is local
   only). All other checks (test/lint/build) were re-run *with* the fix and stay green.

---

## Five checks

| # | Check | Result |
|---|-------|--------|
| 1 | `pnpm -r test` | ✅ PASS — core 95 · db 15 · skills 11 · memory 41 · agents 77 · web 138 · worker 6 |
| 2 | `pnpm lint` | ✅ PASS — no forbidden provider SDK imports (§11/§11.bis); `tsc --noEmit` clean all workspaces |
| 3 | `pnpm build` | ✅ PASS — Next build OK, all routes compiled |
| 4 | `pnpm --filter @mas/web smoke` | ✅ PASS *after Finding 1 fix* — 31 passed, idempotent on reseed (was RED on unpatched branch) |
| 5 | Sonar | ✅ PASS — `sonar-pr-issues.sh 31` exit 0 (0 open issues, 0 to-review hotspots) + gate `OK` (on `f3622b2`; re-confirm after pushing Finding 1) |

### Raw outputs

```
# 1) pnpm -r test
packages/core test:  Tests  95 passed (95)
packages/db   test:  Tests  15 passed (15)
packages/skills test: Tests 11 passed (11)
packages/memory test: Tests 41 passed (41)
packages/agents test: Tests 77 passed (77)
apps/web   test:  Test Files  26 passed (26) · Tests 138 passed (138)
apps/worker test: Test Files   2 passed (2)  · Tests   6 passed (6)

# 2) pnpm lint
PASS: no forbidden provider SDK imports (§11 + §11.bis)
packages/* + apps/web: tsc --noEmit → Done (no errors)

# 3) pnpm build
apps/web build: Done (all routes incl. /agents/[id], /projects/[slug]/agents/[agentId])

# 4) pnpm --filter @mas/web smoke   (after Finding 1 fix)
run 1 (over populated DB): 31 passed (55.3s)
run 2 (idempotent reseed): 31 passed (47.8s)
# before fix: SqliteError: FOREIGN KEY constraint failed → Exit status 1

# 5) Sonar (PR #31, HEAD f3622b2)
PR #31: 0 open issue(s), 0 to-review hotspot(s). SONAR CLEAN. EXIT=0
GATE: OK
```
