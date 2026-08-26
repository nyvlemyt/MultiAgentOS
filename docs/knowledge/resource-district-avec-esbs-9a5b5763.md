---
id: resource-district-avec-esbs-9a5b5763
slug: resource-district-avec-esbs-9a5b5763
source_key: 'sha256:9a5b576322154389933abc60f3c796e93039e6e02445b5594db9ba00bc2290b7'
part_of: null
order: null
manifest: null
derived_from: 'sha256:9a5b576322154389933abc60f3c796e93039e6e02445b5594db9ba00bc2290b7'
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
  - electric-school-bus
  - support-confidence-lift
  - one-hot-encoding
  - data-preparation
  - class-imbalance
  - lab-efrei
domain: Machine Learning
---
# District avec ESBs

## Thesis

L'algorithme Apriori appliqué aux données d'adoption des bus scolaires électriques (ESB) aux États-Unis révèle que le financement fédéral (priorité EPA 2022/2023, éligibilité ARP) est le prédicteur associatif le plus fort — bien devant les facteurs environnementaux ou démographiques — et que l'outreach WRI-POD double le taux d'adoption observé. Apriori est particulièrement adapté ici car il ne requiert pas d'équilibre des classes, fonctionne sur données binaires/catégorielles mixtes et produit des règles si/alors interprétables directement par des décideurs.

## Context

Dataset ESB Initiative : 19 517 districts scolaires américains, 19 colonnes dont 12 retenues, 8 % de districts adoptants (1 559 avec ESBs vs 17 957 sans). Après nettoyage et encodage one-hot : ~13 200 transactions complètes, ~60 items binaires. Variable de décision : colonne '0a. Has committed ESBs?' (yes/no). Cours ML II (ADIF84), EFREI Paris, Lab 5.

## Reasoning

**Sélection des données** : 3 colonnes rejetées pour taux de NaN >85 % (contractor used 93 %, government agency 99,9 %, utility company 99,3 %) ; 1 colonne non discriminante (expression of interest = valeur unique). Les 12 colonnes retenues couvrent état, type LEA, localité (rural/suburban/urban/town), statut tribal, quartiles environnementaux (PM2.5, ozone, asthme, faibles revenus, non-blancs) et flags de financement (ARP, EPA2022, EPA2023, WRI-POD).

**Préparation en 5 étapes** : (1) suppression colonnes >85 % NaN, (2) standardisation Yes/No et NaN→No, (3) simplification LEA→4 catégories et State→top 12+OTHER, (4) conversion des quartiles flottants en libellés Q1_low/Q2_medium/Q3_high/Q4_very_high, (5) encodage one-hot → colonne binaire True/False par modalité.

**Métriques Apriori** : Support = P(A∩C) — fréquence absolue de la règle ; Confiance = P(C|A) = P(A∩C)/P(A) — probabilité conditionnelle ; Lift = Confiance/P(C) — mesure de dépassement du hasard (>1 association positive, =1 indépendance, <1 répulsion). La confiance seule ignore la fréquence de C ; le lift est le correctif obligatoire.

**Calibration des paramètres** : 7 configurations testées ; optimal retenu : min_support=0,05 / min_confidence=0,60 / min_lift=1,2 — équilibre entre nombre de règles exploitables et qualité métier.

**Top règles ESB** (→ Target_yes) : EPA2022+EPA2023 (conf ~0,85, lift ~3,2) > ARP+EPA2022 (~0,78, ~2,9) > WRI+EPA2022 (~0,75, ~2,6) > PM2.5_Q4+EPA2022 (~0,70, ~2,4) > LowIncome_Q4+ARP (~0,68, ~2,2). EPA (2022+2023) et ARP apparaissent dans 80 % des meilleures règles ; WRI-POD multiplie par ~2 le taux d'adoption.

## Trade-offs

**Support trop bas (0,03)** → explosion combinatoire de règles sans signification métier. **Support trop haut (0,15)** → quasi aucune règle ESB exploitable. **Confiance sans lift** → biais si le conséquent est fréquent de toute façon — toujours compléter. **Règles descriptives, non causales** : une association forte (ex. zone polluée + EPA Priority) ne prouve pas que la pollution *provoque* l'adoption. **Déséquilibre des classes** (8 % adoptants) : limite la généralisation ; des règles rares peuvent disparaître sous le seuil de support. **Données manquantes structurelles** : colonnes 2b/3j/3k inutilisables (>90 % NaN) — l'absence de données sous-traitant et fournisseur d'énergie affaiblit potentiellement les règles d'infrastructure.

## See also

Combiner avec Random Forest pour passer de l'association à la prédiction causale. Analyser les sous-groupes (urbain seul, rural seul) pour des règles contextualisées. Intégrer les résultats dans un tableau de bord interactif de ciblage des subventions. Collecter en priorité les colonnes 2b (contractor), 3j (government agency) et 3k (utility company) pour enrichir les règles dans une version future.
