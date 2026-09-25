# Rapport brut : relecteur-eve, attaque du plan du lot 2a, axe niveau de preuve et surete

Lance dans la nuit du 16/09/2026. Depose tel quel, sans reformulation. Les affirmations ci dessous
n'engagent que l'agent tant que le fil ne les a pas reverifiees (voir `attaques/attaque-plan-lot-2a.md`).

---

## Attaque du plan lot 2a, axe niveau de preuve et surete

Reponse a la question unique : **non**. Deux cas promis par la spec ne peuvent pas passer au vert avec la forme de correctif decidee d'avance, et trois mecanismes d'ecriture restent ouverts.

| ID | Sev | Ligne visee | Constat et preuve (sondes de ma main sur `_lib.decouper_commande`) | Correctif propose |
| --- | --- | --- | --- | --- |
| Q1 | CRITIQUE | plan l.34-36 (`_zone_protegee` sur le nom de fichier seul) vs spec l.90 | Le token d'un script inline n'est pas un chemin. Sortie brute : `'python -c "open(\'.env\',\'w\').write(\'x\')"' -> ['python','-c',"open('.env','w').write('x')"] | zone_protegee sur un token : False`. Idem `Path('.env').write_text`. Les 2 cas « scripts » du plan resteraient **rouges apres** T2 : le critere binaire de la spec (l.114) echoue. **Certain** | Extraire les occurrences `.env` a l'interieur du texte cite par motif ancre, pas par `basename(token)` ; l'ecrire dans le plan avant T1 |
| Q2 | HAUTE | plan l.34, aucun cas de casse | `'echo x > .ENV' -> [...,'.ENV'] | zone_protegee : False`. NTFS est insensible a la casse : `.ENV` ecrit bien `.env`. **Certain** | `basename(...).lower()` et un cas de test `.ENV` |
| Q3 | HAUTE | plan l.35, elargissement implicite | Le seul correctif qui repare Q1 (sous chaine `.env`) refuse `python -c "import os; print(os.environ.get('TEMP'))"` : `substring '.env' dans un token : True`. C'est une **lecture**, et le motif exact de `garde_perimetre.py:60`. **Certain** | Ancrer sur debut de token, `/`, `\` ou quote ; cas de non regression `os.environ` |
| Q4 | HAUTE | plan l.11 « 6 familles de verbes » ; spec l.63-65 | Mecanismes hors des listes, donc ouverts apres correctif : `dd of=.env` (`['dd','of=.env']`, forme `option=valeur` que `_cibles_ecriture` ne coupe pas, contrairement a `_lib.extraire_chemins_commande`), `awk -i inplace ... .env`, `patch .env`. **Certain** | Balayer les tokens de **toute** sous-commande (les lectures `cat`/`grep` restant vertes par liste), ou a minima couper sur `=` et ajouter `dd`, `awk`, `patch` |
| Q5 | MOYENNE | plan l.55, porte d'arret n 3 | Non prouvable en l'etat : « 58 tests verts » ne voit pas un refus devenu None hors corpus. **Certain** | Avant T2, vider `decision()` sur le corpus des entrees deja presentes dans `GardePerimetreTests` vers un fichier ; apres T2, rejouer et diffuser : tout `None` nouveau = arret |
| Q6 | MOYENNE | plan l.28-29 (« deux cas verts ») | Le cas « predicat » rougit par `AttributeError`, absence et non comportement, et c'est le seul test hors interface publique `decision` (`qualite.md`, tests aux interfaces publiques). Et si un cas « un par outil » vise `C:\dev\maos\.env`, il est **deja refuse aujourd'hui** : vert avant, non declare. **Probable** | Fixtures dans le perimetre (`.env`, `C:\dev\bdfg-core\.env`) ; le predicat teste aussi par `decision` |
| Q7 | BASSE | spec l.99-110 | `D=.env; echo x > $D` -> `['echo','x','>','$D']`, aucun token `.env` : contournement reel, dit dans la docstring `garde_perimetre.py:7` mais absent de « ce qui reste ouvert ». **Certain** | L'ajouter a la liste des limites assumees |

**Synthese** : le plan est executable, mais sa forme de correctif figee l.34-36 rend deux cas promis impossibles a verdir et laisse `dd`, `awk -i`, `patch` et la casse ouverts ; corriger le plan (Q1 a Q4) avant T1, sinon T1 produira des rouges qui ne verdiront pas.
