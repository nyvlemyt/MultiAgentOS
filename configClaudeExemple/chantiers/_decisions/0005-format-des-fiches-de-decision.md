---
status: accepted
date: 2026-09-11
decideur: Melvyn
chantier: chantiers/2026-09-11-audit-csdr-vers-eve
---

# EVE doit elle se doter d'un format de fiche pour les décisions qui ne sont pas encore prises ?

Fiche pour décision Melvyn. Rédigée le 11/09/2026, chantier `chantiers/2026-09-11-audit-csdr-vers-eve`.
Aucune option ne s'exécute dans ce chantier : cette fiche est le livrable. Elle est elle même écrite dans le format proposé, avec `0003` et `0004` : ce sont les échantillons sur lesquels juger.

## L'énoncé (une phrase métier)

Les deux fiches de décision d'EVE sont nées « décision prise », si bien qu'une question posée à Edmond n'a aujourd'hui aucun endroit où vivre en attendant sa réponse.

## L'état des lieux (et pourquoi il est comme ça)

`chantiers/_decisions/0001:2` et `0002:2` portent tous deux `status: accepted` dès leur création, et `.claude/commands/chantier.md` §3.2 prescrit d'écrire la fiche **après** que Melvyn arbitre. Le dispositif est donc cohérent avec lui même : la fiche est une trace de décision, pas un support de décision.

Le manque se voit à un endroit précis. `chantiers/2026-09-10-socle-de-travail/design.md:269-280` aligne six questions à Edmond plus une à Melvyn, en prose, dans une spec de 295 lignes. Aucune ne porte d'option, d'effort, de réversibilité, ni d'emplacement pour une réponse datée. Elles sont posées, elles ne sont pas posables.

CSDR a la forme manquante : `c:\dev\csdr_codex\docs\DECISION_RETRAITEMENT_HISTORIQUE_2026-08-31.md` (190 lignes) porte un énoncé métier, un danger chiffré **avec la requête à exécuter et la grille de lecture du résultat**, des options avec effort et réversibilité, une recommandation distincte de la décision, une **question fermée**, la **réponse datée conservée** (y compris quand elle est sortie du cadre proposé), et une section de verrouillage.

## Le point dur, chiffré avant de trancher

**190 lignes par décision est intenable pour une personne seule.** Les fiches d'EVE font 18 et 44 lignes. Le rapport est de 4 à 10.

L'audit a mesuré ce qui manque vraiment, et cela tient en **quatre éléments**, pas en un gabarit :

1. un `status` qui admet l'attente (`proposed` ou `en_attente`) ;
2. des options portant explicitement **effort** (en fichiers touchés et dépendances nouvelles) et **réversibilité** ;
3. une **question fermée**, avec ses choix énumérés ;
4. une ligne **« Réponse / date »** vide, à remplir quand le décideur répond.

Ce que le format long apporte en plus et qui vaut chaque fois qu'un tiers tranche : le danger chiffré avant de trancher, avec la commande ou la requête exacte à exécuter et la grille de lecture. C'est ce qui transforme « je ne sais pas » en « voici comment savoir ».

Les trois fiches de cet audit permettent de mesurer le coût réel : `0003` fait 127 lignes, `0004` 141, celle ci 60. Elles sont plus longues que 25 lignes parce qu'elles portent leurs preuves ; c'est un choix, et il est discutable.

## Options

### Option A : ajouter les quatre éléments, garder le format court pour le reste

Règle d'emploi : format long si la décision est à trancher par un tiers, irréversible, ou touche une migration, un contrat public ou la production. Format court actuel (`0001`) si la décision est prise, réversible et locale.

- Effet aval : aucun. Les fiches vivent dans `chantiers/`, hors dépôt.
- Effet sur le dépôt : aucun.
- Effort : 1 gabarit, 1 ligne modifiée dans `chantiers/INDEX.md:28`, 0 dépendance.
- Réversibilité : totale.
- Risque : faible. Le seul risque est d'écrire des fiches trop longues, ce que les trois échantillons permettent déjà de juger.

### Option B : adopter le gabarit complet de CSDR

Les 190 lignes, toutes sections, pour toute décision.

- Effet aval : aucun.
- Effort : 1 gabarit, et 190 lignes par décision.
- Réversibilité : totale.
- Risque : élevé. Un format trop lourd n'est pas tenu, et un format non tenu est pire qu'aucun format.

### Option C : ne rien changer, poser les questions en prose

- Effort : nul.
- Réversibilité : totale.
- Risque : les six questions de `design.md:273-278` restent sans support. Elles seront posées à Edmond en prose, sans options ni recommandation, donc plus coûteuses pour lui à trancher.

## Recommandation

**Option A.** Le manque est réel et il touche la ressource rare, le temps d'Edmond. Les quatre éléments coûtent un gabarit et se rentabilisent dès la première question posée. L'option B copierait un format dimensionné pour un projet qui n'est pas dans la même situation.

Ce qui ferait changer d'avis : si la lecture de `0003` et `0004` te paraît trop longue pour ce qu'elles disent, alors la bonne cible est une version encore plus courte que l'option A, avec les preuves renvoyées au `memo-audit.md` plutôt que recopiées dans la fiche.

## Question fermée pour Melvyn

> EVE n'a aucun support pour une décision en attente, alors que sept questions attendent Edmond. Que fait on ?
> A. On ajoute les quatre éléments (statut d'attente, options avec effort et réversibilité, question fermée, ligne de réponse datée) et on garde le format court pour les décisions déjà prises. **(recommandé)**
> B. On adopte le gabarit complet de CSDR, 190 lignes.
> C. On ne change rien.
>
> Et une sous question, quelle que soit la réponse : les fiches `0003` et `0004` de cet audit (127 et 141 lignes) sont elles de la bonne longueur, ou faut il renvoyer les preuves au mémo et ne garder que la décision ?

Réponse / date : **Melvyn, 11/09/2026. Option A.** Les quatre éléments sont adoptés (statut d'attente, options avec effort et réversibilité, question fermée, ligne de réponse datée), et le format court reste la règle pour une décision déjà prise, réversible et locale. Melvyn n'a pas relevé la sous-question sur la longueur des fiches : elles restent en l'état, preuves comprises, et la question se reposera si elles deviennent pénibles à lire.

## Verrouillage une fois la décision prise

- Option A : écrire le gabarit dans `chantiers/_decisions/_gabarit.md`, modifier `chantiers/INDEX.md:28` pour énoncer la règle d'emploi, et mentionner le statut d'attente dans `.claude/commands/chantier.md` §3.2. Reformater `0003`, `0004` et cette fiche si la sous question appelle plus court.
- Option B : même chose, avec le gabarit de 190 lignes.
- Option C : consigner le refus ici avec sa date, et poser les sept questions à Edmond en prose depuis `design.md` section 11.
