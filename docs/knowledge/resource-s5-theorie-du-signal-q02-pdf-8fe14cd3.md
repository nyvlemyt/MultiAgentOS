---
id: resource-s5-theorie-du-signal-q02-pdf-8fe14cd3
slug: resource-s5-theorie-du-signal-q02-pdf-8fe14cd3
source_key: 'sha256:8fe14cd3025b50846f7034ab84a3da46e78ef530af5be2f18c0d8585c8ea3160'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 9
manifest: null
derived_from: 'sha256:8fe14cd3025b50846f7034ab84a3da46e78ef530af5be2f18c0d8585c8ea3160'
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
  - autocorrelation
  - auto-convolution
  - exponential-signal
  - continuous-time
  - worked-example
  - dsp
domain: signal processing
---
# S5 - Théorie du signal — Q02.pdf

## Goal

Calculer et comparer la fonction d'autocorrélation Γxx(τ) et la fonction d'auto-convolution (x*x)(t) d'un signal exponentiel causal x(t) = A·e^(-at)·u(t), avec A=1 et a=1.

## Prerequisites

- Connaissance des intégrales impropres (intégrale de 0 à +∞)
- Propriétés des exponentielles : e^a · e^b = e^(a+b)
- Notion de signal causal (nul pour t < 0)
- Définition de la fonction paire/impaire

## Steps

**step**: 1
**title**: Signal de base
**content**: x(t) = A·e^(-at) pour t ≥ 0, nul sinon (signal exponentiel décroissant causal). Avec A=1, a=1 : x(t) = e^(-t)·u(t).
**step**: 2
**title**: Formule d'autocorrélation
**content**: Γxx(τ) = ∫_{-∞}^{+∞} x(t)·x*(t−τ) dt
**step**: 3
**title**: Calcul pour τ ≥ 0
**content**: Γx(τ) = ∫_0^{+∞} A·e^(-at) · A·e^(-a(t-τ)) dt = A²·e^(aτ) · ∫_0^{+∞} e^(-2at) dt = A²·e^(aτ) · [e^(-2at)/(-2a)]_0^{+∞} = A²·e^(aτ) · (1/(2a)) = (A²/2a)·e^(-aτ)
**step**: 4
**title**: Extension aux τ < 0 par symétrie
**content**: La fonction d'autocorrélation est toujours paire : Γxx(τ) = Γxx(-τ). On en déduit le résultat général : Γxx(τ) = (A²/2a)·e^(-a|τ|). Avec A=1, a=1 : Γxx(τ) = (1/2)·e^(-|τ|).
**step**: 5
**title**: Représentation graphique de Γxx(τ)
**content**: Courbe symétrique en forme de 'chapeau' (double exponentielle décroissante). Pic maximum en τ=0 (corrélation parfaite du signal avec lui-même). Décroissance rapide vers 0 des deux côtés.
**step**: 6
**title**: Formule d'auto-convolution
**content**: (x*x)(t) = ∫_{-∞}^{+∞} x(τ)·x(t−τ) dτ
**step**: 7
**title**: Calcul de l'auto-convolution pour t ≥ 0
**content**: (x*x)(t) = ∫_0^t A·e^(-aτ) · A·e^(-a(t-τ)) dτ = A²·e^(-at) · ∫_0^t e^(-aτ)·e^(aτ) dτ = A²·e^(-at) · ∫_0^t 1 dτ = A²·e^(-at)·t
**step**: 8
**title**: Résultat final de l'auto-convolution
**content**: (x*x)(t) = A²·t·e^(-at) pour t ≥ 0 ; 0 pour t < 0. Avec A=1, a=1 : (x*x)(t) = t·e^(-t)·u(t). Note : x(τ)=0 pour τ<0 et x(t-τ)=0 pour τ>t, ce qui borne l'intégrale à [0, t].
**step**: 9
**title**: Comparaison graphique (A=1, a=1)
**content**: Sur le même graphique : signal de base (vert) = e^(-t), autocorrélation (rouge) = (1/2)e^(-|τ|), auto-convolution (bleu) = t·e^(-t). L'autocorrélation présente la même pente que le signal de base pour t>0. L'auto-convolution démarre à 0, atteint un pic, puis décroît exponentiellement (elle n'est ni paire ni impaire).

## Result

Deux fonctions caractéristiques du signal exponentiel causal x(t)=A·e^(-at)·u(t) :
- **Autocorrélation** : Γxx(τ) = (A²/2a)·e^(-a|τ|) — fonction paire, pic en τ=0, décroissance symétrique.
- **Auto-convolution** : (x*x)(t) = A²·t·e^(-at)·u(t) — fonction ni paire ni impaire, nulle pour t<0, croît puis décroît exponentiellement.

## Next

- Calculer la densité spectrale de puissance (DSP) comme transformée de Fourier de Γxx(τ)
- Étudier la transformée de Laplace de l'auto-convolution via le théorème de convolution
- Généraliser à un signal x(t) = A·e^(-at)·cos(ω₀t)·u(t) (exponentielle modulée)
