# Rapport brut : relecteur-eve, revue finale du lot 2b tranche 1 (apres cycle 1)

Lance dans la nuit du 16 au 17/09/2026. Depose tel quel, sans reformulation.

---

VERDICT : BLOCK

## Commandes relancees (sorties brutes)

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
Ran 93 tests in 0.519s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
OK     garde_git.py sur {"command": "bash -c \"git push --force\""} : code 2 (attendu 2)
OK     garde_perimetre.py sur {"command": "bash -c \"rm C:/dev/maos/CLAUDE.md\""} : code 2 (attendu 2)
(13 lignes OK, 0 alerte)

$ diff etat-depart/status.txt <(git status --porcelain)
IDENTIQUE
```

## Findings

| Sev | Fichier:ligne | Constat | Preuve | Correctif propose |
| --- | --- | --- | --- | --- |
| CRITIQUE | `_lib.py:115` | `_index_du_shell` saute **tout** token commencant par `/` comme si c'etait une option `cmd /c`. Un shell lance par son chemin absolu POSIX est invisible : les sept interdits de `git.md` et les ecritures hors perimetre rouvrent. C'est exactement le contournement que le lot pretend fermer. | `garde_git.decision('/usr/bin/bash -c "git push --force"', B)` -> **PASSE** ; `/bin/sh -c "git reset --hard"` -> PASSE ; `/c/Windows/System32/cmd.exe /c "git push --force"` -> PASSE ; `gp.decision("Bash", {"command": '/bin/bash -c "rm C:/dev/maos/CLAUDE.md"'})` -> PASSE. Les deux binaires existent sur le poste : `ls -l /usr/bin/bash /bin/sh` -> presents. | Ne sauter un token `/` que s'il ressemble a une option cmd (`^/[A-Za-z]{1,2}$`, verifie : `/c` et `/k` oui, `/usr/bin/bash` non). |
| HAUTE | `garde_perimetre.py:254` | `_cibles_ecriture` appelle toujours `_lib.premier_mot` (quatre enveloppes) alors que `_cibles_protegees` traverse les seize. Le perimetre est aveugle aux enveloppes, la zone `.env` non. Ecart avec `securite.md:22`. Le cycle a remonte la liste dans `_lib` sans la brancher ici. | `rm C:/dev/maos/CLAUDE.md` -> REFUSE ; `env rm C:/dev/maos/CLAUDE.md` -> **PASSE** ; idem `timeout 5 rm`, `nice mv`, `command rm`, `xargs rm`, `uv run rm`. | Faire calculer les programmes a `_cibles_ecriture` par `_programmes_invoques`. Test par enveloppe. |
| MOYENNE | `_lib.py:160` | Refus de trop introduit par le correctif 3 : `commande_non_analysable` cherche le token `-encodedcommand` dans **toute** sous-commande, shell ou non. Lire le code des verrous devient impossible. | `grep -rn -- "-EncodedCommand" .claude/hooks` -> `REFUS garde_git : commande encodee en base64, non analysable.` | Ne refuser que si `_index_du_shell(sous_commande) is not None`. |
| BASSE | `garde_perimetre.py:51-56` et `:168-170` | `ENVELOPPES` est un doublon exact de `_lib.ENVELOPPES_LANCEURS`, et les deux commentaires qui le justifient sont devenus faux. | `_lib.ENVELOPPES_LANCEURS == gp.ENVELOPPES` -> `True`. | Importer `_lib.ENVELOPPES_LANCEURS` et reecrire les commentaires. |

## Axes sans finding

- **Refus de trop par `_index_du_shell`** : 18 commandes courantes du poste passent toutes (`git log`, `git commit -m "Hooks: cmd support."`, `git grep -n bash .claude`, `grep -rn "bash -c" .claude/hooks`, `git bisect run sh`, `git -C C:/dev/bdfg-core status`, `uv run python -m pytest`, `npm run build`, `timeout 30 ... manage.py test`, `command -v python`...). La condition « en position de programme » tient.
- **Copie / deplacement dans `_cibles_ecriture`** : 9 cas legitimes passent (`mv` intra projet, scratchpad vers projet, projet vers scratchpad, `Move-Item -Path/-Destination` intra projet, `mv` dans `bdfg-core`, `cp` et `Copy-Item` depuis l'exterieur vers le projet). Aucune regression.
- **Doctrine `securite.md:24`** : les 7 formes nommees et les 12 enveloppes testees refusent bien, cote git et cote perimetre. Double imbrication et `-EncodedCommand` refuses en bloc.

**Synthese** : le cycle n'a pas casse ce qu'il visait, mais la meme cause que le finding 1 d'origine subsiste sous une autre forme : `_index_du_shell` confond un chemin Git Bash avec une option, et `/usr/bin/bash -c "git push --force"` passe les deux verrous sur un poste ou ce binaire existe. Tant que ce trou est ouvert, le lot ne tient pas sa these.
