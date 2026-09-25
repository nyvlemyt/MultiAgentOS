# Rapport brut : relecteur-eve, attaque du plan du lot 2a, axe enchainement

Lance dans la nuit du 16/09/2026. Depose tel quel, sans reformulation. Les affirmations ci dessous
n'engagent que l'agent tant que le fil ne les a pas reverifiees (voir `attaques/attaque-plan-lot-2a.md`).

---

Attaque de plan, axe enchainement. Plan : `chantiers/2026-09-15-mini-entreprise-agents/plan-lot-2a.md`. Aucun fichier modifie.

| ID | Ligne visee | Scenario concret | Confiance |
| --- | --- | --- | --- |
| E1 | plan l.34 a 37 (`_cibles_protegees(sous_cmd) -> tokens bruts`) | La forme decidee d'avance rate le cas que la spec exige a sa l.90. Sonde brute : `'python -c "open(\'.env\',\'w\').write(1)"'` -> `tokens : ['python', '-c', "open('.env','w').write(1)"]`, `premier_mot : 'python'`, forme plan -> `[]`. Le nom de fichier `.env` est **a l'interieur** d'un token, jamais un token. T1 ecrira donc un test rouge que T2 ne pourra pas rendre vert : point d'arret 1 declenche en plein lot, sur un cas central. Correctif : pour `SCRIPTS`, chercher le motif dans le texte joint de la sous commande (comme `_MOTIF_CHEMIN_ABSOLU_LOCAL`, garde_perimetre.py:105), pas le basename du token. | certain |
| E2 | plan l.36, spec l.63 a 65 | Les tokens bruts effacent la distinction source/destination que `_cibles_ecriture` tient (garde_perimetre.py:94 a 99). Sonde : `'cp .env D:/backup/env.txt'` -> forme plan `['.env']`. On refuse une **lecture**, contre spec l.57 et l.103 ; cas legitime non prevu : copier `.env` avant une edition de Melvyn. Correctif : pour `VERBES_DESTINATION`, ne proteger que la derniere cible et les options de destination ; tout garder pour `rm`, `mv`, `tee`, `sed -i`. | certain |
| E3 | plan l.40 a 41 (zone protegee d'abord) | L'ordre est bon sur le principe, mais applique a des tokens non filtres il ment : `cp C:/dev/maos/.env C:/dev/maos/copie` rendrait « zone protegee en ecriture sur .env » alors que la faute est l'ecriture hors perimetre. Depend d'E2 : si la passe ne voit que des cibles d'ecriture, le message redevient juste. | probable |
| E4 | T5, plan l.15 | `relecteur-eve` declare `tools: Read, Grep, Glob, Bash` et sa fiche dit qu'il n'ecrit jamais dans le depot. T5 lui demande d'ecrire `revue-lot-2a.md` : tache non executable sans contourner la fiche par une redirection Bash. Correctif : l'agent rend son rapport, le fil ecrit le fichier (un fichier, un ecrivain). | certain |
| E5 | T3, plan l.13 (preuve « 13 OK, 0 alerte ») | Verifie : `doctor EVE : 13 OK, 0 alerte(s).`. `main()` (doctor.py:199 a 207) ne compte que `verifications()` ; les lignes d'`autotests()` (doctor.py:175 a 194) sont imprimees, jamais comptees. La sonde ne changera donc pas le 13 (le plan a raison), mais « 0 alerte » resterait 0 meme si la sonde **et** les 58 tests echouaient : ce n'est pas une preuve. Preuve = la ligne de sonde recopiee. | certain |
| E6 | plan l.18 a 22 | L'argument ne discrimine pas : les hooks sont relances a chaque appel d'outil depuis le disque, et le fil est soumis aux memes hooks que l'agent, donc il modifie sa cage pareillement. Pire, le contrat (_lib.py l.4) ne bloque que sur `exit 2` : un `garde_perimetre` qui plante (exit 1) n'arrete plus rien. Le vrai motif est la relecture du diff du fil par Melvyn : a reecrire ainsi dans la fiche de decision. | probable (hooks des sous agents a verifier) |

Points verifies sans finding : ordre T1 rouge avant T2 tenable (`rm .env`, `tee .env`, `sed -i` rendent bien `[]` aujourd'hui) ; `premier_mot` rend `sed`, `set-content`, `remove-item` correctement ; `Remove-Item .\.env` est bien attrape par le basename ; les 58 tests existants sont confirmes (`Ran 58 tests ... OK`) ; aucun compte de tests code en dur dans la doctrine, donc T4 est complet.

Synthese : l'ordre des taches tient, mais la forme du correctif decidee d'avance est fausse sur deux points (E1 rate un cas exige par la spec, E2 refuse une lecture legitime) et deux preuves annoncees ne prouvent pas ce qu'elles disent (E5, et E4 qui rend T5 inexecutable telle qu'ecrite).
