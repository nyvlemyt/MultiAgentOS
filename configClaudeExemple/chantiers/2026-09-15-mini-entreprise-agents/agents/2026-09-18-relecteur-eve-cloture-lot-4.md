# Rapport brut : relecteur-eve, passe de cloture du lot 4, 18/09/2026

Depose tel quel par le fil. Brief particulier : aucun cycle de correction ne suivra, donc pour chaque
classe neuve le relecteur doit **proposer la phrase de limite a ecrire** dans `securite.md`.

Verdict : NEEDS_WORK, au sens « a ecrire », pas « a corriger ». Critere 1 : 1 faux refus. Critere 3 :
verifie en place. Critere 4 non tenu : quatre classes neuves hors des limites ecrites. 189 entrees
fabriquees, jamais executees.

| Sev | Ecart | Preuve | Phrase de limite proposee |
| --- | --- | --- | --- |
| CRITIQUE | Le correctif sur les dossiers de destination depend du dossier du processus du hook et de l'etat du disque : le test lit le chemin tel qu'ecrit, sans le dossier de la commande | `cp .env chantiers` REFUS quand le processus est dans le projet, **PASSE** quand il est ailleurs ; `cd chantiers && cp ../.env <sous-dossier>` PASSE alors que la forme directe est REFUS | « La destination n'est reconnue comme dossier que par sa forme ou par le disque vu du dossier du processus : un `cd` devant la rend invisible. Ecrire la destination avec sa barre oblique finale. » |
| HAUTE | Dossier de destination pas encore cree, ou connu a l'execution | `robocopy . chantiers/tmp .env`, `xcopy .env chantiers/tmp /Y`, `find chantiers -maxdepth 1 -type d -exec cp .env {} ;`, `ls chantiers \| xargs -I{} cp .env chantiers/{}` : tous PASSE | « Un dossier de destination qui n'existe pas encore (`robocopy`, `xcopy`, qui le creent) ou qui vient des accolades ou d'un glob n'est pas reconnu : le fichier qui y nait n'est pas juge. » |
| HAUTE | `7z a` : le nom de l'archive creee n'est pas juge, seule la valeur de `-o` l'est | `7z a <hors perimetre>/sortie.7z documentation` PASSE ; `zip -r <hors>/sortie.zip documentation` REFUS | « Le nom de l'archive creee par `7z` n'est pas juge, seule la valeur de `-o` l'est. » |
| MOYENNE | Indices d'ecriture d'un code en ligne non exhaustifs | `copyFileSync`, `cpSync`, `os.link`, `os.symlink`, `ZipFile(x, 'w')` : tous PASSE | « Seuls les indices connus font d'un code en ligne une ecriture : les fonctions de copie et de lien ecrivent sans etre vues. » |
| MOYENNE | Contenu d'une archive extraite | `unzip a.zip -d .`, `tar -xzf a.tar.gz -C .`, `Expand-Archive -DestinationPath .` : PASSE ; un `.env` dans l'archive ecrase le vrai | « Le contenu d'une archive n'est pas connu : une extraction dans le projet ecrit tout ce qu'elle porte, `.env` compris. Lister avant (`tar -tf`, `unzip -l`). » |
| MOYENNE | **Faux refus** (critere 1) : extraction tar sans `-C` | `tar -xzf chantiers/archive.tar.gz` refuse pour « aucune cible resolue », alors que `unzip` sans destination passe | « Faux refus assume : `tar -x` sans `-C`, dont le dossier n'est pas nomme ; le contourner par `-C .`. » |
| BASSE | La docstring du catalogue promet « aucune E/S disque » alors que le test de dossier lit le disque | docstring contre code | corriger la docstring en meme temps que la limite |

Trous de classes deja ecrites (ne rouvrent rien) : lien symbolique cree puis suivi ; `curl -sSO` lu comme
une option de sortie (sur-couverture, refuse hors perimetre).

Comptes : axe 1, 60 cas, **1 faux refus** ; axe 2 (les quatre correctifs du cycle 3 a rebours), 64 cas,
5 ecarts **tous dans la famille du dossier de destination**, les trois autres correctifs sans ecart
(11, 11 et 14 cas verts) ; axe 3, 45 cas, 5 classes. Aucun fichier du depot modifie.

Recommandation : les six phrases ci-dessus dans `securite.md`, et **si une seule ligne de code restait
permise**, resoudre la destination contre le dossier de la commande avant le test de dossier.
