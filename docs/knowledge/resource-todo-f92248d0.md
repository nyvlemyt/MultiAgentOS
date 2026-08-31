---
id: resource-todo-f92248d0
slug: resource-todo-f92248d0
source_key: 'sha256:f92248d0b4e167b525b1a78164982556fb5d4d64e05d1852ebb3672322da5b8c'
part_of: null
order: null
manifest: null
derived_from: 'sha256:f92248d0b4e167b525b1a78164982556fb5d4d64e05d1852ebb3672322da5b8c'
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
doc_type: tutorial
actionability: resource
lane: workflows
schema_version: '1'
tags:
  - python
  - data-pipeline
  - dvc
  - numba
  - localstack
  - s3
  - parallelism
  - tokenization
  - pfam
  - machine-learning
domain: data-engineering
---
# TODO

## Goal

Optimiser un pipeline de prétraitement du dataset PFAM (1,2 M exemples) en combinant parallélisme I/O (ThreadPoolExecutor), compilation JIT (Numba), tokenisation par batch (HuggingFace), et reproductibilité (DVC + LocalStack S3).

## Prerequisites

- Avoir complété TP1 (pipeline PFAM séquentiel baseline, ~30 min pour le split)
- Python avec UV, pyproject.toml configuré
- Docker installé (requis pour LocalStack)
- Packages : localstack, boto3, numba, dvc, pandas, numpy, scikit-learn, transformers

## Steps

**id**: 1
**title**: Configuration de l'environnement
**details**: - Créer une nouvelle branche Git depuis le travail TP1 (ne pas écraser TP1).
- Ajouter numba dans pyproject.toml.
- Activer l'environnement UV : `source .venv/bin/activate && uv pip install -e .`
- Installer et démarrer LocalStack : `pip install localstack && localstack start -d`
- Vérifier S3 : `aws --endpoint-url=http://localhost:4566 s3 ls`
- Initialiser DVC : `dvc init`
- Configurer le remote DVC vers LocalStack : `dvc remote add -d localstack-s3 s3://dvc-store` + `dvc remote modify localstack-s3 endpointurl http://localhost:4566`
- Créer les buckets S3 : raw, staging, curated, dvc-store via `aws --endpoint-url=http://localhost:4566 s3 mb s3://<nom>`
**id**: 2
**title**: Ingestion parallélisée vers Raw (src/unpack_data.py)
**details**: - Objectif : combiner tous les CSV PFAM (train/, dev/, test/) et uploader vers le bucket raw.
- Implémenter read_single_csv(filepath) → DataFrame.
- Dans unpack_data() : (1) collecter tous les chemins .csv avec os.walk ; (2) lecture séquentielle + mesure temps ; (3) lecture parallèle avec ThreadPoolExecutor.map(read_single_csv, csv_files) + mesure temps ; (4) afficher les deux temps et le speedup ; (5) pd.concat() ; (6) upload vers S3 via io.StringIO + s3.put_object().
- Speedup attendu : 2–4× selon la machine.
- Lancement : `python src/unpack_data.py --input_dir ./data/raw --bucket_name raw --output_file_name combined_raw.csv`
**id**: 3
**title**: Prétraitement accéléré vers Staging (src/preprocess_to_staging.py)
**details**: - Objectif : télécharger depuis raw, splitter train/dev/test avec Numba, uploader vers staging.
- Optimisation algorithmique : trier par class_encoded + np.unique(..., return_counts=True) pour obtenir les frontières de groupe → complexité O(n log n) au lieu de O(n×k).
- Optimisation JIT : décorer assign_splits avec @njit. Règles d'assignation : 1 sample → test ; 2 → val+test ; 3 → train+val+test ; 4+ → 80% train / 10% val / 10% test.
- Warm-up obligatoire avant mesure : appeler assign_splits sur un sous-ensemble (10 groupes) pour déclencher la compilation.
- Pipeline complet : download S3 → dropna → LabelEncoder → sort → np.unique → warm-up → assign_splits (mesuré) → split DataFrame → upload train/dev/test CSV + label_mapping + class_weights vers staging.
- Speedup attendu : split en quelques secondes vs ~30 min (TP1).
- Lancement : `python src/preprocess_to_staging.py --bucket_raw raw --bucket_staging staging --input_file combined_raw.csv --output_prefix preprocessed`
**id**: 4
**title**: Tokenisation par batch vers Curated (src/process_to_curated.py)
**details**: - Objectif : tokeniser les séquences protéiques avec facebook/esm2_t6_8M_UR50D et uploader vers curated.
- Charger AutoTokenizer.from_pretrained('facebook/esm2_t6_8M_UR50D').
- Benchmark sur 1000 séquences : (3) tokenisation séquentielle one-by-one + mesure ; (4) tokenisation batch tokenizer(subset, padding=True, truncation=True, max_length=512) + mesure ; (5) afficher comparaison.
- Tokenisation complète : itérer par chunks de batch_size (défaut 512), accumuler input_ids, ajouter colonne au DataFrame.
- Upload CSV final vers le bucket curated.
- Lancement : `python src/process_to_curated.py --bucket_staging staging --bucket_curated curated --input_file preprocessed_train.csv --output_file tokenized_train.csv`
**id**: 5
**title**: Pipeline DVC reproductible (dvc.yaml)
**details**: - Compléter dvc.yaml avec trois stages : unpack, preprocess, curate.
- Chaque stage déclare cmd (commande Python), deps (script + données d'entrée), outs (fichiers produits dans S3 / localement).
- Lancer le pipeline : `dvc repro` (exécute les stages dans l'ordre des dépendances ; idempotent si rien n'a changé).
- Versionner : `dvc push` pour envoyer les données vers LocalStack S3, puis `git add dvc.yaml dvc.lock .dvc/ && git commit -m 'Add DVC pipeline for PFAM preprocessing'`.
- Partage équipe : clone Git + `dvc pull` + `dvc repro` → reproduction identique garantie.

## Result

Pipeline PFAM complet en trois zones (Raw → Staging → Curated) : lecture CSV parallélisée (2–4× speedup), split Numba-JIT (secondes vs ~30 min), tokenisation ESM2 par batch, orchestré et versionné par DVC sur LocalStack S3.

## Next

- Ajouter les uploads label_mapping et class_weights manquants dans preprocess_to_staging.py (step 9, TODO).
- Implémenter le benchmark Python naïf optionnel (step 7) pour quantifier le gain Numba.
- Étendre dvc.yaml pour couvrir dev et test (actuellement seul train est tokenisé dans l'exercice 4).
- Brancher le pipeline sur un vrai bucket S3 AWS pour valider la portabilité hors LocalStack.
