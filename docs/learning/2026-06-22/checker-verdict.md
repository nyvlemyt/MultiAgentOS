# Checker Verdict — Phase 9 · 0a renforcée (QMD)

- **Date**: 2026-06-23
- **Branch under review**: `phase/9a2-qmd-arsenal`
- **PR**: #36 — DRAFT, base `phase/9a-memory`, state OPEN
- **HEAD sha**: `0620830e42eea7048d3898fd1c1dd618e4942abd` (matches expected `0620830`)
- **Working tree**: clean (`git status --porcelain` empty)
- **Env**: Node v22.16.0, pnpm 9.12.0, `qmd` binary present on PATH (`~/.nvm/.../v22.16.0/bin/qmd`)

This is an independent re-run. Every result below was produced by a command I executed this session.

## The 5 verification checks (CLAUDE.md §7)

| # | Check | Command | Result | Evidence |
|---|-------|---------|--------|----------|
| 1 | Tests | `pnpm -r test` | **PASS** | exit 0. Per-package totals: core 14 files/100, db 6/15, skills 3/28, memory 10/87, agents 22/100, web 26/143, worker 2/8. Every package green. |
| 2 | Lint + anti-PAYG guard | `pnpm lint` | **PASS** | "PASS: no forbidden provider SDK imports (§11 + §11.bis)"; `tsc --noEmit` clean across memory/skills/web. exit 0. |
| 3 | Build | `pnpm build` | **PASS** | exit 0; Next.js build emitted full route table, "Done". |
| 4 | Smoke | `pnpm --filter @mas/web smoke` | **PASS** | 32 passed (41.5s), all Playwright smoke + lifecycle specs. |
| 5 | Sonar | `bash scripts/sonar-pr-issues.sh 36` + gate poll | **PASS** | Script: "PR #36: 0 open issue(s), 0 to-review hotspot(s). SONAR CLEAN", exit 0. Gate poll `qualitygates/project_status?...pullRequest=36` → `projectStatus.status = OK`, 0 failing conditions. Both required signals green. |

## Exit criteria — Phase 9 · 0a renforcée (A–G)

| Crit | PASS/FAIL | Evidence |
|------|-----------|----------|
| A — dispatch.ts compiles + agent tests green | **PASS** | Covered by checks 1+2 (tsc clean, no compile error). `@mas/agents` = 22 files / **100 passing**, 0 failing. |
| B — QMD one-command install + never-silent warning | **PASS** | `package.json` has `"qmd:setup": "bash scripts/qmd-setup.sh"`. Script PINS `@tobilu/qmd@2.5.3` (grep hits lines 10, 33). `pnpm mem:doctor` (QMD installed) → "QMD détecté → recherche sémantique active (BM25 + vecteurs + rerank)" / `backend=qmd`. `MAS_RETRIEVAL_BACKEND=fts pnpm mem:doctor` → "Recherche en FTS (mots-clés) — forcée par MAS_RETRIEVAL_BACKEND=fts" / `backend=fts`. Worker boot wires it: `apps/worker/src/index.ts` `reportRetrievalBackend()` (L74-77) calls `retrievalDoctor` and `console.warn(d.message)` when QMD absent, invoked at boot L128. `packages/memory/src/retriever.ts` `retrievalDoctor` (L455) emits message text containing "pnpm qmd:setup" (L474, L478) on absence. |
| C — agent tests pinned to FTS | **PASS** | `packages/agents/vitest.config.ts` has `env: { MAS_RETRIEVAL_BACKEND: 'fts' }` (L11). |
| D — ADR 0003 amended | **PASS** | `docs/decisions/0003-memory-storage-format.md` L62 "## Amendment (2026-06-22) — QMD is now live (Phase 9 · 0a renforcée)". Covers all required points: (1) QMD now not deferred; (2) unified retrieval knowledge+memory+arsenal with QMD_MEMORY_COLLECTIONS; (3) FTS fallback, never silent, MAS_RETRIEVAL_BACKEND=fts forces FTS, doctor tells user to run qmd:setup; (4) store/search/decide boundary — QMD only reads, Memory Keeper sole writer to data/memory, derived+gitignored; (5) QMD = optional external runtime dep, pnpm qmd:setup, ~4.4 GB, Node ≥22, pin 2.5.3. Plus §11 billing re-confirmation. |
| E — semantic + arsenal eval on qmd backend | **PASS** | `pnpm mem:eval` → "Retrieval eval [qmd]: 6 pass, 0 fail, 0 skip" and final line "[mem:eval] OK — 6 passed, 0 skipped (backend=qmd)". 3 semantic (sem-forgetting, sem-token-cost, sem-prompt-quality) + 3 arsenal (arsenal-audit-pr, arsenal-security-agent, arsenal-memory-skill) golden queries all ✓. Backend = qmd (not fts) → QMD exercised. |
| F — install doc exists | **PASS** | `docs/workflows/qmd-retrieval-setup.md` present, opens with "# Recherche (QMD, optionnel)". Documents external runtime dep (L25-26), Node ≥ 22 (L34), ~4.4 GB (L26, L35), FTS fallback contract table (L60-61: binary present no index → FTS + warn; binary absent → FTS + warn), `pnpm qmd:setup` (L10, L42). |
| G — PR #36 is DRAFT, base phase/9a-memory | **PASS** | `gh pr view 36 --json` → `isDraft: true`, `baseRefName: "phase/9a-memory"`, `state: "OPEN"`, `headRefOid: 0620830...`. |

## Guardrails (spot-check)

- **§11 billing isolation** — PASS. Lint anti-PAYG guard ran clean ("PASS: no forbidden provider SDK imports"). Independent grep of `apps/` + `packages/*` source (`.ts/.tsx/.js/.mjs`, excluding api-fallback + build artifacts) for `@anthropic-ai/sdk` import/require/dynamic-import → NONE FOUND. QMD is a local shell binary, no API key, no network at query time → compliant.
- **§8 derived & gitignored** — PASS. `git check-ignore .qmd` → `.qmd` (`.gitignore:88`). `git check-ignore data/arsenal-index` → matched (`.gitignore:12 data/`). Both ignored. Memory Keeper remains sole writer to `data/memory`; QMD/retrievalDoctor only READ (confirmed in ADR §4 + retriever code is query-only).
- **Clean tree** — PASS. `git status --porcelain` empty on `phase/9a2-qmd-arsenal`. All work committed at HEAD 0620830.

## Verdict

**VERDICT: PASS**

All 5 verification checks pass with real command output: `pnpm -r test` (7 packages, all green — agents 100/100), `pnpm lint` (anti-PAYG guard + tsc clean), `pnpm build` (exit 0), `pnpm --filter @mas/web smoke` (32 passed), and Sonar both clean — script exit 0 with 0 open issues / 0 to-review hotspots AND gate `projectStatus.status = OK`. All seven exit criteria A–G are independently verified with evidence: dispatch compiles and agent tests are 100 passing; QMD installs in one command with a 2.5.3 pin and never-silent doctor/worker warnings that name `pnpm qmd:setup`; agent tests are FTS-pinned in vitest config; ADR 0003 carries a complete 2026-06-22 amendment covering all five mandated points; the eval harness exercises the real QMD backend (`backend=qmd`, 6 passed 0 skipped across 3 semantic + 3 arsenal golden queries); the install runbook exists with the required "Recherche (QMD, optionnel)" section; and PR #36 is a DRAFT based on `phase/9a-memory`. Guardrails hold — no forbidden SDK imports, `.qmd` and `data/arsenal-index` derived & gitignored, Memory Keeper still the sole writer, clean working tree. Nothing requires fixing.
