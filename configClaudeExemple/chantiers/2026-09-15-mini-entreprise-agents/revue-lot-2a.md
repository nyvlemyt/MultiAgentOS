# Revue du lot 2a : la zone protegee en ecriture

Ecrite par le fil dans la nuit du 16/09/2026, a partir des rapports bruts deposes dans `agents/`.
Chaque commande citee ici a ete **relancee de ma main**, pas recopiee d'un rapport d'agent.

Le fil ecrit ce fichier, et non l'agent : `relecteur-eve` declare `tools: Read, Grep, Glob, Bash` et sa
fiche dit qu'il n'ecrit jamais. Lui demander d'ecrire son verdict l'obligerait a contourner sa propre
fiche par une redirection. La regle MAOS « lire le fichier du verdict, pas le retour du chat » est tenue
autrement : le rapport brut est depose tel quel avant toute synthese, et chaque verification est
relancee. Arbitrage ecrit dans `_decisions/0010`, ligne 10.

## Le deroule, et ce qu'il a coute

| Etape | Agents | Verdict | Findings | Ce qui en est sorti |
| --- | --- | --- | --- | --- |
| Attaque de la spec r1 | 3 `relecteur-eve` (preuve, chaine, aval) | spec cassee | 12, aucun ecarte | Le motif ne pouvait pas marcher : `_lib` ne reconnait jamais un token commencant par un point. Spec r2. |
| Attaque du plan r1 | 2 `relecteur-eve` (enchainement, preuve) | plan casse | 11, aucun ecarte | La forme de correctif figee ratait un cas exige par la spec et en refusait un qui devait passer. Plan r2. |
| Verification independante | 1 `relecteur-eve` | **BLOCK** | 5 | `sed --in-place`, `bash -c`, `curl -o`, `tar`, `find -delete` passaient encore. Cycle 1. |
| Contre-verification | 1 `relecteur-eve` | **NEEDS_WORK** | 7 | `find -exec`, les enveloppes (`env`, `timeout`, `nice`, `stdbuf`), l'outil `PowerShell` lui meme. Cycle 2. |
| Revue finale | 1 `relecteur-eve` | **NEEDS_WORK** | 7 | Deux **regressions du cycle 2** (une option numerique rouvrait la position de programme ; les indices .NET s'appliquaient a toute commande shell), la forme statique des appels .NET, et deux phrases de doctrine encore plus larges que le code. |

**Huit agents, 42 findings, aucun ecarte.** Tous reverifies de ma main avant d'etre acceptes, par des
sondes qui appellent la fonction pure et dont la sortie brute est au journal.

## Le verdict, et pourquoi le lot s'arrete la

**Verdict retenu : NEEDS_WORK.** Le lot est **livre et fonctionnel, il n'est pas valide.** La boucle
bornee du mode autonome autorise deux cycles de correction apres un verdict non PASS, puis une nouvelle
revue ; au troisieme echec, on consigne et on remet la main a Melvyn. Les deux cycles sont consommes et
la revue finale n'a pas rendu PASS : **le lot s'arrete ici, il ne part pas pour un cycle 3.**

Une seule chose a ete faite apres ce troisieme verdict, et elle est bornee a ce que j'avais casse :

| Finding de la revue finale | Traite ? | Pourquoi |
| --- | --- | --- |
| Refus de trop sur `grep -m 1 rm .env` | **oui** | C'est une **regression que le cycle 2 avait introduite**, sur une commande de tous les jours. La laisser une nuit est pire que l'etat d'avant le cycle 2. |
| Indices .NET appliques a toute commande shell (`grep '.delete' .env` refuse) | **oui** | Meme motif : regression du cycle 2, sur une lecture. |
| Forme statique `[IO.File]::Delete` | **oui** | Trois chaines a ajouter : c'est **finir** ce que le cycle 2 declarait couvert, pas ouvrir un front. |
| `uv run python`, `git rm` | **oui** | Deux mots dans la liste des lanceurs, aucun faux positif mesure sur les dix commandes courantes du poste. |
| Copie .NET sortante refusee, inventaire `tar -tf` refuse | **non**, ecrit | Faux positifs, contournables, ecrits dans `securite.md`. |
| La liste de `securite.md` se lit comme exhaustive | **non**, reecrit | Corrige en **texte** : « notamment », et la limite des interpreteurs dite explicitement. |

Ce qui n'a **pas** ete fait : elargir encore la couverture. Chaque cycle de cette nuit a ferme des
trous et en a ouvert d'autres ; la regle bornee existe exactement pour ca.

## Ce que cette revue prouve, et qui depasse le lot

A l'issue de l'implementation, **la suite de tests etait verte (72), la gate etait verte, `doctor`
etait vert, et le verrou etait troue par cinq endroits**. Puis, apres le premier correctif, la suite
etait verte (76) et il l'etait encore par quatre autres.

Une porte de verification qui se contente de relancer les tests du lot ne verifie rien. Ce qui a
trouve les neuf trous, c'est un relecteur qui **fabrique ses propres entrees** contre le contrat
annonce, et non contre le code livre. C'est le premier critere a inscrire dans la fiche
`verificateur-eve` du lot 2d.

Second acquis, de meme nature : **la doctrine a ete fausse deux fois avant d'etre juste**. La premiere
version de `securite.md` disait « quel que soit le moyen », ce qui etait plus large que le livre. Un
verrou dont la regle ecrite promet plus que le code ne tient est pire qu'un verrou absent, parce qu'on
cesse de se mefier. La regle finale liste les familles couvertes **et** les trois qui ne le sont pas.

## Ce qui est livre

| Fichier | Ce qui change | Suivi par git ? |
| --- | --- | --- |
| `.claude/hooks/garde_perimetre.py` | 316 lignes (contre 148) : le verrou porte deux regles, un perimetre et une zone protegee. Sept constantes, quatre fonctions nouvelles. `_lib.py` et `garde_donnees.py` **non touches** | non |
| `.claude/hooks/tests/test_gardes.py` | classe `ZoneProtegeeEnEcritureTests`, 23 cas ; suite passee de 58 a 81 tests | non |
| `.claude/hooks/doctor.py` | une sonde `.env` dans `autotests()`, pas dans `verifications()` : le critere « 13 OK » reste binaire | non |
| `.claude/rules/securite.md` | la regle, sa source MAOS, le recours (main de Melvyn), les familles couvertes, les trois non-couvertures, les trois faux positifs | non |
| `.claude/README.md` | la ligne du verrou et la ligne « remettre la ligne sqlite » | non |
| `CLAUDE.md` | la ligne des verrous | non |
| `.claude/agents/developpeur-eve.md` | la clause en prose reste, elle couvre la lecture que le verrou laisse passer | non |
| `chantiers/_decisions/0010` | les onze arbitrages du lot, avec leurs alternatives ecartees | non |

**Aucun fichier suivi par git n'a ete touche.** Verifie apres chaque tache : `git status --porcelain`
identique a `etat-depart/status.txt`, les douze fichiers de la mission 0 intacts.

## Les preuves, relancees de ma main

```text
$ CLAUDE_PROJECT_DIR="$PWD" ./.venv/Scripts/python.exe .claude/hooks/tests/test_gardes.py
Ran 81 tests in 0.514s
OK

$ .venv/Scripts/ruff.exe check .claude/hooks/garde_perimetre.py
All checks passed!

$ npx --yes pyright .claude/hooks/garde_perimetre.py .claude/hooks/tests/test_gardes.py
0 errors, 0 warnings, 0 informations

$ ./.venv/Scripts/python.exe .claude/hooks/doctor.py --complet
doctor EVE : 13 OK, 0 alerte(s).
OK     garde_perimetre.py sur {"file_path": ".env"} : code 2 (attendu 2)

$ diff releve_avant.txt releve_final.txt
AUCUNE REGRESSION           (28 entrees du corpus existant, comportement identique)

$ git status --porcelain | diff etat-depart/status.txt -
GIT INTACT
```

## Ce qui reste ouvert, et que Melvyn lira au matin

1. **Trois contournements assumes**, ecrits dans `securite.md` : un chemin cache derriere une variable
   de shell, une cible passee par un tube a `xargs`, et tout programme qui ecrit sans figurer dans les
   familles listees. Le verrou borne les erreurs franches, pas la mauvaise foi.
2. **Trois faux positifs connus**, ecrits eux aussi : un nom voisin (`.environnement.md`), une ligne de
   document en ligne qui commence par un verbe d'ecriture, et la lecture d'un fichier protege passee a
   un interpreteur.
3. **Un angle mort preexistant du verrou de perimetre**, trouve en chemin et **non traite** :
   `bash -c "rm C:/dev/maos/CLAUDE.md"` passe, alors que la meme commande sans le shell est refusee.
   Correctif propose au journal, a prendre en entree du lot 2b.
4. **`/gate` ne passe jamais sur le code des verrous** (`gate.py:68` ecarte `.claude/`). Le dispositif
   de securite du poste n'est ni linte ni type par la porte qualite. Propose, non fait.
5. **Le manifeste d'empreintes ne couvre pas `CLAUDE.md`** : ni git ni le filet ne verraient une
   reecriture de la doctrine. Une ligne a ajouter, en entree du lot 2b.
