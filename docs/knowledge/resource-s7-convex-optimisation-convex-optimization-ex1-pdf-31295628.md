---
id: resource-s7-convex-optimisation-convex-optimization-ex1-pdf-31295628
slug: resource-s7-convex-optimisation-convex-optimization-ex1-pdf-31295628
source_key: 'sha256:31295628cd67a50d75c053f07c9ed069bee35d4cb7b0793f36ed011516431681'
part_of: S7 - convex optimisation
order: 3
manifest: null
derived_from: 'sha256:31295628cd67a50d75c053f07c9ed069bee35d4cb7b0793f36ed011516431681'
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
  - convex-optimization
  - linear-programming
  - convexity
  - exercise-sheet
  - mathematics
  - modeling
domain: mathematics
---
# S7 - convex optimisation — Convex optimization - EX1.pdf

## Summary

Exercise sheet 1 for a convex optimization course (Léonard Benedetti, 2023). Four exercises: (1) model a geometric optimization — maximize triangle area under a perimeter constraint ≤ 50 cm; (2) model a candy-production linear program to maximize revenue subject to ingredient stock limits; (3) classify six functions as convex / concave / both / neither; (4) prove half-space convexity and closure of convex sets under intersection, plus empirically solve a transportation problem. No solving is required for Exercise 1–2.

## Fields/API

**name**: Exercise 1a — Geometric optimization (triangle)
**description**: Decision variables: base b and height h. Objective: maximize area = (1/2)·b·h. Constraint: perimeter ≤ 50, where the perimeter lower bound is b + √(4h² + b²), achieved when the triangle is isosceles (proven by symmetry: reflecting B through line L parallel to AB gives AC+CB ≥ AD, equality when C lies on segment AD).
**name**: Exercise 1b — Linear production-mix LP (candy)
**description**: Decision variables: x₁ (units of Type I, €6 each), x₂ (units of Type II, €7 each). Objective: maximize 6x₁ + 7x₂. Ingredient constraints: 2x₁ ≤ 400 (chocolate), 3x₁ + 2x₂ ≤ 900 (sugar), x₁ + 4x₂ ≤ 700 (caramel). Non-negativity: x₁, x₂ ≥ 0.
**name**: Exercise 2 — Convexity / concavity classification
**description**: Six functions to classify with justification: f₁(x)=7x (x∈ℝ); f₂(x)=sin(x) (x∈ℝ); f₃(x,y)=2y−3x ((x,y)∈ℝ²); f₄(x)=|x| (x∈ℝ); f₅(x)=x·log(1/x) (x>0); f₆(x,y)=x²/2+y²/2 ((x,y)∈ℝ²).
**name**: Exercise 3a — Half-space is convex
**description**: Prove {x∈ℝⁿ : aᵀx ≤ b} is convex for a∈ℝⁿ\{0}, b∈ℝ. Standard approach: take any two points x,y in the set and a convex combination λx+(1−λ)y; show aᵀ(λx+(1−λ)y) = λaᵀx+(1−λ)aᵀy ≤ λb+(1−λ)b = b by linearity.
**name**: Exercise 3b — Intersection of convex sets is convex
**description**: Prove ∩ᵢCᵢ is convex when each Cᵢ is convex. Standard approach: for any x,y∈∩ᵢCᵢ, both belong to each Cᵢ; by convexity of each Cᵢ, any convex combination λx+(1−λ)y∈Cᵢ for all i, hence it belongs to the intersection.
**name**: Exercise 4 — Transportation problem (empirical)
**description**: Empirically solve the transportation problem from slides 14–18 (section 1.1) of the course introduction. No formal proof required — practical exploration.

## Constraints

- Triangle: perimeter ≥ b + √(4h²+b²), with equality at isosceles; perimeter bound ≤ 50 cm; b,h > 0
- Candy LP: chocolate 2x₁ ≤ 400; sugar 3x₁+2x₂ ≤ 900; caramel x₁+4x₂ ≤ 700; x₁,x₂ ≥ 0
- Convexity definition relied upon: f convex iff f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y) for all λ∈[0,1]
- Half-space proof requires a ≠ 0 (otherwise the set is all of ℝⁿ, trivially convex)

## Examples

- Isosceles perimeter derivation: B reflected to D through line L parallel to AB; AC+CB = AC+CD ≥ AD; minimum when A, C, D collinear, forcing AC=CB, giving perimeter = b + 2√(h²+(b/2)²) = b + √(4h²+b²)
- f₅(x) = x·log(1/x) = −x·log(x) is the negative entropy function, a standard example in convex analysis
