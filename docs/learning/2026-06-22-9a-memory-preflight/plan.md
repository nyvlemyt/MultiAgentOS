# Phase 9 · Étape 0a — Mémoire vivante — Plan (preflight)

> Build-time knowledge consulted (CLAUDE.md §12/§13): `docs/knowledge/memory-patterns.md`,
> `agent-patterns.md`, `prompting-anthropic.md`, `production-patterns.md`, `sonar-recurring-rules.md`,
> ADR `0003-memory-storage-format.md`. Scope = 0a only (ROADMAP Phase 9 · Étape 0a). Stop at exit
> criterion 0a, ask GO before 0b.

## Goal

Turn the *designed-but-dormant* memory subsystem into a **living second brain**: the build-time
knowledge bridge runs, the search index persists, the Memory Keeper emits Obsidian `[[wikilinks]]`,
a human can add notes by hand, and the orphaned `memory_items` table's fate is decided.

## Findings (verified in code, 2026-06-22)

- `packages/memory/src/seed.ts` — `seedGlobalKnowledge(store, knowledgeDir)` + a passing **BRIDGE GATE**
  test exist, but the function is **never called** at runtime → `data/memory/` stays empty.
- `packages/memory/src/retriever.ts` — `FtsRetriever` accepts `indexPath` but `context.ts` always
  builds it **in-memory** and re-indexes on **every** query. No staleness check.
- `packages/memory/src/registers.ts` — `corpusHash()` folds register `.md` files but **NOT**
  `_global/knowledge/*.md`; so after seeding, the hash wouldn't change → a persistent index would go
  stale silently. `serialize()` writes `## BDR-001 — Title` with **zero `[[wikilink]]`** → empty
  Obsidian graph.
- `apps/web/app/(cockpit)/memory/` — candidate triage only; **no manual write** surface.
- `memory_items` (`packages/db/src/schema.ts`) — written by the demo seed (`db/src/seed.ts`), **never
  read** at runtime (live store = Markdown). ADR 0003 §1.4 says it "stays". → document as **reserved**
  (no destructive migration; reversibility, CLAUDE.md §5).

## Build steps (TDD, RED before GREEN, commit each)

1. **Persistent FTS index** (`retriever.ts`). Add a `mem_meta(key, value)` table in the ctor; add
   `indexedHash(): string | null`; extend `index(docs, hash?)` to upsert `corpus_hash` inside the same
   transaction. Add a structural helper `ensureIndexed(r, corpus)` where
   `corpus: { corpusHash(): string; allDocs(): MemoryDoc[] }` (structural → no circular import on
   `registers`). It re-indexes only when `r.indexedHash() !== corpus.corpusHash()`; returns whether it
   rebuilt. Tests: file index persists across reopen; query works without re-index; `ensureIndexed`
   skips when hash unchanged and rebuilds when it changes.

2. **`corpusHash` covers seeded knowledge** (`registers.ts`). After the register loop, fold every
   `_global/knowledge/*.md` (sorted, `localeCompare`) into the hash. Add `indexPath(): string`
   returning `join(root, 'index.db')`. Test: seeding knowledge changes `corpusHash()`.

3. **Wire persistent index into context** (`context.ts`). `buildMemoryContext(store, projectId, query,
   opts?)` gains `opts?: { indexPath?: string }`. With `indexPath` → `new FtsRetriever({ indexPath })`
   + `ensureIndexed(r, store)` then query + close. Without → current in-memory path (back-compat).
   In `packages/agents/src/dispatch.ts`, pass `{ indexPath: store.indexPath() }` at the
   `buildMemoryContext` call sites. Test: two calls with the same `indexPath` reuse the index (second
   call does not rebuild — assert via `ensureIndexed` return / spy).

4. **Wikilinks** (`registers.ts`). Pure helper `linkifyIds(text)` wraps bare register IDs
   `(BDR|LRN|BLK|EVAL)-\d{3,}` not already inside `[[…]]` (lookbehind `(?<!\[\[)` + lookahead
   `(?!\]\])`, disjoint quantifiers — S5852). `NewEntry` gains optional `links?: string[]`; `append()`
   folds them into the body as a trailing `Related: <ids>` line; `serialize()` runs `linkifyIds` over
   the body. Tests: an ID mention in a body becomes `[[ID]]`; `links` produce a `Related: [[…]]`
   footer; parse→serialize is **idempotent** (no double-wrapping).

5. **Manual note** — route + UI. `apps/web/app/api/memory/note/route.ts` (POST formData
   `projectId,kind,title,body,links?`) → `keeperStore().append(...)`; validate `kind ∈ KINDS`,
   `projectId` default `_global`, require `title`+`body`; redirect 303 `/memory`. Add a "Nouvelle note"
   `<section>` form on the memory page (kind select, projectId, title, body textarea, optional links).
   Keeper write-lock is enforced by `append()`/`keeperStore()`.

6. **Run the bridge.** `runSeed({memoryRoot, knowledgeDir})` helper in `seed.ts` (builds the
   Keeper-identity store + calls `seedGlobalKnowledge`). CLI `packages/memory/src/seed-cli.ts` (walk-up
   repo root → `data/memory` + `docs/knowledge`, log imported/skipped). `packages/memory/package.json`
   script `"seed": "tsx src/seed-cli.ts"`; root `package.json` `"mem:seed": "pnpm --filter @mas/memory
   seed"`. Worker bootstrap: in `apps/worker/src/index.ts` `main()` (after the API-key refusal + first
   `getDb()`), call a detached, idempotent, non-fatal `bootstrapMemorySeed()` that logs the summary.

7. **`memory_items` fate = reserved.** Comment block above `memoryItems` in `schema.ts` (live N3 store
   is Markdown; this table is a reserved structured mirror, demo-seeded only, not read at runtime —
   ADR 0003 §1.4). Add a dated decision note to `docs/decisions/0003-memory-storage-format.md`. No
   migration.

## Invariants (must hold)

- §11 billing: no `@anthropic-ai/sdk`; seed/index are pure file I/O, zero LLM. `pnpm lint` guard green.
- §8: writes to `data/memory/` only via `keeperStore()` (Keeper identity). The note route uses it.
- §5: no destructive op (no migration drop of `memory_items`). `data/memory/` is gitignored.
- No global `MAS_MOCK_LLM`. Time logic via explicit `now` (n/a here — no new time logic).

## Definition of Done (5 checks + Sonar)

`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` ·
`scripts/sonar-pr-issues.sh <pr>` **exit 0** AND gate OK.

## Exit criterion 0a (gate, then STOP + ask GO before 0b)

1. `pnpm mem:seed` populates `data/memory/_global/knowledge/` from `docs/knowledge/`.
2. A retrieval query on a known build-time fact (e.g. `"BDR"`, `"Mem0 cloud"`) returns it through the
   **persistent** index path (hard gate Phase 4).
3. The index file is rebuilt only when `corpusHash()` changes.
4. A hand-added note appears in `data/memory/` with at least one `[[wikilink]]` (Obsidian edge).
5. `memory_items` fate decided (reserved, documented).
