# Spec — Budget/Token system hardening (night of 2026-06-21)

Branch: `feat/dispatch-budget-gate` (PR #33, DRAFT). Base already built + Sonar-clean:
budget gate (pre-flight, concurrency-aware via in-flight reserved tokens), meter fix
(tokens.ts from events + reserved/remaining), per-IA plan awareness (model-routing.json
`claude_plan`/provider plans, `resolveProviderPlans`, `planWarnings`, cockpit column),
session token-watch hook (throttled).

Goal of the night: finish this part so it is **solid**. Each step = Doer then Checker,
re-loop until 5/5 green (test · lint · build · `@mas/web` smoke · Sonar exit 0).

## Step C — Monthly window + plan-derived caps

**Why:** the Claude Max Agent-SDK quota is MONTHLY and separate from Claude.ai (§11).
The gate today only checks day/week. The plan (`claude_plan`) knows the subscription but
its cap isn't wired to the gate.

**Do:**
1. `packages/agents/src/budget-gate.ts`: add a `month` window to `BudgetStatus` +
   `checkDispatchBudget` (spend since start-of-month from events; cap from the global
   `budgets` row period='month'). `evaluateBudget` must report `month` in the precedence
   day → week → month (tightest first stays day).
2. Plan-derived cap: if `config/model-routing.json` `claude_plan.monthlyTokenQuota` is set,
   it overrides the month `budgets.tokensCap` (plan is the source of truth for the
   subscription quota). Resolve via `@mas/core` `resolveProviderPlans` (id `claude`).
   Keep it OPTIONAL — undeclared quota ⇒ fall back to the budgets row ⇒ unlimited if 0.
3. Wire the month block into `runDispatchTick` (same `budget_exceeded` path).
4. Surface month in `apps/web/lib/tokens.ts` `TokenSnapshot` + the tokens page card.
5. Tests: pure `evaluateBudget` month cases; worker integration (month cap reached →
   halt + event). Mirror existing style. No hardcoded `/tmp` (use `node:os` tmpdir) — S5443.

**Don't:** invent the Max quota number — leave `monthlyTokenQuota` unset in config (the
plumbing must work when the user fills it). No new top-level files.

## Step D — budget_exceeded pause+ask UX (CLAUDE.md §6)

**Do:**
1. When dispatch is budget-paused, the cockpit must show it: read the latest
   `budget_exceeded` event (today) and render a banner/indicator (which window, est.
   remaining) on the home/command-center + tokens page.
2. A way to acknowledge/raise the cap is out of scope — just make the pause VISIBLE.
3. Tests: a lib helper `isBudgetPaused()`/snapshot field + a smoke assertion.

**Don't:** auto-resume or auto-raise caps. Surface only.

## Verification ritual (every step)
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke`
(delete stale `data/test/mas-smoke.db*` first) · then push and
`bash scripts/sonar-pr-issues.sh 33` must exit 0 AND no failing gate conditions.
Recurring Sonar rules: nested ternary S3358 (extract to if/else), hardcoded temp S5443
(os.tmpdir), helper naming S6440. See docs/knowledge/sonar-recurring-rules.md.
