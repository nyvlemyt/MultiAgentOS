---
id: resource-s7-deeplearning-de-annee-derniere-pdf-d2278f7d
slug: resource-s7-deeplearning-de-annee-derniere-pdf-d2278f7d
source_key: 'sha256:d2278f7d9cf5769f31719897132ca5e19f5a953f78122ff856dedf9b297c0ca7'
part_of: S7 - deepLearning
order: 5
manifest: null
derived_from: 'sha256:d2278f7d9cf5769f31719897132ca5e19f5a953f78122ff856dedf9b297c0ca7'
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
  - CNN
  - VAE
  - attention
  - transformer
  - exam
  - EFREI
  - I2-APP-BDML
domain: Machine Learning
---
# S7 - deepLearning — DE annee derniere.pdf

## Summary

Exam paper for the Deep Learning module (I2-APP-BDML) at EFREI, 2024/2025, duration 1h50. Covers five exercise areas: (1) MCQ on DNN, CNN, generative models, VAE vs autoencoder, self-attention, and multi-head attention; (2) manual forward-pass computation through a small network using sigmoid then ReLU; (3) CNN architecture parameter counting on a Sequential Keras model with input shape 73×73×3; (4) VAE reparametrization trick, its gradient flow rationale, and advantage over deterministic autoencoders; (5) fill-in-the-blank on the attention mechanism diagram.

## Fields/API

**name**: Exercise 1 — MCQ (5 pts)
**description**: Six multiple-select questions. Q1: DNN properties (automatic feature extraction, non-linear transforms, regularisation — NOT manual feature engineering). Q2: CNN properties (filters, parameter sharing, pooling for dimensionality reduction — NOT that CNNs have unique auto-feature-learning advantage over DNNs). Q3: Deep Generative Models (density estimation, new-sample generation, latent-factor discovery — NOT supervised, NOT sequential by default). Q4: VAE vs Autoencoder (VAE = probabilistic latent space, data-distribution modelling, new-sample generation, semi-supervised use; AE = deterministic, dimensionality reduction; both NOT equally good at high-res image generation; VAE training harder due to complex loss). Q5: Self-attention (every token interacts with every other, Q/K/V vectors, long-range dependencies — NOT only neighbouring tokens). Q6: Multi-head attention (multiple representation subspaces, richer feature capture, parallel processing — NOT parameter reduction).
**name**: Exercise 2 — Forward pass (4 pts)
**description**: Small network, input x=[2,1], weights given (e.g. 1,1,2,1,-1,-2,-2,3,-3,-1.5,-4,1), no bias, target output y=0. Part 1: activate with σ(x)=1/(1+exp(−x)). Part 2: repeat with ReLU(x)=max(x,0). Students must fill neuron activation values and write the expression used.
**name**: Exercise 3 — CNN parameter count (5 pts)
**description**: Keras Sequential model on images of shape 73×73×3. Layers: InputLayer → Conv2D(32 filters, 3×3, stride=1, padding=same, relu) → MaxPooling2D(2×2) → Conv2D(64 filters, 3×3, stride=1, no padding, relu) → MaxPooling2D(2×2) → Flatten → Dense(160, relu) → Dense(8, softmax). All layers include bias. Students must fill output shapes and parameter counts. Total parameters = 3,338,600. Key formulas: Conv params = (kernel_h × kernel_w × in_channels + 1) × filters; Dense params = (in_features + 1) × units.
**name**: Exercise 4 — VAE reparametrization trick (3 pts)
**description**: Three sub-questions: (1) Fill missing terms in the reparametrization formula z = μ + ε·σ where ε ~ N(0,I). (2) Explain how sampling is made differentiable: the stochastic node ε is external to the computation graph, so gradients flow through μ and σ without passing through a non-differentiable sampling operation. (3) Advantage of VAE over standard autoencoder: VAE learns a structured, continuous latent space (a probability distribution) enabling meaningful interpolation and generation of new samples; standard AE has a discrete/unstructured latent space unsuited to generation.
**name**: Exercise 5 — Attention mechanism diagram (3 pts)
**description**: Fill six missing labels in the scaled dot-product / multi-head attention illustration. Expected terms include: Query (Q), Key (K), Value (V), MatMul, Scale (÷√d_k), Softmax — arranged as: score = QKᵀ/√d_k → Softmax → weighted sum with V.

## Constraints

- Closed-book exam: no documents allowed; calculators allowed; no mobile phones.
- Duration: 1 hour 50 minutes.
- Answers must be written directly on the exam sheet.
- Total points: 5 + 4 + 5 + 3 + 3 = 20 pts.
- CNN parameter total is given as 3,338,600 — use it as a checksum.

## Examples

- Conv2D1 output shape: (73, 73, 32) — padding='same' preserves spatial dims; params = (3×3×3+1)×32 = 896.
- Conv2D2 output shape: after MaxPooling1 → (36,36,32); no padding → (34, 34, 64); params = (3×3×32+1)×64 = 18,496.
- Reparametrization: z = μ + ε·σ, ε ~ N(0,I) — gradient flows through μ and σ, not through the sampling step.
