---
id: resource-s7-deeplearning-fiches-revision-deeplearning-pdf-e038c4e7
slug: resource-s7-deeplearning-fiches-revision-deeplearning-pdf-e038c4e7
source_key: 'sha256:e038c4e764ea07fdd7721aaa5aa2c2ecdf609a616f5e084fd440e4e285ea1b8b'
part_of: resource-s7-deeplearning-062b2dc8
order: 6
manifest: null
derived_from: 'sha256:e038c4e764ea07fdd7721aaa5aa2c2ecdf609a616f5e084fd440e4e285ea1b8b'
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
  - neural-networks
  - backpropagation
  - CNN
  - LSTM
  - GRU
  - attention
  - autoencoder
  - VAE
  - regularization
  - optimization
  - master-1
  - exam-prep
domain: machine-learning
---
# S7 - deepLearning — Fiches_Revision_DeepLearning.pdf

## Summary

Fiches de révision Deep Learning M1 couvrant 6 chapitres : (1) neurone & forward, (2) backpropagation, (3) régularisation & optimisation, (4) CNN, (5) auto-encodeurs/VAE, (6) RNN/LSTM/GRU/Attention. Chaque chapitre fournit intuition, formalisme matriciel, formules à mémoriser et pièges classiques. Quatre blocs quasi-certains à l'examen : backprop, comptage de paramètres (dense/conv/récurrent), LSTM vs GRU, RNN + attention.

## Fields/API

**ch1_neurone_forward**: **perceptron**: ŷ = g(w₀ + Σᵢ wᵢxᵢ) ; z = pré-activation (avant g), a = g(z) (après)
**activations**: **sigmoid**: σ(z)=1/(1+e^{-z}), sortie (0,1) ; σ'=σ(1−σ) ; sature aux extrêmes
**tanh**: (eᶻ−e^{-z})/(eᶻ+e^{-z}), sortie (−1,1), centrée en 0 ; tanh'=1−tanh²
**relu**: max(0,z), [0,∞), rapide, pas de saturation côté+ ; ReLU'=1 si z>0 sinon 0 ; dying ReLU si z≤0
**softmax**: e^{zk}/Σe^{zj}, distribution multi-classe ; à associer avec cross-entropy
**forward_matriciel**: z^(ℓ)=W^(ℓ)a^(ℓ-1)+b^(ℓ) ; a^(ℓ)=g(z^(ℓ)) ; a^(0)=x, sortie=a^(L)
**params_dense**: n_in × n_out (poids) + n_out (biais)
**loss**: **MSE**: ℓ = ½(ŷ−y)² — régression
**cross_entropy_binaire**: ℓ = −[y log ŷ + (1−y) log(1−ŷ)] — classification
**empirique**: L(ω) = (1/N) Σᵢ ℓ(h_ω(xᵢ), yᵢ)
**gradient_descent**: ω ← ω − η∇_ω L(ω), η = learning rate
**ch2_backpropagation**: **principe**: Règle de chaîne de la sortie vers l'entrée avec mémoïsation : ∂L/∂w = (∂L/∂a)·(∂a/∂z)·(∂z/∂w). Un seul passage arrière suffit pour tous les gradients.
**erreur_couche**: δ^(ℓ) = ∂L/∂z^(ℓ)
**quatre_equations**: **erreur_sortie**: δ^(L) = ∇_{a^(L)} L ⊙ σ'(z^(L))
**propagation**: δ^(ℓ) = (W^(ℓ+1))⊤ δ^(ℓ+1) ⊙ σ'(z^(ℓ))
**gradient_poids**: ∇_{W^(ℓ)} L = δ^(ℓ) (a^(ℓ-1))⊤   [activation d'avant, pas d'après]
**gradient_biais**: ∇_{b^(ℓ)} L = δ^(ℓ)
**simplification_softmax_CE**: δ^(L) = ŷ − y (prédiction − vérité)
**mise_a_jour**: W^(ℓ) ← W^(ℓ) − η ∇_{W^(ℓ)} L
**ch3_regularisation_optimisation**: **split**: D_train (régler ω) / D_val (hyperparamètres + early stopping) / D_test (évaluation finale non biaisée)
**signal_overfitting**: train loss baisse, val loss remonte ; remède : early stopping (patience p époques)
**penalites**: **L2_weight_decay**: λ‖ω‖₂² ; gradient λω ; MAJ ω←(1−ηλ)ω−η∇L ; lisse, tous poids petits
**L1_lasso**: λ‖ω‖₁ ; gradient λ·sign(ω) ; sparsité, poids exactement nuls, sélection de features
**max_norm**: contrainte ‖wⱼ‖₂ ≤ c ; borne les poids, stabilise, autorise grand η
**dropout**: éteint neurone avec proba 1−p (train) ; dropout inversé : divise par p → même échelle inférence ; empêche co-adaptation
**optimiseurs**: **momentum**: vₜ = βvₜ₋₁ + η∇L ; ω ← ω − vₜ (β≈0.9)
**RMSProp**: Sₜ = βSₜ₋₁ + (1−β)(∇L)² ; ω ← ω − (η/√(Sₜ+ε))∇L
**Adam**: mₜ=β₁mₜ₋₁+(1−β₁)gₜ ; vₜ=β₂vₜ₋₁+(1−β₂)gₜ² ; m̂=mₜ/(1−β₁ᵗ) ; v̂=vₜ/(1−β₂ᵗ) ; ωₜ₊₁=ωₜ−η·m̂/(√v̂+ε) ; défauts β₁=0.9, β₂=0.999, ε=1e-8
**batch_norm**: normalise activations (µ=0, σ²=1) par mini-batch, puis réapplique γ, β appris → entraînement plus rapide/stable, légère régularisation
**ch4_CNN**: **convolution**: filtre F×F×C_in glisse avec stride S et padding P ; K filtres → K feature maps de profondeur K
**taille_sortie**: O = ⌊(W − F + 2P) / S⌋ + 1
**params_conv**: sans biais : K·(F·F·C_in) ; avec biais : K·(F·F·C_in + 1) ; C_in = profondeur entrée
**neurones_carte**: O×O×K activations par couche conv (partage de poids : beaucoup d'activations, peu de params)
**pooling**: max ou average pooling ; 0 paramètre appris ; compresse, réduit coût, invariance partielle
**architecture_type**: [Conv → ReLU → Pool] × n → Flatten → Dense → Dense(softmax) ; couches basses=bords, profondes=objets
**ch5_autoencodeurs**: **structure**: x → encodeur → z (code latent, petit) → décodeur → x̂ ≈ x ; apprentissage non supervisé (cible = entrée)
**loss**: reconstruction : MSE ou cross-entropy binaire entre x̂ et x ; bottleneck force la compression
**variantes**: **dense_AE**: réduction de dimension non-linéaire (≈ PCA non-linéaire)
**conv_AE**: préserve la structure spatiale (images)
**sparse_AE**: pénalité sparsité sur z → features interprétables
**denoising_AE**: entrée bruitée → cible propre ; structure robuste (pas l'inverse !)
**VAE**: encodeur sort µ et log σ² ; z = µ + σ⊙ε avec ε ~ N(0,I) (reparamétrisation) ; loss = reconstruction + KL vers N(0,I) ; espace latent continu pour génération
**ch6_RNN_LSTM_GRU_Attention**: **simple_RNN**: hₜ = tanh(W_hh hₜ₋₁ + W_hx xₜ + b) ; mêmes poids W à tous les pas ; vanishing gradient → oublie l'info lointaine
**params_recurrents**: **simple_RNN**: h·(h+x+1) — 1 matrice
**GRU**: 3 × h·(h+x+1) — reset, update, candidat
**LSTM**: 4 × h·(h+x+1) — forget, input, output, candidat
**LSTM**: **portes**: fₜ (forget), iₜ (input), oₜ (output) + c̃ₜ (candidat) = 3 portes, 4 matrices
**cell_state**: cₜ = fₜ⊙cₜ₋₁ + iₜ⊙c̃ₜ (tapis roulant linéaire → gradient stable)
**hidden**: hₜ = oₜ⊙tanh(cₜ)
**GRU**: **portes**: zₜ (update), rₜ (reset) — 2 portes, pas d'état de cellule séparé
**hidden**: hₜ = (1−zₜ)⊙hₜ₋₁ + zₜ⊙ĥₜ ; z≈0 → garde ancienne mémoire, z≈1 → écrit candidat
**LSTM_vs_GRU**: **LSTM**: états hₜ + cₜ ; 3 portes ; 4× params SimpleRNN ; quand mémoire longue critique
**GRU**: état hₜ seul ; 2 portes ; 3× params SimpleRNN ; défaut si simple/rapide/peu de données
**point_commun**: tous deux combattent le vanishing gradient par des portes
**attention**: **principe**: αᵢ = align(hᵢ, s) normalisé softmax ; contexte = Σᵢ αᵢhᵢ ; recalculé à chaque pas décodeur
**cout**: O(m·t), m = états encodeur, t = pas décodeur (vs O(m+t) sans attention)
**avantages**: accès direct à toute position (pas de goulot) ; interprétabilité via carte des αᵢ
**return_sequences**: False → dernier état (batch, units) ; True → tous états (batch, temps, units) — obligatoire pour empiler couches récurrentes ou appliquer attention

## Constraints

- Sans non-linéarité, composer des couches denses est inutile : W₂(W₁x) = Wx reste linéaire
- Distinguer z (pré-activation) et a=g(z) — crucial en backprop
- Ne pas oublier les biais dans le comptage : n_out biais par couche dense
- Backprop ≠ descente de gradient : backprop calcule ∇L, la descente l'utilise
- ReLU' = 0 si z ≤ 0 → gradient bloqué sur ce neurone (dying ReLU)
- ∇_{W^(ℓ)} L = δ^(ℓ)(a^(ℓ-1))⊤ : c'est a^(ℓ-1), l'activation d'avant, pas d'après
- C_in obligatoire dans le comptage params conv — surtout dès la 2e conv
- Pooling : 0 paramètre appris, ne pas confondre avec conv
- Taille sortie conv : utiliser (W−F+2P)/S+1, avec partie entière, ne pas se tromper de signe
- Params conv indépendants de la taille d'image ; params 1re dense après flatten dépendent de la taille spatiale
- Bottleneck trop large dans AE → copie triviale, aucun apprentissage utile
- VAE : le code est une distribution (µ, σ), pas un point ; reparamétrisation z=µ+σ⊙ε indispensable pour backprop
- Denoising AE : entrée=image bruitée, cible=image propre (pas l'inverse)
- LSTM : 3 portes (forget, input, output) + candidat = 4 matrices ; GRU : 2 portes, pas d'état c
- Nombre de paramètres RNN indépendant de la longueur de séquence (poids partagés dans le temps)
- Attention sans return_sequences=True → voit un seul état, sans sens
- L1 ↔ sparsité ; L2 ↔ lissage — ne pas inverser
- Ne jamais toucher D_test pour régler les hyperparamètres — rôle de D_val
- Adam ≠ toujours meilleure généralisation : SGD+momentum bien réglé peut surpasser Adam en fin d'entraînement
- Régulariser les biais est inutile et risque l'underfitting

## Examples

**label**: Comptage params réseau dense 13→64→1
**detail**: (13·64 + 64) + (64·1 + 1) = 896 + 65 = 961 paramètres ; 64 neurones cachés
**label**: Taille sortie conv W=28, F=5, P=0, S=1
**detail**: O = (28−5+0)/1 + 1 = 24 ; MaxPool 2×2 (S=2) → 12
**label**: Paramètres LeNet-like 28×28×1
**detail**: Conv5×5×10 (C_in=1) : 250 ; MaxPool : 0 ; Conv5×5×20 (C_in=10) : 5000 ; MaxPool : 0 ; Flatten 320 ; Dense→100 : 32100 ; Dense→10 : 1010 ; Total ≈ 38 250
**label**: Backprop chiffré 1D (w0=1, w1=2, w2=1, x=1, y=1, ReLU)
**detail**: Forward : z1=1→x1=1 ; z2=2→x2=2 ; z3=2=f̂ ; L=0.5 || Backward : ∂L/∂z3=1 ; ∂L/∂w2=2 ; ∂L/∂z2=w2·ReLU'(z2)·1=1 ; ∂L/∂w1=x1·1=1 ; ∂L/∂z1=w1·ReLU'(z1)·1=2 ; ∂L/∂w0=x0·2=2
**label**: Params LSTM h=128, x=32
**detail**: 4 · 128 · (128+32+1) = 4 · 128 · 161 = 82 432
