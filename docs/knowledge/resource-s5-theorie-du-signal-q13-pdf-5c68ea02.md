---
id: resource-s5-theorie-du-signal-q13-pdf-5c68ea02
slug: resource-s5-theorie-du-signal-q13-pdf-5c68ea02
source_key: 'sha256:5c68ea026b24001dbf43db4eb604c261fd81a896fe77b7bb771de39dbb9a06ae'
part_of: S5 - Théorie du signal
order: 20
manifest: null
derived_from: 'sha256:5c68ea026b24001dbf43db4eb604c261fd81a896fe77b7bb771de39dbb9a06ae'
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
  - amplitude-modulation
  - fourier-transform
  - demodulation
  - synchronous-detection
  - frequency-spectrum
  - convolution
domain: signal-processing
---
# S5 - Théorie du signal — Q13.pdf

## Goal

Maîtriser la modulation d'amplitude (AM) en trois temps : (1) dériver l'expression fréquentielle Y(f) à partir de X(f), (2) tracer le spectre d'amplitude |Y(f)|, (3) retrouver le message original x(t) par détection synchrone. Illustration numérique avec x(t) = cos(2πfMt) et fP = 10·fM.

## Prerequisites

- Transformée de Fourier (TF) et ses propriétés de base
- Propriété de dualité : multiplication en temporel ↔ convolution en fréquentiel
- TF du cosinus : TF{cos(2πf₀t)} = ½[δ(f−f₀) + δ(f+f₀)]
- Propriété de décalage du Dirac : X(f) * δ(f−f₀) = X(f−f₀)

## Steps

**title**: Poser le signal modulé
**detail**: Le signal AM est y(t) = x(t) · cos(2πfPt), où x(t) est le message et fP la fréquence porteuse.
**title**: Passer dans le domaine fréquentiel
**detail**: Utiliser la propriété : multiplication en temporel → convolution en fréquentiel. TF{cos(2πfPt)} = ½[δ(f−fP) + δ(f+fP)], donc Y(f) = X(f) * ½[δ(f−fP) + δ(f+fP)].
**title**: Appliquer la propriété du Dirac
**detail**: La convolution avec δ(f−f₀) décale la fonction de f₀ : Y(f) = ½[X(f−fP) + X(f+fP)]. Le spectre de x(t) est transposé symétriquement autour de ±fP.
**title**: Tracer le spectre |Y(f)|
**detail**: Dessiner deux copies du spectre de X(f), d'amplitude divisée par 2, centrées en +fP et −fP. Pour x(t) = cos(2πfMt) avec fP = 10·fM : raies à ±(fP−fM) et ±(fP+fM), soit ±9fM et ±11fM.
**title**: Détection synchrone — Étape 1 : remultiplication par la porteuse
**detail**: On calcule z(t) = y(t) · cos(2πfPt) = x(t) · cos²(2πfPt). Or cos²(θ) = ½(1 + cos(2θ)), donc z(t) = ½x(t) + ½x(t)·cos(4πfPt).
**title**: Détection synchrone — Étape 2 : filtrage passe-bas
**detail**: Le terme ½x(t)·cos(4πfPt) est centré en ±2fP (haute fréquence). Un filtre passe-bas élimine ce terme et conserve z(t) = ½x(t).
**title**: Détection synchrone — Étape 3 : récupération de x(t)
**detail**: Le signal en sortie du filtre est z(t) = ½x(t). Il suffit de multiplier par 2 pour obtenir x(t) = 2·z(t).

## Result

Y(f) = ½[X(f−fP) + X(f+fP)] : le spectre du message est transposé symétriquement autour de ±fP avec une amplitude divisée par 2. La détection synchrone (remultiplication + filtre passe-bas + gain ×2) permet de retrouver exactement x(t) sans distorsion. Cas numérique fP = 10·fM : raies du spectre à ±9fM et ±11fM.

## Next

- Étudier la détection quadratique (enveloppe) comme alternative à la détection synchrone
- Explorer la modulation de fréquence (FM) et de phase (PM)
- Analyser l'effet du bruit sur la démodulation AM
