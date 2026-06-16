# ECC Harvest — Cluster Map (Stage 1 grouping output)

Mechanical clustering of the 270 ECC skills (frontmatter only, from `ecc-inventory.tsv`).
Goal: group similar items so we audit a CLUSTER once instead of N times, and so we can batch by effort tier.

**Acceptance bar (user-set, BROAD):** keep any skill that is — (1) NOT a duplicate we already have & better, (2) NOT useless/stub, (3) performant, (4) adds value *in its own domain* — even with no current MAOS use. Domain-specificity is NOT a reject reason. Reject only: dup-and-not-better, low-quality/stub, or unsafe (PAYG/secrets → §11 auto-reject).

## Effort policy — RESOLVED 2026-06-16: deep-boost EVERYTHING
User chose deep-boost for all keepers. So the T1/T2 split is now **batch-priority only**, not effort:
- **P1 (do first)** — CORE buckets: items that make MAOS itself better.
- **P2 (do after)** — ENG / verticals / misc: same deep treatment, lower priority.
- **T0 — Reject**: dup-not-better / stub / unsafe (PAYG/secrets → §11 auto-reject).

Every kept skill (P1 or P2) is audited → rewritten to §12 format → improved → given the Prompt Defense Baseline → written to `packages/skills/library/<slug>/`.

| Bucket | Count | Tier | Notes |
|--------|------:|:----:|-------|
| CORE: agent / harness / orchestration | 68 | T1 | biggest gold seam — maps to `packages/agents`, `mas-mission-planner`, dispatcher |
| CORE: eval / verify / review | 21 | T1 | → `mas-reviewer`, verification doctrine |
| CORE: security | 15 | T1 | → `mas-sec-reviewer`, §5, AgentShield |
| CORE: memory / context | 14 | T1 | → `packages/memory`, `mas-context-manager` |
| CORE: research / prompt | 10 | T1 | → `docs/knowledge` bootstrap, skill authoring |
| CORE: skills-mgmt | 8 | T1 | → `mas-skill-router` (scout/stocktake/comply) |
| CORE: token / cost | 7 | T1 | → `packages/tokens`, `TOKEN_STRATEGY.md` |
| ENG: arch / patterns / quality | 24 | T2 | reusable engineering arsenal |
| ENG: language / framework | 49 | T2 | per-lang packs — cluster by lang, ingest as library |
| DATA / ML | 6 | T2 | pytorch/mle/gan/data |
| Misc / unsorted | 32 | T2* | triage individually — gems + a few rejects |
| VERTICAL: out-of-product | 16 | T2/T0 | healthcare/energy/trade/etc — keep if strong in domain, else reject |

**T1 ≈ 143 skills** (deep) · **T2 ≈ 111 skills** (light) · **agents: 67** (22 `*-reviewer` + 10 `*-build-resolver` clustered → audit pattern once).

## Agent clusters (audit the pattern, not each)
- 22 `*-reviewer` (python/go/rust/ts/java/react/django/vue/php/csharp/fsharp/cpp/swift/flutter/kotlin/database/network/healthcare/mle): ONE decision → adopt per-language-reviewer *pattern* into Tier B or generate-on-demand.
- 10 `*-build-resolver`: ONE cluster decision.
- Singletons worth individual audit: `chief-of-staff`, `loop-operator`, `harness-optimizer`, `spec-miner`, `silent-failure-hunter`, `opensource-{forker,sanitizer,packager}`, `gan-{planner,generator,evaluator}`, `refactor-cleaner`, `type-design-analyzer`, `code-explorer`, `planner`, `architect`, `code-architect`.

## Misc/unsorted — flagged gems (T2, individual)
`recursive-decision-ledger`, `taste`, `repo-scan`, `regex-vs-llm-structured-text`, `competitive-platform-analysis`, `competitive-report-structure`, `plankton-code-quality`, `product-capability`, `click-path-audit`, `blueprint`, `content-engine`. Likely-reject (niche/low-reuse): `homelab-pihole-dns`, `ios-icon-gen`, `visa-doc-translate`, `manim-video`, `nutrient-document-processing`, `uncloud`, `windows-desktop-e2e` — confirm at triage.

## Commands cluster (92) — driven by `ecc_commands.tsv`
- **WRAPPER** (thin call over an agent we already adopt, e.g. `/react-review`→`react-reviewer`, `/rust-build`→`rust-build-resolver`): SKIP — adopting the agent covers it. ~30+ commands.
- **WORKFLOW** (multi-step flow we lack): `/learn` (extract reusable patterns), `/checkpoint`, `/quality-gate`, `/cost-report`, `/instinct-export`, `/prune`, `/harness-audit`, `/plan-prd`, `/loop-start`, `/aside`, `/pr`, `/review-pr` → individual `intake-audit`, adopt to `.claude/commands/`.
- **DUP** (we have it): skip.

## Rules cluster (113) — driven by `ecc_rules.tsv`
Grid = **21 languages × 5 concerns** {coding-style, testing, patterns, hooks, security} + ~8 common (agents, code-review, design-quality, development-workflow, git-workflow, performance, fastapi).
- **P1 (our stack)**: `typescript`, `web`, `react`, `vue`, `nuxt` + `common` → audit per-pack, port to `docs/rules/<lang>/`, distill deltas into CLAUDE.md §7.
- **P2 (arsenal)**: `python go java kotlin swift rust php csharp cpp fsharp dart ruby angular perl arkts` → deep-boost into `docs/rules/<lang>/` for later use.
- Audit unit = **per (language) pack** (~21 audits), not per file (saves ~90 audits).

## How clusters feed the audit
1. Each T1 cluster → batch of deep audits (our `intake-audit` per item).
2. Each agent cluster → 1 pattern-level `intake-audit`.
3. T2 → bulk light-ingest per batch with a single shared dossier per sub-cluster.
