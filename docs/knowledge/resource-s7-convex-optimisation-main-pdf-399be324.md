---
id: resource-s7-convex-optimisation-main-pdf-399be324
slug: resource-s7-convex-optimisation-main-pdf-399be324
source_key: 'sha256:399be324aaa01f5c33d0f434c392f06beee253e10fa6b4fc349e275c8bb02c67'
part_of: resource-s7-convex-optimisation-b4dcec0f
order: 12
manifest: null
derived_from: 'sha256:399be324aaa01f5c33d0f434c392f06beee253e10fa6b4fc349e275c8bb02c67'
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
  - ISTA
  - FISTA
  - proximal-gradient
  - LASSO
  - non-smooth
  - Nesterov-momentum
  - sparse-recovery
  - subdifferential
  - signal-processing
domain: mathematics / optimization
---
# S7 - convex optimisation — main.pdf

## Thesis

Proximal gradient methods — ISTA and FISTA — solve composite convex problems of the form min f(x)+g(x) where f is smooth and g is convex but non-differentiable, a structure that defeats classical gradient descent, Newton, and simplex methods. Their key insight is to split the smooth and non-smooth parts: take a gradient step on f, then apply the proximal operator of g (soft-thresholding for the L1 norm). FISTA adds Nesterov momentum to lift convergence from O(1/k) to the first-order optimal O(1/k²).

## Context

Classical convex optimization guarantees that every local minimum is global ('propriété-or'). Standard solvers however require differentiability (gradient descent, Newton) or linearity (simplex). A wide class of practical problems — LASSO, elastic net, compressed sensing, audio source separation — combines a smooth quadratic data-fidelity term with a non-smooth L1 regulariser that enforces sparsity. When the number of unknowns exceeds the number of measurements (p > n), the system is underdetermined and sparsity is the only well-posing prior. The L1 norm has a corner at 0, precisely where sparse solutions live, making the gradient undefined at the point of interest. This gap motivates the proximal gradient family studied in the report.

## Reasoning

1. **Subdifferential**: Replaces the gradient for non-smooth functions. For a convex f, the subdifferential ∂f(x) is the set of subgradients (supporting hyperplanes). Optimality condition: 0 ∈ ∂F(x★). 2. **Proximal operator**: prox_{tg}(v) = argmin_x { g(x) + (1/2t)‖x−v‖² }. It is non-expansive and well-defined for any convex g. For g = λ‖·‖₁ it reduces to coordinate-wise soft-thresholding: sign(v_i)·max(|v_i|−λt, 0). 3. **ISTA** (Iterative Shrinkage-Thresholding Algorithm): x_{k+1} = prox_{g/L}(x_k − (1/L)∇f(x_k)), step size 1/L where L = ‖A⊤A‖₂. Each iteration costs two matrix-vector products (Ax, A⊤r). Converges at O(1/k) on objective value. 4. **FISTA** (Fast ISTA): wraps ISTA with Nesterov momentum — maintains an extrapolated point y_k = x_k + ((t_{k−1}−1)/t_k)(x_k − x_{k−1}) with t_k = (1+√(1+4t²_{k−1}))/2. Same per-iteration cost as ISTA; converges at O(1/k²), which is optimal for first-order methods. Non-monotone behaviour near the optimum; restart variants fix this. 5. **Convergence to optimal value, not necessarily unique minimiser**: when p > n, A⊤A is not positive-definite so f is not strictly convex; F = f+g admits multiple minimisers sharing the same optimal value F★.

## Trade-offs

| Method | Order | Rate | Cost/iter | Best for |
|---|---|---|---|---|
| ISTA | 1 | O(1/k) | Low — Ax, A⊤r | Simple baseline, general |
| FISTA | 1 | O(1/k²) | Low (same) | Default for medium precision |
| Coord. descent | 1 | Linear (asympt.) | Very low — one coord | Separable g, p≫n, sparse solution |
| ADMM | 1 | O(1/k), ρ-dep. | Medium — linear system | Decomposable / distributed problems |
| Proximal Newton | 2 | Superlinear / quadratic | High — Hessian + inner solver | High precision, moderate size |

Three structural trade-offs: (a) **Speed vs. iteration cost** — Newton and ADMM converge in fewer iterations but each is expensive; ISTA/FISTA bet on cheap iterations and pay in count. In high dimension this bet usually wins. (b) **Generality vs. structure exploitation** — ISTA/FISTA need only ∇f and prox_g; coordinate descent requires g separable; proximal Newton needs exploitable curvature; ADMM needs a convenient decomposition. (c) **Memory and robustness** — ISTA/FISTA have minimal footprint and ISTA is the most predictable; FISTA oscillates (use restart); ADMM is sensitive to ρ; Newton needs good initialisation (warm-start from FISTA). FISTA is the default workhorse: no structural hypothesis beyond f+g separation, no sensitive parameter, minimal cost, optimal first-order rate.

## See also

- LASSO / elastic net
- subdifferential and subgradient methods
- Nesterov acceleration / momentum
- ADMM (Alternating Direction Method of Multipliers)
- coordinate descent / glmnet
- proximal Newton / semi-smooth Newton
- compressed sensing / sparse recovery
- audio source separation (NMF / sparse coding)
