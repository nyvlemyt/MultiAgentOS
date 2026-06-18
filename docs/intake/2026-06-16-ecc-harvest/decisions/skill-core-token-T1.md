# ECC Harvest — décisions cluster `skill:core-token` (lot T1)

Doer: lot core-token (5 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B), `TOKEN_STRATEGY.md`, et `packages/tokens` (vide pour l'instant — dedup conceptuel sur la table `budgets` + §8).
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Tout chiffre = unités de quota, jamais $/€.
Sanitize (regex secrets/PII/internal): 5/5 sources clean. `@anthropic-ai/sdk`: absent des sources.

---

## agent-payment-x402
- **décision**: reject
- **raison**: pure machinerie de paiement crypto autonome (x402, wallets non-custodiaux, clés privées `WALLET_PRIVATE_KEY`, ERC-4337, Base/X Layer, `npx agentwallet-sdk`). C'est §5 `risk: blocking` (paiement sortant) et frôle §11. La seule lentille transférable — plafonds de dépense per-task/per-session, fail-closed, allowlist — on la possède déjà (table `budgets` + TOKEN_STRATEGY §3/§8 + gate §5). Ce qui reste d'unique est le binding paiement lui-même, que MAOS ne doit jamais coder.
- **dedup**: oui sur la partie sûre (budgets/limites = déjà chez nous); le reste = unsafe par construction.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: paiement crypto autonome (risk:blocking §5) + clés privées + `npx` non-épinglé exécutant du code tiers; lentille budget = dup-no-better. Re-audit: seulement si un futur domaine "finance/payment agent" est explicitement scopé en ROADMAP, et alors via `config/permissions.json` (déclaration de catégorie risquée), jamais en codant le paiement.

## agentic-engineering
- **décision**: adapt
- **raison**: doctrine opératoire agentic (done-criteria-first, décomposition unités 15 min, boucle eval-first capability+regression, routing 3 tiers escaladé sur reasoning-gap, stratégie de session, focus review sur invariants/auth/coupling). Recadré sur quota d'abonnement (§8), pas de cash.
- **dedup**: non — `mas-mission-planner` produit le DAG, ici on gouverne l'exécution+vérification de chaque nœud (boucle eval/regression, discipline coût absente de notre surface).
- **chemin library**: `packages/skills/library/agentic-engineering/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections = Prompt Defense Baseline + 7 §12, 0 `@anthropic-ai/sdk`, 0 secret). Prompt Defense Baseline présent — pilote l'exécution d'agents, correct.

## context-budget
- **décision**: adapt
- **raison**: audit *build-time* de la surface de prompt statique (agents/skills/MCP/rules/CLAUDE.md), inventaire + classification always/sometimes/rarely + top-3 économies. MCP = plus gros levier (~500 tokens/outil). Lentille distincte de TOKEN_STRATEGY.
- **dedup**: non — TOKEN_STRATEGY + `/tokens` = quota runtime par appel; ce skill audite le coût *fixe* de surface chargée. Cadrage explicite "quota ≠ surface" dans le corps.
- **chemin library**: `packages/skills/library/context-budget/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (ligne 1 = `---`, commentaire source, summary L1, metadata, 8 sections, 0 sdk, 0 secret). Prompt Defense Baseline présent.

## cost-aware-llm-pipeline
- **décision**: adapt (recadrage lourd)
- **raison**: lentille pipeline LLM quota-aware composable — route-by-complexity, budget-avant-appel fail-closed, narrow-retry (transient only), prompt-caching ≥60%, tracking immutable. Source d'origine framée en $ + import SDK direct: machinerie strippée, lentille gardée.
- **dedup**: chevauche TOKEN_STRATEGY (§2/§3/§7/§8) + router-core déjà construit, MAIS la composition (immutable tracker + narrow-retry + caching comme doctrine) est réutilisable. Tout réancré sur l'unique injection point `packages/core/llm.ts`, quota units, §11.
- **chemin library**: `packages/skills/library/cost-aware-llm-pipeline/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (ligne 1 = `---`, commentaire source, summary L1, metadata, 8 sections, 0 secret). Mentions `@anthropic-ai/sdk` = uniquement des **règles d'interdiction** (corps/red-flags/verification) le nommant pour l'interdire; AUCUN import (pas de forme quote/require/import()) → lint guard non déclenché. Prompt Defense Baseline présent.

## cost-tracking
- **décision**: reject
- **raison**: lit `~/.claude-card-tracker/usage.db` (DB communautaire externe HORS repo) et rapporte des dépenses en $ avec `cost_usd`. Contredit §11 (abonnement, pas de chiffres €/$, télémétrie en `quota_units` pas `cost_usd`) et §8 (état MAOS vit dans `data/`, pas dans un `~/.claude-cost-tracker` tiers). La lentille reporting d'usage, on la possède déjà via `events` + `/tokens`.
- **dedup**: oui — dup-no-better de `/tokens` + télémétrie `events` (§9), en plus framé cash.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: framing per-token cash (§11) + dépendance à une DB/hook externe hors `data/` (§8) + dup-no-better. Re-audit: non (conflit structurel avec le modèle d'abonnement).
