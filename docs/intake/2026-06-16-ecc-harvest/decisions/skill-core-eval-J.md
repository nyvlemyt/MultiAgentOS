# ECC Harvest — Decision Shard: cluster `skill:core-eval` (lot J)

Doer: Phase C ECC Harvest. Origin: `affaan-m/ecc` (MIT). Sanitize + PAYG scan: **0 secrets, 0 PII,
0 internal paths, 0 `@anthropic-ai/sdk`, 0 `ANTHROPIC_API_KEY`** across all 7 slugs (clean).
Wide-bar rule applied: keep unless dup-no-better / stub / unsafe.

Format: `slug · décision · raison · dedup · chemin`

---

## accessibility
- **décision**: adopt (adapt)
- **raison**: T2. Skill d'implémentation+audit WCAG 2.2 AA riche (cross-platform Web/iOS/Android,
  mapping Name/Role/Value, anti-patterns). Performant, valeur propre. Adapté: ajout negative
  triggers, Rationalizations, Red Flags, Verification binaire; cadré comme couche statique vs
  browser-qa (runtime).
- **dedup**: l'agent `Accessibility Auditor` audite mais aucun *skill* d'implémentation ARIA/traits
  n'existe. Angle distinct → keeper.
- **chemin**: `packages/skills/library/accessibility/SKILL.md`

## ai-regression-testing
- **décision**: adopt (adapt)
- **raison**: T1 (touche la colonne vertébrale qualité/dispatch). Patterns regression spécifiques
  au dev assisté IA (self-review blind spot, sandbox/prod parity = #1 régression IA, sandbox-mode
  DB-free = fit TOKEN_STRATEGY). Code d'exemple générique (Vitest/Next), zéro secret. Adapté:
  generalisé hors-stack, sections lifecycle, lien explicite à mas-reviewer/mas-sec-reviewer.
- **dedup**: aucun équivalent; companion exécutable de `mas-reviewer` (qui lit, ne assert pas).
- **chemin**: `packages/skills/library/ai-regression-testing/SKILL.md`

## automation-audit-ops
- **décision**: adapt_now (maintainer-safe rewrite)
- **raison**: T1. Audit inventaire des automations LIVE (cron/worker/hooks/CI/MCP/connectors) avec
  proof-path + keep/merge/cut/fix-next. Fortement couplé ECC à l'origine (skill-stack
  workspace-surface-audit, github-ops, ecc-tools-cost-audit, sibling app repo). Adapté
  maintainer-safe: skill-stack ECC + références app-soeur retirés, scope ramené à evidence locale
  user-authorized. Utile pour la surface d'automation propre de MAS.
- **dedup**: distinct de `intake-audit` (lui décide l'adoption d'un *nouveau* candidat; celui-ci
  audite l'existant qui tourne). Distinct de `mas-memory-keeper`.
- **chemin**: `packages/skills/library/automation-audit-ops/SKILL.md`

## benchmark-methodology
- **décision**: reject
- **raison**: hors-domaine. Benchmark *marketing/brand competitif* d'agences (9 dimensions de
  positionnement, voice, pricing, tension-plot 2×2) — livrable conseil agence, sans surface MAS.
  Ne touche ni la perf, ni l'éval de code/agents (l'intention du cluster core-eval). Pas un stub
  (contenu riche) mais aucun fit projet. Wide-bar: reject = pas-de-surface MAS, pas dup.
- **dedup**: n/a (aucun équivalent souhaité).
- **re-audit**: si MAS ajoute un domaine "competitive/market analysis" agent (non roadmappé).
- **chemin**: — (no library file)

## benchmark-optimization-loop
- **décision**: adopt (adapt)
- **raison**: T2. Boucle d'optimisation bornée et mesurée (baseline+correctness gate+metric+budget
  obligatoires, 1 hypothèse/variant, ledger, promotion gate, "best measured safe variant" pas
  "global optimum"). Performant, discipline solide. Adapté: lifecycle complet, lien à `benchmark`.
- **dedup**: distinct de `benchmark` (lui = couche *mesure*; celui-ci = couche *search/loop*).
- **chemin**: `packages/skills/library/benchmark-optimization-loop/SKILL.md`

## benchmark
- **décision**: adopt (adapt)
- **raison**: T2. Baseline perf + détection régression (4 modes: page CWV / API percentiles / build
  / before-after avec verdict). Baselines JSON git-tracked. Browser-MCP rendu dépendance
  *optionnelle* (API/build sans browser). Adapté: lifecycle, principes percentiles/targets-first.
- **dedup**: l'agent `Performance Benchmarker` mesure mais aucun *skill*. Distinct de browser-qa
  (correctness) et de benchmark-optimization-loop (search).
- **chemin**: `packages/skills/library/benchmark/SKILL.md`

## browser-qa
- **décision**: adopt (adapt)
- **raison**: T1. QA runtime structurée d'app web live via browser tool (4 phases: smoke/
  interaction/visual-regression/a11y) → verdict SHIP/SHIP-WITH-FIXES/DO-NOT-SHIP/INCONCLUSIVE.
  Garde-fous solides déjà présents (read-only default, test-creds, redact, no-baseline⇒
  INCONCLUSIVE, axe necessary-not-sufficient). Adapté: lifecycle, liens inter-skills.
- **dedup**: recoupe partiellement `webapp-testing` (Playwright) mais ajoute un checklist
  verdict-producing distinct; recoupe `mas-reviewer` sur l'esprit gate mais angle runtime-UI
  distinct → keeper.
- **chemin**: `packages/skills/library/browser-qa/SKILL.md`

---

## Récapitulatif

| slug | décision | tier | chemin |
|---|---|---|---|
| accessibility | adopt (adapt) | T2 | `packages/skills/library/accessibility/SKILL.md` |
| ai-regression-testing | adopt (adapt) | T1 | `packages/skills/library/ai-regression-testing/SKILL.md` |
| automation-audit-ops | adapt_now | T1 | `packages/skills/library/automation-audit-ops/SKILL.md` |
| benchmark-methodology | **reject** | T0 | — |
| benchmark-optimization-loop | adopt (adapt) | T2 | `packages/skills/library/benchmark-optimization-loop/SKILL.md` |
| benchmark | adopt (adapt) | T2 | `packages/skills/library/benchmark/SKILL.md` |
| browser-qa | adopt (adapt) | T1 | `packages/skills/library/browser-qa/SKILL.md` |

**Keepers**: 6/7 — `accessibility`, `ai-regression-testing`, `automation-audit-ops`,
`benchmark-optimization-loop`, `benchmark`, `browser-qa`.
**Rejets**: 1/7 — `benchmark-methodology` (hors-domaine, aucune surface MAS).
