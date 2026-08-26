---
id: resource-s7-convex-optimisation-convex-optimization-ex2-pdf-355af470
slug: resource-s7-convex-optimisation-convex-optimization-ex2-pdf-355af470
source_key: 'sha256:355af47063c66c80c492f5345812fa188e33f49c15c4629601478668f887e1ef'
part_of: S7 - convex optimisation
order: 4
manifest: null
derived_from: 'sha256:355af47063c66c80c492f5345812fa188e33f49c15c4629601478668f887e1ef'
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
  - linear-programming
  - convex-optimization
  - canonical-form
  - standard-form
  - LP-modeling
  - simplex
  - resource-allocation
domain: operations-research
---
# S7 - convex optimisation — Convex optimization - EX2.pdf

## Goal

Master the complete LP workflow on concrete problems: translate a real-world scenario into a mathematical model → write it in canonical form (≤ inequalities) → convert to standard form (slack variables, equalities) → solve analytically and verify against a known optimum.

## Prerequisites

- Course slides 14–18 (transportation problem statement)
- Exercise sheet I, exercise 1.2 (candy manufacturer LP model already built)
- Familiarity with LP structure: decision variables, objective function, inequality constraints, non-negativity

## Steps

**step**: 1
**title**: Transportation problem — canonical then standard form
**description**: Re-read the transportation problem from slides 14–18. Write it as a canonical LP (minimise/maximise linear objective, ≤ inequality constraints, non-negativity on all variables). Then introduce one slack variable per inequality to produce the standard form (all equality constraints, all variables ≥ 0).
**step**: 2
**title**: Candy manufacturer — solve the LP from sheet I
**description**: Retrieve the LP model built in exercise 1.2 of sheet I (maximise revenue of a candy manufacturer). Apply the appropriate solution method (graphical method for 2 variables, or simplex tableau) to find the optimal basis, optimal solution, and optimal objective value.
**step**: 3
**title**: Industrial laundry — full modeling cycle with verification
**description**: Decision variables: x_A = kg loaded in machine A per cycle, x_B = kg loaded in machine B per cycle. Objective: maximise 0.24·x_A + 0.15·x_B (profit in euros, i.e. 24 and 15 cents/kg). Constraints: x_A ≤ 26 (capacity A), x_B ≤ 32 (capacity B), 600·x_A + 1000·x_B ≤ 36 000 (energy: 10 kWh = 36 000 kJ), 4·x_A + 2·x_B ≤ 128 (water liters), x_A ≥ 0, x_B ≥ 0. (1) Write in canonical form. (2) Add four slack variables to obtain standard form. (3) Solve (graphical or simplex). Verification checkpoint: optimal profit = 840 cents per cycle.
**step**: 4
**title**: 3-variable LP — direct solve
**description**: Maximise 5x₁ + 5x₂ + 3x₃ subject to: 4x₁ + 3x₂ − 2x₃ ≤ 30 ; x₁ − 3x₂ + 2x₃ ≤ 15 ; 3x₁ + 6x₂ + x₃ ≤ 60 ; x₁, x₂, x₃ ≥ 0. Convert to standard form (add s₁, s₂, s₃), set up the simplex tableau, and pivot to the optimal basic feasible solution.

## Result

After completing the four exercises the learner can: (1) identify decision variables and constraints from a narrative description, (2) write any small LP in canonical and standard form without error, (3) execute the simplex method by hand on a problem with up to 3 decision variables, and (4) cross-check solutions against known optima (anchor: 840 cents/cycle for the laundry problem).

## Next

- LP duality — constructing and interpreting the dual problem
- Simplex algorithm: pivot rules, degeneracy, and cycling
- Integer linear programming (branch-and-bound)
