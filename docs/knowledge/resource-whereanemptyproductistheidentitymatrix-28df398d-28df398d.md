---
id: resource-whereanemptyproductistheidentitymatrix-28df398d-28df398d
slug: resource-whereanemptyproductistheidentitymatrix-28df398d-28df398d
source_key: 'sha256:28df398d2199f28a40b75d00009d9ff6049301808727d5db0a522379fb8f783f'
part_of: null
order: null
manifest: null
derived_from: 'sha256:28df398d2199f28a40b75d00009d9ff6049301808727d5db0a522379fb8f783f'
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
  - regularization
  - optimization
  - backpropagation
  - gradient-descent
  - overfitting
  - dropout
  - adam
  - sgd
domain: machine-learning
---
# whereanemptyproductistheidentitymatrix-28df398d

## Summary

Lecture notes (ESILV/CentraleSupélec, Oct 2025) covering the full regularization and optimization pipeline for deep neural networks: network definition and backpropagation, generalization/overfitting theory, regularization techniques (L1, L2, dropout, data augmentation, early stopping, max-norm), and optimizer progression from vanilla SGD to Adam, with hyperparameter tuning strategies and mathematical appendix theorems.

## Fields/API

**name**: Neural Network Model
**definition**: Parametric function h_ω: X→Y composed of L layers, each applying f^(ℓ)(x) = σ(W^(ℓ)x + b^(ℓ)). Training minimizes empirical risk L(ω) = (1/N)Σ ε(h_ω(x_i), y_i).
**name**: Backpropagation
**definition**: Chain-rule algorithm: forward pass computes activations z^(ℓ), a^(ℓ); backward pass propagates error signals δ^(ℓ) = (W^(ℓ+1))ᵀ δ^(ℓ+1) ⊙ σ'(z^(ℓ)); gradients used to update W and b.
**name**: Overfitting / Underfitting
**definition**: Underfitting: model too simple → high bias. Overfitting: model too complex → memorizes noise, high variance. Detected by divergence between training and validation loss.
**name**: Capacity
**definition**: Representational capacity = all functions the architecture can express. Effective capacity = subset reachable by the optimizer under practical constraints. Gap arises from non-convex landscape, poor initialization, implicit GD regularization.
**name**: Train / Validation / Test Split
**definition**: D = D_train ∪ D_val ∪ D_test (disjoint). D_train optimizes ω; D_val tunes hyperparameters and detects overfitting; D_test gives final unbiased evaluation. i.i.d. assumption required.
**name**: L2 Regularization (Weight Decay)
**definition**: L_L2(ω) = L_train(ω) + (λ/2)‖ω‖₂². Gradient adds λω; update rule ω ← (1−ρλ)ω − ρ∇L_train. Discourages large weights; smooths decision boundaries. Biases typically excluded.
**name**: L1 Regularization (Lasso)
**definition**: L_L1(ω) = L_train(ω) + λ‖ω‖₁. Gradient adds λ·sign(ω); drives many weights to exactly zero → sparse models, implicit feature selection. Non-differentiable at 0 (subgradient used).
**name**: L1 vs L2 Comparison
**definition**: L1: sparse (many ω_j=0), non-differentiable at 0, used for interpretability/sparsity. L2: all weights small but non-zero, smooth everywhere, used for stability/generalization.
**name**: Max-Norm Constraint
**definition**: Constrains ‖w_j^(ℓ)‖₂ ≤ c directly (reprojection step after each update). No effect near origin; prevents exploding weights; avoids dead units from strong L1/L2 penalties.
**name**: Dropout
**definition**: Randomly deactivates each neuron with probability (1−p) per training step: a_drop^(ℓ) = m^(ℓ) ⊙ a^(ℓ), m ~ Bernoulli(p). Inverted dropout rescales by 1/p to keep expected activations consistent at test time. Prevents co-adaptation; acts as implicit model averaging.
**name**: Early Stopping
**definition**: Stop training when validation loss L_val^(t) exceeds its minimum for p consecutive epochs (patience). Save best weights. Prevents overfitting without modifying the loss function.
**name**: Data Augmentation
**definition**: Apply label-preserving transformations T to inputs: (x,y)→(T(x),y). Augmented loss averages over N_t transforms per sample. Examples: image rotations/flips/crops, audio pitch shift, text synonym replacement. Trains implicit invariance to chosen transforms.
**name**: Gradient Descent Variants
**definition**: Batch GD: gradient over all N samples (slow, low noise). Mini-batch SGD: gradient over |B| ≪ N samples (moderate speed/noise). Pure SGD: |B|=1 (fast, high noise). Noise decreases as batch size increases; SGD noise can help escape shallow local minima.
**name**: SGD with Momentum
**definition**: Velocity v_t = βv_{t-1} + ρ∇L(ω_{t-1}); ω_t = ω_{t-1} − v_t. β ≈ 0.9. Accumulates exponentially decaying moving average of past gradients; dampens oscillations in ravines; analogy: heavy ball rolling downhill.
**name**: Adagrad
**definition**: Per-parameter learning rate scaled by accumulated sum of squared gradients G_t. Update: ω_{t+1,i} = ω_{t,i} − (ρ/√(G_{t,ii}+ε))∇L_i. Excellent for sparse data (NLP). Drawback: G_t only grows → learning rate vanishes.
**name**: RMSProp
**definition**: Fixes Adagrad by using exponentially decaying moving average of squared gradients: S_t = βS_{t-1} + (1−β)(∇L_t)². Update: ω_{t+1} = ω_t − (ρ/√(S_t+ε))∇L_t. β ≈ 0.99. Maintains adaptivity without vanishing learning rate.
**name**: Adam (Adaptive Moment Estimation)
**definition**: Combines momentum (first moment m_t) and RMSProp (second moment v_t). m_t = β₁m_{t-1}+(1−β₁)g_t; v_t = β₂v_{t-1}+(1−β₂)g_t². Bias-corrected: m̂_t = m_t/(1−β₁ᵗ), v̂_t = v_t/(1−β₂ᵗ). Update: ω_{t+1} = ω_t − ρ·m̂_t/(√v̂_t+ε). Typical: β₁=0.9, β₂=0.999, ε=10⁻⁸.
**name**: Optimizer Comparison
**definition**: SGD: good generalization, slow, sensitive to LR. Momentum: faster, can overshoot. RMSProp: fixes Adagrad decay, sensitive to global LR. Adam: fast, robust default; sometimes slightly worse than well-tuned SGD with momentum. Practical: start with Adam; switch to SGD+momentum late in training if generalization is critical.
**name**: Hyperparameter Tuning
**definition**: Key hyperparameters: learning rate ρ, mini-batch size |B|, λ (regularization), dropout rate p. Methods: Grid Search (exhaustive), Random Search (Bergstra & Bengio, JMLR 2012 — often better), Bayesian Optimization (Snoek et al., NeurIPS 2012 — guided). Always tune ρ; use LR schedules or warmup.
**name**: Bias–Variance Decomposition
**definition**: E_D[(f̂(x)−y)²] = Bias²[f̂(x)] + Var_D[f̂(x)] + σ². Overfitting = low bias, high variance. Underfitting = high bias, low variance. Irreducible noise σ² is independent of model.
**name**: Key Theorems (Appendix)
**definition**: (1) Without nonlinear activations, any L-layer network collapses to one affine map h_ω(x)=W̃x+b̃ (composition of affine maps is affine; empty product = identity matrix). (2) GD on L-smooth convex loss with ρ≤1/L converges: L(ω_k)−L(ω*)≤‖ω_0−ω*‖²/(2ρk). (3) L_train(ω)+(λ/2)‖ω‖₂² is convex for λ≥0, and λ-strongly convex for λ>0.
**name**: Occam's Razor / No Free Lunch
**definition**: Occam's Razor: prefer the simplest model that fits the data. No Free Lunch: no universally best algorithm or regularizer — method choice must match data structure and task. The best model is often a large one regularized appropriately.

## Constraints

- Biases are conventionally excluded from regularization penalties (L1/L2) to avoid underfitting — they affect only one variable and are learned reliably with less data.
- A single global λ is the practical standard despite theoretic benefit of per-layer λ_ℓ — reduces hyperparameter search cost.
- i.i.d. assumption is required to relate training error to test error mathematically.
- Learning rate ρ ≤ 1/L required for GD convergence guarantee on L-smooth loss.
- Nonlinear activations are essential — networks without them collapse to a single linear model regardless of depth.

## Examples

- Polynomial degree-12 fit on N points: fits training data exactly but fails on new data — canonical overfitting example.
- Early stopping pseudocode: track best_val_loss; increment no_improve counter when L_val^(t) does not improve; stop when no_improve > p (patience); restore saved best weights.
- Adam typical hyperparameters: β₁=0.9, β₂=0.999, ε=10⁻⁸, ρ=10⁻³.
- Inverted dropout scaling: a_drop = (m ⊙ a)/p ensures E[a_drop]=a, so no test-time rescaling is needed.
- L2 weight decay update derivation: ∇_ω(λ/2‖ω‖₂²)=λω → ω ← ω−ρλω−ρ∇L_train = (1−ρλ)ω−ρ∇L_train.
