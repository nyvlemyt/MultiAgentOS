# Rapport brut : relecteur-eve, verification contradictoire du lot 3bis, verdict 3 (le dernier), 18/09/2026

Depose tel quel par le fil. Brief : les quatre correctifs du cycle 2, les six fichiers de verrous, les
trois regles ; fabriquer ses entrees dans un script du scratchpad, ne pas rejouer le corpus ; trois axes ;
400 mots au plus.

Verdict : BLOCK. Trois trous CRITIQUES ouvrent encore l'ecriture hors perimetre, l'ecriture de `.env` et
`git push --force` ; deux d'entre eux sont dans la zone meme des correctifs du cycle 2. 173 entrees
fabriquees, aucune executee.

| Sev | Axe | Entree exacte | Obtenu | Attendu et doctrine | Cause |
| --- | --- | --- | --- | --- | --- |
| CRITIQUE | correctif du tag | un document en ligne alimentant un shell, suivi sur la meme ligne d'un `;`, d'un `&&` ou d'un tube, dont le corps efface `.env` ou pousse en force | PASSE aux trois verrous | REFUS. securite.md : le corps d'un document en ligne est du texte sauf s'il alimente un shell ou un interprete | `_commande.py:443-449` : le corps est attache a la **derniere** phrase de la ligne, pas a celle qui declare le document ; `fermer_phrase` ne transporte pas les tags. Dump : `tokens=['sh'] doc=None` et `tokens=['true'] doc='rm .env'` |
| CRITIQUE | correctif find | `find -L <hors perimetre> -name '*.md' -delete` ; idem `-P`, `-D tree`, `-O3`, et avec `-exec rm {}` | PASSE | REFUS. securite.md : `find -delete` et `-exec` sont des ecritures jugees | `_effets.py:229-232` et `_commande.py:1019-1023` : la boucle des points de depart casse au premier token en tiret, le chemin reel est perdu, et le point de depart implicite le remplace. Correctif : sauter les options globales de find avant de lire les departs |
| CRITIQUE | correctif des accolades | `find . -name '.env' -exec sh -c 'rm {}' ;` ; idem avec une enveloppe ou un interpreteur | PASSE (temoins : accolades nues et `sed -i` refuses) | REFUS | `_commande.py:766` produit un token par cible ; la famille SHELL ne lit que le premier argument apres l'option de code, donc la cible dangereuse tombe en seconde position et devient un parametre positionnel |
| HAUTE | correctif des accolades | `find . -name '*.md' -exec cp {} <hors perimetre>/{}.bak ;` | PASSE, destination retenue `.bak` | REFUS | `_commande.py:517-521` : des accolades non quotees coupent le token en trois ; le correctif ne couvre que la forme quotee |
| HAUTE | regression ancienne | `echo a.txt \| xargs -I {} cp {} <hors perimetre>/` | PASSE (temoin `cp a.txt <hors>/` refuse) | REFUS | `_effets.py:56` retire les accolades des positionnels, il n'en reste qu'un, et la famille DESTINATION le declasse en lecture |
| BASSE | faux refus | `gzip -9c <hors perimetre>/README.md` | REFUS | PASSE : l'option de sortie sur le tube n'ecrit pas la source | `_effets.py:117-120` n'eclate un groupe court que s'il est alphabetique, donc un groupe qui porte un chiffre ne declenche pas |

A trancher, non compte : `xargs -a liste.txt rm` ne produit aucun acces ; cette limite (les cibles venues
d'un fichier) n'est pas ecrite dans `securite.md`.

Comptes. Axe 1 : find 26 cas et 7 ecarts (une cause), accolades 25 cas et 7 ecarts (trois causes),
options 29 cas et 1 ecart, tags 15 cas et 6 ecarts (une cause). Axe 2 regressions : 24 cas, **0 ecart**
(les correctifs sur les options et sur les tags n'ont rien casse : archives, git, edition en place,
PowerShell, compresseurs, modules python, quoting ANSI-C, `env -S` tiennent). `garde_donnees` : 4 cas,
0 ecart, son balayage brut du texte rattrape les trous de find, ce que `garde_perimetre` n'a pas. Axe 3
faux refus : 50 cas du quotidien, **1 faux refus** (le groupe `-9c`).

Correctifs proposes, par ordre : porter les tags de document a la phrase qui declare le `<<` et non a la
derniere de la ligne ; sauter les options globales de find avant de lire les departs ; rejouer la
sous-phrase une fois par cible plutot que de produire un token par cible ; substituer les accolades avant
le decoupage en tokens ; compter les accolades comme un positionnel des familles DESTINATION et DEPLACE.

Aucun fichier du depot modifie, aucune commande d'attaque executee.
