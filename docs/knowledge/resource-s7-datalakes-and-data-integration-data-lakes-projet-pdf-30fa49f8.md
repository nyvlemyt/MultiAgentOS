---
id: resource-s7-datalakes-and-data-integration-data-lakes-projet-pdf-30fa49f8
slug: resource-s7-datalakes-and-data-integration-data-lakes-projet-pdf-30fa49f8
source_key: 'sha256:30fa49f83105dcefc207003a6d8d8b593ce2ea87e01814dee6a3501d82ccd985'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 9
manifest: null
derived_from: 'sha256:30fa49f83105dcefc207003a6d8d8b593ce2ea87e01814dee6a3501d82ccd985'
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
lane: workflows
schema_version: '1'
tags:
  - data-lake
  - data-engineering
  - pipeline
  - ETL
  - ingestion
  - API-gateway
  - Airflow
  - DVC
  - elasticsearch
  - S3
  - deep-learning
  - EFREI
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___Projet.pdf

## Problem

Concevoir et implémenter un data lake complet de A à Z — de l'ingestion de données hétérogènes jusqu'à leur exposition via une API Gateway — dans le cadre du projet final du cours Data Lakes & Data Integration (EFREI 2025-2026).

## Solution

1. Structurer le lake en zones distinctes (raw / staging / curated ou architecture justifiée). La zone raw utilise obligatoirement Elasticsearch ou un bucket S3. Les zones suivantes sont au choix libre et doivent être justifiées.
2. Ingérer deux sources : un dataset fichier ET une source API (Hugging Face, API publique, ou données personnelles).
3. Implémenter la pipeline d'intégration avec DVC ou Apache Airflow (scheduling pour l'API, X-COM si DAG complexe).
4. Exposer une API Gateway avec au minimum : GET /raw, GET /staging, GET /curated, GET /health, GET /stats.
5. Livrer un dépôt GitHub + un README exhaustif documentant l'architecture, les choix techniques, et les procédures de build/utilisation.

## Variations

9 thèmes suggérés avec stack et pipeline type :
• Audio & Musique — S3 (raw .mp3/.wav) → librosa MFCC/spectrogrammes (staging) → CNN classification genre (curated). Sources : FMA, Freesound API, Spotify API, Soundcharts API.
• Computer Vision / Vidéosurveillance — frames brutes (raw) → YOLO/SSD bounding boxes (staging) → logs anomalies structurés JSON (curated). Sources : Kaggle, HuggingFace, flux RTSP publics.
• Astronomie — fichiers .fits/.png NASA (raw) → alignement + débruitage (staging) → CNN 1D/LSTM détection transit exoplanètes (curated). Sources : NASA Kepler/TESS, APOD API, Exoplanet Archive.
• Séries temporelles / Finance / IoT — payloads JSON API (raw) → alignement temporel + indicateurs techniques (staging) → Isolation Forest/Autoencoder anomaly detection (curated). Sources : yfinance, Open-Meteo, OpenAQ.
• NLP / Sentiment — flux texte JSON (raw) → tokenisation + BERT/VADER scores (staging) → tendances agrégées + dashboard e-réputation (curated). Sources : Reddit PRAW, Mastodon, HuggingFace Datasets.
• Neurosciences EEG/ECG — fichiers .edf/.bdf sur S3 (raw) → filtrage MNE-Python ICA/PCA (staging) → PSD + classifieur LSTM épilepsie/sommeil (curated). Sources : PhysioNet, OpenNeuro.
• Smart Cities / Mobilité — flux JSON/protobuf GTFS-RT (raw) → indexation spatiale Uber H3 (staging) → prédiction saturation GNN/XGBoost (curated). Sources : Open Data Paris/Lyon, Île-de-France Mobilités.
• Sport / Wearables — fichiers .gpx/.fit (raw) → métriques avancées HRV/zones puissance (staging) → détection surentraînement + prédiction marathon (curated). Sources : Strava API, Garmin, Fitbit.
• Génomique — fichiers .fasta/.fastq (raw) → alignement + variant calling (staging) → Transformer DNABERT classification gènes (curated). Sources : NCBI APIs, Ensembl API.
Niveau avancé (optionnel, noté séparément) : ajouter POST /ingest (pipeline standard, chronométrée sur 1 et 100 éléments) et POST /ingest_fast (≥30 % gain via Numba, NumPy vectorisation, multithreading, async, cache).

## Pitfalls

• Oublier un des deux types de source (fichier ET API) → perte de points sur les exigences de base.
• Zone raw hors Elasticsearch/S3 sans justification → non-conforme.
• Endpoints API incomplets ou non fonctionnels (/health et /stats souvent omis).
• Absence de gestion des exceptions dans les scripts de transformation → malus robustesse.
• README insuffisant : le prof doit pouvoir builder et utiliser la solution sans connaissance préalable du projet.
• Confondre niveau avancé avec niveau standard : le /ingest_fast requiert une mesure précise et documentée des gains de performance, pas seulement une optimisation vague.
• Négliger la reproductibilité du pipeline (DVC ou Airflow mal configuré = pipeline non rejouable).
