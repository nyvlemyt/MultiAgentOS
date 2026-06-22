# Phase 9 · 0a — filled Doer ① and Checker ② prompts

## Doer ①

You are the **Doer** for **Phase 9 · Étape 0a — Mémoire vivante** of MultiAgentOS. Autonomous, TDD.
You are ALREADY on branch `phase/9a-memory` — stay on it. **Subscription-only**: never import
`@anthropic-ai/sdk`; do not touch `packages/core/src/providers/`. Memory writes to `data/memory/` go
through the Keeper identity only (CLAUDE.md §8).

READ FIRST: `CLAUDE.md` (§5/§7/§8/§11/§12), ROADMAP.md "Phase 9 · Étape 0a",
`docs/learning/2026-06-22-9a-memory-preflight/plan.md` (your spec), and
`docs/knowledge/sonar-recurring-rules.md`. INSPECT these files before coding:
`packages/memory/src/{retriever,registers,context,seed,index}.ts` + their `*.test.ts`,
`packages/agents/src/dispatch.ts` (the `buildMemoryContext` call sites, ~70-85),
`apps/web/lib/memory.ts`, `apps/web/app/(cockpit)/memory/page.tsx`,
`apps/web/app/api/memory/{promote,edit}/route.ts`, `apps/worker/src/index.ts`,
`packages/db/src/{schema.ts,seed.ts}`, `docs/decisions/0003-memory-storage-format.md`.

Build the 7 steps in `plan.md` **in order**, each RED-before-GREEN (Vitest), committing each
(Conventional Commits ≤60 chars, end EVERY message with
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`):

1. Persistent FTS index: `mem_meta` table + `indexedHash()` + `index(docs, hash?)` upsert +
   structural `ensureIndexed(r, corpus)` in `retriever.ts` (no import of `registers` — use a structural
   `{ corpusHash(): string; allDocs(): MemoryDoc[] }` type). Export both from `index.ts`.
2. `corpusHash()` folds `_global/knowledge/*.md` (sorted via `localeCompare`); add `indexPath()` to
   `MemoryStore`.
3. `buildMemoryContext(..., opts?: { indexPath?: string })` uses a persistent `FtsRetriever` +
   `ensureIndexed` when `indexPath` is set; pass `{ indexPath: store.indexPath() }` at the
   `dispatch.ts` call sites.
4. Wikilinks: pure `linkifyIds(text)`, `NewEntry.links?: string[]`, `append()` Related-line fold,
   `serialize()` linkify. Round-trip idempotent.
5. Manual note: `apps/web/app/api/memory/note/route.ts` + a "Nouvelle note" form `<section>` on the
   memory page (mirror the promote form's style + the inline `var(--…)` tokens already used there).
6. Run the bridge: `runSeed()` helper + `seed-cli.ts` + `@mas/memory` `seed` script + root `mem:seed`
   script + idempotent non-fatal `bootstrapMemorySeed()` call in the worker `main()`.
7. `memory_items` = reserved: comment block in `schema.ts` + dated note in ADR 0003. No migration.

HARD RULES: no `@anthropic-ai/sdk`; never export `MAS_MOCK_LLM` globally; `node:` import prefixes;
`readonly` props on React components; no nested ternaries; hoist duplicated string literals; `new Set`
for `.includes` membership; `.sort((a,b)=>a.localeCompare(b))`; no `use*` helper names; wrap JSX text
nodes adjacent to elements in `<span>`; disjoint regex quantifiers (S5852). Apply
`sonar-recurring-rules.md` PROACTIVELY.

WHEN DONE run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
`pnpm --filter @mas/web smoke`; fix until all green. Then run `pnpm mem:seed` and paste its output +
`find data/memory -maxdepth 3`. Write `docs/learning/2026-06-22-9a-memory/build-report.md` (shipped,
files, check tails, `mem:seed` proof, deferrals) and commit. Leave commits on the branch; do **NOT**
push. Return: files created/edited, commit count, pass/fail + numbers of each check.

## Checker ②

You are the **Checker** for **Phase 9 · 0a**. READ-ONLY — do NOT modify source. Branch
`phase/9a-memory`. Verify against `docs/learning/2026-06-22-9a-memory-preflight/plan.md`, ROADMAP
"Phase 9 · Étape 0a", and `CLAUDE.md` (§5/§7/§8/§11/§12). For each of the 7 plan steps + the 5 exit-
criterion points, confirm or fault it (with severity).

RUN the 4 local checks yourself and paste tails + numbers: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`. Independently prove the exit criterion:
- `pnpm mem:seed` then `find data/memory -maxdepth 3` → knowledge populated.
- A retrieval through the **persistent** index path returns a known fact (`"BDR"`, `"Mem0 cloud"`) and
  the index file rebuilds only when `corpusHash()` changes (read/run the tests; spot-check).
- A hand-added note (simulate via the `note` route handler or `keeperStore().append` in a scratch
  test) yields a `[[wikilink]]` in the written `.md`.

GREP invariants: no `@anthropic-ai/sdk` anywhere; no `data/memory/` writes outside the Keeper identity;
§5 gate intact; no global `MAS_MOCK_LLM`. Assess `sonar-recurring-rules.md` adherence (flag likely
smells before Sonar does). Judge whether the exit criterion is met and whether the `memory_items`
"reserved" decision + any deferral is acceptable or a BLOCK.

WRITE the full verdict (markdown + a fenced ```json `ReviewerVerdict {verdict: PASS|NEEDS_WORK|BLOCK,
findings:[{severity,message}]}`) to `docs/learning/2026-06-22-9a-memory/checker-verdict.md` and commit
ONLY that file (`docs(9a): checker verdict`, end with the Co-Authored-By line). Do not push. Prioritize
coverage over filtering.
