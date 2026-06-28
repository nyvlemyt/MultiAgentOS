#!/usr/bin/env bash
#
# qmd-setup.sh — provision the local QMD index that backs MultiAgentOS retrieval.
#
# Phase 9 · 0a renforcée (ADR 0003 amendment). QMD (github.com/tobi/qmd) is a
# 100%-local BM25 + vector + rerank engine. It only READS the Markdown truth; the
# `.qmd/` index it builds is DERIVED & rebuildable (principle 1) and gitignored.
# No API key, no network at query time → passes billing isolation (CLAUDE.md §11).
#
# Supply-chain (CLAUDE.md §5): pin the CLI to @tobilu/qmd@2.5.3. First embed pulls
# ~4.4 GB of GGUF models from HuggingFace into ~/.cache/qmd/models/
# (embeddinggemma-300M 333 MB + qwen3-reranker-0.6b 639 MB +
# qmd-query-expansion-1.7B 2.5 GB). Requires Node >= 22. Owner-authorized this
# session. To remove: `rm -rf .qmd ~/.cache/qmd` and set MAS_RETRIEVAL_BACKEND=fts.
#
# Multi-path caveat & decision: `qmd collection add` takes exactly ONE path per
# collection. The "knowledge" family spans two sibling folders (docs/knowledge/
# and docs/workflows/). Simplest non-lossy option, chosen here: TWO collections,
# mas-knowledge + mas-workflows — both real Markdown, no extra build step, both
# queried as knowledge (retriever QMD_MEMORY_COLLECTIONS). The alternative
# (generating workflow stubs like the arsenal) was rejected as more machinery for
# no gain. The arsenal is different: its bodies are cold, so we index L1-summary
# stubs (data/arsenal-index/, built by `pnpm arsenal:build`), not the full files.
#
# Idempotent: safe to re-run. `qmd init` only writes config when absent; each
# collection is added only if missing; `qmd embed` refreshes vectors incrementally.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v qmd >/dev/null 2>&1; then
  echo "[qmd-setup] ERROR: qmd not on PATH. Install: npm i -g @tobilu/qmd@2.5.3 (Node >= 22)." >&2
  exit 1
fi

echo "[qmd-setup] qmd $(qmd --version 2>/dev/null || echo '?')  node $(node --version)"

# 1. Project-local index (.qmd/index.yaml) so the index lives in the repo, not the
#    global ~/.cache. `qmd init` is a no-op when the local config already exists.
if [[ -f "$ROOT/.qmd/index.yaml" ]] || [[ -f "$ROOT/.qmd/index.yml" ]]; then
  echo "[qmd-setup] local .qmd index already present — skipping init"
else
  echo "[qmd-setup] qmd init (creating project-local .qmd/)"
  qmd init
fi

# 2. The arsenal collection indexes derived L1 stubs — build them if absent so a
#    bare `bash scripts/qmd-setup.sh` is self-sufficient (the recommended order
#    still runs `pnpm arsenal:build` first; this is the safety net).
if ! ls "$ROOT"/data/arsenal-index/**/*.md >/dev/null 2>&1; then
  echo "[qmd-setup] data/arsenal-index/ empty — running pnpm arsenal:build"
  pnpm arsenal:build
fi

# 3. Register collections (one path each — see multi-path note above). Idempotent.
add_collection() {
  local name="$1" path="$2"
  if [[ ! -d "$path" ]]; then
    echo "[qmd-setup] WARN: $path missing — skipping collection $name" >&2
    return 0
  fi
  if qmd collection list 2>/dev/null | grep -qF "$name"; then
    echo "[qmd-setup] collection $name already registered — skipping"
  else
    echo "[qmd-setup] qmd collection add $path --name $name"
    qmd collection add "$path" --name "$name" --mask "**/*.md"
  fi
}

add_collection "mas-knowledge" "$ROOT/docs/knowledge"
add_collection "mas-workflows" "$ROOT/docs/workflows"
add_collection "mas-memory"    "$ROOT/data/memory"
add_collection "mas-arsenal"   "$ROOT/data/arsenal-index"
add_collection "mas-resources" "$ROOT/docs/resources"

# 4. Re-index + embed. `update` refreshes the FTS/document layer from disk; `embed`
#    (re)builds the vector layer used by `qmd query`/`vsearch`. Both incremental.
echo "[qmd-setup] qmd update (re-index documents)"
qmd update
echo "[qmd-setup] qmd embed (generate vectors — first run downloads ~4.4 GB models)"
qmd embed

echo "[qmd-setup] done. Index health:"
qmd status
