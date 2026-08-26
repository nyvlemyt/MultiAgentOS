---
id: resource-s5-theorie-du-signal-q08-pdf-c009a7a2
slug: resource-s5-theorie-du-signal-q08-pdf-c009a7a2
source_key: 'sha256:c009a7a21a5c93f955c2d74d7cb60522ce1b069c9f334bf79ecbcd367ee01ea1'
part_of: S5 - Théorie du signal
order: 15
manifest: null
derived_from: 'sha256:c009a7a21a5c93f955c2d74d7cb60522ce1b069c9f334bf79ecbcd367ee01ea1'
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
  - convolution
  - signal-theory
  - DSP
  - mathematics
  - continuous-time
domain: signal processing
---
# S5 - Théorie du signal — Q08.pdf

## Summary

Présentation du produit de convolution en temps continu, avec la formule intégrale générale et les expressions analytiques par morceaux du signal résultant z(t) pour deux signaux rectangulaires x(t) et y(t).

## Fields/API

**définition_intégrale**: z(t) = x(t) * y(t) = ∫_{-∞}^{+∞} x(τ) · y(t − τ) dτ
**résultat_par_morceaux**: **segment_1**: z(t) = 0          (avant le support commun)
**segment_2**: z(t) = t + T       (montée linéaire)
**segment_3**: z(t) = 2T          (plateau constant)
**segment_4**: z(t) = 4T − t      (descente linéaire)
**segment_5**: z(t) = 0           (après le support commun)
**paramètre**: T — demi-durée (ou durée caractéristique) des signaux d'entrée rectangulaires
**domaine_temporel**: temps continu
**opération**: convolution linéaire (∗)

## Constraints

- La formule intégrale suppose des signaux à énergie finie ou des distributions tempérées.
- Le résultat par morceaux s'applique au cas particulier de la convolution de deux portes rectangulaires de durée identique (T).
- Le signal résultant est de forme triangulaire (trapézoïdale si les durées diffèrent), à support compact de longueur 2T.

## Examples

- Convolution de deux rectangles de largeur T : le résultat est une fonction linéaire par morceaux en forme de trapèze (ici triangle si les deux largeurs sont égales), d'amplitude maximale 2T et de support total 2T.
- Phase de montée : z(t) = t + T (croissance linéaire de 0 à 2T).
- Plateau : z(t) = 2T (valeur constante maximale).
- Phase de descente : z(t) = 4T − t (décroissance linéaire de 2T à 0).
