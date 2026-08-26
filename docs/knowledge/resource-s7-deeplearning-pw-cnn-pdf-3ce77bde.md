---
id: resource-s7-deeplearning-pw-cnn-pdf-3ce77bde
slug: resource-s7-deeplearning-pw-cnn-pdf-3ce77bde
source_key: 'sha256:3ce77bde37ce7772852722d48231e24fc72a3db070bd5e8ccbf55f9e2b7de5ed'
part_of: S7 - deepLearning
order: 10
manifest: null
derived_from: 'sha256:3ce77bde37ce7772852722d48231e24fc72a3db070bd5e8ccbf55f9e2b7de5ed'
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
  - deep-learning
  - CNN
  - Keras
  - TensorFlow
  - CIFAR-10
  - image-classification
  - GPU
  - overfitting
  - regularization
domain: machine-learning
---
# S7 - deepLearning — PW CNN.pdf

## Goal

Build and compare three CNN architectures (NET I, NET II, NET III) on CIFAR-10 using Keras/TensorFlow on GPU, learning how filter size, depth, dropout, and L2 regularization affect accuracy and overfitting.

## Prerequisites

- Python and Jupyter/Google Colab basics
- Familiarity with fully-connected neural networks
- Google Colab account (GPU runtime enabled via Edit → Notebook settings → Hardware accelerator: GPU)

## Steps

**step**: 1
**title**: Activate and verify GPU on Google Colab
**detail**: Enable GPU in Edit → Notebook settings. Verify with `tf.test.gpu_device_name()` (expected: '/device:GPU:0') and `device_lib.list_local_devices()`. Check RAM/CPU with `!cat /proc/meminfo` and `!cat /proc/cpuinfo`.
**step**: 2
**title**: Load and preprocess CIFAR-10
**detail**: Load the dataset via Keras. Cast X_train/X_test to float32 and normalize pixel values from [0,255] to [0.0,1.0] by dividing by 255. CIFAR-10 images are 32×32×3 RGB across 10 classes.
**step**: 3
**title**: Build NET I: CONV–POOL–CONV–POOL–CONV–POOL–FC–FC
**detail**: 8-layer architecture. Three Conv2D layers with 3×3 kernels and channel counts 32, 64, 64. Three MaxPooling2D layers (pool_size=2×2, stride=2). Flatten, then two Dense layers (512 units ReLU, 10 units Softmax). Input shape: (32,32,3).
**step**: 4
**title**: Compute parameter count and output dimensions
**detail**: For each Conv layer: P_n = [(m×n×C_i)+1]×C_o. Output spatial dim: O_n = (N−F)/S + 1. Pooling layers have 0 learnable parameters. Verify with `model.summary()`.
**step**: 5
**title**: Compile NET I
**detail**: Use Adam optimizer and sparse_categorical_crossentropy loss.
**step**: 6
**title**: Train NET I
**detail**: Call `model.fit()` with validation_split=0.2, batch_size=128, epochs=20. Store result in `history`. The model never trains on validation data — it is used only to tune hyperparameters. The untouched test set provides the final unbiased score.
**step**: 7
**title**: Evaluate and predict with NET I
**detail**: Run `model.evaluate()` on test set; print accuracy and loss. Run `model.predict()` on test set; compare argmax of predicted probability vector against the true label for the first image.
**step**: 8
**title**: Plot training curves for NET I
**detail**: Plot 'accuracy' vs 'val_accuracy' and 'loss' vs 'val_loss' over epochs. Observe the gap between curves to detect overfitting onset (epoch at which val_loss starts rising).
**step**: 9
**title**: Build NET II: CONV–CONV–POOL–CONV–POOL–FC–FC (larger filters)
**detail**: 7-layer architecture. Same channel counts (32, 64, 64) but filter size 5×5. Two pooling layers instead of three. Same FC heads. Compile, train, evaluate, and plot curves as for NET I. Compare overfitting onset and train/val deviation. Note: smaller filters capture finer non-linearities; larger filters average more pixels, reducing sensitivity to local variation.
**step**: 10
**title**: Build NET III: deeper model with regularization
**detail**: Architecture: CONV–CONV–POOL–CONV–POOL–CONV–CONV–CONV–POOL–FC–FC–FC. Six Conv2D layers, 3×3 kernels, channels [96,96,128,128,128,128], stride 1, ReLU. Three MaxPooling2D (2×2, stride 2). Dropout 50% after each pooling and in FC layers. L2 regularization (λ=0.0005) in FC layers. Three Dense layers: 1024 (ReLU), 512 (ReLU), 10 (Softmax). Inspired by AlexNet/VGGNet.
**step**: 11
**title**: Compile, train, evaluate NET III and compare all three models
**detail**: Repeat the compile/fit/evaluate/plot pipeline. Assess whether dropout + L2 reduces overfitting versus NET I and NET II, how many epochs before overfitting, and the train/val deviation. Optionally modify architecture, regularization, or optimizer (Exe. 19) for further improvement.

## Result

Three trained CNN models (NET I, II, III) for CIFAR-10 classification, with hands-on experience in how filter size, depth, dropout, and L2 regularization trade off against accuracy and overfitting.

## Next

- Experiment with data augmentation to further reduce overfitting
- Try transfer learning with pre-trained models (VGG16, ResNet) on CIFAR-10
- Activate a local GPU (technical report promised in the source) to run experiments without Colab limits
