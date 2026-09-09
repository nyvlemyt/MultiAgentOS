---
id: resource-s7-convex-optimisation-convex-optimization-project-pdf-4c5361d7
slug: resource-s7-convex-optimisation-convex-optimization-project-pdf-4c5361d7
source_key: 'sha256:4c5361d7ed18770b6c021ebf775db22afc530ebc3333c60829f3e20b5ccf1eba'
part_of: resource-s7-convex-optimisation-b4dcec0f
order: 5
manifest: null
derived_from: 'sha256:4c5361d7ed18770b6c021ebf775db22afc530ebc3333c60829f3e20b5ccf1eba'
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
doc_type: howto
actionability: area
lane: workflows
schema_version: '1'
tags:
  - convex-optimization
  - machine-learning
  - academic-project
  - loss-functions
  - SVM
  - SGD
  - neural-networks
  - interior-point
  - quasi-Newton
domain: Applied Mathematics / Machine Learning
---
# S7 - convex optimisation — Convex optimization - Project.pdf

## Problem

Complete the capstone project for the S7 convex optimization course by producing a rigorous, scientifically grounded report that demonstrates command of optimization concepts covered in lectures and lab sessions.

## Solution

Choose one of two subjects, form a group of four, and submit a 10–20-page report plus source code by Sunday 7 June 2026 at 23:59 CEST.

**Subject A — ML application on a real dataset**
1. Pick a task (classification, regression, clustering, recommender system…) and a dataset from UCI ML Repository or Kaggle; validate the choice with the teacher.
2. Select ML algorithms (SVM, SGD, neural networks, etc.) and build/train a model.
3. Evaluate the model, ideally benchmarking against existing published work.
4. Centre the analysis on the **optimization techniques** the algorithms use, not just model accuracy.
5. Discuss loss-function convexity (or lack thereof) and its practical implications.

**Subject B — Theoretical study of a specific convex optimization case**
1. Pick either a class of convex program (quadratic, equality-constrained, SOCP…) or a solution technique (conjugate gradient, quasi-Newton, interior-point…).
2. Explain the mathematical foundations, ins and outs.
3. Survey the state of the art and compare alternative approaches.

## Variations

Subject A focuses on empirical ML work with optimization analysis as the analytical lens; Subject B is a theoretical deep-dive into one optimization case or method. Both require a state-of-the-art comparison, but the comparison target differs (existing models for A, alternative techniques for B).

## Pitfalls

- Treating model accuracy as the primary deliverable — the optimization analysis is the most-weighted criterion; implementation details are explicitly secondary.
- Ignoring non-convexity of loss functions: the brief specifically asks students to explain when and why this arises and how it is addressed.
- Choosing a Kaggle dataset without a clear task definition — tasks on Kaggle 'are not always explicit'; validate with the teacher before starting.
- Exceeding the 20-page limit or falling below 10 pages — report length is a hard constraint.
- Missing the June 7 deadline: report and source code must be submitted together by the teacher-specified channel.
