---
name: ml-adoption-playbook
description: "Use to add a machine-learning model (recommendation, classification, forecasting, ranking) into an existing non-ML codebase — covering problem framing, data readiness, architectural decoupling, baseline integration, and handoff to MLOps. Do NOT use to design a from-scratch ML research project, to tune an already-integrated model, or when a simple heuristic clearly solves the problem — start with the heuristic instead."
domain: ai
summary: "Adaptive methodology to integrate ML into an existing non-ML project, bridging SWE and MLOps. Phase 1 Framing: heuristic-check first (can a rule solve it faster?), define the business metric and a mistake budget. Phase 2 Data readiness: audit sources, write a data contract (schema + missing-feature behavior), prevent leakage (chronological split for time-series). Phase 3 Decouple: model behind an API/service boundary, graceful fallback to a hardcoded rule on error/timeout, feature-flag the inference for safe rollback. Phase 4 Implement: baseline model first (logistic regression / small linear layer), reproducible (fixed seeds, device-agnostic, documented shapes), tests for transforms + inference schema, eval script vs baseline. Phase 5 Handoff: experiment tracking, model registry, drift detection, CI eval step. Agent workflow: clarify Phase 1 before proposing architecture, draft the data contract for approval, write the decoupling interface BEFORE the training loop, deliver a reproducible artifact-saving script."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/ml-adoption-playbook/SKILL.md -->

# ML Adoption Playbook

## Overview

This skill is the methodology for the most common real-world ML task: adding a model to a codebase that has no ML yet. It bridges traditional software engineering and MLOps by sequencing the work so the risky parts come last — framing and data readiness before any model code, a decoupled and fallback-protected integration boundary before a training loop, a dumb baseline before anything fancy, and a clean handoff to operations once a baseline ships. The recurring discipline is *start simple and decouple*: a heuristic beats an unnecessary model, and a model that can't gracefully fall back to a rule is a liability.

## When to Use / When NOT

Use when:
- A user asks to "add ML" or "add an algorithm" to an existing application.
- Planning to integrate a recommendation, classification, forecasting, or ranking model into a non-ML codebase.
- Structuring an agent workflow to build, train, and deploy an ML component adaptively.

Do NOT use for:
- A from-scratch ML *research* project — this is integration methodology, not experimentation design.
- Tuning or operating a model that is already integrated — that is the MLOps handoff target (`mle-workflow`-style work).
- Problems a simple heuristic clearly solves — the playbook itself says start there.

## Principles

*Source: `affaan-m/ecc skills/ml-adoption-playbook`; aligned with CLAUDE.md §7 (TDD for new domain logic) and the "start simple, prove against a baseline" discipline in `docs/knowledge/skills-reference.md`.*

1. **Heuristic first.** If a rule or regex solves it faster and good-enough, do that — don't add a model for its own sake.
2. **Frame before you build.** Define the business metric the model improves and the mistake budget (what a bad prediction costs and how the system handles it) before writing model code.
3. **Data readiness is a gate, not an afterthought.** A data contract and leakage prevention precede training.
4. **Decouple inference from business logic.** Model lives behind an API/service boundary with a hardcoded-rule fallback and a feature flag for safe rollback.
5. **Baseline before sophistication.** Ship a simple baseline (logistic regression / small linear layer) and never accept a model without an eval script comparing it to that baseline.
6. **Reproducibility is mandatory.** Fixed seeds, device-agnostic code, documented tensor/array shapes, tests on transforms and inference schema.
7. **Sequence the agent's work.** Decoupling interface before training loop; data contract approved before either.

## Process

1. **Phase 1 — Framing & feasibility.** Heuristic check; define the business metric; define the mistake budget and bad-prediction handling. Ask clarifying questions before proposing any architecture.
2. **Phase 2 — Data readiness.** Audit where training data lives; draft a data contract (required features, missing-feature behavior) for user approval; prevent leakage (e.g. chronological split for time-series).
3. **Phase 3 — Architectural integration & decoupling.** Place the model behind an API endpoint or dedicated service class; design a graceful fallback to a hardcoded rule on error/timeout; wrap inference in a feature flag. Write this interface *before* the training loop.
4. **Phase 4 — Model implementation & training.** Build a baseline first; make it reproducible (seeds, device-agnostic, documented shapes); add tests for transforms and inference schema; deliver an eval script comparing the model to the baseline and a script that trains and saves the artifact.
5. **Phase 5 — Handoff to MLOps.** Guide toward experiment tracking, a model registry, and drift detection; add the model-evaluation step to the existing CI so future commits can't silently degrade performance.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Just add the model, ML is the point." | A heuristic may solve it faster. Run the heuristic check first (Phase 1). |
| "We'll figure out the metric later." | Without a business metric and mistake budget you can't tell if the model helps. Frame first. |
| "Wire inference straight into the request handler." | Couple it and you can't roll back or fall back. Decouple behind a boundary + feature flag. |
| "Skip the baseline, go straight to the neural net." | With no baseline you can't prove the fancy model is better. Baseline first, always. |
| "Reproducibility slows me down." | Unseeded, shape-undocumented code is unmaintainable. Fix seeds, document shapes, test transforms. |
| "Split the data randomly, it's fine." | Random splits leak future info in time-series. Use chronological splitting; prevent leakage. |

## Red Flags

- A model is being added without a heuristic check or a defined business metric / mistake budget.
- Model inference is coupled directly into core business logic with no fallback or feature flag.
- No baseline model exists, or the model is accepted with no eval script comparing it to a baseline.
- The data split risks leakage (random split on time-series data).
- Code is non-reproducible: unfixed seeds, undocumented shapes, no tests on transforms/schema.
- The training loop was written before the decoupling interface.

## Verification Criteria (binary pass/fail)

- [ ] Phase 1 produced a heuristic check, a business metric, and a mistake budget before any model code.
- [ ] A data contract (schema + missing-feature behavior) was drafted and leakage prevention applied.
- [ ] Inference sits behind an API/service boundary with a hardcoded-rule fallback and a feature flag.
- [ ] A baseline model exists and an eval script compares the model against it.
- [ ] Code is reproducible (fixed seeds, device-agnostic, documented shapes) with tests on transforms + inference schema.
- [ ] A reproducible script trains the model and saves the artifact.
- [ ] The decoupling interface was written before the training loop.
