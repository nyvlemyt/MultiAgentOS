---
id: resource-3-d3bc08cc
slug: resource-3-d3bc08cc
source_key: 'sha256:d3bc08cc7486f10d078cfb65c6c0612ccf77bbfadac8af165d797e98d88a6ed4'
part_of: null
order: null
manifest: null
derived_from: 'sha256:d3bc08cc7486f10d078cfb65c6c0612ccf77bbfadac8af165d797e98d88a6ed4'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - convex-optimization
  - optimization
  - convexity
  - convex-set
  - convex-function
  - machine-learning
  - mathematics
  - operations-research
domain: mathematics
---
# 3

## Thesis

Convex optimization is the broadest tractable class of optimization problems: minimize (or maximize) a real objective function over a feasible set, subject to the dual condition that the objective is a convex function and the feasible set is a convex set. This structural property guarantees that any local minimum is also a global minimum, making the problem efficiently solvable without risk of being trapped in sub-optimal hollows.

## Context

Optimization — selecting the best element from a set of alternatives under some criterion — appears across economics (profit maximization), engineering (error minimization), operations research (cost minimization), and machine learning (minimizing discrepancy between model and ground truth). A problem is modeled by identifying three elements: the optimization variables (quantities to determine), the objective function (value to minimize or maximize), and the feasible set (constraints on those variables, typically expressed as inequality constraints f_i(x) ≤ b_i over a vector space). Two worked examples illustrate modeling: (1) maximizing rectangle area subject to a perimeter constraint; (2) minimizing aluminum transport cost from 3 warehouses to 2 fuselage sites subject to supply, demand, and non-negativity constraints.

## Reasoning

Convexity is defined in two parallel ways. A set C is convex iff for every pair of points in C, the entire line segment joining them lies in C (no hollows or bumps). Key property: half-spaces are convex, and the intersection of convex sets is convex. A function f is convex iff for every pair of points on its graph, the chord lies on or above the graph — formally f(λx + (1−λ)y) ≤ λf(x) + (1−λ)f(y) for λ∈[0,1]. Equivalent characterizations: (i) the epigraph (set of points on or above the graph) is a convex set; (ii) for a twice-differentiable univariate function, f''(x) ≥ 0 everywhere; (iii) midpoint convexity + continuity implies convexity. The gold property follows directly: a local minimum of a convex function is a global minimum. Concave functions are the symmetric counterpart (−f convex); maximizing a concave function is equivalent to minimizing a convex one.

## Trade-offs

Convex problems are computationally privileged: solvers are efficient, convergence is guaranteed, and the solution is globally optimal. Non-convex problems lack this guarantee — multiple local minima exist, and algorithms may converge to sub-optimal solutions depending on initialization. The practical challenge is therefore modeling: whether a real-world problem can be cast as convex (choice of variables, objective, and constraint form) determines which solver class applies and what guarantees are achievable.

## See also

- linear programming
- gradient descent
- Lagrangian duality
- epigraph
- feasible set
- KKT conditions
