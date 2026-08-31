---
id: resource-s7-deeplearning-maitrise-4-notions-examen-pdf-7d180269
slug: resource-s7-deeplearning-maitrise-4-notions-examen-pdf-7d180269
source_key: 'sha256:7d180269c5aaa0091ef28c885d3c299ec49e76b87fba0d9aeda08ccaa0c13946'
part_of: resource-s7-deeplearning-062b2dc8
order: 8
manifest: null
derived_from: 'sha256:7d180269c5aaa0091ef28c885d3c299ec49e76b87fba0d9aeda08ccaa0c13946'
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
  - deep-learning
  - backpropagation
  - LSTM
  - GRU
  - RNN
  - attention
  - neural-networks
  - paramètres
  - examen
domain: machine-learning
---
# S7 - deepLearning — Maitrise_4_Notions_Examen.pdf

## Summary

Fiche de révision couvrant les 4 notions d'examen Deep Learning (Master 1 EFREI) : backpropagation (règle de chaîne, passes avant/arrière), comptage de paramètres (Dense, CNN, RNN/LSTM/GRU), comparaison LSTM vs GRU (équations, portes, états), et mécanismes d'attention (Bahdanau, Query/Key/Value). Chaque notion inclut principe, formules démontrées, méthode à la main, exemple chiffré, exercices corrigés et QCM.

## Fields/API

**name**: Backpropagation
**definition**: Algorithme de calcul des gradients par règle de chaîne, de la sortie vers l'entrée.
**formulas**: - Erreur de sortie : δ(L) = ∇_a L ⊙ σ′(z(L)) ; cas béni softmax+CE : δ(L) = ŷ − y
- Propagation : δ(ℓ) = (W(ℓ+1))ᵀ δ(ℓ+1) ⊙ σ′(z(ℓ))
- Gradients poids : ∇_W(ℓ) L = δ(ℓ)(a(ℓ−1))ᵀ ; ∇_b(ℓ) L = δ(ℓ)
- Mise à jour : w ← w − η ∂L/∂w
**activations_derivatives**: - σ′ = σ(1−σ) = a(1−a)
- tanh′ = 1 − tanh² = 1 − a²
- ReLU′ = 1 si z > 0, sinon 0
**method_steps**: - 1. Passe avant : calculer z puis a = σ(z) couche par couche jusqu'à ŷ ; calculer L
- 2. Erreur de sortie δ : (ŷ−y)σ′(z_sortie) pour MSE ; ŷ−y pour softmax/sigmoïde + CE
- 3. Gradient de chaque poids : ∂L/∂w = δ_aval × a_amont (a_amont = 1 pour un biais)
- 4. Remontée : δ_caché = Σ(δ_aval · w · σ′(z))
- 5. Répéter 3–4 jusqu'à l'entrée
**pitfalls**: - Confondre z (pré-activation) et a = σ(z)
- Oublier σ′(z) dans la remontée de δ
- Mauvais bout de la flèche : ∂L/∂w = δ_aval × a_amont
- Backprop ≠ descente de gradient (calcul vs utilisation)
**name**: Comptage de paramètres
**definition**: Un paramètre = nombre appris (poids ou biais). Un neurone = valeur calculée.
**formulas**: - Dense (n_in → n_out) : (n_in + 1) × n_out
- Conv (F×F, C_in canaux, K filtres) : (F·F·C_in + 1) × K — indépendant de la taille d'image
- Taille sortie conv/pool : O = ⌊(W − F + 2P)/S⌋ + 1 ; same → O = W ; pool 2×2 S=2 → O = ⌊W/2⌋
- SimpleRNN : h(h + x + 1)
- GRU : 3h(h + x + 1)
- LSTM : 4h(h + x + 1)
- Pooling, Flatten, Dropout, activations : 0 paramètre
**method_steps**: - 1. Écrire la forme de sortie après chaque couche (hauteur, largeur, profondeur)
- 2. Appliquer la bonne formule par type de couche
- 3. Flatten : multiplier les 3 dimensions → n_in de la 1ʳᵉ Dense
- 4. Sommer tout ; si un total est donné, s'en servir comme contrôle (ajuster hypothèse 'same'/'valid')
**example**: CNN 73×73×3 → Conv(32,3,same) → Pool → Conv(64,3,same) → Pool → Flatten → Dense(160) → Dense(8) = 3 338 600 params
**pitfalls**: - Oublier le biais (+1) — par filtre en conv, par neurone en dense
- Oublier C_in à partir de la 2ᵉ conv
- Confondre shape après pooling et params (0)
- Se tromper de n_in pour la 1ʳᵉ Dense (= produit des 3 dimensions du Flatten)
**name**: LSTM vs GRU
**definition**: RNN à portes conçus pour atténuer le vanishing gradient sur longues séquences.
**lstm_equations**: - f_t = σ(W_f [h_{t−1}, x_t] + b_f)  — porte oubli
- i_t = σ(W_i [h_{t−1}, x_t] + b_i)  — porte entrée
- c̃_t = tanh(W_c [h_{t−1}, x_t] + b_c)  — contenu candidat
- c_t = f_t ⊙ c_{t−1} + i_t ⊙ c̃_t  — mise à jour cellule
- o_t = σ(W_o [h_{t−1}, x_t] + b_o)  — porte sortie
- h_t = o_t ⊙ tanh(c_t)  — état caché
**gru_equations**: - z_t = σ(W_z x_t + U_z h_{t−1} + b_z)  — update
- r_t = σ(W_r x_t + U_r h_{t−1} + b_r)  — reset
- ĥ_t = tanh(W_h x_t + U_h (r_t ⊙ h_{t−1}) + b_h)  — candidat
- h_t = (1 − z_t) ⊙ h_{t−1} + z_t ⊙ ĥ_t  — interpolation
**comparison_table**: **états**: **LSTM**: h_t et c_t (cellule)
**GRU**: h_t seulement
**portes**: **LSTM**: 3 (forget, input, output) + candidat
**GRU**: 2 (reset, update) + candidat
**jeux_de_poids**: **LSTM**: 4
**GRU**: 3
**paramètres**: **LSTM**: 4h(h+x+1)
**GRU**: 3h(h+x+1)
**usage**: **LSTM**: mémoire longue critique
**GRU**: plus simple/rapide, moins de données
**pitfalls**: - LSTM a 3 portes (pas 2) ; GRU en a 2
- GRU n'a pas d'état de cellule c
- z→1 dans GRU = écrire le candidat (pas garder l'ancien)
- Les paramètres ne dépendent pas de la longueur de séquence
**name**: RNN & Attention
**definition**: Mécanisme remplaçant le goulot d'étranglement encodeur→décodeur par une moyenne pondérée de tous les états.
**rnn_equation**: h_t = tanh(W_hh h_{t−1} + W_hx x_t + b) ; sortie y_t = W_hy h_t
**bahdanau_attention**: - Score : e_i = align(h_i, s)
- Poids : α_i = softmax(e)_i = exp(e_i) / Σ_k exp(e_k)
- Contexte : c = Σ_i α_i h_i
**transformer_attention**: - Projections : q = W_Q x ; k = W_K x ; v = W_V x
- Score : α_ij = softmax(q_i⊤ k_j / √d_k)
- Sortie : c_j = Σ_i α_ij v_i
- Coût : O(m · t)
**self_attention**: q, k, v viennent de la même séquence → chaque token interagit avec tous les autres
**multi_head**: Plusieurs attentions en parallèle dans des sous-espaces W_Q^(h), W_K^(h), W_V^(h) différents, concaténées
**method_steps**: - 1. Scores : produit scalaire q⊤k_i pour chaque clé (ou align(h_i, s))
- 2. Softmax : α_i = exp(e_i) / Σ_k exp(e_k)
- 3. Sortie = moyenne pondérée des valeurs : c = Σ_i α_i v_i
**useful_values**: softmax([1,0]) = [0,731 ; 0,269] ; softmax([a,b]) = [1/(1+e^{b−a}), 1/(1+e^{a−b})]
**pitfalls**: - Bien exponentier puis normaliser pour softmax ; les α somment à 1
- Ne pas confondre Bahdanau align(h_i,s) et Transformer q⊤k — même logique
- La moyenne pondérée porte sur les valeurs v, pas sur les clés k
- Le RNN garde des poids partagés dans le temps : le déroulé n'ajoute pas de paramètres

## Constraints

- Softmax toujours associé à cross-entropy (δ = ŷ−y direct) ; sigmoïde avec binary CE
- Dying ReLU : pré-activation ≤ 0 → gradient nul → neurone n'apprend plus
- Paramètres LSTM/GRU indépendants de la longueur de séquence
- Conv 'same' conserve la taille spatiale ; 'valid' applique O = ⌊(W−F)/S⌋+1
- Pooling / Flatten / Dropout = 0 paramètre

## Examples

**topic**: Backprop réseau 2→2→1 ReLU+linéaire
**result**: x=[1,2], y=1 ; passe avant o=6, L=12,5 ; δ_o=5 ; gradients sortie=10,10 ; mise à jour w_{h1→o} : 2−0,01·10=1,9
**topic**: Comptage CNN 73×73×3 → … → Dense(8)
**result**: Total 3 338 600 params (Conv1:896 + Conv2:18496 + Dense1:3317920 + Dense2:1288)
**topic**: LSTM scalaire x_t=1, h_{t−1}=0, c_{t−1}=1
**result**: f=0,5 ; i≈0,881 ; c̃≈0,762 ; c_t≈1,171 ; h_t≈0,412
**topic**: Self-attention 2 tokens identité
**result**: Token 1 : scores [1,0] → α=[0,731,0,269] → c_1=[0,731,0,269]
**topic**: Paramètres LSTM x=100, h=200
**result**: Base=60200 ; LSTM=240800 ; GRU=180600 ; rapport 4/3≈1,33
