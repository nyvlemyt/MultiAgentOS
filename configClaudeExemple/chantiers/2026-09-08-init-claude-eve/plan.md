# Plan : dispositif Claude Code pour EVE

Spec : `design.md`. Niveau : structurant. Exécuté le 08/09/2026 dans le fil principal, tâche par tâche, chaque tâche avec sa vérification. Détail et sorties dans `journal.md`.

| # | Tâche | Vérification | État |
| --- | --- | --- | --- |
| 0 | Mettre de côté le travail DateField : patch et migration copiés dans son chantier, `git stash push -u`, retour sur `develop` | `git status` vide, `git stash list` = 1, patch de 134 lignes | fait |
| 1 | Exclusions locales dans `.git/info/exclude` | `git check-ignore` liste CLAUDE.md, CONTEXT.md, .claude, chantiers, ruff.toml, pyrightconfig.json, graphify-out, .graphifyignore | fait |
| 2 | Outils du poste : ruff, coverage dans le venv ; pyright via npx | ruff 0.16.6, coverage 7.16.0, pyright 1.1.413 | fait |
| 3 | Configs : `ruff.toml` (select explicite E4 E7 E9 F B, F403/F405 ignorés), `pyrightconfig.json`, `.graphifyignore` | `ruff check . --statistics` = 35 findings préexistants | fait |
| 4 | Tests des verrous d'abord, puis `_lib`, `garde_donnees`, `garde_git`, `garde_perimetre`, `verif_style` | 33 tests verts ; auto-vérification de forme sans problème | fait |
| 5 | `doctor.py`, `gate.py`, `settings.json` | `doctor --complet` : 10 OK, 2 alertes attendues, auto-tests OK ; gate FAIL sur un fichier d'essai fautif (3 findings attendus) puis PASS sur develop (157 tests) | fait |
| 6 | Règles (5), `CLAUDE.md`, `CONTEXT.md` | `verif_style` sans problème ; question de contrôle au redémarrage | fait, contrôle au redémarrage |
| 7 | Skills : graphify (csdr), 9 de Pocock, explain-diff adapté, `REGISTRE.md` | lecture intégrale faite ; aucun `openai.yaml` restant ; `check-explanation.sh` adapté | fait |
| 8 | Agents (4) et commandes (6) | `verif_style` sans problème | fait |
| 9 | graphify : graphe construit, PATH utilisateur, hook post-commit | 892 nœuds, requête répond ; PATH utilisateur contient `.local\bin` ; `.gitattributes` créé par le hook déplacé dans `.git/info/attributes` | fait |
| 10 | Mémoire : fusion des fiches dans `c--dev-Eve-EveBackEnd`, faits corrigés, nouvelles fiches, index | `MEMORY.md` : 10 entrées ; ancien bucket : script pour Melvyn (hors périmètre) | fait, ancien bucket : Melvyn |
| 11 | Poste : lanceur `eve.cmd`, 4 doublons superpowers retirés, commentaire VS Code | doublons déplacés ; commentaire mis à jour ; lanceur : `a_lancer_par_melvyn.ps1 -Apply` | fait, lanceur : Melvyn |
| 12 | Documents : `.claude/README.md`, `chantiers/INDEX.md`, `_cadre/Cadre_assistant_IA_EVE.md`, `_decisions/0001`, `dashboard.html`, `journal.md`, `handoff.md` | présents, `verif_style` sans problème | fait |
| 13 | Vérification finale : tests, `doctor --complet`, gate, `git status` propre | sorties dans `journal.md` | fait |
| 14 | Au redémarrage de Claude Code (Melvyn) : ligne `doctor EVE`, question de contrôle sur `CLAUDE.md`, verrou testé à la main | à consigner dans `journal.md` à la session suivante | Melvyn |
