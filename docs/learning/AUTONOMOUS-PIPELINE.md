# MultiAgentOS — Autonomous Build Pipeline (paste-to-run)

> **How to use:** open a fresh Claude Code session at the repo root and paste the **RUN BLOCK** below.
> It is self-contained. The model audits, delegates to Doer/Checker subagents, pushes, re-audits,
> opens a PR, drives Sonar to zero, and moves to the next item in the order — without you running
> anything on the interactive session. You only merge the PRs.

State as of 2026-06-14: Phases 0–7 **merged to `main`** (PRs #1–#12). Next up = **5b**, then the order
in §"What to do next". This file is the single source of truth for the loop; the per-phase scope lives
in `ROADMAP.md`, the recurring Sonar fixes in `docs/knowledge/sonar-recurring-rules.md`.

---

## ▶ RUN BLOCK (paste this whole block)

You are running AUTONOMOUSLY on MultiAgentOS. The user will NOT run anything on this session and will
only merge PRs. Never ask for input — if a product choice is needed, pick the simplest option
consistent with `PRODUCT_SPEC.md`/`ROADMAP.md`, record it in the build report, and continue. Keep
going item after item (see "What to do next") until you run out of tokens or there is nothing left to
advance. Caveman-terse for prose; normal for code/commits/PRs/security.

### Ground truth (read first, every item)
- `CLAUDE.md` — esp. §5 risky actions (always gated), §7 verification = **5 checks incl. Sonar**, §8
  memory write-lock (Memory Keeper only writes `data/memory/`), §11/§11.bis billing, §12 knowledge,
  §13 learning bootstrap.
- `ROADMAP.md` (phase scope + exit criteria) · `AGENTS.md` (roster) · `docs/learning/AUTONOMOUS-
  PIPELINE.md` §"What to do next" (the order) · `docs/knowledge/sonar-recurring-rules.md` (avoid the
  recurring smells while writing).
- The most recent `docs/learning/*-preflight/` packs show the exact plan + Doer + Checker format to mirror.

### The per-item pipeline (repeat until the item is fully done)
1. **SYNC.** `git checkout main && git pull`. Confirm the previous item's PR is merged (`gh pr list
   --state merged`). If a prerequisite PR is still OPEN (user not awake), DO NOT wait — branch the new
   item off the previous item's branch so work chains without a merge. Base the eventual PR on that
   branch; note "retarget to main after the chain merges".
2. **PRE-FLIGHT / AUDIT (§13).** Targeted intake-audit of the resources for this item (method:
   `docs/workflows/intake-audit-template.md`) — scope to the item, not the whole backlog. Distill kept
   items into `docs/knowledge/`. Resolve any open ADR question and flip the ADR to Accepted. Inspect
   the existing code the item touches (read the real files; mirror their style). Write the pack to
   `docs/learning/<date>-<item>-preflight/`: `plan.md` (build steps, files, risks, **DoD incl. the 5th
   Sonar check**) + `build-prompt.md` (filled **Doer ①** and **Checker ②** — templates below). Commit
   + push the pack.
3. **BUILD via SUBAGENT(S).** Spawn one (or several parallel, if the steps are independent)
   general-purpose subagent(s) with the Doer ① prompt, on a new branch `phase/<item>-<slug>`. TDD —
   red before green, commit each step, run the 4 local checks. Wait for completion.
4. **SELF-VERIFY before the Checker.** Don't trust the subagent's word: run `pnpm -r test` and
   `pnpm lint` yourself, grep the invariants the item touches (no `@anthropic-ai/sdk`; no
   `data/memory/` writes outside Memory Keeper; §5 gate intact). If anything is off, fix it (TDD) or
   re-dispatch.
5. **CHECK via SUBAGENT.** Spawn a read-only subagent with the Checker ② prompt. It MUST write its full
   verdict (markdown + a `ReviewerVerdict` JSON) to `docs/learning/<date>-<item>/checker-verdict.md`
   and commit it. **Read that file yourself** — do not rely on the chat return.
6. **RE-AUDIT / IMPROVE (the improvement loop).** Act on every actionable Checker finding and every
   warn you can pre-empt (esp. likely Sonar smells: duplicated literals → hoist; `role="status"` →
   `<output>`; `.sort()` → `localeCompare`; `execFileSync` → async `execFile`; `use*` helper names →
   `setup*`; cognitive complexity → extract a helper). Fix TDD, re-run the 4 checks. Repeat 5–6 until
   the Checker is PASS with no open actionable finding.
7. **SONAR — the 5th check (MANDATORY).** Push the branch. Poll SonarCloud until the analysis of your
   HEAD sha lands (project `nyvlemyt_MultiAgentOS2`; poll
   `api/project_pull_requests/list` and watch `analysisDate` change). Run `scripts/sonar-pr-issues.sh
   <pr>`. Fix EVERY issue AND every to-review hotspot it lists (not just gate-failers), using
   `docs/knowledge/sonar-recurring-rules.md`; re-push; re-poll; repeat until it **exits 0** AND the
   gate status is OK. A green gate with open smells is NOT done.
8. **PR.** `gh pr create` (gh is authenticated) with a full summary + verification evidence (the 5
   checks with numbers, the Checker verdict, deferrals). Comment the final Sonar evidence on the PR.
   Leave it OPEN for the user to merge. NEVER merge it yourself; NEVER push to `main`.
9. **PERSIST.** Update memory at
   `/Users/melvyn/.claude/projects/-Users-melvyn-Documents-02-PROJETS-multiAgentOS/memory/` (one fact
   per file + a one-line `MEMORY.md` pointer): what shipped, PR number, Checker verdict, deferrals.
   Update this file's §"What to do next" (tick the item, surface the next).
10. **NEXT.** Go to step 1 for the next item in §"What to do next".

### Hard rules (never break, even unattended)
- **5 checks green** before any item is "done": `pnpm -r test` · `pnpm lint` · `pnpm build` ·
  `pnpm --filter @mas/web smoke` · `scripts/sonar-pr-issues.sh <pr>` exits 0.
- Canonical `pnpm -r test` — **NEVER export `MAS_MOCK_LLM` globally** (breaks `dispatch.test.ts`
  vi.mock seam). Tests opt in per-suite.
- **§11 billing:** no `@anthropic-ai/sdk` import anywhere; provider SDKs only under
  `packages/core/src/providers/`; paid APIs default OFF; no € figures (quotaUnits only). The lint guard
  `scripts/lint-no-sdk-payg.sh` must stay green.
- **§8:** Memory Keeper is the sole writer to `data/memory/`. Seeds/candidates go to the inbox tables,
  never the store.
- **§5:** risky actions stay gated. Autonomy floors are defaults, not overrides.
- **TDD** for all new domain logic (watch red before green). Conventional Commits ≤60 chars, each
  ending `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- NEVER push to `main` (blocked anyway) and NEVER merge a PR — leave PRs for the user.
- Time-dependent logic takes an explicit `now: Date` (no buried `Date.now()`), for deterministic tests.

### Doer ① template (fill per item)
> You are the Doer for **<ITEM>** of MultiAgentOS. Autonomous, TDD. You are ALREADY on branch
> `phase/<item>-<slug>` — stay on it. Read `CLAUDE.md` (§5/§7/§8/§11/§12), the relevant `ROADMAP.md`
> section, `docs/learning/<date>-<item>-preflight/plan.md` (your spec), and
> `docs/knowledge/sonar-recurring-rules.md` BEFORE coding. Inspect these existing files first: <LIST>.
> Build these steps in order, each RED-before-GREEN (Vitest), committing each (Conventional Commits
> ≤60 chars, end every message `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`): <STEPS>.
> HARD RULES: no `@anthropic-ai/sdk`; don't touch `packages/core/src/providers/`; never export
> `MAS_MOCK_LLM` globally; memory writes only via candidate tables (§8); apply sonar-recurring-rules
> proactively (no `use*` helpers, `node:` prefixes, readonly, no nested ternaries, hoist duplicated
> literals, `<output>` over role=status, async `execFile`, `localeCompare` sorts). If a step runs very
> long, ship the exit-criterion core + document the rest as a `<item>b` deferral. WHEN DONE run from
> repo root and paste exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
> `pnpm --filter @mas/web smoke`; fix until green. Write `docs/learning/<date>-<item>/build-report.md`
> (shipped, files, check tails, deferrals) and commit. Leave commits on the branch; do NOT push.
> Return: files created, commit count, pass/fail + numbers of each check.

### Checker ② template (fill per item)
> You are the Checker for **<ITEM>**. READ-ONLY — do NOT modify source. Branch `phase/<item>-<slug>`.
> Verify against `docs/learning/<date>-<item>-preflight/plan.md`, the `ROADMAP.md` section, and
> `CLAUDE.md` (§5/§7/§8/§11/§12). For each plan point, confirm or fault it (with severity). RUN the 4
> local checks yourself and paste tails + numbers. Grep the invariants: no `@anthropic-ai/sdk`
> anywhere; no `data/memory/` writes outside Memory Keeper; §5 gate intact. Assess adherence to
> `docs/knowledge/sonar-recurring-rules.md`. Judge whether the exit criterion is met and whether any
> deferral is acceptable or a BLOCK. WRITE the full verdict (markdown + a fenced ```json
> `ReviewerVerdict {verdict: PASS|NEEDS_WORK|BLOCK, findings:[{severity,message}]}`) to
> `docs/learning/<date>-<item>/checker-verdict.md` and commit ONLY that file (`docs(<item>): checker
> verdict`, end with the Co-Authored-By line). Do not push. Prioritize coverage over filtering.

---

## ✅ What to do next (the order — work top to bottom)

> Tick items as PRs open. Each links to its scope. When unsure of scope, expand it into a preflight
> `plan.md` before building (step 2).

- [x] **1 · 5b — wire `delegate()` into live execution** — PR #13 OPEN, Checker PASS, 5/5 green (Sonar exit 0). Awaiting user merge.
  Phase 5 built the Tier B delegation engine + diff-validation + review-gate as an isolated layer.
  Branch it into `executeTaskWithLLM` (`packages/agents/src/dispatch.ts`) so real missions route the
  right task to the mapped Tier B agent (`TIER_B_DELEGATION_MAP`), produce a sandbox diff, and pass
  the Code-Reviewer + Reality-Checker gate before user validation. Keep execution Claude-only
  (§11.bis r4). Exit: a real mission emits a reviewed unified diff. Likely files: `dispatch.ts`,
  `delegate.ts`, `review-gate.ts`, new dispatch tests.

- [~] **2 · Tech-debt sprint** — win 1 SHIPPED (PR #14, Checker PASS, 5/5 green); win 2 → 2b (attended).
  - [x] **drizzle-0006 snapshot** (`docs/backlog/drizzle-0006-snapshot-drift.md`): reconstructed
    `meta/0006_snapshot.json` (= 0007 minus `schedules`) + repointed 0007 `prevId` so the chain is
    `0005→0006→0007`. Added a `migrations-meta.test.ts` chain-integrity guard. `drizzle-kit generate`
    clean (no stray ALTER, no 0008). In the item-2 PR.
  - [ ] **2b · run-inline-execution-in-next** (`docs/backlog/run-inline-execution-in-next.md`):
    DEFERRED to an ATTENDED session. The legit fix (backlog §4/§5 forbids the `import.meta.url`
    symptom-patch) is an **execution-model migration** — `/run` enqueues to `apps/worker` instead of
    driving inline — which changes the Run UX and requires rewiring the Playwright smoke (a 2nd
    `webServer` running the worker on a shared SQLite file, timing-dependent → flake-prone). Too risky
    to verify unattended without breaking the e2e net. Note: `drizzle-kit generate` is currently clean
    even with the old gap, and the worker already executes dispatched missions with full injection, so
    the live degradation only affects the inline `/run` convenience path.

- [~] **3 · Phase 8 (functional half)** — 3a SHIPPED (PR #15), 3b deferred to attended.
  - [x] **3a · multi-project parallel execution** — `runDispatchTick` + per-project/global
    concurrency budget in the worker. Checker PASS, 5/5 green. PR #15.
  - [ ] **3b · headless `claude` CLI executor** (ATTENDED) — spawns the real `claude` binary
    (needs `claude login` + binary); unverifiable in CI/smoke unattended. SDK executor already
    covers all autonomy modes, so no missions are blocked.

- [~] **4 · 7b — onboarding & UX polish** — 4a in progress; tour/states/i18n → 4b/4c.
  - [x] **4a · stack auto-detection from `projects.path`** — pure detector wired into
    `createProject`. Checker PASS, 5/5 green (Sonar clean first pass). PR #16.
  - [ ] **4b/4c** — onboarding tour (≤5 steps across the 7 zones); remaining
    empty/error/no-permission states; deeper per-page i18n (fr/en). Frontend/visual — batch
    (attended-friendly).

- [~] **5 · Hardening** — 5a SHIPPED (PR #17); 5b next; self-audits = human governance pass.
  - [x] **5a · Sec-Reviewer BLOCK-path test coverage** — unit-test `mockSecReviewer` BLOCK
    boundary + the reject→blocked §5 gate path. 5/5 green, Sonar clean first pass. PR #17.
  - [x] **sonar-cleanup-remaining** — CLOSED: `main` verified 0 issues / 0 hotspots; backlog
    doc marked RESOLVED. Remaining = SonarCloud UI admin actions (user).
  - [ ] **5b · router-window-state-persistence** (NEXT, own PR off main) — inject
    `initialBlocked` (hydrate `blockedAt`) + `onBlock` (emit `window_blocked` event) hooks
    through `createRouterLLM`; keep `RouterLLMClient` (core) free of `@mas/db`. Spec +
    design: `docs/backlog/router-window-state-persistence.md` + memory `project_phase5_hardening`.
  - [ ] **self-audits** (ATTENDED governance) — lean-CLAUDE.md trim (RES-012 <200 vs RES-061
    <150 contradiction) + BDR/EDR/ADR registry-name harmonization in `gouvernance.md`. The
    docs state the final call is human (Melvyn). mémoire-audit §1 already resolved 2026-06-07.

- [ ] **6 · Phase 8 (packaging half) — Tauri + notifier**  *(do in an ATTENDED session)*
  Tauri desktop wrapper (Rust toolchain, native build, code signing — outward-facing, hard to verify
  unattended) + optional Slack/Telegram notifier for autopilot wake reports. Flag to the user; don't
  run this fully unattended.

- [ ] **7 · second-brain cross-project** *(future feature)*
  `docs/backlog/second-brain-cross-project.md` — runtime memory shared across projects, seeded from
  `docs/knowledge/` + `vibeflow/INDEX.md` (Phase 4 persistence-bridge promise).

**Rule of thumb:** functional unlocks first (5b), then debt that bites the next change, then Phase 8
functional, then polish, then hardening, then packaging (attended), then the expansion feature.
