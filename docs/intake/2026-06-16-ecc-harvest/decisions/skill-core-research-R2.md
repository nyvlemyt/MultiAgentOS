# ECC Harvest — Decision Shard: cluster `skill:core-research` (lot R2)

Doer: Phase C ECC Harvest. Origin: `affaan-m/ecc` (MIT) except `prompt-optimizer`
(`metadata.origin: community`, author YannJY02, bundled in ECC — treated as ECC-vendored, MIT).
Sanitize + PAYG scan across all 5 source SKILL.md: **0 secrets, 0 PII, 0 internal home paths,
0 `@anthropic-ai/sdk`, 0 `ANTHROPIC_API_KEY`** (the `/api/users/:id` matches in `prompt-optimizer`
are example REST routes, not PII — false positives). Wide-bar rule applied: keep unless
dup-no-better / stub / unsafe. All 5 = keepers.

Format: `slug · décision · raison · dedup · chemin`

---

## iterative-retrieval
- **décision**: adopt (adapt)
- **raison**: T1 — touche la colonne vertébrale orchestration/dispatch. Boucle bornée
  DISPATCH→EVALUATE→REFINE→LOOP (max 3) qui résout le "context problem" des subagents :
  start-broad, scoring relevance 0–1, gap-naming, stop-at-good-enough. Fit direct du token
  budget (§6) et lecture read-only sur projects.path (§8). Performant, valeur propre. Adapté :
  negative triggers, sections lifecycle complètes, Rationalizations/Red Flags/Verification
  binaire, cadrage read-only + observation-masking (signal-density), Prompt Defense Baseline.
- **dedup**: distinct de `mas-skill-router` (lui charge des L1 summaries, ne *retrouve* pas de
  code) et de `mas-mission-planner` (lui décompose, ne récupère pas le contexte). Angle propre.
- **chemin**: `packages/skills/library/iterative-retrieval/SKILL.md`

## search-first
- **décision**: adopt (adapt)
- **raison**: T1 — discipline research-before-coding (repo→registry→MCP→skills→OSS) avec matrice
  adopt/extend/compose/build et preflight d'honnêteté des canaux. Aligne sur la règle projet
  "discovery oui, auto-install jamais" (mémoire skills.sh) et le gate §5. Performant, valeur
  propre. Adapté : repo-first explicité, "discovery≠install → intake-audit + mas-sec-reviewer"
  inséré, Rationalizations/Red Flags/Verification binaire, Prompt Defense Baseline.
- **dedup**: distinct de `intake-audit` (lui *décide* l'adoption d'un candidat ; celui-ci *trouve*
  les candidats avant de coder — il alimente intake-audit). Distinct de `mas-skill-router`.
- **chemin**: `packages/skills/library/search-first/SKILL.md`

## regex-vs-llm-structured-text
- **décision**: adopt (adapt) — **gem signalé**
- **raison**: T1 — framework de décision regex-vs-LLM pour texte structuré : regex d'abord
  (95–98% déterministe/gratuit), confidence-scoring comme routeur, LLM cheap-model en fallback
  edge-cases seulement (~95% économie vs all-LLM). Expression directe du token budget (§6).
  Performant, métriques prod (410 items), valeur propre forte. Adapté : le code-exemple
  `client.messages.create` neutralisé en note provider-agnostic routée via `llm.ts` (§11) ;
  ajout negative triggers, sections lifecycle, Verification binaire incluant le garde §11.
- **dedup**: aucun équivalent MAS (ni skill ni agent) sur le choix parsing déterministe vs LLM.
- **chemin**: `packages/skills/library/regex-vs-llm-structured-text/SKILL.md`

## research-ops
- **décision**: adapt_now (maintainer-safe rewrite)
- **raison**: T1 — wrapper opérateur de recherche current-state. Le keeper lens = **hygiène
  d'évidence** (sourced fact / user-supplied / inference / recommendation, dates sur le
  freshness-sensitive) + "lightest useful path first". Fortement couplé ECC à l'origine
  (skill-stack nommé : exa-search, deep-research, market-research, lead-intelligence,
  knowledge-ops). Adapté maintainer-safe : skill-stack propriétaire **retiré**, remplacé par
  "lightest useful path = ce que le harness actif expose" gouverné par `allowed_hosts` (§5) ;
  findings durables → `MemoryProposal` (jamais d'écriture mémoire directe, §8) ; Prompt Defense
  Baseline (pilote des fetch externes = contenu untrusted).
- **dedup**: distinct de `search-first` (lui = trouver une *lib/outil* avant de coder ; celui-ci =
  recherche d'évidence current-state) et de `intake-audit` (décision d'adoption).
- **chemin**: `packages/skills/library/research-ops/SKILL.md`

## prompt-optimizer
- **décision**: adapt_now (maintainer-safe rewrite — réécriture lourde)
- **raison**: T1 — pipeline advisory-only qui diagnostique un prompt brut → intent/scope/missing-
  context → mapping vers la surface, puis émet un prompt optimisé paste-ready ; ne s'exécute
  jamais. Recoupe notre doctrine `prompting-anthropic.md` mais **angle distinct** = pipeline
  appliqué (la doctrine = la référence ; ce skill = l'application sur un draft concret) → keeper
  conformément au brief. Couplage ECC fort à l'origine (catalogue hardcodé : /plan, /tdd, skills
  & agents ECC). Adapté maintainer-safe : catalogue ECC **remplacé** par la surface MAS réelle
  (skills `mas-*`, agents Tier A/B, niveaux d'autonomie §4, tiers d'effort eco/standard/expert
  §6), préférence pour l'inventaire live du harness vs liste figée ; advisory-only renforcé ;
  Prompt Defense Baseline.
- **dedup**: distinct de `mas-skill-router` (lui route une tâche *déjà claire* ; celui-ci
  *clarifie/réécrit* le prompt en amont). Recoupe `prompting-anthropic.md` mais ne le duplique
  pas (référence vs pipeline appliqué).
- **chemin**: `packages/skills/library/prompt-optimizer/SKILL.md`

---

## Récapitulatif

| slug | décision | tier | chemin |
|------|----------|------|--------|
| iterative-retrieval | adopt (adapt) | T1 | `packages/skills/library/iterative-retrieval/SKILL.md` |
| search-first | adopt (adapt) | T1 | `packages/skills/library/search-first/SKILL.md` |
| regex-vs-llm-structured-text | adopt (adapt) — gem | T1 | `packages/skills/library/regex-vs-llm-structured-text/SKILL.md` |
| research-ops | adapt_now (maintainer-safe) | T1 | `packages/skills/library/research-ops/SKILL.md` |
| prompt-optimizer | adapt_now (maintainer-safe) | T1 | `packages/skills/library/prompt-optimizer/SKILL.md` |

**Keepers**: 5/5. **Rejets**: 0. **Re-audit**: si ECC publie une refonte de ces skills, ou si
MAS recâble `llm.ts`/`allowed_hosts`/la surface d'agents (impacte regex-vs-llm, research-ops,
prompt-optimizer).
