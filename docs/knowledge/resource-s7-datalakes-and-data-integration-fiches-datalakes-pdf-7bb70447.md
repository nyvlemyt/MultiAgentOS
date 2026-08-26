---
id: resource-s7-datalakes-and-data-integration-fiches-datalakes-pdf-7bb70447
slug: resource-s7-datalakes-and-data-integration-fiches-datalakes-pdf-7bb70447
source_key: 'sha256:7bb70447484402668e961d64b67076a347499d1cb8392a2646b175eb667056fd'
part_of: S7 - Datalakes and Data Integration
order: 17
manifest: null
derived_from: 'sha256:7bb70447484402668e961d64b67076a347499d1cb8392a2646b175eb667056fd'
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
  - pipeline
  - orchestration
  - airflow
  - dag
  - sql
  - nosql
  - fastapi
  - tfidf
  - bm25
  - amdahl
  - statistics
  - etl
  - elasticsearch
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Fiches_DataLakes.pdf

## Summary

Fiches de cours complètes M1 EFREI sur les Data Lakes et l'intégration de données. Couvre l'architecture en 3 zones (Raw/Staging/Curated), le parallélisme et la loi d'Amdahl, la persistance polyglotte (S3/MySQL/MongoDB), l'orchestration par DAGs Airflow, l'ingestion API et le scoring (TF-IDF/BM25), et l'exposition via API Gateway FastAPI. Boîte à outils mathématique : estimateurs, intervalle de confiance Student, TCL, optimisation par workers, chemin critique (EST/LST/slack).

## Fields/API

**Architecture Data Lake**: **description**: 3 zones de qualité croissante reliées par des pipelines
**zones**: **Raw / Bronze**: Données brutes, fidèles — stockage blob S3
**Staging / Silver**: Nettoyées, validées — SQL/MySQL (ACID)
**Curated / Gold**: Enrichies, prêtes — NoSQL/MongoDB (BSON flexible)
**schema_on_read**: Schéma appliqué à la lecture (Lake) vs schema-on-write (Warehouse)
**lake_vs_warehouse**: **Lake**: tous types de données, coût faible, public data scientists/ML
**Warehouse**: structuré seulement, coût élevé, public BI/décideurs
**Stockage**: **Blob**: Plat (conteneur+clé URI), API REST, très scalable — S3/Azure Blob/GCS/LocalStack. Blob = Binary Large OBject.
**File**: Hiérarchique (dossiers), NFS/SMB, scalabilité modérée — HPC/NAS
**piège**: LocalStack/S3 est du blob, pas du file storage
**Parallélisme & Optimisation**: **formes**: **données**: même op sur données différentes
**tâches**: ops différentes en parallèle
**pipeline**: chaque étape traite un lot pendant que la suivante traite le précédent
**loi_amdahl**: S(n) = 1 / [(1−p) + p/n] ; S_max = 1/(1−p) quand n→∞ ; p = fraction parallélisable
**GIL_Python**: 1 seul thread bytecode à la fois ; relâché pendant I/O et appels C. Threading pour I/O-bound, multiprocessing pour CPU-bound.
**vectorisation**: 1 op NumPy (BLAS/LAPACK) vs n ops Python scalaires → speedup 100–500×
**JIT**: Numba @njit compile au 1er appel (~700×) ; piège : oublier le warm-up
**DVC**: Git versionne le code, DVC versionne données+étapes (dvc.yaml, dvc repro saute les étapes inchangées)
**DAGs & Orchestration (Airflow)**: **DAG**: G=(V,E) orienté acyclique. Garantit terminaison, définit ordre partiel, admet tri topologique.
**kahn**: File des sommets de degré entrant 0 → retirer, décrémenter voisins, enfiler ceux à 0. O(|V|+|E|). Cycle détecté si sommets restants.
**chemin_critique**: **EST**: EST(v) = max_{préd u} [EST(u) + d(u)]
**LST**: LST(v) = min_{succ w} [LST(w)] − d(v)
**Slack**: Slack(v) = LST(v) − EST(v) ; slack=0 ⟺ v sur chemin critique
**composants_airflow**: - Scheduler (tri topo, lance)
- Webserver (UI)
- Workers (Local/Celery/K8s)
- Metadata DB (état, XCom)
**xcom**: Petites données entre tâches — jamais un DataFrame entier
**dvc_vs_airflow**: DVC = reproductibilité dev (local, YAML) ; Airflow = orchestration prod (planifié, distribué, UI web)
**Scoring & Recherche**: **TF_IDF**: TF(v,d) = fréquence ; IDF(v) = log(M/df(v)) ; TF-IDF = TF × IDF. Terme dans tous les docs → IDF=0.
**cosinus**: sim(a,b) = (a·b)/(‖a‖·‖b‖) ∈ [0,1] — ignore la longueur du document
**BM25**: score = Σ IDF(qi)·f·(k1+1)/[f+k1·(1−b+b·|d|/avgdl)] ; saturation : contribution bornée à k1+1=2,2 ; défaut k1=1,2, b=0,75
**embeddings**: Sémantiques (BERT) vs lexicaux (TF-IDF/BM25) ; kNN/HNSW en O(log M) ; hybrid search = BM25 + vectoriel
**TF_IDF_limite_BM25**: TF-IDF = cas limite BM25 avec b=0, k1→∞
**API Gateway (FastAPI)**: **principe**: Porte d'entrée unique RESTful masquant la complexité des 3 stockages hétérogènes
**endpoints**: **/health**: état API + connexions (S3, MySQL, Mongo)
**/raw**: données brutes (S3/boto3)
**/staging**: données nettoyées (MySQL)
**/curated**: données enrichies (MongoDB)
**/stats**: métriques de remplissage
**stack**: FastAPI (async, Pydantic, Swagger auto) + Uvicorn (ASGI)
**piège**: Confondre serveur ASGI (Uvicorn) et framework (FastAPI)
**Outils mathématiques**: **estimateurs**: x̄ = (1/n)Σxi ; s² = (1/(n−1))Σ(xi−x̄)² (correction Bessel, division par n−1)
**IC_student**: SE = s/√n ; IC = [x̄ − t·SE , x̄ + t·SE] ; n=5/95% → t₄;0.025 = 2,776
**TCL**: S_n = ΣXi ≈ N(n·µ, n·σ²) ; écart-type de la somme = σ·√n (PAS n·σ)
**workers**: Temps ∝ volume ; étape parallèle = max des workers (goulot) ; makespan minimal = charge totale / nb workers

## Constraints

- Schema-on-read (Lake) ≠ schema-on-write (Warehouse) — ne pas inverser
- EST(v) = max des prédécesseurs (pas somme ni min)
- Écart-type d'une somme : σ·√n (la variance est additive, pas l'écart-type)
- XCom Airflow : petites données uniquement, jamais un DataFrame
- GIL : multi-threading inutile pour CPU-bound pur
- LocalStack/S3 = blob storage (pas file storage)
- ACID (SQL/Staging) vs BASE (NoSQL/Curated) — ne pas inverser
- Warm-up Numba obligatoire avant tout benchmark
- Un cycle dans le graphe → plus un DAG : l'ajout d'un arc créant un cycle invalide la structure

## Examples

**title**: E1 — Loi d'Amdahl (p=0,80)
**steps**: - S_max = 1/(1−0,8) = 5×
- S(4) = 1/(0,2 + 0,8/4) = 1/0,4 = 2,5×
- Leçon : augmenter p (de 0,80 à 0,95 → S_max=20×) rapporte plus qu'ajouter des cœurs
**title**: E4 — Chemin critique (3 branches)
**dag**: B1=A(5)→B(5)→C(8)→D(5)→E(5)=28 ; B2=A(5)→F(5)→G(10)→H(5)→E(5)=30 ; B3=A(5)→I(5)→J(5)→E(5)=20
**critique**: A→F→G→H→E (durée 30)
**table**: Slack=0 pour A,F,G,H,E ; Slack=2 pour B,C,D ; Slack=10 pour I,J
**title**: E5 — IC Student (n=5, σ inconnu)
**steps**: - x̄ = 1,572 s
- s² = 0,03037 → s = 0,1743 s
- SE = 0,1743/√5 ≈ 0,0779
- IC₉₅% = [1,356 ; 1,788] s  (t₄;0,025 = 2,776)
**title**: E6 — TCL : workflows > 105 s (n=100 tâches, µ=1s, σ=0,2s)
**steps**: - E[T] = 100 s
- Var = 100×0,04 = 4 → σ_T = 2 s (= σ√n)
- P(T>105) = P(Z>2,5) = 1−0,9938 = 0,0062
- Sur 1000 workflows : E[X] = 1000×0,0062 ≈ 6 workflows
**title**: E2 — Optimisation par workers (3 workers sur Transfo 45 min, 22 Go)
**steps**: - Taux : 45/22 ≈ 2,045 min/Go
- Parallèle : goulot = logs (15 Go → 30,7 min)
- Total = 20 + 30,7 + 35 ≈ 85,7 min (vs 100 min séquentiel)
- Optimal : 2 workers sur logs (15,75 min chacun) + 1 sur reste → makespan ≈ 15,75 min
