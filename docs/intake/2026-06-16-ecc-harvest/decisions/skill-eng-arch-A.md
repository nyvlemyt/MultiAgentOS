# ECC Harvest — décisions cluster `skill:eng-arch` (lot A)

Doer: lot eng-arch A (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2, library, deep-boost).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Plusieurs agents voisins existent (Backend Architect, Database Optimizer, Codebase Onboarding Engineer, Brand Guardian) mais AUCUN skill `.claude/skills/` couvrant ces lentilles — un agent est un exécutant, un skill est la doctrine réutilisable injectable. Pas de dup-skill.
Recadrage transverse: MAOS = abonnement (§11), tout chiffre = unités de quota jamais $/€; `@anthropic-ai/sdk` jamais importé. Projet externe read-only par défaut (§8); DDL destructif + frontières auth = §5 gated.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 8/8 sources clean. Seul hit = `api-design` ligne 307 `X-API-Key: sk_live_abc123` → placeholder d'exemple de doc, neutralisé/illustratif dans la version boostée (jamais une vraie clé). 0 import SDK dans les 8 sources.

---

## api-design
- **décision**: adopt
- **raison**: arsenal REST déterministe (nommage ressources, sémantique status codes, enveloppes data/error, pagination cursor/offset, filtrage/tri, frontières auth, rate-limit headers, versioning). Lentille contrat HTTP, complémentaire de backend-patterns (couches serveur) et mas-sec-reviewer (abus). Recadré §5 (auth = risque), placeholder secret neutralisé.
- **dedup**: non — agent Backend Architect existe mais aucun skill REST-contract; pas de chevauchement skill.
- **chemin library**: `packages/skills/library/api-design/SKILL.md`
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline + 7 sections §12, 0 import SDK, 0 secret réel).

## backend-patterns
- **décision**: adapt
- **raison**: doctrine de couches serveur (repository/service/middleware), anti-N+1 par batch+Map, sélection colonnes, cache-aside+TTL+invalidation, transactions, error-handler centralisé, retry-backoff transient-only, JWT+RBAC, job queues, logs structurés. Exemples Supabase/Redis = illustratifs, lentille gardée vendor-agnostique. Cadrage rate-limit "store partagé jamais compteur in-process" conservé.
- **dedup**: non — chevauche api-design en surface (section API) mais ajoute tout le layering interne absent de notre surface; complémentaire, pas dup.
- **chemin library**: `packages/skills/library/backend-patterns/SKILL.md`
- **état**: boosté, conforme (8 sections, recadré §5 auth, 0 import SDK, 0 secret).

## blender-motion-state-inspection
- **décision**: adopt
- **raison**: skill domaine 3D fort et unique — diagnostic facts-first des assets animés Blender (axes, bones, contacts, scale-drift, foot-slide, imports miroir/inversés) avant screenshots. Spécificité domaine ≠ motif de reject (barre large). Exécution 100% locale (`blender --background ... --python`), `bpy` hors Python système, aucun egress tiers.
- **dedup**: non — aucun équivalent dans nos assets.
- **chemin library**: `packages/skills/library/blender-motion-state-inspection/SKILL.md`
- **état**: boosté, conforme (8 sections, note tooling = script lit le `.blend` local sans réseau, 0 import SDK, 0 secret).

## blueprint
- **décision**: adapt
- **raison**: générateur de plan de construction cold-start multi-session/multi-agent (chaque step = brief auto-contenu, graphe de dépendances, détection parallèle, gate de review adversariale, protocole de mutation). Artefact Markdown pur, aucun side-effect à l'install. Recadré: tiers modèle → routing 3-tiers (TOKEN_STRATEGY §2), steps touchant action risquée → gate humain §5, scope hors-phase → backlog §10.
- **dedup**: non — distinct de `mas-mission-planner` (qui décompose une mission *runtime* en DAG typé); ici planification *build-time* multi-PR. Sections install/git-remote/vendoring de l'upstream strippées (machinerie de distribution ECC, hors-sujet MAOS).
- **chemin library**: `packages/skills/library/blueprint/SKILL.md`
- **état**: boosté, conforme (8 sections, frontière vs mission-planner explicite, 0 import SDK, 0 secret).

## brand-voice
- **décision**: adapt
- **raison**: profilage de voix d'écriture source-dérivé réutilisable (priorité sources réelles, extraction de features opérationnelles, bloc VOICE PROFILE, hard-bans de tropes IA). Lentille réutilisation > re-dérivation. Recadré: fetch live de posts = optionnel + contenu untrusted (baseline), persistance d'un fingerprint personnel seulement avec consentement explicite, jamais repo-tracked sans demande.
- **dedup**: non — `brand-guidelines` = identité *visuelle*; ici identité *écrite*. Références ECC-self (`x-api`, landing ECC, downstream `content-engine`/`crosspost`) généralisées/strippées.
- **chemin library**: `packages/skills/library/brand-voice/SKILL.md`
- **état**: boosté, conforme (8 sections, garde-fous consentement/untrusted, 0 import SDK, 0 secret).

## code-tour
- **décision**: adopt
- **raison**: générateur d'artefacts CodeTour `.tour` (format `microsoft/codetour`) — walkthroughs persona-ciblés ancrés sur fichiers/lignes réels vérifiés, règle SMIG, arc narratif. Read-only strict (ne modifie jamais le source). Valeur claire pour onboarding/PR/RCA/security tours.
- **dedup**: non — distinct de `codebase-onboarding` (guide prose + CLAUDE.md) et de `mas-context-manager` (pack runtime). Renvois croisés explicites.
- **chemin library**: `packages/skills/library/code-tour/SKILL.md`
- **état**: boosté, conforme (8 sections, anchors-vérifiés/never-guess, 0 import SDK, 0 secret).

## codebase-onboarding
- **décision**: adapt
- **raison**: analyse 4-phases d'un codebase inconnu → guide d'onboarding scannable + CLAUDE.md starter. Recadré §8 fort: projet externe read-only par défaut, le CLAUDE.md généré atterrit *dans le projet analysé* avec l'intention user, JAMAIS le CLAUDE.md racine MAOS, jamais de copie du projet dans le repo MAOS.
- **dedup**: non — agent Codebase Onboarding Engineer existe (exécutant) mais aucun skill-doctrine; complémentaire de code-tour (artefact `.tour`) et mas-context-manager (pack ≤4k runtime).
- **chemin library**: `packages/skills/library/codebase-onboarding/SKILL.md`
- **état**: boosté, conforme (8 sections, garde-fou §8 sur la cible CLAUDE.md, 0 import SDK, 0 secret).

## database-migrations
- **décision**: adopt
- **raison**: doctrine de sécurité des changements de schéma prod (migrations forward-only immuables, séparation DDL/DML, colonnes nullable/default, index CONCURRENTLY, rename expand-contract, backfill batché SKIP LOCKED, zero-downtime expand/migrate/contract) — Prisma/Drizzle/Kysely/Django/golang-migrate. Drizzle = notre ORM réel. Recadré: DDL destructif (`DROP`/transform irréversible) = action §5 risk-gated avec validation humaine.
- **dedup**: non — agent Database Optimizer = perf/indexing runtime; ici sécurité du *changement* de schéma. Pas de chevauchement.
- **chemin library**: `packages/skills/library/database-migrations/SKILL.md`
- **état**: boosté, conforme (8 sections, gate §5 sur DROP, Drizzle mis en avant, 0 import SDK, 0 secret).
