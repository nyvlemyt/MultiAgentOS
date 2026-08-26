---
id: resource-s6-optimisation-et-complexite-exo-3-pdf-5ecf096b
slug: resource-s6-optimisation-et-complexite-exo-3-pdf-5ecf096b
source_key: 'sha256:5ecf096b98f1f6a5bd0bece872d4e25b820cb1e749af7a263faaa94688e15f23'
part_of: S6 - Optimisation et complexité
order: 4
manifest: null
derived_from: 'sha256:5ecf096b98f1f6a5bd0bece872d4e25b820cb1e749af7a263faaa94688e15f23'
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
doc_type: howto
actionability: area
lane: knowledge
schema_version: '1'
tags:
  - linear-programming
  - optimization
  - simplex
  - constraints
  - graphical-method
domain: operations-research
---
# S6 - Optimisation et complexité — EXO_3.pdf

## Problem

Maximiser le profit de production de sandales (hommes H et femmes F) sous contraintes de cuir, de charge horaire et de quantité totale.

## Solution

Modéliser en programme linéaire : max Z = 20H + 30F, résoudre graphiquement en trouvant les sommets du polytope réalisable, évaluer Z en chaque sommet. Le point optimal est (H=8, F=9) avec Z_max = 430 €.

## Variations

La résolution peut aussi être conduite par la méthode du simplexe (tableau algébrique) ou par un solveur (PuLP, scipy.optimize.linprog, Excel Solver) ; la formulation mathématique reste identique.

## Pitfalls

Oublier la contrainte de non-négativité (H, F ≥ 0) ; mal traduire la contrainte de charge horaire différentielle (F − 0.75H ≤ 3, pas H − F) ; évaluer Z uniquement en un point intérieur plutôt qu'aux sommets du domaine réalisable.
