---
name: scholar-evaluation
description: |
  Use to evaluate a single scholarly artifact (paper, proposal, thesis chapter, literature review, methods
  section) against a repeatable 9-dimension rubric: problem clarity, prior-work coverage, methodology,
  data/evidence, analysis, results/interpretation, limitations, writing, and citation support. Trigger when
  asked to assess research quality, check whether claims are backed by cited evidence, or produce
  structured revision feedback.
  Do NOT use to find/synthesize a body of literature (that is literature-review), to evaluate an agent/model
  (agent-eval / agent-self-evaluation), or to gate a mission deliverable against its brief (mas-reviewer).
summary: "Repeatable rubric evaluation of one scholarly artifact. Identify artifact + scope (comprehensive/targeted/comparative) → score 9 dimensions 1-5 (or N/A) with cited evidence → check strongest claims against their sources → separate critical blockers from revision suggestions → end with concrete next edits. Output = scored table + critical issues + recommended revisions. Distinct from literature-review (synthesizes many sources) and mas-reviewer (gates a mission output)."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/scientific-thinking-scholar-evaluation/SKILL.md -->

# Scholar Evaluation

## Overview

Evaluates a single scholarly artifact — paper, proposal, thesis chapter, methods or literature-review section — against a repeatable 9-dimension rubric, producing evidence-backed scores and concrete revision priorities rather than a vibe rating. Use it when the task is to judge one artifact's quality or check whether its claims are supported by their sources, as opposed to synthesizing many sources or gating a mission deliverable.

## When to Use

- Reviewing a research paper, proposal, thesis chapter, or literature review.
- Checking whether claims are supported by the evidence cited for them.
- Evaluating methodology, study design, analysis, or limitations.
- Comparing two or more works against the same rubric.
- Producing structured feedback for revision.

## When NOT to Use

- Finding and synthesizing a body of literature — that is `literature-review`.
- Evaluating an agent's or model's behavior — that is `agent-eval` / `agent-self-evaluation`.
- Gating a mission deliverable against its brief — that is `mas-reviewer`.

## Principles

*Source: `affaan-m/ecc` scientific-thinking-scholar-evaluation + CLAUDE.md §12 (evidence over assertion).*

1. **Evidence per score.** A dimension score is meaningless without the passage or check that justifies it. Cite, don't assert.
2. **Score is a pointer, not a verdict.** The number routes attention to revision priorities; the concrete next edits are the actual value.
3. **Scope honestly.** Do not penalize a paper for omitting a dimension outside its declared scope; mark it `N/A`.
4. **Authority is not quality.** Citation count, venue prestige, and author reputation are not evidence of correctness.
5. **Test the strongest claims.** Verify the load-bearing claims against their cited sources before scoring; that is where validity breaks.

## Process

1. **Identify the artifact** (empirical paper, theoretical paper, technical report, systematic/narrative review, proposal, thesis chapter, conference abstract) and pick scope: comprehensive (all dimensions), targeted (one or two), or comparative (rank multiple works on the same rubric).
2. **Read for contribution then evidence.** Abstract, intro, figures, conclusion for the claimed contribution; methods and results for evidence quality.
3. **Check the strongest claims** against their cited sources — does the source actually support the claim attached to it?
4. **Score each applicable dimension 1-5** (5 publication-ready · 4 minor fixes · 3 usable with gaps · 2 substantial revision · 1 major validity/clarity problems), `N/A` when out of scope:
   1. Problem & research question — clear, specific, meaningful, matches the claimed contribution.
   2. Literature & context — relevant prior work synthesized (not listed), gaps accurate, recent/foundational balance.
   3. Methodology — answers the question, choices justified, materials described, reproducible, constraints acknowledged.
   4. Data & evidence — credible sources, adequate sample/corpus, documented inclusion/preprocessing, bias/missing-data discussed.
   5. Analysis — appropriate methods, fair baselines/controls, uncertainty/robustness checks, alternatives considered.
   6. Results & interpretation — clear presentation, claims within evidence, readable figures/metrics, honest null results.
   7. Limitations & threats to validity — specific (not generic), internal/external/construct/conclusion validity, speculation vs demonstrated separated.
   8. Writing & structure — followable argument, organized around the question, clear definitions/notation.
   9. Citations — sources support attached claims, primary sources preferred, reviews/preprints labeled, metadata/links correct.
5. **Separate critical blockers from revision suggestions** — a clarity nit and a fatal validity flaw are not the same priority.
6. **End with concrete next edits** the author can act on.

Output template: `# Scholar Evaluation: <Artifact>` with Overall Assessment (score · confidence · 3-5 sentence summary), a Dimension Scores table (Dimension | Score | Evidence | Revision priority), Critical Issues, Recommended Revisions, and Evidence Checks Needed.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "It's published in a top venue, score it high" | Venue is not validity. Score the work, not the logo. |
| "The score says it all, skip the prose" | A bare score gives the author nothing to fix. Concrete edits are the deliverable. |
| "The abstract claims this, mark it supported" | Verify against the body — abstracts overstate. |
| "This dimension doesn't fit, I'll guess a low score" | Out-of-scope = `N/A`, not a penalty. |
| "Comparing two papers, I'll eyeball which is better" | Comparative scope means the *same rubric* applied to each, then ranked on evidence. |
| "The claim is uncited but plausible, let it pass" | Unsupported claims are findings, not free passes. |

## Red Flags — stop and reconsider

- A dimension has a score but no cited evidence.
- The strongest claim in the work was never checked against its source.
- The evaluation rewards venue, author, or citation count.
- A paper is penalized for omitting something outside its declared scope.
- The output is all scores and no actionable revision.

## Verification Criteria (binary)

- [ ] Artifact type and evaluation scope are stated up front.
- [ ] Every applicable dimension has a 1-5 score with cited evidence; out-of-scope dimensions are `N/A`.
- [ ] At least the load-bearing claims were checked against their cited sources.
- [ ] Critical blockers are separated from revision suggestions.
- [ ] The output ends with concrete, actionable next edits.
- [ ] No score is justified by venue, author reputation, or citation count alone.
