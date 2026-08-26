---
id: resource-s7-ml2-fa640f29
slug: resource-s7-ml2-fa640f29
source_key: 'sha256:fa640f29cf3a733da3061667fa29a3dabed96dd70d2de94a07d7da7daba736c4'
part_of: null
order: null
manifest: null
derived_from: 'sha256:fa640f29cf3a733da3061667fa29a3dabed96dd70d2de94a07d7da7daba736c4'
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
  - unsupervised-learning
  - clustering
  - association-rules
  - anomaly-detection
  - electric-school-bus
  - dataset
  - labs
  - cours
domain: Machine Learning
---
# S7 - ml2

## Summary

Ensemble de ressources pédagogiques pour le cours Machine Learning II (semestre 7), couvrant les algorithmes d'apprentissage non supervisé — clustering (K-means, CAH), analyse d'associations (Apriori), détection d'anomalies — appliqués à un dataset réel sur l'adoption des bus scolaires électriques aux États-Unis (ESB). Comprend cours magistraux, TPs guidés, labs pratiques, corrections, fiches de révision et livrables étudiants.

## Fields/API

**name**: Cours magistraux
**value**: ch1_intro, ch2_cluster_analysis, ch3_association_analysis, ch4_anomaly_detection, cours_ml2.pdf — 4 chapitres couvrant l'introduction au ML non supervisé, l'analyse de clustering, l'analyse d'associations et la détection d'anomalies
**name**: Travaux pratiques
**value**: TP1 (présentation), TP2 (K-means clustering), TP3 (analyse dataset ESB), TP4 (analyse d'associations), TP5 (présentation) — séquence progressive d'application
**name**: Labs numérotés
**value**: Lab1, Lab2, Lab3, Lab4 (Machine Learning II 2526) — exercices pratiques structurés par séance
**name**: Dataset principal
**value**: Electric School Bus (ESB) adoption aux États-Unis — dataset version 9, accompagné d'une note technique, d'un change log et d'analyses (analyse_dataset_esb.docx, tp3_analyse_dataset_esb_ancienne.docx)
**name**: Évaluation
**value**: controle_blanc.pdf + corrige.pdf — contrôle blanc avec corrigé; exercice_cah_apriori.pdf — exercice ciblé CAH + Apriori; fiche_revision.pdf
**name**: Livrables étudiants
**value**: tp3_livrables_lock_presentation_tp3.pptx, tp3_lock_presentation_tp3.pptx, tp3_powerpoint_lock_after_prompt_20260527.pptx, tp3_powerpoint_lock_public_20260527.pptx — versions verrouillées des rendus TP3
**name**: Page projet ML2
**value**: Page explicative Projet ML2.pdf — description du projet fil rouge du cours
**name**: Template
**value**: template.pdf — gabarit de rendu

## Constraints

- Contenu en français principalement (cours, TPs, analyses) avec certaines ressources en anglais (technical note ESB, dataset documentation)
- Dataset ESB figé à la version 9 — se référer au change log avant toute analyse
- Les livrables TP3 sont verrouillés (lock) — versions de référence non modifiables
- Progression pédagogique linéaire : ch1 → ch4, TP1 → TP5, Lab1 → Lab4

## Examples

- Appliquer K-means sur le dataset ESB (TP2) pour segmenter les districts scolaires par profil d'adoption
- Extraire des règles d'association Apriori sur les caractéristiques de flottes (TP4, exercice_cah_apriori)
- Détecter des anomalies dans les données de consommation/recharge des bus électriques (ch4)
- Utiliser analyse_dataset_esb.docx comme référence d'analyse exploratoire initiale avant modélisation
