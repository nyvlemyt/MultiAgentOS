# Backlog — Suggestion d'agents froids par recall sémantique + floors golden (0d/4b+4d)

**Quand** : suite de 0d, faible priorité. **Valeur** : moyenne — étend le « réveil » sémantique aux agents (aujourd'hui réservé aux skills) et durcit le filet anti-rank-collapse. **Statut** : gaps d'audit U5 (F3 + F4). **Source** : `docs/learning/2026-06-25-night/U5-self-audit-0d.md` F3/F4 · ADR 0007 §Décision-4/§Consequences · `packages/agents/src/cold-agent-suggest.ts:34-47` · `packages/agents/src/dispatch.ts:88,95` · `packages/memory/src/golden-queries.json` · `packages/memory/src/eval.ts:89`.

## Identity (quoi)

Deux raffinements, regroupés car même domaine (arsenal froid + éval) :

1. **F3 — agents froids scorés en statique, pas en sémantique.** `scoreColdAgentSuggestion` utilise un overlap de tokens tags/rôle/nom (`overlapScore`), pas le retriever `mas-arsenal`. Le `arsenalRetriever` par-mission (`dispatch.ts:88`) est branché sur la sélection de **skills** mais **pas** sur la suggestion d'**agents**. ADR §Décision-4 + preflight §2-4b autorisent explicitement les deux voies — donc **in-spec** — mais le bénéfice sémantique (« un bon agent remonte par pertinence, pas par recouvrement de tags ») ne tombe que sur les skills ; les agents restent lexicaux-fragiles, le défaut même que l'ADR visait.

2. **F4 — floor de score sur 1 ligne-or seulement.** `minScore` (`eval.ts:89`) est correct, mais seule `arsenal-defensive-agent` porte `minScore:0.3`. Les 4 autres lignes arsenal n'ont pas de plancher → un rank-collapse à score≈0 y passe tant que le substring matche.

## Why it matters

Petit écart de couverture, pas un bug. Mais c'est la moitié de la promesse « l'arsenal agit par pertinence sémantique » et un filet anti-régression à 1/6.

## Cost (install / maintenance / removal)

- **Install** : faible-moyen. F3 : passer `arsenalRetriever` filtré aux docs d'agents dans `scoreColdAgentSuggestion` (union RRF comme pour les skills, ou fallback statique si retriever absent — garder la dégradation propre). F4 : ajouter `minScore` aux 4 lignes restantes (valeurs calibrées sur les scores réels observés) + 1 cas de test.
- **Maintenance** : faible.
- **Removal** : trivial.

## Recommendation : **defer**

In-spec aujourd'hui, donc pas bloquant. À regrouper avec un futur durcissement de l'arsenal (idéalement même PR que `arsenal-eval-live-recall-gate` puisque ça touche le gold set).

## Liens
- `docs/backlog/arsenal-eval-live-recall-gate.md` · `docs/backlog/arsenal-mcp-runtime-activation.md`.
- ADR 0007 §Décision-4 (suggestion only) — la voie sémantique reste **suggestion**, jamais dispatch (§5 inchangé).

**Re-audit** : prochain durcissement arsenal / ouverture 0e.
