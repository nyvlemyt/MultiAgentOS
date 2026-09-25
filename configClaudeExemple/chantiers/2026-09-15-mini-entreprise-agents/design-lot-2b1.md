# Spec et plan du lot 2b, tranche 1 : les shells imbriques contournent les verrous

**Revision 2**, nuit du 16 au 17/09/2026, apres l'attaque de deux `relecteur-eve`
(`agents/2026-09-17-relecteur-eve-attaque-spec-2b1-*.md`). La revision 1 se trompait de cible et de
mecanisme : elle visait le seul verrou de perimetre, alors que **le trou le plus grave est sur git**,
et sa forme de correctif etait a la fois trop etroite et trop large. Un des deux relecteurs a
**prototype** le correctif avant de juger.

## Ce que l'attaque a etabli, et qui commande la revision

**Les sept interdits de `git.md` tombent derriere un prefixe de huit caracteres.** Reverifie de ma
main, sortie brute :

```text
  direct REFUS  |  bash -c PASSE  |  git push --force
  direct REFUS  |  bash -c PASSE  |  git reset --hard
  direct REFUS  |  bash -c PASSE  |  git clean -fdx
  direct REFUS  |  bash -c PASSE  |  git branch -D features/x
  direct REFUS  |  bash -c PASSE  |  git checkout .
  direct REFUS  |  bash -c PASSE  |  git stash clear
  direct REFUS  |  bash -c PASSE  |  git commit --amend
```

`garde_donnees`, lui, est **clos** : il juge le texte de la commande et non le verbe, donc un shell
imbrique ne lui echappe pas (sonde de ma main, deux cas sur deux en refus).

La hierarchie des trois trous est donc : **git d'abord** (effets partages et irreparables : un
`push --force` sur `develop`, un `reset --hard` sur du travail non commite), le perimetre ensuite,
`garde_donnees` pas du tout.

## Le mecanisme, corrige

La revision 1 proposait de prendre « le token qui suit l'option ». Le prototype du relecteur a montre
que c'est faux dans les deux sens :

| Cas | Ce que faisait la forme r1 | Corrige par |
| --- | --- | --- |
| `bash -c "bash -c 'rm <hors>'"` | passe : le token interne se redecoupe, l'option ne porte plus que `rm`, le chemin devient orphelin | prendre **tous les tokens restants**, pas le suivant |
| `cmd /c del <chemin>` | passe : les arguments sont deja des tokens separes, il n'y a pas de token unique a redecouper | idem, les tokens restants sont rejoints puis redecoupes |
| `pwsh -NoProfile -Command "..."` | passe : la liste d'options ignorait la forme a un tiret | `-command`, `-encodedcommand`, `-file` ajoutes |
| `bash -c "rm \"chantiers/x\""` | **refus de trop** : la cible devenait la barre oblique inverse seule, donc la racine du lecteur | une cible vide, `\` ou `/` seule n'est pas une cible |

**La regle finale** : quand une sous-commande lance un shell imbrique avec une option qui porte une
commande, **tous les tokens qui suivent cette option sont rejoints et redecoupes**, et les
sous-commandes obtenues s'ajoutent a la liste. La liste d'origine **n'est pas remplacee** : le
changement est additif, donc aucun appelant ne perd ce qu'il voyait deja.

**Au dela de la profondeur : on refuse l'appel.** Le contrat du hook est `exit 0` = autorise ; laisser
passer ce qu'on ne sait pas analyser transformerait la limite en mode d'emploi du contournement. Aucun
usage legitime du poste n'imbrique trois shells.

## Ou ca vit : dans `_lib`, et pourquoi c'est different du lot 2a

Le lot 2a a refuse de toucher `_lib` parce que la modification envisagee (`_ressemble_a_un_chemin`)
**changeait le comportement des trois verrous**. Ici, le redecoupage est un **parametre optionnel de
`decouper_commande` dont la valeur par defaut reproduit exactement le comportement actuel** : les
appelants qui ne le demandent pas ne voient aucune difference. Et le decoupage d'une commande est,
litteralement, ce que `_lib` fait.

Consequence : `garde_git` se ferme en **un mot** (`profondeur=2` a son appel), et non par une
duplication du mecanisme. C'est ce qui rend la fermeture des deux verrous tenable dans une tranche.

## Ce qu'on fait, et ce qu'on ne fait pas

| Sujet | Decision | Motif |
| --- | --- | --- |
| `_lib.decouper_commande` gagne `profondeur` | **fait** | additif, defaut inchange |
| `garde_git` appelle avec `profondeur=2` | **fait** | le trou le plus grave, et il coute un mot |
| `garde_perimetre` appelle avec `profondeur=2` | **fait** | le trou d'origine de cette tranche |
| `_cibles_ecriture` aligne sur `OPTIONS_VRAIE_DESTINATION` | **fait** | sinon `pwsh -c "Copy-Item -Path <hors> -Destination <projet>"` bascule en refus a cause du redecoupage : ce serait une **regression introduite par ce lot**, sur la meme asymetrie source/destination deja corrigee au lot 2a dans l'autre fonction |
| Sonde `bash -c` dans `doctor.autotests()` | **fait** | sinon le critere de `doctor` est insensible au correctif |
| `garde_donnees` | **non touche** | deja clos, prouve |
| `empreintes.py` (le manifeste) | **non touche**, remis a Melvyn | Deux raisons. `relever()` a un defaut latent : `rglob` sur un chemin de **fichier** rend une liste vide sans lever d'erreur, donc ajouter `CLAUDE.md` a `SURVEILLES` serait un **no-op silencieux**. Et meme corrige, la surveillance ne demarre qu'une fois la reference reprise par `--ecrire`, commande **refusee au fil par le classifieur du mode automatique** (motif « alteration de journal d'audit »), refus non contourne. Sans reprise, le comparateur afficherait deux `AJOUT` **en permanence** et sortirait en code 1 a chaque appel : il deviendrait du bruit. Le changement exact et la commande sont ecrits dans le handoff, pour la main de Melvyn. |
| `echo "rm <hors>" \| bash`, `bash script.sh` | **non couverts**, ecrits | La commande n'est pas sur la ligne : la fermer demanderait de lire un fichier ou de suivre un tube. Limite assumee, comme la variable de shell. |

## Ou le changement agit, ou on le prouve

| Ou ca agit | Ce qui change | Ou on le prouve |
| --- | --- | --- |
| `_lib.decouper_commande(cmd)` | rien, defaut inchange | les 81 tests existants restent verts |
| `_lib.decouper_commande(cmd, profondeur=2)` | rend en plus les sous-commandes internes | test unitaire direct sur la fonction |
| `garde_git.decision` | les **sept** interdits refuses aussi derriere `bash -c`, `sh -c`, `pwsh -Command`, `cmd /c` | `test_gardes.py`, un cas par interdit |
| `garde_git.decision`, sous agent | `bash -c "git commit"` refuse a un agent, laisse au fil | idem |
| `garde_perimetre.decision` | `bash -c "rm <hors perimetre>"` refuse | `GardePerimetreTests` |
| `garde_perimetre.decision`, lecture | `bash -c "cat <hors perimetre>"` passe toujours | idem, non regression |
| profondeur depassee | **refus**, avec son propre message | test sur le motif du message |
| guillemets echappes | `bash -c "rm \"chantiers/x\""` passe (cible dans le projet) | idem, non regression |
| `_cibles_ecriture` | `pwsh -c "Copy-Item -Path <hors> -Destination <projet>"` passe | idem, non regression |
| `doctor.autotests()` | une sonde `bash -c` au code 2 | sortie de `doctor --complet` |
| `securite.md`, `.claude/README.md`, docstrings de `garde_perimetre` | la limite « shells imbriques » disparait, la limite « trois niveaux » apparait | relecture |

## Critere de reussite

**Binaire** : les sept interdits de git et l'ecriture hors perimetre sont refuses sous les quatre formes
(`bash -c`, `sh -c`, `pwsh -Command`, `cmd /c`), et **chacun rougit avant le correctif** ; les quatre cas
de non regression passent (lecture imbriquee, guillemets echappes, copie vers le projet, les 81 tests).
**Mesurable** : `doctor --complet` rend 13 OK, 0 alerte, et sa ligne de sonde `bash -c` est au code 2.
**Arret** : un cas de refus qui ne rougit pas n'est pas une preuve, et s'ecrit comme tel.
