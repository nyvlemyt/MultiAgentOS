---
id: resource-s7-deeplearning-062b2dc8
slug: resource-s7-deeplearning-062b2dc8
source_key: 'sha256:062b2dc84aa4fb486ead18cf22fffcdc3a3057bfb95b34114a051a0872defb02'
part_of: null
order: null
manifest: null
derived_from: 'sha256:062b2dc84aa4fb486ead18cf22fffcdc3a3057bfb95b34114a051a0872defb02'
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
  - regularization
  - RNN
  - attention
  - encoder-decoder
  - CNN
  - exam-prep
domain: machine-learning
---
# S7 - deepLearning

## Summary

Cours S7 de Deep Learning couvrant les fondamentaux théoriques et pratiques : rétropropagation, régularisation, réseaux récurrents et mécanismes d'attention, modèles encodeur-décodeur, CNN, ainsi que des ressources de révision et de préparation à l'examen.

## Fields/API

**name**: Backpropagation (CH2)
**description**: Algorithme de calcul des gradients par la règle de la chaîne pour entraîner les réseaux de neurones profonds.
**name**: Regularisation (CH3)
**description**: Techniques pour réduire le surapprentissage : L1/L2 weight decay, dropout, batch normalization, data augmentation.
**name**: RNN & Attention (CH4)
**description**: Réseaux de neurones récurrents (LSTM, GRU) et mécanismes d'attention pour les séquences temporelles et le NLP.
**name**: Encoder-Decoder (CH5)
**description**: Architectures seq2seq avec goulot d'étranglement latent ; base des transformers et des modèles génératifs.
**name**: CNN (PW CNN)
**description**: Travaux pratiques sur les réseaux de neurones convolutifs : couches de convolution, pooling, feature maps.
**name**: Intro To Deep Learning
**description**: Introduction aux perceptrons multicouches, fonctions d'activation, descente de gradient et courbes d'apprentissage.
**name**: Fiches_Revision & Maitrise_4_Notions
**description**: Fiches synthétiques des concepts-clés et des quatre notions prioritaires à maîtriser pour l'examen.
**name**: Prepa_Examen & DE annee derniere
**description**: Annales et guide de préparation à l'examen final de Deep Learning.
**name**: PW_regularisation
**description**: Travaux pratiques appliqués sur les techniques de régularisation.
**name**: Note_explicative_video
**description**: Notes complémentaires liées aux ressources vidéo du cours.

## Constraints

- Contenu académique de niveau Master (S7) — prérequis : algèbre linéaire, calcul différentiel, Python/NumPy.
- Les chapitres sont séquentiels : CH2 → CH3 → CH4 → CH5 ; lire dans l'ordre pour la cohérence conceptuelle.
- Les PW (pratiques) supposent un environnement Python avec PyTorch ou TensorFlow.

## Examples

- Calculer le gradient d'une couche Dense via backpropagation (CH2).
- Appliquer le dropout à un MLP et observer la réduction du surapprentissage (CH3 + PW_regularisation).
- Construire un modèle seq2seq avec attention pour la traduction (CH4 + CH5).
- Implémenter un CNN de classification d'images (PW CNN).
- Réviser les 4 notions-clés avant l'examen (Maitrise_4_Notions_Examen + Fiches_Revision).
