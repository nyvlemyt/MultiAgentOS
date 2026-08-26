---
id: resource-s7-ml2-tp4-analyse-d-associations-pptx-6224667c
slug: resource-s7-ml2-tp4-analyse-d-associations-pptx-6224667c
source_key: 'sha256:6224667c9b29feb5a9a2a370aeea92cbbc1428f2cb94b235554ab414205e827e'
part_of: S7 - ml2
order: 6
manifest: null
derived_from: 'sha256:6224667c9b29feb5a9a2a370aeea92cbbc1428f2cb94b235554ab414205e827e'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - apriori
  - association-rules
  - machine-learning
  - itemset
  - support-confidence-lift
  - electric-school-bus
  - data-analysis
  - equity
domain: machine-learning
---
# S7 - ml2 — TP4 - Analyse d'associations.pptx

## Thesis

L'algorithme Apriori permet de découvrir automatiquement des règles d'association interprétables (X → Y) dans de grands datasets ; appliqué à 19 517 districts américains, il révèle que la diversité raciale est le premier prédicteur d'adoption de bus scolaires électriques (ESB), devant les programmes fédéraux de financement.

## Context

Travail pratique Machine Learning II (ING2-BDML2). Données : World Resources Institute — 19 517 districts US, 87 variables initiales réduites à 11 (variable cible : 'Has committed ESBs?'; variables explicatives : concentration PM2.5/ozone, type géographique, région Census, district tribal, financement ARP, programmes EPA 2022/2023, % non-blanc/hispanique, % faibles revenus). L'objectif sociétal est de mesurer l'impact des ESBs sur la qualité de l'air et l'équité territoriale.

## Reasoning

**Concepts clés.** Une règle d'association {X} → {Y} est caractérisée par trois métriques : (1) Support = fréquence de la règle dans le dataset ; (2) Confiance = P(Y|X), probabilité que Y soit présent sachant X ; (3) Lift = force réelle de l'association (lift > 1 indique une relation non aléatoire). **Algorithme Apriori.** Repose sur la propriété anti-monotone : si un itemset est infrequent, tous ses sur-ensembles le sont aussi — ce qui permet d'élaguer l'espace de recherche. Deux étapes : (a) extraction des itemsets fréquents (support ≥ minsup) ; (b) génération des règles dont la confiance ≥ minconf. **Démarche appliquée.** Préparation des données → exploration → application Apriori → interprétation. **Résultats principaux.** (1) Diversité = facteur n°1 : lift = 2,43 — les districts les plus diversifiés ont 2,4× plus de chances d'adopter un ESB que la moyenne nationale. (2) EPA 2023 plus efficace qu'EPA 2022 : lift 1,45 vs 1,26. (3) Districts ruraux du Midwest : confiance = 98,5 % de ne PAS avoir d'ESBs — zone la plus délaissée. **Recommandations.** Renforcer l'accompagnement du Midwest rural, amplifier les programmes EPA ciblés, adapter les solutions aux contraintes rurales (autonomie, infrastructure de recharge).

## Trade-offs

Limites identifiées : (1) Le financement seul (programme ARP) ne suffit pas — les districts très défavorisés cumulent des barrières structurelles que le financement ne lève pas. (2) La diversité comme prédicteur est portée principalement par les grandes villes, ce qui crée un biais géographique urban/rural. (3) Apriori est interprétable et standard du domaine, mais ne fournit pas de causalité — la corrélation diversité/ESB peut refléter des facteurs confondants (taille du district, pression politique locale, densité de réseau).

## See also

- FP-Growth (alternative plus efficace à Apriori pour les grands datasets)
- règles de classification associative (CBA)
- analyse de panier de marché (market basket analysis)
- métriques d'équité en ML (fairness metrics)
