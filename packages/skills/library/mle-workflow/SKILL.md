---
name: mle-workflow
description: "Use to turn machine-learning work into a production system: explicit data and prediction contracts, reproducible training, promotion gates, serving packaging, and operational monitoring with a rollback path. Use when building, reviewing, or hardening an ML feature beyond one-off notebooks. Do NOT use for general (non-ML) backend work, for pure data engineering with no model, or for prompt-only LLM features with no training/serving lifecycle."
domain: mlops
summary: "A production ML lifecycle, not a notebook. Six lanes: (1) prediction contract — target, decision owner, output schema, latency, fallback; (2) data contract — entity grain, label timing, point-in-time joins, split policy, snapshot id, leakage guard; (3) reproducible pipeline — typed config, pinned deps, seeds, recorded data SHA/config hash, preprocessing saved with the artifact, idempotent steps; (4) evaluate-before-promotion — baseline + production comparison, guardrail and slice metrics, automated fail-closed promotion gates; (5) serving packaging — versioned artifact, input/output schema validation, timeout/fallback, train/serve parity test, PII-safe logs; (6) operate — system + data + prediction drift monitoring, delayed-label health, rollback to a known-good artifact. Scope-calibrated: use only the lanes the system needs. Returns concrete artifacts (data contract, promotion gates, test/deploy plan) and names unknowns rather than assuming them."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/mle-workflow/SKILL.md -->

# Machine Learning Engineering Workflow

## Overview

Model work becomes a production system only when it has explicit contracts, reproducible training, measurable promotion gates, a testable serving path, and monitoring with a rollback. This skill is that discipline. It treats MLE as software engineering with stricter failure modes — data leakage, train/serve skew, silent drift — rather than as a separate notebook practice. It is scope-calibrated: a small change may only need a data contract, a baseline, an eval script, and a rollback note; do not force heavyweight MLOps machinery onto a problem that does not need it. The output is always a concrete reviewable artifact, never "improve the model."

## When to Use / When NOT

Use when:
- Planning or reviewing a production ML feature, model refresh, ranking/recommender/classifier/forecaster, embedding workflow, or batch/online inference path.
- Converting notebook code into a reusable training/eval/inference pipeline.
- Designing promotion criteria, offline/online evals, or rollback paths.
- Debugging drift, label leakage, stale features, artifact mismatch, or train/serve inconsistency.

Do NOT use when:
- The task is general backend with no model.
- It is pure data engineering (pipelines/ETL) with no prediction surface.
- It is a prompt-only LLM feature with no training/serving lifecycle (the cognition lives elsewhere; ML lifecycle gates do not apply).

## Principles

*Source: `affaan-m/ecc skills/mle-workflow`. Aligned with CLAUDE.md §11 (subscription-only — no per-token cost optimization framing) and the test-driven discipline in `superpowers:test-driven-development`.*

1. **Start from the decision, not the model.** Name the downstream action the prediction changes, who pays for each error class, and the simplest baseline that should be hard to beat.
2. **Guard against leakage first.** If a feature is not available at prediction time, or joins future information, remove it or move it to an analysis-only path before anything else.
3. **Reproducible or it did not happen.** Another engineer must rerun training from code, config, data version, and seed — no hidden notebook state. Preprocessing ships with the artifact.
4. **Promotion gates are automated and fail closed.** Declare "do not ship" thresholds before training finishes; compare against baseline *and* current production, including slice metrics.
5. **Train/serve parity is tested, not assumed.** Training and serving transforms are shared or proven equivalent by a test.
6. **Monitor quality, not just uptime.** Track feature/prediction drift and delayed-label health; every deploy names a rollback artifact and a trigger.
7. **Scope-calibrate.** Use only the lanes the system needs; make missing assumptions (no labels, delayed outcomes, no production traffic) explicit instead of inventing machinery.

## Process

1. **Define the prediction contract.** Target, decision owner, input entity, output schema (with confidence/calibration fields), latency budget, serving mode, fallback when a dependency is down, human-override path for high-impact decisions, and privacy/retention/audit requirements.
2. **Lock the data contract.** Entity grain and key, label definition + timestamp + availability delay, feature timestamp + freshness SLA + point-in-time join rules, train/val/test/backtest split policy, allowed nulls/ranges/categories/units, PII fields banned from artifacts and logs, dataset snapshot id.
3. **Build a reproducible pipeline.** Typed config (dataclasses/config files) for all hyperparameters and paths; pinned deps; set seeds and document nondeterministic GPU behavior; record dataset version, code SHA, config hash, metrics, artifact URI; save preprocessing with the artifact; make every step idempotent.
4. **Evaluate before promotion.** Baseline + production comparison; primary metric tied to product behavior; guardrail metrics (latency, calibration, fairness slices, error concentration); slice metrics for important cohorts; variance/confidence intervals on noisy metrics; human-reviewed failure examples for high-impact models; explicit do-not-ship thresholds enforced by an automated fail-closed gate.
5. **Package for serving.** Versioned artifact carrying training-data reference, config, and preprocessing; input schema that rejects invalid/stale/out-of-range features; output schema with model version and confidence; timeout, batching, resource limits, fallback; explicit CPU/GPU requirements; PII-safe prediction logs with enough identifiers for label joins; integration tests covering missing/stale features, bad types, empty batches, and the fallback path.
6. **Operate the model.** Monitor availability/error/timeout/latency p50–p99; feature null-rate and drift; prediction and confidence distribution drift; label-arrival health and delayed quality; business-KPI guardrails and rollback triggers; per-version dashboards. Every deployment names the previous artifact, config, data dependency, and traffic-switch mechanism.

### Iteration Compact (compress before touching model code)

```text
Goal: / Who cares: / Decision owner:
User or system action changed by the model:
Success metric: / Guardrail metrics: / Mistake budget:
Unacceptable mistakes: / Acceptable mistakes:
Assumptions: / Constraints:
Labels and data snapshot: / Baseline: / Candidate signals:
Threshold or config plan: / Eval slices: / Known risks:
Next experiment: / Rollback or fallback:
```

### Error Analysis Loop (after each baseline/training/threshold change)

1. Split mistakes: false positives, false negatives, abstentions, low-confidence, system failures.
2. Cluster by shared traits (entity, source, time, sparsity, feature freshness, model version).
3. Separate model mistakes from data bugs, label ambiguity, instrumentation gaps, and serving mismatches.
4. Trace each cluster to one move: better labels, better features, better threshold/config, or better product fallback.
5. Preserve every important mistake as a regression test, eval slice, dashboard panel, or runbook entry.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Random split is fine" | A random split leaks future data into val/test. Split by time/entity per the contract. |
| "I'll copy the preprocessing into serving" | Manual copies drift. Share the transform or test equivalence. |
| "Offline AUC went up, ship it" | Offline gain is a gate, not a guarantee — check slices, then shadow/canary. |
| "Improve the model" is the task | Not testable. Tie it to a product behavior and an acceptance gate. |
| "We can add monitoring later" | A model with no drift/label monitoring fails silently in production. |
| "Add a feature store / GPUs to be safe" | Don't add machinery the system doesn't need. Scope-calibrate; make assumptions explicit. |

## Red Flags

- Reproducing the model requires notebook state.
- A feature is joined with information unavailable at prediction time.
- Promotion has no automated, fail-closed gate, or gates were tuned on the test set.
- Model version is missing from prediction logs.
- Monitoring checks uptime only, not feature/prediction drift or delayed labels.
- Rollback requires retraining instead of switching to a known-good artifact.
- PII appears in artifacts, logs, prompts, or examples.

## Verification Criteria

- [ ] Prediction contract is explicit and testable; data contract names grain, label timing, feature timing, and snapshot/version.
- [ ] Leakage was checked against prediction-time availability.
- [ ] Training is reproducible from code, config, data version, and seed; preprocessing ships with the artifact.
- [ ] Promotion gates are automated, fail closed, and compare against baseline and current production with slice metrics.
- [ ] Training and serving transforms are shared or equivalence-tested; serving path validates inputs and has timeout, fallback, and rollback.
- [ ] Monitoring covers system health, feature drift, prediction drift, and delayed labels.
- [ ] Sensitive data is excluded from artifacts, logs, prompts, and examples; unknowns are named, not assumed.
