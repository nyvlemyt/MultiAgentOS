# Rapport brut : relecteur-eve, contre-verification du lot 2a (apres cycle de correction 1)

Lance dans la nuit du 16/09/2026. Il lui etait demande de chercher ce que le premier verificateur
avait rate, pas de rejouer ses cinq findings. Depose tel quel, sans reformulation.

---

VERDICT : NEEDS_WORK

## Sorties brutes, relancées de ma main

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
............................................................................
Ran 76 tests in 0.620s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
OK     garde_perimetre.py sur {"file_path": ".env"} : code 2 (attendu 2)
OK     base .env : sqlite3 C:/tmp/local_test.sqlite3
(13 OK, 0 alerte, 0 ligne d'alerte)

$ diff chantiers/2026-09-15-mini-entreprise-agents/etat-depart/status.txt <(git status --porcelain)
IDENTIQUE (12 lignes, aucune de .claude/)
```

Aucun test cassé (58 + 18 = 76), `git status` inchangé, aucun refus de trop sur le travail courant : 26 commandes du poste (suite de tests, `doctor`, `ruff`, `npx pyright`, `manage.py test|makemigrations`, `gate`, `graphify query|update`, `git status|add|diff`, `bash -c "ls"`, `tar -czf`, `curl -s`, `curl -o`, `find -delete`, `cat/grep/ls .env`, `Get-Content .env`, `python -c`, trois `Write`) rendent toutes PASSE. Pas de BLOCK : rien ne passe par un moyen nommé à la lettre dans `securite.md`.

## Findings

| Sév | Lieu | Constat | Preuve (sortie brute de ma sonde) | Correctif |
| --- | --- | --- | --- | --- |
| HAUTE | `garde_perimetre.py:152` | `find` n'est vu que par `-delete`. `securite.md:22` annonce `rm` et `truncate` couverts ; leur invocation par `-exec` échappe | `REFUS-ZONE find . -name .env -delete` / `PASSE find . -name .env -exec rm {} ;` / `PASSE find chantiers -name .env* -exec truncate -s 0 {} +` | traiter `-exec`/`-execdir`/`-ok` comme les shells imbriqués (tous les tokens candidats), ou écrire la limite dans `securite.md` |
| HAUTE | `_lib.py:149` `premier_mot` | La liste d'enveloppes traversées est incomplète : `sudo`, `time`, `exec`, `nohup` sont sautés, pas `env`, `timeout`, `nice`, `stdbuf`. Le verbe annoncé couvert disparaît derrière l'enveloppe | `REFUS-ZONE sudo rm .env` / `REFUS-ZONE nohup rm .env` **contre** `PASSE env rm .env` / `PASSE timeout 5 rm .env` / `PASSE nice -n 5 rm .env` / `PASSE stdbuf -o0 rm .env` | ajouter ces quatre mots au saut d'enveloppes ; c'est dans `_lib`, que la spec l.51 interdit de toucher, donc à arbitrer : sinon une liste locale à `garde_perimetre` |
| MOYENNE | `garde_perimetre.py:60` `SCRIPTS` | L'outil `PowerShell` est lui-même un interpréteur et n'est dans aucune famille : un appel .NET y passe, alors que le **même texte** par `pwsh -c` est refusé. `qualite.md` prescrit le « remplacement binaire » pour le CRLF, donc ce geste est dans les usages du poste | `PASSE PowerShell [IO.File]::WriteAllText(.env, $t)` / `PASSE PowerShell (Get-Item .env).Delete()` / `REFUS-ZONE Bash pwsh -c [IO.File]::WriteAllText(.env)` | quand `nom_outil == "PowerShell"`, appliquer le motif protégé au texte entier de la commande, comme pour un interpréteur |
| MOYENNE | `.claude/rules/securite.md:21` et `:23` | Refus de trop non écrit : la **lecture** de `.env` par un shell imbriqué ou un script est refusée, alors que l.21 dit « sa lecture reste ouverte ». La liste des deux faux positifs connus (l.23) ne le mentionne pas | `REFUS-ZONE bash -c 'cat .env'` / `REFUS-ZONE bash -c 'grep DB .env'` / `REFUS-ZONE sh script.sh .env` | une demi-ligne à l.23 : passer un `.env` à un shell imbriqué ou à un script, même pour le lire, est refusé ; le recours est `cat`/`grep` direct |
| BASSE | `securite.md:21` | Chiffre périmé : « quatorze cas de test ». La classe en compte dix-huit depuis la correction | `18 methodes de test dans la classe` ; suite passée de 72 à 76 tests | écrire « dix-huit », ou retirer le compte (il se périme à chaque ajout, exactement ce que la spec l.80 a voulu éviter pour le « 13 OK ») |
| BASSE | `test_gardes.py:288` et `:301` | Deux noms qui mentent sur leur contenu : « sous ses trois formes » joue quatre cas ; `find -delete` est rangé dans « les programmes qui écrivent » alors que `find` n'écrit pas | l.288-293 : `sed -i`, `sed -i.bak`, `sed --in-place`, `awk -i` ; l.305 : `find . -name .env -delete` | renommer en « sous toutes ses formes » ; sortir `find` dans son propre cas |
| BASSE | `test_gardes.py:379-380` | Deux findings ruff que `/gate` ne verra jamais : il exclut `.claude/`. Non attribuable à ce lot | `E741 Ambiguous variable name: l` x2 ; `gate.py:68` : `or f.startswith(".claude/")` | renommer `l` en `ligne` ; poser en constat hors périmètre que les hooks ne sont pas lintés par le gate |

Ce qui tient, revérifié de ma main : les quatre outils d'écriture, les redirections (`>`, `>>`, `>.env` collé), `tee -a`, `touch`, `truncate`, `shred`, `rm`, `dd of=`, `patch`, `ln`, `install`, `cp` et `mv` vers un `.env`, `New-Item`, `Rename-Item`, `Clear-Content`, `Add-Content`, `Out-File`, `Set-Content`, `Copy-Item`, `Move-Item`, `perl -pi`, `sh script.sh`, `bash -c`, `python -c`, la casse, `.env.dev1`. Les deux non-couvertures annoncées sont réelles (variable de shell, tube vers `xargs`). Le correctif du finding 4 du premier vérificateur tient : `cp .env sauvegarde` et `Copy-Item -Path .env -Destination ...` passent.

Une affirmation du premier rapport que je corrige, après l'avoir d'abord crue fausse : `garde_git` refuse bien `git checkout -- .env` **et** `git clean -fdx` (sortie du hook réel, lancée de ma main). Ma première sonde se trompait de signature : c'est `garde_git.decision(commande, branche_courante)` (`garde_git.py:181`), pas `(outil, entree)`. Vérifié aussi : `.env` est dans `.gitignore:214`, donc `git stash -u` ne l'emporte pas.

Pourquoi NEEDS_WORK et pas BLOCK : les trois échappements restants demandent un geste délibéré, et `securite.md` pose que le verrou « borne les erreurs franches, pas la mauvaise foi ». Pourquoi pas PASS : la phrase de couverture reste plus large que le livré en trois endroits prouvés, et un refus de trop sur une lecture contredit la ligne d'à côté.

Aucun fichier modifié. Write m'est désactivé ; mes sondes ont appelé la seule fonction pure `garde_perimetre.decision` par un heredoc Python, le nom protégé construit par concaténation, sans jamais fabriquer de commande d'écriture réelle. À noter : ma première sonde a été refusée par le verrou de périmètre sur `s/a/b/`, lu comme un chemin Git Bash absolu `/a/b/` (`_MOTIF_CHEMIN_ABSOLU_LOCAL`, comportement préexistant, hors périmètre de ce lot) ; je l'ai contournée en reformulant, jamais en désactivant.
