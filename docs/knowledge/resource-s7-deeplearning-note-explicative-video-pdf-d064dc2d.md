---
id: resource-s7-deeplearning-note-explicative-video-pdf-d064dc2d
slug: resource-s7-deeplearning-note-explicative-video-pdf-d064dc2d
source_key: 'sha256:d064dc2d501692a0b6f0259b41ebd65842d3e8b0e65dbeb40d62d129fe222284'
part_of: resource-s7-deeplearning-062b2dc8
order: 9
manifest: null
derived_from: 'sha256:d064dc2d501692a0b6f0259b41ebd65842d3e8b0e65dbeb40d62d129fe222284'
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
  - CNN
  - ResNet
  - transfer-learning
  - CIFAR-100
  - image-classification
  - regularization
  - Vision-Transformer
domain: Machine Learning
---
# S7 - deepLearning — Note_explicative_video.pdf

## Summary

Projet étudiant EFREI S7 comparant quatre architectures de classification d'images sur CIFAR-100 (mode coarse, 20 superclasses, images redimensionnées en 64×64). Progression du MLP de base jusqu'au transfer learning avec un ViT pré-entraîné, montrant l'apport concret de chaque technique.

## Fields/API

**name**: Dataset
**value**: CIFAR-100 coarse — 20 superclasses, images 64×64 px, ~8 000 images d'entraînement, classes équilibrées, pixels normalisés [0,1]. Référence : Krizhevsky 2009, Université de Toronto.
**name**: Modèle dense (MLP) — accuracy 0.2475
**value**: Réseau entièrement connecté : image aplatie en vecteur → couches denses. Sert de référence basse. Limite structurelle : ignore la proximité spatiale des pixels. Seuil du hasard = 0.05 (1/20).
**name**: CNN simple cas A — accuracy 0.3180
**value**: Convolutions locales + data augmentation (flip, rotation, zoom). Meilleur que le MLP grâce aux filtres de motifs locaux. Souffre de sur-apprentissage : gap train/validation élevé.
**name**: CNN régularisé cas B — accuracy 0.3655
**value**: Même architecture que cas A + Dropout + pénalité L2 sur les poids + early stopping. Gap train/validation réduit. Conclusion : la régularisation améliore concrètement la généralisation.
**name**: ResNet (blocs résiduels) — accuracy 0.3400
**value**: Architecture profonde avec connexions résiduelles (Add(input, output du bloc) : le réseau apprend une correction, pas une reconstruction complète). Résout le problème de disparition du gradient. Adapté aux images 64×64 et 20 classes. Entraînement plus stable que le CNN simple.
**name**: Transfer Learning (ViT) — accuracy 0.6985
**value**: Modèle : facebook/deit-tiny-patch16-224 (HuggingFace). Poids gelés : extraction de features seulement. Seule la tête dense finale est entraînée (20 classes). Résultat ~2× supérieur aux modèles entraînés de zéro, pour un coût de calcul bien inférieur.
**name**: Techniques de régularisation utilisées
**value**: Dropout, pénalité L2 (weight decay), early stopping, data augmentation (flip/rotation/zoom).
**name**: Outils d'analyse finale
**value**: Tableau comparatif + histogramme des accuracies, matrice de confusion du meilleur modèle (identification des superclasses confondues).

## Constraints

- Consigne projet : modifier à la fois la dimension des images ET le nombre de classes par rapport au TP CNN de référence (CIFAR-10, 32×32, 10 classes).
- Comparer au moins deux variantes de CNN (avec et sans régularisation).
- Couvrir les six consignes du sujet de cours.
- Entraînement contraint par un budget de calcul limité (~8 000 images, pas de GPU haute gamme) — justifie le choix du mode coarse (20 classes) et du ViT tiny.

## Examples

- Progression complète des accuracies : MLP 0.25 → CNN simple 0.32 → ResNet 0.34 → CNN régularisé 0.37 → ViT transfer learning 0.70.
- Comparaison cas A vs cas B : ajout Dropout + L2 + early stopping sur le même CNN fait passer l'accuracy de 0.318 à 0.366 et réduit le sur-apprentissage visible sur les courbes d'entraînement.
- Transfer learning à faible coût : geler les poids d'un DeiT-tiny pré-entraîné sur ImageNet et n'entraîner qu'une tête dense → 0.70 d'accuracy sur 20 classes avec très peu d'epochs.
