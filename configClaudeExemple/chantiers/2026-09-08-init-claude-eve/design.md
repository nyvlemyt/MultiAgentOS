# Dispositif Claude Code pour EVE : spécification

Chantier : `2026-09-08-init-claude-eve`. Niveau de rigueur : structurant (il cadre tous les chantiers suivants).
Validé par Melvyn au fil d'une session de brainstorming le 08/09/2026 (sections 1 à 5 approuvées une à une).

## 1. Contexte et objectif

Melvyn reprend EVE (backend Django/Ninja/Polars/Pandera, dépôt Azure DevOps `bdfgestion-python/EveBackEnd`) après le départ de Tania. Edmond GERARD est le décideur et, depuis l'été 2026, le développeur actif du dépôt (les 20 derniers commits de `develop` sont les siens : module data_quality, tests de bout en bout). Le projet est destiné à durer et vit dans un environnement d'entreprise : données providers sous licence, base partagée EveDev, déploiement IIS sur le serveur de dev.

Objectif du dispositif : que chaque intervention de l'assistant soit faite avec la rigueur d'un professionnel expérimenté, **sans rien casser, sans rien faire de plus que ce qui est demandé, sans commit avant relecture humaine**, avec une trace complète et présentable à la hiérarchie. Les erreurs de classe connue sont empêchées mécaniquement ; les autres sont rendues visibles avant de compter.

Ce dispositif ne prétend pas à l'infaillibilité : il garantit que les erreurs sont bornées, visibles et réversibles.

## 2. Décisions prises

| N° | Décision | Motif |
| --- | --- | --- |
| D1 | Configuration dans `EveBackEnd\` (CLAUDE.md, CONTEXT.md, `.claude/`, `chantiers/`, configs outils), exclue via `.git/info/exclude` | Là où sont le code, git, le venv, les tests et VS Code. Rien ne change dans le `.gitignore` partagé, Edmond ne voit rien tant que Melvyn ne partage pas |
| D2 | Dossier canonique `C:\dev\Eve\EveBackEnd` ; lanceur `eve.cmd` corrigé ; mémoire de `c--dev-EVE` fusionnée dans `c--dev-Eve-EveBackEnd` | Une seule mémoire, une seule racine de projet |
| D3 | Gate qualité locale sur le diff (ruff, pyright basic, tests complets, couverture en information), config hors dépôt | Zéro régression du fait de l'assistant sans nettoyer les 650 findings préexistants ni engager Edmond |
| D4 | Superpowers (plugin) garde le processus ; sélection de 9 skills de Matt Pocock vendus corps intacts ; explain-diff (maos) adapté ; graphify (csdr) | Une seule famille par fonction, aucun doublon, tout est lisible et éditable hors ligne |
| D5 | Aucune mention `Co-Authored-By` dans les commits | Choix de Melvyn ; les commits portent son seul nom |
| D6 | Aucun commit sans demande explicite ; relecture dans VS Code sur l'arbre de travail | Melvyn veut voir chaque changement avant qu'il soit figé |
| D7 | Artefacts de chantier dans `EveBackEnd\chantiers\` (exclu) plutôt que dans `C:\dev\Eve\` | Visibles dans l'explorateur VS Code, dans le même bucket mémoire |
| D8 | Quatre fiches agents en lecture seule (chercheur, architecte, relecteur, rédacteur), code écrit dans le fil principal | Un seul auteur cohérent que Melvyn relit ; les agents analysent, comparent, relisent |
| D9 | Trois niveaux de rigueur (léger, standard, structurant), décidés à l'entrée, jamais en dessous | Rigueur constante sans cérémonie inutile ; en cas de doute on monte |
| D10 | Commits dans la convention du dépôt : anglais, `scope: description.` | Suivre la logique déjà utilisée (Edmond, Tania) |

## 3. Arborescence

```text
C:\dev\Eve\EveBackEnd\
  CLAUDE.md                 point d'entrée court, renvoie aux règles
  CONTEXT.md                langage partagé EVE (glossaire), format Pocock
  ruff.toml  pyrightconfig.json   configs outils du poste (VS Code les lit aussi)
  .graphifyignore
  .claude/
    settings.json           hooks + liste blanche de commandes en lecture seule
    README.md               manuel du dispositif : chaque pièce, test, désactivation
    rules/                  chargées nativement (.claude/rules/*.md, Claude Code 2.1.258)
      donnees.md  git.md  qualite.md  securite.md  communication.md
    hooks/
      _lib.py               normalisation des chemins, découpage des commandes
      garde_donnees.py      PreToolUse : refuse toute lecture des données
      garde_git.py          PreToolUse : refuse les opérations git dangereuses
      garde_perimetre.py    PreToolUse : refuse toute écriture hors périmètre
      verif_style.py        PostToolUse Edit/Write : artefacts IA et forme ; aussi appelé par gate
      doctor.py             SessionStart : état des garde-fous en une ligne ; mode complet
      gate.py               la gate qualité (/gate)
      tests/test_gardes.py  tests unitaires des verrous
    commands/
      chantier.md  gate.md  revue.md  pr.md  fin-session.md  verif-setup.md
    skills/
      REGISTRE.md           une ligne par skill : source, version, pourquoi, mise à jour, ré-audit
      graphify/  explain-diff/  domain-modeling/  code-review/  codebase-design/  research/
      resolving-merge-conflicts/  writing-for-agents/  handoff/  wait-what/  teach/
    agents/
      chercheur-eve.md  architecte-eve.md  relecteur-eve.md  redacteur-eve.md
  chantiers/
    INDEX.md                liste des chantiers et leur état
    _cadre/Cadre_assistant_IA_EVE.md   deux pages pour Edmond
    _decisions/NNNN-slug.md            fiches de décision (format ADR court)
    <date>-<sujet>/         design.md  plan.md  journal.md  revue.md  pr.md  handoff.md  dashboard.html  explications/
  graphify-out/             graphe AST du code, reconstruit localement
```

Tout ce qui précède est listé dans `.git/info/exclude`. `git status` reste propre.

## 4. Composants

### 4.1 Règles (`.claude/rules/`)

- **donnees.md** : lecture interdite des dossiers de données (`Providers`, `Archives Tania`, `tmp_uploads`, `data_import_files`, `EVE_old`, partage F:) et de tout `.csv/.xlsx/.xls/.parquet` hors documents identifiés ; noms et tailles autorisés ; jamais de valeur ligne à ligne affichée depuis une base (agrégats, comptages, schéma : oui) ; EveDev en lecture seule sur demande explicite, jamais de `migrate` ni d'écriture ; `.env` lisible avec secrets masqués ; `token_api.txt` jamais lu.
- **git.md** : branches `features/melvyn/<sujet>` depuis `develop` ; push uniquement sur ses branches ; jamais de commit, merge, push vers `develop`/`master`/`test1` ; jamais de `--force`, `reset --hard`, `clean`, `branch -D`, `checkout .`, `restore <fichier>`, `stash drop`, `--amend`, `--no-verify` ; commits et push uniquement sur demande ; convention `scope: description.` en anglais ; une migration = un sujet ; pas de `Co-Authored-By`.
- **qualite.md** : chercher le motif existant avant d'écrire ; CRLF dans le dépôt, éditions ciblées ; cohérence schéma pandera / modèle Django / migration / documentation à chaque changement de champ ; `/gate` avant tout commit ; TDD pour toute logique nouvelle ; tests Arrange-Act-Assert nommés par comportement ; le plus petit diff qui résout le problème ; seuils ECC en avertissement (fonction < 50 lignes, fichier < 800, imbrication ≤ 4) ; commentaires pour le pourquoi, densité du fichier ; documentation mise à jour dans la langue du fichier ; aucune dépendance ajoutée sans demande, version épinglée.
- **securite.md** : rien du dépôt ni des données ne sort de la machine ; recherches externes limitées à de la documentation publique ; tout skill tiers lu intégralement avant vendorisation ; aucun serveur MCP non validé ; secrets jamais affichés ; `/security-review` avant chaque PR ; niveau structurant pour tout ce qui touche l'authentification, l'upload, les requêtes, le système de fichiers.
- **communication.md** : français ; l'essentiel d'abord, imagé avant le jargon, chemins et chiffres précis ; toujours finir par la suite et une recommandation ; aucune étape sautée ; périmètre strict, constats hors périmètre listés et proposés, jamais faits ; toute réponse ayant modifié le disque se termine par la liste des fichiers touchés ; messages destinés à des tiers rédigés dans le style de Melvyn (pas de tirets de ponctuation, pas de formules creuses, sources citées) ; sujet structurant = dashboard HTML vivant du chantier ; correction continue ; fin de session = handoff + mémoire.

### 4.2 Verrous (hooks, Python du venv, sans dépendance)

| Hook | Événement | Ce qu'il refuse |
| --- | --- | --- |
| `garde_donnees.py` | PreToolUse sur Read, Grep, Glob, Edit, Write, MultiEdit, NotebookEdit, Bash, PowerShell | toute cible sous une racine de données ou portant une extension de données hors liste blanche ; en Bash/PowerShell, seule une commande de métadonnées (`ls`, `dir`, `du`, `stat`, `find` sans `-exec`, `Get-ChildItem`, `Measure-Object`) peut viser ces chemins ; `token_api.txt` |
| `garde_git.py` | PreToolUse sur Bash, PowerShell | voir git.md ; chaque sous-commande d'une chaîne est inspectée ; la branche courante est lue par `git rev-parse` |
| `garde_perimetre.py` | PreToolUse sur Edit, Write, MultiEdit, NotebookEdit, Bash, PowerShell | toute écriture hors : projet, mémoire du bucket, scratchpad de session, `~/.claude/settings.json` |
| `verif_style.py` | PostToolUse sur Edit, Write, MultiEdit | tirets cadratins et demi-cadratins, guillemets courbes dans le code, caractères invisibles, BOM, emojis dans le code, fins de ligne mélangées ou changées par rapport à HEAD, espaces en fin de ligne, tabulations, absence de saut final, formules de remplissage, marqueurs de travail non terminé et textes de substitution ; ignore `.claude/skills/`, `graphify-out/`, migrations, les fixtures de ses propres tests et le dossier mémoire (frontmatter réécrit par l'outil) |
| `doctor.py` | SessionStart | n'interdit rien : affiche l'état (hooks, outils, exclusions, `.env`, branche, stash, mémoire) |

Contrat : stdin JSON, `exit 2` + message français sur stderr = refus. Chaque verrou est testé par `tests/test_gardes.py` et à la main par `echo '{...}' | python garde_x.py`.

### 4.3 Gate (`/gate`, `gate.py`)

1. Fichiers concernés : `git diff --name-only develop...HEAD`, modifiés, non suivis ; `.py` ; migrations exclues.
2. Ruff sur la version courante et sur la version de base (worktree temporaire de `develop`) ; seuls les findings nouveaux bloquent.
3. Pyright basic (`npx --yes pyright`, interpréteur du venv), même comparaison.
4. `verif_style` sur les fichiers touchés.
5. `manage.py test` complet, `DB_CONFIG` sqlite forcé, `PYTHONIOENCODING=utf-8` ; couverture des fichiers touchés en information (`--sans-couverture` pour aller vite).
6. Seuils ECC en information, en distinguant préexistant et introduit.
Verdict PASS/FAIL en tête. Option `--journal <chemin>` pour tracer dans le chantier.

### 4.4 Skills (voir `REGISTRE.md`)

Superpowers 6.1.1 (plugin, processus : brainstorming, writing-plans, executing-plans, TDD, systematic-debugging, verification-before-completion, requesting-code-review). Pocock `3cca18b` (2026-09-04) : `domain-modeling`, `code-review`, `codebase-design`, `research`, `resolving-merge-conflicts`, `writing-for-agents`, `handoff`, `wait-what`, `teach`, corps intacts, `agents/openai.yaml` retirés. `explain-diff` (maos) adapté : sortie dans `chantiers/<chantier>/explications/`, références MAOS retirées, script de contrôle conservé. `graphify` 0.9.51 (csdr). Redirections dans CLAUDE.md : `handoff` écrit dans le chantier ; `resolving-merge-conflicts` ne committe pas ; `teach` travaille dans `chantiers/apprentissage/` ; `code-review` prend `rules/qualite.md` pour standard et `design.md` pour spec.

Procédure d'ajout : identité, doublon, coûts (installation, maintien, retrait), lecture intégrale, décision (adopter, adapter, rejeter), ligne au REGISTRE avec date de ré-audit.

### 4.5 Agents (`.claude/agents/`, lecture seule, ≤ 7 outils)

`chercheur-eve` (faits sourcés depuis le code, la doc, des sources publiques), `architecte-eve` (une proposition de conception avec compromis ; deux instances en concurrence au niveau structurant), `relecteur-eve` (standards, spec, robustesse, qualité des tests), `redacteur-eve` (docs, commentaires, CONTEXT.md, artefacts IA). Format des fiches : vue d'ensemble, quand, processus, rationalisations, signaux d'alerte, critères de vérification.

### 4.6 Commandes (`.claude/commands/`)

`/chantier <sujet>` (dossier, niveau, dashboard, brainstorm), `/gate`, `/revue` (relecture deux axes par `relecteur-eve`, sécurité, style, vérification contradictoire de chaque finding, `revue.md` avec guide de lecture du diff), `/pr` (description Azure DevOps : contexte, changements, vérifications avec sorties, risques, hors périmètre, points à trancher), `/fin-session` (handoff, mémoire, dashboard), `/verif-setup` (doctor complet).

### 4.7 Pipeline et points de validation humaine

| Étape | Produit | Validation Melvyn |
| --- | --- | --- |
| `/chantier` | dossier, dashboard, brainstorm | 1. la spec |
| plan | `plan.md` | 2. le plan |
| implémentation | code dans l'arbre de travail, `journal.md` au fil de l'eau | 3. le diff dans VS Code |
| `/gate` | verdict | 4. un PASS montré |
| `/revue` | `revue.md` | 5. findings et correctifs |
| explain-diff | page + quiz | 6. le quiz : rien ne part que Melvyn ne sache expliquer |
| `/pr` | `pr.md` | 7. relecture, puis commit et push sur demande |
| `/fin-session` | `handoff.md`, mémoire | |

Niveaux : léger (1 fichier, aucun contrat public, aucun comportement changé : gate, revue simple, liste des changements) ; standard (plusieurs fichiers ou comportement changé : tout le pipeline) ; structurant (contrat public, migration, nouveau module, architecture : pipeline complet, deux architectes, fiche de décision, `/security-review`).

### 4.8 Documentation, mémoire, poste

- `.claude/README.md` : manuel. `chantiers/_cadre/Cadre_assistant_IA_EVE.md` : note pour Edmond. `chantiers/INDEX.md`.
- Mémoire : fusion des 5 fiches de `c--dev-EVE`, faits périmés corrigés (tests verts sur develop, data_quality mergé, push autorisé sur ses branches, Edmond développeur actif), nouvelles fiches (décisions D5, D6, style), fiche unique de redirection dans l'ancien bucket.
- Poste : `Setup-ClaudeLaunchers.ps1` corrigé (`eve` vers `C:\dev\Eve\EveBackEnd`) et régénéré ; `%USERPROFILE%\.local\bin` ajouté au PATH utilisateur pour graphify ; 4 copies divergentes de superpowers retirées de `~/.claude/skills/` (déplacées, pas supprimées) ; commentaire de `.vscode/settings.json` mis à jour.
- graphify : `extract . --code-only` puis `cluster-only . --no-label` ; hook post-commit local via `graphify hook install`.

## 5. Critères de réussite (tous vérifiables)

- `git status` propre ; `git check-ignore` confirme chaque chemin du dispositif.
- `python -m unittest .claude/hooks/tests/test_gardes.py` : tous verts.
- `echo '{"tool_input":{"command":"git push --force"}}' | python .claude/hooks/garde_git.py` : code 2 ; idem lecture d'un fichier de `Providers\` par `garde_donnees.py` ; idem écriture dans `C:\dev\maos` par `garde_perimetre.py`.
- `python .claude/hooks/gate.py` sur `develop` : PASS, 157 tests (158 avec le test ajouté par le chantier DateField, en stash).
- `graphify query "insert_data"` répond ; `graphify-out/graph.json` existe.
- `python .claude/hooks/doctor.py --complet` : aucune alerte bloquante.
- Une seule mémoire active (`c--dev-Eve-EveBackEnd`), l'ancien bucket ne contient qu'une redirection.
- Au redémarrage de Claude Code : la ligne de statut de `doctor` apparaît, `CLAUDE.md` et les règles sont chargés (vérifié par une question de contrôle).

## 6. Hors périmètre

La base locale et l'intégration des données réelles (chantier 3) ; la compréhension du projet et le `CONTEXT.md` complet (chantier 2) ; l'audit pour Edmond (chantier 4) ; toute modification du dépôt partagé (`.gitignore`, `requirements.txt`, `pyproject.toml`) ; la reprise du chantier DateField (stash à réappliquer ensuite).

## 7. Risques connus

- Les hooks ne s'activent qu'à la prochaine session : validation finale au redémarrage.
- Quoting des commandes de hooks sous Windows : exécution via Git Bash, `$CLAUDE_PROJECT_DIR` supporté (vérifié dans le binaire 2.1.258).
- `npx pyright` télécharge à la première exécution (proxy : fonctionne, vérifié).
- Faux positifs possibles de `garde_perimetre` sur des commandes mixtes lecture/écriture : reformuler la commande, jamais désactiver le verrou.

## 8. Sources

csdr_codex (`AGENTS.md`, gate qualité, graphify), maos (`CLAUDE.md` §14, `docs/rules/common`, `intake-audit`, `explain-diff`, fiches agents, `skills-reference.md`, `dashboard-visuel-de-suivi.md`), mattpocock/skills `3cca18b` (README, `.agents/invocation.md`, skills retenus), mémoire `c--dev-EVE`, `C:\dev\Eve\README_WORKSPACE.md`.
