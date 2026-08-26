---
id: resource-s7-ml2-ch3-association-analysis-fr-pdf-5d83030d
slug: resource-s7-ml2-ch3-association-analysis-fr-pdf-5d83030d
source_key: 'sha256:5d83030da867b25f4dbe0bc0b012a99a8c7f1cde6ca1679f200afc457b87db86'
part_of: S7 - ml2
order: 11
manifest: null
derived_from: 'sha256:5d83030da867b25f4dbe0bc0b012a99a8c7f1cde6ca1679f200afc457b87db86'
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
  - association-rules
  - apriori
  - frequent-itemsets
  - support
  - confidence
  - data-mining
  - machine-learning
domain: Machine Learning
---
# S7 - ml2 — ch3_association_analysis FR.pdf

## Summary

L'analyse d'association extrait des règles de cooccurrence (X → Y) dans des ensembles de transactions. Les deux métriques clés sont le support (proportion de transactions contenant X∪Y) et la confiance (proportion de transactions contenant X qui contiennent aussi Y). L'algorithme Apriori réduit l'espace de recherche via le principe anti-monotone : tout sous-ensemble d'un ensemble fréquent est fréquent ; tout sur-ensemble d'un ensemble non fréquent est non fréquent. Il procède en deux phases : (1) génération des itemsets fréquents par passes itératives avec élagage, (2) génération des règles à haute confiance par partitions binaires de chaque itemset fréquent.

## Fields/API

**name**: Support (s)
**definition**: Proportion de transactions contenant l'itemset. s({Lait,Couche,Bière}) = 2/5 = 0.4
**formula**: s(X∪Y) = |transactions contenant X et Y| / |T|
**name**: Confiance (c)
**definition**: Probabilité conditionnelle que Y apparaisse sachant X. c({Lait,Couche}→{Bière}) = s({Lait,Couche,Bière}) / s({Lait,Couche}) = 2/3 ≈ 0.67
**formula**: c(X→Y) = s(X∪Y) / s(X)
**name**: minsup
**definition**: Seuil minimal de support ; un itemset est dit fréquent ssi support ≥ minsup
**name**: minconf
**definition**: Seuil minimal de confiance ; une règle est retenue ssi confiance ≥ minconf
**name**: k-itemset
**definition**: Ensemble d'exactement k éléments. Le treillis complet contient 2^d candidats pour d éléments distincts.
**name**: Règle d'association
**definition**: Expression X → Y (X∩Y = ∅). Signifie cooccurrence, pas causalité. Un itemset de taille k génère 2^k − 2 règles candidates.
**name**: Propriété anti-monotone du support
**definition**: ∀X⊆Y : s(X) ≥ s(Y). Fondement de l'élagage Apriori : si un itemset est non fréquent, tous ses sur-ensembles le sont aussi.
**name**: Fk
**definition**: Ensemble des itemsets fréquents de taille k (résultat après comptage et élagage).
**name**: Lk
**definition**: Ensemble des itemsets candidats de taille k (avant filtrage par minsup).

## Constraints

- L'implication X→Y indique la cooccurrence, jamais la causalité.
- Avec d éléments distincts : 2^d itemsets candidats, 3^d − 2^(d+1) + 1 règles possibles (pour d=6 : 602 règles) — la force brute est prohibitive.
- Complexité de comptage brut : O(N·M·w) avec N = transactions, M = candidats, w = largeur moyenne ; M = 2^d rend cela impraticable sans élagage.
- La confiance n'est pas anti-monotone en général (c(ABC→D) peut différer de c(AB→D)), mais elle l'est par rapport à la taille du conséquent au sein d'un même itemset fréquent : c(ABC→D) ≥ c(AB→CD) ≥ c(A→BCD).
- La génération de candidats Fk-1 × Fk-1 : fusionner deux (k-1)-itemsets partageant les k-2 premiers éléments, puis élager tout candidat dont un sous-ensemble de taille k-1 n'est pas dans Fk-1.

## Examples

**title**: Calcul support et confiance
**description**: Base de 5 transactions (TID 1-5). {Lait,Couche,Bière} apparaît dans TID 3 et 4 → support = 2/5 = 0.4. {Lait,Couche} apparaît dans TID 3, 4, 5 → confiance({Lait,Couche}→{Bière}) = 0.4/0.6 ≈ 0.67.
**title**: Apriori — itération minsup=3 sur 6 items (Bread,Milk,Beer,Diaper,Coke,Eggs)
**description**: Passe 1 : Coke (2) et Eggs (1) sous seuil → éliminés. Passe 2 : 6 paires candidates (sans Coke/Eggs) ; {Beer,Bread} et {Beer,Milk} sous seuil → éliminés. Passe 3 : 4 triplés candidats issus de la fusion Fk-1×Fk-1 ; tous sous seuil → Fk vide, algorithme terminé. Réduction : 41 candidats bruts → 13 avec élagage.
**title**: Élagage de candidats (slide 24)
**description**: F3={ABC,ABD,ABE,ACD,BCD,BDE,CDE}. L4={ABCD,ABCE,ABDE} après fusion. Élager ABCE car ACE∉F3 et BCE∉F3 ; élager ABDE car ADE∉F3. Résultat : L4={ABCD}.
