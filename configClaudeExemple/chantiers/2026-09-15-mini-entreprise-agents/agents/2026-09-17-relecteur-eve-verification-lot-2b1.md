# Rapport brut : relecteur-eve, verification independante du lot 2b tranche 1

Lance dans la nuit du 16 au 17/09/2026, apres implementation. Depose tel quel, sans reformulation.

---

VERDICT : BLOCK

## Relances, sorties brutes

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
Ran 90 tests in 0.521s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
OK     garde_git.py sur {"command": "bash -c \"git push --force\""} : code 2 (attendu 2)
OK     garde_perimetre.py sur {"command": "bash -c \"rm C:/dev/maos/CLAUDE.md\""} : code 2 (attendu 2)
(13 OK, 0 alerte)

$ .venv/Scripts/ruff.exe check .claude/hooks/_lib.py .claude/hooks/garde_perimetre.py .claude/hooks/garde_git.py
All checks passed!

$ diff chantiers/2026-09-15-mini-entreprise-agents/etat-depart/status.txt <(git status --porcelain)
IDENTIQUE
```

## Findings

| Sev. | Fichier:ligne | Constat | Preuve (mes sondes) | Correctif propose |
| --- | --- | --- | --- | --- |
| CRITIQUE | `_lib.py:100` (`commande_interne` appelle `premier_mot`) | Une enveloppe devant le shell rouvre **les sept interdits de git et l'ecriture hors perimetre**. `premier_mot` ne saute que `sudo/time/exec/nohup` ; `env`, `timeout`, `nice`, `command`, `xargs`, `stdbuf`, `uv run` ne sont pas traverses, donc `commande_interne` rend `None` et le redecoupage n'a pas lieu. Le depot connait deja ce trou (`garde_perimetre.ENVELOPPES`, 16 entrees, journal G2). | `env bash -c "git push --force"` -> PASSE ; `timeout 5 bash -c "git push --force"` -> PASSE ; idem `nice`, `command`, `xargs`, `uv run`, `stdbuf`. Memes formes sur `rm C:/dev/maos/CLAUDE.md` -> PASSE au perimetre. Temoin : `sudo bash -c "git push --force"` -> REFUS. | Faire traverser les enveloppes dans `commande_interne` (liste partagee ou parametre), pas seulement dans `garde_perimetre._programmes_invoques`. Un test par enveloppe. |
| HAUTE | `garde_perimetre.py:268` (`OPTIONS_VRAIE_DESTINATION` dans `_cibles_ecriture`) | **Regression introduite par ce lot** : `Move-Item -Path <hors> -Destination <projet>` supprime la source hors perimetre et passe. `_cibles_protegees` separe `VERBES_DEPLACEMENT` pour cette raison exacte ; `_cibles_ecriture` ne le fait pas. | `Move-Item -Path C:/dev/maos/CLAUDE.md -Destination chantiers/x.md` -> PASSE ; `-LiteralPath` -> PASSE. Monkeypatch `OPTIONS_VRAIE_DESTINATION = OPTIONS_DESTINATION` -> REFUS : la ligne 268 est la cause. `Copy-Item -Path <hors>` reste PASSE (le faux positif vise par la bascule). | Garder `OPTIONS_VRAIE_DESTINATION` pour les copies, mais reprendre `OPTIONS_DESTINATION` quand le programme est dans `VERBES_DEPLACEMENT`. |
| HAUTE | `_lib.py:89` (`-encodedcommand` dans `OPTIONS_COMMANDE`) | L'option est listee, mais le base64 n'est jamais decode : le redecoupage rend un token opaque qui ne matche rien. La spec (ligne 40) presente l'ajout comme une fermeture. | `pwsh -EncodedCommand <b64 UTF-16LE de "git push --force">` -> PASSE ; `commande_interne` rend `ZwBpAHQA...`. Meme forme avec `Remove-Item <hors>` -> PASSE au perimetre. | Decoder le base64 UTF-16LE avant redecoupage, ou refuser `-EncodedCommand` en bloc (aucun usage legitime du poste). |
| MOYENNE | `.claude/rules/securite.md:24` (et docstring `garde_perimetre.py:11-12`) | Ecart entre le livre et l'annonce : « **Un shell imbrique ne contourne rien** », et la liste « restent non suivis » ne cite que `bash script.sh` et le tube. Les enveloppes et `-EncodedCommand` manquent. | Les trois findings ci-dessus. | Ajouter les enveloppes et l'encodage a la liste des limites, une fois corriges ou non. |
| BASSE | `design-lot-2b1.md:50` | « Aucun usage legitime du poste n'imbrique **trois** shells » ; le code refuse des **deux** (`profondeur_imbrication > 1`), et `securite.md:24` dit « deux ». La spec se contredit avec la regle. | `bash -c "bash -c '...'"` -> prof=2 -> REFUS, message conforme dans les deux verrous. | Corriger la spec en « deux shells ». |

## Ce qui tient (mes propres relances)

- **`garde_donnees` non regresse** : 11 commandes, 11 attendus tenus (lecture Providers, `tmp_uploads/*.parquet`, le fichier de token, lecture via `bash -c`, `python -c` avec `read_csv` -> REFUS ; `ls -la <Providers>`, `dir tmp_uploads`, `du -sh data_import_files`, `cat data/api.py`, `grep`, `git status` -> PASSE). Et `decouper_commande(cmd) == decouper_commande(cmd, profondeur=1)` sur ces 11 commandes : **0 ecart**, il voit exactement ce qu'il voyait.
- **Aucun refus de trop** sur le travail courant : 24 sondes -> 24 PASSE (lecture, listage, ecriture projet, `git status` imbrique, `pwsh -Command` inoffensif, guillemets echappes, tube et `&&` internes, `grep -rn 'bash -c'`, `git commit -m "bash -c: ..."`, `Copy-Item -Path <hors> -Destination <projet>`, `bash -c "CLAUDE_PROJECT_DIR=$PWD ./.venv/Scripts/python.exe ..."`).
- **Formes fermees** : `bash -lc`, `sh -c` avec apostrophes, `cmd /c`, `cmd /k`, `bash --login -c`, espaces multiples, `BASH -C`, `/usr/bin/bash`, `bash.exe`, `powershell -Command`, `pwsh -NoProfile -Command`, `zsh -c`, `sudo`, `nohup`, `echo x && bash -c ...` -> REFUS, sur les sept interdits de git et sur l'ecriture hors perimetre. La zone protegee resiste aussi sous `env bash -c` (via `_programmes_invoques`, chemin independant).
- **Borne de profondeur juste** : prof=2 refuse avec son message propre dans les deux verrous ; `grep -rn 'bash -c' .claude/hooks`, `echo "bash -c hello"`, `git commit -m "bash -c: ..."`, `bash -c "echo bash -c hello"`, `bash -c "python -c 'print(1)'"`, `bash -c "git log --grep='sh -c'"` restent a prof 0 ou 1 et passent. Seul declenchement discutable : `bash -c "pwsh -Command 'Get-Date'"` (prof=2, refuse), coherent avec la regle ecrite.
- Detail BASSE non retenu comme trou : `bash -c -- "git push --force"` passe, mais bash executerait `--` et non la commande.

## Synthese

Le lot ferme proprement les formes nommees par la spec, et `garde_donnees` est prouve inchange. Mais un prefixe de quatre caracteres (`env `) rouvre les sept interdits de git et l'ecriture hors perimetre, `-EncodedCommand` reste opaque, et l'alignement de `_cibles_ecriture` a ouvert un trou sur `Move-Item -Path`. Le critere « binaire » de la spec n'est pas atteint : BLOCK. Les 90 tests sont verts mais aveugles a ces trois cas, aucun ne les couvre.

Sondes dans le scratchpad, aucun fichier du depot modifie.
