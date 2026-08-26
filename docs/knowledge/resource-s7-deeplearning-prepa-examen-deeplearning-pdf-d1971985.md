---
id: resource-s7-deeplearning-prepa-examen-deeplearning-pdf-d1971985
slug: resource-s7-deeplearning-prepa-examen-deeplearning-pdf-d1971985
source_key: 'sha256:d1971985a1148a66f5824a8bc6782b222aa828eceb82d9ddaa6c3e374d6a739b'
part_of: S7 - deepLearning
order: 12
manifest: null
derived_from: 'sha256:d1971985a1148a66f5824a8bc6782b222aa828eceb82d9ddaa6c3e374d6a739b'
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
lane: knowledge
schema_version: '1'
tags:
  - deep-learning
  - backpropagation
  - CNN
  - LSTM
  - GRU
  - attention
  - VAE
  - exam-prep
  - neural-networks
  - transformer
domain: Machine Learning
---
# S7 - deepLearning — Prepa_Examen_DeepLearning.pdf

## Problem

Préparer l'examen Deep Learning M1 (format EFREI) en maîtrisant les 4 attendus minimum annoncés : (1) backpropagation forward ET backward, (2) comptage de neurones/paramètres CNN et RNN, (3) comparaison LSTM vs GRU, (4) RNN & attention. Le DE 2024/2025 couvre bien le comptage CNN et l'attention Q/K/V, effleure le forward, et ignore totalement LSTM/GRU — il ajoute aussi VAE/reparamétrisation hors liste minimale.

## Solution

Ordre de révision du plus sûr au plus incertain : (1) Comptage paramètres CNN — quasi certain, format model.summary() connu. Formules : Dense = (n_in+1)·n_out ; Conv = (F·F·C_in+1)·K ; taille sortie O = ⌊(W−F+2P)/S⌋+1 ; Pooling/Flatten = 0 param. (2) Propagation avant + passe arrière à la main — annoncée. Forward : z = Σ(poids×entrée), a = g(z), couche par couche. Backward (MSE) : δ_o = (o−y)·σ'(z_o) = (o−y)·o(1−o) ; ∂L/∂w = δ_aval × a_amont ; δ_caché = (Σ δ_aval·w)·σ'(z). Avec softmax+cross-entropy : δ_o = ŷ−y. Forme matricielle : δ^(L) = ∇_a L ⊙ σ'(z^(L)) ; δ^(ℓ) = (W^(ℓ+1))⊤ δ^(ℓ+1) ⊙ σ'(z^(ℓ)). (3) Attention Q/K/V — format fill-in connu : q = W_Q x, k = W_K x, v = W_V x, sortie = Σ softmax(K⊤q)_i · v_i. Self-attention : q,k,v de la même séquence. Multi-têtes : plusieurs attentions parallèles dans des sous-espaces différents, ne réduit pas les paramètres. (4) LSTM vs GRU — annoncé, absent l'an dernier, à préparer sérieusement. RNN params : mult × h × (h+x+1) avec mult=4 (LSTM), 3 (GRU), 1 (SimpleRNN). (5) VAE reparametrization trick — z = μ + σ⊙ε, ε ~ N(0,I) : le hasard est dans ε (non paramétrique) donc z est différentiable en μ,σ ; espace latent continu/lisse → génération possible, contrairement à l'AE déterministe.

## Variations

Forward ReLU vs sigmoïde : avec ReLU, si les pré-activations sont ≤ 0, tout le réseau produit 0 (piège pédagogique). | Attention Bahdanau (RNN encodeur→décodeur) : score = align(h_i, s), contexte = Σ α_i h_i, coût O(m·t) — versus Transformer Q/K/V. Le pont : dans les deux cas 'scores → softmax → moyenne pondérée des valeurs'. | LSTM : états h_t et c_t (cellule), 3 portes (forget, input, output) + candidat c̃. GRU : état h_t seul, 2 portes (reset z, update r) + candidat ĥ ; fusionne forget/write, plus rapide, performances comparables sur peu de données. | Comptage CNN avec conv 'same' forcée : si le total fourni ne colle pas en 'valid', recaler sur 'same' (ex. DE 2024 Conv2D2 : 36×36 forced par total=3338600).

## Pitfalls

σ(0) = 0.5, pas 0 — erreur fréquente en propagation avant. | Oublier le +1 de biais par filtre dans Conv et Dense. | Oublier C_in à la 2e couche Conv (C_in = nb filtres de la couche précédente, pas 3). | Les paramètres d'un RNN/LSTM/GRU ne dépendent PAS de la longueur de séquence (poids partagés dans le temps). | LSTM = 3 portes / GRU = 2 portes — ne jamais inverser. | La self-attention n'est PAS limitée aux voisins immédiats — elle regarde tous les tokens. | Le multi-têtes ne réduit pas drastiquement les paramètres (coût comparable). | Le pooling n'a pas de paramètres appris. | SGD pur (batch=1) produit un gradient très bruité, pas peu bruité.
