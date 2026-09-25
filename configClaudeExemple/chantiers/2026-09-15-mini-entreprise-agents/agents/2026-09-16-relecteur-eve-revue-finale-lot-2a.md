# Rapport brut : relecteur-eve, revue finale du lot 2a (apres les deux cycles de correction)

Lance dans la nuit du 16/09/2026. Il lui etait demande de chercher une regression introduite par le
cycle 2 et un ecart restant entre le code et la doctrine, pas de rejouer les findings precedents.
Depose tel quel, sans reformulation.

---

VERDICT : NEEDS_WORK

## Sorties brutes, relancées de ma main

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
...............................................................................
Ran 79 tests in 0.532s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
OK     garde_perimetre.py sur {"file_path": ".env"} : code 2 (attendu 2)
OK     base .env : sqlite3 C:/tmp/local_test.sqlite3   (13 OK, 0 alerte)

$ .venv/Scripts/ruff.exe check .claude/hooks/garde_perimetre.py
All checks passed!

$ diff chantiers/2026-09-15-mini-entreprise-agents/etat-depart/status.txt <(git status --porcelain)
IDENTIQUE   (12 lignes, aucune de .claude/)
```

Aucune régression mécanique : 79 tests (72 au cycle 1, +7), doctor et ruff propres, arbre de travail intact. Aucun fichier touché par moi ; sondes dans le scratchpad de session.

## Findings

| Sév | Lieu | Constat | Preuve (sondes sur `decision()` pure, nom protégé construit par concaténation) | Correctif |
| --- | --- | --- | --- | --- |
| HAUTE | `garde_perimetre.py:161` | **Refus de trop introduit par le cycle 2.** `en_position = nom in ENVELOPPES or nom.isdigit()` promeut en « position de programme » la valeur de n'importe quelle option numérique, pas seulement celle d'une enveloppe. La garde que le cycle 2 revendique tombe dès qu'on ajoute `-m`, `-A` ou `-B` | `PASSE grep rm .env` puis `REFUS-ZONE grep -m 1 rm .env` ; `REFUS-ZONE grep -A 2 tee .env` ; `_programmes_invoques(['grep','-m','1','rm','.env']) -> ['grep','rm']` | n'accorder la position qu'après une enveloppe : mémoriser la dernière enveloppe vue et n'accepter le chiffre que derrière elle. Ajouter `grep -m 1 rm .env` au test, sinon la garde reste prouvée par le seul cas qui marche |
| HAUTE | `garde_perimetre.py:56-59` | **Écart doctrine/code.** `securite.md:22` déclare couverts « les appels .NET qui écrivent depuis l'outil PowerShell ». La forme statique échappe : les indices sont ancrés sur un point (`.delete`, `.moveto`), la forme réelle porte `::` | `PASSE [IO.File]::Delete('.env')`, `PASSE [System.IO.File]::Delete('.env')`, `PASSE [IO.File]::Move('.env','x')`. Indices déclenchés : `[IO.File]::Delete -> []` contre `[IO.File]::Create -> ['::create']` (la liste mélange les deux conventions) | ajouter `::delete`, `::move`, `::replace` ; un cas de test par forme |
| MOYENNE | `securite.md:22` vs `garde_perimetre.py:195` | « les interpréteurs (`python -c`, **un script du dépôt**) » est annoncé couvert : en réalité la couverture s'arrête au nom cité sur la ligne de commande, et un lanceur qui n'est pas une enveloppe passe aussi | `PASSE ./.venv/Scripts/python.exe scripts/setup_local.py` (un script qui écrirait `.env` sans le nommer) ; `PASSE uv run python -c "open('.env','w')"` (`_programmes_invoques -> ['uv']`) | écrire la limite et ajouter `uv`, `poetry`, `npx` aux `ENVELOPPES` |
| MOYENNE | `garde_perimetre.py:195` | Les indices .NET sont testés sur **toute** commande shell, pas seulement sur l'outil `PowerShell`, contrairement au commentaire. Une lecture bascule alors en refus | `REFUS-ZONE grep '.delete' .env` (aucun interpréteur, aucun verbe d'écriture) ; `PASSE grep -rn 'queryset.delete' data/` | passer `nom_outil` à `_cibles_protegees` et n'appliquer les indices qu'à `PowerShell` |
| BASSE | `garde_perimetre.py:171-213` | Trois écritures de la **même copie sortante** sont jugées différemment, alors que `securite.md:22` l'autorise explicitement | `PASSE cp .env chantiers/sauvegarde.txt` ; `PASSE Copy-Item -Path .env -Destination chantiers/x.txt` ; `REFUS-ZONE (Get-Item '.env').CopyTo('chantiers/x.txt')`. Même famille : `REFUS-ZONE tar -tf sauvegarde.tar .env` alors qu'un inventaire d'archive est une lecture | documenter les deux, ou traiter la copie .NET par sa seule destination |
| BASSE | `garde_git.py:21,123` | **Refus manquant hors des deux limites écrites** : `git` n'est pas une enveloppe côté périmètre, et `rm` n'est pas une sous-commande surveillée côté git. Portée réelle faible, `.env` n'étant pas suivi | `PASSE` aux deux verrous pour `git rm .env` et `git rm -f --cached .env`, alors que `git clean -fdx`, `git checkout -- .env` et `git restore .env` sont bien refusés par `garde_git` | ajouter `rm` aux sous-commandes git surveillées, ou l'écrire en limite |
| BASSE | `securite.md:22` | Écart en sens inverse : le code couvre plus que la liste, qui se lit comme exhaustive (`command`, `xargs`, `zsh`, `ksh`, `dash`, `mkdir`, `rmdir`, `unlink`, `shred`, `rsync`, `install`, `ln`, `Rename-Item`, `New-Item`, `Clear-Content`, `Set-ItemProperty`) | tous vérifiés refusés | écrire « notamment » : une liste qui se lit exhaustive vieillit mal |

## Synthèse

Le cycle 2 n'a cassé aucune protection acquise (les 15 refus du plan, `sed --in-place`, les cinq enveloppes, les shells imbriqués, `find -exec` et `find -delete`, la casse, les redirections, les lectures `cat`/`grep`/`ls`/`Get-Content`/`Read` : tous revérifiés de ma main), mais il a introduit un refus de trop qui annule sa propre garde dès qu'une option prend un chiffre, et deux phrases de `securite.md` restent plus larges que le code. Pas BLOCK parce que la forme qui échappe est un appel .NET statique, pas un geste courant, et que tous les verbes de destruction usuels restent refusés ; NEEDS_WORK parce que la phrase de doctrine est fausse telle qu'écrite et doit être corrigée, en code ou en texte, avant validation.
