# Rapport brut : relecteur-eve, revue de cloture du lot 2b tranche 1 (apres cycle 2)

Lance dans la nuit du 16 au 17/09/2026. Depose tel quel, sans reformulation.

---

VERDICT : NEEDS_WORK

Le cycle 2 n'a pas regresse (97 tests OK, doctor 13 OK, arbre identique au depart, tous les findings deja traites restent refuses), mais le lot ne tient pas sa these : une enveloppe presente sur le poste (`winpty`) fait encore passer un shell imbrique, et `garde_git` ne traverse aucune enveloppe quand `git` est appele directement.

| Sev | Fichier:ligne | Constat | Preuve | Correctif propose |
| --- | --- | --- | --- | --- |
| CRITIQUE | `garde_git.py:44` (`_arguments_git`) | Seuls `sudo`, `time`, `exec` sont sautes : une enveloppe devant `git` rend le verrou aveugle, sans aucun shell imbrique. Les sept interdits de `git.md` rouvrent avec un prefixe de 4 caracteres. | sonde : `env git push --force origin develop`, `timeout 5 git reset --hard`, `command git clean -fd`, `nohup git branch -D`, `nice git checkout .`, `uv run git stash clear`, `npx git commit --amend`, `winpty git push origin develop` = PASSE ; seul `sudo git push --force` refuse. | Dans `_arguments_git`, sauter en tete les tokens de `_lib.ENVELOPPES_LANCEURS` prives de `git` (plus leur argument numerique) avant le test `premier_mot != "git"` ; un test par interdit derriere `env `, `timeout 5 `, `uv run `. |
| CRITIQUE | `_lib.py:95` (`ENVELOPPES_LANCEURS`) | `winpty` et `start` existent sur le poste (`/usr/bin/winpty`, `/usr/bin/start`) et ne sont pas dans la liste : le shell imbrique redevient invisible aux deux verrous. | `winpty bash -c "rm <protege>"` PASSE, `winpty bash -c "rm C:/dev/maos/CLAUDE.md"` PASSE, `winpty bash -c "git push --force origin develop"` PASSE, `start cmd /c del <protege>` PASSE. | Ajouter `winpty`, `start`, `script`, `busybox` a `ENVELOPPES_LANCEURS` ; test sur chacune devant `bash -c`. |
| HAUTE | `garde_perimetre.py:248-286` (`_cibles_ecriture`) | Le cycle 2 a aligne les **programmes** sur `_cibles_protegees` mais pas les **familles** : `VERBES_ECRITURE_RARES`, `find -delete` et les indices .NET manquent cote perimetre. Ecriture hors perimetre libre, y compris derriere `bash -c`. | `curl -o <hors> https://x` PASSE, `bash -c "dd if=a of=<hors>"` PASSE, `[IO.File]::Delete('<hors>')` (outil PowerShell) PASSE, `find <hors> -name x -delete` PASSE ; memes formes sur `.env` = refuse. | Partager les familles entre les deux fonctions (une seule table), ou recopier `VERBES_ECRITURE_RARES`, `supprime_par_find` et `dotnet` dans `_cibles_ecriture`. |
| MOYENNE | `garde_perimetre.py:256` | Refus de trop introduit par le cycle 2 : `npm` etant une enveloppe, `install` (VERBES_DESTINATION) devient un programme. Avant, `premier_mot` rendait `npm`. | `npm install C:/dev/csdr_codex/pkg` et `npm install --prefix C:/dev/csdr_codex` = REFUS ecriture hors perimetre. | Ne pas ouvrir la position de programme apres `npm`, `npx`, `uv`, `poetry` sauf pour un shell, ou retirer `install` de `VERBES_DESTINATION`. Test de non refus. |
| MOYENNE | `securite.md:24` vs code | Ecart : la puce annonce les enveloppes traversees « par garde_perimetre **et** par garde_git » (faux, finding 1) et la ligne 22 annonce `curl -o`, `wget -O`, `dd`, `patch`, `tar`, `find -delete` couverts (vrai pour `.env` seulement, finding 3). Les limites non suivies n'incluent pas un interpreteur qui relance un shell. | `python -c "import os, sys; os.system('git push --force origin develop')"` PASSE aux deux verrous. | Corriger le code d'abord, puis la puce ; ajouter `python -c "os.system(...)"` aux limites ecrites. |

Synthese : aucune regression du cycle 2 hors un faux positif mineur sur `npm install`, mais deux trous exploitables (`env git ...`, `winpty bash -c ...`) et une asymetrie perimetre/zone protegee interdisent la cloture ; les quatre correctifs sont locaux et testables.

## Sorties brutes relancees

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
Ran 97 tests in 0.542s
OK

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s). Dispositif : .claude/README.md
(13 lignes OK, 0 alerte, les deux sondes imbriquees au code 2)

$ git status --porcelain compare a etat-depart/status.txt
IDENTIQUE, 12 lignes inchangees
```

Non regression des findings deja traites :

```text
refuse  | git   | env bash -c "git push --force origin develop"
refuse  | git   | timeout 5 bash -c "git reset --hard"
refuse  | git   | /usr/bin/bash -c "git clean -fd"
refuse  | git   | uv run bash -c "git branch -D x"
refuse  | git   | pwsh -EncodedCommand ZwBpAHQA
PASSE   | perim | grep -- "-EncodedCommand" .claude/hooks/_lib.py
refuse  | perim | Move-Item -Path C:/dev/maos/CLAUDE.md -Destination .
refuse  | perim | env rm C:/dev/maos/CLAUDE.md
refuse  | perim | env bash -c "rm C:/dev/maos/CLAUDE.md"
```

Trous mesures :

```text
PASSE   | env git push --force origin develop
PASSE   | timeout 5 git reset --hard
PASSE   | command git clean -fd
PASSE   | nohup git branch -D features/autre/x
PASSE   | nice git checkout .
PASSE   | uv run git stash clear
PASSE   | npx git commit --amend -m x
PASSE   | winpty git push origin develop
refuse  | sudo git push --force origin develop
PASSE   | git   | winpty bash -c "git push --force origin develop"
PASSE   | perim | winpty bash -c "rm <protege>"
PASSE   | perim | start cmd /c del <protege>
PASSE   | Bash  | curl -o C:/dev/maos/CLAUDE.md https://x
PASSE   | Bash  | bash -c "dd if=a of=C:/dev/maos/CLAUDE.md"
PASSE   | PowerShell | [IO.File]::Delete('C:/dev/maos/CLAUDE.md')
PASSE   | Bash  | find C:/dev/maos/CLAUDE.md -name x -delete
refuse  | Bash  | curl -o <protege> https://x
refuse  | PowerShell | [IO.File]::Delete('<protege>')
refuse  | Bash  | find . -name <protege> -delete
REFUS   | npm install C:/dev/csdr_codex/pkg | ecriture hors perimetre
```

Sondes ecrites uniquement dans le scratchpad, aucun fichier du depot modifie, aucune commande d'ecriture reelle lancee. Note de methode : ma propre premiere sonde a ete refusee par `garde_perimetre` a cause du faux positif `npm install <hors>` dans un document en ligne, ce qui confirme le finding 4 en conditions reelles.
