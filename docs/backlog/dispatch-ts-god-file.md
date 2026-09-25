# Backlog — `dispatch.ts` is over the §7 line cap (God-file exception)

**Opened** 2026-07-31 · **Status** open · **Owner** next hardening bloc

`packages/agents/src/dispatch.ts` is **690 lines** — **under the cap** since 2026-09-15 (821 that morning): `pauseForRiskGate` moved to `risk-gate.ts`, and the whole produced-diff gate (`gateProducedDiff`, the evaluator-optimizer loop, `findingsBlock`, `OUTPUTS_DIR`) to `diff-gate.ts`, alongside the new §5 path gate. The exception lines in both guard scripts are now dead weight — removing them is the first checkbox below and a one-line PR, over the §7 cap of 800. It is the single
documented exception in both God-file guards (`.claude/hooks/limit-file-size.sh`,
`scripts/check-max-lines.sh`) so the guards could ship green instead of shipping disabled.

**Why it matters** (intake `docs/intake/2026-07-31-god-file-guardrails.md`): the dispatcher is the
one file every mission passes through, and it is exactly the size at which an agent reads a slice
and completes the rest by plausibility. It grew from 739 lines (after PR #42) to 821 without anyone
noticing — the drift the guard now makes visible.

**Definition of done**
- [ ] Split by responsibility (candidates: risk/budget pre-flight · Tier B delegate + review gate ·
      arsenal/skill selection wiring · tick orchestration), each new module carrying one reason to change.
- [ ] Not fifty fragments — Hatton's U-curve: medium modules beat both giant and tiny ones.
- [ ] Remove the `dispatch.ts` exception line from both guard scripts; `bash scripts/check-max-lines.sh` exits 0 without it.
- [ ] 5-check gate green (`pnpm -r test` · `lint` · `build` · `smoke` · Sonar exit 0).
- [ ] `git log` shows behaviour-preserving commits (no test rewritten to fit a move).
