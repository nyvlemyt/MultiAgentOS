# Rapport brut : relecteur-eve, attaque de la spec du lot 3, axe niveau de preuve et complétude du contrat, 17/09/2026

Déposé tel quel par le fil. Brief : design-lot-3.md, corpus_contrat.py, git.md, securite.md, donnees.md, revue-lot-2b1.md.

## Attaque de la spec du lot 3, axe niveau de preuve et complétude du contrat

Fichiers : `design-lot-3.md` (spec), `.claude/hooks/tests/corpus_contrat.py` (corpus). Aucun fichier modifié, aucun code exécuté.

| Sévérité | fichier:ligne | Constat | Preuve | Correctif proposé |
| --- | --- | --- | --- | --- |
| CRITIQUE | corpus:337 | Cas incohérent : `verrou="perimetre"`, attendu REFUS, note « garde_perimetre : PASSE ». Joué tel quel il est rouge à jamais ; et rien ne prouve que `garde_git` soit branché sur l'outil PowerShell | spec 4.3 l.111 « settings.json ne bouge pas », aucun cas git sur PowerShell | `Cas("ps_git_push_force","git","PowerShell",...,REFUS)` ; vérifier le branchement dans `settings.json` |
| CRITIQUE | spec:97, corpus:311 | Le modèle « `-delete` détruit son point de départ » rend `find . -name '.env' -delete` PASSE (`.` est dans le projet) ; le corpus attend REFUS | contradiction spec/corpus | spec : les motifs `-name`/`-path` de `find` sont des cibles ; ajouter `find . -name '.env' -exec rm {} \;` REFUS |
| HAUTE | spec:33, git.md | Variantes d'interdits sans cas : `git push origin +features/melvyn/x` (force par refspec), `git commit -n` (= `--no-verify`), `git push --no-verify`, `git checkout data/api.py` (sans `--`), `git restore --staged --worktree x`, `git branch --delete --force x`, `git config --file/--system` | corpus 89 à 111 : formes canoniques seulement | un cas REFUS par variante, `git restore -S x` PASSE |
| HAUTE | spec:115 à 119 | `.git/` protégé en écriture mais `git -c core.hooksPath=X commit`, `git config core.hooksPath X` obtiennent l'exécution de hook que la règle vise ; `-c` (« options globales », spec l.41) n'a aucun cas | corpus 258 à 262 | REFUS pour les deux ; PASSE `git -c color.ui=false log` ; REFUS `echo x > .git/info/exclude` |
| HAUTE | spec:51, corpus:176 | `-EncodedCommand` seul ; PowerShell accepte `-e`, `-ec`, `-enc`, `-encoded` | forme unique au corpus | `pwsh -enc <b64>` REFUS R_OPAQUE |
| HAUTE | spec:5, securite.md | Verbes promis « couverts » sans cas : `del`, `truncate`, `shred`, `Clear-Content`, `awk -i`, `git rm .env`, `New-Item .env`. Spec l.130 « pas de verbe hors du corpus » : ils sortiront du catalogue | grep du corpus : zéro occurrence | un REFUS chacun sur `.env`, `git rm --cached .env` PASSE |
| HAUTE | corpus:185 à 224 | Périmètre contournable : `cd C:/dev/maos && rm CLAUDE.md` (relatif après `cd`), `rm ../../maos/x.md`, `rm "C:\dev\maos\x.md"` (antislashs, lexeur non POSIX l.68 non épinglé), `rm $HOME/x` | aucun cas `cd`, `..`, antislash en Bash | trois REFUS ; `$HOME` PASSE annoté « limite » (critère 7) |
| HAUTE | corpus:338 à 362, donnees.md | Aucun REFUS sur l'outil PowerShell (`Get-Content`, `Import-Csv` d'un provider), ni `Archives Tania`, `EVE_old`, `F:`, `.xls`, ni redirection `<` depuis une donnée | seuls `dir`, `Get-ChildItem` en PowerShell | `Get-Content DONNEE` REFUS ; `python x.py < DONNEE` REFUS ; `cat "C:/dev/Eve/Archives Tania/n.csv"` REFUS (espace) |
| MOYENNE | corpus:105, git.md | `git config --global --get` PASSE cite « interdits sans exception » | règle sans exception | citer R_GIT_COURANT et écrire l'exception dans `git.md` après mesure |
| MOYENNE | securite.md, corpus:243 | `~/.claude/settings.json` (racine autorisée) sans cas ; scratchpad `Temp/claude/s/` ne ressemble pas au vrai (`c--dev-Eve-EveBackEnd/<session>/scratchpad`) | rien | Write settings.json PASSE, `settings.local.json` REFUS ; chemin réel |
| MOYENNE | spec:103, spec:194 | `pip install -e <hors>`, `uv pip install`, `ruff format`, `graphify update .`, `tee chantiers/x/log.txt`, `2>$null`, here-string `@' '@` PowerShell, continuation `\` : aucun PASSE | risque l.164 | un PASSE chacun |
| BASSE | corpus:122, 352 | `branch -d develop` et `ls -la token_api.txt` REFUS : `git.md` ne l'interdit pas, `donnees.md` autorise noms et tailles | règles citées | écrire la règle ou changer l'attendu |

Synthèse : le corpus tient les formes canoniques et les trous de la nuit, mais laisse ouvertes les variantes de git (`+refspec`, `-n`, `-c core.hooksPath`), un modèle `find` qui contredit son propre cas, le contournement par `cd`, et l'outil PowerShell côté git et données ; son cas 337 est infaisable tel qu'écrit.
