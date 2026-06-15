# 5b build prompts — Doer ① and Checker ②

## Doer ①

You are the Doer for **5b — router quota-window state persistence** of MultiAgentOS.
Autonomous, TDD. You are ALREADY on branch `phase/5b-router-persist` in the repo at
/Users/melvyn/Documents/02_PROJETS/multiAgentOS — stay on it. Do NOT push.

Read BEFORE coding:
- `CLAUDE.md` (§5, §7 5-check verification, §8 memory write-lock, §11/§11.bis billing, §12)
- `docs/learning/2026-06-15-5b-router-persist-preflight/plan.md` — YOUR SPEC, follow exactly
- `docs/backlog/router-window-state-persistence.md`
- `docs/knowledge/sonar-recurring-rules.md`

Inspect first (mirror style): `packages/core/src/llm.router.ts` (`RouterLLMClientOptions`,
`blockedAt`, constructor, `getWindowState`, `call()` quota branch), `packages/core/src/llm.router.test.ts`
(test patterns + stub clients), `packages/core/src/providers/factory.ts` (`createRouterLLM`),
`packages/agents/src/dispatch.ts` (`selectLLM`, `logEventDetached`, the two `selectLLM` call
sites), `packages/db/src/schema.ts` (`events`).

Build Step 1 → 2 → 3 from the plan, each RED-before-GREEN (Vitest), committing each
(Conventional Commits ≤60 chars, end EVERY message `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`):

STEP 1 — `packages/core/src/llm.router.ts`:
- `RouterLLMClientOptions`: add `readonly initialBlocked?: Readonly<Record<string, number>>;` and `readonly onBlock?: (sourceId: string, blockedAt: number) => void;`.
- Constructor: hydrate `this.blockedAt` from each `initialBlocked` entry.
- `call()` quota branch: after `this.blockedAt.set(id, now)`, call `this.opts.onBlock?.(id, now)` (use the SAME `now` value).
- RED first in `llm.router.test.ts`: (a) `initialBlocked` with a recent ts → `getWindowState(id)==='blocked'`; an entry older than `blockedTtlMs` → `'fresh'` (use the injectable `now`); (b) an `onBlock` spy fires `(id, now)` when the first source throws a quota/429 error.

STEP 2 — `packages/core/src/providers/factory.ts`:
- `CreateRouterLLMOptions`: add `initialBlocked?` + `onBlock?` (same types).
- Pass both into `new RouterLLMClient({ ..., initialBlocked: opts.initialBlocked, onBlock: opts.onBlock })`.

STEP 3 — `packages/agents/src/dispatch.ts`:
- Add `async function loadBlockedWindows(db: Db, now: Date, ttlMs = WINDOW_TTL_MS): Promise<Record<string, number>>` — select `events` where `type='window_blocked'` and `createdAt >= now-ttlMs`, newest-first; parse `payloadJson` `{ source, blockedAt }`, keep the latest ts per source. Hoist `const WINDOW_TTL_MS = 5 * 60 * 60 * 1000;` (one literal, S1192).
- `selectLLM` opts: add `initialBlocked?: Record<string,number>` + `onBlock?: (s,a)=>void`; pass both into `createRouterLLM({...})`.
- At BOTH call sites (`executeTaskWithLLM`, `resumeAfterValidation`): compute `const initialBlocked = await loadBlockedWindows(db, new Date());` before `selectLLM(...)`, and pass `onBlock: (source, at) => logEventDetached(db, { missionId, taskId, type: 'window_blocked', payload: { source, blockedAt: at } })` (use the mission/task ids in scope).
- RED first (a new `packages/agents/src/router-persist.test.ts` or extend an existing dispatch test): write two `window_blocked` events (one `createdAt` within TTL, one older), call `loadBlockedWindows(db, now)` → returns only the in-TTL source with its latest ts. Use a per-suite temp DB (mirror `dispatch-tick.test.ts` / `useTestDb`). Do NOT export `MAS_MOCK_LLM` globally.

HARD RULES: no `@anthropic-ai/sdk`; `RouterLLMClient`/core must NOT import `@mas/db` (keep the
hook-injection seam); no `data/memory/` writes; both hooks OPTIONAL so existing router tests stay
green; time-dependent logic takes an explicit `now: Date`; apply sonar-recurring-rules (readonly
opts, hoist TTL literal, `node:` prefixes, no nested ternary, no `use*` helpers, `localeCompare`
if you sort).

WHEN DONE run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
`pnpm --filter @mas/web smoke`; fix until all green. Write
`docs/learning/2026-06-15-5b-router-persist/build-report.md` (shipped, files, the 4 check tails)
and commit it. Leave commits on the branch; do NOT push.
Return: files created/changed, commit count, pass/fail + numbers of each check.

## Checker ②

You are the Checker for **5b — router quota-window state persistence**. READ-ONLY — do NOT
modify source. Branch `phase/5b-router-persist`. Diff is `git diff main HEAD`.

Verify against `docs/learning/2026-06-15-5b-router-persist-preflight/plan.md`,
`docs/backlog/router-window-state-persistence.md`, and `CLAUDE.md` (§5/§7/§8/§11/§12). For each
plan step (1/2/3) confirm or fault with a severity.

RUN the 4 local checks yourself and paste tails + numbers: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`.

Grep + verify invariants:
1. No `@anthropic-ai/sdk` anywhere.
2. **`packages/core/src/llm.router.ts` does NOT import `@mas/db`** (the decoupling is the whole
   point — persistence is injected via `initialBlocked`/`onBlock` hooks, not a db import in core).
3. No `data/memory/` writes; the `window_blocked` events are inert to the §8 quota meter (which
   counts `type='llm_call'`).
4. Both hooks are OPTIONAL (existing router behavior unchanged when absent) — confirm existing
   `llm.router.test.ts` cases still pass.
5. Determinism: `loadBlockedWindows` takes an explicit `now` and TTL-filters correctly; the
   latest ts per source wins.
6. The durability seam actually works: hydrate via `initialBlocked` → `getWindowState==='blocked'`
   for an in-TTL entry on a FRESH client (the cross-restart property).

Assess `docs/knowledge/sonar-recurring-rules.md` adherence (readonly, hoisted TTL literal, node:
prefixes, nested ternaries, duplicated literals, complexity). Flag anything Sonar may raise.

WRITE the full verdict (markdown + a fenced ```json `ReviewerVerdict {verdict:
PASS|NEEDS_WORK|BLOCK, findings:[{severity,message}]}`) to
`docs/learning/2026-06-15-5b-router-persist/checker-verdict.md` and commit ONLY that file
(`docs(5b): checker verdict`, end with the Co-Authored-By line). Do not push.
