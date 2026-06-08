# SonarCloud cleanup — remaining work (handoff for an autonomous session)

**Branch** : `chore/sonar-cleanup` (PR open, based on `main`). Wave A already done (`55fc394` + `aa556e1` scanner str() + `0ee9443` .mcp.json removed from git).
**Sonar** : project `nyvlemyt_MultiAgentOS2`, org `nyvlem`, **public** → read issues without auth via
`https://sonarcloud.io/api/issues/search?componentKeys=nyvlemyt_MultiAgentOS2&resolved=false&ps=100&branch=main`
and hotspots via `.../api/hotspots/search?projectKey=nyvlemyt_MultiAgentOS2&status=TO_REVIEW&ps=100`.

## Hard rules (read CLAUDE.md first)
- §11 no PAYG (no `@anthropic-ai/sdk`), §5 risky actions gated, Conventional Commits ≤60 chars, **no force-push**.
- **Token budget : eco, batch, pause at 80 %.** PDFs → read the local `docs/ressources/md/*.md` cache, never image-mode.
- **Sonar line numbers shift** — ALWAYS re-fetch the live issue list before editing; locate by symbol/context, not stale lines.
- After each batch: `pnpm -r test` + `pnpm --filter @mas/web lint` (tsc). For e2e: free port 3000 (`lsof -ti:3000 | xargs kill`) then `pnpm --filter @mas/web smoke` (MAS_MOCK_LLM is in playwright.config). Don't merge — user decides.

## CODE to fix (on chore/sonar-cleanup)

### Wave B — MAJOR / real
- **S6759 "mark props read-only" (~24 components)** — wrap each component's props type in `Readonly<…>`. Files: `app/(cockpit)/{agents/[id],layout,memory/page,missions/[id],page,projects/[slug],projects/new,skills/page,tokens/page,trace/page}.tsx`, `app/layout.tsx`, `components/{AgentAvatar,AgentCard,BudgetBar,KanbanColumn,MissionActions(×2),MissionCard,MissionsBoardClient,ModePill(×2),RiskBadge,Sparkline,Timeline,ValidationModal,studio/OrbitView,studio/OrgChartView}.tsx`. Pure mechanical.
- **S3358 nested ternary (×9)** — extract to a named const/helper: `missions/[id]/page.tsx` (×5), `(cockpit)/page.tsx`, `BudgetBar.tsx`, `MissionActions.tsx`. (fixtures already done in Wave A.)
- **S6479 array-index keys (×2)** — `MissionCard.tsx`, `studio/OrbitView.tsx`: key by a stable id, not the loop index.
- **S7735 negated condition (×3)** — `(cockpit)/page.tsx`, `skills/page.tsx` (×2): flip `x !== 1 ? 's' : ''` → `x === 1 ? '' : 's'`.
- **S7677 `lint-no-sdk-payg.sh`** — redirect the error `echo`s to stderr (`>&2`).
- **a11y — CAREFUL, verify e2e:**
  - **S6819 `ValidationModal.tsx`** role="dialog" → native `<dialog>`. ⚠️ `lifecycle.spec.ts` asserts `getByRole('dialog', {name:/pending validation/i})` and clicks Approve. A native `<dialog>` keeps role=dialog but changes rendering (needs `open`/`showModal`). **Run lifecycle.spec after; if it breaks, revert this one + backlog it.**
  - **S6848 `MissionsBoardClient.tsx`** non-native interactive el → add `role` + keyboard handlers or use a `<button>`.

### Wave C — lower / risky
- **S3776 `dispatch.ts` `executeNextTask` cognitive complexity 23>15** — ⚠️ this is the §5 risk-gate code just fixed. Extract small pure helpers (the review/verdict block; the risk-gate block) **without changing behavior**; keep `dispatch.test.ts` (8 tests) green. If it gets risky, **backlog instead** — do not destabilise §5.
- **S2871 `dispatch.test.ts`** `.sort()` without comparator → add a comparator.
- **S1135 `dispatch.ts:~241` TODO (INFO)** — leave (real TODO) unless trivially closable.

## NOT code — user does in SonarCloud UI (agent can't click; or via Sonar MCP if active)
1. **Mark Safe** the 12 `S2245` Math.random hotspots (`seed.ts`, `fixtures.ts`) + 2 `S5443` (test dirs) → comment "non-security seed/test data". (Project → Security Hotspots.)
2. **Analysis Scope → Source File Exclusions** : add `**/.claude/**` → removes the ~8 vendored shell-script issues (`web-artifacts-builder/scripts/*.sh`). Optionally `**/*.test.ts` for test-only rules.
3. **General → Encoding = UTF-8** → clears the "file encoding" warning (emoji in source).
4. **Delete duplicate Sonar projects** — keep `nyvlemyt_MultiAgentOS2` (the one bound to GitHub + decorating PRs); delete the dead `MultiAgentOS*` dupes.

## Backlog (do NOT rush in this PR)
- **`stream/route.ts` SSE cursor (Copilot #2, High)** — `createdAt`-only `gt` cursor can skip events sharing a millisecond. Real but pre-existing. Proper fix = composite cursor `(createdAt, id)` with matching `orderBy` + `or(gt(createdAt,c), and(eq(createdAt,c), gt(id,lastId)))`. Separate PR. Resolve the Copilot thread with "backlogged here".

## Done criteria
PR `chore/sonar-cleanup` green (CI `build-test` + Sonar gate), main issue count down from ~61, report cleared-vs-deferred. Don't merge — hand back to the user.
