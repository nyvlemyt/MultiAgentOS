# Decisions — cluster `skill:core-token` (LOT T2)

Audited 2026-06-18 by Doer ECC Harvest. Source: `affaan-m/ecc` (+ 1 community), inspected RO at `/tmp/ecc-inspect/skills/<slug>/SKILL.md`. Wide-bar rule (intake-audit §7): keep unless dup-no-better / stub / unsafe.

Sanitize (intake-audit §4.bis): full regex scan over all 5 candidates — **0 secrets, 0 PII, 0 home-paths, 0 `@anthropic-ai/sdk`, 0 `ANTHROPIC_API_KEY`**. All clean.

| slug | decision | tier | path |
|------|----------|------|------|
| token-budget-advisor | **adapt_now (KEEP)** | T1 | `packages/skills/library/token-budget-advisor/SKILL.md` |
| strategic-compact | **adapt_now (KEEP)** | T1 | `packages/skills/library/strategic-compact/SKILL.md` |
| evm-token-decimals | **adapt_now (KEEP)** | T2 | `packages/skills/library/evm-token-decimals/SKILL.md` |
| finance-billing-ops | **adapt_now (KEEP)** | T2 | `packages/skills/library/finance-billing-ops/SKILL.md` |
| ecc-tools-cost-audit | **reject** | T0 | — (no library file) |

---

## token-budget-advisor — KEEP (T1)

- **Identity:** community skill (orig. github.com/Xabilimon1/Token-Budget-Advisor-Claude-Code-), vendored into ECC. Offers the user an explicit depth choice (25/50/75/100%) before answering; heuristic token estimation, no real tokenizer.
- **Fit:** user-facing surface of MAS depth control. Maps directly onto TOKEN_STRATEGY §6 (eco/standard/expert) and the §6 signal-density principle. No existing MAS skill does upfront depth negotiation — `mas-skill-router` chooses models, not prose depth. **Not a dup.**
- **3 costs:** install = light (prose-only skill, no script ported). Maintenance = low (heuristic table). Removal = trivial (single file, reversible).
- **KILL check:** no PAYG, no key, no exec, no secret → no veto. Heuristic-only (orig. Python estimator script intentionally NOT ported — kept self-contained per source).
- **Appropriation:** added MAS framing (Essential↔eco, Exhaustive↔expert); hard rule added — depth trims *prose only*, never required deliverables (code/commits/ADRs/UI), aligning with §6 Caveman carve-outs. No agent piloting → no Prompt Defense Baseline needed.
- **Re-audit:** if a real tokenizer becomes available in `packages/core`, revisit step-1 estimation.

## strategic-compact — KEEP (T1)

- **Identity:** ECC skill. Suggests manual `/compact` at logical task seams instead of arbitrary auto-compaction; ships a `suggest-compact.js` PreToolUse hook + settings.json wiring.
- **Fit:** maps onto TOKEN_STRATEGY §5–§8 (window margins, loading rules) and CLAUDE.md §6. Complements `mas-context-manager`/`mas-skill-router` (they decide *what* to reload; this decides *when* to compact). **Not a dup** — no MAS skill governs compaction timing.
- **3 costs:** install = light. Maintenance = low. Removal = trivial.
- **KILL check:** no PAYG/key/secret. The hook script + global `~/.claude/settings.json` install = external-machinery → **stripped** per maintainer-safe rewrite (intake-audit §8). Kept the *lens* (seam-based timing, three-token context signal, survives/lost table); dropped the script-path/hook-install instructions. No remote calls in original → nothing else to strip.
- **Appropriation:** rewrote thresholds as window-scaled guidance, aligned seams to the mission lifecycle (plan→dispatch→review). No agent piloting → no Prompt Defense Baseline.
- **Re-audit:** if MAS implements an in-worker compaction hook, port the deterministic signal as a script under the owning package then.

## evm-token-decimals — KEEP (T2)

- **Identity:** ECC "direct-port adaptation". Prevents silent ERC-20 decimal-mismatch bugs (balances/USD off by orders of magnitude); snippets for web3.py / ethers.js / Solidity WAD normalization.
- **Fit:** crypto vertical — but ATTENTION-FIT resolved as *keep*: it is a real, performant correctness pattern with genuine domain value (not a stub, not niche-trivial), applicable to any crypto project a user registers by path. No MAS equivalent. Read-side only → does not trip a §5 gate by itself.
- **3 costs:** install = light. Maintenance = low (stable ERC-20 ABI). Removal = trivial.
- **KILL check:** no PAYG/key/secret/exec-without-audit. Domain-specific but that is allowed under the arsenal (T2) lane.
- **Appropriation:** added MAS framing (read-side correctness, §5 note that any on-chain *write* still gates); kept all 5 language snippets. Deterministic coding pattern → no agent piloting → no Prompt Defense Baseline.
- **Re-audit:** if no crypto project is ever registered, candidate for prune at next library self-audit.

## finance-billing-ops — KEEP (T2)

- **Identity:** ECC skill. Evidence-first operator billing workflow (revenue snapshot, pricing comparison, refund/duplicate diagnosis, team-billing truth). Broader than per-customer remediation.
- **Fit:** vertical (revenue/pricing/Stripe) with no MAS equivalent; real operator workflow with a disciplined four-register separation. Useful for any SaaS project registered by path. **Not a dup.**
- **3 costs:** install = light. Maintenance = low. Removal = trivial.
- **KILL check:** no PAYG/key/secret. Touches money → but the skill *recommends*, never *executes*; refunds/charges are `risk:blocking` and human-gated (§5). Original referenced ECC-internal sibling skills + live Stripe data — re-framed maintainer-safe (no ECC repo coupling, read-only code inspection, explicit §5 no-execute clause).
- **Appropriation:** added Prompt Defense Baseline (handles money + untrusted billing data → pilot-grade, hardening header applied verbatim per intake-audit §8). Kept the SNAPSHOT/CUSTOMER IMPACT/PRODUCT TRUTH/DECISION/PRODUCT GAP output block.
- **Re-audit:** if MAS adds a finance domain agent, register its actions in `config/permissions.json` and re-link this skill to it.

## ecc-tools-cost-audit — REJECT (T0)

- **Identity:** ECC skill. Operator workflow for auditing the **sibling `ECC-Tools` GitHub App's own** cost/PR-burn/quota-bypass/premium-leakage. Explicitly self-referential: "focused operator workflow for the sibling ECC-Tools repo… not a generic billing skill".
- **Fit:** auto-referent to ECC's own product internals (webhook→queue→worker→PR-creation paths, ECC entitlement gates). The transferable lens (burn-order triage, post-enqueue usage-reservation race, premium-path leakage) is **already covered** by the combination of `mas-sec-reviewer` (risk gating) + the kept `finance-billing-ops` (entitlement/quota truth) + the §8 budget caps. As-is it is tightly coupled to ECC repo structure and a `Skill Stack` of 7 ECC-native skills we do not have.
- **Decision = `reject` (T0).** Rationale per wide-bar rule: **dup-no-better** — its useful lens is subsumed by skills we already keep, and the remainder is ECC-product-specific machinery with no MAS surface. Not a §11 unsafe-reject; not a stub; simply a duplicate-with-no-added-value once coupling is removed.
- **Note (lens preserved):** the one idea worth remembering — *audit cost-burn paths in burn-impact order, and treat post-enqueue usage reservation as a quota race* — is recorded here so it is not re-audited from scratch. If MAS ever builds its own job-queue/worker cost auditor, lift that ordering principle from this note rather than re-importing the skill.
- **Re-audit:** only if MAS gains a webhook/queue/worker billing surface of its own; otherwise permanent reject.
