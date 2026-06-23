# Intake RE-AUDIT — QMD (tobi/qmd) (2026-06-22)

> Re-audit of `docs/intake/2026-06-08-qmd.md`. The 2026-06-08 dossier decided
> **`backlog_next` (Phase 4.x)** with the re-audit condition: *"dès qu'un besoin
> de rappel sémantique/flou apparaît (requêtes non exactes)."* **That condition is
> now met** — Phase 9 · 0a renforcée makes the retrieval layer the unified semantic
> search engine over knowledge + memory + arsenal. The decision flips to
> **`implement_now`**.

- **Type** : MCP / retrieval tool (couche N1-2 rappel) — unchanged.
- **Source** : https://github.com/tobi/qmd ; npm `@tobilu/qmd`.
- **Guardrails (step 0)** : local-first ✓ (100 % local, no API key → passes §11) ;
  Memory Keeper sole writer ✓ (QMD only *reads*; the derived index never writes the
  Markdown truth, §8) ; risky actions gated — install + ~4.4 GB model download +
  background daemon = §5 external/irreversible action → **owner-authorized**
  explicitly this session ("Tu peux telecharger et faire ce que tu veux") + a
  confirmation question answered "Approve". No new framework in `apps/`/`packages`
  runtime: QMD is an external CLI/MCP behind the `MemoryRetriever` seam, not an
  imported dependency in runtime code.

## Identity & verification (Sanitize — independent re-check, intake §4.bis)
- `npm view @tobilu/qmd` → **version 2.5.3**, `repository.url = github.com/tobi/qmd`,
  `maintainers = tobilu <tobi@lutke.com>` (Tobias Lütke). Matches the URL cited in
  our own `docs/intake/2026-06-08-qmd.md:4` and `docs/knowledge/memory-patterns.md:162`.
  → **not an agent-guessed name** (the prior session's `npm view qmd = 0.0.0` was the
  *unscoped* package; the real one is the **scoped** `@tobilu/qmd`).
- **CORRECTION vs prior dossier**: models total **~4.4 GB** on disk (not ~2 GB):
  `embeddinggemma-300M-Q8_0` 333 MB + `qwen3-reranker-0.6b-q8_0` 639 MB +
  `qmd-query-expansion-1.7B-q4_k_m` 2.5 GB → `~/.cache/qmd/models/`.
- **Live smoke verified this session** (`/tmp/qmdtest`): `qmd query --json` on a pure
  paraphrase ("how do I stop losing my train of thought across work periods", zero
  keyword overlap) ranked the memory doc **0.93** over an unrelated doc **0.50** →
  semantic recall proven. Output shape: `[{docid,score,file,line,title,snippet}]`,
  `file = qmd://<collection>/<path>`. Flags confirmed: `-c <collection>`, `-n <limit>`,
  `--json`, `search` (BM25, no models), `vsearch` (vectors), `query` (hybrid+rerank).

## Fit (file/phase-linked)
- Phase **9 · 0a renforcée**. Surface: memory + context-manager + skill-router candidates.
- Backs the `MemoryRetriever` seam (ADR 0003) as `QmdRetriever`; **`FtsRetriever`
  stays as runtime fallback** (`UnifiedRetriever`). No duplicate — it *replaces* the
  custom FTS-only recall with hybrid+rerank while keeping FTS for resilience.
- Unifies three corpora under one search: `mas-knowledge`, `mas-memory`, `mas-arsenal`.

## Three costs
- **Install** : `npm i -g @tobilu/qmd` (done) + ~4.4 GB models on first `embed`/`query`
  (done) + `qmd init` project-local `.qmd/` index + 3 collections + `qmd embed`. Effort
  medium, build-time tokens ~0.
- **Maintenance** : single-maintainer repo (risk noted, unchanged). Re-index via
  `qmd update` / `pnpm arsenal:build && qmd embed`. Models pinned by QMD's own version.
- **Removal** : **easy** — QMD lives behind `MemoryRetriever`; set the factory to FTS
  (one config/env flag `MAS_RETRIEVAL_BACKEND=fts`), `rm -rf .qmd ~/.cache/qmd`. The
  seam is the reversibility guarantee (ADR 0003 §Rationale).

## Score (vs 2026-06-08)
project_fit **5** (was 5) · token_efficiency **5** · safety **4** (local; 4.4 GB
supply-chain via HF, owner-authorized) · implementation_effort **3** (4.4 GB + CLI
wiring) · evidence_maturity **3** (young, single-maintainer) · user_value **5** (was 4
— now the unified brain, Jarvis socle) · phase_compatibility **5** (was 4 — now *the*
Phase 9 · 0a deliverable).

## KILL check
**No blocking veto.** 100 % local + no API key → passes §11 (no PAYG). MCP = localhost
process (no external host at query time, §5 ok). Model download from HF =
supply-chain — mitigated by: pinned QMD version (2.5.3), models cached under
`~/.cache/qmd/`, owner authorization for the one-time download. FTS fallback means a
QMD outage/abandonment never breaks retrieval.

## Decision
**`implement_now`** (Phase 9 · 0a renforcée). Re-audit condition of the prior dossier
(semantic/fuzzy recall need) is met; supply-chain identity verified; reversibility
guaranteed by the `MemoryRetriever` seam + FTS fallback. Supersedes the `backlog_next`
of `docs/intake/2026-06-08-qmd.md`. See **ADR 0003 amendment (2026-06-22)**.

## Appropriation (MAS version)
- `QmdRetriever implements MemoryRetriever` — shells `qmd <mode> <q> --json` via
  `execFileSync` (sync, keeps the interface unchanged), maps `qmd://coll/path` → scope.
- `UnifiedRetriever` — QMD primary, FTS fallback on any QMD error/absence (per-query).
- **Arsenal indexed by L1 summary + frontmatter only** (not bodies): a derived stub
  folder `data/arsenal-index/**` (gitignored) generated by `buildArsenalStubs`, which
  QMD's `mas-arsenal` collection indexes. Cheaper + keeps cold bodies out of the index.
- On-demand retrieval only (no boot auto-injection), ≤5 items, summaries first (§12).

## Integration plan (binary DoD)
- Target phase **9 · 0a renforcée**; files: `packages/memory/src/{retriever,arsenal,context,index,eval}.ts`,
  `scripts/qmd-setup.sh`, `.mcp.json`, `docs/decisions/0003-*.md` amendment, `.gitignore`.
- Token budget: standard. Human validation: install already owner-authorized.
- **DoD** = the 6 Phase-9 0a exit criteria + 5 checks green + Sonar exit 0.
- **Do NOT**: write the Markdown truth from QMD; auto-inject at boot; index full arsenal
  bodies; make `@anthropic-ai/sdk` appear anywhere; commit `.qmd/` or `data/`.

## Re-audit
Re-check if `tobi/qmd` is >6 months without a commit, OR if query latency/quality
regresses on the CI eval harness, OR when a project memory corpus dwarfs the arsenal
(rebalance collection weights).
