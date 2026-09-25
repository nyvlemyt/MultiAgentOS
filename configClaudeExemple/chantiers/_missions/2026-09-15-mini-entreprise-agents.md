# Mission T : la mini entreprise d'agents (vision de Melvyn du 15/09/2026)

Écrit le 15/09/2026 après midi à partir des mots de Melvyn. **État : brief. Rien n'est démarré, aucun fichier du dispositif ni de MAOS n'a été modifié pour cette mission.** Le chantier s'ouvre par `/chantier` dans une session dédiée (recommandation en section 7), niveau structurant.

---

## 1. Les mots de Melvyn, dans l'ordre

Deux messages le 15/09 après midi, le second reprenant le premier. Reproduit tel quel.

> concernant : Non tranché, à toi : des agents de travail qui écrivent du code. Aujourd'hui le code s'écrit dans le fil principal pour que tu puisses tout expliquer au quiz.
> voici la vision que j'ai de notre collaboration, ton utilisation, ta manière de bosser, etc :
> non moi j'aimerai booster l'utilisation de claude. Donc en fait il me faut des agents pour tout : orchestrateur, plan avec ou non audit de tout ce qu'on peut et doit faire, code / exécutif, review, pentest, etc.. Pleins d'agents qui bossent, se contredisent, s'améliorent, etc pour faire en sorte d'avoir le meilleur résultat d'archi, de code, de trucs à faire, de tests, etc.. et aussi un super retour pour que moi j'ai toutes les infos, contexte, etc .. Tous les agents possibles pour la bonne décomposition du travail. Chaque agent doit être relié, le fil de discussion ne doit pas être inondé sinon je me perds et y'a trop d'info, il faut qu'ils aient tous les meilleurs skills en lien avec leurs tâches, que leurs configs soient bien déclarées et bien propres, que la gestion de la mémoire, de qui fait quoi, dit quoi, etc soit bien faite. Je veux une mini entreprise et que moi j'aie les ordres à donner, que je puisse bien comprendre ce qui est fait, comment c'est fait, pourquoi, etc..
> Je pense qu'on peut encore se baser sur des trucs faits ou dits dans MAOS mais il n'est pas encore complet donc je pense qu'il faudrait faire une autre session (ou rester ici si ça gêne pas pour la tâche qu'on doit faire) pour analyser tout ce qui existe, lancer des skills qui vont préparer les skills, agents, etc à faire. Le but c'est de trouver pleins de trucs qui marchent déjà, qui sont vachement bons et implémenter. Il faut pas que tu te limites dans tes recherches mais bien sûr il faut faire passer tout ce que tu trouves par le skill intake-audit de MAOS, que tu implémentes tout ce que je t'ai dit mais super boosté, que tu fasses des recherches, sur github ou ailleurs. Bref je veux un travail complet qui utilise déjà des principes dits pour les mettre en place et qu'on puisse bosser de ouf avec. Pour MAOS, y'a une étape intermédiaire qui est d'analyser le projet maintenant et surtout de voir s'il est à jour car je crois que j'ai pleins de trucs faits sur d'autres branches que celle actuelle (`git branch` : `* knowledge-os/brique-1`, `main`).
> Bref décompose bien, utilise les skills et trucs déjà mis en place et améliore le tout. Si tu préfères diviser le travail et/ou le faire ailleurs dis moi, comme ça on se concentre sur le chantier de la branche esglastmodif actuelle.

---

## 2. Ma reformulation, à valider par Melvyn

**L'objectif.** Une mini entreprise d'agents Claude Code. Melvyn est le commanditaire : il donne les ordres et lit les résultats. Un orchestrateur décompose et distribue. Des agents spécialisés font le travail (planification, audit de l'existant, architecture, code, tests, revue, sécurité, rédaction, mémoire), se contredisent (concurrence entre propositions, relecture adverse, contre-relecture) et s'améliorent (chaque manque devient un axe de plus). Le retour vers Melvyn est riche mais compact : il sait ce qui est fait, comment, pourquoi, et il peut l'expliquer.

**Les exigences qui structurent tout.**

1. Le fil de discussion n'est pas inondé : le chat ne reçoit que le point d'étape, les décisions à prendre et les résultats. Tout le reste va dans des fichiers (journal, rapports d'agents, dashboard).
2. Les agents sont reliés : chacun sait de qui il reçoit, à qui il rend, sous quelle forme.
3. Chaque agent a les meilleurs skills de son métier, une configuration propre (frontmatter déclaré, outils bornés) et un test qui prouve qu'il fait ce qu'on attend.
4. La mémoire dit qui a fait quoi et qui a dit quoi, sans doublon, avec un seul écrivain.
5. Melvyn comprend et peut tout expliquer : le code écrit par des agents passe par explain-diff et le quiz ; commit et push restent sur sa demande.

**La base.** MAOS (`C:\dev\maos`, le MultiAgentOS de Melvyn) fournit le générique ; le dispositif EVE (`EveBackEnd/.claude/`) est l'instance. Recherche externe large, sans se limiter, mais **tout ce qui entre passe par `intake-audit`** (skill de MAOS) puis par le `REGISTRE.md` d'EVE.

**L'étape intermédiaire.** Établir l'état de MAOS : quelle branche est le tronc, ce qui vit sur les autres branches, ce qui est à jour, ce qui manque à la roadmap.

**Ce que Melvyn a tranché en passant.** La question laissée ouverte le matin (des agents de travail qui écrivent du code ?) a sa réponse : oui, il en veut. La contrainte « Melvyn peut tout expliquer » reste et se traite par la conception, pas en renonçant aux agents.

---

## 3. Ce qui existe déjà (relevé du 15/09, lecture seule, rien modifié)

### 3.1 Dans EVE (`EveBackEnd/.claude/`, hors dépôt)

| Pièce | État |
| --- | --- |
| Agents | 4 fiches `-eve` en lecture seule : `chercheur`, `architecte` (deux instances au niveau structurant), `relecteur` (attaque de spec et de plan, revue, contre-relecture depuis le 15/09), `redacteur`. Le code s'écrit dans le fil principal |
| Commandes | 6 : `/chantier`, `/gate`, `/revue`, `/pr`, `/fin-session`, `/verif-setup` |
| Skills | plugin superpowers ; 12 vendus (graphify, 9 de Pocock, explain-diff repris de MAOS, writing-for-agents) ; `REGISTRE.md` |
| Verrous | 5 hooks Python : `garde_donnees`, `garde_git`, `garde_perimetre`, `verif_style`, `doctor` ; tests dans `.claude/hooks/tests/` |
| Pipeline | `/chantier` (brainstorm, spec avec table « où le changement agit, où on le prouve », attaque de spec, plan attaqué, point d'étape) puis implémentation, `/gate`, `/revue`, explain-diff et quiz, `/pr`, commit sur demande, `/fin-session` |
| Traces | `chantiers/` (PLAN, INDEX, `_decisions`, `_missions`, un dossier par chantier : design, plan, journal, dashboard, revue, explications) ; mémoire du bucket `c--dev-Eve-EveBackEnd` |

### 3.2 Dans MAOS (`C:\dev\maos`, relevé git du 15/09)

Commandes lancées : `git branch -a -vv`, `git rev-list --count`, `git branch -r --no-merged knowledge-os/brique-1`, `ls .claude/*`, `wc -l`, lecture de `intake-audit/SKILL.md` et des en-têtes `mas-*`.

| Fait | Chiffre |
| --- | --- |
| Tronc vivant : `knowledge-os/brique-1` | 441 commits, dernier le 07/09/2026 (`377f636`) ; 61 commits d'avance sur `origin/main`, **1 de retard** (`25cbb75`, suppression du pied de commit Co-Authored-By) ; arbre propre, aucun stash |
| `main` local | 374 commits, **7 de retard** sur `origin/main`, dernier le 07/07/2026 |
| Branches distantes non fusionnées dans brique-1 | **18**, environ 85 commits propres au total. Les plus lourdes : `knowledge-os/brique-6-url-extractor` (25), `phase9/statut-verite-alertes` (18), `claude/promotion-memoire-s3b` (8), `memory/classifieur-porte-provenance` (8), `knowledge-os/redistill-titres` (6), `chore/god-file-guardrails` (3). Les 12 autres ont 1 ou 2 commits |
| Audit des branches déjà écrit | branche `chore/menage-branches` (1 commit, 07/09) : `docs/workflows/etat-branches-et-menage.md`, « audit des 47 branches, filet d'archive et règle du tronc unique » |
| `.claude/agents/` | **58 fiches** (design 8, engineering 29, product 5, project management 6, testing 8, security 1, nexus-strategy 1) plus `EXECUTIVE-BRIEF.md` (doctrine NEXUS : 9 divisions, pipelines, portes qualité, Reality Checker qui répond NEEDS_WORK par défaut) et `QUICKSTART.md`. Frontmatter : `name`, `description`, `color`, `emoji`, `vibe` ; pas les champs `tools` et `model` de Claude Code |
| `.claude/skills/` | **26 skills**, dont le noyau `mas-*` : `mission-planner` (DAG de 4 à 8 tâches, dernière tâche toujours une porte de revue, 3 questions max avant de planifier), `skill-router` (routage des modèles par risque : opus, sonnet, haiku ; lit les résumés L1 seulement), `context-manager` (pack de contexte par projet, 4 k tokens max), `memory-keeper` (seul écrivain de la mémoire, 5 registres), `reviewer` (couverture avant précision, verdict PASS, NEEDS_WORK, BLOCK), `sec-reviewer`, et **`intake-audit`** (114 lignes : garde fous, identité, adéquation, trois coûts dont le retrait, sanitize par regex, notes sur 7 axes, critères KILL, décision parmi cinq valeurs, appropriation avec « Prompt Defense Baseline », plan d'intégration, date de réaudit, un dossier par item dans `docs/intake/`). Aussi : `skill-creator` (485 lignes), `explain-diff`, `mcp-builder`, les skills documentaires Anthropic (docx, pdf, pptx, xlsx), des skills design |
| Commandes et hooks | 8 commandes (`aside`, `checkpoint`, `explain-diff`, `pr`, `security-review`, `test-coverage`, `update-codemaps`, `update-docs`) ; 3 hooks shell (plafond de taille de fichier, budget tokens, validation de frontmatter) |
| Doctrine | `CLAUDE.md` en 14 sections (niveaux d'autonomie, actions risquées gardées, discipline tokens, mémoire, isolement de facturation, consultation obligatoire de la base de savoir, §14 style de communication et dashboard) ; `AGENTS.md` (deux tiers : Tier A fiches canoniques, Tier B délégation ; contrat d'exécution ; motifs interdits) ; `SKILLS_REGISTRY.md` ; `TOKEN_STRATEGY.md` ; 10 fiches de décision (`docs/decisions/0001` à `0009` plus `PIVOT_BRIEF`) ; `ROADMAP.md` phases 0 à 9 avec budget par phase, phase 9 « exploitation et auto-construction » en cours sur brique-1 |
| Ce que MAOS est en plus du dispositif | une application (monorepo pnpm et TypeScript : `apps/`, `packages/agents`, `packages/core`, `packages/db`, un cockpit) et un système de mémoire « knowledge-os » (promotion des fiches par un juge, provenance, miroir, distillation), ce qui explique la plupart des 18 branches |

### 3.3 Dans Claude Code (leviers présents dans cet environnement, à vérifier dans la documentation officielle en phase 2)

- **Agents** (outil `Agent`) typés par les fiches `.claude/agents/*.md` (frontmatter `name`, `description`, `tools`, `model`), exécution en arrière plan, isolation `worktree`, messages entre agents (`SendMessage`, `ListAgents`). Le rapport final d'un agent n'est pas montré à l'utilisateur : l'orchestrateur relaie. C'est le mécanisme naturel du « fil non inondé ».
- **Workflows** (outil `Workflow`) : scripts d'orchestration déterministes (pipeline, parallèle, schémas de sortie), à la demande explicite de l'utilisateur ; skill `workflow-authoring`.
- Hooks (`PreToolUse`, `PostToolUse`, `SessionStart`), mémoire persistante par bucket, skills, plugins, `/loop`, planification.
- Sources externes déjà connues : obra/superpowers (plugin en place), mattpocock/skills (`3cca18b`), graphify, caveman et ui-ux-pro-max (plugins cités par MAOS), wshobson/agents (cité par `mas-skill-router`), affaan-m/ecc (cité par `intake-audit`), contains-studio/agents (origine probable des fiches design, engineering et testing de MAOS : à vérifier).

---

## 4. Les contraintes qui tiennent

- **Périmètre d'écriture.** `C:\dev\maos` n'est pas ouvert à l'assistant. L'ouvrir est une décision de Melvyn, écrite dans une fiche (`_decisions/`) et dans `garde_perimetre.py`, comme la décision `0006` l'a fait pour `bdfg-core`. Les commits et merges dans MAOS restent de la main de Melvyn tant qu'il n'a pas dit autrement.
- **Tout import passe par deux portes.** `intake-audit` (MAOS) : lecture intégrale, sanitize, trois coûts dont le retrait, décision parmi cinq valeurs (`implement_now`, `adapt_now`, `backlog_next`, `watch`, `reject`), Prompt Defense Baseline sur toute fiche venue de l'extérieur. Puis `REGISTRE.md` (EVE) pour ce qui entre dans le dispositif.
- **Rien d'interne ne sort.** Aucun nom de serveur, aucun code, aucune donnée dans une recherche externe. Aucun serveur MCP non validé. Aucune dépendance à une clé API ou à une facturation à l'usage (règle §11 de MAOS, cohérente avec l'abonnement).
- **Les verrous valent pour les agents de travail.** Que les hooks s'appliquent aux appels d'outils des sous agents est à **prouver par un test** en phase 3, pas à supposer.
- **Melvyn peut tout expliquer.** Le code écrit par des agents passe par explain-diff et le quiz. Commit et push sur demande, jamais par un agent.
- **« Pentest » se lit ici « revue de sécurité »** du code et des configurations (authentification, upload, base, `settings.py`, `.env`), en lecture. Une attaque active contre un serveur de BDF Gestion demande une autorisation écrite de la DSI ; ce n'est pas dans ce chantier tant qu'elle n'existe pas.

---

## 5. La décomposition proposée

Un chantier `chantiers/<date>-mini-entreprise-agents/`, niveau **structurant** (architecture du dispositif, deux architectes en concurrence, fiche de décision, `/security-review`), ouvert par `/chantier` dans la session dédiée.

| Phase | Quoi | Qui | Livrable, preuve |
| --- | --- | --- | --- |
| **0. Cadrage** | Brainstorm, spec (`design.md`) avec la table « où le changement agit, où on le prouve », attaque de la spec par des `relecteur-eve` adverses, plan attaqué, point d'étape. Questions de fond : où vit le générique (MAOS) et où vit l'instance (EVE) ; quel protocole « fil non inondé » ; quels rôles au minimum viable ; quel schéma de mémoire « qui fait quoi, dit quoi » | moi, Melvyn valide | `design.md`, `plan.md`, dashboard |
| **1. État de MAOS** | (a) Branches : quoi fusionner dans brique-1, quoi archiver, à partir de `docs/workflows/etat-branches-et-menage.md` de la branche `chore/menage-branches` ; (b) inventaire des 58 fiches, 26 skills, hooks, décisions : réutilisable tel quel, à adapter, à écarter, avec la grille T1 noyau / T2 arsenal d'`intake-audit` ; (c) `ROADMAP.md` : ce qui manque au regard de la mini entreprise | `chercheur-eve`, moi ; lecture seule | `maos-etat.md` chiffré ; décision de Melvyn sur le tronc et les merges (sa main) |
| **2. Recherche externe** | Documentation officielle Claude Code (sous agents, équipes d'agents, hooks, mémoire, workflows) ; collections d'agents et de skills (celles déjà connues en 3.3 et d'autres, sans se limiter) ; patrons d'orchestration (planificateur, exécutant, relecteur ; revue adverse ; portes fondées sur des preuves). **Un dossier `intake-audit` par candidat**, décision parmi cinq valeurs | `chercheur-eve`, skill `research`, moi | `intake/` : un dossier par candidat ; tableau des décisions |
| **3. Conception** | Deux `architecte-eve` en concurrence sous deux contraintes (« organigramme minimal, six rôles, fil principal orchestrateur » et « pipeline déterministe par workflows, agents spécialisés »), puis attaque. Objets à concevoir : l'organigramme (rôles, transmissions, artefact rendu par chaque rôle), le protocole de rapport (ce qui remonte au chat, ce qui va en fichier), le standard de fiche agent (frontmatter Claude Code, outils bornés, modèle selon le risque, Prompt Defense Baseline), le schéma de mémoire (journal par chantier, rapports d'agents dans `chantiers/<chantier>/agents/`, bucket avec un seul écrivain), le budget tokens, **le test qui prouve que les verrous s'appliquent aux sous agents** | deux `architecte-eve`, `relecteur-eve`, Melvyn arbitre | tableau de critères, fiche `_decisions/00NN` |
| **4. Implémentation par lots** | Chaque lot : test rouge puis vert (`writing-skills`), essai sur un chantier réel, instance EVE d'abord, généralisation dans MAOS ensuite. **Lot 1** orchestration et retour : orchestrateur (fil principal), rapporteur (dashboard, point d'étape, explain-diff), protocole fil non inondé. **Lot 2** plan et audit : planificateur (à partir de `mas-mission-planner`), auditeur de l'existant (« tout ce qu'on peut et doit faire »), routeur de skills (`mas-skill-router`). **Lot 3** travail et adversité : agents développeurs (worktree, TDD, plus petit diff), relecteurs adverses (standards, spec, preuve, contre-relecture), testeur (Reality Checker, NEEDS_WORK par défaut). **Lot 4** sécurité : `security-review` et `mas-sec-reviewer` adaptés à EVE, en lecture. **Lot 5** mémoire et registre : gardien de mémoire seul écrivain (5 registres de MAOS vers le bucket et `chantiers/`), `REGISTRE` et `intake` unifiés. **Lot 6** amélioration continue : rétro par chantier (un manque devient un axe ou une ligne de spec), tests rouge et vert des skills, mesures (findings attrapés, tokens, ce que Melvyn a dû lire) | moi, agents ; Melvyn valide chaque lot | par lot : gate, revue, explain-diff, point d'étape |
| **5. Essai grandeur nature** | La mission 1 (cartographie) ou un chantier code court, tourné avec la mini entreprise ; mesure, ajustements, généralisation dans MAOS | tous | rapport chiffré, décision de Melvyn |

**Ce qui bloque quoi.** 0 avant tout. 1 et 2 en parallèle, après 0. 3 après 1 et 2. 4 par lots, chaque lot livré et essayé avant le suivant. 5 après le lot 3 au moins.

---

## 6. Ce qu'il faut de ta main, et à trancher

1. **Où tourne la session dédiée.** (A) recommandé : dans `C:\dev\Eve\EveBackEnd`, pour que les règles, les verrous, la mémoire du bucket et `chantiers/` s'appliquent, avec `C:\dev\maos` ouvert en écriture par une fiche de décision et une ligne dans `garde_perimetre.py` (comme `0006`). (B) dans `C:\dev\maos`, avec son propre `CLAUDE.md` : les verrous EVE ne s'appliquent pas, la mémoire va dans un autre bucket, l'instance EVE s'écrit depuis l'extérieur.
2. **Le tronc de MAOS.** `knowledge-os/brique-1` est le vivant. Fusionner `origin/main` (1 commit) et décider des 18 branches : c'est ta main (commits, merges), avec l'audit déjà écrit dans `chore/menage-branches` comme point de départ.
3. **Le nom du chantier** et le jour où tu ouvres la session.
4. **Le budget de recherche** : combien de sessions tu acceptes pour les phases 1 et 2 avant la conception. La recherche large est ce qui coûte le plus en tokens et en lecture.
5. **Le sens de « pentest »** : revue de sécurité du code et des configurations, oui ; tests actifs contre des serveurs, seulement avec une autorisation écrite.

---

## 7. Recommandation : où et quand

**Une session dédiée, pas celle ci.** Trois raisons.

1. Le périmètre est différent : MAOS n'est pas ouvert, et l'ouvrir demande ta décision. Cette session n'a pas à la porter.
2. Le volume : les phases 1 et 2 sont de la lecture et des dossiers d'audit par dizaines. C'est exactement ce qui inonde un fil et te fait perdre le tien.
3. La mission 0 est au milieu d'un merge, avec un point d'étape qui attend ta validation. Ici, on la finit.

**Les deux avancent en parallèle.** Règle de partage pour ne pas se marcher dessus : la session dédiée a la main sur `.claude/`, sur `CLAUDE.md` et sur la section « Mission T » de `PLAN.md` ; cette session ne touche plus `.claude/` et travaille dans `chantiers/2026-09-08-esg-rating-last-modification/` et dans le code. La mémoire est partagée : chaque session écrit ses fiches et met l'index à jour au moment même.

**La première commande de la session dédiée** : `/chantier mini-entreprise-agents`, en lui donnant ce brief à lire en premier.
