# Spec du lot 2a (fin) : fermer le trou d'ecriture sur `.env`

**Revision 2**, ecrite dans la nuit du 16/09/2026 par le fil, en mode autonome, apres l'attaque des
trois `relecteur-eve` (`attaques/attaque-spec-lot-2a.md`). La revision 1 est conservee dans l'historique
du chantier par sa synthese d'attaque : elle etait **fausse sur sa portee**, et les trois axes l'ont
trouve independamment.

## Source

`C:\dev\maos\CLAUDE.md` section 5 « Risky actions, always gated », lue a la source le 16/09/2026 :

```text
These ALWAYS require a human click, regardless of autonomy level:
- `rm`, `git reset --hard`, `git push --force`, branch deletion
- Any write to `.env*`, secrets files, keystores
```

MAOS met `.env*` derriere un clic humain. EVE n'a pas de clic humain dans ses hooks : le contrat est
`exit 2` (refus) ou `exit 0` (autorise). La traduction EVE de cette regle est donc **le refus**, et le
recours est la main de Melvyn dans VS Code. C'est deja le motif de `garde_git` pour `push --force`.

## Le probleme, prouve

Sonde du 16/09 (journal, section « lot 2a ») : aucun verrou ne refuse l'ecriture sur `.env` ni
`.env.dev1`, ni par `Write`, ni par `Edit`, ni par redirection shell. Seul le fichier de token de l'API
est protege, et il l'est par `garde_donnees` (lecture **et** ecriture), pas par `garde_perimetre`.

Pourquoi c'est grave ici et pas ailleurs : `.env` porte `DB_CONFIG`. Une ecriture malencontreuse qui
bascule la base par defaut de la sqlite locale vers `EveDev` ferait tourner `manage.py test` sur le
serveur partage, ce que `donnees.md` interdit sans exception. Le fichier n'est pas suivi par git : une
ecriture fautive est **irreparable**, comme l'arbre de la mission 0.

Aujourd'hui la seule barriere est une clause en prose de la fiche `developpeur-eve` (« tu ne lis ni ne
modifies `.env` »). Le lot 1a a etabli que ces clauses sont declaratives : elles ne refusent rien.

## Ce que l'attaque a change, et qui commande tout le reste

`_lib._ressemble_a_un_chemin` (`_lib.py:115`) se termine par `and not token.startswith(".")`. **Un token
qui commence par un point n'est jamais reconnu comme un chemin.** Sonde de ma main :

```text
'sed -i s@a@b@ .env'  [[]]       'tee .env'         [[]]      'cp x .env'      [[]]
'rm .env'             [[]]       'touch .env.dev1'  [[]]      'echo x > .env'  [['.env']]
'python -c "open(.env, w).write(x)"'                [[]]
```

Un cas sur sept. Filtrer les cibles que `_cibles_ecriture` produit deja, comme le prevoyait la revision
1, n'aurait refuse que la redirection, et le test prevu l'aurait declare bon.

Donc : **les cibles protegees se collectent separement, sur les tokens bruts de la sous-commande**, dans
`garde_perimetre` seulement. On ne touche pas a `_lib`, qui est partage avec `garde_donnees`.

## Ce qu'on fait

Une **zone protegee en ecriture** dans `garde_perimetre` : tout chemin dont le nom de fichier commence
par `.env` ne peut etre ni ecrit, ni modifie, ni supprime, ou qu'il soit, y compris dans le perimetre.
C'est l'exclusion symetrique de `RACINE_BDFG_CORE`, qui est une inclusion. La lecture ne bouge pas.

Trois entrees, parce que le code a trois branches :

1. **Outils d'ecriture** (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`) : la cible de l'outil.
2. **Redirections shell** : les cibles que `_cibles_redirections` produit deja, sans filtre de chemin.
3. **Tokens bruts d'une sous-commande qui ecrit** : quand le programme est un verbe d'ecriture
   (`VERBES_TOUTES_CIBLES`, `VERBES_DESTINATION`, `sed -i`) ou un interpreteur (`SCRIPTS`), tout token
   dont le nom de fichier commence par `.env` est une cible protegee, chemin absolu ou non.

Choix de conception, et pourquoi celui la (le plus simple qui reste coherent) :

| Question | Choix | Pourquoi |
| --- | --- | --- |
| Quel verrou porte la regle ? | `garde_perimetre` | La regle est « ou j'ecris ». `garde_donnees` refuse en lecture ET en ecriture ; ici la lecture doit rester ouverte (`donnees.md`). |
| Corriger `_lib._ressemble_a_un_chemin` ? | **non** | Partage avec `garde_donnees` (`extraire_chemins_commande`). Un effet de bord non borne sur un second verrou, pour un besoin qui tient dans un seul. |
| Quel motif de nom ? | nom de fichier commencant par `.env` | Couvre `.env`, `.env.dev1`, `.env.local`, `.env.bak`. C'est le motif `.env*` de MAOS section 5. |
| Et un fichier nomme `.environment.md` ? | refuse aussi | Faux positif accepte : le contournement est de le renommer. Un refus de trop coute une reformulation, un refus manquant coute une base partagee. |
| La suppression ? | refusee comme l'ecriture | `rm .env` detruit autant qu'une reecriture, et rien dans git ne le rend. Finding A2. |
| Les interpreteurs (`python -c`, `pwsh`) ? | tout token `.env` de la sous-commande est une cible | Findings A3, P3, C2 : `python nettoyer_caracteres.py .env --appliquer` reecrit le fichier et passait. Consequence assumee : **lire `.env` par un `python -c` devient refuse**. Le recours est `cat` ou `grep`, qui restent ouverts. |
| Ou dans le perimetre ? | partout, y compris hors du projet | Un `.env` de `bdfg-core` merite la meme protection. |
| Les lectures ? | inchangees | `donnees.md` : `.env` est lisible, secrets masques. `decision` ne regarde que les outils d'ecriture et les commandes shell qui ecrivent. |
| Message de refus ? | « zone protegee en ecriture », distinct | Finding A4 : dire « hors perimetre » d'un fichier qui est **dans** le perimetre est faux, et ne laisse aucune reformulation trouvable. |
| Ou va la sonde de `doctor` ? | dans `autotests()`, pas dans `verifications()` | Findings P2, C5, A5 : `verifications()` compte les 13 OK ; y ajouter une ligne casserait le critere « 13 OK » a chaque ajout de controle. `autotests()` est la section des sondes de hooks, faite pour ca. |

## Ou le changement agit, ou on le prouve

| Ou ca agit | Ce qui change | Ou on le prouve |
| --- | --- | --- |
| `garde_perimetre`, nouveau predicat de zone protegee | le motif de nom | test unitaire direct sur le predicat |
| `garde_perimetre.decision`, branche `OUTILS_ECRITURE` | `Write`, `Edit`, `MultiEdit`, `NotebookEdit` sur `.env*` refuses, **un cas par outil** (P6) | `test_gardes.py`, `GardePerimetreTests` |
| `garde_perimetre.decision`, branche shell, redirection | `> .env`, `>> .env` refuses | idem |
| `garde_perimetre.decision`, branche shell, verbes | `tee`, `cp`, `mv`, `rm`, `touch`, `sed -i`, `Set-Content`, `Remove-Item` vers `.env*` refuses | idem, un cas par famille |
| `garde_perimetre.decision`, branche `SCRIPTS` | `python -c "open('.env','w')"` et `python <script> .env --appliquer` refuses | idem |
| Message | contient « zone protegee » et le nom du fichier vise (P4) | `assertIn` sur le message, pas `assertIsNotNone` |
| Lecture | rien ne change | deux cas de non regression, **dits tautologiques** cote perimetre (P5, C3) ; la vraie preuve de lecture est dans `GardeDonneesTests` |
| `doctor.autotests()` | une sonde nommee `garde_perimetre.py` sur `.env`, code 2 attendu | sortie de `doctor --complet` |
| `.claude/rules/securite.md` | la regle et **le recours** (main de Melvyn) ecrits, avec la source | relecture |
| `.claude/README.md` lignes 14 et 48 | la ligne du verrou devient exacte ; « remettre la ligne sqlite » devient une action de Melvyn | relecture |
| `CLAUDE.md`, ligne des verrous | `garde_perimetre` dit aussi la zone protegee | relecture |
| Fiche `developpeur-eve` | la clause en prose devient doublee par un verrou, elle n'est pas supprimee | mention dans la fiche |

## Ce qu'on ne fait pas, et ce qui reste ouvert apres ce lot

- On ne touche pas a `_lib` : la portee du changement s'arrete a `garde_perimetre`.
- On ne touche pas a `garde_donnees` : le secret du token y est deja, et la lecture de `.env` reste ouverte.
- On ne bloque ni la lecture, ni `ls`, ni `grep`, ni `cat` sur `.env`.
- **Le trou de la base partagee est retreci, pas ferme** (finding C6) : `DB_CONFIG=... python manage.py test`
  en ligne de commande reste libre, aucun hook ne regarde `manage.py`. Constat pose, non traite ici.
- **Une fixture nommee `.env` dans le scratchpad devient impossible** (finding A7). Contournement :
  nommer la fixture autrement et injecter son chemin, ce que `_moteur_env` permet deja par `RACINE`.
- On ne rend pas la liste configurable par variable d'environnement (meme motif que `RACINE_BDFG_CORE` :
  une extension doit rester un changement de code relu en diff).
- `nettoyer_caracteres.py` n'est pas modifie : c'est `garde_perimetre` qui refuse l'appel, en amont.
- **Le cout reel du refus large, mesure le jour meme.** `_lib.decouper_commande` coupe aussi sur les
  sauts de ligne : dans un `cat >> fichier` avec document en ligne, **chaque ligne du texte ecrit devient
  une sous-commande**. Une ligne de compte rendu qui commence par un verbe d'ecriture et cite le nom du
  fichier protege est donc lue comme une vraie ecriture. C'est arrive a la premiere minute, sur le
  journal de ce lot. Contournements : prefixer la ligne par un mot qui n'est pas un verbe, ou ecrire le
  bloc dans le scratchpad avec l'outil `Write` puis le concatener. Jamais desactiver le hook.

## Critere de reussite

**Binaire** : tous les cas de refus du tableau ci dessus rougissent avant le correctif et passent apres ;
les 58 tests existants restent verts.
**Mesurable** : `doctor --complet` rend `13 OK, 0 alerte` et une ligne de sonde `.env` au code 2.
**Arret** : si un cas de refus ne peut pas rougir avant le correctif, on l'ecrit et on ne le compte pas
comme preuve (porte d'arret du mode autonome). Les deux cas de lecture sont tautologiques cote
`garde_perimetre` et ne comptent pas dans la porte d'arret.
