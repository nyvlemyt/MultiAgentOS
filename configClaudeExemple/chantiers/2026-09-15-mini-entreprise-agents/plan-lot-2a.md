# Plan du lot 2a (fin) : la zone protegee en ecriture

**Revision 2**, nuit du 16/09/2026, apres l'attaque de deux `relecteur-eve`
(`attaques/attaque-plan-lot-2a.md`). La revision 1 figeait une forme de correctif qui **ratait un cas
exige par la spec** et **en refusait un qui doit passer** : elle aurait echoue en pleine execution.
Spec : `design-lot-2a.md` revision 2.

Le lot est **leger** en taille (un verrou, un fichier de test, quatre fichiers de doctrine) et
**structurant** en nature (il touche un verrou de securite) : pipeline complet.

## La table des taches

| # | Tache | Agent | Depend de | Risque | Preuve, a la couche ou le changement agit |
| --- | --- | --- | --- | --- | --- |
| T0 | Releve de reference : `decision()` joue sur le corpus des entrees deja presentes dans `GardePerimetreTests`, resultat ecrit dans le scratchpad | le fil | plan r2 | faible | le fichier de releve, rejoue apres T2 : **tout refus devenu `None` arrete le lot** (finding Q5) |
| T1 | Les tests rouges dans `test_gardes.py` | le fil | T0 | moyen | la sortie du lanceur montre chaque cas en echec, un par un, **avant** T2 |
| T2 | Le correctif dans `garde_perimetre.py` | le fil | T1 rouge | haut | les memes tests au vert, les 58 existants verts, le releve T0 identique |
| T3 | La sonde `.env` dans `doctor.autotests()` | le fil | T2 | faible | **la ligne de sonde recopiee**, pas le compte (finding E5) |
| T4 | La doctrine : `securite.md`, `.claude/README.md` l.14 et l.48, `CLAUDE.md`, fiche `developpeur-eve` | le fil | T2 | faible | relecture, et `doctor` qui ne bronche pas |
| T5 | Verification independante par un `relecteur-eve` | agent + fil | T1 a T4 | moyen | rapport brut depose dans `agents/` par le fil, `revue-lot-2a.md` ecrit par le fil, **et chaque commande relancee de ma main** |
| T6 | Persistance : journal, handoff, dashboard, memoire, fiche de decision | le fil | T5 | faible | comparaison d'empreintes et `git status` |

### Pourquoi le fil garde T1 et T2, motif corrige

La revision 1 disait « un agent modifierait sa propre cage ». **C'est faux et l'attaque l'a montre** :
les hooks sont relances du disque a chaque appel d'outil, et le fil est soumis aux memes hooks que
l'agent. L'argument ne discriminait rien.

Le vrai motif tient en deux points :

1. **La relecture.** Ce que le fil ecrit, Melvyn le relit dans VS Code avec tout le contexte du fil. Ce
   qu'un agent ecrit n'a pour trace que son propre rapport, qu'il redige lui meme.
2. **La panne silencieuse.** Le contrat des hooks ne refuse que sur `exit 2` (`_lib.py`, en-tete). Un
   `garde_perimetre` qui **plante** (`exit 1`) n'arrete plus rien, sans que rien ne le dise. Celui qui
   edite ce fichier doit etre celui dont chaque commande suivante reste sous les yeux de Melvyn.

Ce n'est pas une regle generale sur les agents : c'est une regle sur **les fichiers qui sont eux memes
la barriere**. Ecrite ainsi dans la fiche de decision `_decisions/0010`.

## La forme du correctif, corrigee

```text
_zone_protegee(chemin)            -> bool   nom de fichier de _lib.normaliser(chemin), commencant par .env
                                            (normaliser met en minuscules : .ENV et la forme Windows sont couverts)
_MOTIF_FICHIER_PROTEGE            -> regex  ancree : (?<![A-Za-z0-9_.])\.env[A-Za-z0-9._-]*
_cibles_protegees(sous_commande)  -> list   trois familles, voir ci dessous
decision(...)                              par sous-commande : zone protegee d'abord, perimetre ensuite
```

Les trois familles, qui remplacent les « tokens bruts » de la revision 1 :

| Famille | Programmes | Ce qui est protege | Finding |
| --- | --- | --- | --- |
| ecrit ou detruit toutes ses cibles | `VERBES_TOUTES_CIBLES`, `mv`, `move-item`, `mi`, `move`, `dd`, `patch`, `sed -i`, `awk -i` | tous les tokens qui ne sont pas une option, **plus la valeur d'un token `option=valeur`** | Q4 |
| copie | `cp`, `rsync`, `copy-item`, `cpi`, `copy`, `install`, `ln` | la derniere cible et les valeurs des options de destination, **jamais la source** | E2 |
| interprete | `SCRIPTS` (`python`, `node`, `pwsh`...) | le motif ancre trouve dans le texte joint de la sous-commande | E1, Q1, Q3 |

Les cibles de redirection restent protegees quel que soit le programme, comme aujourd'hui.

**L'ordre « zone protegee d'abord » est conserve.** Dire « hors perimetre » d'un `.env` laisserait croire
qu'il suffit de le deplacer dans le projet pour pouvoir l'ecrire, ce qui est faux. Le cas qui avait
inquiete l'attaque (`cp C:/dev/maos/.env ailleurs`) disparait avec la correction d'E2 : la source d'une
copie n'est plus une cible protegee, donc le message redevient « hors perimetre », qui est le vrai motif.

## Les cas de test, un par mecanisme

**Refus attendus**, tous avec des chemins **dans le perimetre** (finding Q6 : hors perimetre, ils sont
deja refuses aujourd'hui, donc verts avant le correctif et sans valeur de preuve) :

| Mecanisme | Entree | Finding d'origine |
| --- | --- | --- |
| outil d'ecriture, un par outil | `Write .env`, `Edit .env.dev1`, `MultiEdit .env.local`, `NotebookEdit .env` | P6 |
| redirection | `echo x > .env`, `echo x >> .env.dev1` | spec r1 |
| verbe qui ecrit | `tee .env`, `touch .env.bak`, `truncate .env` | A1 |
| verbe qui detruit | `rm .env`, `del .env.dev1`, `Remove-Item .env` | A2 |
| deplacement (source detruite) | `mv .env ailleurs` | E2 |
| copie vers `.env` | `cp .env.example .env` | E2 |
| PowerShell | `Set-Content -Path .env -Value x`, `Out-File .env` | A1 |
| edition en place | `sed -i s/a/b/ .env`, `awk -i inplace {print} .env` | Q4 |
| `option=valeur` | `dd of=.env` | Q4 |
| `patch` | `patch .env` | Q4 |
| interpreteur, script inline | `python -c "open('.env','w').write('x')"` | E1, Q1 |
| interpreteur, script du depot | `python .claude/hooks/nettoyer_caracteres.py .env --appliquer` | A3 |
| casse | `echo x > .ENV` | Q2 |
| hors perimetre aussi | `Write C:/dev/maos/.env` reste refuse, avec le message de zone protegee | E3 |

**Passages attendus**, non regression :

| Cas | Pourquoi il doit passer | Finding |
| --- | --- | --- |
| `cp .env <ailleurs dans le perimetre>` | c'est une lecture de `.env` : sauvegarde avant edition de Melvyn | E2 |
| `cat .env`, `grep DB_CONFIG .env`, `ls -la .env` | la lecture reste ouverte (`donnees.md`) | spec |
| `python -c "import os; print(os.environ.get('TEMP'))"` | `os.environ` n'est pas un fichier | Q3 |
| `python -c "x = config.env"` et `./.venv/Scripts/python.exe ...` | `config.env` et `.venv` ne sont pas `.env` | Q3 |
| `Read .env` | tautologique cote perimetre, dit comme tel ; la vraie preuve de lecture est dans `GardeDonneesTests` | P5, C3 |
| les 58 tests existants | aucune regression | Q5 |

**Deux cas declares verts d'avance** (ils ne comptent pas dans la porte d'arret) : `Read .env` et
`Bash cat .env`, parce que `Read` n'est ni dans `OUTILS_ECRITURE` ni dans le matcher de `settings.json`,
et que `cat` n'est dans aucun jeu de verbes.

## Ce que le plan ne fait pas, et ce qui reste ouvert

- Aucune modification de `_lib.py`, `garde_donnees.py`, `nettoyer_caracteres.py`.
- Aucune modification d'un fichier suivi par git.
- Aucune commande qui ecrirait reellement sur un `.env` : tout passe par la fonction pure `decision`.
- **Limite assumee, ecrite** : un chemin cache derriere une variable de shell echappe. Sonde :
  `D=.env; echo x > $D` se decoupe en `[['D=.env'], ['echo','x','>','$D']]`, le token est `$D` (Q7).
  C'est la limite deja ecrite dans la docstring du verrou : il borne les erreurs franches, pas la
  mauvaise foi.
- **Limite assumee** : un programme qui ecrit et qui n'est dans aucune des trois familles echappe.

## Points d'arret du lot

1. Un cas de refus qui ne rougit pas avant le correctif : on l'ecrit, on ne le compte pas ; si c'est un
   cas central (verbes shell ou interpreteur), on arrete le lot.
2. `git status --porcelain` different de `etat-depart/status.txt` apres une tache : arret immediat.
3. Le releve T0 rejoue apres T2 montre un refus devenu `None` : arret immediat.
