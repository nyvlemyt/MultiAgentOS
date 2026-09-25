# Journal : dispositif Claude Code pour EVE

Chantier `2026-09-08-init-claude-eve`, niveau structurant, aucune branche (rien n'entre dans le dépôt). Spec : `design.md`. Plan : `plan.md`.

## 08/09/2026

### Matinée : brainstorm (sessions précédentes de la journée)

Question de départ de Melvyn : comment voir sa base locale et savoir si elle est alimentée. Réponse établie : `manage.py test` crée une base séparée, en mémoire pour sqlite (`file:memorydb_default?mode=memory&cache=shared`, vérifié), et la détruit ; la base locale déclarée dans `.env` (`C:/tmp/local_test.sqlite3`) n'existe pas (`C:/tmp` absent). Puis re-cadrage par Melvyn : d'abord le dispositif Claude Code, ensuite la compréhension du projet, puis la base locale, enfin l'audit.

Décisions D1 à D10 (voir `design.md` §2), prises une à une. Sources explorées : csdr_codex, maos, mattpocock/skills (cloné, commit `3cca18b`), binaire Claude Code 2.1.258 (support natif de `.claude/rules/*.md` et de `$CLAUDE_PROJECT_DIR` dans les hooks, exécution via Git Bash), code de graphify (les dossiers datés sont ses sauvegardes quotidiennes).

### 18:30 : mise de côté du travail DateField

- Exclusions ajoutées à `.git/info/exclude` (section « Dispositif Claude Code »). `git check-ignore` : OK.
- `chantiers/2026-09-08-esg-rating-last-modification/` : `changements.patch` (134 lignes), copie de la migration `0025`, `journal.md`.
- `git stash push -u -m "esgRatingLastModif: ..."` puis `git switch develop`. `git status` vide, `git stash list` : 1, la migration est dans le stash (`stash@{0}^3`).

### 18:35 à 19:00 : installation

- `pip install ruff coverage` dans le venv : ruff 0.16.6, coverage 7.16.0. `npx --yes pyright --version` : 1.1.413 (proxy OK).
- `ruff.toml` : les défauts de ruff 0.16 activent environ 300 règles (PYI, UP, RUF, PLE, SIM...) ; `select` explicite `E4 E7 E9 F B`, `F403/F405` ignorés (motif `import *` du dépôt). Résultat sur le dépôt : 35 findings préexistants (15 B904, 15 F401, 2 F841, 2 B905, 1 F541).
- `pyrightconfig.json`, `.graphifyignore`.
- TDD des verrous : `tests/test_gardes.py` écrit d'abord (échec d'import constaté), puis `_lib.py`, `garde_donnees.py`, `garde_git.py`, `garde_perimetre.py`, `verif_style.py`. 24 tests verts sur les quatre gardes au premier passage, 33 après les ajouts.
- `doctor.py`, `gate.py`, `settings.json` (hooks PreToolUse, PostToolUse, SessionStart ; liste blanche lecture seule).
- Règles (5), `CLAUDE.md`, `CONTEXT.md` (squelette, 11 termes).
- Skills copiés : graphify (csdr), 9 de Pocock (`agents/openai.yaml` retirés, lecture intégrale faite : texte pur, aucun script ni appel réseau), explain-diff (maos) réécrit pour EVE. `REGISTRE.md`.
- Agents (4), commandes (6), `.claude/README.md`, `chantiers/INDEX.md`, `_decisions/0001`, `_cadre/Cadre_assistant_IA_EVE.md`.
- graphify : `extract . --code-only` (54 fichiers, 892 nœuds, 1 849 arêtes, 66 communautés), `cluster-only . --no-label`, requête de contrôle OK ; `uv tool update-shell` (PATH utilisateur) ; `graphify hook install` (post-commit, post-checkout, merge driver).
- Mémoire : 9 fiches écrites dans le bucket `c--dev-Eve-EveBackEnd` (5 fusionnées et corrigées, 4 nouvelles), index refait.
- Quatre copies divergentes de superpowers déplacées de `~/.claude/skills/` vers `~/.claude/skills_retirees_2026-09-08/`.

### Ce que les verrous ont fait pendant l'installation (ils se sont activés à chaud)

- `garde_perimetre` a refusé la correction du lanceur dans `C:\dev\` (hors périmètre : conforme). Action remise à Melvyn : `a_lancer_par_melvyn.ps1`.
- `garde_perimetre` : deux faux positifs sur des scripts Python en heredoc (séquences `\u2014` prises pour des chemins). Corrigé : un script inline est jugé sur ses chemins absolus locaux seulement ; cas ajouté aux tests.
- `verif_style` a signalé : un mot interdit dans `redacteur-eve.md` (corrigé), les fixtures du fichier de tests (exemption `/.claude/hooks/tests/`), un espace final dans le frontmatter des fiches mémoire ajouté par l'outil de mémoire (exemption `/.claude/projects/`), ses propres listes de motifs (exemption de son fichier), un mot interdit dans `design.md` (reformulé), le journal écrit en CRLF par `gate.py --journal` (corrigé : `newline="\n"`).
- Limite documentée : un chemin derrière une variable de shell (`$H/...`) n'est pas vu par `garde_perimetre` (le déplacement des skills globaux est passé ainsi ; l'action était prévue au design).

### Constats hors périmètre

- `.env` : `DB_CONFIG` pointe sur `C:/tmp/local_test.sqlite3`, dossier inexistant (à traiter au chantier base locale).
- Incohérences schéma/modèle et défauts connus : voir `project-eve-overview` en mémoire et le journal du chantier DateField.
- `graphify hook install` a posé un hook `post-checkout` et un merge driver dans la config git locale, et a **créé un `.gitattributes` à la racine du dépôt** (fichier suivi potentiel). Corrigé : ligne déplacée dans `.git/info/attributes`, fichier supprimé, `git check-attr merge graphify-out/graph.json` toujours `graphify`. À refaire si le hook est réinstallé.

### 19:04 : vérification finale

Gate de bout en bout avec un fichier d'essai fautif `data/_gate_essai.py` (import inutilisé, retour mal typé), puis supprimé :

```text
GATE FAIL (3 s, 3 bloquant(s))
  BLOQUANT ruff F401 data/_gate_essai.py : `data.type_schema.DataKey` imported but unused
  BLOQUANT ruff F401 data/_gate_essai.py : `os` imported but unused
  BLOQUANT pyright reportReturnType data/_gate_essai.py : Le type « int » n'est pas assignable au type de retour « str »
  info base : develop | fichiers .py touches : 1 : data/_gate_essai.py
  info ruff : 2 finding(s) sur les fichiers touches, 2 nouveau(x)
  info pyright : 1 diagnostic(s) sur les fichiers touches, 1 nouveau(x)
```

Gate complète sur `develop`, arbre propre :

```text
GATE PASS (82 s, 0 bloquant(s))
  info base : develop | fichiers .py touches : 0
  info tests : Ran 157 tests in 71.700s | OK | Destroying test database for alias 'default'...
```

157 tests sur `develop` ; le 158e (export Demain) est dans le stash du chantier DateField.

`doctor --complet` : 10 OK, 2 alertes attendues (branche `develop` : volontaire pendant l'installation ; mémoire dupliquée dans `c--dev-EVE` : script pour Melvyn). Auto-tests : tests des verrous OK ; `garde_git` sur `git push --force` code 2 ; `garde_donnees` sur un xlsx de `Providers` code 2 ; `garde_perimetre` sur `C:/dev/maos/CLAUDE.md` code 2 ; `garde_donnees` sur `data/api.py` code 0.

`git status --porcelain` vide après suppression du `.gitattributes` ; `git check-ignore` liste CLAUDE.md, CONTEXT.md, .claude, chantiers, ruff.toml, pyrightconfig.json, graphify-out, .graphifyignore.

### Reste à faire

- Melvyn : `chantiers/2026-09-08-init-claude-eve/a_lancer_par_melvyn.ps1 -Apply` (lanceur `eve.cmd`, ancien bucket mémoire), puis relancer Claude Code et vérifier la ligne `doctor EVE` au démarrage, poser une question de contrôle (« quel est l'ordre d'intégration ? »), tester un verrou à la main.
- Ensuite : chantier 2 (compréhension du projet), puis reprise du chantier DateField (`git switch features/melvyn/esgRatingLastModif`, `git stash pop`).

## 09/09/2026 : premières questions de Melvyn au redémarrage

Redémarrage constaté : ligne `doctor EVE : 10 OK, 1 alerte` au démarrage (branche `develop`, arbre propre, 1 stash, graphe à jour).

### Décision : graphify reste entièrement local

Melvyn : « on commit pas de truc graphify pour l'instant, tout reste pour moi en local ». État vérifié : `graphify-out/` et `.graphifyignore` exclus par `.git/info/exclude` ; hooks `post-commit` et `post-checkout` dans `.git/hooks/` (non versionnés) ; merge driver dans `.git/config` et attribut dans `.git/info/attributes` (non versionnés). Rien de graphify n'est suivi par git. Le merge driver ne sert que si `graph.json` était suivi : il est inerte tant que la décision tient. Point 3 de « À valider par toi » clos.

### Démonstrations faites pour Melvyn (scratchpad, rien dans le projet)

`verif_style.analyser` sur un fichier Python fabriqué avec les défauts typiques : 7 problèmes détectés (tiret cadratin, guillemet courbe dans du code, emoji, fins de ligne mélangées, espaces finaux, tabulation, pas de saut final). Non détectés sur cet exemple : le marqueur générique de travail non terminé (volontaire à l'époque : le dépôt en contient de légitimes ; le verrou ciblait les marqueurs d'assistant) et la formule de remplissage en anglais (la liste `FORMULES_REMPLISSAGE` était française pour l'essentiel). Melvyn a demandé le meilleur niveau : les deux sont ajoutés le 09/09, voir plus bas.

`garde_perimetre.decision` sur 7 cas : refus des écritures hors projet à chemin explicite (Write, redirection Bash, `Set-Content` PowerShell) ; autorisation des deux mêmes écritures quand le chemin est porté par une variable de shell (limite connue, point 2 de « À valider par toi », toujours ouvert).

### Constats hors périmètre du 09/09

- `garde_git` a refusé `git config --get core.hooksPath` (lecture seule) : faux positif, la règle vise `--global`, `--system` et l'écriture de `hooksPath`. Contourné en ne lançant pas la commande. Correctif proposé, non fait : autoriser `git config --get`, `--list`, `-l` ; ajouter le cas aux tests.
- Le fichier `.git` n'apparaît pas dans l'explorateur VS Code : comportement par défaut de VS Code (`files.exclude` contient `**/.git`), rien à voir avec le dispositif. Il est bien présent (`ls -d .git`).

### Décisions de Melvyn et corrections (fin de matinée)

- `a_lancer_par_melvyn.ps1 -Apply` exécuté par Melvyn : lanceur `eve.cmd` vers `C:\dev\Eve\EveBackEnd`, ancien bucket `c--dev-EVE` réduit à une redirection (5 fiches archivées). `doctor` ne signale plus la duplication : 10 OK, 1 alerte (branche `develop`).
- Question 1 (exemptions de `verif_style`) : conservées. Question 2 (variable de shell dans `garde_perimetre`) : limite acceptée et documentée, recommandation suivie.
- Melvyn : « corrige ce que tu dois corriger [...] `garde_git` et fais en sorte que `verif_style` soit excellent ».

Faux positif réel montré par Melvyn : `verif_style data/functions.py` (fichier intact) signalait « LF vers CRLF » et « pas de saut de ligne final ». Cause 1 : la base était lue par `git show HEAD:chemin`, qui rend le blob stocké (LF, `core.autocrlf=true`) alors que l'arbre de travail est en CRLF. Cause 2 : le saut final manque déjà dans `HEAD` (dernier octet `73` = « s »), donc rien d'introduit.

Corrections, en TDD (6 tests rouges d'abord, puis verts) :

- `verif_style.py` : base lue par `git cat-file --filters HEAD:chemin` (fins de ligne de l'arbre de travail) ; BOM, fins de ligne mélangées et saut final passés en logique delta comme le reste ; nouvelle fonction `analyser_detaille` qui sépare « introduit » et « préexistant » ; en ligne de commande, lignes `INTRODUIT` (code retour 1) et `preexistant dans HEAD, non bloquant` (information), `forme OK` sinon ; marqueurs de travail non terminé (todo, fixme, hack, en majuscules) **ajoutés** signalés, les existants du dépôt ne le sont pas ; neuf tournures anglaises d'assistant et trois françaises ajoutées à `FORMULES_REMPLISSAGE` (liste exacte dans le fichier ; elle n'est pas recopiée ici parce que le verrou la relirait comme des formules).
- `garde_git.py` : `git config` en lecture (`--get`, `--get-all`, `--get-regexp`, `--list`, `-l`) autorisé, même avec `--global` ; l'écriture globale, système ou sur `hooksPath` reste refusée, message précisant l'alternative.
- Ruff E741 (variable `l`) corrigé dans `doctor.py`, `gate.py`, `verif_style.py` ; clé `$schema` retirée de `pyrightconfig.json` (avertissement pyright).
- Incident d'outillage : toute séquence `\u` + 4 hexadécimaux envoyée par l'outil d'édition arrive en caractère littéral sur le disque, et un `\n` proche a été converti en vrai saut de ligne. Réparé par un script qui assemble l'échappement par concaténation (`chr(92) + "u2014"`). Règle pour moi : ne jamais écrire ces séquences directement dans un outil d'édition.

Résultats après correction :

```text
Ran 38 tests in 0.076s
OK
data/functions.py : preexistant dans HEAD, non bloquant : espaces en fin de ligne, lignes [419]
data/functions.py : preexistant dans HEAD, non bloquant : pas de saut de ligne final
data/functions.py : preexistant dans HEAD, non bloquant : marqueur de travail non termine ajoute (todo, fixme, hack en majuscules), lignes [171, 615]
code retour : 0
garde_git sur `git config --get core.hooksPath` : code 0 ; sur `git config core.hooksPath .githooks` : code 2
pyright .claude/hooks : 0 errors, 0 warnings
```

### Caractères cachés (« watermarks ») : détection et nettoyeur

Demande de Melvyn : bloquer tout caractère caché qui signerait un fichier écrit par l'assistant. Position tenue : je ne connais aucun mécanisme de ce genre et n'en insère pas volontairement, mais une absence ne se prouve pas, et l'incident des séquences d'échappement montre que des caractères non voulus peuvent arriver sur le disque. Réponse mécanique.

État avant : `verif_style` connaissait une liste de sept codes (largeur nulle, joints, bidi, trait d'union conditionnel, BOM). Balayage des fichiers texte suivis du dépôt (catégories Cf, Zs hors espace, Cc hors tabulation et fins de ligne, Zl, Zp, Co, Cn) : **0 fichier concerné**, base saine pour la logique delta.

Réalisé, en TDD (16 tests rouges puis verts, 47 au total) :

- `verif_style.py` : classification par catégorie Unicode (`unicodedata`) et non plus par liste, en huit familles : format invisible (Cf), contrôle (Cc), usage privé ou non assigné (Co, Cn), espace non standard (Zs), séparateur de ligne ou de paragraphe (Zl, Zp), sélecteur de variante hors séquence emoji, combinant non normalisé (NFC), homoglyphe (lettre cyrillique ou grecque adjacente à une lettre latine). Message avec les points de code et les lignes. Dans `documentation/`, où les emojis sont tolérés, le joint de largeur nulle et le sélecteur de variante qui suivent un emoji font partie de la séquence et ne sont pas signalés. Le refus du hook indique la commande de nettoyage.
- `nettoyer_caracteres.py` (nouveau) : même classification ; rapport seul par défaut (code 1 si des actions sont proposées), `--appliquer` réécrit en UTF-8 sans toucher aux fins de ligne ; suppression pour format, contrôle, privé, sélecteur ; espace simple pour espaces et séparateurs ; NFC pour les combinants ; homoglyphes remplacés par la lettre latine d'une table de 40 confusables, sinon laissés et signalés « non corrigé » ; BOM retiré ; fichier non UTF-8 ignoré. Jamais lancé automatiquement.
- `doctor.py` vérifie la présence du nettoyeur ; `README.md`, `qualite.md`, `CLAUDE.md` mis à jour.

Preuves :

```text
Ran 47 tests in 0.100s
OK
ruff .claude/hooks : All checks passed!   pyright .claude/hooks : 0 errors, 0 warnings
Fichier d'essai (scratchpad) : U+200B, U+E0041, U+00A0, U+0430 dans 3 lignes CRLF
  hook verif_style par stdin : code 2, 3 problemes (format, espace, homoglyphe) + commande de nettoyage
  nettoyer_caracteres sans option : 4 actions proposees, rien ecrit, code 1
  nettoyer_caracteres --appliquer : 33 -> 24 octets, CRLF conserves, code 0
  hook verif_style a nouveau : code 0
Balayage des fichiers ecrits par l'assistant (CLAUDE.md, CONTEXT.md, .claude/, chantiers/, memoire) : 84 fichiers, 0 avec caracteres caches
doctor --complet : 10 OK, 1 alerte (branche develop)
```

Limites dites : un homoglyphe hors de la table est signalé mais pas corrigé ; une lettre grecque ou cyrillique isolée (formule, mot russe entier) n'est pas un homoglyphe et n'est pas signalée ; le verrou ne voit que les fichiers écrits par les outils Edit, Write et MultiEdit, d'où le balayage manuel ci-dessus et `nettoyer_caracteres.py` pour tout autre fichier.
