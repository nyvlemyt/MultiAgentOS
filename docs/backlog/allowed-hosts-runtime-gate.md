# Backlog — `allowed_hosts` allowlist is schema-only (declared §5 control, never enforced)

**Source**: 0d auto-audit scan, 2026-06-25 (adversarially verified, 2 real votes). Finding `S5-2` (MED). Scan output: `tasks/w8omnh3ai.output` §confirmedFindings.

## What

CLAUDE.md §5 lists "network calls to hosts not in `config/permissions.json#allowed_hosts`" as an always-gated risky action. But `allowed_hosts` exists only as a Zod field + default in [permissions.ts:15](../../packages/core/src/permissions.ts#L15) — **no runtime code reads it** to gate outbound network calls.

Same class of inert-control bug as the perms-category wiring fixed in PR #44 (`classifyRisk` wasn't being handed the config): a §5 control is declared but the enforcement path is missing, so it ships silently dead and would give false confidence the day a host allowlist is actually configured.

## Why it's only backlog, not a fix-now

- Inert today: the default allowlist is empty and no agent issues raw outbound network calls yet (providers go through the router; Claude execution through the Agent SDK).
- Becomes load-bearing only when a domain agent (email, finance, web-fetch) makes direct outbound calls — same trigger as the permissions categories.

## What to do (when picked up — alongside the first outbound-calling domain agent)

1. Add a host-check seam at the single outbound boundary (wherever a domain agent would `fetch`/send): resolve the target host, compare against `perms.allowed_hosts`, and route a miss through the §5 gate (pause-for-validation), mirroring how `classifyRisk` now consumes `perms` (PR #44).
2. TDD: a task targeting a non-allowlisted host pauses at the §5 gate; an allowlisted host passes.
3. Cross-check the other §5 controls flagged prompt-only by the scan (`S5-1` cross-project write guard, refuted as already partly enforced) so wiring stays consistent.
