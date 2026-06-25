# Checker verdict — F1 (ADR 0007 §Décision-5 re-scope, Option B)

- **Date** : 2026-06-25
- **Scope** : branch `fix/f1-adr0007-mcp-deferred` (PR #43), base `main`. Diff = 4 files, +27/−5 (`git diff origin/main...HEAD`), HEAD `22da607`.
- **Change class** : documentation + code-comments only. No logic intended.
- **Checker** : independent verification gate (read-only on product/source/doc; only this verdict file written).

## Verdict table

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | ADR↔code coherence (status line flag + inline §5 marker + dated `## Amendement` block re-scoping to wiring-only; Decisions 1–4/6 not weakened) | **PASS** | Status line: `docs/decisions/0007-arsenal-exploitation.md:3` adds "amendé 2026-06-25 … §Décision-5 re-cadrée «câblage seulement»". Inline marker on Decision 5: `:50` (`⚠️ Re-cadrée par l'amendement du 2026-06-25 … Voir §Amendement en bas`). Dated block: `:93-102` (`## Amendement (2026-06-25) — §Décision-5 …`), with explicit **Inchangé** clause at `:101` restating Decisions 1–4/6 stand as realised. Internally consistent. |
| 2 | No logic changed — diff to `llm.real.ts` and `mission-llm.ts` is comments only | **PASS** | All 8 added lines are JS comments (`//` or JSDoc `*` continuations); **zero** deletions across both files (`git diff … grep '^-' | grep -v '^---'` → empty). `mcp?: boolean` field unchanged (appears only as diff context anchor). Comment sits inside the opts-type literal `mission-llm.ts:156-158`; destructure at `:161` (`...claudeOpts`) still never forwards `mcp`. |
| 3 | Deliberate non-wiring documented at both code sites, pointing to ADR amendment + backlog card | **PASS** | `llm.real.ts:56-60` — "Wiring-only by decision … deferred to Étape 1 (ADR 0007 amendment 2026-06-25 / finding F1). Tracked in docs/backlog/arsenal-mcp-runtime-activation.md." `mission-llm.ts:156-158` — "No `mcp` field by decision … câblage-only … (ADR 0007 amendment 2026-06-25 / F1). Add it here when that lands." Both cite ADR amendment + F1; `llm.real.ts` also cites the backlog card. |
| 4 | Backlog card updated honestly (Option B decided, points to Étape 1, still specifies exact future wiring + test) | **PASS** | `docs/backlog/arsenal-mcp-runtime-activation.md:3` "✅ DÉCIDÉ 2026-06-25 — Option B … activation différée à l'Étape 1". Decision section `:19-23` records Option B + rationale. "Reste à faire (Étape 1)" `:23` keeps the exact wiring (`mcp?` on `selectLLM` opts → `claudeOpts` → `buildMissionLLM` behind env/config opt-in, default OFF) + targeting + the byte-identical-off test. Deferred work not lost. |
| 5 | F2/F3/F4 left deferred, not silently dropped; PR claims no fix for them | **PASS** | `docs/backlog/arsenal-eval-live-recall-gate.md` (F2) exists, `:19` "Recommendation : **defer** (mais pas oublier)". `docs/backlog/cold-agent-semantic-suggest.md` (F3+F4) exists, `:23` "Recommendation : **defer**". Neither card is in this PR's diff (`git diff --name-only` lists only the F1 card + ADR + 2 code files). |
| 6 | Honesty — docs say the runtime promise is NOT yet met (deferred), no overclaim | **PASS** | ADR `:99` "Conséquence sur la «preuve attendue»": criterion is explicitly the **unit contract** "tant que l'Étape 1 ne l'active pas"; runtime proof "**est reportée**". `:101` scopes the amendment to "**que** le chemin MCP direct agent → `query`" while affirming the arsenal already acts via `selectLibrarySkills`/`buildMemoryContext` — accurate, not inflated. Card `:3` "câblé mais inerte" history preserved. No wording claims §Décision-5 runtime is delivered. |

## Supporting checks (gate evidence)

- `pnpm --filter @mas/core test` → **15 files / 109 tests pass** (incl. `llm.real.test.ts`, the unit contract that now formally backs §Décision-5's re-scoped "preuve attendue"). EXIT 0.
- `pnpm --filter @mas/agents test` → **28 files / 130 tests pass** (incl. `mission-llm` consumers). EXIT 0.
- A raw `tsc --noEmit` surfaces pre-existing strict-null noise in `*.test.ts` (`llm.router.test.ts`, `clients.test.ts`) — **not** introduced by this PR (these packages gate via `vitest run`, no `tsc` build script; the lines are untouched by the diff). Not a regression of this change.

## Overall verdict : **PASS**

The change does exactly and only what it claims. Both code files received pure-comment additions (8 comment lines, zero deletions, `...claudeOpts` still drops `mcp`), so the runtime is byte-for-byte unchanged and both touched packages' test suites stay green. The ADR now carries a status-line flag, an inline marker on Decision 5, and a dated amendment block that re-scopes the decision to "wiring-only, activation deferred to Étape 1" while explicitly leaving Decisions 1–4/6 intact. Crucially, the honesty bar is met: the docs state the runtime promise is **not yet** fulfilled and trace the deferred work (exact wiring + non-regression test) in the backlog card, rather than papering over the gap. F2/F3/F4 remain present and `defer`-flagged, untouched by this PR. No changes required.
