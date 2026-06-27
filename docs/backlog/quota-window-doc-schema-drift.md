# Backlog — Quota-window / budgets doc ↔ schema drift (TOKEN_STRATEGY + PRODUCT_SPEC)

**Source**: `.md`-excellence round-2 adversarial re-audit, 2026-06-27 (`tasks/wyk3v9ly3.output`, TOKEN_STRATEGY verifier — residual defects, disk-verified against `packages/db/src/schema.ts`). Same class as round-1 deferred item D (PRODUCT_SPEC §8 index/schema drift).

## What

The token/quota docs present a **5-hour rolling-window quota model** as current reality, but the shipped `budgets` table implements a simpler **period-bucket** model. The two never reconciled.

Disk facts (`packages/db/src/schema.ts:249`):

- `budgets` columns = `(id, scope[global|project|mission|task], scopeId, period[day|week|month|mission], tokensCap, tokensSpent, moneyCapCents, moneySpentCents)`.
- There is **no** `subscriptionUserId` column anywhere, and **no** `windowStart` on `budgets` — `windowStart` lives on the unrelated `schedules` table (autopilot window, `schema.ts:280`).

Doc claims that contradict the above:

1. **`TOKEN_STRATEGY.md §8`** (line ~76): "The quota counter in `budgets` is keyed on `(subscriptionUserId, windowStart)`." → neither column exists on `budgets`. Real bucketing is `(scope, scopeId, period)`.
2. **`TOKEN_STRATEGY.md §3`** (line ~21): "the window is shared across all projects under the subscription (key: `subscriptionUserId + windowStart`)" → same phantom key.
3. **`TOKEN_STRATEGY.md §1 / §2 / §8`**: the "5-hour rolling message window" is stated as fact throughout; no 5-hour bucketing logic exists in `packages/core/src` / `packages/worker/src` (only `period` enum + the in-memory router window from `llm.router.ts`, see [router-window-state-persistence.md](router-window-state-persistence.md)).
4. **`TOKEN_STRATEGY.md §4` (Caching layers)**: `context-packs` and `mission-summaries` described in present tense ("Built by the Context Manager", "Built at `archived`"). `contextPacks` table exists (`schema.ts:260`) but `data/context-packs/` and `data/mission-summaries/` dirs do not yet exist on disk, and the `mas-context-manager` build path is partial. Present tense over-claims shipped state.
5. **`PRODUCT_SPEC.md §8`** (round-1 item D): "Key indices" cite `(task_id,created_at)` + `(scope,scope_id,period)` indices that don't match `schema.ts` (real: `(missionId,createdAt)`, `(agentId,createdAt)`).

## Why it's only backlog, not a fix-now

- **No runtime defect** — the worker's budget check uses the real `(scope, scopeId, period)` columns; the gate is green. This is purely doc-vs-code narrative drift.
- **Design-intent vs implementation gap, not a typo** — the 5-hour-window model is the *intended* steady-state (ADR 0009 / billing-isolation), genuinely not yet built. It deserves a deliberate decision (build the window bucketing, or rewrite the docs to the period model), not a rushed one-line patch that would itself drift.
- **Out of `.md`-excellence round-2 scope** — round-2 fixed the 7 named round-1 findings (paths, §-refs, ≤7 tools, When-NOT, observable criteria). This is a deeper architectural reconciliation, exactly the "treat D as a second PR / backlog card" call the round-1 verdict made.

## What to do (when picked up)

1. **Decide the model**: (a) implement the 5-hour shared-window quota bucketing in `budgets` (add `subscriptionUserId` + `windowStart`, or a dedicated `quota_windows` table) to match TOKEN_STRATEGY's intent, **or** (b) rewrite TOKEN_STRATEGY §1/§3/§8 to the shipped `period`-bucket model and demote the 5-hour window to a clearly-marked "target design (not yet built)". Likely (a) long-term, (b) now.
2. **Mark §4 caching layers** that aren't built yet (context-packs dir, mission-summaries) as planned, or ship the missing build path + dirs.
3. **Reconcile `PRODUCT_SPEC.md §8`** "Key indices" with the real `schema.ts` indices in the same pass (round-1 item D).
4. Pair this with the `mas-context-manager` / `data/context-packs/` gap so the budget + context-pack narratives land together.
5. Re-audit TOKEN_STRATEGY + PRODUCT_SPEC §8 against `schema.ts` after — every cited column/index must exist on disk.

## Extractable principle

Doc prose about a DB shape must cite the **actual `schema.ts` columns/indices**, present-tense only for what exists; intended-but-unbuilt structures get an explicit "(target design)" tag. Same rule that fixed the round-2 path/section drift, applied to schema claims.
