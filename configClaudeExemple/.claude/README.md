# Le dispositif Claude Code d'EVE : manuel

Installé le 08/09/2026 (chantier `chantiers/2026-09-08-init-claude-eve/`, spec `design.md`). Tout ce qui est décrit ici vit sur le poste de Melvyn, exclu du dépôt par `.git/info/exclude`. Rien n'est partagé avec l'équipe tant que Melvyn ne le décide pas.

## Ce que ça fait, en une phrase par pièce

| Pièce | Rôle | Se teste par |
| --- | --- | --- |
| `CLAUDE.md` | Point d'entrée : qui, quoi, où lire, pipeline, niveaux, quel skill pour quoi | poser une question de contrôle en début de session (« quel est l'ordre d'intégration ? ») |
| `CONTEXT.md` | Langage partagé du projet (glossaire) | `domain-modeling` le fait évoluer |
| `.claude/rules/*.md` | Règles : données, git, qualité, sécurité, communication, agents, session. Chargées automatiquement | lire ; le verrou correspondant fait le reste |
| `.claude/hooks/_programmes.py`, `_commande.py`, `_effets.py` | L'analyse de commande commune aux trois verrous (lot 3, 17/09/2026) : la **table** des programmes (ce que chacun fait de ses arguments, un seul endroit), le **scanner** (de la ligne aux invocations : enveloppes, shells imbriqués, substitutions, documents en ligne, tubes, `find -exec`, `cd`, appels .NET ; une commande inanalysable rend un motif, jamais un repli), le **catalogue d'effets** (de l'invocation aux accès `LIT`, `ECRIT`, `META`). Un verrou qui plante refuse (`_lib.executer`) | `python .claude/hooks/tests/test_commande.py`, `test_effets.py` ; le contrat entier : `python .claude/hooks/tests/test_contrat.py --bilan` (793 cas, chacun avec sa règle et sa source) |
| `.claude/hooks/garde_donnees.py` | Refuse toute lecture de données providers et du token, y compris par un interpréteur, une redirection `<`, un tube, l'outil PowerShell ; noms, tailles et dates passent | `echo '{"tool_name":"Read","tool_input":{"file_path":"C:/dev/Eve/Providers/x.xlsx"}}' \| python .claude/hooks/garde_donnees.py` puis `echo $?` vaut 2 |
| `.claude/hooks/garde_git.py` | Refuse push force, écriture sur `develop`/`master`, reset hard, clean, stash drop, `-c core.hooksPath`... **quelle que soit la façon d'appeler git** : enveloppe (`env`, `timeout 5`, `winpty`, `uv run`), shell imbriqué (`bash -c`, `pwsh -Command`, `cmd /c`), substitution (`$(...)`), interpréteur (`os.system`) | `echo '{"tool_name":"Bash","tool_input":{"command":"git push --force"}}' \| python .claude/hooks/garde_git.py` vaut 2 ; idem avec `env git push --force` et `bash -c "..."` |
| `.claude/hooks/garde_perimetre.py` | Trois règles : refuse l'écriture hors projet, `bdfg-core`, mémoire, scratchpad, `settings.json` du profil ; refuse l'écriture, la modification ou la suppression d'un fichier dont le nom commence par `.env`, **même dans le projet** (lecture ouverte, modification de la main de Melvyn) ; refuse toute écriture sous `.git/`. Ce qui est couvert et ce qui ne l'est pas : `rules/securite.md`, chaque phrase adossée à un cas du corpus | `echo '{"tool_name":"Write","tool_input":{"file_path":"C:/dev/maos/x.md"}}' \| python .claude/hooks/garde_perimetre.py` vaut 2 ; idem avec `{"file_path":".env"}` et `{"command":"cd C:/dev/maos && rm CLAUDE.md"}` |
| `.claude/hooks/verif_style.py` | Après chaque écriture : caractères cachés par catégorie Unicode (format et largeur nulle, contrôle, usage privé, espaces non standard, séparateurs, sélecteurs de variante hors emoji, combinants non normalisés, homoglyphes cyrilliques ou grecs dans un mot latin), tirets typographiques, guillemets courbes dans le code, BOM, emojis dans le code, fins de ligne, espaces finaux, tabulations, saut final, tournures d'assistant, substituts, marqueurs de travail non terminé ajoutés (todo, fixme, hack, en majuscules : en parler en minuscules dans un texte évite de le déclencher). Logique delta : pour un fichier suivi, seul ce qui est nouveau par rapport à `HEAD` (lu avec les filtres git, donc en CRLF) bloque ; les défauts préexistants s'affichent en information | `python .claude/hooks/verif_style.py <fichier>` : lignes `INTRODUIT` (bloquant) et `preexistant dans HEAD` (information), ou `forme OK` |
| `.claude/hooks/nettoyer_caracteres.py` | Purge des caractères cachés d'un fichier, à la main : même classification que `verif_style`, rapport seul par défaut, `--appliquer` pour réécrire (fins de ligne conservées, homoglyphes remplacés par la lettre latine connue, sinon signalés « non corrigé ») | `python .claude/hooks/nettoyer_caracteres.py <fichier>` puis `--appliquer` |
| `.claude/hooks/doctor.py` | Au démarrage : état des garde-fous en dix lignes ; `--complet` ajoute les auto-tests | `python .claude/hooks/doctor.py --complet` |
| `.claude/hooks/gate.py` | `/gate` : ruff et pyright comparés à `develop` (seuls les nouveaux findings bloquent), forme, tests complets sur sqlite mémoire, couverture et seuils ECC en information | `python .claude/hooks/gate.py --sans-couverture` |
| `.claude/hooks/tests/test_gardes.py` | La suite entière du dispositif : tests unitaires des verrous, du scanner (`test_commande.py`) et du catalogue (`test_effets.py`), plus le **corpus de contrat** (`corpus_contrat.py`, joué par `test_contrat.py` : un cas REFUS et un cas PASSE par phrase des règles, écrit avant le code). Une suite verte ne prouve pas un verrou ; la vérification contradictoire d'un relecteur qui fabrique ses entrées contre les règles le fait | `python .claude/hooks/tests/test_gardes.py` (969 tests) ; `python .claude/hooks/tests/test_contrat.py --bilan` |
| `.claude/settings.json` | Branche les hooks (PreToolUse, PostToolUse, SessionStart) et la liste blanche des commandes en lecture seule | `python .claude/hooks/doctor.py` |
| `.claude/commands/` | `/chantier`, `/gate`, `/revue`, `/pr`, `/fin-session`, `/verif-setup` : le pipeline | les taper |
| `.claude/skills/` | Skills vendus, registre `REGISTRE.md` (source, version, décision, ré-audit) | lire le registre |
| `.claude/agents/` | Quatre fiches en lecture seule (`chercheur-eve`, `architecte-eve`, `relecteur-eve`, `redacteur-eve`) et une qui écrit du code, `developpeur-eve` ; ce qui est ouvert à chacune est sa ligne `tools`, où elle a le droit d'écrire est dans son brief. La table des agents du `REGISTRE.md` fait foi | les lancer depuis `/chantier` (structurant) ou `/revue` ; pour `developpeur-eve`, rejouer ses fixtures (`chantiers/2026-09-15-mini-entreprise-agents/fixtures/developpeur-eve/`) ; `python .claude/hooks/doctor.py --complet` |
| `ruff.toml`, `pyrightconfig.json` | Configs des outils du poste ; VS Code (Pylance) lit aussi `pyrightconfig.json` | `.venv/Scripts/ruff.exe check .` |
| `graphify-out/`, `.graphifyignore` | Graphe de connaissances du code (AST local, sans clé API) | `graphify query "insert_data"` |
| `chantiers/` | `PLAN.md` (la vue unique), `INDEX.md`, `_decisions/`, `_missions/` (briefs), `_cadre/`. Un dossier par chantier : `design.md`, `plan.md`, `journal.md`, `dashboard.html`, `revue.md`, `pr.md`, `handoff.md`, `explications/` ; et selon le chantier `agents/` (rapports bruts d'agents, tels quels), `attaques/` (findings vérifiés des attaques de spec et de plan), `fixtures/` (cas rejouables d'une fiche d'agent), `architecture/`, `audit/`, `etat-depart/` (manifeste d'empreintes, le filet là où git ne voit pas) | `chantiers/PLAN.md` puis `INDEX.md` |

## Le pipeline et les points où Melvyn décide

`/chantier` (spec attaquée par des `relecteur-eve` adverses puis validée, plan attaqué puis validé, point d'étape validé) puis implémentation dans l'arbre de travail, `/gate` (PASS montré), `/revue` (findings vérifiés, contre-relecture, correctifs), page `explain-diff` et quiz, `/pr` (description relue), commit et push **sur demande explicite**, `/fin-session`. Trois niveaux de rigueur (léger, standard, structurant), décidés à l'entrée : `CLAUDE.md`. Ajout du 15/09/2026 : l'attaque de spec et de plan et le point d'étape, après qu'Edmond a relevé un test placé à l'export alors que le changement agissait à l'insertion, sans qu'aucune étape du pipeline ne l'ait vu.

## Ce qui s'active quand

- Les hooks se rechargent quand `settings.json` change (constaté le 08/09/2026 en cours de session). En cas de doute, relancer Claude Code : la ligne `doctor EVE : ...` doit apparaître au démarrage.
- Une fiche d'agent créée ou renommée en cours de session devient invocable **avec un délai de quelques minutes**, sans redémarrage (constaté le 16/09/2026 : refus immédiat, puis prise en compte).
- **La doctrine est figée par session** : `CLAUDE.md` et `.claude/rules/` que reçoivent le fil et les sous agents sont ceux du démarrage. Une modification en cours de session n'atteint aucun agent avant le prochain démarrage (constaté le 16/09/2026). Après avoir touché la doctrine, relancer avant d'en tester l'effet sur un agent.
- `.claude/` et `chantiers/` sont exclus de git : `git status` ne voit rien de ce qui s'y passe. Le filet est le manifeste d'empreintes du chantier courant (`etat-depart/empreintes.py --comparer`), pas git.
- `graphify` : `graphify update .` après une modification de code ; le hook post-commit (`.git/hooks/post-commit`, local) le fait à chaque commit. Reconstruction complète : `graphify extract . --code-only` puis `graphify cluster-only . --no-label` (environ 30 s).

## Réparer

| Symptôme | Cause probable | Réparation |
| --- | --- | --- |
| Un verrou refuse une commande légitime | faux positif de l'analyse de la commande (chemin dans une chaîne, variable de shell) | reformuler : passer par un fichier de script dans le scratchpad, ou un chemin explicite. Ne jamais désactiver le hook. Si le faux positif se répète : ajouter le cas aux tests, corriger le verrou |
| `doctor` : `ruff` ou `coverage` absent | venv recréé | `pip install ruff coverage` dans le venv |
| `doctor` : graphify introuvable | PATH utilisateur | `uv tool update-shell`, puis rouvrir le shell |
| `doctor` : exclusions manquantes | `.git/info/exclude` réinitialisé | recopier la section « Dispositif Claude Code » (voir `design.md` §3) |
| `doctor` : base `.env` non sqlite | `.env` basculé sur EveDev | lecture seule, aucun test ; **Melvyn** remet la ligne sqlite dès que possible, dans VS Code : `.env` est une zone protégée en écriture, l'assistant ne peut pas le faire |
| `/gate` en ERREUR | worktree temporaire orphelin, npx sans réseau | `git worktree prune` ; `npx --yes pyright --version` ; relancer |
| Les hooks ne se déclenchent pas | session ouverte avant `settings.json` | relancer Claude Code |

## Désactiver (en connaissance de cause)

Tout est local : renommer `.claude/settings.json` désactive tous les hooks ; supprimer les entrées de `.git/info/exclude` fait apparaître le dispositif dans `git status`. Le dépôt n'est jamais affecté. Un verrou ne se désactive pas pour passer une commande : il se contourne en reformulant, ou il se corrige avec un test.

## Ce que le dispositif ne garantit pas

Il empêche des classes d'erreurs connues (lecture de données, git destructeur, écriture hors périmètre, artefacts de forme, régression lint et typage, tests cassés) et rend le reste visible (revue, quiz, journal, PR avec preuves). Il ne remplace ni la relecture de Melvyn dans VS Code ni la revue d'Edmond en PR : c'est justement pour ça qu'aucun commit ne part sans les deux.
