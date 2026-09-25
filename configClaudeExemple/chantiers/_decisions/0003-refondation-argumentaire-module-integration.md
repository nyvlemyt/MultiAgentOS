---
status: superseded
superseded_by: 0008-recentrage-edmond-14-09 (decision Edmond du 14/09/2026)
date: 2026-09-11
decideur: Melvyn
chantier: chantiers/2026-09-11-audit-csdr-vers-eve
---

# La décision 0002 doit-elle être rouverte, maintenant que son modèle de référence s'est révélé faux ?

Fiche pour décision Melvyn. Rédigée le 11/09/2026, chantier `chantiers/2026-09-11-audit-csdr-vers-eve`.
Aucune option ne s'exécute dans ce chantier : cette fiche est le livrable.

## L'énoncé (une phrase métier)

La décision d'architecture du module d'intégration d'EVE a été prise le 10/09/2026 en s'appuyant sur CSDR comme modèle ; l'audit a établi que les trois faits sur lesquels cet appui repose sont faux, et la question est de savoir si la décision tient quand même.

## L'état des lieux (et pourquoi il est comme ça)

`chantiers/_decisions/0002-module-integration-eve.md` décide qu'EVE reçoit une app Django séparée `integration/`, « calquée sur les couches de CSDR », dont le point d'entrée est une commande de gestion. Son argument d'autorité est écrit noir sur blanc : « Le modèle existe déjà sur le poste : `C:\dev\CSDR\ingestion\` (2 439 lignes, en couches) et son client API `C:\dev\CSDR\api\` (2 440 lignes). »

Trois faits établis par l'audit du 11/09 défont cet argument, chacun vérifié deux fois, par un agent puis par la session principale.

**Fait 1 : la fiche mesure la mauvaise copie de CSDR.**

```text
$ cd /c/dev/CSDR && find ingestion -name '*.py' -not -path '*__pycache__*' | xargs wc -l | tail -1
2439 total
$ cd /c/dev/csdr_codex && find ingestion -name '*.py' -not -path '*__pycache__*' | xargs wc -l | tail -1
4221 total
```

Les 2 439 lignes correspondent exactement à `C:\dev\CSDR`, copie dont le dernier commit est `d4cc26e` du **27/05/2026**. Le dépôt vivant est `c:\dev\csdr_codex`, dernier commit `b94fb02` du 04/09/2026, et son `ingestion/` fait 4 221 lignes. La décision est fondée sur un dépôt périmé de plus de trois mois, dans son chemin, son volume et sa description.

**Fait 2 : les couches prises pour modèle sont en dépendance circulaire.**

```text
$ cd /c/dev/csdr_codex && grep -rn "from csdr_web" ingestion/ --include='*.py'
ingestion/pipeline/ingestion_pipeline.py:41:from csdr_web.services.period_registry_hooks import invalidate_period_registry

$ grep -rn "from ingestion" csdr_web/ --include='*.py' | wc -l
8
```

`ingestion` importe `csdr_web`, et `csdr_web` importe `ingestion` en huit endroits, dont cinq hors tests (`comment_repository.py:52`, `penalty_repository.py:54`, `period_registry.py:232` et `:274`, `signals.py:38`). Le découpage invoqué comme modèle de découplage ne possède pas cette propriété dans le dépôt vivant.

**Fait 3 : l'asymétrie de gouvernance est l'inverse de celle qui était supposée.**

```text
$ cd /c/dev/csdr_codex && git log --format='%an' | sort | uniq -c | sort -rn
     14 Melvyn POMMIER
     12 Pommier Melvyn            26 commits, auteur unique, depuis le 06/05/2026

$ cd /c/dev/Eve/EveBackEnd && git log --format='%an' | sort | uniq -c | sort -rn
    367 tmahandry
    101 Edmond GERARD
      1 Pommier Melvyn            469 commits, trois auteurs, depuis le 20/03/2025
```

CSDR est le projet personnel de Melvyn, 26 commits, un seul auteur. EVE est le projet d'équipe, 469 commits, où Melvyn a un commit sur 469 et où Edmond décide et relit. Adopter un motif dans CSDR ne coûtait qu'une décision personnelle. L'adopter dans EVE coûte une relecture par quelqu'un qui ne l'a pas choisi et n'a pas demandé ce chantier.

## Le point dur, chiffré avant de trancher

Le ratio de complexité par flux, mesuré sur les deux dépôts :

| Mesure | `csdr_codex` | EVE |
| --- | --- | --- |
| Flux métier ingérés | 1 | 21 |
| Lignes du module d'ingestion | 4 221, 40 fichiers, 6 couches nommées | `data/` hors tests et migrations : 11 587 lignes, 18 modules |
| Classes de modèle | 2 | 26 |
| Part du front dans le dépôt | 69 % (`csdr_web/`, 29 757 lignes sur 43 377) | aucun front |

CSDR mobilise 4 221 lignes et six couches (`domain`, `parsers`, `pipeline`, `repositories`, `services`, `transformers`) pour **un** modèle et **un** fichier mensuel. EVE traite 21 flux en 11 587 lignes. Transposer ce découpage à 21 flux produirait un module d'un ordre de grandeur supérieur à tout ce qui existe aujourd'hui dans EVE, et c'est Edmond qui le relirait.

Ce que ce point dur ne dit pas, et qu'il faut mesurer avant de trancher pour de bon : la spec du socle (`design.md` section 3) ne reprend pas les six couches de CSDR. Elle prévoit six fichiers (`manifest.py`, `plan.py`, `eve_api.py`, `report.py`, la commande, les tests). **L'écart entre ce que `0002` invoque et ce que `design.md` prévoit réellement est peut-être le vrai sujet** : la décision cite un modèle qu'elle n'applique déjà pas.

## Options

### Option A : rouvrir `0002` pour corriger son argumentaire, sans changer la décision

On réécrit la fiche : on retire l'appui sur CSDR, on réancre les chiffres sur `csdr_codex`, et on justifie l'app `integration/` par les arguments propres à EVE qui tiennent déjà seuls (le transport intra processus est justifié par `data/tests/e2e/base.py:1-7` ; la table de trace de l'étape 2 justifie l'app séparée plutôt qu'un sous paquet de `data/` ; le manifeste versionné se justifie par la vérification des clés contre `DataKey`).

- Effet aval (DEMAIN, Edmond, exports) : aucun. Rien n'est encore écrit dans le dépôt.
- Effet sur le dépôt : aucun fichier de code. Une fiche réécrite, hors dépôt.
- Effort : 1 fichier (`_decisions/0002`), 0 dépendance nouvelle.
- Réversibilité : totale.
- Risque : faible. Le risque résiduel est de garder une forme choisie pour une mauvaise raison, même si elle se trouve être la bonne.

### Option B : rouvrir `0002` et refaire le choix de forme, en repartant des besoins d'EVE

Comme A, plus une remise en concurrence de la forme : app `integration/` séparée contre sous paquet `data/integration/` contre commande unique. Le niveau structurant de `CLAUDE.md` impose alors deux `architecte-eve` en concurrence, comme le 10/09, mais cette fois sans le modèle CSDR dans le cadrage.

- Effet aval : aucun dans l'immédiat ; peut changer la forme livrée à l'étape 1.
- Effet sur le dépôt : aucun tant que la décision n'est pas reprise. Peut réduire l'empreinte vue par Edmond si le sous paquet l'emporte.
- Effort : 1 fiche, 2 agents, et une reprise de `design.md` section 3 si la forme change.
- Réversibilité : totale avant écriture, coûteuse après.
- Risque : rejouer une décision déjà prise coûte du temps et peut aboutir au même résultat. Le 10/09, Melvyn avait déjà récusé les deux propositions des architectes avec un critère qui tranchait autrement (« une version parfaite pour partir en prod »).

### Option C : ne rien rouvrir, corriger seulement les références factuelles

On laisse `0002` en l'état et on corrige uniquement les chemins et les volumes (`C:\dev\CSDR` vers `c:\dev\csdr_codex`, 2 439 vers 4 221), en notant l'écart en commentaire.

- Effet aval : aucun.
- Effet sur le dépôt : aucun.
- Effort : 2 lignes.
- Réversibilité : totale.
- Risque : élevé sur la durée. La fiche continuerait d'affirmer que les couches de CSDR sont un modèle, ce que l'audit a réfuté. Un lecteur futur, Edmond compris, la prendrait pour argent comptant.

## Recommandation

**Option A.** La décision d'avoir une app `integration/` avec une commande unique tient sur ses propres jambes, sans CSDR : le transport intra processus est prouvé par le dépôt d'EVE lui même, et l'app séparée se justifie par la table de trace de l'étape 2 qui ne doit pas atterrir dans les migrations de `data`. Ce qui tombe est l'argument d'autorité, pas la conclusion. L'option B coûte deux agents et une reprise de spec pour un chantier qu'Edmond n'a pas demandé, alors que rien n'indique qu'elle changerait le résultat.

Ce qui ferait changer d'avis : si la relecture de `design.md` section 3 montrait que le découpage en six fichiers a été calqué sur les six couches de CSDR plutôt que dérivé des besoins d'EVE, alors B redeviendrait le bon choix.

## Question fermée pour Melvyn

> La décision `0002` est fondée sur une copie périmée de CSDR et sur un modèle de découplage qui n'en est pas un. Que fait-on ?
> A. On rouvre `0002` pour corriger son argumentaire, sans changer la décision. **(recommandé)**
> B. On rouvre `0002` et on refait le choix de forme, avec deux `architecte-eve` et sans le modèle CSDR.
> C. On corrige seulement les chemins et les volumes, on laisse l'argumentaire.

Réponse / date : **Melvyn, 11/09/2026. Option A, étendue.** Ses mots : « pour la suite, oui rouvre tout ce qu'il faut pour intégrer ce que je viens de te dire et pas perdre l'objectif de faire un projet super solide sur EVE et de tout récupérer au max pour les autres projets. » Il a par ailleurs tranché, à la même heure, que le chantier socle **repart en étant conçu pour consommer les modules partagés** (voir `0006`).

L'extension par rapport à l'option A telle qu'elle était rédigée : la réouverture de `0002` ne se borne pas à retirer l'appui sur CSDR, elle ajoute une dimension que la fiche n'avait pas, l'app `integration/` consommera à l'étape 2 les modules du paquet partagé `bdfg-core` plutôt que du code repris de CSDR.

## Verrouillage une fois la décision prise

- Option A : réécrire `chantiers/_decisions/0002-module-integration-eve.md` (section « Le modèle existe déjà sur le poste » et alternatives écartées), passer son `status` à `accepted` avec la date de réponse, et corriger l'avertissement de source de `design.md` section 3 qui renvoie encore au chantier d'audit comme à un travail à venir.
- Option B : passer `0002` en `status: superseded`, ouvrir `0004` avec le résultat de la mise en concurrence, et suspendre `design.md` section 3 jusqu'à cette décision.
- Option C : corriger les deux références dans `0002` et ajouter une note datée disant que l'argument des couches a été réfuté le 11/09/2026, avec le renvoi à cette fiche.
