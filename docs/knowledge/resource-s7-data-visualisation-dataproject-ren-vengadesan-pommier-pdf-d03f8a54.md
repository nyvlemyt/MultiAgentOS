---
id: resource-s7-data-visualisation-dataproject-ren-vengadesan-pommier-pdf-d03f8a54
slug: resource-s7-data-visualisation-dataproject-ren-vengadesan-pommier-pdf-d03f8a54
source_key: 'sha256:d03f8a54b99a7e47a14c21046f90ff19c717b0432b19568f913ee60dc1b7db77'
part_of: resource-s7-data-visualisation-0f395360
order: 2
manifest: null
derived_from: 'sha256:d03f8a54b99a7e47a14c21046f90ff19c717b0432b19568f913ee60dc1b7db77'
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
  - data-visualisation
  - ACP
  - AFC
  - ACM
  - analyse-factorielle
  - census-income
  - machine-learning
  - statistiques
  - python
  - dataset
domain: Data Science
---
# S7 - data visualisation — DataProject_REN_VENGADESAN_POMMIER.pdf

## Summary

Rapport d'analyse multivariée (ACP, AFC, ACM) appliquée au Census Income Dataset (UCI, 32 561 individus, 15 variables). Objectif : explorer comment les caractéristiques démographiques et professionnelles structurent le niveau de revenu (>50 K$ vs ≤50 K$). Les trois méthodes se complètent : ACP sur quantitatif, AFC sur deux variables qualitatives, ACM sur l'ensemble des variables qualitatives.

## Fields/API

**name**: Dataset
**value**: Census Income (Adult Dataset) — UCI ML Repository, recensement US 1994, 32 561 obs., 15 variables (6 quantitatives, 8 qualitatives + 1 cible binaire income)
**name**: Variables quantitatives
**value**: age, fnlwgt, education-num, capital-gain, capital-loss, hours-per-week
**name**: Variables qualitatives
**value**: workclass, education, marital-status, occupation, relationship, race, sex, native-country ; cible : income (>50K / ≤50K)
**name**: Prétraitement commun
**value**: Valeurs manquantes codées '?' → NaN → suppression ou imputation ; standardisation (centrage/réduction) pour ACP ; factorisaton pour AFC/ACM
**name**: ACP — données
**value**: 6 variables quantitatives centrées-réduites
**name**: ACP — valeurs propres
**value**: Plage 0.802–1.311 ; 3 premières composantes ≈ 57 % variance ; 4 premières ≈ 80 % ; critère Kaiser λ>1 → 3 axes retenus (coude éboulis confirmé)
**name**: ACP — PC1
**value**: capital-gain + education-num + hours-per-week fortement corrélés → oppose profils à haut capital/éducation vs faibles
**name**: ACP — PC2
**value**: age + capital-loss → dimension démographique et patrimoniale
**name**: ACP — PC3 / fnlwgt
**value**: fnlwgt orienté en sens opposé à capital-gain et hours-per-week
**name**: ACP — limite
**value**: Variables qualitatives non prises en compte → compléter avec AFC et ACM
**name**: AFC — objet
**value**: Associations entre modalités de variables catégorielles (2 variables à la fois) ; axes typiques : travail/salaire, éducation/salaire
**name**: AFC — résultat clé
**value**: Plus le niveau d'emploi et d'éducation est élevé, plus les salaires augmentent (lecture directe des axes)
**name**: AFC — limite
**value**: Dépend fortement du codage (matrice de Burt / co-occurrence) ; vue exploratoire uniquement, ne remplace pas tests d'indépendance
**name**: ACM — données
**value**: Toutes les variables qualitatives du dataset ; lignes à valeurs manquantes retirées
**name**: ACM — inertie expliquée
**value**: Dim 1 : 42,86 % ; Dim 2 : 29,03 % ; Dim 3 : 28,10 % → cumul Dim1+Dim2 ≈ 71,9 %
**name**: ACM — Dimension 1
**value**: Dimension socio-économique : revenu ↔ métier ↔ niveau d'étude
**name**: ACM — Dimension 2
**value**: Dimension démographique : sexe ↔ statut familial ↔ pays d'origine
**name**: ACM — Profil favorisé
**value**: income >50K, Exec-managerial/Prof-specialty, Masters/Doctorate, statut Husband
**name**: ACM — Profil moins favorisé
**value**: income ≤50K, Handlers-cleaners/Other-service, HS-grad/Some-college, Not-in-family
**name**: ACM — limites
**value**: Modalités rares (native-country) éloignent artificiellement certains points ; graphiques chargés ; pas de causalité

## Constraints

- ACP applicable uniquement aux variables quantitatives (6/15 ici)
- AFC limitée à deux variables qualitatives à la fois
- ACM ne fournit pas d'explication causale, uniquement descriptive
- Les trois méthodes sont exploratoires — compléter avec tests statistiques formels pour inférence
- Modalités très peu représentées dans native-country peuvent biaiser les projections ACM

## Examples

- ACP : PC1 oppose un individu avec education-num=16, capital-gain élevé et 60h/semaine vs un individu sans capital et peu éduqué
- AFC : croisement workclass × income montre que 'Self-emp-inc' et 'Federal-gov' concentrent davantage de revenus >50K
- ACM : dans le plan factoriel, les modalités 'Doctorate' et 'Exec-managerial' et '>50K' apparaissent groupées à droite de l'axe 1
