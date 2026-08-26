---
id: resource-s6-optimisation-et-complexite-exo-3-3-pdf-cc49b4fb
slug: resource-s6-optimisation-et-complexite-exo-3-3-pdf-cc49b4fb
source_key: 'sha256:cc49b4fb0311cace3a09ac8b6d1a800d26c20b3bba7324f7c7b734e7872c62bb'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 3
manifest: null
derived_from: 'sha256:cc49b4fb0311cace3a09ac8b6d1a800d26c20b3bba7324f7c7b734e7872c62bb'
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
  - optimization
  - graphical-method
  - operations-research
  - constraints
  - objective-function
domain: mathematics
---
# S6 - Optimisation et complexité — EXO_3-3.pdf

## Summary

Problème de programmation linéaire (PL) à deux variables : maximiser le profit de production de sandales hommes (H) et femmes (F) sous contraintes de cuir, charge horaire et capacité. Résolu graphiquement — point optimal A(8,9), profit maximal 430 €.

## Fields/API

**variables**: H = nb sandales hommes, F = nb sandales femmes
**objective_function**: max Z = 20H + 30F
**constraints**: - H + 1.5F ≤ 30 (cuir disponible : 30 kg)
- F − 0.75H ≤ 3 (charge horaire femmes ≤ charge hommes + 3 h)
- H + F ≤ 17 (production totale max)
- H, F ≥ 0
**feasible_vertices**: - A(8, 9) → Z = 430 €
- B(0, 3) → Z = 90 €
- C(17, 0) → Z = 340 €
**optimal_solution**: H = 8, F = 9, Z_max = 430 €
**unit_profits**: 20 € / sandale homme, 30 € / sandale femme
**resource_rates**: **cuir_homme**: 1 kg
**cuir_femme**: 1.5 kg
**travail_homme**: 0.75 h
**travail_femme**: 1 h

## Constraints

- Solution entière non imposée explicitement (H=8, F=9 sont entiers par coïncidence graphique)
- La contrainte de charge horaire est formulée comme un écart relatif, non une limite absolue
- La résolution est purement graphique — pas de méthode du simplexe détaillée

## Examples

- Évaluation en A(8,9) : Z = 20×8 + 30×9 = 160 + 270 = 430 €
- Évaluation en C(17,0) : Z = 20×17 + 30×0 = 340 € (sous-optimal)
- Évaluation en B(0,3) : Z = 20×0 + 30×3 = 90 € (sous-optimal)
