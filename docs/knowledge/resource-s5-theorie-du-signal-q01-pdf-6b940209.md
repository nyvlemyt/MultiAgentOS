---
id: resource-s5-theorie-du-signal-q01-pdf-6b940209
slug: resource-s5-theorie-du-signal-q01-pdf-6b940209
source_key: 'sha256:6b9402099a2ec8e623be3183b80d490475626ce9716dc26922b4c7c7e983ae61'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 8
manifest: null
derived_from: 'sha256:6b9402099a2ec8e623be3183b80d490475626ce9716dc26922b4c7c7e983ae61'
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
  - cross-correlation
  - convolution
  - exponential-signals
  - mathematics
  - signal-processing
domain: signal-processing
---
# S5 - Théorie du signal — Q01.pdf

## Goal

Calculer et représenter graphiquement l'intercorrélation et le produit de convolution de deux signaux exponentiels décroissants causaux x(t)=e^{-at} et y(t)=e^{-bt} (a,b>0, t≥0).

## Prerequisites

- Définition d'un signal causal (nul pour t<0)
- Formule d'intercorrélation : Γ_xy(τ) = ∫_{-∞}^{+∞} x(t)·y(t−τ) dt
- Formule de convolution : s(t) = ∫_{-∞}^{+∞} x(τ)·y(t−τ) dτ
- Calcul d'intégrales d'exponentielles

## Steps

**step**: 1
**title**: Intercorrélation — cas τ < 0
**content**: Les deux signaux étant causaux, la borne inférieure est 0. On développe e^{-b(t-τ)} = e^{-bt}·e^{bτ} et on factorise e^{bτ} hors de l'intégrale. L'intégrale ∫_0^{+∞} e^{-(a+b)t} dt converge car a,b>0 et vaut 1/(a+b). Résultat : Γ_xy(τ) = 1/(a+b) · e^{bτ}
**step**: 2
**title**: Intercorrélation — cas τ ≥ 0
**content**: La borne inférieure devient τ (car y(t−τ)=0 pour t<τ). Même développement ; l'intégrale ∫_τ^{+∞} e^{-(a+b)t} dt = e^{-(a+b)τ}/(a+b). En combinant avec e^{bτ} : Γ_xy(τ) = 1/(a+b) · e^{-aτ}
**step**: 3
**title**: Représentation graphique de l'intercorrélation
**content**: Pour τ<0 : courbe croissante exponentielle (e^{bτ}). Pour τ≥0 : courbe décroissante exponentielle (e^{-aτ}). La fonction est continue en τ=0 (valeur commune 1/(a+b)), sans parité (ni paire ni impaire), asymétrique. Pic en τ=0.
**step**: 4
**title**: Convolution — cas t < 0
**content**: x(τ)=0 pour τ<0, donc le produit dans l'intégrale est nul sur tout le support. Résultat : s(t) = 0
**step**: 5
**title**: Convolution — cas t ≥ 0
**content**: L'intégrale s'étend de 0 à t. Développement : ∫_0^t e^{-aτ}·e^{-b(t-τ)} dτ = e^{-bt} ∫_0^t e^{(b-a)τ} dτ. Pour a≠b : s(t) = 1/(b−a) · (e^{-at} − e^{-bt}). Cas limite a=b : s(t) = t·e^{-at}
**step**: 6
**title**: Représentation graphique de la convolution
**content**: Pour t<0 : s(t)=0. Pour t≥0 : différence de deux exponentielles décroissantes, courbe continue, ni paire ni impaire, asymétrique ; part de 0 en t=0, monte puis redescend vers 0. Cas a=b : enveloppe t·e^{-at} avec maximum en t=1/a.
**step**: 7
**title**: Comparaison convolution vs intercorrélation (cas a = b)
**content**: Intercorrélation : Γ_xy(τ) = 1/(2a)·e^{bτ} pour τ<0 et 1/(2a)·e^{-aτ} pour τ≥0 — fonction bilatérale avec pic en 0. Convolution : s(t) = t·e^{-at} pour t≥0 — fonction causale nulle pour t<0, avec un pic décalé à t=1/a. Les deux opérations sont distinctes : l'intercorrélation mesure la similarité en décalage τ, la convolution modélise la réponse d'un système LTI.

## Result

Expressions analytiques par morceaux de Γ_xy(τ) et s(t) pour deux exponentielles causales, avec leurs représentations graphiques continues et asymétriques. Mise en évidence de la différence fondamentale entre les deux opérations, notamment visible lorsque a=b.

## Next

- Étudier l'autocorrélation Γ_xx(τ) (cas x=y) et ses propriétés de symétrie paire
- Passer dans le domaine fréquentiel : densité spectrale de puissance = TF de l'autocorrélation (théorème de Wiener-Khinchin)
- Appliquer la convolution à la réponse impulsionnelle d'un filtre RIF/RII
