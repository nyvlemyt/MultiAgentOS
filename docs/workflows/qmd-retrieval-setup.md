# Recherche (QMD, optionnel)

Operational runbook for the retrieval engine that backs MultiAgentOS memory,
knowledge, and arsenal search. Phase 9 · 0a renforcée. See ADR
[0003](../decisions/0003-memory-storage-format.md) for the design rationale.

## TL;DR

```bash
pnpm qmd:setup     # provision the local semantic index (~4.4 GB, Node ≥ 22)
pnpm mem:doctor    # check which backend is live (qmd vs fts)
```

If you skip this, **search still works** — it degrades to FTS (BM25 keyword
search) over the same Markdown. The worker logs the fallback at boot; it is never
silent.

## What QMD is, and why it is NOT an npm dependency

[QMD](https://github.com/tobi/qmd) (`@tobilu/qmd`) is a 100 %-local search engine
over Markdown: BM25 + vector embeddings + a rerank pass. It only **reads** the
Markdown truth; the `.qmd/` index it builds is derived, rebuildable, and
gitignored.

It is declared as an **external runtime dependency**, *not* a workspace npm
dependency, on purpose: the first `qmd embed` pulls **~4.4 GB** of GGUF models
from HuggingFace into `~/.cache/qmd/models/` (embeddinggemma-300M + a
qwen3-reranker + a query-expansion model). Vendoring that into `pnpm install`
would make every clone pay 4.4 GB for an optional capability. So the install is a
separate, explicit, opt-in command.

## Requirements

- **Node ≥ 22** (QMD's native bindings).
- **~4.4 GB** free disk for the models (one-time, cached globally).
- The CLI pinned to `@tobilu/qmd@2.5.3` (supply-chain, CLAUDE.md §5). `pnpm
  qmd:setup` enforces the pin.

## Install

```bash
pnpm qmd:setup
```

This runs [`scripts/qmd-setup.sh`](../../scripts/qmd-setup.sh), which is
idempotent (safe to re-run):

1. installs/pins the `qmd` CLI,
2. builds the arsenal L1-summary stubs (`pnpm arsenal:build`) if missing,
3. registers four collections — `mas-knowledge` (`docs/knowledge`),
   `mas-workflows` (`docs/workflows`), `mas-memory` (`data/memory`),
   `mas-arsenal` (`data/arsenal-index`),
4. runs `qmd update` + `qmd embed` (first run downloads the models).

## Fallback contract (FTS) — never silent

| Situation | Backend | Behaviour |
|-----------|---------|-----------|
| `.qmd` index + `qmd` binary present | **QMD** | semantic search (BM25 + vec + rerank) |
| binary present, no `.qmd` index | FTS | worker warns: run `pnpm qmd:setup` |
| binary absent | FTS | worker warns: run `pnpm qmd:setup` |
| `MAS_RETRIEVAL_BACKEND=fts` | FTS | forced (CI default for agent tests) |

Retrieval **never crashes** on a missing QMD — `createRetriever` falls back to
the FTS index over the same corpus. At worker boot a `[worker:retrieval]` line
states the active backend; when QMD is absent it tells you to run `pnpm
qmd:setup`. Run the diagnostic any time:

```bash
pnpm mem:doctor
```

## Force FTS (CI / offline)

```bash
MAS_RETRIEVAL_BACKEND=fts pnpm <anything>
```

Agent tests pin this in `packages/agents/vitest.config.ts` so CI never reaches
for the (absent, slow) QMD index.

## Billing isolation (CLAUDE.md §11)

QMD runs entirely locally: no API key, no network at query time (only the
one-time model download). It does **not** touch the Anthropic subscription quota
and does **not** import any provider SDK — it is a shell binary behind the
`MemoryRetriever` seam. Compliant with the subscription-only mandate.

## Remove

```bash
rm -rf .qmd ~/.cache/qmd
export MAS_RETRIEVAL_BACKEND=fts   # optional: silence the boot warning
```
