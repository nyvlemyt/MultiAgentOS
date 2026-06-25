# Night build — LIVING STATE (read this FIRST to resume)

**Updated:** 2026-06-25, session start.
**Branch:** `phase/9c-roster` (tip `4bf2762`, clean). Stack: `main ← #37 ← #38 ← #39(=9c)`.
**Plan:** `./PLAN.md`. Standing decisions there (no merge to main; draft PR chain).

## Status board
`TODO` · `DOING` · `DONE(verdict)` · `BLOCKED`

- **U1** split `dispatch.ts` — **DONE** (CI fix `aef2ea3`). Checker PASS on `c19dcca`; CI build-test now GREEN (run 28139601145, all steps ✓) + Sonar exit 0 (PR#39: 0 issues/0 hotspots). NOTE: HTTPS push needs one-shot `git -c credential.helper= -c credential.helper='!gh auth git-credential' push` — bare `git push` hangs on the `store` helper.
- **U2** PR stack readiness report — TODO
- **U3** 0d pre-flight intake-audit — **DONE** → `docs/intake/2026-06-25-0d/preflight-pack.md` (4 agents, tree-verified). See "0d build notes" below.
- **U4** 0d build (`phase/9d-arsenal`) — TODO
- **U5** self-audit §13 + Sonar debt — TODO
- **U6+** 0e / Étape 1 — TODO

## 0d build notes — from pre-flight pack. READ before U4. (`docs/intake/2026-06-25-0d/preflight-pack.md`)
1. `selectLibrarySkills` `degraded` flag = **LLM-rank absence, NOT retriever presence**. `dispatch-arsenal.test.ts:69` asserts `degraded===true` & `skills===skillsJson` under no-`llm`. The semantic union must **not** flip `degraded`. #1 regression trap.
2. `QmdRetriever.query` = **blocking 30s `execFileSync`** (`retriever.ts:287`). NEVER call in the per-task `planMission` loop. Do **one cached arsenal query per mission** via a new `arsenalRetrieverFor()` in `mission-llm.ts`.
3. `mas-arsenal` is **excluded** from `QMD_MEMORY_COLLECTIONS` (`retriever.ts:233`). 4a must query `QMD_ARSENAL` explicitly.
4. 4c: runtime SDK path has **zero MCP wiring** (`llm.real.ts:73`, no `mcpServers`/`allowedTools`). Add opt-in least-privilege (`mcp__qmd__query` only) so the default path stays byte-identical.
5. CI gap: `pnpm mem:eval` not in `ci.yml`; CI=Node20 but `qmd:setup` needs Node≥22 + 4.4GB models. Keep new golden rows `qmdOnly` → auto-skip offline (explicit decision, **not** a silent skip).
6. KILL path 4a: if deterministic RRF breaks tests, ship `union+dedupe+stable-sort` (defer RRF→0e). The deterministic floor (no crash, no empty shortlist) is non-negotiable.

## Log (newest last)
- **session start** — Recon done. Confirmed: `dispatch.ts`=1026L (>800 debt real);
  PR stack #37/#38/#39 all DRAFT + MERGEABLE, linear; 0d scope = "exploitation de
  l'arsenal" (ROADMAP 433-442), edits `dispatch.ts:274-278` → U1 must precede it;
  QMD MCP live (1132 docs, collections mas-arsenal/memory/workflows/knowledge).
  Wrote PLAN.md + this file. Launched U1 refactor sub-agent (background).
- **U3 DONE** — preflight-0d workflow returned (4 agents, 324k subagent tokens, ~4min).
  Pack tree-verified; 6 gotchas captured above. 0d build is now de-risked & specced.
- **U1 verified by me** — 5 local checks green, committed+pushed `c19dcca`, backlog RESOLVED.
- **U1 Checker = PASS** (high conf, adversarial diff vs `c19dcca^`) → `U1-checker-verdict.md`. 7/7 contracts hold.
- **U1 SONAR gate passed** (PR#39: 0 issues/hotspots/dup) BUT ⚠️ **CI check "build-test" FAILED on #39** — discovered after I prematurely marked DONE. Sonar ≠ all-green. My 5 LOCAL checks passed (test/lint/build/smoke), so CI failure is env-specific — **prime suspect: the pre-existing `TS2532` strict-null in `*.test.ts` if CI's build-test runs a stricter `tsc` including tests** (delegate.test.ts, dispatch-chaining/delegate.test.ts, delegate.with-diff.test.ts). **U1 = NOT DONE.**
- *FIRST on resume*: `gh pr checks 39 --repo nyvlemyt/MultiAgentOS` + `gh run view <build-test-run-id> --log-failed`. Confirm whether failure is the TS2532 (pre-existing, but if CI gates on it, fix the 4 test files with precise narrowing) or a real regression from the split. Fix on `phase/9c-roster`, re-push (use the gh-credential-helper push form above), re-confirm CI build-test green. ONLY THEN U1 DONE → branch 9d → U4.
- *next (fresh session)*: branch `phase/9d-arsenal` off clean 9c (`c19dcca`) → build **U4 (0d)** per `docs/intake/2026-06-25-0d/preflight-pack.md` §4 (4a→4b→4c→4d, TDD + 5 checks each). Then U5 self-audit + TS2532 debt. Status board above: set U1→DONE.
  When Sonar exit 0 → U1 **DONE** → branch `phase/9d-arsenal` off clean 9c tip → build U4 (0d) per pre-flight pack.
  If Sonar flags issues → fix on 9c first, re-push, re-check, THEN branch.
- **U1 CI FIXED → DONE** (`aef2ea3`) — Root cause was **NOT** the suspected TS2532 (lint+typecheck passed in CI). The build-test failure was a **Playwright smoke-test flake**: 3 routes (`/missions/mission_seed_001`, `/skills`, lang-pill `/`) timed out on `page.goto` (cold `pnpm dev` first-compile under 2-worker CI load); 29/32 passed and the two prior runs on this SHA family were green → timing, not regression. The dispatch.ts split touched only `packages/agents` (no web route). Fix (config-only, no scope-creep, no tsconfig change): `apps/web/playwright.config.ts` test timeout 30s→60s + `navigationTimeout: 45s` + `retries: 1` on CI. Verified locally (smoke 32/32 with CI=1, full unit suite green incl. agents 125/125), pushed, CI run **28139601145 = build-test PASS (all steps ✓)**, Sonar exit 0. **U1 DONE.** Branch `phase/9d-arsenal` off tip `aef2ea3` (NOT `c19dcca` — take the CI fix) for U4.
