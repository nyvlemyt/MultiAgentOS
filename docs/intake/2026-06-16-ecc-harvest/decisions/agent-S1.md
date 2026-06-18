# ECC Harvest — décisions agents lot S1 (singletons, phase C)

Doer: lot S1 (7 agents singletons distincts). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit` complet, un passage par agent (ce sont des singletons distincts, pas un cluster).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/agents/library/<name>.md` (Tier B, format fiche MAOS).
Dedup HARD contre nos fiches Tier A (`reviewer`, `sec-reviewer`, `mission-planner`, `context-manager`, `memory-keeper`, `skill-router`, `quality-controller`) ET contre les skills déjà moissonnées (agentic-engineering, agent-self-evaluation).
Recadrage transverse: MAOS = abonnement (§11) — tout chiffre = quota units, jamais $/€. Exécution/egress externe non-épinglé strippé (§5). Règle ≤7 outils/agent appliquée.
Sanitize: 7/7 sources clean (pas de secret/PII), `@anthropic-ai/sdk` absent des sources.

---

## a11y-architect
- **décision**: adapt
- **raison**: architecte accessibilité WCAG 2.2 (POUR, focus appearance, target size 24/44px, ARIA, native SwiftUI/Compose) + template ADR-ACC. Aucune surface a11y chez nous : ni fiche Tier A, ni skill. Comble un trou réel du gate UX (AGENTS.md §4 `ux-critic` futur n'a pas la profondeur WCAG).
- **dedup**: non — `reviewer` review le code, `quality-controller` les règles process ; aucun ne porte la doctrine WCAG. Pas de chevauchement avec une skill existante.
- **chemin library**: `packages/agents/library/a11y-architect.md`
- **état**: keeper écrit. Tier B, model sonnet (cognition normale, pas d'exécution risquée). Recadré : produit specs + diffs contre le projet externe (jamais d'écriture hors sandbox §5/§8) ; sortie code uniquement quand la tâche le valide (Prompt Defense Baseline). ≤7 outils (Read, Write, Edit, Grep, Glob).

## agent-evaluator
- **décision**: adapt
- **raison**: note la SORTIE d'un agent sur 5 axes (accuracy/completeness/clarity/actionability/conciseness) avec scorecard structurée + verdict deliver/fix/redo. Lentille méta-éval distincte : c'est le grader de la boucle eval-first (cluster CORE eval/verify) et le gate qualité-sortie des modes autonomes (autopilot rend compte).
- **dedup**: non — `reviewer` juge la correction du CODE/diff, `quality-controller` juge le PROCESS/RÈGLES ; aucun ne score la qualité du livrable agent sur un rubric. Chevauche la skill `agent-self-evaluation` (qui porte le rubric) mais l'agent est le consommateur du rubric, pas le rubric : complémentaire, pas dup.
- **chemin library**: `packages/agents/library/agent-evaluator.md`
- **état**: keeper écrit. Tier B, model sonnet. Bash durci read-only (grep/cat/ls/find + git --no-pager) pour vérifier les claims ; jamais d'écriture/exec mutant (§5). ≤7 outils (Read, Grep, Glob, Bash). Référence au rubric recadrée sur notre skill `agent-self-evaluation` moissonnée.

## architect
- **décision**: adapt
- **raison**: design système greenfield + analyse de trade-offs + authoring ADR (template + statut + alternatives considérées). Mappe le rôle Tier A `architect` planifié (AGENTS.md §4 : domain modelling, ADR authoring) qui n'est pas encore construit ; ici on en pose la version Tier B callable.
- **dedup**: partiel et résolu. vs `mission-planner` : non (planner = DAG de tâches, architect = design système + ADR, lentilles orthogonales). vs `code-architect` : frontière nette — `architect` = conception greenfield/abstraite + décision documentée (ADR), `code-architect` = blueprint qui ÉPOUSE un codebase existant. Le boilerplate générique (checklists scalabilité 10K→10M, exemple SaaS marché) est strippé ; on garde la discipline ADR + trade-off table, qui est le vrai delta.
- **chemin library**: `packages/agents/library/architect.md`
- **état**: keeper écrit. Tier B, model opus (décision d'architecture = haut-risque cognitif, §3 task de l'énoncé). Read-only (Read, Grep, Glob — 3 outils) : propose, n'exécute pas. Recadré sur la stack MAOS verrouillée (CLAUDE.md §2) ; toute dérive de framework exige un ADR (§7). Pas de chiffrage cash.

## chief-of-staff
- **décision**: reject
- **raison**: machinerie de triage multi-canal (email/Slack/LINE/Messenger) qui ENVOIE des messages, drafte des réponses, pousse en git, et pilote des CLI externes non-épinglés (`gog gmail send`, `calendar-suggest.js`, MCP Slack `conversations_add_message`). C'est §5 `risk: blocking` (envois sortants, messages) + egress multi-hôte + exécution tierce non-épinglée + `git push` automatisé. Mappe le rôle « Email Automation Agent » explicitement classé *later, on demand* (AGENTS.md §5) → hors phase. La seule lentille transférable (triage 4-tiers, "hooks over prompts" pour enforcement déterministe) est notée mais l'agent lui-même est de l'outbound-send que MAOS ne doit pas coder maintenant.
- **dedup**: sans objet — keeper unsafe par construction, pas une question de doublon.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: envois sortants/messages = `risk: blocking` (§5) + CLI/MCP externes non-épinglés exécutant des effets + `git push` auto ; hors phase (AGENTS.md §5 « later, on demand »). Re-audit: seulement si un domaine « Email/Comms Automation Agent » est scopé en ROADMAP, et alors via `config/permissions.json` (déclaration de catégorie risquée + gate humain), jamais en codant l'envoi en dur. Lentille « hooks > prompts » à reverser éventuellement dans la doctrine d'enforcement, séparément.

## code-architect
- **décision**: adapt
- **raison**: blueprint d'implémentation qui ÉPOUSE le codebase existant — analyse des patterns/conventions en place, design qui s'y insère, liste fichiers à créer/modifier + data-flow + séquence de build par dépendance (types→core→intégration→UI→tests→docs). Lentille brownfield concrète, directement utile au dispatcher MAOS.
- **dedup**: non — frontière nette vs `architect` (greenfield/ADR abstrait) et vs `mission-planner` (DAG de tâches, pas de blueprint fichier-par-fichier). C'est le pont entre le plan et l'exécution Tier B.
- **chemin library**: `packages/agents/library/code-architect.md`
- **état**: keeper écrit. Tier B, model sonnet (cognition normale). Read-only (Read, Grep, Glob, Bash durci read-only — 4 outils) : produit un blueprint, n'écrit pas. Bash limité à l'inspection (grep/ls/find/git --no-pager), jamais d'exec mutant (§5).

## code-explorer
- **décision**: adapt
- **raison**: investigateur read-only qui trace les chemins d'exécution d'une feature précise (entry points → call chain → couches → patterns → dépendances) et en rend une carte. Granularité « per-feature deep-trace » utile avant toute modif Tier B, et avant un blueprint code-architect.
- **dedup**: non — `context-manager` produit un PACK projet ≤4k tokens (vue macro, rafraîchie sur drift) ; code-explorer fait du trace micro ciblé d'une zone, à la demande. Lentilles complémentaires (macro vs trace ciblée), pas un doublon.
- **chemin library**: `packages/agents/library/code-explorer.md`
- **état**: keeper écrit. Tier B, model sonnet. Strictement read-only (Read, Grep, Glob — 3 outils), aucune écriture/exec. Sortie = carte d'exploration + recommandations follow/reuse/avoid.

## code-simplifier
- **décision**: adapt
- **raison**: refactor de clarté/cohérence/maintenabilité À COMPORTEMENT PRÉSERVÉ, ciblé sur le code récemment modifié (extraction de logique imbriquée, early returns, async/await, suppression de dead code/console.log, déduplication). Agent d'exécution propre, lentille « simplify-only, no behavior change » qu'on n'a pas en fiche.
- **dedup**: non — nos fiches Tier A ne refactorent pas ; `reviewer`/`quality-controller` jugent mais n'éditent pas. Chevauche la skill `simplify` mais l'agent est l'exécutant qui applique, complémentaire.
- **chemin library**: `packages/agents/library/code-simplifier.md`
- **état**: keeper écrit. Tier B, model sonnet. C'est le seul keeper du lot avec `fs_write: scoped` + Edit/Write (exécution) — borné au sandbox projet, jamais d'op destructrice (rm/reset) qui resterait gatée §5. ≤7 outils (Read, Write, Edit, Grep, Glob, Bash durci read-only pour vérifier la non-régression). Discipline ajoutée : ne touche que le diff récent, vérifie l'équivalence comportementale avant de rendre.
