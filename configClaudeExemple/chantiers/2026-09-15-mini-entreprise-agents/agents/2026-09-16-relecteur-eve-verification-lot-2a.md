# Rapport brut : relecteur-eve, verification independante du lot 2a

Lance dans la nuit du 16/09/2026, apres implementation. Depose tel quel, sans reformulation. Les
affirmations ci dessous n'engagent que l'agent tant que le fil ne les a pas reverifiees
(voir `revue-lot-2a.md`).

---

VERDICT : BLOCK

Motif : une ecriture sur `.env` passe encore par un mecanisme que la spec et `securite.md` declarent couvert (`sed -i`). Les tests ne sont pas casses et `git status` n'a pas bouge.

## Sorties brutes, relancees de ma main

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
........................................................................
Ran 72 tests in 0.533s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
OK     garde_perimetre.py sur {"file_path": ".env"} : code 2 (attendu 2)
OK     base .env : sqlite3 C:/tmp/local_test.sqlite3
(13 lignes OK, aucune alerte)

$ .venv/Scripts/ruff.exe check .claude/hooks/garde_perimetre.py
All checks passed!

$ diff chantiers/.../etat-depart/status.txt <(git status --porcelain)
IDENTIQUE (12 lignes, aucune de .claude/)
```

72 tests = 58 existants + 14 nouveaux, coherent avec le plan.

## Findings

| Sev | Lieu | Constat | Preuve | Correctif |
| --- | --- | --- | --- | --- |
| CRITIQUE | `garde_perimetre.py:137` | La forme longue de `sed` echappe. Le test ne joue que `-i`. Spec l.89 et `securite.md` l.21 annoncent `sed -i` couvert | `[PASSE] 'sed --in-place s/sqlite/mssql/ .env'` ; `_cibles_protegees(['sed','--in-place','s/a/b/','.env']) -> []` ; `[REFUS] 'sed -i.bak s/a/b/ .env'` | accepter `t.startswith("--in-place")` dans `edite_en_place`, et ajouter le cas au test |
| HAUTE | `garde_perimetre.py:50` `SCRIPTS` | Un shell imbrique n'est dans aucune famille : sa commande devient **un seul token** et rien n'est analyse | `decouper_commande('bash -c "rm .env"') -> [['bash','-c','rm .env']]` ; `[PASSE]` pour `bash -c "rm .env"`, `bash -lc "echo DB=x > .env"`, `sh -c 'rm -f .env.dev1'`, `zsh -c`, `cmd.exe /c del .env`. **Angle mort preexistant** : `bash -c "rm C:/dev/maos/CLAUDE.md"` passe aussi le perimetre, alors que `rm C:/dev/maos/CLAUDE.md` est refuse | ajouter `bash`, `sh`, `zsh`, `cmd` a `SCRIPTS` : le motif ancre sur le texte joint attrape alors `.env`. Sinon, ecrire la limite |
| MOYENNE | `.claude/rules/securite.md:21`, `.claude/README.md:14` | Ecart livre/annonce : « quel que soit le moyen » et « refuse toute ecriture » sont plus larges que le livre. La limite est ecrite dans la spec (l.111) et le plan, nulle part dans la doctrine que Melvyn lit | `[PASSE]` : `curl -o .env url`, `wget -O .env url`, `echo .env \| xargs rm`, `find . -name .env -delete`, `tar -xf a.tar .env`, `vim -es -c 'wq' .env` | une phrase de limite dans `securite.md` : les programmes hors des trois familles et les shells imbriques echappent |
| MOYENNE | `garde_perimetre.py:149-152` | Refus de trop non documente : `-path` est traite en destination pour la famille copie, alors que c'est la **source** de `Copy-Item`. Le plan l.91 exige qu'une copie depuis `.env` passe (sauvegarde avant edition) | `[REFUS] Copy-Item -Path .env -Destination chantiers/sauvegarde.txt` ; equivalent bash `[PASSE] cp .env chantiers/sauvegarde.txt` | retirer `-path`/`-literalpath` de la branche `VERBES_DESTINATION` seule (`move-item` et `set-content` restent couverts par leurs familles) |
| BASSE | `.claude/rules/securite.md:21` | Le faux positif accepte (nom commencant par `.env`) est ecrit dans la spec l.74, pas dans la doctrine. Le test l.308 joue `environnement.md` sans le point, donc il ne montre pas le cas | `[REFUS] Write chantiers/x/.environnement.md` ; `[REFUS] python -c "print('.environnement')"` | une demi ligne dans `securite.md` : renommer, ou passer par un fichier de script |

Ce qui tient : les 15 cas de refus du plan, plus les guillemets, les trois formes de chemin absolu, les espaces, `install`, `ln`, `rsync`, `1>`, `2>`, `&>`, `>|`, le heredoc, le tube, `python -m`, `Set-Content -LiteralPath`, `Copy-Item -Destination`, la casse melangee, `.venv/Scripts/python.exe -c`. Les lectures (`cat`, `grep`, `ls`, `Get-Content`, `Read`) et le travail courant (suite de tests, `doctor`, `ruff`, `manage.py`) passent. `git checkout -- .env` est deja refuse par `garde_git` (verifie). Doctrine relue : `CLAUDE.md:33`, `README.md:14` et `l.48`, fiche `developpeur-eve:33` sont coherents avec le code.

Preuve vivante du verrou : ma propre sonde `python -c "... '.env' ..."` a ete refusee par le hook en conditions reelles, message « zone protegee en ecriture, .env » (sortie recopiee dans le fil). C'est aussi l'illustration du faux positif assume sur les interpreteurs.

Aucun fichier du depot modifie ; mes sondes sont dans le scratchpad de session.
