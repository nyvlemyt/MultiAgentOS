---
id: resource-s7-deeplearning-intro-to-deep-learning-pdf-3b78b102
slug: resource-s7-deeplearning-intro-to-deep-learning-pdf-3b78b102
source_key: 'sha256:3b78b10231b382038b3147d71f3629202df4f6392d4c813ce96127470898eeb1'
part_of: resource-s7-deeplearning-062b2dc8
order: 7
manifest: null
derived_from: 'sha256:3b78b10231b382038b3147d71f3629202df4f6392d4c813ce96127470898eeb1'
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
  - neural-networks
  - perceptron
  - backpropagation
  - gradient-descent
  - activation-functions
  - loss-functions
  - regularization
  - dropout
  - early-stopping
  - mini-batches
  - overfitting
domain: machine-learning
---
# S7 - deepLearning — Intro To Deep Learning.pdf

## Thesis

Deep learning teaches computers to learn directly from raw data by composing perceptrons into layered networks, then minimising a loss function through gradient descent computed via backpropagation — the three pillars of the field.

## Context

Introductory lecture (CH1) of a five-chapter deep learning course. Situates the field as 'teaching computers to learn a task directly from raw data' and explains why it is viable now (compute + data). Assumes no prior neural-network knowledge but expects basic linear-algebra literacy. Subsequent chapters cover backpropagation (CH2), regularisation/optimisation (CH3), CNNs (CH4), and RNNs (CH5).

## Reasoning

**Perceptron — the atomic unit.** A perceptron computes a weighted sum of its inputs, adds a bias, and passes the result through a non-linear activation function (sigmoid, tanh, ReLU). Without the non-linearity the entire stack collapses to a single linear transformation, making depth meaningless.

**Building networks.** Stacking perceptrons in layers yields single-layer networks; adding hidden layers creates deep networks. Depth enables hierarchical feature extraction: early layers learn low-level patterns, later layers compose them into abstract concepts.

**Quantifying error.** A loss function measures how wrong predictions are. Binary cross-entropy is used for classification (probability outputs); mean squared error for regression (continuous outputs). Training = minimising this loss over the dataset.

**Gradient descent.** The loss surface over weight space is high-dimensional and non-convex. Gradient descent iteratively nudges each weight by a small step (learning rate η) in the direction opposite to the gradient of the loss. Too high η → oscillation/divergence; too low → extremely slow convergence.

**Backpropagation.** The practical engine for computing gradients. Applies the chain rule layer-by-layer from the output back to the inputs, accumulating partial derivatives efficiently. It is what makes training deep networks tractable.

**Adaptive learning rates.** Because a fixed η is fragile, algorithms like Adam and RMSProp maintain per-parameter learning rates that adapt based on gradient history, achieving faster and more stable convergence in practice.

**Mini-batch SGD.** Instead of computing the exact gradient over the full dataset (expensive) or a single sample (very noisy), mini-batches strike a balance: stable enough gradient estimates, small enough to fit in GPU memory, and the inherent noise provides a mild regularisation effect.

**Overfitting and regularisation.** A network can memorise training data and fail to generalise. Two key mitigations: (1) Dropout — randomly zeroing a fraction of neuron activations during training, forcing redundant representations; (2) Early stopping — monitoring validation loss and halting training before it starts to rise, effectively limiting model capacity without changing architecture.

## Trade-offs

**Depth vs. trainability:** more layers increase representational power but amplify vanishing/exploding gradient problems and training cost.

**Batch size:** large batches → stable, parallelisable gradients but high memory and risk of sharp minima; small batches → noisy updates but implicit regularisation and lower memory footprint.

**Fixed vs. adaptive learning rate:** adaptive (Adam) is robust and usually default; fixed SGD can generalise better on some tasks if tuned carefully.

**Dropout rate:** higher dropout = stronger regularisation but slower convergence and inference inconsistency without careful scaling.

**Early stopping:** cheap and effective but requires a held-out validation set and introduces a timing hyperparameter (patience); does not reduce model size at inference.

## See also

- Backpropagation — CH2 (chain-rule derivations, vanishing gradients)
- Model Regularisation & Optimisation — CH3 (L1/L2, batch norm, advanced optimisers)
- Convolutional Neural Networks — CH4 (spatial inductive bias, pooling)
- Deep Recurrent Neural Networks — CH5 (sequential data, LSTM/GRU)
