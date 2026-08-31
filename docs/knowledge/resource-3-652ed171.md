---
id: resource-3-652ed171
slug: resource-3-652ed171
source_key: 'sha256:652ed171e1b7458f521c2d33147749f189dc049646da91631002e5ff4d4908c7'
part_of: null
order: null
manifest: null
derived_from: 'sha256:652ed171e1b7458f521c2d33147749f189dc049646da91631002e5ff4d4908c7'
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
  - linear-programming
  - convex-optimization
  - simplex-algorithm
  - polytope
  - canonical-form
  - standard-form
  - operations-research
domain: mathematics / operations research
---
# 3

## Summary

Linear programming (LP) is a special case of convex optimization where both the objective function and all constraint functions are linear. Because a linear function is simultaneously convex and concave, a local optimum is always global. The feasible set is a convex polytope (intersection of half-spaces), and the optimum—if it exists—always lies at one of its vertices. The simplex algorithm exploits this geometry by moving along vertices in the most improving direction until no improvement is possible.

## Fields/API

**Canonical form**: Minimise c^T x subject to Ax ≤ b, x ≥ 0, where c and b are known coefficient vectors and A is a known coefficient matrix.
**Standard form**: Canonical inequalities are converted to equalities by introducing slack variables s ≥ 0: Ax + s = b. Required to run the simplex algorithm.
**Feasible set**: Intersection of half-spaces defined by the linear constraints; forms a convex polytope. 2-D instance = polygon; 3-D = polyhedron.
**Optimality property**: If an optimum exists on the feasible polytope, it exists at (at least) one vertex. Convexity guarantees any local maximum is also global.
**Simplex — in-base / out-of-base variables**: At each iteration, the current basis expresses in-base variables as functions of out-of-base ones. The objective function is similarly re-expressed in terms of out-of-base variables.
**Simplex — pivot rule**: Select the out-of-base variable with the highest positive coefficient in the objective row as the entering variable. The leaving variable is determined by the tightest positivity constraint (minimum ratio test).
**Simplex table**: Compact matrix representation: rows = constraints + objective row (z-row); columns = all variables + RHS (b). Pivot operations = elementary row operations.

## Constraints

- Optimum exists only if the feasible set is non-empty and the objective is bounded on it.
- All coefficients in the objective row must be non-positive (≤ 0) for the current vertex to be optimal; any strictly positive coefficient means improvement is still possible.
- Slack variables must remain non-negative throughout; the minimum-ratio test enforces this at each pivot.
- The set of optimal solutions may be a single vertex or an entire face (segment or higher-dimensional face) of the polytope.

## Examples

**title**: Engineering-weeks scheduling
**description**: A company allocates engineering weeks between projects A and B to maximise profit. Design capacity: 7 weeks; manufacturing: 11 weeks; quality control: 10 weeks. Project A consumes (2, 2, 3) department-weeks per engineering-week; project B consumes (1, 3, 1). Profit: 6 k€/week for A, 3 k€/week for B.
**canonical_form**: Maximise 6x1 + 3x2 subject to: 2x1+x2≤7, 2x1+3x2≤11, 3x1+x2≤10, x1,x2≥0.
**simplex_solution**: Initial basis: slack variables x3, x4, x5. Iteration 1: x1 enters (coefficient 6), x5 leaves (ratio 10/3 is tightest). Iteration 2: x2 enters (coefficient 1 remains positive), x4 leaves (ratio 13/7). Final basis: x1=3, x2=1 with objective z=21 k€. All objective-row coefficients ≤ 0 → global optimum confirmed.
