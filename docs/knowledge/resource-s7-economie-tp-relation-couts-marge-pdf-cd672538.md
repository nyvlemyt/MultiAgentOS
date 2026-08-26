---
id: resource-s7-economie-tp-relation-couts-marge-pdf-cd672538
slug: resource-s7-economie-tp-relation-couts-marge-pdf-cd672538
source_key: 'sha256:cd67253826ed797146b7b37739e681fb08799abdd9017244f8e4e20d5810f74e'
part_of: S7 - economie
order: 4
manifest: null
derived_from: 'sha256:cd67253826ed797146b7b37739e681fb08799abdd9017244f8e4e20d5810f74e'
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
  - coûts-variables
  - coûts-fixes
  - marge
  - seuil-de-rentabilité
  - économie
  - gestion
  - TP
domain: économie d'entreprise
---
# S7 - economie — TP_Relation_Couts_Marge.pdf

## Goal

Maîtriser le calcul et l'interprétation de la marge sur coûts variables (MSCV), du résultat net et du seuil de rentabilité (SR), en analysant l'impact de variations de coûts ou de prix.

## Prerequisites

- Connaître la distinction coûts fixes / coûts variables
- Savoir calculer un chiffre d'affaires (CA = Prix × Quantité)
- Notion de marge en pourcentage du CA

## Steps

**step**: 1
**title**: Exercice 1 — Jeu à 50 € : situation de référence
**detail**: P=50 €, Cv=15 €, CF=10 000 €, Q=500. CA=25 000 € ; CVT=7 500 € ; MSCV=(50-15)×500=17 500 € ; Résultat=17 500-10 000=7 500 € (marge 30 %).
**step**: 2
**title**: Exercice 1b — Choc sur les coûts variables (+5 €)
**detail**: Cv passe à 20 €. MSCV=(50-20)×500=15 000 € ; Résultat=5 000 € (marge 20 %). La hausse de Cv réduit la marge de 10 points.
**step**: 3
**title**: Exercice 1c — Hausse de prix +20 % (P=60 €)
**detail**: Cas 1 (Cv=15 €) : Résultat=12 500 € (marge 41,7 %). Cas 2 (Cv=20 €) : Résultat=10 000 € (marge 33,3 %). Augmenter le prix compense et au-delà une hausse de coût.
**step**: 4
**title**: Exercice 2 — Licence à 2 000 € : situation de référence
**detail**: P=2 000 €, Cv=500 €, CF=50 000 €, Q=100. MSCV unitaire=1 500 €. Résultat=(1 500×100)-50 000=100 000 € (marge 50 %). SR=50 000/1 500=34 licences.
**step**: 5
**title**: Exercice 2c-d — Cv +40 % (Cv=700 €)
**detail**: MSCV unitaire=1 300 €. Résultat=80 000 € (marge 40 %). SR=50 000/1 300≈39 licences. Le seuil monte : il faut vendre davantage avant d'être rentable.
**step**: 6
**title**: Exercice 2e — Prix +25 % (P=2 500 €, Cv=700 €)
**detail**: MSCV unitaire=1 800 €. Résultat=130 000 € (marge 52 %). SR=50 000/1 800≈28 licences. Levier prix : marge maximisée, SR abaissé.
**step**: 7
**title**: Pistes d'optimisation (synthèse)
**detail**: Réduire Cv : automatisation, CI/CD, QA. Améliorer valeur perçue pour justifier le prix. Rationaliser CF : cloud, licences mutualisées. Fidélisation et upsell pour augmenter Q sans toucher le SR.

## Result

On sait calculer MSCV, Résultat, marge % et SR à partir de P, Cv, CF, Q. On comprend que : (1) toute hausse de Cv érode la marge et monte le SR ; (2) une hausse de prix amplifie la marge plus que proportionnellement si les quantités tiennent ; (3) le SR est le plancher de volume à atteindre pour couvrir les CF.

## Next

- Appliquer ces formules à un compte de résultat réel (analyse charges/produits)
- Étudier l'effet levier opérationnel (sensibilité du résultat à la variation de CA)
- Construire un tableau de bord de pilotage marge/SR dans un tableur
