# Rapport brut : le dispositif EVE face aux cinq exigences de Melvyn

Agent : `relecteur-eve`, mode revue, axe unique. Lancé le 16/09/2026 au soir, axe E de l'audit du lot 2. Déposé tel quel. Lecture seule, aucun fichier modifié par l'agent.

---

**Synthèse en une phrase.** Le socle de sûreté est réel, testé et petit à dessein (58 tests, 13 contrôles `doctor`, barrière commit prouvée sur un sous agent), mais trois des choses que le lot 1a affirme avoir installées ne laissent aucune trace vérifiable ce soir : les rapports bruts d'agents (0 fichier pour au moins 20 lancements avant 12:59), le compte des messages du fil (aucun), et la mise à jour de `PLAN.md` et `INDEX.md` (en retard d'une journée). Et la doctrine corrigée à midi n'est pas celle que reçoivent les sous agents de cette session : le `CLAUDE.md` injecté dans cette instance dit encore « Agents (.claude/agents/, lecture seule) ... Le code s'écrit dans le fil principal ».

Relancé de ma main ce soir : `python .claude/hooks/tests/test_gardes.py` rend `Ran 58 tests OK` ; `python .claude/hooks/doctor.py --complet` rend `13 OK, 0 alerte(s)` ; `git status --porcelain` est identique octet pour octet à `etat-depart/status.txt` (12 fichiers), `HEAD` vaut `a5edddf`, `.git/MERGE_HEAD` présent ; le comparateur d'empreintes signale deux écarts réels et attendus (`agents/` créé à 12:59, `journal.md` modifié), donc il détecte.

## Bloc 1. La carte : ce qui existe, où le voir fonctionner

Racine : `C:\dev\Eve\EveBackEnd\`. Total `.claude/` : 6 426 lignes, dont hooks 1 628 + tests 436 (32 %), skills 2 938 (graphify seul 1 620), fiches d'agents 245 (3,8 %), commandes 168, règles 150.

| Chemin | Rôle | Lignes | Où le voir fonctionner |
| --- | --- | --- | --- |
| `CLAUDE.md` | Point d'entrée, injecté dans chaque session et chaque sous agent | 37 | `grep -n developpeur-eve CLAUDE.md` : ligne 28 réécrite le 16/09 |
| `CONTEXT.md` | Glossaire du projet | 54 | `domain-modeling` le fait évoluer |
| `.claude\README.md` | Manuel : une table pièce, rôle, « se teste par » | 55 | c'est lui la carte officielle ; ligne 26 incomplète (voir bloc 5) |
| `.claude\rules\communication.md` | Forme des réponses, traces, bloc jalon (lignes 24 à 42, écrit le 16/09) | 45 | le dernier message d'un lot doit avoir la forme des lignes 35 à 41 |
| `.claude\rules\donnees.md`, `git.md`, `qualite.md`, `securite.md` | Les quatre autres règles | 21, 24, 33, 27 | le verrou correspondant refuse ; `README.md:12-14` donne la commande de test de chacun |
| `.claude\agents\relecteur-eve.md` | Attaque, revue par axe, vérification contradictoire, contre-relecture | 53 | `attaques\attaque-spec.md` et `attaque-plan.md` : 23 + 19 findings vérifiés |
| `.claude\agents\architecte-eve.md` | Une proposition sous contrainte, deux instances | 47 | `architecture\propositions.md` (193 l.) et `_decisions\0009` |
| `.claude\agents\chercheur-eve.md` | Faits sourcés, seul agent avec `WebFetch`, `WebSearch` | 40 | pas utilisé sur ce chantier avant le lot 2 |
| `.claude\agents\redacteur-eve.md` | Relecture de docs et artefacts | 44 | `journal.md:492` : 2 CRITIQUES trouvés le 16/09 |
| `.claude\agents\developpeur-eve.md` | Seule fiche qui écrit : TDD, périmètre du brief, jamais commit | 61 | `fixtures\developpeur-eve\{rouge,vert,refus,mur}.md` ; `doctor` ligne « fiches d'agents : 5 presente(s), toutes inscrites » |
| `.claude\commands\chantier.md`, `revue.md`, `pr.md`, `gate.md`, `fin-session.md`, `verif-setup.md` | Le pipeline | 45, 44, 28, 23, 16, 12 | les taper ; `gate` : ligne `GATE PASS` au journal |
| `.claude\hooks\garde_donnees.py`, `garde_git.py`, `garde_perimetre.py` | Verrous `PreToolUse` | 133, 226, 148 | `garde_git.py:100-109` et `:202-215` : refus de `commit` et `push` quand `agent_id` est présent |
| `.claude\hooks\verif_style.py` | Verrou de forme `PostToolUse`, logique delta | 344 | `:43` et `:177` : `chantiers/*/agents/` et `fixtures/` ignorés |
| `.claude\hooks\doctor.py` | Tableau de bord `SessionStart`, `--complet` avec auto-tests | 214 | `:65-88` et `:118-130` : fiches sans registre, hooks fantômes |
| `.claude\hooks\gate.py`, `_lib.py`, `nettoyer_caracteres.py` | `/gate` ; fonctions communes ; purge | 259, 164, 140 | `_lib.py:155-160` : `refuser()` écrit sur stderr et sort, aucune journalisation |
| `.claude\hooks\tests\test_gardes.py` | 58 tests, 8 classes | 436 | `Ran 58 tests OK` ce soir |
| `.claude\settings.json` | 3 matchers `PreToolUse`, 1 `PostToolUse`, 1 `SessionStart`, 23 permissions | 92 | 0 occurrence de `SubagentStart` ou `SubagentStop` |
| `.claude\skills\` (11 dossiers) + `REGISTRE.md` | Skills vendus ; registre | 2 938 + 58 | `REGISTRE.md` : table Skills, « non retenus et pourquoi », table Agents (créée le 16/09) |
| `chantiers\PLAN.md`, `INDEX.md` | Vue unique ; liste des chantiers | 135, 31 | en retard : `PLAN.md:5` « État au 15/09 », `:50` mission T « à ouvrir », `:96` « 18 branches » ; `INDEX.md:12` « spec en révision 2 à valider » |
| `chantiers\_decisions\` (9), `_missions\` (6), `_cadre\` (1) | Décisions ; briefs ; cadre pour Edmond | 747, 683, 38 | `0009` porte l'architecture retenue et son amendement |
| `chantiers\2026-09-15-mini-entreprise-agents\design.md`, `plan.md`, `journal.md`, `dashboard.html` | Spec rév. 2 ; plan rév. 2 ; journal ; dashboard | 129, 490, 556, 167 | le journal est la meilleure trace ; le dashboard est ce que Melvyn doit ouvrir |
| `...\etat-depart\` (11 fichiers) | Filet là où git ne voit rien | | `python etat-depart\empreintes.py --comparer etat-depart\manifeste.txt` |
| `...\fixtures\developpeur-eve\` (4) + `fixtures\bac\` | Brief exact, attendu, transcription, date | 109, 68, 60, 87 | à rejouer à chaque modification de la fiche ; aucun script de rejeu |
| `...\agents\` | Rapports bruts d'agents | 1 fichier à 12:59 | lot 2 seulement ; rien du cadrage ni du lot 1a |
| Mémoire du bucket | 22 entrées dans `MEMORY.md` | | aucune entrée pour le lot 1a livré |

## Bloc 2. Prouvé, et affirmé sans preuve

**Prouvé** : les 4 verrous sur `Bash` et `Write` d'un sous agent (`journal.md:77-84`, limite : aucun hook n'enregistre rien) ; `Edit` hors périmètre refusé, cible intacte (`:343-348`) ; `MultiEdit` non concluant, l'outil n'existe pas ; `NotebookEdit` couvert par test ; `agent_id` et `agent_type` seulement depuis un sous agent, `cwd` identique (`:382-399`), `settings.json` restauré sha256 identique ; barrière commit et push (`garde_git.py`, 4 tests, sonde vivante `:428-435`) ; `doctor` contrôle fiches et hooks fantômes et a attrapé un vrai cas ; le comparateur détecte ; racine intacte ; fixtures `refus` et `vert` conformes ; doctrine réécrite sur le disque.

**Affirmé sans preuve ou contredit par les traces** :

| # | Affirmation | Ce que les fichiers montrent |
| --- | --- | --- |
| A1 | Critère 3 : « la rouge a bien été rouge avant la clause » (`design.md:105`) | Faux : 4 essais NON CONCLUANT, conclusion « clause no-op ». Le critère n'a pas été re-noté dans `design.md` |
| A2 | Greffe B « déclaration des refus de verrou » comme trace de sûreté | Jamais exercée : 0 remplissage sur 6 exécutions |
| A3 | « Chaque agent lancé a son fichier » (`design.md:61`, `communication.md:30`, `0009` amendement 2) | Cadrage et lot 1a : au moins 20 lancements et 0 rapport brut. `propositions.md` et `attaques\*.md` sont des consolidations du fil |
| A4 | « Au plus trois messages, compté au journal » et « le bloc jalon a servi » | Aucun compte au journal ; le bloc jalon envoyé n'est pas transcrit. Non mesurable depuis les traces |
| A5 | « `INDEX.md` et `PLAN.md` à jour au même moment » (`design.md:65`) | `PLAN.md:5, 50, 96, 98` et `INDEX.md:12` datent d'avant l'exécution du lot 1a |
| A6 | La doctrine corrigée « avant les fixtures » lève la variable confondante | Sur cette instance, le `CLAUDE.md` injecté est l'ancien, et `communication.md` injecté n'a pas le bloc jalon. Les sous agents reçoivent la doctrine figée au démarrage. Les fixtures ont donc tourné avec l'ancienne doctrine. Impact limité (le motif cité par les agents était le brief), mais le fait n'est écrit nulle part |
| A7 | `journal.md:550` : « une fiche créée en cours de session n'est pas invocable avant un redémarrage » | Contredit par `journal.md:490`. Deux versions dans le même fichier |
| A8 | « Fixtures rejouables mécaniquement » (`0009`) | Aucun script de rejeu ; quatre protocoles manuels. Seul le comparateur d'empreintes est mécanique |

## Bloc 3. Les cinq exigences

1. **Fil non inondé** : bloc jalon écrit ; aucun compteur, aucune transcription du bloc envoyé, aucune liste des chemins transmis. Non vérifiable.
2. **Agents reliés** : chaque fiche a « Quand » ; étoile autour du fil, aucun agent ne rend à un autre (choix de 0009) ; aucun organigramme écrit. Oui pour ce qui est visé.
3. **Skills, config propre, test** : `tools` borné 5/5 ; `model` 0/5 ; aucune fiche n'a `Skill` dans ses `tools`, donc un agent n'a jamais « ses » skills ; tests : 1 fiche sur 5, 2 fixtures concluantes sur 4 ; `doctor` ne vérifie pas le frontmatter. Partiellement.
4. **Mémoire qui fait quoi, dit quoi** : journal, table Agents, dossier `agents/` prescrit ; rapports bruts du lot 1a absents ; aucun hook `Subagent*` ; `PLAN.md` et `INDEX.md` en retard. Le « qui fait quoi » oui par le journal ; le « dit quoi » non pour tout ce qui précède 12:59.
5. **Melvyn comprend et peut tout expliquer** : dashboard, README, explain-diff, quiz prévu ; aucun quiz joué ; `README.md:26` ne nomme ni `_missions/`, ni `fixtures/`, ni `agents/`, ni `attaques/`, ni `etat-depart/`, ni `architecture/` ; la carte « où regarder » n'existait pas avant ce rapport. Pas encore.

## Bloc 4. Les rôles

| Rôle | Fiche | Tenu par le fil | N'existe pas | Preuve |
| --- | --- | --- | --- | --- |
| Orchestrateur | | oui | | `0009` |
| Planificateur | | oui, via `superpowers:writing-plans` | | `mas-mission-planner` non importé |
| Auditeur de l'existant | | | oui | c'est le lot 2 en cours |
| Architecte | `architecte-eve.md` | | | 2 instances le 16/09 |
| Développeur | `developpeur-eve.md` | | | 4 fixtures ; jamais lancé sur du code EVE réel ; branché à aucune commande, `chantier.md:41` dit encore « l'implémentation démarre dans le fil principal » |
| Testeur | | partiel : `gate.py`, TDD du développeur, relecteur axe robustesse | comme rôle : oui | Reality Checker non importé |
| Relecteurs | `relecteur-eve.md` | | | 6 lancements le 16/09, 42 findings |
| Sécurité | | | oui | `/security-review` cité mais absent de `.claude/skills/` et du REGISTRE ; dépend d'une commande intégrée non vérifiée ici |
| Rédacteur | `redacteur-eve.md` | | | `journal:492` |
| Mémoire | | oui, seul écrivain | gardien : oui | `mas-memory-keeper` non importé |
| Chercheur | `chercheur-eve.md` | | | non utilisé avant le lot 2 |

## Bloc 5. Où `.claude` est petit

**Pas un défaut, et même un avantage sur MAOS** : cinq fiches à `tools` bornés avec cinq sections chacune, contre 58 fiches MAOS sans `tools` ni `model` ; un tiers du dispositif est du verrou testé (2 064 lignes, 58 tests) contre 3 hooks shell à MAOS ; la trace (journal, attaques vérifiées ligne à ligne, fixtures transcrites avec leurs échecs) ; douze skills après un tri écrit.

**Petit pour la vision** : cinq fiches pour neuf rôles (planificateur, auditeur, testeur, sécurité, mémoire sans fiche ni skill) ; un test de fiche sur cinq, sans script de rejeu ; `model` absent partout, aucun routage par risque, aucun hook `Subagent*` ; rien de l'intelligence de MAOS n'est entré depuis le 08/09 hors le format des fiches et `explain-diff`, aucun dossier `intake/` ; le manuel en retard (`README.md:26`, « Ce qui s'active quand » ne dit ni le délai des fiches ni la doctrine figée par session) ; incohérence `chantier.md:41` face à `CLAUDE.md:28`.

## Bloc 6. Recommandations, dans l'ordre

1. **Fermer les traces du lot 1a avant d'écrire une ligne du lot 2** : déposer dans `agents/` ce qui peut encore l'être, compter les tours du fil, transcrire le bloc jalon envoyé, re-noter les huit critères de `design.md`, mettre à jour `PLAN.md` et `INDEX.md`.
2. **Réparer la cohérence de la doctrine et du manuel** : `chantier.md:41` face à `CLAUDE.md:28` ; `README.md:26` ; « Ce qui s'active quand » avec les deux faits constatés ; `journal.md:550`.
3. **Mécaniser « qui a fait quoi »** : un hook `SubagentStop` qui écrit une ligne par agent dans `agents/index.jsonl`, avec son test ; et faire journaliser `_lib.refuser()`.
4. **Tester les quatre fiches en lecture seule et scripter le rejeu** : une fixture « refus d'écrire » par fiche, une fixture étalon par métier (le relecteur reçoit un diff jouet dont le test est posé à l'export au lieu de l'insertion).
5. **Puis le lot 2**, avec un dossier `intake/` par candidat et `model` décidé par fiche.
6. **Le lot 1b après le commit de la mission 0, et pas avant 1 à 4.**

**Méthode et limites de l'agent** : plus de dix fichiers ouverts, justifié par un inventaire ; commandes en lecture seulement ; aucune valeur de données, aucun secret. Non vérifié : la mémoire du bucket au delà de son index, `C:\dev\maos`, l'existence de `/security-review` sur ce poste.
