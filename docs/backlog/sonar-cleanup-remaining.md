# SonarCloud cleanup — remaining work (handoff for an autonomous session)

> **✅ RESOLVED 2026-06-14 (item 5 Hardening).** `main` is Sonar-clean: the live API reports
> **0 open issues and 0 TO_REVIEW hotspots** on branch `main` (`api/issues/search` +
> `api/hotspots/search`, project `nyvlemyt_MultiAgentOS2`). The strict 5th-check gate enforced
> on every phase PR since (script must exit 0 + gate OK before merge, CLAUDE.md §7) cleared the
> Wave B/C backlog incrementally. The Wave that remained is the **non-code, UI-only** SonarCloud
> admin actions (Mark-Safe seed/test hotspots, Source File Exclusions for `**/.claude/**`,
> UTF-8 encoding, delete duplicate Sonar projects) — those require the SonarCloud web UI and are
> the user's to action. The `stream/route.ts` SSE composite-cursor item stays a separate backlog
> (see below). Nothing code-side remains for an autonomous session.

**Branch** : `chore/sonar-cleanup` (PR open, based on `main`). Wave A already done (`55fc394` + `aa556e1` scanner str() + `0ee9443` .mcp.json removed from git).
**Sonar** : project `nyvlemyt_MultiAgentOS2`, org `nyvlem`, **public** → read issues without auth via
`https://sonarcloud.io/api/issues/search?componentKeys=nyvlemyt_MultiAgentOS2&resolved=false&ps=100&branch=main`
and hotspots via `.../api/hotspots/search?projectKey=nyvlemyt_MultiAgentOS2&status=TO_REVIEW&ps=100`.

## Hard rules (read CLAUDE.md first)
- §11 no PAYG (no `@anthropic-ai/sdk`), §5 risky actions gated, Conventional Commits ≤60 chars, **no force-push**, **never touch `main`** (work only on `chore/sonar-cleanup`).
- **Budget**: this is an authorised **full local session** (~5 h window). Use it — keep going until the issue list is cleared or no safe progress remains. **Do NOT pause at a % and do NOT ask the user anything** (they are asleep). Eco style for prose only.
- PDFs → read the local `docs/ressources/md/*.md` cache, never image-mode.
- **Sonar line numbers shift** — ALWAYS re-fetch the live issue list before editing; locate by symbol/context, not stale lines.
- **Verify after each batch** (local toolchain works): `pnpm -r test` (28 unit) + `pnpm --filter @mas/web lint` (tsc). Then the e2e: `lsof -ti:3000 | xargs kill` (free the user's dev server) → `pnpm --filter @mas/web smoke` (smoke + lifecycle + skills; MAS_MOCK_LLM is in the config). The `build-test` CI also re-runs it on push (double check).
- **Commit + push per batch** (small commits) so a later failure never loses earlier good work. PR auto-updates. **Don't merge.**
- **Safety**: if a fix doesn't verify (unit/tsc/e2e fail), **revert that one fix and backlog it** — never leave the branch red on unit/tsc. Partial progress is fine; report exactly what was done vs deferred.

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

### Deferred during the 2026-06-08 autonomous run (see `docs/learning/2026-06-08-sonar-cleanup/build-report.md`)
- **S4325 `apps/web/app/(cockpit)/trace/page.tsx:13` (MINOR, new)** — Sonar "unnecessary assertion" on the SSE handler line conflicts with tsc: `e` is typed `Event` (EventSource string-event overload) so `(e as MessageEvent)` is required for `.data`. Fix by typing the listener param `(e: MessageEvent) =>` **iff** it passes `strictFunctionTypes`, else Mark in the Sonar UI. Not worth a tsc-breaking change.
- **S6848 `apps/web/components/MissionsBoardClient.tsx:56` (MAJOR, a11y)** — the kanban drop-zone `<section>` needs a genuine accessible drag-and-drop redesign (interactive role + keyboard/touch alternative), not a token `role`. Also couples to the `<section>` tag in `lifecycle.spec.ts` (`ancestor::section`, `locator('section')`). Do in a dedicated a11y PR.

## Also handle (this autonomous run)
- **Copilot PR review comments**: find the open PR for `chore/sonar-cleanup` (`https://api.github.com/repos/nyvlemyt/MultiAgentOS/pulls?head=nyvlemyt:chore/sonar-cleanup&state=open`), read its review comments (`.../pulls/<n>/comments`), and address each remaining one in code — EXCEPT the `stream/route.ts` SSE cursor (that one is backlog, leave it). Verify + commit as above.
- **Final self-review**: after the waves, review the whole branch diff vs `main` (`git diff main...HEAD`) for anything Sonar/Copilot missed — obvious bugs, dead code, missed readonly. Fix only clear wins; don't refactor for taste.
- **Final report**: write `docs/learning/<date>-sonar-cleanup/build-report.md` (scope · issues cleared by rule · issues deferred + why · Copilot comments handled · files touched · CI status · commit list). This is the morning summary.

## Done criteria
PR `chore/sonar-cleanup` green (CI `build-test`), most code issues cleared, risky ones (a11y `<dialog>`, S3776) either done-and-verified or backlogged with reason, build-report written. **Don't merge** — hand back to the user.
