---
id: resource-ds-contient-les-splits-ds-train-ds-validation-ds-test-2362ca97
slug: resource-ds-contient-les-splits-ds-train-ds-validation-ds-test-2362ca97
source_key: 'sha256:2362ca979cde57853c7de445050a477cda3de0eef05d5d3b8fb95435b021366b'
part_of: null
order: null
manifest: null
derived_from: 'sha256:2362ca979cde57853c7de445050a477cda3de0eef05d5d3b8fb95435b021366b'
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
  - data-pipeline
  - mysql
  - mongodb
  - huggingface
  - tokenisation
  - docker
  - python
  - nlp
  - staging
  - curated
domain: data-engineering
---
# ds contient les splits : ds["train"], ds["validation"], ds["test"]

## Problem

Construire un pipeline de données end-to-end qui charge le dataset WikiText-2 (HuggingFace), le nettoie, le stocke dans MySQL (zone Staging), le tokenise avec un modèle NLP, puis le stocke dans MongoDB (zone Curated).

## Solution

1. **Environnement** : lancer MySQL (port 3306) et MongoDB (port 27017) via `docker-compose up -d` ; installer les dépendances Python avec `uv pip install -e .` puis `source .venv/bin/activate`.

2. **Chargement → MySQL (Staging)** :
   - Charger le dataset : `ds = load_dataset('Salesforce/wikitext', 'wikitext-2-raw-v1')` — fournit `ds['train']`, `ds['validation']`, `ds['test']`, chacun avec un champ `text`.
   - Nettoyer : supprimer lignes vides/espaces, dédupliquer par split, filtrer optionnellement les titres `= … =`.
   - Créer la table :
     ```sql
     CREATE TABLE IF NOT EXISTS texts (
       id INT AUTO_INCREMENT PRIMARY KEY,
       text TEXT NOT NULL,
       split VARCHAR(20) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - Insérer par batch avec `cursor.executemany("INSERT INTO texts (text, split) VALUES (%s, %s)", batch)`.
   - Valider : `SELECT split, COUNT(*) FROM texts GROUP BY split;`
   - Exposer via argparse (`--db-host`, `--db-user`, `--db-password`, `--db-name`).

3. **Tokenisation → MongoDB (Curated)** :
   - Lire depuis MySQL : `SELECT id, text FROM texts WHERE split = 'train'`.
   - Tokeniser par batch de 1000 avec `AutoTokenizer.from_pretrained('distilbert-base-uncased')`, `truncation=True`, `max_length=512`, `padding=False`.
   - Insérer dans `client['curated']['wikitext']` des documents `{original_id, text, tokens, num_tokens, metadata: {source, split, tokenizer, max_length, processed_at}}`.
   - Valider : `collection.count_documents({})` + agrégation `$avg/$max/$min` sur `num_tokens`.
   - Exposer via argparse (`--mongo-uri`, `--tokenizer`, `--max-length`).

## Variations

- **Tokenizer alternatif** : remplacer `distilbert-base-uncased` par `gpt2` dans les arguments du script.
- **Bonus DVC** : déclarer deux étapes dans `dvc.yaml` (`staging` → `curated`) et rejouer avec `dvc repro`. Limite : DVC gère mal le versioning des données en base (pas de fichiers tracés) — piste de réflexion sur le hash de schéma ou l'export snapshot.
- **Bonus exploration** : requêtes SQL (`TRIM`, `GROUP BY`) et MongoDB (`find().limit()`, `aggregate`) pour analyser la distribution des tokens et la qualité des données.

## Pitfalls

- MySQL peut prendre jusqu'à 60 secondes à s'initialiser complètement après `docker-compose up -d` ; tester la connexion avant de lancer le code.
- Utiliser `executemany` (et non une boucle `execute`) pour les insertions MySQL, et `insert_many` par batch de 1000 pour MongoDB — évite les timeouts et améliore les performances.
- La contrainte `NOT NULL` sur `text` bloque l'insertion de lignes vides non filtrées en amont : le nettoyage doit être fait avant l'insertion.
- Le tokenizer HuggingFace accepte des listes de textes — traiter par batch plutôt que texte par texte pour éviter une surcharge de process.
- Ne pas activer `padding=True` lors du stockage dans MongoDB : le padding est inutile et gonfle la taille des documents.
