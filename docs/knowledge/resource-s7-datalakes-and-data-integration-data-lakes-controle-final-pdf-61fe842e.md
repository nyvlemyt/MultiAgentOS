---
id: >-
  resource-s7-datalakes-and-data-integration-data-lakes-controle-final-pdf-61fe842e
slug: >-
  resource-s7-datalakes-and-data-integration-data-lakes-controle-final-pdf-61fe842e
source_key: 'sha256:61fe842e9b70613bbabb1e834a1a6f27ca042027e21b2d28867a381748d4820d'
part_of: S7 - Datalakes and Data Integration
order: 7
manifest: null
derived_from: 'sha256:61fe842e9b70613bbabb1e834a1a6f27ca042027e21b2d28867a381748d4820d'
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
  - data-warehouse
  - schema-on-read
  - blob-storage
  - file-storage
  - airflow
  - dvc
  - DAG
  - critical-path
  - slack-time
  - EST
  - LST
  - confidence-interval
  - student-t
  - CLT
  - data-integration
  - pipeline
  - data-engineering
domain: Data Engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___Controle_Final.pdf

## Summary

Examen final S7 Data Lakes & Data Integration (2024-2025). Couvre : (1) concepts fondamentaux Data Lake vs DW, Schema-on-Read, stockages Blob vs File, DVC vs Airflow ; (2) architecture 3-couches Raw/Staging/Curated avec API Gateway et APIs externes de vision ; (3) analyse de chemin critique sur DAG — définitions formelles EST/LST/slack, preuve d'existence de CP(G), monotonie sur sous-graphes ; (4) estimation statistique du temps d'exécution d'une tâche via moyenne empirique, variance corrigée, intervalle de confiance Student (n-1 ddl) ; (5) bonus : application du TCL à un DAG linéaire de 100 tâches i.i.d. N(1s, 0.04s²).

## Fields/API

**Data Lake vs Data Warehouse (2 différences clés)**: - Schéma : DW impose un schema-on-write (structuré à l'ingestion), le Data Lake utilise schema-on-read (structure appliquée à la lecture).
- Données : DW stocke des données structurées et nettoyées, le Data Lake accepte brut, semi-structuré et non-structuré.
**Schema-on-Read**: Le schéma est appliqué au moment de la lecture, pas de l'écriture. Exemple : un fichier CSV ou JSON est stocké brut dans la couche Raw ; le schéma (colonnes, types) est imposé uniquement lors de la requête (ex. via Spark ou Athena).
**Blob Storage vs File Storage**: **Blob Storage**: Stockage d'objets sans hiérarchie de répertoires native ; accès par identifiant unique (URL/clé) ; optimal pour fichiers binaires volumineux (images, vidéos, modèles ML). Ex. : AWS S3, Azure Blob.
**File Storage**: Système de fichiers hiérarchique (dossiers/sous-dossiers) ; accès par chemin ; compatible protocoles NFS/SMB ; adapté aux applis qui attendent un filesystem classique.
**DVC vs Airflow pour pipelines Data Lake**: **DVC (Data Version Control)**: Versionnement de données et de modèles ML ; définit des pipelines reproductibles via dvc.yaml ; orienté traçabilité et reproductibilité d'expériences ML.
**Airflow**: Orchestrateur de workflows DAG ; planification temporelle (cron), gestion des dépendances entre tâches, monitoring, retry — orienté production et scheduling récurrent.
**Architecture Data Lake 3 couches**: **Raw**: Données ingérées sans transformation (images brutes stockées en Blob Storage, ex. S3/Azure Blob).
**Staging**: Données nettoyées/normalisées ; images labellisées via API 1 (endpoint /predict) ; métadonnées semi-structurées issues de /metrics.
**Curated**: Données prêtes à l'usage analytique/ML ; images segmentées via API 2 (/segment) ; schéma stable et documenté.
**Chemin critique — définition formelle**: **formule**: C* = argmax_{C ∈ P(G)} Σ_{v ∈ C} d(v)
**P(G)**: Ensemble de tous les chemins source→puits du DAG G=(V,E).
**d(v)**: Durée (poids) de la tâche v, strictement positive.
**Slack time**: **formule**: Slack(v) = LST(v) − EST(v)
**EST(v)**: Earliest Start Time — date de début au plus tôt (max des EST+durée des prédécesseurs).
**LST(v)**: Latest Start Time — date de début au plus tard sans retarder le projet (durée totale − durée du chemin critique restant après v).
**tâche sur chemin critique**: Slack = 0.
**Estimateur du temps d'exécution (loi Normale)**: **moyenne_empirique**: d̂(v) = (1/n) Σ X_v^(i)
**variance_corrigée**: s²_v = 1/(n−1) Σ (X_v^(i) − d̂(v))²
**modèle**: X_v^(i) i.i.d. ~ N(d(v), σ²_v)
**IC_95%_sigma_inconnu**: IC = [x̄ − t_{α/2} × SE, x̄ + t_{α/2} × SE] avec SE = s/√n et t_{4,0.025} = 2.776 (pour n=5)
**TCL appliqué aux workflows**: **énoncé**: Pour n→∞ : (X̄ − µ) / (σ/√n) → N(0,1), soit S_n ≈ N(nµ, nσ²).
**application_DAG_linéaire_100_tâches**: Chaque A_i ~ N(1s, 0.04s²) ; S_100 ~ N(100s, 4s²) ; σ_total = 2s.
**Exemple DAG — 3 branches**: **branche_1**: A(5)→B(5)→C(8)→D(5)→E(5) — durée = 28
**branche_2**: A(5)→F(5)→G(10)→H(5)→E(5) — durée = 30 ← chemin critique
**branche_3**: A(5)→I(5)→J(5)→E(5) — durée = 20
**Exemple données d'exécution (n=5)**: **observations_s**: - 1.45
- 1.86
- 1.55
- 1.58
- 1.42
**d̂_v**: 1.572
**s²_v**: à calculer via formule variance corrigée
**IC_95%**: d̂(v) ± 2.776 × (s/√5)

## Constraints

- Calculatrice autorisée ; support de cours interdit.
- d(v) > 0 pour tout v ∈ V (durées strictement positives — condition de la définition formelle du chemin critique).
- CP(G) ≠ ∅ si G a un nombre fini de tâches et de chemins (preuve par contraposée ou absurde).
- Monotonie : si G ⊆ G′ alors |CP(G′)| ≥ |CP(G)| (ajout de nœuds/arêtes ne réduit pas le chemin critique).
- IC Student à n−1 degrés de liberté quand σ est inconnu ; pour n=5 : t_{4,0.025} = 2.776.
- Les temps d'exécution des tâches du DAG bonus sont indépendants (condition d'application du TCL).

## Examples

**label**: Chemin critique DAG 3-branches
**detail**: Branche 2 (A→F→G→H→E, durée 30s) est le chemin critique. Slack(branche 1) = 2s, Slack(branche 3) = 10s. Pour que toutes les branches soient critiques, ajuster les durées pour que chaque branche totalise 30s.
**label**: IC 95% temps d'exécution (n=5)
**detail**: Observations : [1.45, 1.86, 1.55, 1.58, 1.42]. d̂(v) = 1.572s. SE = s/√5. IC = [1.572 − 2.776×SE, 1.572 + 2.776×SE].
**label**: TCL — 1000 workflows de 100 tâches
**detail**: S_100 ~ N(100, 4). P(S_100 > 105) = P(Z > (105−100)/2) = P(Z > 2.5) = 1 − 0.9938 = 0.0062. Sur 1000 workflows : ≈ 6 dépassent 105s.
**label**: Stockage images couche Raw
**detail**: Blob Storage (ex. S3) recommandé : pas de schéma imposé, accès par clé, scalable pour binaires lourds.
