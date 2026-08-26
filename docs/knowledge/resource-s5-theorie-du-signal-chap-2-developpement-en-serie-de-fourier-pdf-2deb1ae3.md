---
id: >-
  resource-s5-theorie-du-signal-chap-2-developpement-en-serie-de-fourier-pdf-2deb1ae3
slug: >-
  resource-s5-theorie-du-signal-chap-2-developpement-en-serie-de-fourier-pdf-2deb1ae3
source_key: 'sha256:2deb1ae35d1fa60238f3da1ec10f0e40f1bbcd6c87ab43247eee5775195f145a'
part_of: S5 - Théorie du signal
order: 3
manifest: null
derived_from: 'sha256:2deb1ae35d1fa60238f3da1ec10f0e40f1bbcd6c87ab43247eee5775195f145a'
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
  - fourier
  - DSF
  - signal-theory
  - harmonics
  - parseval
  - spectral-analysis
  - exponentielles-complexes
  - produit-scalaire
domain: traitement du signal
---
# S5 - Théorie du signal — Chap 2 - Développement en serie de Fourier.pdf

## Summary

Référentiel complet du Développement en Série de Fourier (DSF) pour signaux T-périodiques : coefficients complexes par projection sur la base des exponentielles, deux formes explicites équivalentes (module/argument et cosinus/sinus), propriétés spectrales de parité, théorème de Parseval. Inclut les exercices TD2 (signal carré, peigne de Dirac, dents de scie, sinus redressé, largeur de bande à 95 %).

## Fields/API

**Décomposition complexe générale**: x(t) = Σ_{k=-∞}^{+∞} λ_k · e^{ikωt}, avec ω = 2π/T
**Coefficient complexe (formule générale)**: λ_n = (1/T) ∫₀ᵀ x(t) · e^{-inωt} dt
**Composante continue (k=0)**: λ_0 = (1/T) ∫₀ᵀ x(t) dt = valeur moyenne de x(t)
**Approximation à l'ordre N**: φ_N(t) = Σ_{k=-N}^{+N} λ_k · e^{ikωt} → x(t) quand N→∞
**Produit scalaire signaux périodiques**: <x,y> = (1/T) ∫₀ᵀ x(t) · y*(t) dt  (mesure de ressemblance)
**Base orthonormée**: {e^{ikωt}, k ∈ [-N,+N]} : <e^{imωt}, e^{inωt}> = 1 si m=n, 0 sinon
**1re forme explicite (module/phase)**: φ_N(t) = λ_0 + 2 Σ_{k=1}^{N} |λ_k| · cos(kωt + θ_k)
**2e forme explicite (cos/sin)**: φ_N(t) = a_0 + Σ_{k=1}^{N} [a_k · cos(kωt) + b_k · sin(kωt)]
**Coefficients réels a_k et b_k**: a_k = (2/T) ∫₀ᵀ x(t)·cos(kωt) dt ;  b_k = (2/T) ∫₀ᵀ x(t)·sin(kωt) dt ;  a_0 = λ_0
**Équivalence formes**: a_k = λ_k + λ_k*  ;  b_k = i(λ_k − λ_k*)  ;  |λ_k|² = (a_k² + b_k²) / 4
**Parité spectrale (symétrie conjuguée)**: |λ_{-n}| = |λ_n| (fonction paire de n) ;  θ_{-n} = −θ_n (fonction impaire de n)  ⟺  λ_{-n} = λ_n*
**Définition harmoniques**: k=0 : composante continue ; k=1 : fondamental (fréquence ω) ; k≥2 : k-ième harmonique
**Théorème de Parseval (puissance)**: P = (1/T)∫₀ᵀ |x(t)|² dt = Σ_{k=-∞}^{+∞} |λ_k|² = λ_0² + 2Σ_{k=1}^{∞}|λ_k|² = a_0² + (1/2)Σ_{k=1}^{∞}(a_k²+b_k²)

## Constraints

- Signal x(t) doit être T-périodique ; ω = 2π/T est la pulsation fondamentale.
- Convergence garantie lim_{N→∞} φ_N(t) = x(t) sous conditions de Dirichlet (implicites dans le cours).
- L'orthogonalité de la base assure que le vecteur d'erreur d(t) = x(t) − φ_N(t) est orthogonal à tout vecteur de l'espace d'arrivée E′.
- La projection minimise la distance ||d|| entre l'approximation et le signal d'origine.
- Parité conjuguée valable uniquement si x(t) est à valeurs réelles.

## Examples

- Q4 — Signal carré : x(t)=1 sur [0,T/2], 0 sur [T/2,T]. Calculer les λ_k, tracer x(t), puis l'approximation avec les 5 premières composantes non nulles.
- Q5 — Peigne de Dirac Ш(t/τ) : représenter graphiquement, rappeler l'expression, développer en DSF et commenter numériquement.
- Q6 — Signal en dents de scie y(t) : modéliser, examiner la parité, développer par 2 méthodes (forme 1 et forme 2), comparer et illustrer avec 5 harmoniques.
- Q7 — Signal z(t) : développer en DSF puis déterminer la largeur de bande minimale contenant 95 % de l'énergie totale (application de Parseval).
- Q8 — Sinus redressé x(t) : développer en DSF, calculer la puissance partielle P3 jusqu'à la 3ème harmonique non nulle, comparer à la puissance totale P.
