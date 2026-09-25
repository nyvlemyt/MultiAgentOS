# Plan du lot 3 : refondation des verrous de commande

**Revision 1**, 17/09/2026. Spec : `design-lot-3.md` revision 2. Decision : `_decisions/0011`. Methode
demandee par Melvyn le matin meme : plan, modules, tests avant, motif, puis code par petits pas.
Ecrivain : le fil, seul (les fichiers sont la barriere). Chaque tache se termine par les trois controles
`suite en place` (98 tests, attendus inchanges), `corpus --bilan` (la liste des rouges ne peut que
diminuer), `git status --porcelain` identique a `etat-depart/status.txt`.

## Ordre des taches, et ce qui est vert a chaque etape

| # | Tache | Fichiers | Depend de | Risque | Preuve a la couche |
| --- | --- | --- | --- | --- | --- |
| T0 | Photo rouge, copies de depart, corpus revise | `test_contrat.py`, `etat-depart/lot-3/` | rien | nul | **fait** : 315 cas, 264 verts, 51 rouges ; six copies et `sha256.txt` |
| T1 | La table : `_programmes.py`, fichier de donnees pur | `_programmes.py` (nouveau) | T0 | faible | import sans erreur ; un test qui verifie que chaque programme cite dans le corpus (`rm`, `tee`, `curl`, `git`, `xargs`, `find`, `python`, `Set-Content`, `::delete`...) a une ligne dans la table |
| T2 | Le scanner : `_commande.analyser` | `_commande.py` (nouveau), `tests/test_commande.py` (nouveau) | T1 | **eleve** : le seul code delicat | tests unitaires ecrits **avant** : tokens dequotes, antislashs conserves, quote en milieu de token, redirections collees et separees, separateurs, documents en ligne (retires ; livres au shell ou a l'interprete), here-string PowerShell, `$(...)` et accents graves, enveloppes et leur argument numerique, `VAR=x`, shells a un niveau, `-EncodedCommand` et prefixes, `eval`, tube vers un shell, `xargs` et `find -exec` (amont), `cd` suivi, guillemet non ferme (opaque), appels .NET en mode PowerShell ; plus un test de **performance** : le corpus entier analyse en moins d'une seconde |
| T3 | Les effets : `_effets.acces` | `_effets.py` (nouveau), `tests/test_effets.py` (nouveau) | T1, T2 | moyen | tests unitaires par famille : un cas `ECRIT`, un `LIT` ou `META`, un piege (`grep -m 1 rm .env`, `npm install <hors>`, `cp .env x` lit, `mv` ecrit les deux, `tar -tf` lit, `tar -xf -C` ecrit, `find -name` cible, `git rm --cached` lit, interprete avec et sans indice, redirections `<` et `>`, `/dev/null` et `$null` ignores, residus de decoupage ignores) |
| T4 | `garde_git` bascule sur `analyser` | `garde_git.py` | T2 | moyen | les 33 tests git en place verts ; les cas `git` du corpus verts (dont `env_push_force`, `winpty`, `$(...)`, `-c core.hooksPath`, `branch --delete --force`, `push --no-verify`, `-enc`) ; `_arguments_git` reduit au retrait des options globales |
| T5 | `garde_perimetre` bascule : zone protegee, perimetre, `.git/` | `garde_perimetre.py` | T3 | **eleve** | les tests perimetre et zone en place verts (attendus inchanges) ; cas `perimetre` du corpus verts ; les douze tables `VERBES_*` supprimees ; `grep -c "ENVELOPPES\|VERBES_" garde_perimetre.py` rend 0 |
| T6 | `garde_donnees` bascule, balayage brut conserve | `garde_donnees.py`, `tests/test_gardes.py` | T3 | moyen | test d'egalite : les onze commandes de la verification 2b1 rendent le meme verdict avant et apres ; cas `donnees` du corpus verts, dont les nouveaux (PowerShell, `<`, espace) |
| T7 | Elagage de `_lib` et reecriture des tests internes | `_lib.py`, `tests/test_gardes.py` | T4, T5, T6 | faible | `decouper_commande`, `premier_mot`, `commande_interne`, `commande_non_analysable`, `profondeur_imbrication`, `_index_du_shell`, `extraire_chemins_commande`, `ENVELOPPES_LANCEURS`, `SHELLS_A_COMMANDE`, `OPTIONS_COMMANDE` retires ; les tests qui les nommaient reecrits sur `analyser` ou `acces`, attendus inchanges, comptes au journal ; suite verte |
| T8 | `doctor`, `test_gardes` branche le corpus | `doctor.py`, `tests/test_gardes.py` | T7 | faible | `doctor --complet` : 13 OK, 0 alerte, sondes OK ; la sonde `bash -c "rm <hors>"` est remplacee par `env git push --force` et `cd <hors> && rm x` (les formes qui prouvent le lot) ; le corpus tourne dans la suite (import de `ContratTests`) |
| T9 | Verification contradictoire | aucun (lecture) | T8 | | un `relecteur-eve` fabrique ses entrees contre `git.md`, `securite.md`, `donnees.md`, joue `decision()` de sa main, verdict `PASS | NEEDS_WORK | BLOCK` ; deux cycles au plus |
| T10 | Doctrine apres mesure | `securite.md`, `git.md`, `.claude/README.md`, `REGISTRE.md` (ligne des modules) | T9 | faible | chaque phrase « couvert » a un cas vert, chaque phrase « non couvert » a un cas PASSE annote limite ; relecture `redacteur-eve` ; `verif_style` propre |
| T11 | Persistance | `journal.md`, `handoff.md`, `dashboard.html`, `PLAN.md`, memoire, manifeste | T10 | | point d'etape en quatre blocs ; `empreintes.py --comparer` : ecarts exactement les fichiers declares |

## Le detail des interfaces, fige avant T1

```python
# _programmes.py : la table, rien d'autre (aucune fonction, aucun import)
class Regle(NamedTuple):            # NamedTuple vient de typing : c'est l'unique import tolere
    famille: str                    # ENVELOPPE SHELL INTERPRETE XARGS FIND GIT TOUT DESTINATION DEPLACE SI_OPTION OPTION_CIBLE LIT META
    declencheurs: tuple[str, ...]   # ENVELOPPE : mots sautes apres (run) ; SI_OPTION : options qui font ecrire ; SHELL/INTERPRETE : options qui portent le code
    cibles: tuple[str, ...]         # options dont la valeur est une cible (-o, of=, -C, -Destination, -Path)
PROGRAMMES: dict[str, Regle]
INDICES_ECRITURE_SCRIPT: tuple[str, ...]      # 'w', 'a', .write(, os.remove, shutil., unlink, rmtree, writeFileSync...
INDICES_COMMANDE_SCRIPT: tuple[str, ...]      # os.system(, subprocess. : leur litteral est redecoupe
CIBLES_SURES: frozenset[str]                  # /dev/null, nul, $null, &1, &2
OPAQUES: frozenset[str]                       # eval, iex

# _commande.py
class Invocation(NamedTuple):
    programme: str                   # base, minuscules, sans .exe ; '::m' ou '.m' pour un appel .NET
    args: tuple[str, ...]            # apres le programme, enveloppes et VAR=x retirees, dequotes
    redirections: tuple[tuple[str, str], ...]   # (operateur, cible) ; '<' lit, '>' '>>' '2>' ecrivent
    enveloppes: tuple[str, ...]
    profondeur: int                  # 0 direct, 1 dans un shell imbrique
    amont: tuple[str, ...]           # cibles venues d'un tube (xargs) ou de find -exec
    repertoire: str | None           # dernier cd de la ligne, pour resoudre les chemins relatifs
    texte: str                       # la sous-commande brute, pour les messages et le balayage de garde_donnees
class Analyse(NamedTuple):
    invocations: tuple[Invocation, ...]
    opaque: str | None               # motif : guillemet non ferme, deux niveaux, encode, eval, shell alimente par un tube
def analyser(commande: str, outil: str) -> Analyse   # jamais d'exception, jamais de disque

# _effets.py
class Acces(NamedTuple):
    chemin: str                      # brut, deja prefixe du repertoire courant si relatif et cd present
    mode: str                        # LIT | ECRIT | META
    origine: str                     # le verbe ou la famille, pour le message
def acces(inv: Invocation) -> list[Acces]              # programme inconnu : []

# garde_*.decision : signatures inchangees
```

## Defaire

Une tache = un fichier ; retour = copie inverse depuis `etat-depart/lot-3/` (six fichiers, `sha256.txt`),
puis `doctor --complet`. Les trois nouveaux modules et les deux nouveaux fichiers de tests se suppriment ;
avant T8 rien ne les nomme.

## Ce que le plan ne fait pas

Aucun fichier suivi par git, aucun commit, `settings.json` intact, aucune dependance, aucune ecriture dans
`C:\dev\maos`. Les lots 2b tranches 3 et 4, 2d, 2e attendent la fin de ce lot.


---

## Revision 2, 17/09/2026 : apres l'attaque du plan (axe enchainement)

Rapport brut : `agents/2026-09-17-relecteur-eve-attaque-plan-lot-3-enchainement.md`, neuf findings, tous
verifies de ma main, tous integres. L'ordre des taches tient ; ce qui manquait est la securite **pendant**
l'execution et la verite du retour arriere.

1. **CRITIQUE, integre : un verrou qui leve laisse tout passer.** `main()` des trois verrous n'a pas de
   `try/except` ; une exception sort en code 1, que le harnais ne lit pas comme un refus (`_lib.py:274`,
   exit 2 seulement sur message). Pendant une bascule, un fichier a moitie ecrit juge l'appel suivant.
   Deux mesures, **avant T4** : une tache **T3bis** ajoute a `_lib` une enveloppe `executer(decision)` qui
   transforme toute exception en refus explicite (« verrou en erreur, appel refuse ») et une sonde
   `doctor` qui le prouve (un hook lance avec une entree qui le fait planter doit rendre le code 2) ; et
   **chaque verrou neuf s'ecrit en une seule ecriture** (outil `Write`, fichier entier), jamais par une
   suite d'`Edit` sur un `garde_*.py`. Verification avant la copie : la suite est jouee sur le fichier neuf
   depuis le scratchpad (import par chemin), puis une copie, puis `doctor --complet`.
2. **HAUTE, integre : le retour arriere par fichier est faux apres T7.** Restaurer un seul `garde_*.py`
   de depart rappellerait des fonctions retirees de `_lib` (3 usages dans `garde_git`, 5 dans
   `garde_perimetre`, 3 dans `garde_donnees`, verifies) : `AttributeError`, code 1, verrou ouvert. Regle
   ecrite : retour par fichier jusqu'a T6 ; **a partir de T7, retour total des six copies** puis
   `doctor --complet`. `verif_style`, `gate`, `nettoyer_caracteres` n'utilisent que `racine_projet`,
   `lire_entree`, `autoriser`, `refuser` : hors d'atteinte de T7 (verifie par grep).
3. **HAUTE, integre : « 33 tests git » etait faux** : 15 dans `GardeGitTests`, 4 dans
   `GardeGitSousAgentTests`, soit **19**. Corrige dans la table.
4. **MOYENNE, integre : `nettoyer_caracteres.py <fichier protege> --appliquer`.** En place : REFUS ; avec
   l'arbitrage 5 (un interpreteur qui lit passe), le script du depot sans indice d'ecriture passerait.
   Tranche : `_programmes.py` gagne `SCRIPTS_DU_DEPOT_QUI_ECRIVENT` (`nettoyer_caracteres.py` ecrit sous
   `--appliquer`) ; deux cas au corpus (avec `--appliquer` REFUS, sans PASSE).
5. **MOYENNE, integre : « 98 tests, attendus inchanges » comme controle de chaque tache** est faux des
   T6. Reecrit : « les 98 de depart verts, ajouts et reecritures comptes au journal ».
6. **MOYENNE, integre : un seul seuil de performance**, et la mesure qui compte est **par appel de
   hook** : `scratchpad/mesure_hook.py` chronometre `python garde_*.py < entree` (mediane et max sur
   sept appels) a T0 et a T8 ; les deux chiffres vont au journal ; seuil : la mediane a T8 ne depasse pas
   T0 de plus de 20 ms.
7. **MOYENNE, integre : `rm -f .git/index.lock`**, reparation courante d'un git interrompu, devient un
   REFUS : cas ajoute au corpus, annote « recours : la main de Melvyn », phrase dans `securite.md` a T10.
8. **BASSE, integre : huit sondes** dans `doctor`, pas sept.
9. **BASSE, integre : « `VAR=x` retirees en tete seulement »** ; `dd if=/dev/zero of=x` garde `of=x`.
   Le scanner ecrit a T2 le fait deja (`_position_du_programme` ne saute les affectations qu'en tete),
   et le test `test_les_formes_option_egale_valeur_et_les_verbes_rares_sont_refuses` en place le couvre.

Table des taches corrigee : T3bis (fail-closed et sonde) s'insere entre T3 et T4 ; T4 cite 19 tests ; T8
cite huit sondes et la mesure de performance ; la section Defaire porte la regle du retour total.

**Etat au moment de la revision** : T0 fait ; T1 fait (`_programmes.py`) ; T2 fait, **54 tests du scanner
verts** au deuxieme essai (un seul rouge au premier : `{}` de `xargs -I` etait avale comme une accolade de
groupe).
