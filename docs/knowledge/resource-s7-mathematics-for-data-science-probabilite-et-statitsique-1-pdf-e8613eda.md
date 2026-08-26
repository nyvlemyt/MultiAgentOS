---
id: >-
  resource-s7-mathematics-for-data-science-probabilite-et-statitsique-1-pdf-e8613eda
slug: >-
  resource-s7-mathematics-for-data-science-probabilite-et-statitsique-1-pdf-e8613eda
source_key: 'sha256:e8613edafa79879b6d87b17740cd4290c6c1ce6c1331c98d222658c0d14656ea'
part_of: S7 - Mathematics for Data Science
order: 3
manifest: null
derived_from: 'sha256:e8613edafa79879b6d87b17740cd4290c6c1ce6c1331c98d222658c0d14656ea'
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
  - probability
  - statistics
  - random-variables
  - normal-distribution
  - confidence-intervals
  - hypothesis-testing
  - chi-squared
  - MLE
  - central-limit-theorem
  - bayes
  - data-science
  - mathematics
domain: Mathematics for Data Science
---
# S7 - Mathematics for Data Science — Probabilité_et_Statitsique-1.pdf

## Summary

Complete lecture reference for Probability & Statistics (S7, Ahmad TAY). Covers three blocks: (1) Probability Theory — measurable spaces, σ-algebras, probability axioms, conditional probability, Bayes theorems, independence; (2) Probability Models — discrete RVs (PMF, CDF, expectation, variance), continuous RVs (density function, CDF), Normal N(µ,σ²) and Standard Normal N(0,1), Moivre-Laplace theorem; (3) Statistical Inference — sampling, Law of Large Numbers, Central Limit Theorem, point estimators, MLE for the Normal distribution, confidence intervals (Z, t, χ²), parametric tests (one-sample Z/t/χ², two-sample Z/t/F), and non-parametric chi-squared tests (goodness-of-fit and contingency table independence).

## Fields/API

**name**: Probability Space
**definition**: Triple (Ω, A, P): Ω = sample space, A = σ-algebra of events (closed under complement and countable union), P: A → [0,1] with P(Ω)=1 and σ-additivity on disjoint events.
**name**: Conditional Probability
**definition**: P(A|B) = P(A∩B)/P(B) for P(B)>0. Chain rule: P(A∩B) = P(A|B)P(B). Total probability: P(A) = Σ P(A|Bₙ)P(Bₙ) over a partition (Bₙ). Independence: P(A∩B) = P(A)P(B).
**name**: Bayes Theorems
**definition**: First: P(B|A) = P(A|B)P(B)/P(A). Second (full): P(Bᵢ|A) = P(A|Bᵢ)P(Bᵢ) / Σₙ P(A|Bₙ)P(Bₙ), for a partition (Bₙ).
**name**: Discrete Random Variable
**definition**: X is discrete if X(Ω) is finite or countable. Defined by PMF p(xᵢ) = P(X=xᵢ) ≥ 0 with Σp(xᵢ)=1. CDF: F(a) = Σ_{xᵢ≤a} p(xᵢ), a staircase right-continuous function with limits 0 and 1.
**name**: Expected Value (Discrete)
**definition**: E(X) = Σᵢ xᵢ p(xᵢ). For a function g: E(g(X)) = Σᵢ g(xᵢ)p(xᵢ). Note: E(g(X)) ≠ g(E(X)) in general.
**name**: Variance
**definition**: V(X) = E[(X−E(X))²] = E(X²) − [E(X)]². Measures dispersion of X around its mean.
**name**: Continuous Random Variable
**definition**: X has density f if P(X∈B) = ∫_B f(x)dx for any Borel set B. Requires f(x)≥0 and ∫_{-∞}^{+∞} f(x)dx=1. P(X=a)=0 for any single point. CDF: F(a) = ∫_{-∞}^{a} f(x)dx; F'(x)=f(x).
**name**: Normal Distribution N(µ,σ²)
**definition**: f(x) = (1/σ√(2π)) exp(−(x−µ)²/2σ²). E(X)=µ, V(X)=σ². Bell-shaped, symmetric about µ. Stability: X₁~N(µ₁,σ₁²) + X₂~N(µ₂,σ₂²) independent ⟹ X₁+X₂~N(µ₁+µ₂, σ₁²+σ₂²). Standardisation: Z=(X−µ)/σ ~ N(0,1).
**name**: Standard Normal CDF Φ
**definition**: Φ(x)=P(Z≤x) for Z~N(0,1). Properties: Φ(x)+Φ(−x)=1; Φ(x)−Φ(−x)=2Φ(x)−1. Read from table: e.g. Φ(1.23)≈0.8907.
**name**: Law of Large Numbers (LFGN)
**definition**: For i.i.d. Xᵢ with E[Xᵢ]=µ: X̄ₙ = (1/n)Σᵢ Xᵢ → µ almost surely as n→∞.
**name**: Central Limit Theorem (TCL)
**definition**: For i.i.d. Xᵢ with E[Xᵢ]=µ, Var(Xᵢ)=σ²: (Σᵢ Xᵢ − nµ)/√(nσ²) →_d N(0,1). Equivalently X̄ₙ ≈ N(µ, σ²/n) for large n.
**name**: Point Estimator
**definition**: A statistic (function of sample data) that estimates a population parameter. The sample mean x̄ estimates µ; sample variance s² estimates σ². An estimator is a random variable; an estimation is its realised value.
**name**: Maximum Likelihood Estimation (MLE)
**definition**: Find θ̂ maximising L(θ;x)=∏ᵢf(xᵢ;θ). For N(µ,σ²): µ̂=x̄ (sample mean), σ̂²=(1/n)Σ(xᵢ−µ̂)² (biased sample variance).
**name**: Confidence Intervals
**definition**: Variance known: X̄ ± Z_{α/2} · σ/√n (Z from N(0,1)). Variance unknown: X̄ ± t_{α/2,n−1} · S/√n (t from Student with n−1 df). For variance σ²: [(n−1)S²/χ²_{α/2,n−1}, (n−1)S²/χ²_{1−α/2,n−1}].
**name**: Parametric Tests — One Sample
**definition**: Mean (σ known): Z=(X̄−µ₀)/(σ/√n) ~ N(0,1). Mean (σ unknown): t=(X̄−µ₀)/(s/√n) ~ t_{n−1}. Variance: χ²=(n−1)s²/σ₀² ~ χ²_{n−1}.
**name**: Parametric Tests — Two Samples
**definition**: Means (σ known): Z=[(X̄₁−X̄₂)−(µ₁−µ₂)] / √(σ₁²/n₁+σ₂²/n₂). Means (σ unknown, pooled): t=(X̄₁−X̄₂) / [Sₚ√(1/n₁+1/n₂)], df=n₁+n₂−2. Variances (F-test): F=s₁²/s₂² ~ F(n₁−1,n₂−1).
**name**: Chi-Squared Tests (Non-Parametric)
**definition**: Goodness-of-fit: χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ ~ χ²_{k−1}, where k = number of categories. Independence (contingency table): χ²=ΣᵢΣⱼ(Oᵢⱼ−Eᵢⱼ)²/Eᵢⱼ ~ χ²_{(r−1)(c−1)}, with Eᵢⱼ=(row total × col total)/grand total.

## Constraints

- σ-algebra A must contain Ω, be closed under complement, and closed under countable unions.
- Probability P requires non-negativity, P(Ω)=1, and σ-additivity on pairwise disjoint events.
- Conditional probability P(A|B) requires P(B)>0.
- Density function f must satisfy f(x)≥0 and ∫f(x)dx=1; P(X=a)=0 for any single point a.
- MLE variance estimator σ̂²=(1/n)Σ(xᵢ−µ̂)² is biased (divides by n, not n−1).
- CLT requires i.i.d. observations with finite mean and variance; approximation improves with n.
- t-distribution CIs and tests require the underlying population to be normally distributed.
- Chi-squared goodness-of-fit requires expected frequencies Eᵢ sufficiently large (typically ≥5).
- F-test for variance equality assumes both samples are independent and normally distributed.

## Examples

**label**: Discrete RV — dice earnings
**description**: Fair die: earn €1 on {1,3,5}, €5 on {2,4}, lose €10 on {6}. PMF: P(X=1)=1/2, P(X=5)=1/3, P(X=−10)=1/6.
**label**: CDF — coin flips
**description**: X = number of tails in 3 fair coin flips. P(X=k): 1/8, 3/8, 3/8, 1/8 for k=0,1,2,3. CDF steps: F(0)=1/8, F(1)=1/2, F(2)=7/8, F(3)=1.
**label**: Variance — fair die
**description**: E(X)=7/2, E(X²)=91/6, V(X)=91/6−(7/2)²=35/12.
**label**: MLE — sample (2,4,4,4,5,5,7,9)
**description**: µ̂ = 40/8 = 5. σ̂² = (9+1+1+1+0+0+4+16)/8 = 32/8 = 4.
**label**: 95% CI — mean known variance
**description**: n=25, X̄=50, σ²=16: 50 ± 1.96 × 4/5 = (48.432, 51.568).
**label**: 95% CI — mean unknown variance
**description**: n=10, X̄=100, S=15, t_{0.025,9}≈2.262: 100 ± 2.262×15/√10 = (89.27, 110.73).
**label**: χ² goodness-of-fit — balanced die
**description**: 60 rolls, O={12,8,10,14,9,7}, E={10,…,10}. χ²=3.4 < χ²_{0.05,5}=11.07 → fail to reject H₀ (die appears balanced).
**label**: χ² independence — gender × product preference
**description**: 2×2 table (n=100), all Eᵢⱼ=25. χ²=4 > χ²_{0.05,1}=3.841 → reject H₀, significant association between gender and product preference.
