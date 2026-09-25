---
description: Ouvrir un chantier EVE (dossier, niveau de rigueur, dashboard, brainstorm) et le mener jusqu'à la spec et au plan validés.
argument-hint: "<sujet en quelques mots>"
---

# /chantier $ARGUMENTS

Ouvre et cadre un chantier. Aucun code n'est écrit dans cette commande : elle s'arrête au point d'étape validé.

## 1. Le dossier

1. Slug : date du jour puis le sujet en kebab-case, `chantiers/<AAAA-MM-JJ>-<slug>/`.
2. Crée `journal.md` (en-tête : sujet, branche, niveau, date ; section « Constats hors périmètre » vide) et `dashboard.html` (page autonome, charte des dashboards : fond `#FAF9F6`, encre `#26242E`, statuts en chips, sections « Point d'étape » et « À valider par toi »). Une ligne dans `chantiers/INDEX.md`.
3. Branche : si le travail touchera le dépôt, propose `features/melvyn/<slug>` depuis `develop` à jour et attends le mot de Melvyn avant de la créer. Vérifie `git stash list` et signale tout stash en attente.

## 2. Le niveau de rigueur

Propose un niveau avec ses critères (`CLAUDE.md`) et fais-le confirmer :

- **léger** : 1 fichier, aucun contrat public, aucun comportement changé
- **standard** : plusieurs fichiers ou un comportement changé
- **structurant** : contrat public (schéma, modèle, API, migration), nouveau module, architecture, authentification, upload, base

En cas de doute, propose le niveau supérieur. Note le niveau dans le journal et le dashboard.

## 3. Le cadrage

1. Appelle le Skill tool avec `superpowers:brainstorming`. La spec s'écrit dans `chantiers/<slug>/design.md` (préférence du projet, à la place de `docs/superpowers/specs/`). Une question à la fois. Dès qu'un terme du métier est flou, appelle le Skill tool avec `domain-modeling` et mets `CONTEXT.md` à jour. La spec porte une section obligatoire **« Où le changement agit, où on le prouve »** : une table `changement | couche où il agit | interface publique la plus proche | test principal à cette couche | tests aval (compléments)`. Une ligne vide dans cette table est un manque de la spec, pas un détail d'implémentation.
2. Au niveau **structurant**, après les approches : lance deux agents `architecte-eve` en parallèle avec le même brief et deux contraintes différentes (interface minimale ; cas courant trivial ; ou ports et adaptateurs si une dépendance externe est en jeu). Présente les deux propositions puis un tableau de critères (cohérence avec l'existant, rayon d'impact, réversibilité, testabilité, effort). Melvyn arbitre. Écris la décision dans `chantiers/_decisions/NNNN-<slug>.md` (format court : contexte, décision, alternatives écartées, conséquences).
3. **L'attaque de la spec** (niveaux standard et structurant) : lance en parallèle des agents `relecteur-eve` en mode attaque, un axe chacun, brief complet collé (la spec, `CONTEXT.md`, `qualite.md`, les retours d'Edmond connus) : **niveau de preuve** ; **chaîne du changement et périmètre** ; au structurant en plus, **aval et contrats**. Vérifie chaque finding de façon contradictoire. Les CONFIRMÉS entrent dans la spec avant qu'elle soit présentée ; les ÉCARTÉS vont au journal avec leur preuve.
4. Spec validée par Melvyn : mets à jour le dashboard (statut « spec validée »).

## 4. Le plan

1. Appelle le Skill tool avec `superpowers:writing-plans` ; le plan s'écrit dans `chantiers/<slug>/plan.md`. Chaque tâche a sa vérification, à la couche nommée dans la table de la spec.
2. **L'attaque du plan** (niveaux standard et structurant) : les mêmes axes que pour la spec, sur `plan.md` ; en plus, l'ordre des tâches et ce qui manque entre deux tâches. Mêmes règles : vérification contradictoire, CONFIRMÉS intégrés, ÉCARTÉS au journal.
3. Plan validé par Melvyn : mets à jour le dashboard.

## 5. Le point d'étape

Avant de rendre la main, écris dans le dashboard la section **« Point d'étape »**, en quatre blocs : ce qui est fait et pourquoi ; ce qui manque et pourquoi ; les conflits et les choix ouverts, avec leurs options ; ce qu'on choisit et pourquoi. Chaque choix ouvert va aussi dans « À valider par toi ». Melvyn valide le point d'étape ; l'implémentation démarre sur son mot, avec TDD (`superpowers:test-driven-development`) et le journal tenu au fil de l'eau. Le code s'écrit dans le fil principal, ou par `developpeur-eve` sur une tâche du plan validé dans le périmètre que son brief lui donne (`CLAUDE.md`, section « Skills et agents »). Le point d'étape se refait à chaque jalon et à chaque reprise d'un chantier interrompu.

## Ce que cette commande ne fait pas

Aucun commit, aucune écriture hors du chantier et de `CONTEXT.md`, aucune tâche du plan exécutée.
