# Lot 4 : converger. Spec et plan

Ecrit le 18/09/2026 apres trois verdicts BLOCK d'affilee sur le lot 3bis, et sur la decision de Melvyn :
« on n'a pas pris le probleme dans le bon sens ; comprendre, planifier, orchestrer, executer, verifier ».
Niveau structurant. Le fil ecrit, sans agent, parce que ces fichiers sont des barrieres.

## 1. Comprendre : pourquoi ca ne converge pas

Le verrou essaie d'**enumerer les attaques**. C'est un ensemble infini : un shell peut nommer un fichier
de mille facons, et chaque forme fermee en decouvre deux. La preuve est au journal, mesuree :

| Passe | Entrees fabriquees | Trous trouves | Ou |
| --- | --- | --- | --- |
| Lot 3, verdict 3 | 154 | 5 | quoting, `find -exec`, `python -m`, `--config-env`, compression |
| Lot 3bis, verdict 1 | 137 | 4 | tags, `find -exec`, quote de traduction, modules d'archive |
| Lot 3bis, verdict 2 | 164 | 4 | `find` sans depart, accolades en chaine, casse des options, tag vide |
| Lot 3bis, verdict 3 | 173 | 6 | document en ligne non seul, `find -L`, accolades, `xargs -I` |

**Aucune de ces passes n'a trouve moins que la precedente.** Le corpus etait vert entre chacune : 606,
puis 633, puis 652, puis 664 cas. Un corpus vert ne dit rien de ce qui n'y est pas.

Trois causes, distinctes :

1. **Le critere de sortie est impossible.** « Aucun relecteur ne trouve rien » n'arrive jamais sur un
   analyseur de shell. Tant que c'est le critere, la boucle ne se ferme que par epuisement.
2. **Le verrou autorise ce qu'il ne comprend pas.** Quand l'analyse ne produit aucun acces, le verrou
   laisse passer. Or c'est exactement la signature d'un trou : `find -delete` sans point de depart, un
   document en ligne mal rattache, un `xargs -I` declasse en lecture. **Ne rien comprendre vaut
   autorisation**, alors que la doctrine dit l'inverse pour les commandes opaques.
3. **Le risque protege n'est pas hierarchise.** Le verrou met la meme energie a couvrir l'ecriture d'un
   `.env` (irreparable, bascule les tests sur la base partagee) et l'ecriture d'un fichier du projet
   (rattrapee par git en une commande). On paie partout le prix du pire cas.

## 2. La these du lot

**On arrete d'enumerer les attaques. On traite la consequence, et on inverse le defaut la ou la
consequence est irreparable.** Trois couches, de la plus convergente a la moins :

- **Couche 1, rendre le pire cas reparable** (de la main de Melvyn, une commande) : une copie de `.env`
  hors du depot. La doctrine justifie tout le dispositif par « une erreur y est irreparable » ; une
  sauvegarde fait tomber cette phrase, et avec elle la moitie de l'enjeu. **C'est la mesure la moins
  chere et la plus efficace de tout le chantier.**
- **Couche 2, inverser le defaut sur les verbes qui ecrivent** : un verbe d'ecriture dont l'analyse ne
  resout **aucune cible** est refuse, en le disant. C'est une regle **generique** : elle ne depend
  d'aucune forme de shell, elle ferme d'un coup toute la classe « le verrou n'a pas compris ». Trois des
  six trous ouverts en meurent, et les suivants de la meme famille aussi.
- **Couche 3, fermer les six trous nommes**, un par un, avec leur cas au corpus : ce sont des defauts
  precis, pas une classe.

Ce qui reste hors des trois couches est **assume et ecrit** : le verrou borne les erreurs franches, pas
la mauvaise foi. Personne ici n'attaque le poste ; ce qu'on previent, c'est ma propre maladresse.

## 3. Le critere de sortie, cette fois mesurable

Le lot 4 est fini quand **les quatre conditions** sont vraies, et pas quand un relecteur ne trouve plus
rien :

1. **Zero faux refus** sur la liste des commandes du travail quotidien du poste (au moins 50, ecrites au
   corpus, pas improvisees par un agent).
2. **Les six trous nommes sont fermes**, chacun avec son cas REFUS et son temoin PASSE.
3. **La regle generique est en place et mesuree** : toute commande dont un verbe d'ecriture ne resout
   aucune cible est refusee, et le cout en faux refus est chiffre sur le corpus entier.
4. **Une passe adverse neuve** ne trouve **aucun trou hors des classes deja ecrites comme limites**. Un
   trou d'une classe deja documentee ne bloque pas : il alimente la liste des limites, il ne rouvre pas
   le lot.

La condition 4 est le changement de fond. Elle admet qu'un analyseur de shell a une queue infinie, et
elle demande seulement que la queue soit **connue et ecrite**, pas vide.

## 4. Plan d'execution, dans l'ordre

| # | Tache | Preuve attendue |
| --- | --- | --- |
| 1 | La liste du travail quotidien au corpus : au moins 50 commandes reelles du poste, en cas PASSE | corpus vert, compte affiche |
| 2 | Regle generique : un verbe d'ecriture sans cible resolue est refuse | cas REFUS pour `find -delete`, `xargs -I` declasse, shell sans code ; cout en faux refus chiffre sur les 664 cas |
| 3 | Trou 1 : les tags portes par la phrase qui declare le document, pas par la derniere de la ligne | cas REFUS + temoin |
| 4 | Trou 2 : les options globales de `find` sautees avant les points de depart | cas REFUS + temoin |
| 5 | Trou 3 et 4 : les accolades substituees avant le decoupage, et toutes les expansions d'un code analysees | cas REFUS + temoin |
| 6 | Trou 5 : les accolades comptent comme positionnel des familles DESTINATION et DEPLACE | cas REFUS + temoin |
| 7 | Trou 6 : un groupe d'options courtes non alphabetique (`-9c`) declenche quand meme | cas PASSE (faux refus leve) |
| 8 | Doctrine : les trois couches, le critere de sortie, les limites assumees | chaque phrase a son cas |
| 9 | Passe adverse neuve, jugee au critere 4 | rapport depose, verdict |

La couche 1 (sauvegarde de `.env`) n'est pas dans ce tableau : elle est **de la main de Melvyn**, et elle
est ecrite dans `PLAN.md` et au dashboard.

## 5. Ce qu'on ne fait pas, et pourquoi

- **Pas de liste blanche generale des commandes.** Elle convergerait, mais elle rendrait le poste
  inutilisable : chaque commande nouvelle serait un refus, et un verrou qui gene le travail courant finit
  desactive. La couche 2 en garde l'esprit (le doute profite au refus) sans le cout.
- **Pas de refonte de l'analyseur.** Il fait 1 000 lignes, il tient 664 cas, et trois passes adverses
  n'ont trouve **aucune regression** sur ses acquis. Le probleme n'est pas sa qualite, c'est le critere
  qu'on lui appliquait.
- **Pas de quatrieme cycle sur le lot 3bis.** Il est clos, livre non valide. Le lot 4 est un lot neuf,
  avec sa boucle bornee a lui.
