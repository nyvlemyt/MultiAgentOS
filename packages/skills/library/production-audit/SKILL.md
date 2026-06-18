---
name: production-audit
description: "Use to assess whether a shipped or about-to-ship application is production-ready, using local and user-authorized evidence only — pre-launch reviews, post-merge risk passes, and 'what breaks in prod?' questions. Do NOT use during active implementation (use security-review first), for pure libraries/docs repos, for formal compliance audits, or to decide whether to ADD a new dependency/skill (use intake-audit)."
domain: operations
summary: "A local-evidence production-readiness triage that ends in a ship/block recommendation, not a vibe. Gathers cheap signals first (git status/log/diff), then inspects the surfaces that actually exist: auth boundaries, data/migrations, payment/webhooks, background jobs, AI/agent surface, deployment, CI, env docs, and rollback. Applies five risk lenses (security/auth, data integrity, payments/webhooks, operations, UX) and scores 0-100 with hard caps: <=69 if auth missing on sensitive data, webhooks non-idempotent, migrations unsafe, secrets exposed, or no rollback; <=84 if CI is red or the critical path is untested. Output names the blockers, the high-value fixes, the evidence checked, the evidence missing, and one next action. Maintainer-safe: never runs unpinned remote scanners and never uploads repo/secrets to a third-party service. Distinct from intake-audit (decides whether to ADD something) and mas-reviewer (verifies one delivery vs its brief) — this judges ship-readiness of a whole app."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/production-audit/SKILL.md -->

# Production Audit

## Overview

This skill answers "is this ready to ship, and what breaks in prod?" with evidence, a score, and a next action — not a green-CI rubber stamp. It is a maintainer-safe rewrite: it keeps the production-readiness lens and removes the original idea's unpinned remote execution and third-party data upload. All evidence is local or explicitly user-authorized. It is engineering triage, not legal/financial/regulatory certification, and it is distinct from two skills it is easy to confuse it with: `intake-audit` decides whether to *add* a candidate; `mas-reviewer` verifies one delivery against its brief; this skill judges the ship-readiness of a running application end to end.

## When to Use / When NOT

Use when:
- The user asks "is this production-ready", "what would break in prod", "what did we miss", or "ready to ship?".
- A feature was merged and needs a pre-deploy or post-merge risk pass.
- A public launch, customer rollout, demo, or investor walkthrough is close.
- CI is green but the user wants production risk, not just test status.

Do NOT use when:
- Implementation is active and the right lens is line-level secure coding — run `mas-sec-reviewer` / `security-review` first.
- The target is a pure library, template, scaffold, or docs-only repo (unless the ask is packaging/release readiness).
- The user wants formal compliance/regulatory certification.
- The only evidence is an idea with no repo, deployment, CI, or runtime surface.
- The question is "should we adopt X?" — that is `intake-audit`.

## Principles

*Source: `affaan-m/ecc skills/production-audit` (maintainer-safe). Aligned with CLAUDE.md §5 (risky actions gated, no third-party egress) and §8 (local-first). The maintainer-safe-rewrite lens is also the default adaptation in `intake-audit` step 8 — this skill is the standalone ship-readiness application of it.*

1. **Local evidence, no egress.** Never run unpinned remote code, upload source/secrets/customer data to an external audit service, or call external scanners unless the user explicitly approves that specific tool and data flow.
2. **Score to force prioritization, not to imply certainty.** The number exists to rank the fixes; it is bounded by hard caps tied to real failure modes.
3. **Green CI is not readiness.** CI tells you the tests that exist passed; it says nothing about auth, idempotency, or rollback.
4. **Name the evidence and the gaps.** A score with no "evidence checked" / "evidence missing" is unfalsifiable. State what would raise confidence if provided.
5. **End with one next action.** "Let me know what you want to do" is a non-answer; propose the single highest-leverage fix.

## Process

1. **Establish the release surface** — deployed URL, release branch, PR, or current checkout.
2. **Read recent state cheaply** — `git status --short --branch`, `git log --oneline --decorate -20`, `git diff --stat origin/main...HEAD`.
3. **Inspect the surfaces that exist** — package scripts, CI workflows, Docker/deploy manifests, API routes, webhooks, auth middleware, background workers, cron, migrations, env-var docs and startup checks, observability/health checks, and rollback/seed/backfill instructions.
4. **Apply the five risk lenses** (below).
5. **Score with the caps**, then **produce the ship/block recommendation** with blockers, high-value fixes, evidence checked, evidence missing, and one next action.

### Risk Lenses

- **Security & auth** — public/API/admin routes separated; auth + authorization enforced server-side; secrets out of bundles/logs/committed files; rate limits, CSRF, CORS, upload validation where needed; AI/agent surface defends against prompt injection and untrusted content reaching privileged actions.
- **Data integrity** — migrations run forward cleanly with a rollback/recovery plan; destructive migrations/backfills staged safely; DB grants/service-role boundaries match the tenancy model; writes/jobs/webhook handlers are idempotent on retry.
- **Payments & webhooks** — signatures verified before parsing trusted fields; each payment/subscription/fulfillment webhook idempotent; replay/duplicate/out-of-order delivery handled; test vs live credentials separated.
- **Operations** — clean-checkout start from documented commands; required env vars named, validated, fail-fast; health check proves dependencies reachable; deploy/rollback/incident-owner paths documented; logs useful without leaking secrets/PII.
- **User experience** — launch-critical paths covered on desktop and mobile; forms usable on mobile (no input zoom, overlap, blocked submit); loading/empty/error/permission-denied states explain what happened; a recovery path exists when a critical operation fails.

### Scoring

| Band | Score | Meaning |
|---|---|---|
| Blocked | 0-49 | Do not ship until top risks are fixed |
| Risky | 50-69 | Ship only behind a small rollout / internal beta |
| Launchable with caveats | 70-84 | Ship if owners accept the listed risks |
| Strong | 85-100 | No obvious launch blockers from available evidence |

Cap at **69** if any are true: auth/authorization missing on sensitive data; payment/fulfillment webhooks non-idempotent; required migrations cannot run safely; secrets exposed in bundles/logs/committed files; no rollback path for a high-impact release. Cap at **84** if CI is not green or the launch-critical path was not tested end to end.

### Output Format

Lead with one sentence, e.g.: `Production audit: 76/100, launchable with caveats, with webhook idempotency and rollback docs as the two risks to fix before public launch.` Then list `Blockers`, `High-value fixes`, `Evidence checked`, `Evidence missing`, `Next action`. Keep strengths short — the useful answer is the remaining risk and the next step.

## Rationalizations

| Excuse | Reality |
|---|---|
| "CI is green, so it's ready" | CI covers the tests that exist. It says nothing about auth, idempotency, or rollback. Cap at 84 and keep auditing. |
| "Just run npx <scanner>@latest" | Unpinned remote execution is removed here. Audit from local evidence (§5). |
| "Upload the repo to the audit service for a fast score" | Third-party data egress without explicit approval is banned (§5/§8). |
| "Give a score, skip the evidence list" | A score with no evidence is unfalsifiable. Name what was checked and what's missing. |
| "End with 'tell me what you want'" | Propose the single highest-leverage fix as the next action. |

## Red Flags

- The audit path involves running a remote scanner or uploading repo contents off-machine.
- A score was produced without an "evidence checked" section.
- Green CI was treated as production readiness.
- A capping condition (missing auth, non-idempotent webhooks, no rollback) is present but the score exceeds the cap.
- The output ends with a generic "let me know."

## Verification Criteria

- [ ] Evidence was gathered locally / from a user-authorized URL only — no remote scanner, no third-party upload.
- [ ] All five risk lenses were applied to the surfaces that exist.
- [ ] A 0-100 score is given and respects both hard caps (69 and 84).
- [ ] Output names blockers, high-value fixes, evidence checked, evidence missing, and exactly one next action.
- [ ] The recommendation is ship/block-actionable, not a restatement of CI status.
