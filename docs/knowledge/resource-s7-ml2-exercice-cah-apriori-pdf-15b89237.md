---
id: resource-s7-ml2-exercice-cah-apriori-pdf-15b89237
slug: resource-s7-ml2-exercice-cah-apriori-pdf-15b89237
source_key: 'sha256:15b892372ab9aece798da96eb183c0ab1f63a173496ef05dce0813e016cfc73c'
part_of: S7 - ml2
order: 18
manifest: null
derived_from: 'sha256:15b892372ab9aece798da96eb183c0ab1f63a173496ef05dce0813e016cfc73c'
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
  - machine-learning
  - clustering
  - CAH
  - hierarchical-clustering
  - apriori
  - association-rules
  - unsupervised-learning
  - exam-prep
domain: Machine Learning
---
# S7 - ml2 — exercice_cah_apriori.pdf

## Summary

Corrigé modèle de deux exercices de ML2 : CAH (lien simple MIN puis lien complet MAX) sur 5 objets, et algorithme Apriori (F1→F2→F3 + règles d'association) sur 6 transactions. Tableaux complets à reproduire tels quels en contrôle, calculs vérifiés par programme.

## Fields/API

**Exercice 1 — CAH (5 objets A,B,C,D,E)**: **matrice_initiale**: A-B=2, A-C=6, A-D=10, A-E=9, B-C=5, B-D=9, B-E=8, C-D=4, C-E=5, D-E=3
**lien_simple_MIN_etapes**: - Étape 1 : min=2 → fusion {A,B} à h=2 ; d({A,B},X)=min(d(A,X),d(B,X))
- Étape 2 : min=3 → fusion {D,E} à h=3 ; d({D,E},X)=min(d(D,X),d(E,X))
- Étape 3 : min=4 → fusion {C,D,E} à h=4 ; d({A,B},{C,D,E})=min(5,8)=5
- Étape 4 : fusion finale {A,B}+{C,D,E} à h=5
**dendrogramme_hauteurs**: {A,B} à 2 ; {D,E} à 3 ; C rejoint {D,E} à 4 ; jonction finale à 5
**partition_2_clusters**: {A,B} et {C,D,E}
**variante_MAX_lien_complet**: Étapes 1-2 inchangées (paires de singletons : MIN=MAX). Puis d({D,E},C)=max(4;5)=5 → {C,D,E} à h=5 ; fusion finale à max=d(A,D)=10. Même partition, hauteurs différentes.
**reflexes_bareme**: - Refaire un tableau complet après CHAQUE fusion
- Écrire le min/max utilisé dans chaque case
- Hauteurs exactes sur le dendrogramme
- Comparer TOUTES les paires de clusters à chaque étape
**Exercice 2 — Apriori (6 transactions, minsup=3/6=50%)**: **transactions**: T1:A,B,C | T2:B,C,D | T3:A,B,C,D | T4:A,C | T5:A,B,D | T6:B,D
**F1**: {A}σ=4, {B}σ=5, {C}σ=4, {D}σ=4 → F1={A,B,C,D}
**F2**: {A,B}σ=3✓, {A,C}σ=3✓, {A,D}σ=2✗, {B,C}σ=3✓, {B,D}σ=4✓, {C,D}σ=2✗ → F2={{A,B},{A,C},{B,C},{B,D}}
**F3**: {A,B,C} : sous-ensembles OK → comptage σ=2 < 3 → éliminé APRÈS comptage. {B,C,D} : sous-ensemble {C,D}∉F2 → élagué AVANT comptage. F3 vide : arrêt.
**itemsets_frequents_finaux**: A, B, C, D, {A,B}, {A,C}, {B,C}, {B,D}
**regles_association**: **B→D**: s=4/6=0.667 ; c=4/5=0.80 ; lift=0.80/(4/6)=1.20 → lift>1 : association positive, règle intéressante
**A→B**: s=3/6=0.50 ; c=3/4=0.75 ; lift=0.75/(5/6)=0.90 → lift<1 : corrélation négative malgré c=75%
**distinction_cle**: {B,C,D} meurt à l'élagage (principe Apriori, avant comptage) ; {A,B,C} meurt après comptage
**reflexes_bareme**: - Justifier chaque support en listant les transactions
- minsup en nombre OU en fraction (préciser)
- Lift calculé avec les supports en fractions
- Conclure sur l'intérêt via le lift, jamais via la seule confiance

## Constraints

- minsup exprimé en nombre absolu (3) et en fraction (50%) — les deux sont acceptés mais doivent être cohérents
- Lien simple : d(cluster,X) = MIN des distances individuelles ; Lien complet : MAX
- Élagage Apriori : tout sous-ensemble de taille k-1 d'un candidat k doit être dans F(k-1), sinon rejet immédiat sans comptage
- Lift = confiance / support(conséquent) — jamais confiance seule pour juger une règle

## Examples

- d({A,B}, C) avec lien simple = min(d(A,C), d(B,C)) = min(6,5) = 5
- d({D,E}, C) avec lien complet = max(d(D,C), d(E,C)) = max(4,5) = 5
- lift(B→D) = (4/5) / (4/6) = 0.80 / 0.667 = 1.20 → règle intéressante
- lift(A→B) = (3/4) / (5/6) = 0.75 / 0.833 = 0.90 → corrélation négative
