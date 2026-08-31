---
id: resource-2-80d05629
slug: resource-2-80d05629
source_key: 'sha256:80d056298dd00c38b88f5f854de8e1fcbdc1d3df89b572ca6516537ac87afeee'
part_of: null
order: null
manifest: null
derived_from: 'sha256:80d056298dd00c38b88f5f854de8e1fcbdc1d3df89b572ca6516537ac87afeee'
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
  - gradient-descent
  - newton-method
  - unconstrained-optimization
  - machine-learning
  - numerical-methods
domain: mathematics
---
# 2

## Summary

Survey of unconstrained convex optimization algorithms: gradient descent (fixed step, steepest descent, stochastic/mini-batch), Newton's method (Hessian-based quadratic approximation), and penalty methods for constrained problems.

## Fields/API

**name**: Gradient Descent
**description**: Iterative algorithm that moves from the current point in the opposite direction of the gradient. Step size (learning rate) controls precision vs. speed. Stopping criteria: gradient below threshold, max iterations, or slow evolution.
**name**: Steepest Descent Method
**description**: Variant of gradient descent that selects the optimal step size at each iteration by solving a 1D minimization sub-problem (e.g. bisection, secant). Successive displacements are always orthogonal.
**name**: Stochastic Gradient Descent (SGD)
**description**: Approximates the true gradient using individual loss functions (single instance) or subsets (mini-batch) of the training set. Used when full-gradient computation is too expensive, especially in deep learning.
**name**: Newton's Method
**description**: Finds zeros of the gradient by iteratively fitting a linear (tangent) approximation. Applied to the gradient via its Jacobian (= Hessian of f). Each iteration: x_{k+1} = x_k − H(x_k)^{-1} ∇f(x_k). Uses second-order information for faster convergence than gradient descent.
**name**: Hessian Matrix
**description**: Matrix of second partial derivatives of f. Inversion of the Hessian is required for each Newton step; obtained by solving a linear system. A quadratic approximation of f is implied.
**name**: Penalty Methods
**description**: Transforms a constrained problem into an unconstrained one by adding a penalty function p(x) that is 0 when x is admissible and strictly positive otherwise. Resulting unconstrained problem is solved with gradient/Newton methods.

## Constraints

- f must be convex and twice continuously differentiable for these methods to apply cleanly.
- First-order optimality condition: ∇f(x*) = 0 ⟺ x* is a global minimum (convex case only).
- Fixed step size in gradient descent can be too small (slow) or too large (divergent).
- Newton's method requires inverting the Hessian — expensive for high-dimensional problems.
- On non-convex functions, gradient descent may converge to a local minimum only.
- Penalty function p must be continuous, p(x) ≥ 0, and p(x) = 0 iff x is admissible.

## Examples

- Gradient descent on a 2-variable function visualized via contour lines (Oleg Alexandrov, Wikimedia).
- Steepest descent showing orthogonal successive displacements (Chong & Żak textbook).
- Newton's method graphical example: tangent-line approximation converging to a zero (Ralf Pfeifer, Wikimedia).
- SGD in machine learning: objective = (1/N) Σ lᵢ(x); each iteration uses one lᵢ or a mini-batch.
- Penalty function example: p(x) = Σ max(0, gᵢ(x))² for inequality constraints gᵢ(x) ≤ 0.
