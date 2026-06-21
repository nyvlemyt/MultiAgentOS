# ECC Harvest — Decision Shard: cluster `skill:core-research` (lot R1)

Doer: Phase C ECC Harvest. Origin: `affaan-m/ecc` (MIT). Sanitize + PAYG scan: **0 secrets, 0 PII,
0 internal paths, 0 `@anthropic-ai/sdk`, 0 `ANTHROPIC_API_KEY`** across all 6 slugs (clean). The
only matched token is the `EXA_API_KEY` *placeholder* (`YOUR_EXA_API_KEY_HERE`) inside `exa-search`'s
config example — a provider key reference, not a leaked secret; reframed as opt-in `.env.local`
per §11.bis. Wide-bar rule applied: keep unless dup-no-better / stub / unsafe.

Format: `slug · décision · raison · dedup · chemin`

---

## brand-discovery
- **décision**: adopt (adapt)
- **raison**: T2 (arsenal, verticale marketing). Méthode d'interview identité de marque riche,
  résumable, multi-sessions (8 modules, laddering/5-Whys/projectives, frameworks Sinek/Dunford/
  Mark&Pearson/Neumeier/Kapferer/Aaker), persistance disque + state.json. Validation path-traversal
  déjà présente (noms alphanum/hyphen, modules énumérés, chemins absolus in-project). Non-stub,
  performant, valeur propre. Adapté: 7 sections lifecycle, Prompt Defense Baseline, dedup explicite.
- **dedup**: distinct de `brand-guidelines` (applique une marque existante à un artefact) et de
  l'agent `Brand Guardian`; aucun *skill* d'élicitation d'identité n'existe → keeper.
- **chemin**: `packages/skills/library/brand-discovery/SKILL.md`

## council
- **décision**: adopt (adapt)
- **raison**: T1 (touche la colonne planification/dispatch — décision sous ambiguïté). Conseil
  quatre-voix anti-ancrage (Architect in-context écrit sa position d'abord; Skeptic/Pragmatist/
  Critic = subagents frais avec question+contexte seulement). Garde-fous biais solides, verdict
  scannable, persistance only-if-material. Adapté: remap des skills référencés vers nos équivalents
  réels (`santa-method` library ✓, `planner`→`mas-mission-planner`, `code-reviewer`→`mas-reviewer`,
  `knowledge-ops`/`/save-session`→Memory Keeper §8), borne 1 round (~15× quota §11), lifecycle complet.
- **dedup**: aucun équivalent. Distinct de `mas-reviewer` (gate livrable), `mas-mission-planner`
  (DAG), `intake-audit` (adoption candidat) → keeper.
- **chemin**: `packages/skills/library/council/SKILL.md`

## deep-research
- **décision**: adapt_now (maintainer-safe rewrite)
- **raison**: T2. Backbone de recherche web multi-sources → rapport cité (sous-questions, search,
  deep-read, synthèse, gates qualité: claim=source, single-source⇒unverified, fact/inference/opinion
  séparés). Couplé à l'origine aux MCP firecrawl/exa nommés. Adapté maintainer-safe: réécrit
  **provider-agnostic** (le *quoi*, pas le binding vendor), dégradation gracieuse si provider absent
  (§11.bis), fan-out subagents borné (~15× quota §11), token-discipline §6 (résumer, pas injecter).
- **dedup**: distinct de `market-research` (décision business + reco TAM/SAM/SOM) et de
  `literature-review` (corpus académique reproductible). Angle = recherche web généraliste → keeper.
- **chemin**: `packages/skills/library/deep-research/SKILL.md`

## documentation-lookup
- **décision**: adapt_now (maintainer-safe rewrite)
- **raison**: T2. Récupération de docs librairie/framework à jour via provider live-docs (Context7
  MCP canonique) au lieu du training data. Flow resolve→select→query borné (≤3 appels), version-aware,
  redaction secrets avant envoi provider. Adapté: provider-agnostic + dégradation gracieuse si aucun
  provider (§11.bis), token-cap §6, lifecycle complet.
- **dedup**: distinct de `deep-research` (web large) et `market-research` (business). Surface = docs
  d'API à jour → keeper.
- **chemin**: `packages/skills/library/documentation-lookup/SKILL.md`

## exa-search
- **décision**: adapt_now (maintainer-safe rewrite — keep-as-lens, pas pur binding)
- **raison**: T2. Cas-limite signalé (vendor search API). Le contenu n'est PAS un pur binding: il
  porte un vrai *query-craft* réutilisable (opérateurs `site:`/`intitle:`/quoted, category focus,
  sizing snippet 1-2k vs comprehensive 5k+, mode web vs code-context). Conservé comme **lens** de
  recherche, provider opt-in §11.bis: `EXA_API_KEY` cadré en `.env.local` (gitignored), clé manquante
  ⇒ provider désactivé avec warning, jamais crash, jamais clé committée. Résultats traités untrusted
  (Prompt Defense Baseline). Adapté: lifecycle, routage explicite vers deep-research/documentation-lookup.
- **dedup**: distinct de `deep-research` (lui consomme ce skill pour synthétiser) et
  `documentation-lookup` (docs version-aware) → keeper (lens), pas reject.
- **chemin**: `packages/skills/library/exa-search/SKILL.md`

## intent-driven-development
- **décision**: adopt (adapt)
- **raison**: T1 (touche la colonne planification/qualité — porte de pré-implémentation). Transforme
  un changement ambigu/à-risque en critères d'acceptation vérifiables (AC-NNN: scenario→action→
  expected observable→side-effect interdit→verification→priorité), ban des mots vagues, repo=facts
  techniques mais jamais règles business inférées du code, depth par risque (Quick Capture vs Full
  Brief), pas de side-effects sans demande, jamais de secret/PII. Excellent garde-fou §5/§11 déjà
  natif. Adapté: 7 sections, Prompt Defense Baseline, liens MAS réels.
- **dedup**: distinct de `mas-mission-planner` (décompose en DAG — celui-ci définit *quoi est
  correct*) et de `intake-audit` (décide l'adoption d'un candidat). Companion amont du planner et
  de `mas-reviewer` → keeper.
- **chemin**: `packages/skills/library/intent-driven-development/SKILL.md`

---

## Récapitulatif

| slug | décision | tier | chemin |
|---|---|---|---|
| brand-discovery | adopt (adapt) | T2 | `packages/skills/library/brand-discovery/SKILL.md` |
| council | adopt (adapt) | T1 | `packages/skills/library/council/SKILL.md` |
| deep-research | adapt_now | T2 | `packages/skills/library/deep-research/SKILL.md` |
| documentation-lookup | adapt_now | T2 | `packages/skills/library/documentation-lookup/SKILL.md` |
| exa-search | adapt_now | T2 | `packages/skills/library/exa-search/SKILL.md` |
| intent-driven-development | adopt (adapt) | T1 | `packages/skills/library/intent-driven-development/SKILL.md` |

**Keepers**: 6/6 — tous. Aucun stub, aucun dup-no-better, aucun unsafe (§11 clean).
**Rejets**: 0/6.
**Note `exa-search`**: gardé comme *lens* de query-craft (pas pur binding), provider opt-in §11.bis.
