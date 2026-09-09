---
id: resource-s6-optimisation-et-complexite-exo-3-2-pdf-72ba95af
slug: resource-s6-optimisation-et-complexite-exo-3-2-pdf-72ba95af
source_key: 'sha256:72ba95af858763fdefbbba48ae810b74f07bb626873914c1093b33e0bcd69423'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 2
manifest: null
derived_from: 'sha256:72ba95af858763fdefbbba48ae810b74f07bb626873914c1093b33e0bcd69423'
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
lane: knowledge
schema_version: '1'
tags:
  - linear-programming
  - optimisation
  - contraintes
  - methode-graphique
  - recherche-operationnelle
domain: mathématiques appliquées
---
# S6 - Optimisation et complexité — EXO_3-2.pdf

## Summary

Problème de programmation linéaire (PL) visant à maximiser le profit de production de sandales hommes (H) et femmes (F), résolu par méthode graphique. Le point optimal est (H=8, F=9) pour un bénéfice maximal de 430 €.

## Fields/API

**name**: Variables de décision
**value**: H = nombre de sandales hommes ; F = nombre de sandales femmes
**name**: Fonction objectif
**value**: max Z = 20H + 30F
**name**: Contrainte cuir
**value**: H + 1.5F ≤ 30 (disponibilité : 30 kg ; sandale H = 1 kg, sandale F = 1.5 kg)
**name**: Contrainte charge horaire
**value**: F − 0.75H ≤ 3 (la charge femmes ne dépasse pas celle des hommes de plus de 3 h ; H = 0.75 h, F = 1 h)
**name**: Contrainte production totale
**value**: H + F ≤ 17
**name**: Contraintes de non-négativité
**value**: H ≥ 0, F ≥ 0
**name**: Points remarquables des droites contraintes
**value**: H + 1.5F = 30 → (30,0) et (0,20) ; F − 0.75H = 3 → (0,3) et (−4,0) ; H + F = 17 → (17,0) et (0,17)
**name**: Point optimal
**value**: A(H=8, F=9) — intersection identifiée graphiquement
**name**: Profit maximal
**value**: Z_max = 20×8 + 30×9 = 160 + 270 = 430 €

## Constraints

- H + 1.5F ≤ 30
- F − 0.75H ≤ 3
- H + F ≤ 17
- H, F ≥ 0

## Examples

**description**: Évaluation de la fonction objectif au point optimal
**input**: H = 8, F = 9
**output**: Z = 20×8 + 30×9 = 160 + 270 = 430 €
