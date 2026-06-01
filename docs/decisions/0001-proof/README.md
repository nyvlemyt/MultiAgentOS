# Phase 2 — Zero-PAYG Verification

Captures taken on branch `phase/2-claude-code-bridge`.

## Artefacts

| File | Status | Description |
|------|--------|-------------|
| `01-anthropic-console-zero-spend.png` | ✅ Done (2026-06-01) | Anthropic Console Usage — juin 2026: 0 tokens entrants, 0 tokens sortants, "Aucune donnée". Zéro API spend PAYG. |
| `02-subscription-counter-delta-avant.png` | ✅ Done (2026-06-01) | Claude Pro subscription avant run: Session actuelle 0 %, hebdomadaire 0 %. |
| `02-subscription-counter-delta-apres.png` | ✅ Done (2026-06-01) | Claude Pro subscription après run: Session actuelle 8 % (reset dans 4h 23min), hebdomadaire 1 %. Delta prouve consommation via subscription, pas PAYG. |
| `03-multiagentos-tokens-page.png` | ✅ Done (2026-05-28) | `/tokens` page: 30 msg / 42.0k tokens today / 69% cache hit ratio. Quota & Cache layout, zero-€ copy. |

## Verdict

**EC2** — Console Anthropic: 0 tokens API en juin 2026. Zéro spend PAYG. ✅

**EC3** — Compteur subscription: 0 % → 8 % session / 0 % → 1 % hebdo après run. Billing exclusivement via subscription. ✅

`ANTHROPIC_API_KEY` guard confirmé: worker refuse de démarrer si clé présente (`startup.test.ts`, commit `6b7fecd`).

Lint guard `scripts/lint-no-sdk-payg.sh` passe avec zéro imports interdits.
