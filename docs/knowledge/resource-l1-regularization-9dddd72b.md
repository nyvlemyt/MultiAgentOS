---
id: resource-l1-regularization-9dddd72b
slug: resource-l1-regularization-9dddd72b
source_key: 'sha256:9dddd72b1605e8c4d09c80b8450ba5fefa19e89e7e91550e579befa9fbdb458e'
part_of: null
order: null
manifest: null
derived_from: 'sha256:9dddd72b1605e8c4d09c80b8450ba5fefa19e89e7e91550e579befa9fbdb458e'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - regularization
  - overfitting
  - underfitting
  - L1
  - L2
  - dropout
  - keras
  - deep-learning
  - cross-validation
  - weight-decay
domain: machine-learning
---
# L1 regularization

## Goal

Learn to diagnose and combat overfitting in Keras neural networks using three complementary techniques: model-size reduction, L1/L2 weight regularization, and dropout — applied first to the IMDB sentiment dataset, then to the Boston Housing regression dataset.

## Prerequisites

- Python + NumPy basics
- Keras / TensorFlow installed
- Familiarity with Dense layers, activation functions (relu, sigmoid), and compile/fit/evaluate API
- Understanding of train/validation split and loss curves

## Steps

- 1. IMDB dataset — load with max 10 000 words, vectorize sequences into binary multi-hot matrices, cast labels to float32.
- 2. Model-size comparison — build three models: 'original' (2×Dense-16), 'smaller' (2×Dense-4), 'bigger' (2×Dense-512), all with relu + sigmoid output + rmsprop + binary_crossentropy. Train each 20 epochs, batch 512, plot validation loss; observe which overfits earliest.
- 3. L2 regularization — clone the original model, add `kernel_regularizer=regularizers.l2(0.001)` to the first two layers. Refit and overlay val-loss with the unregularized original; the L2 model should overfit later despite identical parameter count. Available alternatives: `regularizers.l1(0.001)`, `regularizers.l1_l2(l1=0.001, l2=0.001)`.
- 4. Dropout — clone the original model, insert `layers.Dropout(0.5)` after each Dense-16 layer (before the next layer). Refit and compare val-loss with original; dropout is applied only at training time; at inference the outputs are scaled by the dropout rate.
- 5. Boston Housing — load dataset, normalize each feature to zero-mean unit-std (fit stats on train only), build a small 2×Dense-64 relu network with a single linear output unit, compiled with MSE loss and MAE metric.
- 6. K-fold cross-validation (k=4) — with few samples, standard val split is too noisy; partition train data into 4 folds, train on 3/evaluate on 1 for each fold, average MAE scores.
- 7. 500-epoch run — re-run K-fold saving per-epoch val_mae history per fold; average across folds, omit first 10 epochs, apply exponential moving average (factor ~0.9) to smooth the curve; identify the epoch where MAE bottoms out before overfitting begins.
- 8. Final model — retrain on the full training set using the optimal epoch count found in step 7; evaluate on the held-out test set.

## Result

A reproducible comparison of four regularization strategies (baseline, smaller network, L2, dropout) on IMDB, plus a K-fold-validated regression model on Boston Housing. Plots of smoothed val-loss/val-MAE curves show clearly when each strategy starts overfitting, giving intuition for the capacity–regularization trade-off.

## Next

- Combine L2 and dropout on the same model and measure additive benefit.
- Apply early stopping (Keras `EarlyStopping` callback) using the optimal epoch found via K-fold.
- Extend to batch normalization as an alternative regularizer.
- Graduate to a real project: tune the Boston Housing final model and report test MAE.
