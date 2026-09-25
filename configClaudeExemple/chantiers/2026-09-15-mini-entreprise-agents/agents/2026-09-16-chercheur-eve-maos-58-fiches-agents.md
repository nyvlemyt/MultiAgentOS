# Rapport brut : inventaire décisionnel des 58 fiches d'agents MAOS, pour EVE

Agent : `chercheur-eve`. Lancé le 16/09/2026 au soir, axe A de l'audit du lot 2. Déposé tel quel. Lecture seule. **Note du fil** : l'agent a livré ce mémo complet puis a été coupé par une limite de session de l'abonnement (HTTP 429, « resets 2:30pm ») sur son dernier tour ; le contenu ci dessous est entier.

---

**Question.** Parmi les 58 fiches de `C:\dev\maos\.claude\agents\`, lesquelles couvrent les rôles que Melvyn demande pour EVE, lesquelles méritent une adaptation au format EVE, lesquelles se rejettent, avec la grille `intake-audit` et la règle de la barre large.

**Réponse en trois lignes.**
1. Les 58 fiches sont une bibliothèque externe (`msitarzewski/agency-agents`) importée en bloc le 24/05/2026 (commit `c11765a`, 57 fiches plus les deux documents NEXUS) et jamais modifiée depuis ; une seule fiche native MAOS a été ajoutée le 21/06/2026 (`security-defensive-specialist`). MAOS lui même a conclu le 03/06/2026 : « Ne pas importer directement (formats différents, le nôtre est plus économique en tokens) » (`docs/workflows/phase3-audit-report-2026-06-03.md` l. 228) et ne fait pas indexer ces fiches par son routeur (`AGENTS.md` l. 9).
2. **L'intelligence que Melvyn cherche n'est pas dans ces 58 fiches** : orchestrateur, planificateur, gardien de mémoire, gate sécurité et contrôleur qualité sont les 10 fiches Tier A de `packages/agents/fiches/` et les 6 skills `mas-*` (`AGENTS.md` l. 59 à 79), hors périmètre de cette mission et non lus en corps. Dans le dossier `agents/`, seul `nexus-strategy.md` décrit une orchestration, et ce n'est pas une fiche valide (aucun frontmatter).
3. Verdict sur 58 : 12 `adapt_now` (6 en T1 : `testing-reality-checker`, `security-defensive-specialist`, `engineering-security-engineer`, `project-manager-senior`, `nexus-strategy` en extrait, `project-management-project-shepherd` en gabarit ; 6 en T2), 4 `backlog_next`, 31 `watch`, 11 `reject`. **Aucune fiche n'est utilisable telle quelle** (`implement_now` = 0) : toutes exigent la traduction au format EVE.

## 1. Vue d'ensemble chiffrée

| Mesure | Valeur |
| --- | --- |
| Fiches par division | engineering 29, testing 8, design 8, project 6, product 5, security 1, nexus 1 = 58 |
| Documents non fiches | `EXECUTIVE-BRIEF.md` (95 l.), `QUICKSTART.md` (194 l.), sans frontmatter |
| Longueur | 16 855 lignes pour 58 ; médiane 236 ; min 70, max 1 110 (`nexus-strategy`) ; 26 fiches dépassent 300 lignes |
| Comparaison EVE | 5 fiches, 250 lignes au total (41 à 62 chacune) |
| Champ `name` | 57/58 ; les 57 valeurs contiennent espaces et majuscules alors que la doc exige minuscules et tirets |
| `description`, `color`, `emoji` | 57/58 chacun |
| `vibe` | 56/58 ; champ non documenté par Claude Code |
| `tools` | **4/58**, tous `WebFetch, WebSearch, Read, Write, Edit` ; les 53 autres héritent de tous les outils |
| `model` | 0/58 ; idem `permissionMode`, `maxTurns`, `disallowedTools`, `memory`, `skills`, `hooks` |
| `color` hors liste documentée | 19 fiches |
| Prompt Defense Baseline | 0/58 ; `intake-audit` l'exige verbatim sur tout agent adopté d'une source externe ; les 5 fiches EVE ne le portent pas non plus |
| Fiches mentionnant outil externe, clé, MCP ou exécution distante | 24/58 |
| Dépendances dures | facturation à l'usage au cœur : `autonomous-optimization-architect`, `trend-researcher`, `rapid-prototyper` ; runtime MAOS : `security-defensive-specialist` ; références à des fichiers absents : 7 fiches ; exécution distante non épinglée : `accessibility-auditor`, `security-engineer`, `rapid-prototyper` |
| Fiches au format MAOS (Principes sourcés, Processus, Rationalisations, Red flags, Vérification) | 1/58 : `security-defensive-specialist` |
| Défaut d'encodage | `mobile-app-builder` : 14 titres corrompus |

## 2. Table complète, condensée par décision

**adapt_now T1 (6)** : `testing-reality-checker` (verdict par défaut « NEEDS WORK », preuve exigée pour chaque affirmation, recoupement des findings du QA précédent avec droit de les contester, déclencheurs d'échec automatique ; mécanique web à retirer) ; `security-defensive-specialist` (seule fiche au format MAOS, posture défensif seulement, escalade explicite, preuves en lecture seule ; dépend du runtime MAOS) ; `engineering-security-engineer` (STRIDE, échelle Critical à Informational, liste de couverture recouvrant `PermanentToken`, `AuthBearer`, `insert_data`, `settings.py` ; retirer tout le code) ; `project-manager-senior` (citer la spec mot pour mot, ne rien ajouter de « premium », tâches de 30 à 60 min avec critères d'acceptation ; la plus courte des candidates) ; `nexus-strategy` en extrait (boucle Dev et QA avec 3 essais max §6.1, gabarits de handoff, retour QA et escalade §11, échec de gate §12.2, rapport d'état annexe B ; le reste sans objet) ; `project-management-project-shepherd` en gabarit (rapport d'état : statut avec raison, fait / prévu, problèmes et risques, décisions attendues).

**adapt_now T2 (6)** : `engineering-codebase-onboarding-engineer` (auditeur de l'existant : faits seulement, fichiers inspectés et non inspectés, aucune recommandation ; s'appuierait sur graphify) ; `engineering-minimal-change-engineer` (déjà source du format EVE ; apporte encore le « Scope Self-Check » et deux exemples chiffrés) ; `engineering-technical-writer` (Divio, « les exemples de code doivent s'exécuter », « la doc part dans la même PR ») ; `product-manager` en motifs (« Non-Goals », « Open Questions à résoudre avant le dev », pré mortem, « ce qu'on ne construit pas et pourquoi ») ; `testing-api-tester` en liste (par endpoint : sans jeton 401, entrée invalide 400 explicite, secret jamais renvoyé, compatibilité de contrat) ; `testing-evidence-collector` en fusion avec reality-checker (trouver des défauts par défaut, citer la spec exacte, décrire ce qu'on voit).

**backlog_next (4)** : `engineering-data-engineer` (règles ETL pour le rebranchement des scripts : idempotence, dérive de schéma qui alerte, zéro échec silencieux) ; `engineering-database-optimizer` (migrations réversibles, index des clés étrangères ; à transposer en SQL Server) ; `engineering-incident-response-commander` et `engineering-sre` (utiles à la mise en production ; à fusionner en une fiche « exploitation »).

**watch (31)** : tout le design (8), et l'engineering hors pile ou hors domaine (`ai-data-remediation`, `ai-engineer`, `backend-architect`, `cms-developer`, `devops-automator`, `email-intelligence`, `embedded-firmware`, `feishu`, `filament`, `frontend-developer`, `mobile-app-builder`, `solidity`, `threat-detection`, `voice-ai`, `wechat`), `product-behavioral-nudge-engine`, `product-feedback-synthesizer`, `product-sprint-prioritizer`, `project-management-experiment-tracker`, `project-management-studio-operations`, `testing-accessibility-auditor`, `testing-performance-benchmarker`, `testing-workflow-optimizer`.

**reject T0 (11)** : `engineering-autonomous-optimization-architect` (facturation à l'usage par objet) ; `engineering-code-reviewer` (doublon sans mieux de `relecteur-eve`, qui en dérive) ; `engineering-git-workflow-master` (`rebase -i`, `push --force-with-lease`, suppression de branche distante : quatre pratiques interdites par `git.md`) ; `engineering-rapid-prototyper` (SaaS à clés, `latest` non épinglé, analytique qui échoue en silence) ; `engineering-senior-developer` (« premium enhancement », contraire à `qualite.md`) ; `engineering-software-architect` (doublon d'`architecte-eve`) ; `product-trend-researcher` (outils payants au cœur) ; `project-management-jira-workflow-steward` (impose Jira, gitmoji, `feature/JIRA-ID`, contraire à `git.md`) ; `project-management-studio-producer` (coquille, métriques invérifiables) ; `testing-test-results-analyzer` (décoratif, RandomForest de prédiction) ; `testing-tool-evaluator` (doublon sans mieux d'`intake-audit`).

## 3. Candidates par rôle manquant à EVE

1. **Orchestrateur / chef de mission.** Aucune des 58 ne l'incarne : l'« Agents Orchestrator » est nommé dans `nexus-strategy.md` mais n'a pas de fichier. La doctrine opérationnelle existe dans `nexus-strategy.md` (§6.1, §11, §12.2, annexe B) et le gabarit de rapport d'état de `project-shepherd`. L'orchestrateur réel de MAOS est `packages/agents/fiches/orchestrator.md` (Tier A), avec `mission-planner` et `quality-controller`. **Recommandation : une mission de recherche dédiée sur ces trois fiches Tier A** avant d'écrire `chef-de-mission-eve`.
2. **Planificateur.** `project-manager-senior` (T1), plus les quatre motifs de `product-manager` et le Scope Self-Check de `minimal-change-engineer`. Le planificateur réel de MAOS est le skill `mas-mission-planner`.
3. **Auditeur de l'existant.** `codebase-onboarding-engineer` (T2). Pendant MAOS : `mas-context-manager`. La bibliothèque froide contient `code-explorer.md` et `spec-miner.md` (noms seulement).
4. **Testeur / Reality Checker.** `testing-reality-checker` (T1) fusionné avec `testing-evidence-collector`, plus la liste de `testing-api-tester`. Pendants MAOS : `quality-controller` et `mas-reviewer`, dont le principe « couverture plutôt que filtrage » entre en tension avec le plafond de 400 mots de `relecteur-eve` : **point à arbitrer par Melvyn**. La bibliothèque froide contient `silent-failure-hunter.md`, `pr-test-analyzer.md`, `gan-evaluator.md`.
5. **Relecteur de sécurité.** `security-defensive-specialist` (structure et posture) et `engineering-security-engineer` (STRIDE, échelle, liste). Pendant MAOS : `mas-sec-reviewer` et `sec-reviewer.md`.
6. **Gardien de mémoire.** Aucune des 58. Les sections « Learning & Memory » sont décoratives. Le gardien réel est le skill `mas-memory-keeper` et `memory-keeper.md`. Levier documenté côté Claude Code : le champ `memory` du frontmatter.
7. **Rapporteur / rédacteur de synthèse.** `engineering-technical-writer` (T2) pour la documentation ; pour la synthèse à Edmond, le rôle « Executive Summary Generator » de NEXUS (SCQA, 500 mots) n'a pas de fiche.

## 4. Ce que MAOS fait mieux, ce qu'EVE fait mieux

**MAOS (les 57 fiches agency) fait mieux sur** : des gabarits de livrables complets et réutilisables (rapport Reality Checker, retour QA et escalade, post mortem, ADR, Scope Self-Check) ; une posture par défaut explicite (« NEEDS WORK », « 3 à 5 défauts minimum ») ; des déclencheurs d'échec automatique plus binaires que les « Signaux d'alerte » d'EVE ; une doctrine de boucle (3 essais, escalade, gate keeper par phase) absente du pipeline EVE, qui est linéaire ; des exemples travaillés ; des phrases types par fiche.

**EVE fait mieux sur** : `tools` explicite et en moindre privilège 5/5 contre 4/58 ; des `name` en slug conformes ; des `description` qui disent quand déléguer ; une table de rationalisations et une vérification binaire 5/5 contre 1/58 ; des plafonds de longueur de rapport ; des chemins réels du projet contre des références pendantes ; zéro bloc de code ; l'ancrage dans des retours datés ; aucun emoji ; 50 lignes en moyenne contre 291. **Fait de provenance** : le format EVE a été écrit le 08/09/2026 d'après trois fiches MAOS et le format `skills-reference.md` ; c'est la discipline des skills MAOS appliquée à des agents, discipline que les 57 fiches agency n'ont jamais eue. **Le sentiment de Melvyn est donc exact pour la colonne vertébrale (Tier A, `mas-*`, boucle NEXUS, grille intake) et inexact pour la forme des fiches, qui vient bien de MAOS.**

## 5. Sanitize

Passage indépendant sur les 58 fiches et 2 documents : aucune clé, jeton, URL avec identifiants, JWT, clé privée. Trois valeurs factices d'exemple, tronquées. Trois emails sur `example.com`. Aucune IP privée, aucun chemin de profil. Références à des secrets de CI sous forme `${{ secrets.… }}`, références et non valeurs. Prompt Defense Baseline absent des 58 et des 5 fiches EVE. `mobile-app-builder` corrompu. **Verdict : PASS, aucun CRITICAL.**

## 6. Inconnues

1. Effet réel des `name` non slug et des `color` hors liste sur le chargement par Claude Code.
2. Corps des 10 fiches Tier A (`packages/agents/fiches/`) et des 6 skills `mas-*` : non lus en corps par cette mission ; **c'est là que vivent les rôles 1, 2, 5 et 6**.
3. Les 32 fiches froides de `packages/agents/library/` : noms seulement.
4. Doc Claude Code consultée via un résumé, non recoupée.

## 7. Sources

Les 58 fichiers de `C:\dev\maos\.claude\agents\` lus en entier, `EXECUTIVE-BRIEF.md`, `QUICKSTART.md` ; `C:\dev\maos\CLAUDE.md` (§5, §8, §11, §12), `AGENTS.md`, `intake-audit/SKILL.md`, les 6 `mas-*` (l. 1 à 30), `docs/knowledge/agent-patterns.md`, `docs/workflows/phase3-audit-report-2026-06-03.md`, `git log -- .claude/agents` ; EVE : les 5 fiches, `REGISTRE.md`, `CLAUDE.md`, les 5 règles ; public : `code.claude.com/docs/en/sub-agents`.
