# Build report — 4b slice · cockpit error boundaries

Date 2026-06-15 · Branch `phase/4b-error-boundaries` · Base `main` (bcd7e57).

## Shipped
Only missions + projects had a Next `error.tsx`; the other 8 cockpit routes had no
error boundary (an unhandled throw bubbled to the root). Added uniform boundaries via a
shared component:
- `apps/web/components/ErrorState.tsx` (new) — `role="alert"` body + Retry(reset), titled.
- `error.tsx` added to: agents, ideas, memory, priorities, skills, studio, tokens, trace,
  and the `(cockpit)` root catch-all. Each is a thin titled wrapper over `ErrorState`.
- Refactored the existing missions/projects `error.tsx` onto `ErrorState` (dedup — avoids
  9× near-identical markup tripping Sonar new-code duplication).

Scope: error boundaries only (uniform, additive, zero happy-path risk — render solely on
throw). Empty-state copy, the onboarding tour, and deep per-page i18n stay in the handoff
(`docs/learning/2026-06-15-handoff-prompts.md`) — they need visual/UX judgement.

## Verification (5 checks)
- `pnpm -r test` — PASS (web 70; all suites green).
- `pnpm lint` — PASS (tsc clean, no-PAYG guard green).
- `pnpm build` — PASS (Next compiled all error boundaries).
- `pnpm --filter @mas/web smoke` — PASS (31).
- Sonar — pending push (expected clean: shared component, no dup, readonly props).
