# Phase 9 · Étape 0a — Mémoire vivante — Checker verdict

- **Branch**: `phase/9a-memory` (HEAD `5b3066b`, 8 commits after preflight `57c6044`)
- **Date**: 2026-06-22
- **Method**: independent re-verification against `plan.md` (7 steps + 5-point exit), `build-prompt.md` (Checker ② contract), ROADMAP "Phase 9 · Étape 0a", CLAUDE.md §5/§7/§8/§11/§12, `sonar-recurring-rules.md`. Read-only on source; ran all 4 gate checks + a throwaway scratch script (deleted, tree clean).
- **Verdict**: **PASS**

## The 4 local checks (run by the Checker)

| Check | Result | Numbers |
|-------|--------|---------|
| `pnpm -r test` | **PASS** (exit 0) | 81 test files, 452 tests passed (core 100 · db 15 · skills 28 · memory **58** · agents 100 · worker 8 · web 143). Memory verified in isolation: retriever 11 · context 5 · registers 19 · seed 5 (+17 vs preflight). |
| `pnpm lint` | **PASS** (exit 0) | `lint-no-sdk-payg.sh` → "PASS: no forbidden provider SDK imports (§11 + §11.bis)"; `tsc --noEmit` clean on all 7 lint-scoped projects (worker has no lint script — pre-existing). |
| `pnpm build` | **PASS** (exit 0) | `✓ Compiled successfully`; `/api/memory/note` emitted (`.next/server/app/api/memory/note`), `/memory` route built, all routes generated. |
| `pnpm --filter @mas/web smoke` | **PASS** (exit 0) | 32 passed (Playwright/chromium), 38.5s. |

> Prereq honored: `pnpm --filter @mas/{skills,agents} build-library-index` regenerated the gitignored library indices (needed by the arsenal test on a clean checkout — not a regression).

## Exit criterion 0a — independently proven (not trusted)

1. **`pnpm mem:seed` populates `_global/knowledge/`** — PASS. Deleted local `data/memory` then re-ran: `imported=21 skipped=0`; `find data/memory -maxdepth 3` shows 21 `*.md` under `_global/knowledge/`. Re-run → `imported=0 skipped=21` (idempotent). The `.md.md` double-extension (source path `+ .md`) is cosmetic, not a fault.
2. **Retrieval through the PERSISTENT index** — PASS. Scratch script (`packages/memory/src/index` → real `docs/knowledge` seed → `new FtsRetriever({ indexPath })` + `ensureIndexed`): `index.db` created; `Mem0 cloud` → 5 hits (top source `docs/knowledge/memory-patterns.md`); `BDR` → 5 hits. Hard gate Phase 4 met.
3. **Index rebuilds only on `corpusHash()` change** — PASS. Scratch: first `ensureIndexed` → `rebuilt=true`; reopen on unchanged corpus → `rebuilt=false` and query still returns 5 hits; after `append(...)` → `rebuilt=true`. `corpusHash()` correctly folds `_global/knowledge/*.md` (sorted via `localeCompare`) — so a seed invalidates the index (the exact preflight bug, fixed). Backed by `retriever.test.ts` skip-vs-rebuild + `corpusHash` knowledge-fold test.
4. **Hand-added note → `[[wikilink]]`** — PASS. Scratch `append({ body: 'builds on BDR-001', links: ['LRN-002'] })` → on-disk `.md` contains `[[BDR-001]]` (body linkify) and `[[LRN-002]]` (Related footer), no `[[[[` double-wrap. `linkifyIds` lookbehind/lookahead makes it idempotent; the note route reaches this via `keeperStore().append`. Confirmed by `registers.test.ts` (body mention + links footer + round-trip idempotency).
5. **`memory_items` fate = reserved** — PASS. RESERVED comment block above the table in `schema.ts` + dated decision note in ADR 0003. No migration, no schema change, no DROP. Acceptable (reversibility, §5).

## The 7 plan steps

| # | Step | Verdict | Notes |
|---|------|---------|-------|
| 1 | Persistent FTS index (`mem_meta`, `indexedHash`, `index(docs,hash)` upsert, structural `ensureIndexed`) | **PASS** | `ensureIndexed` takes structural `IndexableCorpus` — no `registers` import → acyclic. Hash upserted inside the same transaction as the corpus replace. Both exported from `index.ts`. |
| 2 | `corpusHash` folds seeded knowledge + `indexPath()` | **PASS** | Knowledge files folded (sorted `localeCompare`); `indexPath()` → `<root>/index.db`; `MemoryStore` structurally satisfies `IndexableCorpus`. |
| 3 | Wire persistent index into `buildMemoryContext` + dispatch | **PASS** | `opts?.indexPath` → persistent retriever + `ensureIndexed` + `close()` in a `finally`; without it the in-memory path is byte-for-byte unchanged (back-compat). `dispatch.ts#memoryContextFor` passes `{ indexPath: store.indexPath() }` at both branches (env-root + repo-root singleton); the only dispatch change is this 7-line wiring (§5 gate untouched). |
| 4 | Wikilinks (`linkifyIds`, `links?`, Related fold, serialize linkify, idempotent) | **PASS** | Regex `(?<!\[\[)(BDR\|LRN\|BLK\|EVAL)-\d{3,}(?!\]\])` — disjoint quantifier (S5852-safe), `$&` replacement. Idempotent verified. |
| 5 | Manual note route + UI | **PASS** | `note/route.ts` validates `kind` via `new Set(...).has()`, defaults `projectId='_global'`, requires non-empty title+body, splits `links` on `[\s,]+`, 303 → `/memory`. Form `<section>` mirrors the promote form's inline tokens (as instructed). See L1 finding on the `as string` cast. |
| 6 | Run the bridge (`runSeed`, `seed-cli`, scripts, worker bootstrap) | **PASS** | `runSeed` builds the Keeper-identity store internally (callers can't bypass §8). `seed-cli` walk-up to `pnpm-workspace.yaml`, honors `MAS_MEMORY_ROOT`. `@mas/memory` `seed` + root `mem:seed` scripts. Worker `bootstrapMemorySeed(repoRoot)` is try/catch (non-fatal) and idempotent, called after the API-key refusal + first `getDb()`; `@mas/memory` added to worker deps. |
| 7 | `memory_items` reserved | **PASS** | See exit point 5. |

## Invariants (grepped)

- **§11 no `@anthropic-ai/sdk`** anywhere in `apps/`+`packages/` (excl. `api-fallback`): **NONE found → PASS**. Lint guard green.
- **§8 Keeper-only writes to `data/memory/`**: **PASS**. Only write paths are `MemoryStore.append` / `writeKnowledge`, both gated by `assertWriter()`. Note route + promote route use `keeperStore()`; `runSeed`/worker build the Keeper store internally. `intake.ts` writes to a dossier path (docs/intake), not `data/memory`.
- **§5 risk gate intact, no destructive op**: **PASS**. No migration/`.sql`/drizzle files touched; no `DROP TABLE`/`.drop()`/`rm -rf`/`reset --hard` in the diff; `config/permissions.json` untouched. `MemoryStore.file()` rejects `/`, `\`, `..` in `projectId` (path-traversal guard) — good, since `projectId` now comes from a UI form.
- **No global `MAS_MOCK_LLM`**: **PASS**. Only set/deleted inside test files. `pnpm -r test` is the canonical invocation.

## Sonar adherence (pre-push assessment — no PR yet, so `sonar-pr-issues.sh` not runnable here)

- Disjoint regex quantifiers (S5852): linkify + parse both annotated and disjoint — **clean**.
- `new Set(...).has()` membership in the note route — **clean** (parity with promote).
- `.sort((a,b)=>a.localeCompare(b))` everywhere a sort was added — **clean**.
- JSX text nodes (S6772): the new form's text (`Nouvelle note`, `écrite par le Memory Keeper`, `Ajouter la note`) are each the **sole child** of their element — S6772 fires only on text *sibling-adjacent to a JSX element*, so **no smell**.
- Nested ternary / `void` / double import / redundant `as`: none introduced in code.
- **WATCH (low)**: `var(--bg-hover)` and sibling inline-token literals went 9 → 14 occurrences in `memory/page.tsx` (S1192 duplicated-string-literal). This extends a pre-existing pattern (the file already had 9; prior Sonar gate was green), and the build prompt directed mirroring the promote form's inline tokens. Likely accepted by the existing baseline, but the Checker cannot run Sonar without a PR — re-confirm `scripts/sonar-pr-issues.sh <pr>` exits 0 (and gate OK) on push before declaring 0a done (CLAUDE.md §7, "5th check").

## Findings

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "low", "message": "memory/page.tsx repeats inline style-token string literals (var(--bg-hover) etc.) 9→14 times; S1192 may fire. Extends an existing pattern (prompt-directed) and prior Sonar was green, but confirm scripts/sonar-pr-issues.sh exits 0 AND gate OK on push — the 5th verification check cannot be run pre-PR." },
    { "severity": "info", "message": "note/route.ts reads FormData via `(form.get(name) as string) ?? ''` — a blind cast of untrusted input (CLAUDE.md §7 prefers narrowing). It mirrors the existing promote route exactly (string fields with .trim() fallback, validated downstream), so it is consistent parity, not a regression; consider a shared zod/narrowing helper for both routes in a later cleanup." },
    { "severity": "info", "message": "Seeded knowledge files get a `.md.md` double extension (source path `docs/knowledge/x.md` + the writer's `.md` suffix). Cosmetic only — provenance is carried in the `<!-- source: ... -->` header and retrieval works; no functional impact." },
    { "severity": "info", "message": "context.test.ts 'reuses the persistent index across calls' asserts the corpus hash is unchanged + a query still hits, but (by its own comment) cannot spy on a fresh retriever to prove no-rebuild. The no-rebuild guarantee IS proven directly by retriever.test.ts 'ensureIndexed skips when hash unchanged' and by the Checker scratch run (rebuilt(second)=false). Coverage is adequate; noted for completeness." },
    { "severity": "info", "message": "No smoke test exercises the new 'Nouvelle note' form end-to-end (not required by the prompt). The form renders, the route builds, and exit criterion 4 is proven via unit tests + the Checker scratch script. A future smoke spec would harden the human-write path." }
  ]
}
```

## Severity counts

- blocker: 0
- high: 0
- medium: 0
- low: 1
- info: 4

## Bottom line

All 7 plan steps and all 5 exit-criterion points are satisfied and independently proven. The 4 gate checks are green. Invariants (§5/§8/§11, no global mock) hold. Only one low + four info findings, none blocking. **PASS** — with the standing requirement that the 5th check (`scripts/sonar-pr-issues.sh <pr>` exit 0 AND `qualitygates/project_status == OK`) be run and clean on push before 0a is formally closed, since it cannot be run pre-PR. STOP at 0a; await GO before 0b.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
