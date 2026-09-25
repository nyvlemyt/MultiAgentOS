# Revue du lot 2b, tranche 1 : les shells imbriques

Ecrite par le fil dans la nuit du 16 au 17/09/2026, a partir des rapports bruts deposes dans `agents/`.
Chaque commande citee ici a ete **relancee de ma main**.

## Verdict : NEEDS_WORK. La tranche est livree, elle n'est pas validee.

| Etape | Agents | Verdict | Findings | Ce qui en est sorti |
| --- | --- | --- | --- | --- |
| Attaque de la spec | 2 `relecteur-eve` | spec fausse de cible | 12 | **Le trou le plus grave n'etait pas celui que je visais** : les sept interdits de `git.md` tombaient derriere `bash -c`. Et un relecteur a **prototype** mon correctif, montrant qu'il etait trop etroit et trop large. Spec r2. |
| Verification | 1 | **BLOCK** | 4 | `env bash -c` rouvrait tout ; `Move-Item -Path` (regression du lot) ; `-EncodedCommand` opaque. Cycle 1. |
| Revue finale | 1 | **BLOCK** | 4 | `/usr/bin/bash -c` invisible (regression du lot) ; le perimetre aveugle aux enveloppes ; `grep -- "-EncodedCommand"` refuse a tort (regression du lot). Cycle 2. |
| Revue de cloture | 1 | **NEEDS_WORK** | 5 | `env git` sans shell ; `winpty` absent ; familles manquantes cote perimetre ; `npm install <hors>` refuse a tort (regression du lot). |

**Quatre agents, 25 findings, aucun ecarte.** Les deux cycles de correction autorises sont consommes ;
la boucle bornee ferme la tranche.

**Apres le troisieme verdict, une seule chose a ete faite : fermer la regression que j'avais moi meme
introduite** (`npm install <chemin hors perimetre>` etait devenu un refus). Aucun elargissement de
couverture. Les quatre autres findings sont ecrits ci dessous avec leur correctif exact, et attendent.

## Ce qui est livre et prouve

`_lib.decouper_commande` gagne un parametre `profondeur` **dont le defaut reproduit exactement le
comportement historique** : le verificateur a prouve que `garde_donnees` voit exactement ce qu'il
voyait (onze commandes, zero ecart). `garde_git` et `garde_perimetre` l'appellent avec `profondeur=2`.

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
Ran 98 tests in 0.542s
OK

$ les sept interdits de git.md, forme directe puis forme imbriquee
  direct REFUS  |  bash -c REFUS   (les sept)
  REFUS  /usr/bin/bash -c "git push --force"
  REFUS  env bash -c "git push --force"      timeout 5, command, uv run, nice, stdbuf : idem
  REFUS  pwsh -EncodedCommand <base64>

$ l'angle mort preexistant du perimetre, signale au lot 2a
  REFUS  bash -c "rm C:/dev/maos/CLAUDE.md"     <- etait PASSE avant cette tranche
  REFUS  env rm C:/dev/maos/CLAUDE.md
  REFUS  mv C:/dev/maos/x.md chantiers/x.md     <- defaut preexistant, tombe en chemin

$ non regression
  diff releve_avant.txt releve_z.txt        AUCUNE REGRESSION   (28 entrees)
  PASSE  git status, git add, uv run python -m pytest, npm run build, npm install <hors>,
         timeout 30 python manage.py test, mv intra projet, cp depuis l'exterieur,
         grep -rn "bash -c" .claude/hooks, grep -- "-EncodedCommand" .claude/hooks
  All checks passed!                        (ruff, les quatre fichiers touches)
  0 errors, 0 warnings, 0 informations      (pyright)
  doctor EVE : 13 OK, 0 alerte(s).          (avec deux sondes en forme imbriquee)
  GIT INTACT
```

## Ce qui reste ouvert, avec son correctif exact

Ces quatre points sont **ecrits dans `securite.md`**, pour qu'aucune regle du poste ne promette plus que
ce que le code tient. C'est la lecon de la nuit, apprise trois fois.

| # | Trou, mesure | Correctif exact | Gravite |
| --- | --- | --- | --- |
| 1 | **Une enveloppe devant `git`, sans shell** : `env git push --force`, `timeout 5 git reset --hard`, `uv run git stash clear`, `winpty git push` passent. `garde_git._arguments_git` ne saute que `sudo`, `time`, `exec`. Seul `sudo git push --force` est refuse. | Dans `_arguments_git`, sauter en tete les tokens de `_lib.ENVELOPPES_LANCEURS` prives de `git`, plus leur argument numerique, avant le test `premier_mot != "git"`. Un test par interdit derriere `env `, `timeout 5 `, `uv run `. | **critique** : c'est le verrou qui protege du travail non commite |
| 2 | **`winpty` et `start` ne sont pas dans les enveloppes**, et existent sur ce poste : `winpty bash -c "..."` redevient invisible aux deux verrous. | Ajouter `winpty`, `start`, `script`, `busybox` a `_lib.ENVELOPPES_LANCEURS`. Un test par enveloppe devant `bash -c`. | critique |
| 3 | **Le perimetre n'applique pas les familles que la zone protegee applique** : `curl -o <hors>`, `dd of=<hors>`, `find <hors> -delete`, `[IO.File]::Delete('<hors>')` passent, alors que les memes formes sur un `.env` sont refusees. | Partager une seule table de familles entre `_cibles_ecriture` et `_cibles_protegees`, plutot que de les recopier. C'est la vraie cause : **deux fonctions font le meme travail avec deux tables**, et chaque correctif n'en corrige qu'une. | haute |
| 4 | **Un interpreteur qui relance un shell** : `python -c "os.system('git push --force')"` passe aux deux verrous. | Ajouter `os.system`, `subprocess`, `check_call` aux indices de script, et redecouper leur argument. Ou l'ecrire comme limite definitive. | moyenne |

**Le finding 3 nomme la vraie dette de ces deux nuits** : `_cibles_ecriture` et `_cibles_protegees`
font le meme travail sur deux tables differentes. Chaque correctif de la nuit n'en a corrige qu'une, et
la revue suivante a trouve l'autre. Tant qu'elles ne partagent pas leur table, ce cycle se repetera.
C'est la premiere chose a faire dans la tranche suivante, avant tout nouveau verbe.

## Ce que ces deux nuits ont etabli, et qui depasse les lots

1. **Une suite de tests verte ne prouve rien d'un verrou.** Cinq fois : 72, 76, 79, 90, 93 tests verts,
   et a chaque fois un trou exploitable. Ce qui les a trouves, c'est un relecteur qui **fabrique ses
   propres entrees contre le contrat annonce**, jamais contre le code livre.
2. **Corriger un defaut en introduit un autre, regulierement.** Quatre regressions de ma main en une
   nuit, toutes trouvees par la revue suivante, aucune par les tests. Et a chaque fois, **la
   connaissance necessaire etait deja ecrite dans le depot, quelques heures plus tot, par moi.**
3. **Une doctrine qui promet plus que le code est pire qu'une absence de doctrine**, parce qu'on cesse
   de se mefier. Trois fois cette nuit, une phrase de `securite.md` a du etre retrecie apres mesure.

Ces trois points sont les criteres de la fiche `verificateur-eve` du lot 2d.
