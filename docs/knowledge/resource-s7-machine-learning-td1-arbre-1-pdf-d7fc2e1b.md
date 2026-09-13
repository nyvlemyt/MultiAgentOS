---
id: resource-s7-machine-learning-td1-arbre-1-pdf-d7fc2e1b
slug: resource-s7-machine-learning-td1-arbre-1-pdf-d7fc2e1b
source_key: 'sha256:d7fc2e1b1de83a5d9ecde9c1ddf4318d89654af52c328ce4a1df9b7fc2815295'
part_of: resource-s7-machine-learning-f79ea225
order: 1
manifest: null
derived_from: 'sha256:d7fc2e1b1de83a5d9ecde9c1ddf4318d89654af52c328ce4a1df9b7fc2815295'
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
  - decision-tree
  - ID3
  - entropy
  - missing-values
  - imputation
  - classification
  - machine-learning
domain: machine learning
---
# S7 - machine learning — TD1_Arbre (1).pdf

## Goal

Construire un arbre de décision ID3 sur un jeu de données contenant des valeurs manquantes, en appliquant deux stratégies d'imputation et en évaluant si un arbre parfait est atteignable dans chaque cas.

## Prerequisites

- Notion d'entropie et de gain d'information (formule H = -Σ p·log₂p)
- Principe de l'algorithme ID3 (sélection de l'attribut de plus grand gain à chaque nœud)
- Compréhension d'un problème de classification binaire (classe 0 / 1)

## Steps

- Identifier les valeurs manquantes : exemples 2 (Clio, ?, noir, classe 1) et 5 (BMW, ?, noir, classe 1) — l'attribut Modèle est manquant pour ces deux instances.
- Stratégie 1 — valeur majoritaire globale : compter les occurrences de Modèle sur l'échantillon complet (hors '?'). Ancien : 3 fois (ex. 1, 3, 10) ; Nouveau : 5 fois (ex. 4, 6, 7, 8, 9). Valeur majoritaire = Nouveau → imputer les deux exemples manquants comme Nouveau.
- Avec la stratégie 1, vérifier si le jeu de données imputé est séparable sans conflit (même combinaison d'attributs, classes différentes). Construire l'arbre ID3 : calculer H(S), puis le gain de chaque attribut à la racine ; partitionner récursivement jusqu'aux feuilles pures ou à l'épuisement des attributs.
- Stratégie 2 — valeur majoritaire par classe : pour la classe 1, compter Modèle hors '?' → Ancien : 3 (ex. 1, 3, 10), Nouveau : 2 (ex. 7, 9). Majorité classe 1 = Ancien. Pour la classe 0, tous les modèles sont Nouveau. Imputer ex. 2 et 5 (classe 1) comme Ancien.
- Avec la stratégie 2, répéter l'analyse de séparabilité et construire l'arbre ID3 en appliquant la même procédure de calcul d'entropie et de gain d'information.

## Result

Deux arbres de décision distincts, un par stratégie d'imputation. La stratégie 1 (Nouveau pour les deux manquants) peut introduire des conflits selon la distribution finale ; la stratégie 2 (Ancien pour les manquants de classe 1) préserve mieux la cohérence intra-classe et favorise l'obtention d'un arbre parfait. La comparaison illustre l'impact de la méthode d'imputation sur la structure et la précision de l'arbre.

## Next

- Comparer la profondeur et le nombre de feuilles des deux arbres obtenus
- Évaluer le sur-apprentissage potentiel (arbre parfait sur entraînement ≠ bonne généralisation)
- Explorer l'élagage (pruning) et les critères d'arrêt anticipé
- Tester d'autres algorithmes (C4.5, CART) qui gèrent nativement les valeurs manquantes
