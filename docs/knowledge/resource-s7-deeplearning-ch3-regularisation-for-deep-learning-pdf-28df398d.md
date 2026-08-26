---
id: resource-s7-deeplearning-ch3-regularisation-for-deep-learning-pdf-28df398d
slug: resource-s7-deeplearning-ch3-regularisation-for-deep-learning-pdf-28df398d
source_key: 'sha256:28df398d2199f28a40b75d00009d9ff6049301808727d5db0a522379fb8f783f'
part_of: S7 - deepLearning
order: 2
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - deep-learning
  - regularization
  - overfitting
  - optimization
  - gradient-descent
  - dropout
  - L1
  - L2
  - adam
  - sgd
  - data-augmentation
  - early-stopping
  - bias-variance
domain: machine-learning
---
# S7 - deepLearning — CH3 Regularisation for deep learning.pdf

## Thesis

Neural networks are prone to overfitting because their high capacity lets them memorize training data rather than learn generalizable patterns. Regularization techniques constrain model complexity to close the gap between training and test performance, while adaptive optimizers (Momentum, RMSProp, Adam) address the practical failure modes of vanilla gradient descent — slow convergence, oscillation, and uniform learning rates across parameters.

## Context

Lecture CH3 from a deep learning course at ESILV–CentraleSupélec/Université Paris-Saclay (Reihan Mazouz, Oct 2025). Covers the full supervised training pipeline: loss minimization via backpropagation → generalization problem → regularization toolkit → optimizer evolution → hyperparameter search. Presupposes familiarity with neural network architecture, the chain rule, and basic probability.

## Reasoning

**Why networks overfit.** A neural network h_ω(x) = f_L ∘ … ∘ f_1(x) is a non-linear function of its parameters ω. Training minimizes empirical risk over N labeled samples, but this gives no guarantee on unseen data. High-capacity networks can fit any labeling of training data, including noise, yielding low training loss and high test loss. The i.i.d. assumption connects empirical and true risk mathematically; violating it (distribution shift) makes generalization impossible. The bias-variance decomposition formalizes the cost: MSE = Bias² + Variance + irreducible noise. Underfitting = high bias; overfitting = high variance.

**Regularization toolkit.** All techniques share the same goal — reduce effective capacity without degrading representational capacity:
- *L2 (Weight Decay)*: adds λ/2 ‖ω‖² to the loss. Gradient step becomes ω ← (1−ρλ)ω − ρ∇L_train: multiplicative shrinkage toward zero every step. Encourages all neurons to contribute a little. Does not regularize biases (they control single-variable shifts and can be estimated reliably from little data; penalizing them risks underfitting).
- *L1 (Lasso)*: adds λ‖ω‖₁. Subgradient update subtracts λ·sign(ω), driving many weights to exactly zero → sparsity and implicit feature selection. Non-differentiable at 0 requires subgradient.
- *Max-Norm*: hard constraint ‖w_j^(ℓ)‖₂ ≤ c per neuron; reprojection after each update. No effect near the origin — only clips large weights. Prevents dead units caused by strong L1/L2 penalties.
- *Dropout*: each neuron kept with probability p per forward pass; dropped mask m ~ Bernoulli(p). Inverted dropout scales activations by 1/p at train time so test-time output expectations match. Acts as implicit ensemble over exponentially many subnetworks, decorrelating neurons.
- *Early Stopping*: monitor validation loss; save best weights; stop after p consecutive epochs without improvement. Zero change to model or loss — pure training-schedule intervention.
- *Data Augmentation*: apply label-preserving transforms T (flips, crops, pitch shift, synonym replacement) to inputs, yielding augmented loss L_aug = (1/N·N_t) Σ ε(h_ω(T(x_i)), y_i). Teaches the model invariance without new annotations.

**Optimizer evolution.** Vanilla batch GD (gradient computed over all N samples) is prohibitively expensive. SGD uses mini-batches B: cheap updates, gradient noise can escape shallow local minima, but oscillates in ravines. Four improvements:
- *Momentum*: accumulates velocity v_t = β·v_{t−1} + ρ·∇L; ω_t = ω_{t−1} − v_t. β≈0.9 smooths trajectory; the 'heavy ball' analogy — builds speed in consistent directions, ignores transient noise.
- *Adagrad*: per-parameter adaptive LR via cumulative sum of squared gradients G_t; step size ρ/√(G_{t,ii}+ε). Excellent for sparse features (NLP); fatal flaw: G_t grows monotonically, LR eventually → 0.
- *RMSProp*: fixes Adagrad by using exponential moving average S_t = β·S_{t−1} + (1−β)·(∇L_t)²; LR stays responsive. β≈0.99.
- *Adam*: first moment m_t (like Momentum, β₁=0.9) + second moment v_t (like RMSProp, β₂=0.999) with bias-correction m̂_t = m_t/(1−β₁ᵗ), v̂_t = v_t/(1−β₂ᵗ). Update: ω ← ω − ρ·m̂_t/(√v̂_t+ε), ε=1e-8. Robust default across architectures.

**Hyperparameter search.** Hyperparameters (λ, ρ, |B|, dropout rate…) are tuned on the validation set, never the test set. Methods: grid search (exhaustive, exponential cost), random search (empirically better for high-dimensional spaces, Bergstra & Bengio 2012), Bayesian optimization (guided, sample-efficient).

**Key theorem: linearity without activations.** Without non-linear activations, any L-layer network collapses to a single affine map h_ω(x) = W̃x + b̃. Non-linearities (ReLU, tanh, sigmoid) are structurally necessary for expressive power.

## Trade-offs

- **L1 vs L2**: L1 produces exact zeros (feature selection, interpretable sparse models) but requires subgradients; L2 is smooth everywhere and shrinks all weights uniformly — preferred for stability and generalization when all features are relevant.
- **Per-layer λ vs global λ**: per-layer is theoretically superior (different layers have different weight scales and roles) but multiplies the hyperparameter search space; a single global λ is the standard practical trade-off.
- **Regularize weights, not biases**: biases affect only one variable; regularizing them adds little generalization benefit and risks underfitting. Consensus position from Goodfellow et al. §7.1.1.
- **Dropout rate p**: too high → information bottleneck, slow training; typical p=0.5 for hidden layers, 0.8 for input layers. Test-time inference uses full network (inverted dropout removes scaling burden from inference).
- **Batch size**: larger B → less noisy gradient, faster wall-clock time per epoch, but poorer implicit regularization effect (large-batch training tends to find sharper minima); pure SGD (|B|=1) is fast but highly unstable.
- **Adam vs SGD+Momentum**: Adam converges faster and requires less learning-rate tuning; SGD+Momentum with careful schedule can achieve slightly better final generalization — common strategy: start with Adam, switch to SGD late in training if generalization matters and compute budget allows.

## See also

Goodfellow, Bengio, Courville — Deep Learning, MIT Press 2016 (§7.1 L2, §7.2 L1, §7.3 Dropout, §8 Optimization); Kingma & Ba — Adam, ICLR 2015; Srivastava et al. — Dropout, JMLR 2014; Krogh & Hertz — Weight Decay, NIPS 1992; Prechelt — Early Stopping, Neural Networks: Tricks of the Trade 1998; Bergstra & Bengio — Random Search for Hyperparameters, JMLR 2012; Snoek, Larochelle, Adams — Bayesian Optimization, NeurIPS 2012; Hastie, Tibshirani, Friedman — Elements of Statistical Learning §2.9 (Bias-Variance); Bubeck — Convex Optimization: Algorithms and Complexity, arXiv:1405.4980 §3.2 (GD convergence proof).
