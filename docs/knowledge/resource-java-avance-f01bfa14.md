---
id: resource-java-avance-f01bfa14
slug: resource-java-avance-f01bfa14
source_key: 'sha256:f01bfa144b66b477914f3d221ddd2ca69cd2bb112cebc13f02075e94e63c464e'
part_of: null
order: null
manifest: null
derived_from: 'sha256:f01bfa144b66b477914f3d221ddd2ca69cd2bb112cebc13f02075e94e63c464e'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: resources
schema_version: '1'
tags:
  - java
  - efrei
  - projet
  - monopoly
  - livraison
  - notation
  - L3
domain: éducation / génie logiciel
---
# Java Avancé

## Summary

Fiche de cadrage du projet Java Avancé (ALSI62-CTP) à l'EFREI Paris, L3 LSI. Les étudiants codent un Monopoly Villejuif en Java (jeu de plateau + réseau), en binôme, sur 5 livrables notés de février à mai 2025. Chaque livrable vaut 4 points : 2 pour la complétion fonctionnelle, 2 pour la qualité du code (tests unitaires, qualité logicielle, fonctionnalités du langage). Le rendu passe par GitLab (fork, branches dev/livrable-x, pull request vers master) et chaque livrable est suivi d'une revue de code par l'enseignant.

## Fields/API

**name**: Cours
**value**: ALSI62-CTP — Java Avancé, EFREI Paris LSI L3
**name**: Enseignants
**value**: Arsène Lapostolet & Nada Nahle
**name**: Sujet
**value**: Monopoly Villejuif : simulation des règles du domaine + jeu en réseau
**name**: Nombre de livrables
**value**: 5
**name**: Points par livrable
**value**: 4 pts (2 complétion fonctionnelle + 2 qualité code)
**name**: Planning
**value**: Démarrage 10/02/2025 · L1 23/02 · L2 23/03 · L3 05/04 · L4 20/04 · L5 04/05
**name**: Outils interdits
**value**: LLMs / IA (interdits par l'école) ; partage de code entre binômes (plagiat)
**name**: Workflow Git
**value**: Fork GitLab → branche dev/livrable-x → merge template → coder/tests → PR vers master → revue enseignant → corrections → fusion
**name**: Livrable 1 — périmètre
**value**: Jet de dés, plateau (CSV), déplacement ; les joueurs ne font que passer leur tour

## Constraints

- Tests d'intégration fournis : condition nécessaire mais pas suffisante pour valider un livrable.
- La note est attribuée après application des recommandations de la revue de code.
- Pas de partage de code entre binômes.
- LLMs interdits ; utiliser documentation, Stack Overflow, Google.

## Examples

- Étapes de démarrage : créer compte GitLab → trouver binôme → forker → ajouter enseignant → s'inscrire sur Excel → cloner → créer module.
- Processus livraison L1 : créer branche dev/livrable-1, fusionner template/livrable-1 dedans, coder pour passer les tests, PR → master, revue, corrections, fusion.
