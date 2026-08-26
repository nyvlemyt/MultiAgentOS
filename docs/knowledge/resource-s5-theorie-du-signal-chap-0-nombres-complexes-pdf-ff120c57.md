---
id: resource-s5-theorie-du-signal-chap-0-nombres-complexes-pdf-ff120c57
slug: resource-s5-theorie-du-signal-chap-0-nombres-complexes-pdf-ff120c57
source_key: 'sha256:ff120c57ad592f35cbc9fe5fa61050d08970117a7a849e614f65f49dcb5e6858'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 1
manifest: null
derived_from: 'sha256:ff120c57ad592f35cbc9fe5fa61050d08970117a7a849e614f65f49dcb5e6858'
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
  - complex-numbers
  - signal-theory
  - mathematics
  - polar-form
  - euler-formula
  - trigonometry
  - phasor
domain: Théorie du signal
---
# S5 - Théorie du signal — Chap 0 - Nombres complexes.pdf

## Summary

Rappel des trois représentations d'un nombre complexe (algébrique, trigonométrique, exponentielle), de leur lecture géométrique dans le plan complexe, et des règles de calcul pour l'addition, la soustraction, le produit et le quotient — avec leurs interprétations géométriques respectives.

## Fields/API

**name**: Forme algébrique
**formula**: z = a + ib
**notes**: a = Re(z) partie réelle, b = Im(z) partie imaginaire, a,b ∈ ℝ, i² = −1. En électronique, i est souvent noté j.
**name**: Conjugué
**formula**: z* = a − ib
**notes**: z·z* = |z|²
**name**: Module
**formula**: |z| = √(a² + b²)
**notes**: Distance à l'origine dans le plan complexe.
**name**: Forme trigonométrique
**formula**: z = ρ(cos θ + i sin θ)
**notes**: ρ = |z|, cos θ = a/ρ, sin θ = b/ρ, tan θ = b/a (a ≠ 0). Valide pour ρ ≠ 0.
**name**: Argument
**formula**: Arg(z) = θ  (mod 2π)
**notes**: Angle polaire, défini modulo 2π.
**name**: Forme exponentielle (Euler)
**formula**: z = ρ·exp(iθ),  avec exp(iθ) = cos θ + i sin θ
**notes**: Forme la plus compacte pour les calculs de produits et quotients.
**name**: Égalité de deux complexes
**formula**: z₁ = z₂  ⟺  Re(z₁) = Re(z₂)  ET  Im(z₁) = Im(z₂)
**notes**: Condition nécessaire et suffisante.
**name**: Addition / soustraction
**formula**: z₁ ± z₂ = (a₁ ± a₂) + i(b₁ ± b₂)
**notes**: Correspond à la somme vectorielle des affixes dans le plan complexe : OM₁ + OM₂.
**name**: Produit
**formula**: z₁·z₂ = ρ₁ρ₂ · exp(i(θ₁+θ₂))
**notes**: |z₁z₂| = |z₁|·|z₂|,  Arg(z₁z₂) = Arg(z₁) + Arg(z₂)  (mod 2π). En forme algébrique : (a₁a₂ − b₁b₂) + i(a₁b₂ + b₁a₂).
**name**: Quotient
**formula**: z₁/z₂ = (ρ₁/ρ₂) · exp(i(θ₁−θ₂))
**notes**: |z₁/z₂| = |z₁|/|z₂|,  Arg(z₁/z₂) = Arg(z₁) − Arg(z₂)  (mod 2π). Valide pour z₂ ≠ 0.
**name**: Multiplication par i
**formula**: z·i = ρ·exp(i(θ + π/2))
**notes**: Transformation géométrique : rotation de +π/2 (90°) dans le plan complexe.

## Constraints

- ρ ≠ 0 pour que l'argument θ soit défini.
- a ≠ 0 pour utiliser tan θ = b/a directement (sinon lire le signe de b).
- z₂ ≠ 0 pour le quotient.
- L'argument est défini modulo 2π — toujours préciser la détermination choisie (souvent θ ∈ ]−π, π]).
- Valeurs remarquables à mémoriser : sin/cos de 0, π/6, π/4, π/3, π/2, π ; les autres s'en déduisent par le cercle trigonométrique.

## Examples

**input**: z₁ = 1 − i√3
**output**: |z₁| = 2,  Arg(z₁) = −π/3,  z₁* = 1 + i√3,  forme exp : 2·exp(−iπ/3)
**input**: z₄ = −2i
**output**: |z₄| = 2,  Arg(z₄) = −π/2,  forme exp : 2·exp(−iπ/2)
**input**: z₆ = −4
**output**: |z₆| = 4,  Arg(z₆) = π,  forme exp : 4·exp(iπ)
**input**: Produit : zₐ = z₁·z₂ avec z₁ = √3+i, z₂ = (1+i)/√2
**output**: |zₐ| = |z₁|·|z₂| = 2·1 = 2,  Arg(zₐ) = π/6 + π/4 = 5π/12,  forme exp : 2·exp(i·5π/12)
**input**: Effet de la multiplication par i sur z_c = (1−i)·i
**output**: Rotation de +π/2 dans le plan complexe : z_c = 1+i,  |z_c| = √2,  Arg = π/4
