---
id: resource-td1-reseaux-730c16d3
slug: resource-td1-reseaux-730c16d3
source_key: 'sha256:730c16d3edbd3e29e2dda091b217382c827c5c8fe1e65475ba868f4783346e3a'
part_of: null
order: null
manifest: null
derived_from: 'sha256:730c16d3edbd3e29e2dda091b217382c827c5c8fe1e65475ba868f4783346e3a'
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
  - réseaux
  - transmission
  - délai
  - fenêtre-glissante
  - protocoles
domain: informatique-réseaux
---
# TD1 – Reseaux

## Summary

Formules et calculs numériques du TD1 Réseaux portant sur le délai d'acheminement (DA), le temps d'émission (Te), le temps de propagation (Tp), et la fenêtre d'émission (W) dans un contexte de transmission point-à-point.

## Fields/API

**paramètres_communs**: **D**: Débit binaire (ex. 10 Mbit/s, 56 kbit/s)
**Vp**: Vitesse de propagation (ex. 200 m/µs)
**Dist**: Distance entre émetteur et récepteur (ex. 80 m)
**Q (ou L)**: Taille de la trame en bits (ex. 256 bits, 1000 bits)
**Qacq**: Taille de la trame d'acquittement en bits (ex. 32 bits)
**W**: Taille de la fenêtre d'émission (nombre de trames)
**Tp**: Temps de propagation = Dist / Vp
**Te**: Temps d'émission = Q / D
**DA**: Délai d'acheminement = Te + Tp
**formules_clés**: **DA_données**: DA = Q_trame / D + Dist / Vp
**DA_acquittement**: DA = Q_acq / D + Dist / Vp
**fenêtre_W**: W trames → durée = W × Te
**TX_fenêtre_glissante**: Tx = DA = 11·Te + 11·Tp + 10·W (exercice 3, formule partielle)

## Constraints

- Les unités doivent être homogènes avant calcul (convertir kbit/s en bit/s, µs en s, etc.).
- Tp = Dist / Vp suppose une propagation unidirectionnelle ; pour un aller-retour, doubler Tp.
- La formule Tx = 11·Te + 11·Tp + 10·W de l'exercice 3 est partielle dans la source — les hypothèses de protocole (nombre de fenêtres, Go-Back-N vs SR) ne sont pas explicitées.
- Qacq (32 bits) contribue à DA retour mais est souvent négligé si Q_acq << Q_trame.

## Examples

**exercice**: 2 — DA trame données
**paramètres**: D=10 Mbit/s, Dist=800 m (note: la source indique 80 m mais calcule 800 m/200 m·µs = 4 µs), Vp=200 m/µs, Q=256 bits
**calcul**: Te = 256/10×10⁶ = 25,6 µs ; Tp = 800/200 = 4 µs ; DA = 29,6 µs
**exercice**: 2 — DA acquittement
**paramètres**: D=10 Mbit/s, Dist=800 m, Qacq=32 bits
**calcul**: Te = 32/10×10⁶ = 3,2 µs ; Tp = 4 µs ; DA = 7,2 µs
**exercice**: 3 — Fenêtre W=5
**paramètres**: D=56 kbit/s, Q=1000 bits, W=5
**calcul**: Te = 1000/56000 ≈ 17,86 ms ; W = 5·Te ≈ 89 ms
**exercice**: 3 — Débit effectif Tx
**paramètres**: Tp=1,x ms (valeur tronquée dans la source), Te≈17,86 ms, W=5
**calcul**: Tx = DA = 11·Te + 11·Tp + 10·W (résultat numérique non disponible car Tp incomplet dans la source)
