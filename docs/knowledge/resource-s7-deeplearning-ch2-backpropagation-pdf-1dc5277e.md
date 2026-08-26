---
id: resource-s7-deeplearning-ch2-backpropagation-pdf-1dc5277e
slug: resource-s7-deeplearning-ch2-backpropagation-pdf-1dc5277e
source_key: 'sha256:1dc5277e831dbc15c77eac50cc206956d535e20000a726dfa994bd1add3232f8'
part_of: S7 - deepLearning
order: 1
manifest: null
derived_from: 'sha256:1dc5277e831dbc15c77eac50cc206956d535e20000a726dfa994bd1add3232f8'
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
  - backpropagation
  - deep-learning
  - MLP
  - gradient-descent
  - loss-function
  - chain-rule
  - neural-networks
  - training
domain: machine-learning
---
# S7 - deepLearning — CH2_Backpropagation.pdf

## Thesis

Backpropagation is the algorithm that makes deep MLP training tractable: it propagates error signals backward through the network using the chain rule, computing the exact gradient of the loss with respect to every weight in one efficient backward pass.

## Context

A deep Multi-Layer Perceptron stacks many layers of neurons. Each weight influences the final prediction, so training requires knowing how much each weight contributes to the error. Computing this naively (perturbing each weight one at a time) would be prohibitively expensive. Backpropagation solves this by reusing intermediate computations already produced during the forward pass.

## Reasoning

Training proceeds in three phases repeated over epochs. (1) Forward pass: inputs propagate layer by layer through weighted sums and activation functions, producing a prediction. (2) Loss computation: the empirical loss (average over the dataset) quantifies the gap between predictions and ground truth. (3) Backward pass: deltas (δ) are computed from output to input. The output delta is the derivative of the loss with respect to the pre-activation of the output neuron. Hidden-layer deltas are the weighted sum of the deltas from the next layer, multiplied by the local activation derivative — this is the chain rule applied recursively. Weight updates then follow gradient descent: each weight is nudged in the direction opposite to its partial derivative (δ × incoming activation), scaled by a learning rate. Example with neurons 3–6: the forward pass fills all activations; the backward pass computes δ_output, then δ_5 and δ_6 (from δ_output), then δ_3 and δ_4 (from δ_5 and δ_6); finally all weights are updated simultaneously.

## Trade-offs

Backpropagation requires activations to be differentiable everywhere (or almost everywhere, as ReLU relaxes this). Gradients can vanish (shrink to zero in early layers) or explode (grow unboundedly) in very deep networks, necessitating careful initialization, normalization, or residual connections. Memory cost scales with depth because all intermediate activations must be retained for the backward pass. The algorithm is exact for a given batch but stochastic gradient descent (mini-batch) introduces noise that is often beneficial for generalization.

## See also

- chain rule of calculus
- stochastic gradient descent (SGD)
- activation functions (ReLU, sigmoid, tanh)
- vanishing gradient problem
- batch normalization
