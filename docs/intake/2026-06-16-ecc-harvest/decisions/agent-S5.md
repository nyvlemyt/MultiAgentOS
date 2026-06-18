# ECC Harvest — décisions agents lot S5 (singletons, phase C)

Doer: lot S5 (6 agents singletons). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit` complet, un passage par agent (singletons distincts, pas un cluster).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/agents/library/<name>.md` (Tier B, format fiche MAOS).
Dedup HARD contre nos fiches Tier A (`reviewer`, `sec-reviewer`, `mission-planner`, `context-manager`, `memory-keeper`, `skill-router`, `quality-controller`), contre la library déjà adoptée (notamment `code-simplifier`, `language-reviewer`, `code-explorer`, `architect`, `code-architect`), ET contre les skills moissonnées (`tdd-workflow`, `seo`, `superpowers:test-driven-development`).
Recadrage transverse: MAOS = abonnement (§11) — tout chiffre = quota units, jamais $/€. Exécution/egress externe non-épinglé strippé (§5). Règle ≤7 outils/agent appliquée.
Sanitize: 6/6 sources clean (pas de secret/PII), `@anthropic-ai/sdk` absent des sources.

---

## refactor-cleaner
- **décision**: adapt
- **raison**: spécialiste suppression de code mort — exports/fichiers/dépendances inutilisés (knip, ts-prune, depcheck) + consolidation de duplicats, par lots sûrs avec tests entre chaque. Agent d'exécution propre, lentille « delete-the-unused » distincte.
- **dedup**: résolu vs `code-simplifier` (S1, déjà adopté). Frontière nette écrite dans la fiche : simplifier RÉÉCRIT le code gardé pour la clarté (comportement préservé, diff récent uniquement) ; cleaner SUPPRIME ce que rien ne référence et fusionne les duplicats sur tout le repo. Lentilles complémentaires, pas un doublon — on garde le delta « détection-double-preuve + lots + consolidation ». Chevauche la skill `simplify` mais l'agent est l'exécutant de la suppression, pas la doctrine.
- **chemin library**: `packages/agents/library/refactor-cleaner.md`
- **état**: keeper écrit. Tier B, model sonnet. Second keeper du projet avec `fs_write: scoped` (Edit + suppression de fichier bornée au sandbox). Bash durci read-only : détection (knip/ts-prune/depcheck) + grep + test du projet seulement ; jamais `rm`/`git reset`/`push`/install (§5). ≤7 outils (Read, Edit, Grep, Glob, Bash). Discipline ajoutée : double-preuve (tool + grep dynamic-import) avant toute suppression, API publique/entry-point gardés sauf confirmation explicite.

## seo-specialist
- **décision**: adapt
- **raison**: audit SEO technique (crawl/index, robots/canonicals, métadonnées, JSON-LD, Core Web Vitals, cannibalisation) → plan de remédiation rangé par sévérité, avec file:line/URL + fix exact. Vertical hors-produit mais fort-dans-son-domaine et auto-suffisant → gardé sous la barre LARGE de la campagne (la spécificité domaine n'est PAS un motif de reject).
- **dedup**: non — aucune fiche/skill MAOS ne porte le SEO ; chevauche la skill `seo` déjà adoptée (`packages/skills/library/seo`) mais l'agent est le consommateur du workflow (auditeur), pas la doctrine : complémentaire, référencé pour les audits profonds.
- **chemin library**: `packages/agents/library/seo-specialist.md`
- **état**: keeper écrit. Tier B, model sonnet. Egress STRIPPÉ (§5) : `WebSearch`/`WebFetch` de la source retirés → read-only sans réseau (Read, Grep, Glob — 3 outils), `fs_write:false`. Audit borné au repo + assets de déploiement ; crawl live / API SEO tierce = hors scope explicite, escaladé jamais exécuté. Pas de pattern black-hat. Aucun chiffre cash.

## silent-failure-hunter
- **décision**: adapt
- **raison**: lentille review mono-focus sur l'intégrité des chemins d'erreur — catch vides, erreurs avalées en null/[], fallbacks masquants (`.catch(() => [])`), stack traces perdues, async non géré, absence de timeout/rollback. Forte et distincte, va plus profond sur l'erreur silencieuse qu'une passe généraliste.
- **dedup**: non — `reviewer` rend le verdict mission, `language-reviewer` parcourt un treillis par-langage ; aucun n'est le spécialiste « error-handling integrity ». Frontière écrite dans la fiche ; les avalages à portée sécurité (auth/validation) sont escaladés à `sec-reviewer`.
- **chemin library**: `packages/agents/library/silent-failure-hunter.md`
- **état**: keeper écrit. Tier B, model sonnet. Read-only (Read, Grep, Glob, Bash durci read-only : grep/cat/ls/find/git --no-pager — 4 outils), `fs_write:false` : propose, n'édite pas. Discipline ajoutée : distinguer un fallback délibéré/documenté d'un avalage accidentel, diff-scoped, impact downstream obligatoire dans chaque finding.

## spec-miner
- **décision**: adapt
- **raison**: extracteur de specs comportementales brownfield → liste plate de blocs Requirement (WHEN→THEN) / Invariant avec métadonnées AI-parseables (id/entities/enforced), stratégie token sample-and-expand, auto-bootstrap (pas de dépendance onboarding). Lentille distincte « code → spec baseline » que rien chez nous ne porte ; alimente revue, planification et tests downstream.
- **dedup**: non — `context-manager` produit un pack macro ≤4k tokens, `code-explorer` trace une feature, `code-architect` blueprinte une implémentation à venir ; aucun ne fige le comportement existant en assertions versionnées. Complémentaire.
- **chemin library**: `packages/agents/library/spec-miner.md`
- **état**: keeper écrit. Tier B. **Model downgrade opus→sonnet** : la source déclarait `opus`, mais l'extraction de spec est de la cognition normale (pas une décision d'architecture haut-risque) et §11 impose la discipline quota — sonnet par défaut. Troisième keeper avec `fs_write: scoped`, MAIS write borné au SEUL `openspec/specs/<capability>/spec.md` DANS le sandbox du projet actif (jamais hors-projet, jamais le repo MAOS, jamais `.env`/secrets — §5/§8) ; cible hors-sandbox = escalade. Bash durci read-only (scope/trace), jamais de mutation/install/réseau. ≤7 outils (Read, Grep, Glob, Bash, Write). Discipline source conservée : never-invent (uncertainty comments), flat-list, sample-and-expand.

## tdd-guide
- **décision**: reject (fold)
- **raison**: wrapper-rôle mince autour de la boucle Red-Green-Refactor + coverage 80% + edge cases. Toute sa substance existe déjà et en mieux chez nous : la skill canonique `superpowers:test-driven-development` (favorite_skill dans nos fiches) ET la skill library `tdd-workflow` déjà moissonnée (`packages/skills/library/tdd-workflow`, qui porte mocking + exemples framework). La source elle-même renvoie à `skill: tdd-workflow`. Son addendum « eval-driven (pass@1/pass@3, capability+regression) » est déjà couvert par la skill `agentic-engineering` moissonnée (boucle eval-first). Il ne reste AUCUN delta de rôle agent : un agent dont tout le contenu est une skill que nos exécutants chargent déjà = dup-no-better.
- **dedup**: oui — dup-no-better de `superpowers:test-driven-development` + `tdd-workflow` (skills). Le TDD est une **discipline-skill** que n'importe quel exécutant Tier B (code-simplifier, futurs builders) invoque via `required_skills`, pas un agent dédié.
- **chemin library**: aucun (T0).
- **état**: rejeté/fold. KILL: dup-no-better — substance entièrement absorbée par deux skills déjà adoptées ; pas de delta de rôle ; un agent-wrapper de skill viole la parcimonie du roster (AGENTS.md, ≤7 outils ne sauve pas un agent vide de delta). La lentille TDD reste vivante via les skills, câblée en `favorite_skills`/`required_skills` des fiches exécutantes. Re-audit: seulement si un besoin d'**orchestration TDD multi-étapes** (qui dépasse l'invocation d'une skill — ex. piloter une suite eval-driven sur plusieurs modules en autonomie) émerge explicitement ; alors auditer ce delta-là, pas le wrapper.

## type-design-analyzer
- **décision**: adapt
- **raison**: lentille review mono-focus « make illegal states unrepresentable » — score un type sur 4 dimensions (encapsulation, expression d'invariants, utilité, enforcement). Distincte et forte : c'est la correction-par-le-type, qu'une passe généraliste n'effleure pas.
- **dedup**: non — `reviewer` rend le verdict mission, `language-reviewer` couvre idiome/sécurité/perf par-langage ; aucun ne juge la conception de types comme outil de correction. Frontière écrite dans la fiche ; les faiblesses à portée trust-boundary sont escaladées à `sec-reviewer`.
- **chemin library**: `packages/agents/library/type-design-analyzer.md`
- **état**: keeper écrit. Tier B, model sonnet. Read-only (Read, Grep, Glob — 3 outils), `fs_write:false` : score + suggère, ne refactore pas. Discipline ajoutée : lisibilité = contrainte (pas de gymnastique de types), distinguer une faiblesse d'un trade-off délibéré documenté.

---

## Bilan lot S5
6 audités → **5 keepers** (adapt: refactor-cleaner, seo-specialist, silent-failure-hunter, spec-miner) + **1 reject/fold** (tdd-guide).
Keepers écrits sous `packages/agents/library/`. Tous Tier B, model sonnet, ≤7 outils, Prompt Defense Baseline + Principles (commentaire source `// pattern from affaan-m/ecc`) + Process + Red Flags + Verification Criteria. Recadrage §11 (quota, pas de $/€) et §5 (egress strippé sur seo-specialist ; write borné au sandbox sur spec-miner ; suppressions non-destructives gatées sur refactor-cleaner). Re-audit campagne: à la prochaine passe self-audit de phase, ou si une source ECC > 6 mois sans maj.
