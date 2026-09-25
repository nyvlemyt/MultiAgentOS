# Rapport brut : relecteur-eve, verification du lot 4 contre son critere de sortie, 18/09/2026

Depose tel quel par le fil. Brief : lire `design-lot-4.md` en entier et rendre le verdict **contre son
critere de sortie section 3**, pas contre l'exhaustivite ; un trou d'une classe deja ecrite comme limite
ne compte pas ; le critere 1 (zero faux refus sur le quotidien) passe avant les trous.

Verdict : NEEDS_WORK

Criteres 1, 2 et 3 tenus ; le critere 4 tombe : quatre trous hors des classes ecrites dans
`securite.md`, dont un qui laisse passer un interdit de `git.md`.

Ecarts qui comptent (classe neuve)

| Sev | Lieu | Constat | Preuve | Correctif |
| --- | --- | --- | --- | --- |
| CRITIQUE | `_commande.py:926-935` (famille GIT) | une commande portee par git sous guillemets n'est pas relue : elle devient un seul token, donc un programme inconnu | `git submodule foreach 'git push --force'` AUTORISE ; la meme avec une suppression de la zone protegee AUTORISE. Interne : programme egal a la chaine entiere, aucun argument. Les formes nues sont refusees, `rebase -x` sous guillemets aussi (il passe par l'analyse de texte) | router un token unique porteur d'espace vers l'analyse de texte, comme `rebase -x` |
| HAUTE | `_programmes.py:125,146-148` | le langage interne d'un programme hors famille INTERPRETE n'est pas lu : la redirection d'`awk`, le drapeau `w` de `sed`, les commandes pointees de `sqlite3` ecrivent sans produire d'acces | les trois formes PASSENT ; l'acces rendu est une lecture du programme lui meme | balayer le programme en ligne de ces trois, ou l'ecrire comme limite |
| MOYENNE | `_effets.py:339` (OPTION_CIBLE) | cible par defaut implicite non modelisee : apres un `cd` hors perimetre, l'ecriture est invisible | `cd <hors> && unzip a.zip` PASSE ; `7z x` PASSE ; `wget <url>` PASSE. `tar -xf` est refuse par la regle generique | etendre la regle generique a ces verbes quand l'option de sortie manque |
| MOYENNE | `_programmes.py:115-116` | grammaire mal modelisee, et une cible bidon resolue neutralise la regle generique | `csplit -f <hors>/part <fichier> 10` PASSE (le prefixe est lu, le nombre de lignes est « ecrit ») ; `robocopy <source> <hors>/out note.md` PASSE, alors que sans le troisieme mot il est refuse | `csplit` en OPTION_CIBLE ; `robocopy` et `xcopy` : destination au deuxieme positionnel |
| MOYENNE | `_effets.py:459` (amont PowerShell) | seul faux refus du quotidien : l'amont d'un tube PowerShell est marque en ecriture | une lecture hors perimetre envoyee vers un fichier du projet est REFUSEE ; l'equivalent en bash passe. Anterieur au lot 4 | amont en lecture pour les cmdlets qui recoivent un contenu, ou ecrire le contournement |

Limite deja ecrite (ne compte pas) : aucune rencontree. `rm $(cat liste.txt)` et `xargs -a liste.txt rm`
sont desormais refuses par la regle generique. A arbitrer par le fil : si un `cd` hors perimetre prealable
range le troisieme trou dans « le verrou borne les erreurs franches », il devient une limite a ecrire.

Comptes. Axe 1 : 84 commandes reelles (Django, git, ruff, pyright, coverage, npx, graphify, rapports
Markdown par document en ligne, archives, copies, PowerShell), **1 faux refus** (celui ci-dessus).
Axe 2 : 37 cas a rebours des six trous, 36 refuses, **0 trou** ; 9 temoins verts ; regle generique
verifiee sur `rm`, `cp`, `find -delete`, `xargs -a`, `tar -xf`, et `tee` vers un processus refuse comme
ecrit. Axe 3 : 100 sondes, 4 classes neuves.

Sorties brutes : `axe 1 : 61 commandes, 1 faux refus` puis `quotidien lot 2 : 23 commandes, 0 refus` ;
`axe 2a : 37 cas, 1 qui passe encore` (une suppression de fichiers du projet, que le perimetre autorise ;
la meme forme vers la zone protegee ou vers l'exterieur est refusee) ; `axe 2b : 9 temoins, 0 faux
refus` ; `axe 3 : 65 sondes, 12 passent`. Aucune commande executee, seules les fonctions de decision ont
ete appelees. Aucun fichier du depot modifie.
