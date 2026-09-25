# Attaque du plan du lot 2a : findings et verification contradictoire

Deux `relecteur-eve` lances en parallele dans la nuit du 16/09/2026 sur `plan-lot-2a.md` revision 1 :
**enchainement** (E) et **niveau de preuve et surete** (Q). Rapports bruts dans `../agents/`.

**Verdict : le plan revision 1 aurait echoue en pleine execution.** La forme du correctif que j'avais
figee d'avance (« `_cibles_protegees` sur les tokens bruts ») rate un cas que ma propre spec exige, et
en refuse un qui doit passer. Les deux axes l'ont trouve chacun de son cote (E1 = Q1, puis E2).

Sonde de reverification de ma main, `scratchpad/sonde_zone_protegee.py`, sortie brute :

```text
-- Q2 : la casse, absorbee par normaliser --
  '.ENV'                           -> .env        protege ? True
  '.Env.DEV1'                      -> .env.dev1   protege ? True
  'C:\dev\Eve\EveBackEnd\.env'     -> .env        protege ? True
-- Q1 et E1 : le token d'un script inline --
  tokens : [['python', '-c', "open('.env', w).write(x)"]]
  basename du dernier token : "open('.env', w).write(x)" protege ? False
-- Q3 : le motif ancre face a os.environ --
  "open('.env', w)"                         -> ['.env']
  'import os; print(os.environ.get(TEMP))'  -> []
  'x = config.env'                          -> []
  './.venv/Scripts/python.exe'              -> []
  "Path('.env.dev1').write_text(s)"         -> ['.env.dev1']
  'settings.environment'                    -> []
-- Q4 : formes option=valeur et verbes hors listes --
  'dd of=.env'                  -> [['dd', 'of=.env']]                       premier_mot='dd'
  'awk -i inplace {print} .env' -> [['awk','-i','inplace','{print}','.env']] premier_mot='awk'
  'patch .env'                  -> [['patch', '.env']]                       premier_mot='patch'
-- E2 : cp depuis .env vers ailleurs, et vers .env --
  depuis : [['cp', '.env', 'D:/backup/env.txt']]
  vers   : [['cp', '.env.example', '.env']]
  mv     : [['mv', '.env', 'D:/backup/env.txt']]
-- Q7 : la variable de shell --
  [['D=.env'], ['echo', 'x', '>', '$D']]
-- E6 : ce que garde_perimetre voit d'un chemin hors perimetre --
  Write C:/dev/maos/.env : True
  Write <projet>/.env    : False
```

---

## Les deux defauts qui cassaient le plan

### E1 = Q1. Le nom du fichier est **dans** un token, jamais un token

**CONFIRME.** `python -c "open('.env','w')"` se decoupe en trois tokens dont le dernier est le script
entier. Le nom de fichier de ce token est le script lui meme, qui ne commence pas par `.env`. La spec
revision 2 exige pourtant ce cas (elle le classe comme la faille A3, celle par laquelle un script du
depot reecrit `.env`). T1 aurait donc ecrit un test rouge que T2 n'aurait pas pu verdir, et la porte
d'arret n 1 se serait declenchee au milieu du lot.

**Correction retenue** : pour les interpreteurs (`SCRIPTS`), chercher un **motif ancre** dans le texte
joint de la sous-commande, comme `_MOTIF_CHEMIN_ABSOLU_LOCAL` le fait deja (`garde_perimetre.py:41`),
et non le nom de fichier du token.

### E2. Les tokens bruts effacent la distinction source / destination

**CONFIRME.** `cp .env D:/backup/env.txt` est une **lecture** de `.env` : sauvegarder le fichier avant
que Melvyn l'edite est legitime, et la spec dit que la lecture reste ouverte. La forme brute l'aurait
refuse. Inversement `mv .env <ailleurs>` **detruit** la source : lui doit etre refuse.

**Correction retenue** : trois familles au lieu d'une.

| Famille | Programmes | Ce qui est protege |
| --- | --- | --- |
| ecrit ou detruit toutes ses cibles | `VERBES_TOUTES_CIBLES`, plus `mv`, `move-item`, `mi`, `move`, plus `dd`, `patch`, plus `sed -i` et `awk -i` | tous les tokens, y compris la valeur d'un token `option=valeur` |
| copie | `cp`, `rsync`, `copy-item`, `cpi`, `copy`, `install`, `ln` | la derniere cible et les valeurs des options de destination, jamais la source |
| interprete | `SCRIPTS` | le motif ancre dans le texte de la sous-commande |

## Le reste des findings

| # | Axe | Finding | Verifie de ma main | Retenu |
| --- | --- | --- | --- | --- |
| Q2 | preuve | La casse : `.ENV` ecrit bien `.env` sur NTFS. | Sonde : `_lib.normaliser` **met deja en minuscules**, donc `.ENV`, `.Env.DEV1` et la forme Windows sont couverts par la conception. Le finding visait le plan, qui ne disait pas « apres normalisation ». | **oui**, le plan le dit maintenant, et un cas de test `.ENV` est ajoute |
| Q3 | preuve | Un motif en sous-chaine refuserait `os.environ`, qui est une lecture. | Sonde : le motif **ancre** rend `[]` sur `os.environ`, `config.env`, `.venv`, `settings.environment`, et `['.env']` sur `open('.env'`. | **oui**, motif ancre, plus trois cas de non regression |
| Q4 | preuve | `dd of=.env`, `awk -i inplace`, `patch` echappent aux listes de verbes. | Sonde : les trois se decoupent comme annonce, `dd` produit un token `of=.env`. | **oui**, trois verbes ajoutes et coupure sur `=` |
| Q5 | surete | La porte d'arret « aucun refus perdu » n'est pas prouvable par les 58 tests. | Juste : les tests ne couvrent que leur corpus. | **oui**, T0 ajoute : releve de `decision()` sur le corpus des entrees existantes avant T2, rejoue apres, tout `None` nouveau arrete le lot |
| Q6 | preuve | Un test du predicat seul rougit par `AttributeError`, pas par comportement ; et une fixture hors perimetre est **deja** refusee aujourd'hui. | Sonde E6 : `Write C:/dev/maos/.env` est deja refuse, `Write <projet>/.env` passe. | **oui**, toutes les fixtures sont dans le perimetre, et tout se prouve par `decision`, pas par le predicat |
| Q7 | surete | `D=.env; echo x > $D` echappe. | Sonde : `[['D=.env'], ['echo','x','>','$D']]`, le token est `$D`. | **oui**, limite assumee, ecrite dans la spec au meme titre que celle de la docstring `garde_perimetre.py:7` |
| E3 | enchainement | L'ordre « zone protegee d'abord » pourrait mentir. | Devient sans objet une fois E2 corrige : `cp C:/dev/maos/.env C:/dev/maos/copie` ne produit plus de cible protegee, donc le message redevient « hors perimetre ». | **oui**, par la correction d'E2. L'ordre reste « protege d'abord » : dire « hors perimetre » d'un fichier protege laisserait croire qu'il suffit de le deplacer dans le projet, ce qui est faux |
| E4 | enchainement | `relecteur-eve` a `tools: Read, Grep, Glob, Bash` et sa fiche dit qu'il n'ecrit jamais : T5 lui demandait d'ecrire `revue-lot-2a.md`. | Juste, la ligne `tools` fait foi. | **oui**. T5 devient : l'agent rend son rapport, **le fil** le depose brut dans `agents/` puis ecrit `revue-lot-2a.md` et **relance lui meme** chaque verification. La regle « lire le fichier, pas le chat » de MAOS est tenue par le depot brut et par les relances, pas par l'ecriture de l'agent |
| E5 | enchainement | « 13 OK, 0 alerte » resterait vrai meme si la sonde et les 58 tests echouaient : `main()` ne compte que `verifications()`. | Juste, lu dans `doctor.py` : `autotests()` imprime, ne compte pas. | **oui**, la preuve devient **la ligne de sonde recopiee** et la ligne `Ran N tests`, pas le compte |
| E6 | enchainement | « un agent modifierait sa propre cage » ne discrimine pas : le fil est soumis aux memes hooks, relances du disque a chaque appel. | Juste. Argument faux tel qu'ecrit. | **oui**, le motif est reecrit (voir le plan r2 et la fiche de decision) |

**Aucun finding ecarte.** Onze retenus, un (E3) resolu par la correction d'un autre.
