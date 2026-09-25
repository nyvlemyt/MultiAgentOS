# Rapport brut : redacteur-eve, relecture de la doctrine du lot 3, 17/09/2026

Depose tel quel par le fil. Brief : securite.md (quatre puces reecrites), git.md (paragraphe ajoute), README.md (lignes des modules), _decisions/0011, corpus_contrat.py pour verifier que chaque phrase a son cas.

Relecture doctrine lot 3. Aucun fichier modifié. Mesures de ma main : `test_contrat.py --bilan` = 552 cas, 552 verts ; `test_gardes.py` = 734 tests OK ; `verif_style.py` : forme OK sur les 4 fichiers ; `_lib.executer`, `ZoneProtegeeEnEcritureTests`, `etat-depart/lot-3/` existent.

| Sév. | Fichier:ligne | Constat | Correction proposée |
| --- | --- | --- | --- |
| Haute | `.claude\README.md:12` | « 318 cas » ; le corpus en a 552 | `(552 cas, chacun avec sa règle et sa source)` |
| Haute | `README.md:20` | « 500 tests » ; la suite en joue 734 | `(734 tests)` |
| Haute | `.claude\rules\securite.md:24` | Section « non couvert » : quatre phrases sans cas « limite » (programme absent de la table, `bash script.sh`, liens symboliques, `manage.py shell -c`) ; seuls 3 cas limite existent, tous sur la variable de shell | Ajouter 4 cas PASSE annotés LIMITE au corpus, ou remplacer « (cas PASSE annotés « limite » au corpus) » par « (la variable de shell a ses cas ; les autres limites sont dites, non mesurées) » |
| Haute | `securite.md:23` | Sans cas : `Invoke-Expression`, parenthèse non fermée, `env -S` dont la commande est une substitution, programme venu d'une substitution, glob qui « atteint l'extérieur », préfixe `-e` seul | Ajouter les cas, ou retirer ces six mentions ; la puce promet « chaque phrase qui suit a son cas vert » |
| Haute | `.claude\rules\git.md:22` | « sous toutes leurs formes » : trop large, la variable de shell n'est pas résolue (`securite.md:24`) | `sous les formes suivantes, chacune mesurée au corpus (une variable de shell reste hors de portée, voir securite.md) :` |
| Moy. | `git.md:22` | Sans cas : `reflog expire`, `am`, `credential.*`, `diff.external`, `config --list`, résolution d'alias par `git config --get alias.<nom>` et alias `!shell` (le corpus ne touche pas le disque) | Retirer `expire`, `am`, `credential.*`, `diff.external`, `--list` ou ajouter leurs cas ; pour l'alias : « alias (résolus contre la configuration ; non joués au corpus, qui ne touche pas le disque) » |
| Moy. | `securite.md:25` | `rm -rf *` : en bash `*` n'atteint pas `.env` ; exemple faux et sans cas | `(rm -rf .??* à la racine, find . -type f -delete)` (cas `v_glob_rm_caches`) |
| Moy. | `securite.md:22` | Puce de 2 671 caractères (25 lignes rendues) ; les voisines font 3 à 8 lignes | Découper en sous-puces : « Outils, redirections, verbes », « git », « Enveloppes, shells, substitutions », « Interpréteurs et documents en ligne », « PowerShell », « Chemins (cd, .., UNC) » |
| Moy. | `securite.md:22` | `git clean` cité côté périmètre : les 3 cas sont du verrou git ; `pushd` : un seul cas, en lecture | Ajouter `git -C <hors> clean -fdx` et `pushd <hors>; rm x` en REFUS, ou retirer les deux mots |
| Basse | `securite.md:22` | `//?/C:/` ; le corpus joue `\\?\C:\` | `\\?\C:\` |
| Basse | `securite.md:22` | « tar dans toutes ses formes » ; le corpus joue `-xf`, `xf`, `-czf`, `-C` | `tar avec ou sans tiret, extraction et création` |
| Basse | `securite.md:25` vs `:26` | « Faux refus » puis « faux positif » pour le même concept (corpus : « faux positif ») | Un seul terme, « faux refus », aux deux lignes et dans `CONTEXT.md` |

Décision 0011 : cohérente avec les trois fichiers (noms de modules, `_lib.executer`, arbitrages 2 à 5 retrouvés au corpus) ; « 315 cas » est daté, acceptable.

Termes pour `CONTEXT.md` : « faux refus » (définition : refus d'un verrou sur une commande légitime, à contourner en reformulant) ; « limite » (cas PASSE assumé, écrit dans `securite.md`).

Synthèse : le code tient (552/552, 734 OK) mais la doctrine promet plus que le corpus sur une quinzaine de mentions, et le README porte deux chiffres périmés.
