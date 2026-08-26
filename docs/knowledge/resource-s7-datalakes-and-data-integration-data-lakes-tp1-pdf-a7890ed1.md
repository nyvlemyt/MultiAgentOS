---
id: resource-s7-datalakes-and-data-integration-data-lakes-tp1-pdf-a7890ed1
slug: resource-s7-datalakes-and-data-integration-data-lakes-tp1-pdf-a7890ed1
source_key: 'sha256:a7890ed17d23a92d3c9453cb379a40facc81574070fef35bce52c40a09f54be4'
part_of: S7 - Datalakes and Data Integration
order: 11
manifest: null
derived_from: 'sha256:a7890ed17d23a92d3c9453cb379a40facc81574070fef35bce52c40a09f54be4'
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
  - data-pipeline
  - data-lake
  - python
  - uv
  - pandas
  - scikit-learn
  - bioinformatics
  - pfam
  - ml-engineering
  - class-imbalance
domain: Data Engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___TP1.pdf

## Goal

Construire un pipeline de données complet sur le dataset Pfam (~1,1M séquences protéiques) : ingestion brute (zone Bronze) → prétraitement (zone Silver), en maîtrisant UV, Git et une stratégie de split adaptée aux données déséquilibrées.

## Prerequisites

- Environnement Linux ou macOS (ou WSL2 sous Windows)
- Compte GitHub pour forker le dépôt
- Compte Kaggle pour télécharger le dataset Pfam
- Notions de base Python, pandas, scikit-learn

## Steps

**step**: 1
**title**: Installer UV et préparer l'environnement
**details**: - Installer UV (gestionnaire Python moderne écrit en Rust, remplace pip/conda) : `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Rouvrir le terminal, vérifier : `uv --version`
- Forker le dépôt GitHub https://github.com/IUseAMouse/Data-Lakes-Practice, puis cloner son fork : `git clone https://github.com/VotreNomUtilisateur/Data-Lakes-Practice.git && cd Data-Lakes-Practice`
- Créer l'environnement virtuel et installer les dépendances (via pyproject.toml, standard PEP 517/518/621) : `uv venv && source .venv/bin/activate && uv pip install -e .` (ou `uv sync`)
- Pour les sessions suivantes : `source .venv/bin/activate` suffit
**step**: 2
**title**: Exercice 2 — Implémenter unpack_data (zone Bronze)
**details**: - Télécharger le dataset Pfam depuis Kaggle, extraire l'archive dans `data/bronze/` (`mkdir -p data/bronze`)
- Compléter la fonction `unpack_data(input_dir, output_file)` dans `src/unpack_data.py` selon le docstring :
-   1. Lister les fichiers du répertoire `input_dir`
-   2. Filtrer pour ne garder que les `.csv`
-   3. Lire chaque CSV dans un DataFrame pandas
-   4. Concaténer tous les DataFrames
-   5. Sauvegarder le DataFrame combiné dans `output_file`
- Tester : le fichier combiné doit contenir plus d'un million de lignes
**step**: 3
**title**: Exercice 3 — Implémenter preprocess_data (zone Silver)
**details**: - Explorer la distribution des classes via `notebooks/data_analysis.ipynb` avant de coder
- Compléter `preprocess_data(data_file, output_dir)` dans `src/preprocess.py` :
-   1. Charger les données avec pandas
-   2. Supprimer les lignes avec valeurs manquantes
-   3. Encoder la colonne `family_accession` avec LabelEncoder
-   4. Implémenter une stratégie de split custom (voir pitfalls ci-dessous)
-   5. Sauvegarder `train.csv`, `val.csv`, `test.csv` dans `output_dir`

## Result

Pipeline fonctionnel Bronze→Silver : données brutes consolidées en un CSV unique (~1,1M lignes), nettoyées, encodées, et découpées en train/val/test malgré le déséquilibre extrême des classes. L'environnement Python est reproductible via UV et pyproject.toml.

## Next

- Entraîner un modèle de classification de séquences protéiques sur les données Silver produites
- Explorer les modèles de langage protéiques (Meta ESM, ProtTrans) qui utilisent des données similaires
- Introduire une zone Gold pour les features engineerées prêtes à l'entraînement
