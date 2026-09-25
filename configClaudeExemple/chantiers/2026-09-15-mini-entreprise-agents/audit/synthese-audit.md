# Synthèse de l'audit du lot 2 : ce qui existe, ce que MAOS sait, ce qu'on en fait

Écrit le 16/09/2026 au soir par le fil, à partir de six rapports d'agents déposés tels quels dans `../agents/` (deux `chercheur-eve` coupés par une limite de session après livraison complète). Chaque décision ci dessous cite le rapport dont elle vient : A (58 fiches), B (skills, commandes, hooks), C (doctrine et savoir), D (branches), E (dispositif EVE face à la vision), F (capacités du harnais). Grille appliquée : `intake-audit` de MAOS, lue en entier avant de lancer.

---

## 1. Le constat qui change la carte

**L'intelligence de MAOS que Melvyn cherche n'est pas dans les 58 fiches de `.claude/agents/`.** Ces 58 fiches sont une bibliothèque externe (`msitarzewski/agency-agents`) importée en bloc le 24/05/2026 et jamais modifiée. MAOS lui même a conclu le 03/06 : « ne pas importer directement, formats différents, le nôtre est plus économique en tokens », et son routeur ne les indexe pas (A). Sur 58, aucune n'est utilisable telle quelle ; 12 méritent une adaptation, 31 sont hors domaine, 11 se rejettent, dont 4 pour des pratiques interdites par `git.md` ou une facturation à l'usage (A).

**Elle est dans sept endroits, tous en texte, aucun ne dépendant du runtime TypeScript** (B, C) :

1. Les six skills `mas-*` (723 lignes) et `intake-audit` (114 lignes) : planificateur en DAG avec porte de revue finale, routage du modèle par risque, gestion du contexte, gardien de mémoire à écrivain unique, revue à verdict `PASS | NEEDS_WORK | BLOCK`, porte de sécurité `PASS | BLOCK`, grille d'entrée.
2. La doctrine `CLAUDE.md` de MAOS, §5 (actions toujours gardées), §6 (tokens), §8 (écrivain unique), §11 (abonnement seul, clé API = rejet), §12 (savoir obligatoire, <= 7 outils), §13 (pré-vol et self-audit).
3. **Les 10 fiches Tier A de `packages/agents/fiches/`** : `orchestrator`, `mission-planner`, `quality-controller`, `memory-keeper`, `sec-reviewer`, `agent-evaluator`, `architect`, et trois autres. **Elles n'ont pas été lues** : c'est là que vit le vrai orchestrateur, et c'est l'inconnue majeure de cet audit (A, C).
4. Les 22 fichiers de savoir de `docs/knowledge/`, dont 9 à lire avant toute fiche ou skill EVE : `agent-patterns`, `production-patterns` (boucle de correction bornée), `prompting-anthropic`, `skills-reference`, `claude-code-context-and-modes`, `vibeflow/agents-skills` (critère de succès en trois formes), `vibeflow/gouvernance`, `continuous-learning-and-memory-lifecycle`, `README` (C).
5. Les 13 dossiers d'intake et le ledger ECC : **1 296 ressources externes déjà tranchées** (1 050 intégrées, 244 rejetées), dont les shards Python et Django utiles à EVE. Du travail déjà payé, à ne pas refaire (C).
6. Le protocole doer, checker, orchestrateur de `docs/learning/` : sessions séparées, le fichier avant le terminal, le checker ne fait confiance à rien, « relancer les checks soi même », « lire le fichier du verdict, pas le retour du chat » (C).
7. `docs/workflows/commander-feedback-loop.md` : la revue du commandant après PASS, cinq destinations, « une idée n'est jamais jetée » (C).

**Ce qu'EVE a déjà pris de MAOS sans le dire** : le skill `explain-diff`, le format des cinq fiches (écrit d'après trois fiches MAOS et `skills-reference.md`), les seuils ECC de la gate, le style et le dashboard du §14, la charte. Le sentiment de Melvyn est donc exact pour la colonne vertébrale et inexact pour la forme (A, C).

**Ce qu'EVE fait mieux que MAOS** : `tools` borné sur 5 fiches sur 5 contre 4 sur 58 ; des verrous mécaniques sur git et les données là où MAOS n'applique son §5 que dans son runtime et n'a que trois hooks (taille, tokens, frontmatter) ; la trace (journal, attaques vérifiées ligne à ligne, fixtures transcrites) ; le quiz explain-diff ; la confidentialité des données (A, C, E).

## 2. Le dispositif EVE, tel qu'il est ce soir (E)

Le socle est réel, testé, petit à dessein : 58 tests, 13 contrôles `doctor`, barrière commit prouvée sur un sous agent, un tiers du dispositif est du verrou. Mais quatre affirmations du lot 1a ne laissaient aucune trace vérifiable : les rapports bruts d'agents (0 fichier pour 20 lancements, rattrapé ce soir pour 11 d'entre eux), le compte des messages, la mise à jour de `PLAN.md` et `INDEX.md`, et la doctrine « corrigée avant les fixtures » alors que les sous agents reçoivent le `CLAUDE.md` figé au démarrage de session. Cinq rôles sur neuf n'ont ni fiche ni skill : planificateur, auditeur, testeur, sécurité, mémoire. `developpeur-eve` n'est branché à aucune commande. `model` est absent partout. Aucun hook `SubagentStart` ni `SubagentStop`.

**Trous de sûreté trouvés par l'audit, à lever par sonde puis TDD** : aucune garde d'écriture sur `.env`, `.env.dev1`, `token_api.txt` (grep négatif dans les trois gardes, C) ; `revue.md:25` appelle un skill `security-review` qui n'existe pas comme skill, c'est une commande intégrée (B) ; `plan.md` du chantier porte le chemin complet du profil Windows (B) ; `chantier.md:41` dit encore que l'implémentation se fait dans le fil (E).

## 3. Le harnais : ce qu'on n'utilise pas (F)

Nos fiches n'utilisent que trois champs sur une quinzaine. Documentés et inutilisés : `model`, `effort`, `memory` (une mémoire propre par agent), `skills` (une boîte à outils préchargée par rôle), `hooks` (des verrous propres à un agent), `disallowedTools`, `maxTurns`, `isolation: worktree`, `permissionMode`. Une trentaine d'événements de hooks dont `SubagentStart`, `SubagentStop`, `Stop` (peut bloquer), `PreCompact`, `FileChanged`, `InstructionsLoaded`. Un hook peut injecter du contexte (`additionalContext`) et modifier une entrée d'outil (`updatedInput`). Les agent teams (expérimental) : liste de tâches partagée, messagerie par nom. Les skills : `context: fork`, `paths:`. Les règles : `.claude/rules/*.md` à portée de chemin. **Limite documentée** : pas de porte d'approbation native entre agents, pas de relecture du rapport d'un agent par un hook ; l'orchestration des approbations reste au fil.

## 4. La table des décisions

Cinq valeurs, tiers T0 rejet, T1 colonne vertébrale, T2 arsenal. Une ligne par pièce retenue ou notable.

| Pièce | Source | Décision | Tier | Ce que ça devient dans EVE |
| --- | --- | --- | --- | --- |
| `intake-audit` | B, C | adapt_now | T1 | `REGISTRE.md` porté au format : 5 valeurs, 3 coûts, KILL, tiers, sanitize étendu à `D:\Users\`, Prompt Defense Baseline sur toute fiche externe ; un dossier par candidat dans `chantiers/<chantier>/intake/` |
| Doctrine §5 | C | adapt_now | T1 | `garde_perimetre` refuse l'écriture sur `.env*` et `token_api.txt`, en TDD, après sonde |
| Doctrine §11 | C | adapt_now | T1 | `securite.md` : clé API ou facturation à l'usage = rejet automatique ; KILL au REGISTRE |
| Doctrine §12 | C | adapt_now | T1 | lecture obligatoire, en lecture seule, des 9 fichiers T1 de `C:\dev\maos\docs\knowledge\` avant toute fiche ou skill EVE ; « <= 7 outils » écrit au REGISTRE |
| Doctrine §8, `escalate_when`, « un agent ne lance pas un agent » | C | adapt_now | T1 | trois phrases dans les règles et une section dans chaque fiche |
| Doctrine §6 | B, C | adapt_now | T1 | une règle courte sans compteur : résumé avant corps, brief borné, budget par chantier au dashboard ; hook `token-watch` réécrit en Python, seuil 85 %, après sonde sur `transcript_path` |
| `mas-skill-router` | B, F | adapt_now, statique | T1 | `model:` et `skills:` dans chaque fiche ; colonne au REGISTRE. Quel modèle pour quelle fiche : **décision de Melvyn** |
| `frontmatter-validate.sh` | B | adapt_now | T1 | contrôle Python dans `doctor` : champs des fiches, commandes, skills |
| `SubagentStop` | E, F | adapt_now | T1 | un hook qui écrit une ligne par agent (date, type, identifiant tronqué) dans `agents/index.jsonl`, avec son test ; `_lib.refuser()` journalise en plus de stderr |
| `mas-mission-planner` + `project-manager-senior` + motifs de `product-manager` | A, B | adapt_now | T1 | fiche `planificateur-eve` : table `tâche | agent | dépend de | risque | preuve à la couche` dans `plan.md`, dernière tâche = porte de revue, porte sécurité avant risque haut, non objectifs, questions ouvertes bloquantes |
| `testing-reality-checker` + `evidence-collector` + liste `api-tester` | A | adapt_now | T1 | fiche `verificateur-eve` : verdict par défaut « à reprendre », preuve exigée par affirmation, recoupe les findings des relecteurs avec droit de les contester, relance la gate lui même |
| `mas-reviewer` | B | adapt_now | T1 | `/revue` : verdict `PASS | NEEDS_WORK | BLOCK` dérivé mécaniquement des findings confirmés, colonne confiance, « rapporte aussi le peu sûr ». **Tension à arbitrer** : couverture avant précision contre le plafond de 400 mots de `relecteur-eve` |
| `mas-sec-reviewer` + `security-defensive-specialist` + `security-engineer` | A, B | adapt_now | T1 | fiche `securite-eve` : porte de brief `PASS | BLOCK` avant toute tâche à risque haut, triade létale, STRIDE, catégories mappées sur `donnees.md`, `git.md`, `securite.md` ; plus `/revue-securite` copie locale de la commande intégrée, base `develop` |
| `nexus-strategy` extraits + `project-shepherd` gabarit + fiches Tier A | A | adapt_now, **après lecture des Tier A** | T1 | fiche `chef-de-mission-eve` de moins de 80 lignes : boucle bornée à 3 essais, gabarits de handoff et d'escalade, rapport d'état |
| `mas-memory-keeper` + `commander-feedback-loop` | B, C | adapt_now | T1 | règle `memoire.md` : critères de promotion, provenance (agent, chemin, date) dans chaque fiche, registres BLK et EVAL, cinq destinations d'une idée après revue |
| `skill-creator` boucle d'évaluation | B | adapt_now | T1 | `evals.json`, `grader.md`, `aggregate_benchmark.py` repris sous `fixtures/`, CDN retirés : la mesure quantitative baseline contre skill |
| `mas-context-manager` | B | adapt_now | T2 | `contexte.md` <= 4 000 tokens par chantier, écrit au point d'étape |
| `codebase-onboarding-engineer` | A | adapt_now | T2 | auditeur de l'existant sur graphify, faits seulement ; sert la mission 1 |
| `minimal-change-engineer` Scope Self-Check, `technical-writer` Divio | A | adapt_now | T2 | dans le rapport de `developpeur-eve` et dans `redacteur-eve` |
| `/aside`, `/explain-diff` commande | B | adapt_now | T2 | `/aparte`, `/explique-diff` |
| `limit-file-size` | B | adapt_now, variante « n'aggrave pas » | T2 | refuser une croissance nette au delà de 800 lignes, jamais l'édition d'un fichier déjà au dessus |
| `data-engineer`, `database-optimizer`, `sre`, `incident-response` | A | backlog_next | T2 | rebranchement des scripts, migrations SQL Server, mise en production |
| `/update-docs` | B | backlog_next | T2 | proposition à Edmond : `API_REFERENCE.md` généré depuis OpenAPI, alerte de fraîcheur |
| Agent teams, `Workflow` | F | watch | | expérimental ou sans porte d'approbation native ; à réévaluer au lot organigramme |
| 17 skills Anthropic, 31 fiches hors domaine, `/pr`, `/checkpoint`, `/test-coverage`, `/update-codemaps`, `claude-api`, `mcp-builder`, `git-workflow-master`, `jira-steward`, QMD, agentmemory, RooFlow, Caveman, niveaux d'autonomie runtime | A, B, C | reject | T0 | motifs au rapport ; les décisions déjà prises par MAOS ne se refont pas |

## 5. Les branches de MAOS (D), de la main de Melvyn

Le clone n'a pas été rafraîchi depuis le 08/09. Sur 18 branches, 13 n'apportent plus rien à `brique-1` et 5 portent du contenu unique : `claude/memoire-v2-design-d70b90` (ADR 0010 « Proposed » et trois audits, fusion propre), `chore/menage-branches` (l'audit, fusion propre), `memory/classifieur-porte-provenance` (un commit propre `62a0834`, six conflits dont quatre périmés), `knowledge-os/brique-6-url-extractor` (deux notes d'intake uniquement), `docs/no-attribution-footer` (identique à `origin/main`). `main` local est 7 commits derrière `origin/main` ; `brique-1` n'a pas `25cbb75`. Rien de tout cela n'est décidé ici.

## 6. Le plan par lots proposé

L'ordre suit la recommandation du relecteur E : fermer les traces, réparer la cohérence, mécaniser, tester, puis construire. Chaque lot passe par `/chantier` : spec, attaque, plan, attaque, point d'étape, exécution, `/gate`, `/revue`.

| Lot | Contenu | Ce qu'il prouve | Main de Melvyn |
| --- | --- | --- | --- |
| **2a, clôture du lot 1a** (sans agent, une demi session) | déposer les 4 rapports bruts restants ; compter les messages ; re-noter les 8 critères de `design.md` ; `PLAN.md`, `INDEX.md`, `README.md` (structure de `chantiers/`, « ce qui s'active quand ») ; `chantier.md:41` ; `revue.md:25` ; sonde puis TDD sur `.env*` et `token_api.txt` ; chemin de profil hors de `plan.md` | la trace est complète et la doctrine ne se contredit plus | aucune |
| **2b, fondations MAOS vers EVE** | REGISTRE au format intake-audit ; règles §5, §6, §8, §11, §12 ; `model:` et `skills:` par fiche ; contrôle de frontmatter dans `doctor` ; hook `SubagentStop` et journal des refus ; `token-watch` Python | « configs propres et déclarées », « qui a fait quoi » mécanique | quel modèle pour quelle fiche |
| **2c, lecture des Tier A** (recherche, lecture seule) | les 10 fiches de `packages/agents/fiches/`, les 9 fichiers T1 de `docs/knowledge/`, les shards Python et Django du ledger ECC | ce qui manque encore à l'organigramme, sourcé | ouvrir `C:\dev\maos` en écriture ou non |
| **2d, les rôles manquants** | `planificateur-eve`, `verificateur-eve`, `securite-eve`, `chef-de-mission-eve` avec leurs fixtures ; verdict mécanique dans `/revue` ; `/revue-securite` ; fixtures des 4 fiches en lecture seule | neuf rôles sur neuf, testés | arbitrer couverture contre 400 mots |
| **2e, mémoire et amélioration** | `memoire.md`, provenance, BLK et EVAL, cinq destinations, boucle d'évaluation quantitative | « s'améliorent », « qui a dit quoi » | |
| **1b, le chantier réel** | le premier vrai chantier de code mené par l'équipe complète | tout ce qui précède, sur du vrai | commit de la mission 0, choix du défaut sans migration |

**Ce que ce plan ne fait pas** : recopier les 58 fiches, installer un seul skill Anthropic, brancher MAOS en écriture, utiliser une clé API.

## 7. Ce qui reste inconnu, dit franchement

Le corps des 10 fiches Tier A et des 32 fiches froides de MAOS ; l'effet réel de `skills:` et `memory:` sur la version 2.1.272 du harnais (documenté, à prouver par fixture) ; si `garde_perimetre` refuse déjà `.env` (grep négatif seulement) ; si un hook reçoit `transcript_path` ; le coût réel des sous agents sur l'abonnement (~4x et ~15x selon MAOS, non revérifié, et ce soir deux agents ont touché la limite de session) ; l'état d'`origin` de MAOS depuis le 08/09.
