# Rapport brut : relecteur-eve, verification contradictoire du lot 3bis, verdict 2, 18/09/2026

Depose tel quel par le fil. Brief : les six correctifs du cycle 1, les six fichiers de verrous, les trois
regles ; fabriquer ses entrees dans un script du scratchpad, ne pas rejouer le corpus ; trois axes
(correctifs a rebours, regressions, faux refus du quotidien) ; 400 mots au plus.

Verdict : BLOCK. Deux trous CRITIQUES, dont un dans le correctif `find` lui meme, plus une regression
HAUTE du correctif sur les groupes d'options et un trou HAUTE du correctif sur les tags. 164 entrees
fabriquees, 6 temoins verts.

| Sev | Axe | Entree exacte | Obtenu | Attendu (doctrine) | Cause |
| --- | --- | --- | --- | --- | --- |
| CRITIQUE | correctif find | `find -delete` ; `find -exec rm {} ;` | PASSE aux trois verrous, aucun acces produit | REFUS. GNU find prend le dossier courant par defaut : la commande efface tout le projet, `.env` compris. securite.md : `find -delete`, `-exec` et `-fprint` font agir | `_effets._acces_find` l.221-238 et `_commande._cibles_atteintes_par_find` l.1013-1021 : la liste des points de depart est vide quand aucun n'est ecrit, donc aucune cible |
| CRITIQUE | correctif find | `find . -exec sh -c 'rm {}' ;` ; `find tmp_uploads -exec sh -c 'cat {}' ;` | PASSE | REFUS. find substitue les accolades a l'interieur d'un argument ; donnees.md et la zone protegee. La forme sans quote est bien refusee : seule la chaine passe | `_commande._substituer` l.750-762 : le test ne porte que sur le token entier |
| HAUTE | regression du groupe d'options | `xz -C crc32 .env` ; `xz -T0 .env` ; `xz -T0 <hors perimetre>` ; `lzma -T0 .env` ; `zstd -T0 .env` | PASSE, acces en lecture seule | REFUS. xz 5.8.3 est sur le poste, la somme de controle et le nombre de fils prennent une valeur et n'arretent pas la compression : la source disparait | `_effets._declenche` l.100-114 : la mise en minuscules fait d'une option majuscule son homonyme minuscule, et le test de prefixe fait d'une option a valeur collee une option simple |
| HAUTE | correctif tag | un document en ligne a tag vide suivi d'une redirection vers `.env` | PASSE, redirection vue avec une cible vide | REFUS zone protegee : le tag vide est legal en bash, et `.env` est la cible de la redirection, pas le tag | `_commande._scanner` l.198-206 : le tag pas encore lu est marque par la chaine vide, donc un tag vide reste « pas encore lu » et avale le token suivant |
| BASSE | faux refus | un document a tag vide suivi d'un nom de fichier | REFUS « tag de fin introuvable » | PASSE (commande anodine). Meme cause. Seul faux refus trouve |

Sorties brutes (extraits recopies) :

```text
find -delete                                     -> PASSE
find -exec rm {} ;                               -> PASSE
find . -exec sh -c 'rm {}' ;                     -> PASSE
find tmp_uploads -exec sh -c 'cat {}' ;          -> PASSE
xz -C crc32 .env                                 -> PASSE
xz -T0 .env                                      -> PASSE
xz .env                                          -> REFUS(perimetre) zone protegee en ecriture
acces de `find -delete`     : [('find', [])]
acces de `xz -T0 .env`      : [('xz', [('.env', 'LIT')])]
tokens de `find . -exec sh -c 'rm {}' ;` : [('rm', ('{}',)), ('sh', ('-c', 'rm {}')), ('find', ...)]
document a tag vide puis redirection -> PASSE ; redirections=(('>', ''),)
```

Sondes non destructrices au shell du poste (les seules commandes executees) :

```text
find -maxdepth 2 -name b.txt -print                       -> ./sous/b.txt   (find prend le dossier courant)
find . -maxdepth 2 -name b.txt -exec sh -c 'echo ATTEINT:{}' ;  -> ATTEINT:./sous/b.txt
xz --long-help                                            -> -C, --check=NAME ; -T, --threads=NUM
xz --version                                              -> 5.8.3
```

zstd est absent du poste : le trou est theorique pour lui, la table le classe quand meme.

Comptes : temoins 6 sur 6 verts. Axe 1 (six correctifs a rebours) 54 entrees, 6 ecarts. Axe 2
(regressions) 34 entrees, **0 ecart** : documents en ligne vers bash et python, edition en place,
archives, `curl -sSo`, depot hors perimetre, PowerShell, options abregees et groupees de git, glob de
fichiers caches, tous corrects. Axe 3 (faux refus) 45 entrees du travail quotidien, **0 faux refus** ;
plus 20 entrees de complement et 5 sur le tag vide. 1 faux refus au total, marginal, meme cause que le
trou sur les tags.

Ce qui tient : le tag protege par antislash, le tag quote au milieu, la forme a tabulations, deux
documents sur la meme ligne, le tag jamais ferme, la quote de traduction sous toutes ses formes, les six
modules python, la sortie sur le tube des compresseurs, la substitution des accolades en token entier.

A trancher (aucun ecart compte) : un `find` sans point de depart avec un motif de nom resout son glob a
la racine seulement, donc ne voit pas les fichiers des sous-dossiers ; tout reste dans le perimetre et
recuperable par git, mais la doctrine ne dit pas si un glob d'action recursive doit etre juge
recursivement.

Aucun fichier du depot modifie, aucun agent lance.
