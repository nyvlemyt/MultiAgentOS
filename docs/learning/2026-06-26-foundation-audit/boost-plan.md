# Foundation-Doc Boost Plan — 2026-06-26

> Source: adversarial foundation-doc audit. 15 findings, each already verified (`real: true`) against the live code on branch `claude/frosty-bardeen-48b06d`. This plan sequences the corrections. No new findings are introduced here.

## TL;DR — foundation health

The foundation docs are **structurally sound but lagging the code**: every defect is drift/staleness, not a wrong design decision — the constitution, specs, and knowledge base describe a real system, they just describe an *earlier* version of it. 13 of 15 fixes are mechanical doc corrections a careful editor can apply blind; only 4 need product judgment (tone/scope marking). The single load-bearing risk is that **8 findings sit in docs the Phase 9 autonomous loop reads as ground truth** (a §5 gate that does not run, a 0d exit criterion the merged ADR already deferred, broken code-path pointers, stale retriever doctrine, two "still-open" backlog cards that are actually shipped) — these mislead an agent and must land before any Phase 9 build.

## Apply now (safe)

Mechanical doc-only corrections. Grouped by file, ordered high → low severity within each group.

### ROADMAP.md
| Locator | Fix |
|---|---|
| l.439 & l.442 (Phase 9 · 0d) — **high** | Append a deferral note mirroring the merged ADR-0007 amendment: mark "un agent appelle `query` via MCP en mission" as **DEFERRED to Étape 1** (wiring-only shipped; runtime activation tracked in `docs/backlog/arsenal-mcp-runtime-activation.md`). Keep the other 0d criteria (semantic skill selection, golden set, FTS fallback) as delivered. |
| l.339 (Phase 5 goal) — **low** | `58 library agents` → `60 library agents` (matches `AGENTS.md:9` and `ls .claude/agents/*.md` = 60). |
| l.81 — **low** | `packages/core/permissions.ts` → `packages/core/src/permissions.ts`. Same `src/` drift also at l.111 (`packages/core/llm.ts` → `…/src/llm.ts`) if fixing repo-wide. |

### SKILLS_REGISTRY.md
| Locator | Fix |
|---|---|
| §8 "Where the policy lives in code", l.132-134 — **medium** | Drop the non-existent `registry.ts` and `cache.ts` rows; fix the `src/`-less prefix. Replace with: `packages/skills/src/scanner.ts` (discovery, indexing, summary-cache IO — `writeSummaryCache`); `packages/skills/src/reindex.ts` (rescan driver, `pnpm skills:reindex`); `packages/skills/src/router.ts` (SkillRouter prompt + JSON schema); `packages/skills/src/select.ts + rrf.ts` (selection / RRF fusion). |

### PRODUCT_SPEC.md
| Locator | Fix |
|---|---|
| §8 Data model, l.275 (`events(...)`) — **medium** | `cost_cents` → `quota_units` (matches Drizzle literal `schema.ts:195`, `ROADMAP.md:138`, `TOKEN_STRATEGY.md:88`). |

### TOKEN_STRATEGY.md
| Locator | Fix |
|---|---|
| l.5 & l.53 — **low** | `packages/core/llm.ts` → `packages/core/src/llm.ts` (CLAUDE.md §11 already uses the correct `src/` form). |

### CLAUDE.md
| Locator | Fix |
|---|---|
| §3 Repository layout, `tokens/  # Budget + cost meter` row — **low** | Drop the row, OR annotate inline: `tokens/  # (planned — folded into @mas/core; budget-gate in packages/agents/src/budget-gate.ts, LLM/budget injection in packages/core/src/llm.ts)`. The forward-looking `packages/tokens` mentions in ADR 0006 / `docs/intake/*` are aspirational and may stay. |

### docs/knowledge/memory-patterns.md
| Locator | Fix |
|---|---|
| §QMD l.196 ("ADR — décidé") + §Architecture cible l.281 — **medium** | Rewrite to present tense, QMD-is-live: QMD is the **live primary retriever** (BM25+vector+rerank via `QmdRetriever`/`UnifiedRetriever`), FTS5 the CI/local fallback (`MAS_RETRIEVAL_BACKEND=fts`). Cite ADR 0003 amended 2026-06-22 ("Accepted — QMD now live") and `packages/memory/src/retriever.ts` `createRetriever`/`UnifiedRetriever`. Keep a one-line note that FTS5 was the original Phase-4 MVP path. |

### docs/knowledge/risk-scoring-and-session-orchestration.md
| Locator | Fix |
|---|---|
| l.18 + l.58 footer — **medium** | Drop the reference to `config/project-stack-mappings.json` (it does not exist anywhere). The only permission config is `config/permissions.json`, currently an empty registry (`{categories:[], allowed_hosts:[]}`); stack metadata is derived at runtime by `apps/web/lib/stack-detect.ts`. Reword the per-stack base-tool input as **aspirational** (would come from extending `config/permissions.json` categories and/or `stack-detect.ts`). |

### docs/knowledge/agent-patterns.md
| Locator | Fix |
|---|---|
| l.205-206 — **low** | `Les 8 agents câblés au MVP` → `Les 8 agents câblés au MVP plus le pilote scopé security-defensive-specialist (9 entrées au total)` — matches the 9-key `TIER_B_DELEGATION_MAP`, the `toHaveLength(9)` test (`library.test.ts:66`), and `AGENTS.md §6` ("8 MVP rows + the scoped pilot"). |

### docs/knowledge/vibeflow/gouvernance.md
| Locator | Fix |
|---|---|
| l.150 — **low** | `les 6 fiches Tier A au gate Phase 3.5` → `les 9 fiches Tier A à chaque gate de phase` (generalize to current roster; reference `AGENTS.md §3`). |
| l.20 — **low** | De-freeze the stale count and align the command: `nos 28 tests Vitest … pnpm -w test` → `notre filet Vitest (≈90 fichiers de test à ce jour) … pnpm -r test` (canonical command per `package.json:13` / CLAUDE.md §7). Explicitly a Phase-3-close historical note. |

### docs/knowledge/vibeflow/agents-skills.md
| Locator | Fix |
|---|---|
| l.56 — **low** | `aux 6 fiches` → `aux 9 fiches` (simple swap; reference `AGENTS.md §3`). |

### docs/backlog/router-window-state-persistence.md
| Locator | Fix |
|---|---|
| Whole card — **medium** | Add a top-of-file `**Status:** ✅ RESOLVED` banner (matching sibling cards). The prescribed work shipped in Phase 5b: `onBlock` hook + `window_blocked` events + constructor hydration, covered by the cross-restart test `packages/agents/src/router-persist.test.ts` (commits `381570e`, `72234b3`). Strike the "What to do (when picked up)" future-work framing. Refresh the stale code anchors → `llm.router.ts` L52 (blockedAt Map), L74-84 (getWindowState/TTL), L62-64 (hydration). |

### docs/backlog/function-length-debt.md
| Locator | Fix |
|---|---|
| doc l.3 header + l.12 (F-FN-2) — **low** | `dispatch.ts is now 739 lines` → `765 lines`; F-FN-2 LOC `138` → `145`, locator `dispatch.ts:73 / #L73` → `dispatch.ts:92 / #L92` (planMission now spans 92-236). Qualitative claims (file < 800, planMission > 50-line cap) remain true. |

## Needs human judgment

Tone, product-scope marking, or "done vs open" decisions — not blind edits.

| File | Locator | Why it needs judgment | Direction |
|---|---|---|---|
| CLAUDE.md | §5, `allowed_hosts` network bullet — **medium** | Touches the constitution's §5 safety contract: editor must choose **annotate-as-unenforced** vs **implement the gate**. | Either annotate the bullet as not-yet-wired (`schema field reserved; runtime host-allowlist gate not yet wired — backlogged, see docs/backlog/allowed-hosts-runtime-gate.md`), or implement the host-check seam (resolve target host → compare vs `perms.allowed_hosts` at outbound boundary → route misses through §5 pause, mirroring PR #44 `classifyRisk`/perms wiring). The categories half of §5 **is** wired; only the host-allowlist half is aspirational. |
| SKILLS_REGISTRY.md | §3 default-tier table, l.45-77 — **medium** | Requires a tier decision for 8 in-house skills + cross-ref to the canonical orchestrator-tier home (AGENTS.md), not a literal swap. | Add an "In-house orchestrator + intake skills" subsection: the 6 `mas-*` skills (mission-planner, skill-router, context-manager, memory-keeper, reviewer, sec-reviewer) at tier **Pinned** (matching the existing §2 Pinned example), plus `intake-audit` and `taste` with real triggers. Cross-reference AGENTS.md §3 for the orchestrator-tier definition (avoid the proposedFix's overstated "Phase 3 scope" parenthetical). |
| docs/knowledge/anthropic-ecosystem.md | l.63 (`Hooks — 27 événements`); echoed README.md:15, vibeflow/hooks.md:21,38 — **medium** | An in-cluster contradiction (9 vs 27) spanning 4 files incl. surrounding plan prose — needs a single canonical wording chosen and propagated, not 4 isolated number swaps. | Canonicalize to **"9 hook events (Claude Code 2.1)"** with the 9-event list, citing `claude-code-context-and-modes.md §6 l.79` (the 2026-06-21 cheatsheet delta — cite the §6 section, not the file's 2026-06-03 header) as authority. Fix in lockstep: `anthropic-ecosystem.md:63`, `README.md:15` table cell, `vibeflow/hooks.md:21` **and** `:38` ("Mapper les 8 hooks sur les 27 événements" — both the figure and the plan text). |
| docs/backlog/per-provider-subscription-awareness.md | §Le gap (1-5) + §Ce qu'il faut items 1 & 4 — **medium** | A "rewrite the status" card: which items are DONE vs the genuinely-residual scope is a product call, and the finding's own residual scope was partly wrong (it claimed no UI exists — there is one). | Mark **DONE** with evidence: item 1 (plan field) — `config/model-routing.json` `claude_plan` + per-provider `plan`, parsed by `packages/core/src/providers/config.ts`; item 4 (budget-gate resolves cap from plan) — `budget-gate.ts` `planMonthlyQuota()` L111-115 + override L171-173; item 3 (UI) **PARTIALLY done** — `apps/web/lib/tokens.ts` `providerPlanLabels()` + the token-meter page render a per-provider "Abonnement" column. Drop the "aucun champ ne décrit le plan" framing. Narrow genuine-open scope to: (a) declare the actual `monthlyTokenQuota` cap value in config (only `monthlyCostEur` is declared, so the override path is dormant), and (b) a **topbar** plan indicator + plan-derived remaining-quota figure. Do **not** claim the UI is entirely missing. |

## Blocks Phase 9

These are the docs the autonomous loop reads as ground truth; an agent would be actively misled. **Fix all 8 before any Phase 9 build.** (Severity in parens; fixClass noted.)

1. **CLAUDE.md §5 `allowed_hosts` network gate** (medium, *judgment*) — the constitution asserts an always-on human-gate that **no runtime code enforces**. An autonomous agent would assume outbound calls to non-allowlisted hosts are blocked; they are not. → `docs/backlog/allowed-hosts-runtime-gate.md`.
2. **ROADMAP.md l.439/442 — 0d MCP-query criterion** (high, *safe*) — ROADMAP presents agent-query-via-MCP as a *delivered* 0d exit criterion, but the merged ADR-0007 amendment **defers runtime activation to Étape 1**. The loop would treat a deferred capability as live.
3. **SKILLS_REGISTRY.md §8 code-path pointers** (medium, *safe*) — points the loop at `packages/skills/registry.ts` / `cache.ts`, which **do not exist**. An agent told "the policy lives here" finds nothing.
4. **docs/knowledge/memory-patterns.md §QMD / §Architecture cible** (medium, *safe*) — claims the live retriever is still FTS5 with QMD "à venir"; QMD is in fact the **live primary retriever**. Misleads any memory-touching reasoning.
5. **docs/knowledge/risk-scoring-and-session-orchestration.md l.18/58** (medium, *safe*) — references a phantom `config/project-stack-mappings.json` as a "ready" per-stack permission input; the file does not exist and the input is not ready.
6. **docs/knowledge/anthropic-ecosystem.md l.63 (hooks 27 vs 9)** (medium, *judgment*) — a foundational capability count contradicting the canonical CC 2.1 surface across 4 files; the loop could plan against 27 nonexistent hook events.
7. **docs/backlog/router-window-state-persistence.md** (medium, *safe*) — framed as still-open backlog, but the work is **shipped + tested**. The loop could redundantly re-implement it.
8. **docs/backlog/per-provider-subscription-awareness.md** (medium, *judgment*) — asserts a gap ("no plan field") that the code **closed**; the loop could re-build existing plumbing.

## Recommended order

Sequence chosen to (a) unblock Phase 9 first, (b) batch the cheap mechanical edits, (c) leave the judgment calls for a focused pass.

1. **Phase-9 blockers, safe subset first** (mechanical, highest leverage): ROADMAP 0d deferral note (#2 above), SKILLS_REGISTRY §8 paths (#3), memory-patterns QMD (#4), risk-scoring phantom config (#5), router-window RESOLVED banner (#7). These are blind edits that immediately stop misleading the loop.
2. **Phase-9 blockers needing judgment**: CLAUDE.md §5 allowed_hosts annotation (#1), hooks 27→9 canonicalization across 4 files (#6), per-provider card status rewrite (#8). Do these as one deliberate pass since each carries a small decision.
3. **Remaining safe doc fixes** (not Phase-9-blocking, batchable in one commit): CLAUDE.md §3 tokens/ row, PRODUCT_SPEC cost_cents→quota_units, ROADMAP 58→60 + `src/` path fixes, TOKEN_STRATEGY `src/` paths, agent-patterns 8→9, vibeflow gouvernance 6→9 + 28-tests, vibeflow agents-skills 6→9, function-length-debt number refresh.
4. **Remaining judgment fix**: SKILLS_REGISTRY §3 in-house-skills subsection (tier decision + AGENTS.md cross-ref).

Rationale: steps 1-2 are the gate before Phase 9; steps 3-4 are foundation hygiene that can ride a normal doc-maintenance commit. Group the `src/`-path corrections (ROADMAP l.81/111, TOKEN_STRATEGY l.5/53) into one repo-wide sweep to avoid leaving half the drift behind.

## Backlog hygiene

Two of the four backlog cards in scope describe work that is **already shipped** — close them; the other two are genuine status-rewrites, not closures.

| Card | Action | Reason |
|---|---|---|
| `docs/backlog/router-window-state-persistence.md` | **CLOSE** (add `✅ RESOLVED` banner) | The prescribed persistence + cross-restart test shipped in Phase 5b (`router-persist.test.ts`, commits `381570e`/`72234b3`). The card's exact requested test exists. |
| `docs/backlog/per-provider-subscription-awareness.md` | **KEEP, but rewrite** | Core premise ("no plan field") is closed in code; items 1, 4 are DONE and item 3 is partial. Genuine residual remains: declare the `monthlyTokenQuota` cap value (override path currently dormant) + add a topbar plan/remaining-quota indicator. Mark done items, narrow the open scope. |
| `docs/backlog/function-length-debt.md` | **KEEP** | Still a real open item — `planMission` (~145 LOC) remains over the §7 50-line cap; only the line numbers drifted. Refresh counts, do not close. |
| `docs/backlog/allowed-hosts-runtime-gate.md` (referenced by finding #1) | **KEEP** | The host-allowlist runtime gate is genuinely unbuilt; this card correctly tracks it. The fix is to make CLAUDE.md §5 *point at* it, not to close it. |

> Not in scope to close: `docs/backlog/arsenal-mcp-runtime-activation.md` is the correct live tracker for the deferred 0d MCP runtime activation (finding #2) and stays open until Étape 1.
