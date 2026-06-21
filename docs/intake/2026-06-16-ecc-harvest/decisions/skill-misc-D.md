# ECC Harvest — décisions cluster `skill:misc` (lot D)

Doer: lot misc-D (8 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (cluster misc = « gems + a few rejects », CLUSTERS.md). Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Recadrage transverse: MAOS = abonnement (§11), AUCUN coût per-token PAYG; tout chiffre = unités de quota, jamais $/€.
**Lentille §5 (gate)**: tout skill dont le cœur EST l'action sortante risquée (envoi/paiement/publication outbound, API tierce live) → REJECT si rien d'autre, ou ADAPT en strippant l'exécution si une lentille d'analyse/structure transférable subsiste. La machinerie d'exécution sortante n'est jamais codée ici — elle reste gated via `config/permissions.json` + §5.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 8/8 sources clean. Aucun import SDK; les sources nommant Stripe/x-api/ethereum le font en prose (guardrails/exemples), pas en import exécutable. Mentions strippées ou recadrées en règles d'interdiction.

Bilan: **7 keepers** (5 adopt + 2 adapt) · **1 reject**.

---

## api-connector-builder
- **décision**: adopt
- **raison**: lentille « intégration repo-native » — ajouter le Nième connecteur/provider/plugin en copiant le pattern existant du repo (layout, config, auth, error-handling, registry wiring, tests) au lieu d'inventer une 2e architecture. Réutilisable pour étendre `packages/agents`, une surface MCP ou une liste de providers. Recadré §5: l'authoring du connecteur ≠ l'exécution d'un appel sortant (action gated), distinction explicite dans le corps.
- **dedup**: non — aucun skill/agent existant ne porte la discipline « match the house style » des intégrations. `mcp-builder` construit un serveur MCP from scratch; ici on conforme un connecteur à un pattern repo préexistant.
- **chemin library**: `packages/skills/library/api-connector-builder/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections Overview→Verification). 0 import SDK, 0 secret.

## article-writing
- **décision**: adopt
- **raison**: doctrine d'écriture long-form — concret d'abord, preuve plutôt qu'adjectifs, jamais de fait inventé, voix capturée une fois (VOICE PROFILE) et réutilisée, bans sur le throat-clearing IA. Sert les livrables écrits user-facing.
- **dedup**: non — `doc-coauthoring` est un WORKFLOW de co-rédaction de docs techniques/specs; `internal-comms` cible les comms internes formatées. Ici = voix/structure/crédibilité d'articles/essais/newsletters publics. Recadré §6: jamais pour la prose interne agent-à-agent (eco mode).
- **chemin library**: `packages/skills/library/article-writing/SKILL.md`
- **état**: boosté §12 conforme. 0 import SDK, 0 secret.

## competitive-platform-analysis
- **décision**: adopt
- **raison**: gem flaggé (CLUSTERS.md §Misc gems). Lentille de cadrage du set concurrentiel AVANT tout scoring — positioning brief d'abord, axes génériques (pas de buckets de niche), tiers Direct/Adjacent/Aspirational, règle des 2 sources, pré-filtre 1–5. Premier des 3 skills du pipeline concurrentiel.
- **dedup**: non — l'agent `Trend Researcher` porte le RÔLE (market intelligence); ce skill porte la MÉTHODE reproductible de scoping. Complémentaire, pas dup.
- **chemin library**: `packages/skills/library/competitive-platform-analysis/SKILL.md`
- **état**: boosté §12 conforme. 0 import SDK, 0 secret.

## competitive-report-structure
- **décision**: adopt
- **raison**: gem flaggé. Lentille d'assemblage rapport décision-grade — 8 sections, organisé autour de la tension stratégique, matrice heatmap SANS colonne total agrégé (faux composite), recommandations recalées sur le brand balance, appendix auditable. Dernier des 3 skills du pipeline.
- **dedup**: non — distinct du scoping (`competitive-platform-analysis`) et du rôle `Trend Researcher`. Donne la colonne vertébrale reproductible du livrable.
- **chemin library**: `packages/skills/library/competitive-report-structure/SKILL.md`
- **état**: boosté §12 conforme. 0 import SDK, 0 secret.

## content-engine
- **décision**: adopt
- **raison**: gem flaggé. Système de contenu platform-native — source-first, adapt-format-not-persona, une claim par post, VOICE PROFILE réutilisée, flow de repurposing 3–7 claims atomiques. Recadré §5: authoring uniquement; la dépendance source à `x-api` (publication X) est strippée et la publication renvoyée à un step outbound gated.
- **dedup**: non — `article-writing` = long-form; ici = social/short-form/multi-plateforme. Complémentaire (cross-référencé).
- **chemin library**: `packages/skills/library/content-engine/SKILL.md`
- **état**: boosté §12 conforme. 0 import SDK, 0 secret. Mentions `x-api` reframées en « publish = action §5-gated, hors scope ».

## crosspost
- **décision**: adapt
- **raison**: lentille d'adaptation multi-plateforme (une idée → versions natives distinctes X/LinkedIn/Threads/Bluesky, jamais de copie identique, voix préservée). Le cœur ECC mêlait adaptation ET publication via `x-api`. **§5**: la publication/distribution outbound est strippée; seule la lentille d'adaptation/authoring est gardée, l'ordre de publication devient un *conseil*, pas un schedule exécuté.
- **dedup**: non — `content-engine` shape la voix/source; `crosspost` porte spécifiquement l'adaptation per-contrainte de plateforme. Cross-référencé.
- **chemin library**: `packages/skills/library/crosspost/SKILL.md`
- **état**: boosté §12 conforme, exécution outbound strippée (adapt). 0 import SDK, 0 secret.

## customer-billing-ops
- **décision**: reject
- **raison**: le cœur EST l'opération de billing sortante exécutée via Stripe — refunds, cancellations, recovery de portail, mutation d'état d'abonnement client. C'est §5 `risk: blocking` (paiement/remboursement sortant, mutation revenue-impacting sur un système tiers). MAOS ne doit jamais coder la machinerie d'exécution paiement/billing (cf. exemplar `agent-payment-x402` rejeté pour la même raison). La seule lentille résiduelle transférable — la table de triage « classifier le cas avant d'agir » — est un raisonnement support générique de faible réutilisation, non distinctif, ne justifiant pas un keeper. Risque additionnel: induit l'usage d'un outil Stripe connecté (egress de données client tierces).
- **dedup**: oui sur la part sûre (raisonnement de classification = raisonnement support générique, déjà couvert conceptuellement par le bon sens des agents); le reste = unsafe par construction (§5 blocking).
- **chemin library**: aucun (T0).
- **état**: rejeté. **KILL**: exécution billing/paiement sortante (refund/cancel) = §5 risk:blocking + dépendance à un outil Stripe connecté (egress PII client tierce) + lentille résiduelle = dup-no-better/low-reuse. **Re-audit**: uniquement si un domaine « finance/billing agent » est explicitement scopé en ROADMAP, et alors via déclaration de catégorie risquée dans `config/permissions.json` (jamais en codant le paiement/refund).

## e2e-testing
- **décision**: adopt
- **raison**: patterns Playwright E2E — POM, déterminisme (auto-waiting locators vs timeouts arbitraires), `playwright.config` CI-aware, gestion d'artefacts, diagnostic/quarantine du flaky. Sert directement le check `pnpm --filter @mas/web smoke` (§7) et la doctrine de vérification.
- **dedup**: non — nos tests sont Vitest (§7, unit/intégration); aucun skill ne couvre l'E2E Playwright. Cadrage explicite « E2E ≠ unit (Vitest) ».
- **chemin library**: `packages/skills/library/e2e-testing/SKILL.md`
- **état**: boosté §12 conforme. **Stripped**: exemples « Wallet/Web3 » et « Financial/Trade execution » de la source (flux production-money) retirés; remplacés par une règle §5 « E2E ne pilote jamais de paiement/trade réel ». 0 import SDK, 0 secret.
