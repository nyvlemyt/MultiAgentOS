# Phase 2 — Zero-PAYG Verification

Captures taken 2026-05-28 on branch `phase/2-claude-code-bridge` at commit `ef2ede2`.

## Artefacts

| File | Status | Description |
|------|--------|-------------|
| `01-anthropic-console-zero-spend.png` | **Manual capture required** | Anthropic Console Usage tab — must show $0.00 API spend during/after seed run. Proves PAYG bleed = 0. |
| `02-subscription-counter-delta.png` | **Manual capture required** | Claude subscription message counter before/after `pnpm db:seed` run. Delta should be 0 (seed has no LLM calls). When worker runs a real mission via `claudeCodeLLM`, delta ≥ 1 per task. |
| `03-multiagentos-tokens-page.png` | Done (automated) | `/tokens` page running against seeded DB. Shows: 30 msg / 42.0k tokens today / 69% cache hit ratio. Quota & Cache layout, fmtTokens() formatting, zero-€ copy. |

## Verdict

The `/tokens` page correctly displays quota data (no € values, no PAYG fields).
`ANTHROPIC_API_KEY` guard confirmed: worker refuses to start when key is present (see `startup.test.ts` subprocess test, commit `6b7fecd`).
Lint guard `scripts/lint-no-sdk-payg.sh` passes with zero forbidden imports.

**Screenshots 01 and 02 require authenticated browser sessions** — capture from:
- Anthropic Console: `console.anthropic.com/settings/usage`
- Claude subscription: app desktop `claude /status` or subscription management page

Once captured, save as `01-anthropic-console-zero-spend.png` and `02-subscription-counter-delta.png` and commit:
```
git add docs/decisions/0001-proof/
git commit -m "docs(proof): add Console + subscription screenshots"
```
