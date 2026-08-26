---
id: resource-s7-datalakes-and-data-integration-data-lakes-5-pdf-98a980d2
slug: resource-s7-datalakes-and-data-integration-data-lakes-5-pdf-98a980d2
source_key: 'sha256:98a980d20416b46df7b3fa502959d0396f4ca005b109a155355c055a056e5f6c'
part_of: S7 - Datalakes and Data Integration
order: 6
manifest: null
derived_from: 'sha256:98a980d20416b46df7b3fa502959d0396f4ca005b109a155355c055a056e5f6c'
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
  - TF-IDF
  - BM25
  - scoring
  - cosine-similarity
  - bag-of-words
  - embeddings
  - information-retrieval
  - NLP
  - elasticsearch
  - HNSW
  - hybrid-search
domain: information-retrieval
---
# S7 - Datalakes and Data Integration — Data_Lakes___5.pdf

## Summary

Référence formelle des fonctions de scoring et de similarité dans les moteurs de recherche : Bag of Words, TF-IDF, similarité cosinus, BM25, plongements denses et recherche vectorielle. Couvre notations, formules, paramètres, exemples chiffrés, comparaison TF-IDF vs BM25, et la chaîne de dérivation probabiliste MLE → KL → BIM → BM25 → TF-IDF.

## Fields/API

**Vocabulaire / Corpus**: V = {v1,…,vN} (N termes distincts) ; D = {d1,…,dM} (M documents).
**f(vi, dj)**: Fréquence brute (nombre d'occurrences) du terme vi dans le document dj.
**|dj|**: Longueur du document dj = nombre total de tokens après tokenisation.
**df(vi)**: Fréquence documentaire = nombre de documents contenant au moins une occurrence de vi.
**avgdl**: Longueur moyenne des documents : avgdl = (1/M) · Σj |dj|.
**Bag of Words (BoW)**: Vecteur bj ∈ ℕᴺ dont la i-ème composante = f(vi, dj). Ignore l'ordre des mots. Dimension N (~10⁴–10⁶), vecteurs très creux.
**TF — Term Frequency**: TF(vi, dj) = f(vi, dj). Variantes : log-TF = 1 + log f (si f > 0, sinon 0) ; TF normalisé = f / |dj|.
**IDF — Inverse Document Frequency**: IDF(vi) = log(M / df(vi)). Propriété globale du corpus (indépendante de dj). Vaut 0 si vi dans tous les docs, log(M) si dans un seul.
**TF-IDF**: TF-IDF(vi, dj) = TF(vi, dj) × IDF(vi). Vecteur tj ∈ ℝᴺ. Amplifie les termes rares et informatifs, atténue les termes omniprésents.
**Similarité cosinus**: sim_cos(a, b) = (a · b) / (‖a‖ · ‖b‖). Pour vecteurs TF-IDF (composantes ≥ 0), valeurs dans [0, 1]. Insensible à la norme ; exploite l'index inversé (seules les dimensions non nulles contribuent).
**BM25 — formule**: score_BM25(q, dj) = Σᵢ IDF(qi) · [f(qi, dj) · (k₁ + 1)] / [f(qi, dj) + k₁ · (1 − b + b · |dj| / avgdl)].
**BM25 — IDF Lucene/Elasticsearch**: IDF(vi) = ln(1 + (M − df(vi) + 0.5) / (df(vi) + 0.5)). Toujours positif, même pour les termes très fréquents (correction de Laplace +0.5).
**BM25 — paramètre k₁**: Contrôle la vitesse de saturation TF. Défaut Elasticsearch = 1.2. k₁ faible → saturation rapide ; k₁ élevé → comportement quasi-linéaire (→ TF-IDF). La contribution TF sature à (k₁ + 1) quelle que soit la fréquence.
**BM25 — paramètre b**: Contrôle la normalisation par longueur, b ∈ [0, 1]. Défaut = 0.75. b = 0 → aucune normalisation ; b = 1 → normalisation complète (document 2× plus long doit avoir 2× plus d'occurrences pour le même score).
**Plongements denses (embeddings)**: Vecteur dense e ∈ ℝᵖ, p ∈ {384, 768, 1024}. Dimension fixe, toutes composantes non nulles. Deux textes sémantiquement proches → vecteurs proches, même sans mot commun. Similarité = cosinus des embeddings.
**Recherche vectorielle kNN / HNSW**: Elasticsearch ≥ 8.0 : champ dense_vector + kNN approximatif via HNSW (Hierarchical Navigable Small World). O(log M) en moyenne vs O(M · p) naïf.
**Hybrid search**: Fusion score BM25 lexical + score vectoriel sémantique (combinaison linéaire ou Reciprocal Rank Fusion). Cumule précision lexicale et compréhension sémantique.
**Dérivation probabiliste**: Chaîne : MLE sur modèle unigramme (θ̂ᵢⱼ = f / |dj|) → divergence KL → IDF comme surprisal du fond → Binary Independence Model (BIM, Robertson & Spärck Jones 1976) → BM25 → TF-IDF (cas limite b=0, k₁→+∞).

## Constraints

- BoW ne capture pas l'ordre des mots : 'le chat mange la souris' et 'la souris mange le chat' produisent le même vecteur.
- TF-IDF croît linéairement avec f(vi, dj) : 100 occurrences valent 100× une occurrence — biais non réaliste.
- La normalisation cosinus de TF-IDF compense la longueur de façon indirecte et imparfaite.
- IDF classique (Robertson) peut être négatif pour termes ultra-fréquents ; la variante Lucene (+0.5) garantit IDF > 0.
- BM25 : saturation TF bornée à (k₁ + 1) = 2.2 avec k₁ = 1.2 par défaut.
- Vocabulary mismatch : TF-IDF et BM25 ne trouvent pas de documents sans mot commun avec la requête ; les embeddings résolvent ce problème.
- IDF est une propriété globale du corpus, pas d'un document particulier.

## Examples

- Corpus M=3 après suppression stop words : d1='spark spark pipeline', d2='pipeline données données', d3='spark cluster cluster cluster'. V={spark, pipeline, données, cluster}. df : spark=2, pipeline=2, données=1, cluster=1. IDF(données)=IDF(cluster)=ln(3)≈1.10 ; IDF(spark)=IDF(pipeline)=ln(1.5)≈0.41. Vecteur TF-IDF t3 dominé par 'cluster' (3×1.10=3.30).
- Requête q='spark pipeline' → vecteur tq=(0.41, 0.41, 0, 0). sim_cos(tq, t1)≈0.95 ; sim_cos(tq, t2)≈0.13 ; sim_cos(tq, t3)≈0.09. Classement final : d1 ≫ d2 > d3. d3 pénalisé car sa norme élevée (dominée par 'cluster') dilue la contribution de 'spark'.
- Dérivation IDF via BIM : avec p_i=0.5 et r_i≈df(vi)/M, le poids RSJ devient c_i = log[(M−df(vi))/df(vi)] ≈ IDF(vi) pour df(vi) ≪ M. L'IDF est le poids optimal au sens du maximum de vraisemblance sur un modèle binaire de pertinence.
