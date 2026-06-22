# Phase 9 · Étape 0a — Mémoire vivante — Build report (Doer)

- **Branch**: `phase/9a-memory` (not pushed, no PR — per contract)
- **Date**: 2026-06-22
- **Spec**: `docs/learning/2026-06-22-9a-memory-preflight/plan.md` (7 steps + 5-point exit criterion)
- **Method**: TDD, RED-before-GREEN per step, one commit per step (7 commits).

## What shipped (the 7 plan steps)

1. **Persistent FTS index** — `FtsRetriever` ctor creates a `mem_meta(key,value)` sidecar; `indexedHash()` reads `corpus_hash`; `index(docs, hash?)` upserts the hash inside the same transaction; free function `ensureIndexed(r, corpus)` takes a structural `IndexableCorpus { corpusHash(); allDocs() }` (no `registers` import → acyclic graph), rebuilds only on hash mismatch, returns whether it rebuilt. Exported `ensureIndexed` + `IndexableCorpus` from `index.ts`.
2. **`corpusHash` covers seeded knowledge** — after the register-file loop, `corpusHash()` folds every `_global/knowledge/*.md` (sorted via `localeCompare`). Added `MemoryStore.indexPath()` → `<root>/index.db`. `MemoryStore` now structurally satisfies `IndexableCorpus`.
3. **Persistent index wired into context** — `buildMemoryContext(store, projectId, query, opts?: { indexPath? })`. With `indexPath` it builds a persistent `FtsRetriever` + `ensureIndexed` then queries + closes (via a shared `retrieveGlobalItems` helper); without it the in-memory path is unchanged (back-compat). `dispatch.ts#memoryContextFor` passes `{ indexPath: store.indexPath() }` at both store branches (env-root + repo-root singleton).
4. **Wikilinks** — pure `linkifyIds(text)` wraps bare `(BDR|LRN|BLK|EVAL)-\d{3,}` not already in `[[…]]` (lookbehind `(?<!\[\[)` + lookahead `(?!\]\])`, disjoint quantifier — S5852-safe, idempotent). `NewEntry.links?: string[]` folds into a trailing `Related: …` body line; `serialize()` runs `linkifyIds` over every body. Added `MemoryStore.raw()` for on-disk assertions. parse→serialize is idempotent (no double-wrapping).
5. **Manual note** — `apps/web/app/api/memory/note/route.ts` (POST formData `projectId,kind,title,body,links?` → `keeperStore().append(...)`; validates `kind` via `new Set(...).has()`, defaults `projectId` to `_global`, requires non-empty `title`+`body`, splits `links` on whitespace/comma; 303 redirect to `/memory`). Added a "Nouvelle note" `<section>` form to the memory page mirroring the promote form's `var(--…)` tokens.
6. **Run the bridge** — `runSeed({ memoryRoot, knowledgeDir })` builds a Keeper-identity store internally (callers can't bypass §8) + calls `seedGlobalKnowledge`. New `seed-cli.ts` (walk-up for `pnpm-workspace.yaml`, resolves `data/memory` + `docs/knowledge`, logs counts). Scripts: `@mas/memory` `"seed"` + root `"mem:seed"`. Worker `main()` calls idempotent, non-fatal `bootstrapMemorySeed(repoRoot)` after the API-key refusal + first `getDb()` (try/catch — a seed failure never crashes the worker). Added `@mas/memory` to the worker's deps.
7. **`memory_items` = reserved** — RESERVED comment block above the table in `packages/db/src/schema.ts` (live N3 store is Markdown; this table is demo-seeded only, never read at runtime — ADR 0003 §1). Dated "Decision note (2026-06-22)" appended to `docs/decisions/0003-memory-storage-format.md` recording "reserved, not removed (reversibility, §5)". No migration, no schema change.

## Files created

- `packages/memory/src/seed-cli.ts`
- `apps/web/app/api/memory/note/route.ts`
- `docs/learning/2026-06-22-9a-memory/build-report.md` (this file)

## Files edited

- `packages/memory/src/retriever.ts` + `retriever.test.ts`
- `packages/memory/src/registers.ts` + `registers.test.ts`
- `packages/memory/src/context.ts` + `context.test.ts`
- `packages/memory/src/seed.ts` + `seed.test.ts`
- `packages/memory/src/index.ts`
- `packages/memory/package.json`
- `packages/agents/src/dispatch.ts`
- `apps/web/app/(cockpit)/memory/page.tsx`
- `apps/worker/src/index.ts` + `apps/worker/package.json`
- `packages/db/src/schema.ts`
- `docs/decisions/0003-memory-storage-format.md`
- `package.json`, `pnpm-lock.yaml`

## Commits (7, all on `phase/9a-memory`)

```
0d5e694 docs(memory): mark memory_items reserved (ADR 0003)
fdaf5dc feat(memory): run the knowledge→memory bridge
e7e7b48 feat(web): hand-add memory notes via Keeper store
243a920 feat(memory): Obsidian wikilinks for register ids
f249630 feat(memory): wire persistent index into buildMemoryContext
e081262 feat(memory): corpusHash folds seeded knowledge + indexPath
ed7b50b feat(memory): persistent FTS index + ensureIndexed
```

## DoD — the 4 local checks (all GREEN)

> Prerequisite: `pnpm --filter @mas/skills build-library-index` + `pnpm --filter @mas/agents build-library-index` were run first — these generated, gitignored indices are needed by the agents arsenal test (it fails on a fresh checkout without them; not a regression from this work).

| Check | Result |
|-------|--------|
| `pnpm -r test` | **PASS** — 81 test files, 452 tests passed (core 100 · db 15 · skills 28 · memory 58 · agents 100 · worker 8 · web 143) |
| `pnpm lint` | **PASS** — `lint-no-sdk-payg.sh` PASS (§11/§11.bis) + all `tsc --noEmit` clean |
| `pnpm build` | **PASS** — `✓ Compiled successfully`, `/api/memory/note` route built, static pages 8/8 |
| `pnpm --filter @mas/web smoke` | **PASS** — 32 passed (Playwright/chromium) |

Memory package went 41 → 58 tests (+17 new: 5 persistent-index, 2 corpusHash/indexPath, 2 context persistent-path, 7 wikilink, 1 runSeed).

## Exit criterion 0a (proven)

1. **`pnpm mem:seed` populates `data/memory/_global/knowledge/`** — first run `imported=21 skipped=0`; re-run `imported=0 skipped=21` (idempotent). `find data/memory -maxdepth 3` shows 21 `*.md` knowledge files + `data/memory/index.db`.
2. **Retrieval of a build-time fact through the PERSISTENT index path** — against the real seeded store: `Mem0 cloud` → 5 hits, top source `docs/knowledge/memory-patterns.md`; `BDR` → 5 hits; `data/memory/index.db` exists (hard gate Phase 4).
3. **Index rebuilt only on hash change** — `ensureIndexed` on an unchanged corpus returns `false` (no rebuild); stamped `indexedHash()` equals `corpusHash()`. Covered by `retriever.test.ts` (skip-vs-rebuild) + `context.test.ts` (reuse across calls).
4. **Hand-added note appears with a `[[wikilink]]`** — `note` route → `keeperStore().append` linkifies ids; `registers.test.ts` proves a body mention + `links[]` footer both serialize to `[[…]]`; `data/memory/` opens as an Obsidian graph vault.
5. **`memory_items` fate decided** — RESERVED (documented in schema + ADR 0003, no migration).

## Notes / deferrals

- `data/memory/` is gitignored, so the seeded knowledge files + `index.db` are **not** committed — they are reproduced by `pnpm mem:seed` / the worker bootstrap. This is by design (CLAUDE.md §3 / ADR 0003: the index is derived & rebuildable).
- Generated library indices (`packages/{skills,agents}/library/index.json`) are gitignored build artifacts; regenerate with the `build-library-index` scripts before running the full suite on a clean checkout.
- The worker package has no `lint` script (pre-existing); it was typechecked directly with `tsc --noEmit` (exit 0). `pnpm lint` reports "7 of 8 workspace projects" for the same reason.
- No SonarCloud run here (no push / no PR per contract). Rules applied proactively: `new Set(...).has()` membership (note route + promote parity), `localeCompare` sorts, disjoint regex quantifier, `node:` import prefixes, `readonly` props untouched on the page (form section uses existing markup), no nested ternaries, no `use*` helper names. Sonar gate to be run by the Checker / on PR.
- Scope strictly 0a. **STOP** here — awaiting GO before 0b.
