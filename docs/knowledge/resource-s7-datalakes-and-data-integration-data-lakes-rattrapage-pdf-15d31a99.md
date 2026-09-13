---
id: resource-s7-datalakes-and-data-integration-data-lakes-rattrapage-pdf-15d31a99
slug: resource-s7-datalakes-and-data-integration-data-lakes-rattrapage-pdf-15d31a99
source_key: 'sha256:15d31a99c78c0511e7b20cae7eeb499a0bbc839cdcd8344b07f594bd8940a965'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 10
manifest: null
derived_from: 'sha256:15d31a99c78c0511e7b20cae7eeb499a0bbc839cdcd8344b07f594bd8940a965'
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
  - data-lake
  - ETL
  - ELT
  - data-integration
  - airflow
  - dvc
  - api-gateway
  - parallelisation
  - workers
  - pipeline-optimisation
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___Rattrapage.pdf

## Summary

Examen de rattrapage 2024-2025 du cours Data Lakes et Data Intégration (L3/M1 ingénieur). Couvre : architecture en couches raw/staging/curated, différences ETL vs ELT, comparaison Airflow vs DVC, avantages d'une API Gateway, et un mini-problème quantitatif d'optimisation de pipeline par parallélisation de workers.

## Fields/API

**Couches d'un Data Lake**: **raw**: Zone d'atterrissage — données brutes telles qu'ingérées, immuables, tout format.
**staging**: Zone de travail — nettoyage, validation, transformations légères ; données temporaires.
**curated**: Zone consommable — données modélisées, qualifiées, prêtes pour l'analytique et les APIs.
**ETL vs ELT**: **ETL**: Extract → Transform → Load. La transformation se fait AVANT le chargement, hors du data lake, dans un moteur externe. Adapté aux entrepôts traditionnels avec schéma rigide.
**ELT**: Extract → Load → Transform. Les données brutes sont chargées d'abord, puis transformées dans le lake lui-même (Spark, SQL distribué). Adapté aux data lakes car exploite leur puissance de calcul native.
**cas ETL préférable**: Données très sensibles où seules les données transformées/masquées doivent entrer dans le système (conformité RGPD stricte).
**cas ELT préférable**: Volumes massifs (logs, IoT) où le schéma n'est pas connu à l'avance et où la puissance de calcul du lake (ex. Databricks) dépasse celle d'un moteur externe.
**Airflow vs DVC**: **Airflow**: Orchestrateur de workflows (DAGs). Gère la planification, les dépendances entre tâches, les relances sur échec. Cas d'usage : pipelines ETL/ELT périodiques, ingestion multi-sources.
**DVC**: Versioning de données et de modèles ML (Git-like pour datasets/artefacts). Gère la reproductibilité des expériences. Cas d'usage : pipelines ML où la traçabilité dataset↔modèle est critique.
**différence clé**: Airflow = orchestration temporelle ; DVC = versioning et reproductibilité scientifique.
**API Gateway pour Data Lake**: **avantages**: - Point d'entrée unique — simplifie la gouvernance et l'audit des accès.
- Authentification et autorisation centralisées (OAuth2, RBAC).
- Rate limiting et throttling pour protéger les ressources de calcul.
- Abstraction du stockage sous-jacent (S3, ADLS, GCS) — les consommateurs ignorent la couche physique.
- Versioning d'API pour faire évoluer le lake sans casser les clients.
**API REST vs accès direct**: **API REST**: Standard, multilangage, sécurisé, gouverné. Overhead réseau et sérialisation. Adapté aux applications web et aux partenaires externes.
**accès direct**: Haute performance (lecture native Parquet/Delta), pas d'overhead. Nécessite des droits IAM fins et une bonne maîtrise du format. Adapté aux data engineers et data scientists internes.

## Constraints

- Calculatrice autorisée.
- Support de cours interdit.
- Le temps de transformation est supposé proportionnel au volume de données.
- Chaque worker traite sa portion indépendamment des autres.

## Examples

**pipeline_e_commerce**: **contexte**: 3 étapes séquentielles : Ingestion (20 min, 22 GB), Transformation (45 min, 22 GB → 10 GB), Agrégation (35 min, 10 GB → 2 GB).
**Q1_temps_actuel**: 20 + 45 + 35 = 100 min
**Q2_parallelisation_3_workers_par_source**: **méthode**: Temps transformation ∝ volume. Logs=15GB, Transactions=5GB, Utilisateurs=2GB, total=22GB.
**logs**: 15/22 × 45 ≈ 30.7 min
**transactions**: 5/22 × 45 ≈ 10.2 min
**utilisateurs**: 2/22 × 45 ≈ 4.1 min
**résultat**: max(30.7, 10.2, 4.1) ≈ 30.7 min (le worker logs est le goulot)
**Q3_nouveau_temps_total**: 20 + 30.7 + 35 = 85.7 min
**Q4_distribution_optimale_logs_70pct**: **méthode**: Logs = 70% × 45 = 31.5 min ; reste = 30% × 45 = 13.5 min.
**option_2w_logs_1w_reste**: max(31.5/2, 13.5/1) = max(15.75, 13.5) = 15.75 min
**option_1w_logs_2w_reste**: max(31.5, 13.5/2) = 31.5 min (pire)
**distribution_optimale**: 2 workers sur les logs, 1 worker sur transactions+utilisateurs → 15.75 min de transformation
**temps_total_optimal**: 20 + 15.75 + 35 = 70.75 min
