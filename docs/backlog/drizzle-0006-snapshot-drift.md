# Backlog — drizzle meta 0006 snapshot drift

**Status:** ✅ RESOLVED 2026-06-14 (tech-debt sprint, item 2 win 1). Reconstructed
`meta/0006_snapshot.json` (= 0007 snapshot minus the `schedules` table, `prevId` →
0005's id) and repointed `0007_snapshot.json` `prevId` → the new 0006 id, so the
chain is `0005 → 0006 → 0007`. Added `packages/db/src/migrations-meta.test.ts` — a
chain-integrity guard (every journal entry owns a snapshot; each `prevId` links the
previous `id`) so this can't drift again. `drizzle-kit generate` is clean.

**Found:** Phase 6 (2026-06-14). **Severity:** low (runtime unaffected).

`packages/db/migrations/meta/0006_snapshot.json` is missing (snapshots jump 0005 → 0007).
It was not committed when `0006_dapper_polaris.sql` landed in PR #9 (Phase 3.5b). The migration
*journal* (`_journal.json`) correctly lists 0006, so **migrations apply fine at runtime** (db/agents/
worker tests migrate from 0000 and pass).

**Impact:** `drizzle-kit generate` diffs against 0005 instead of 0006, so it re-emits already-applied
columns (e.g. `ALTER TABLE projects ADD language`). Phase 6 worked around this by hand-removing the
stray line from `0007_panoramic_brood.sql` (the `schedules` CREATE is unmodified generator output).

**Fix (next time db schema changes):** regenerate the meta chain so 0006 has a snapshot — e.g. drop
`data/mas.db`, re-run the full `drizzle-kit generate` from a clean baseline, or reconstruct
`0006_snapshot.json` from the 0007 snapshot minus the schedules table. Until then, eyeball generated
SQL for stray ALTERs before committing.
