---
id: >-
  resource-lecture-parall-ele-le-gil-est-rel-ach-e-pendant-les-i-o-disque-37285ec9
slug: >-
  resource-lecture-parall-ele-le-gil-est-rel-ach-e-pendant-les-i-o-disque-37285ec9
source_key: 'sha256:37285ec9e0ebd624ca9e533656efd41a6c963ee4b0e3ac5af03b75aeabbf4c63'
part_of: null
order: null
manifest: null
derived_from: 'sha256:37285ec9e0ebd624ca9e533656efd41a6c963ee4b0e3ac5af03b75aeabbf4c63'
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
  - python
  - parallelism
  - GIL
  - numpy
  - numba
  - concurrent.futures
  - DVC
  - data-pipeline
  - BLAS
  - Amdahl
  - JIT
  - Mamba
  - SSM
  - multiprocessing
  - vectorization
domain: data-engineering
---
# Lecture parall`ele : le GIL est rel^ach´e pendant les I/O disque

## Thesis

Accélérer un pipeline Python nécessite de choisir le bon levier de parallélisme : tâches I/O-bound → threading (le GIL est relâché pendant les I/O) ; calculs CPU-bound → reformulation structurelle vectorisée (NumPy/BLAS) ou compilation JIT (Numba) ; reproductibilité → DVC. La loi d'Amdahl et l'architecture matérielle (SIMD, hyperthreading, GPU SIMT) déterminent le levier applicable.

## Context

Cours 2 du module S7 Datalakes & Data Integration, EFREI 2025-2026 (Yvann VINCENT). Motivé par un pipeline PFAM naïf (1,1 M séquences, ~17 000 familles) qui tourne 30 minutes à cause de deux anti-patterns : comparaison O(n) par itération sur un DataFrame entier, et pd.concat en boucle qui recrée un DataFrame en mémoire à chaque appel. Ciblé machine unique, mais les principes se généralisent à Spark/Hadoop.

## Reasoning

1. **GIL et threading** : CPython empêche l'exécution simultanée de bytecode multi-thread, mais le GIL est relâché pendant les I/O disque/réseau et les appels NumPy. `concurrent.futures.ThreadPoolExecutor` suffit donc pour paralléliser la lecture de fichiers CSV — les threads tournent en vrai parallèle pendant les `read_csv`. Pour les tâches CPU-bound, `ProcessPoolExecutor` contourne le GIL via des processus distincts (coût : sérialisation inter-processus).

2. **Parallélisme structurel** : l'optimisation la plus puissante n'est pas de paralléliser un algorithme existant mais de le reformuler. Une boucle Python traite les éléments un par un avec overhead d'interpréteur (100–1000× vs C compilé) ; une opération NumPy délègue à BLAS/LAPACK qui exploite SIMD (addition de 8 flottants en un cycle). Speedup typique : 100–500× pour une somme de carrés.

3. **Récurrences et JIT** : la récurrence linéaire h_t = a·h_{t-1} + x_t semble séquentielle. Sa reformulation matricielle (produit matrice de Toeplitz × vecteur) la rend structurellement parallèle mais coûte O(T²) mémoire — inapplicable à T = 100 000 (80 Go). Numba @njit JIT-compile le même code séquentiel en code machine natif sans rien changer à la structure : ~700× de speedup, au prix de contraintes (pas de dict/DataFrame/f-string, uniquement tableaux NumPy).

4. **Mamba/SSM** : exploite le parallel scan O(T log T) sur GPU à l'entraînement (tous les h_t simultanément pour le gradient), puis retombe sur le calcul séquentiel O(1) par pas à l'inférence — meilleur des deux mondes par rapport aux Transformers et aux RNN classiques.

5. **DVC** : étend Git pour versionner les données volumineuses (stockage distant S3/LocalStack) et déclarer les dépendances entre étapes via `dvc.yaml`. `dvc repro` ne réexécute que les étapes dont une dépendance a changé, garantissant la reproductibilité sans re-traiter tout le pipeline.

## Trade-offs

- **Threading vs Multiprocessing** : mémoire partagée (threading, rapide, sans copie) vs processus isolés (multiprocessing, contourne le GIL, mais sérialisation pickle coûteuse pour de gros DataFrames).
- **Reformulation matricielle** : parallèle mais O(T²) mémoire — viable uniquement pour T petit ; au-delà, il faut le parallel scan (O(T log T)) comme Mamba.
- **Numba @njit** : ~700× de speedup pour les boucles numériques, mais interdit les objets Python complexes (dict, DataFrame, chaînes) ; warm-up à la première invocation.
- **Loi d'Amdahl** : avec 90 % de code parallélisable, le speedup maximal est 10× quel que soit le nombre de cœurs ; augmenter la fraction parallélisable est souvent plus rentable qu'ajouter des processeurs.
- **JAX** : plus puissant que Numba (JIT + autograd + GPU/TPU), mais plus complexe ; différentiation automatique incluse, utilisé en recherche ML (DeepMind, Google Brain).

## See also

- Mamba : Gu & Dao (2023), Selective State Space Models
- Apache Spark — traitement en mémoire, jusqu'à 100× plus rapide que MapReduce pour certains workloads
- DVC documentation (dvc.org)
- NumPy/BLAS/LAPACK pour la vectorisation SIMD
- JAX (Google) — JIT + autograd + GPU
