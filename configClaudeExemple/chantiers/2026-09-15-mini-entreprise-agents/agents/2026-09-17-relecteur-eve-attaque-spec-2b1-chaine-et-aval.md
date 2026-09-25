# Rapport brut : relecteur-eve, attaque de la spec du lot 2b tranche 1, axe chaine et aval

Lance dans la nuit du 16 au 17/09/2026. Depose tel quel, sans reformulation. Les affirmations
ci dessous n'engagent que l'agent tant que le fil ne les a pas reverifiees.

---

## Attaque de spec, axe chaine et aval : `design-lot-2b1.md`

| Id | Ligne visee | Scenario et preuve (sortie brute) | Confiance | Ce qui manque a la spec |
| --- | --- | --- | --- | --- |
| **C1 CRITIQUE** | l.52 et l.87 « `garde_git` hors perimetre » | `garde_git.decision(cmd, "features/melvyn/esgRatingLastModif")` : `REFUS \| git push --force` / `PASSE \| bash -c "git push --force"` / `PASSE \| bash -c "git push origin develop"` / `PASSE \| sh -c "git commit -m x"` / `PASSE \| pwsh -c "git reset --hard"` / `PASSE \| cmd /c git branch -D ...` / `PASSE \| bash -c "git stash clear"` / `PASSE \| bash -c "git checkout ."`. 7 interdits de `git.md` sur 7, plus la regle sous agent du 16/09, tombent avec un prefixe de 8 caracteres. `garde_donnees`, lui, est **clos** (6 sondes sur 6 en REFUS : il juge le texte, pas le verbe). Le trou restant le plus grave est donc git : effets partages et irreparables (force push, develop, travail non commite) | certain | aucune ligne ne date la tranche git ni n'interdit d'ecrire « shells imbriques fermes » dans `securite.md` avant elle : fermer 1 trou sur 2 en le disant ferme est pire que 2 trous ecrits |
| **C2 HAUTE** | l.90 « `_lib.py` n'est pas touche » | Le redecoupage est une propriete du **decoupage**, partagee. Le mettre dans `garde_perimetre` force la duplication a la tranche git. Preuve du gain manque : `PASSE \| ls C:/dev/Eve/Providers` mais `REFUS \| bash -c "ls C:/dev/Eve/Providers"` : faux positif de `garde_donnees` que la meme fonction corrigerait | certain | mettre la fonction dans `_lib` (parametre optionnel, appelants inchanges) ; la tranche git tient alors en 3 lignes |
| **C3 HAUTE** | l.70 « apparaitront comme `AJOUT` **une fois** » | Reference `manifeste.txt` = 95 fichiers, sans `CLAUDE.md`. Deux comparatifs successifs, sans rien modifier entre : `comparatif 1 : ['AJOUT CLAUDE.md', 'AJOUT CONTEXT.md'] \| code de sortie : 1` puis `comparatif 2 :` identique. C'est **permanent**, pas « une fois », et exit 1 permanent. Une ligne `AJOUT` ne porte pas d'empreinte : zero detection d'une reecriture de la doctrine tant que la reference n'est pas reprise. Le comparateur devient donc moins utile (bruit + exit 1), pas plus | certain | une action de la main de Melvyn (`--ecrire`, seule facon de demarrer la surveillance) en « a valider », et le critere devenu « apres reprise, une MODIFICATION de `CLAUDE.md` est listee » |
| **C4 MOYENNE** | l.66 « il doit accepter un chemin de fichier » | `relever()` avec `SURVEILLES` contenant `CLAUDE.md` : `CLAUDE.md releve ? False (aucune erreur levee)` (`rglob` sur un fichier rend `[]`). Oubli silencieux possible | certain | un test unitaire sur `relever()`, pas seulement « le comparateur les liste » |
| **C5 MOYENNE** | l.98 critere « `doctor --complet` rend 13 OK » | `doctor.autotests()` l.185-190 : 5 cas, tous en forme directe (`git push --force`, `Write C:/dev/maos/CLAUDE.md`). Le critere est **insensible** au correctif | certain | un cas `("garde_perimetre.py", Bash `bash -c "rm C:/dev/maos/CLAUDE.md"`, 2)` : `/verif-setup` etape 1 le montre a chaque session |
| **C6 BASSE** | l.83 (doc = `securite.md` seul) | Deviennent faux : docstring `garde_perimetre.py:11-12` (limite connue), commentaire `SHELLS_IMBRIQUES` l.42-44 « aucun jeu de verbes ne la voit », `.claude/README.md:37`. `securite.md:23` ne reste vrai que si le redecoupage **s'ajoute** au motif texte | probable | lister ces trois emplacements, et dire explicitement « additif » |
| **C7 BASSE** | l.57 `SURVEILLES` | `.git/info/exclude` : `ruff.toml`, `pyrightconfig.json`, `.graphifyignore` sont aussi a la racine hors git ; ce sont les **regles du gate**. Les affaiblir est invisible de git comme du manifeste | certain | les ajouter, ou ecrire pourquoi non |

**Effet de bord, travail courant** : aucun `bash -c` ni `pwsh -c` legitime dans le dispositif (seuls `$(cat graphify-out/.graphify_python) -c` et `& $py -c "import graphify"`, deja couverts par `SCRIPTS`, et aucun n'ecrit hors perimetre). Regression attendue nulle ; gain collateral si C2 est suivi.

**Synthese** : les deux sujets tiennent, mais la chaine est incomplete sur trois points prouves (git laisse ouvert sans date ni garde-fou de doctrine, fonction placee la ou elle ne se reutilise pas, surveillance de la doctrine sans valeur tant que la reference n'est pas reprise) ; C1 et C3 devraient etre tranches avant l'implementation.

Sondes dans le scratchpad de session. Aucun fichier du depot modifie.
