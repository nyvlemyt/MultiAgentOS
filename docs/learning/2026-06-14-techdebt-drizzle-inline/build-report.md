# Build report — item 2 · Tech-debt sprint

Date 2026-06-14 · Branch `phase/techdebt-drizzle-inline` (chained off
`phase/5b-delegate-live`, base `main`; retarget to main after #13 merges).

## Win 1 — drizzle-0006 snapshot drift ✅ SHIPPED

**Problem** (`docs/backlog/drizzle-0006-snapshot-drift.md`): `meta/0006_snapshot.json`
was never committed, so the meta chain jumped `0005 → 0007` and 0007's snapshot folded
in BOTH the 0006 change (`projects.language`) and its own (`schedules` table), with
`0007.prevId` pointing at 0005.

**Fix:**
- Reconstructed `packages/db/migrations/meta/0006_snapshot.json` = the 0007 snapshot
  minus the `schedules` table, with a fresh `id` and `prevId` = 0005's id. (Verified
  0007 differs from 0005 by exactly `projects.language` + the `schedules` table, so
  "0007 minus schedules" == the true 0006 state.)
- Repointed `0007_snapshot.json` `prevId` → the new 0006 id. Chain is now
  `0005 → 0006 → 0007` (2-line diff; drizzle's own format preserved).
- Added `packages/db/src/migrations-meta.test.ts`: a chain-integrity guard
  (every journal entry owns a `<idx>_snapshot.json`; each snapshot's `prevId`
  equals the previous snapshot's `id`). TDD: red (0006 missing) → green.

**Verification:** `drizzle-kit generate` → "No schema changes, nothing to migrate"
(no stray ALTER, no spurious 0008 file). `pnpm --filter @mas/db test` 15/15
(13 prior + 2 new guard tests).

## Win 2 — run-inline-execution-in-next ⏭️ DEFERRED to 2b (attended)

`docs/backlog/run-inline-execution-in-next.md` §4/§5 is explicit that the legit fix is
an **execution-model migration** — `/run` should enqueue the mission to `apps/worker`
(native tsx, full skill+memory injection) instead of driving `executeNextTask` inline
inside the Next route handler (where `import.meta.url` degrades injection) — and that
patching `import.meta.url` in the bundle is a forbidden symptom-fix.

That migration is **outward-facing and flake-prone to verify unattended**:
- `/run` semantics change from synchronous inline-drive to async enqueue.
- The Playwright smoke (`lifecycle.spec`) depends on the inline drive reaching the §5
  gate; moving execution to the worker requires a 2nd `webServer` running `apps/worker`
  on a **shared SQLite file** (concurrent better-sqlite3 writers → lock risk) and a
  **timing-dependent** wait for the worker tick (1.5s/task) — exactly the kind of e2e
  flakiness the unattended hard-rule ("5 checks green, never break") forbids introducing.

Current live impact is bounded: `drizzle-kit generate` is clean even with the old gap,
and the worker **already** executes dispatched missions with full injection — only the
inline `/run` convenience path runs degraded. Recorded as item **2b** in
`docs/learning/AUTONOMOUS-PIPELINE.md` for an attended session.

## Checks (4 local; Sonar = 5th, post-push)
- `pnpm -r test` — to run (expect all green; +2 db tests).
- `pnpm lint` — to run.
- `pnpm build` — to run.
- `pnpm --filter @mas/web smoke` — to run.
- Sonar `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK — after push.
