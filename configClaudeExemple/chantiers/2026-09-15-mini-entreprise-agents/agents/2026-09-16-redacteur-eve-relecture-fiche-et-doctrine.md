# Rapport brut : relecture de la fiche `developpeur-eve` et de la doctrine

Agent : `redacteur-eve`. Lancé le 16/09/2026 en cours de tâche 5 du lot 1a, sur quatre écrits : la fiche, la ligne agents de `CLAUDE.md`, la ligne `.claude/agents/` de `README.md`, la section Agents du `REGISTRE.md`. Déposé tel quel le 16/09 au soir depuis la transcription de session. Toutes les corrections CRITIQUE et HAUTE ont été appliquées le même jour.

---

Revue de forme des quatre écrits (aucun fichier modifié). Deux trous CRITIQUES : le nouvel agent n'est nommé nulle part dans la doctrine, et une seconde fiche qui écrit est sur le disque sans ligne au registre.

## CRITIQUE

**1. `CLAUDE.md:28`, `developpeur-eve` n'est pas nommé.** L'ancienne phrase (« lecture seule », « le code s'écrit dans le fil principal ») a été retirée, mais rien ne la remplace : `grep -n "developpeur" CLAUDE.md` ne renvoie que la ligne 3 (Melvyn). Le point d'entrée, injecté dans le contexte de chaque sous agent, ne sait pas que la fiche existe. Remplacement de la puce : « quatre en lecture seule, `chercheur-eve`, `architecte-eve`, `relecteur-eve`, `redacteur-eve` ; une seule qui écrit, `developpeur-eve` (une tâche de code d'un plan validé, en TDD). Un agent n'écrit que dans le périmètre que son brief lui donne, avec les seuls outils que déclare sa fiche : c'est la ligne `tools` de la fiche qui fait foi. Partout ailleurs, le code s'écrit dans le fil principal ; commit, push et opération serveur y restent aussi, sur demande explicite de Melvyn. »

**2. `.claude/README.md:23`, le manuel annonce quatre fiches, il y en a cinq.** Même trou, dans la pièce dont le rôle est de lister les pièces ; et la colonne « Se teste par » ne vaut pas pour `developpeur-eve`, que ni `/chantier` ni `/revue` ne lancent. Remplacement : « Quatre fiches en lecture seule et une qui écrit du code, `developpeur-eve` ; ce qui est ouvert à chacune est sa ligne `tools`, où elle a le droit d'écrire est dans son brief | ... pour `developpeur-eve`, rejouer ses fixtures ».

## HAUTE

**3. `.claude/agents/developpeur-eve-sans-clause.md`.** `REGISTRE.md:56` affirme « Seule fiche qui écrit » ; le disque porte deux fiches avec `Edit, Write`. `doctor` le dit déjà en alerte. C'est tracé et voulu, mais tant que la variante survit, le registre est faux. Préféré : la supprimer dès le rouge constaté. Si elle doit passer, une ligne temporaire au registre, retirée avec elle.

**4. `developpeur-eve.md:50`, une consigne que l'agent ne peut pas exécuter.** « **Tests** : par `/gate` » : `/gate` est une commande du fil (`.claude/commands/gate.md`, `allowed-tools: Bash(python .claude/hooks/gate.py:*)`), inaccessible à un sous agent. Reste « ou avec `DB_CONFIG` forcé en sqlite », assez vague pour qu'un agent lance `manage.py test` avec le `.env` ambiant. Remplacement : « `python .claude/hooks/gate.py`, qui force lui même `DB_CONFIG` en sqlite (`gate.py:37,177`), ou un `manage.py test` dont la commande porte `DB_CONFIG` en sqlite. `/gate` est une commande du fil, tu ne peux pas l'appeler. »

**5. `developpeur-eve.md`, tout le fichier, sans accents, seule des cinq fiches.** Les `.py` du dispositif sont sans accents ; les quatre fiches `.md` voisines sont en français accentué. Passe d'accentuation.

## MOYENNE

**6. Deux écarts au format commun.** Les quatre fiches titrent `## Quand` et mettent le livrable en dernière étape de `## Processus`. Ici, le titre est `## Quand, de qui je recois, a qui je rends` et le rapport occupe une section à part. Titre : `## Quand`. Étape 5 remplaçant la section rapport. Les deux sections en plus (périmètre, ce qu'aucun verrou ne voit) portent ce qu'aucune des quatre n'a besoin de porter : elles restent.

**7. `developpeur-eve.md:26-30`, phrase illisible, deux « ou » pour « où ».** Remplacement fourni.

**8. `developpeur-eve.md:54-55`, dit deux fois.** La puce `**Fichiers**` répète la section dédiée au périmètre. À réduire à : « tu ne supprimes rien, et tu n'écrases rien que tu n'aies lu d'abord. »

## BASSE

**9. `REGISTRE.md:46`** annonce un format commun en six sections que la cinquième fiche ne suit plus. Une phrase à ajouter : « Seule fiche qui écrit du code, `developpeur-eve` ajoute deux sections que les autres n'ont pas à porter, le périmètre d'écriture et ce qu'aucun verrou ne voit ; et elle est la seule dont la vérification soit mécanique, par ses fixtures. »

**10. `REGISTRE.md:56`, chemin imprécis.** Lire `fixtures/developpeur-eve/`.

## Les axes, un par un

**1. Cohérence du dispositif.** Aucune phrase de l'ancien état ne survit. Le défaut est l'inverse, et c'est le pire : le nouvel état n'est écrit nulle part dans la doctrine (findings 1 et 2). Aucune promesse en excès : « un verrou refuse déjà `commit` et `push` à un sous agent » est tenu (`garde_git.py:108,215`), « deux contrôles de `doctor` » aussi. Un seul écart hors périmètre : `_decisions/0009` (amendement 3) promet « un contrôle vivant de la présence du champ dans `doctor.py` » ; il n'existe pas, `doctor.py` ne lit pas le corps des fiches.

**2. La fiche tient sans son auteur.** Oui, à deux écarts de format près et une redite interne.

**3. Une seule source de vérité.** « Un agent n'écrit que dans le périmètre de son brief » est écrit quatre fois : `CLAUDE.md:28`, `README.md:23`, `rules/communication.md:30`, et la fiche. Garder `CLAUDE.md` (il entre dans le contexte de chaque sous agent) et la fiche (clause opérante) ; le manuel doit lister et renvoyer, pas redire. La liste des agents existe trois fois : la table du `REGISTRE.md` fait foi, c'est elle que `doctor` contrôle. La répétition de l'interdit commit/push est voulue (décision 0009 amendement 3).

**4. Langue et style.** Un seul défaut, l'absence d'accents dans la fiche. `verif_style.py` rend `forme OK` sur les quatre fichiers.

**5. Ce qui ne devrait pas sortir : rien.** `EveDev` et `bdfg-srv-dev1` apparaissent dans `CLAUDE.md:9` et `README.md:45`, préexistants et hors du lot ; les deux fichiers sont exclus du dépôt. La fiche parle de « la base partagée » sans la nommer, c'est le bon niveau.

**Termes pour `CONTEXT.md` : aucun.** Un seul mot à tenir stable : **fiche** pour le fichier, **agent** pour l'instance qui tourne.

**Constat hors périmètre**, une ligne : `rules/communication.md:42-43`, la puce `- chantiers/PLAN.md ...` colle la fin du bloc de code sans ligne vide.
