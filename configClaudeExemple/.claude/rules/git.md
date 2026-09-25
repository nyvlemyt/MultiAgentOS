# Git : ce que je fais sur le dépôt

Dépôt Azure DevOps `bdfgestion-python/EveBackEnd`. `develop` est la source de vérité, `master` la production, `test1` la version de test. Edmond GERARD décide et développe activement ; Melvyn travaille sur ses branches. Le verrou `garde_git.py` refuse mécaniquement les commandes interdites.

## Branches

- Une branche par chantier : `features/melvyn/<sujet>`, créée depuis `develop` à jour.
- Push uniquement sur `features/melvyn/*`. Aucun commit, merge, rebase ni push sur `develop`, `master`, `test1`.
- Les PR se créent dans l'interface Azure DevOps, par Melvyn ; je rédige la description avec `/pr`.

## Commits

- Je ne committe et ne pousse que sur demande explicite de Melvyn, après qu'il a relu les changements dans VS Code. Entre deux demandes, tout reste dans l'arbre de travail.
- Convention du dépôt (Edmond, Tania) : anglais, `scope: description.` avec point final. Exemples : `Data quality: add freshness.`, `ISSEquityEsgIssuerData: iss_esg_rating_last_modification as DateField.`
- Un commit = un sujet. Une migration = un seul changement de modèle ; les changements en attente qui ne sont pas les miens restent en dehors.
- Pas de ligne `Co-Authored-By` : les commits portent le seul nom de Melvyn (décision du 08/09/2026).

## Interdits, sans exception

`push --force` et variantes, `reset --hard`, `clean`, `branch -D`, `checkout .` ou `checkout -- <fichier>`, `restore <fichier>` (seul `restore --staged` est permis), `stash drop`, `stash clear`, `commit --amend`, `--no-verify`, `config --global`, suppression de tag ou de branche distante, `rebase` interactif ou d'une branche partagée.

Ces interdits valent **sous les formes suivantes, chacune mesurée au corpus** (lot 3, 17/09/2026, `.claude/hooks/tests/corpus_contrat.py` ; une variable de shell reste hors de portée, voir `securite.md`) : options groupées ou abrégées comme git les lit (`-nm` vaut `-n -m`, `--amen` vaut `--amend`), enveloppes (`env git`, `timeout 5 git`, `winpty git`), mots clés du shell, shells imbriqués, substitutions, interpréteurs (`os.system`, `subprocess.run([...])`, `system("...")`), PowerShell (`Start-Process git`, blocs, pipeline, `Invoke-Expression` refusé), et alias (résolus contre la configuration par `git config --get alias.<nom>`, un alias `!shell` est refusé ; non joués au corpus, qui ne dépend d'aucune configuration du poste). Leurs **équivalents** le sont aussi : `switch --discard-changes` ou `-f`, `checkout <fichier ou dossier existant>` ou `./`, `reflog delete` et `expire`, `read-tree --reset`, `checkout-index -f`, `send-pack --force`, `fetch` avec une refspec forcée (`+x:y`) ou vers une branche partagée, `branch -f`, `branch -d <branche partagée>`, `worktree remove --force`, `merge --no-verify`, `stash -u` ou `--all` (ils emporteraient `.env` hors de l'arbre), et sur une branche partagée `cherry-pick`, `revert`, `pull`, `am`. Une clé de configuration qui exécute du code (`core.hooksPath`, `core.fsmonitor`, `core.sshCommand`, `alias.*`, `credential.*`, `diff.external`...) ne s'écrit ni ne s'injecte, ni par `-c` ni par `--config-env` (collé ou espacé, lot 3bis du 18/09/2026). Un argument de git construit à l'exécution ou venu d'un tube est refusé, sauf la valeur d'un message (`-m "$(cat <<'EOF' ... EOF)"` passe). **Reste ouvert** : la lecture de configuration (`config --get`, `--list`, une seule clé, même `--global`), et dans un dépôt hors périmètre (`git -C C:/dev/maos`) la seule lecture (`log`, `show`, `fetch`, `status`) : toute sous-commande qui écrit y est refusée par le périmètre, comme `clone`, `init` ou `worktree add` vers l'extérieur.

## Le travail en attente

Un `git stash` protège du travail non relu (exemple : le chantier DateField du 08/09/2026). Il se réapplique avec `git stash pop` sur sa branche d'origine, jamais autrement. Le journal du chantier concerné en garde la trace.
