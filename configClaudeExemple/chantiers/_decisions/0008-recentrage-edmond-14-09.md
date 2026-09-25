---
status: accepted
date: 2026-09-14
decideur: Edmond
chantier: chantiers/PLAN.md
---

# EVE n'est pas le moteur de son alimentation : on rebranche l'existant sur elle, on ne construit ni module d'intégration ni module mail

Décision prise par Edmond au point du 14/09/2026 avec Melvyn, rapportée par Melvyn le jour même (`_missions/2026-09-14-retour-reunion-edmond.md`). Fiche au format court : la décision est prise, elle n'est pas à trancher.

## Contexte

Depuis le 10/09, le travail de Melvyn préparait une app `integration/` dans EVE (commande unique, manifeste des sources, graphe des 23 étapes ; décision `0002`, réouverte par `0003`), puis un dépôt séparé `bdfg-core` portant un module mail Microsoft 365 (décisions `0006` et `0007`). Le mail de Melvyn du 12/09 présentait cet outillage à Edmond et demandait s'il en voyait l'intérêt.

Le paysage réel, tel que Tania l'a laissé (`Documentation Projet Tania\Notes\passation_notes.md:50-70`) : des programmes existent déjà autour d'EVE, hors du dépôt. `FillDataEsgDemain` (script IT, C#, Gaëtan) alimente DEMAIN ; deux micro services (`ConvertControversesToJson`, `CreateFileControverses`) traitent les controverses ; Pentaho, ETL à part, alimente l'Infocentre avec l'historique JUMP (`Pentaho.md`). Les fichiers providers arrivent sur un partage.

## Décision

1. **EVE reçoit et sert, elle ne pilote pas.** Pas d'app d'intégration dans EVE, pas de tâche planifiée portée par EVE, pas de module mail.
2. **Les programmes existants sont modifiés pour déposer dans EVE** (`POST /insert_data/{data_key}`, puis référentiels et propriétaire). Avant d'en toucher un, on les recense tous : programme, source, destination actuelle, fréquence, déclencheur, propriétaire, dépôt.
3. **La consolidation en un seul programme est une décision d'après**, prise par Edmond quand la cartographie est complète.
4. **DEMAIN lira EVE** par `GET /export/demain/{data_key}`, une fois EVE alimentée par les vrais flux.
5. **Priorité immédiate : la branche `esgRatingLastModif`**, à jour de `develop`, testée à l'insertion, expliquée dans un document humain qu'Edmond valide avant de merger lui même.
6. **`bdfg-core` est mis de côté**, ni commité ni supprimé.

## Alternatives écartées

- **L'app `integration/` dans EVE** (décision `0002`) : elle ferait d'EVE le moteur, à rebours de ce qu'Edmond veut ; elle dupliquerait des programmes qui existent et que d'autres possèdent (IT, Gaëtan).
- **Le module mail dans `bdfg-core`** (décisions `0006`, `0007`) : hors de ce qui est demandé. Le besoin de notification n'a pas disparu, il n'est pas prioritaire et il n'est pas à EVE de le porter.
- **Construire de nouveaux scripts sans recenser les anciens** : c'est ce que le point 2 interdit. Le recensement est le livrable.

## Conséquences

- Décisions `0002`, `0003`, `0006`, `0007` passent en `superseded` par cette fiche. Leur raisonnement reste lisible.
- Chantiers `2026-09-10-socle-de-travail` et `2026-09-11-socle-modules-bdfg` : clos sans code. Ce qu'ils ont établi (ordre des 23 étapes, faits Graph et Azure) est conservé.
- Le plan devient : mission 0 (branche), mission 1 (cartographie, lecture seule), mission 2 (rebranchement des programmes, un chantier par programme), mission 3 (DEMAIN lit EVE). Détail dans `chantiers/PLAN.md`.
- La base de test de Melvyn naît de la mission 2 : un programme qui dépose dans EVE dépose là où on le lui dit.
- Ce qui n'est pas décidé par cette fiche : l'isolement des tests (`0004`), les questions d'environnement, et le sort final de `bdfg-core`.
