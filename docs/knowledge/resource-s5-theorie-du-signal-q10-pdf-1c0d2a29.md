---
id: resource-s5-theorie-du-signal-q10-pdf-1c0d2a29
slug: resource-s5-theorie-du-signal-q10-pdf-1c0d2a29
source_key: 'sha256:1c0d2a299223b92e235c1a523acff70161657911ead0bd91aa5549ee17759bde'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 17
manifest: null
derived_from: 'sha256:1c0d2a299223b92e235c1a523acff70161657911ead0bd91aa5549ee17759bde'
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
  - signal-theory
  - discrete-convolution
  - impulse-response
  - LSI-systems
  - discrete-time
  - S5
domain: signal-processing
---
# S5 - Théorie du signal — Q10.pdf

## Goal

Calculer le produit de convolution discret s(n) = r(n) * e(n) d'un système LSI, en dérivant d'abord sa réponse impulsionnelle r(n), puis en appliquant la méthode graphique de glissement (sliding) étape par étape.

## Prerequisites

- Notation signal en temps discret : e(n), s(n)
- Impulsion unitaire discrète δ[n] (vaut 1 en n=0, 0 sinon)
- Définition d'un système LSI (Linéaire Stationnaire Invariant) et de sa réponse impulsionnelle
- Formule de convolution discrète : s(n) = Σ r(k)·e(n−k)

## Steps

**step**: 1
**title**: Trouver la réponse impulsionnelle r(n)
**detail**: Injecter l'impulsion unitaire e(n) = δ(n) dans l'équation entrée/sortie s(n) = 2·e(n) − 3·e(n−1) + e(n−2). Comme δ[n]=1 uniquement en n=0, on obtient : s(0)=2, s(1)=−3, s(2)=1, et s(n)=0 ailleurs. La réponse impulsionnelle est r(n) = [2, −3, 1] défini sur n∈{0,1,2}.
**step**: 2
**title**: Réduire les bornes de la somme de convolution
**detail**: La formule générale est s(n) = Σ_{k=−∞}^{+∞} r(k)·e(n−k). Ici r(k)=0 pour k<0 et k>2 (support fini), donc les bornes se réduisent à k∈{0,1,2} : s(n) = Σ_{k=0}^{2} r(k)·e(n−k).
**step**: 3
**title**: Construire la table de glissement graphique
**detail**: Pour l'entrée e(n) = [1,1,1,1] définie sur n∈{0,1,2,3}, construire le tableau avec les lignes r(n₀−k) pour chaque valeur de n₀. À chaque n₀, retourner r(k) → r(−k) puis le décaler de n₀ → r(n₀−k), multiplier point à point avec e(k), et sommer les produits non nuls.
**step**: 4
**title**: Remplir s(n) valeur par valeur
**detail**: n=0 : produit scalaire de r(0−k) et e(k) → 2·1 = 2. n=1 : 2·1+(−3)·1 = −1. n=2 : 2·1+(−3)·1+1·1 = 0. n=3 : idem par symétrie = 0. n=4 : (−3)·1+1·1 = −2. n=5 : 1·1 = 1. Toutes les autres valeurs = 0.
**step**: 5
**title**: Vérification MATLAB
**detail**: La commande `conv([2 -3 1], [1 1 1 1])` retourne le même résultat. La longueur attendue est len(r) + len(e) − 1 = 3 + 4 − 1 = 6 échantillons non nuls.

## Result

s(n) = [2, −1, 0, 0, −2, 1] pour n = 0 à 5 (zéro partout ailleurs). La convolution d'une séquence de longueur M par une séquence de longueur N produit une séquence de longueur M+N−1.

## Next

- Convolution continue (intégrale de convolution)
- Transformée en Z pour traiter la convolution dans le domaine fréquentiel (produit → multiplication)
- Filtrage numérique : FIR et IIR comme applications directes de la convolution discrète
