# Checker — ECC Harvest Phase C vague 4

**Date** : 2026-06-18
**Scope** : 38 slugs audités → 28 keepers (integrated) + 10 rejets, clusters `core-memory / core-research / core-skills-mgmt / core-token`.
**Worktree** : `/Users/melvyn/Documents/02_PROJETS/maos-ecc` (branche `phase/ecc-harvest`)
**Mode** : lecture seule (sauf ce verdict).

## Verdict : **PASS**

---

## Tableau de contrôle

| Contrôle | Résultat | Détail |
|---|---|---|
| **Anti-stub** (deep-read 6) | PASS | skill-comply, strategic-compact, content-hash-cache-pattern, cost-aware-llm-pipeline, skill-scout, regex-vs-llm-structured-text + council : tous riches, 7 sections, opérationnels, recadrés MAOS. |
| **Maintainer-safe appliqué** | PASS | cost-aware-llm-pipeline : budget $ → quota_units, SDK strippé, single injection point `llm.ts`. skill-comply : runner Python ECC remplacé par le moteur Claude Code du projet, no PAYG. strategic-compact : `/compact` manuel (aucun hook auto bundlé). content-hash-cache : snippet Python déterministe pur (no LLM/network/SDK). |
| **Rejets justes (§11/sécurité)** | PASS | autonomous-agent-harness = curl `Authorization: Bearer $ANTHROPIC_API_KEY` (PAYG) → KILL §11. agent-payment-x402 = paiement crypto/wallets/clés privées → §5 risk:blocking + §11. cost-tracking = `cost_usd` + DB `~/.claude-card-tracker` hors-repo → §11 + §8. configure-ecc/ecc-guide = auto-référents (installent/naviguent ECC lui-même) → T0. Tous de BONS rejets, aucun keeper perdu à tort. |
| **§11 contenu (import réel)** | PASS | `grep` forme-import code (`import…from`, `require(`, `import(`) sur `@anthropic-ai/sdk` → **vide**. Le seul hit (cost-aware-llm-pipeline:26) est en **prose** (« the upstream pattern imports a provider SDK directly… MAOS discards that machinery ») — autorisé. Aucune clé `sk-ant-*` en dur. |
| **Cohérence ledger ↔ library** | PASS | 95 integrated = 95 dossiers `library/` ; **0 pending** sur tous les `core-*`. Chaque keeper a un dossier, chaque rejet n'en a pas. |
| **Shards** | PASS | memory-N1/N2, research-R1/R2, skills-mgmt-S1/S2, token-T1/T2 présents ; les 38 slugs (28+10) tous mappés. |
| **§12 mécanique (re-vérif indépendante 28)** | PASS | ligne 1 = `---`, `summary:` présent, citation `pattern from affaan-m/ecc` présente sur les 28. |

## Notes (non bloquantes)

1. **pubmed-database — divergence ledger ↔ frontmatter/dir.** Ledger : `name=pubmed-database`. Dossier + frontmatter : `scientific-db-pubmed-database`. La brief signalait déjà le préfixe de dossier ; le `name` de frontmatter suit le dossier (`scientific-db-pubmed-database`), pas le ledger. Non bloquant (le mapping ledger→dossier reste traçable via la colonne `dossier`), mais à harmoniser : soit aligner le `name` ledger sur le frontmatter, soit documenter l'alias. **Recommandation : aligner `name` du ledger sur `scientific-db-pubmed-database`** pour qu'un futur lookup par `name` ne casse pas.

## Résumé

Vague 4 validée **PASS**. Les 28 keepers sont des skills opérationnels complets (Principles citant la source + Process numéroté + Rationalizations + Red Flags + Verification Criteria binaires), correctement recadrés sur la doctrine MAOS (§11 abonnement-only, §5 gating, §6/§8 token & mémoire, single injection point `llm.ts`) — aucun stub. Les transformations maintainer-safe annoncées sont effectivement appliquées (runner Python strippé, SDK strippé, hook strippé, budget $→quota_units). Les 10 rejets sont tous justifiés et corrects : les rejets sensibles §11/sécurité (autonomous-agent-harness, agent-payment-x402, cost-tracking, configure-ecc, ecc-guide) sont de vrais KILL, pas des keepers perdus. Cohérence ledger/library/shards intacte (95=95, 0 pending, 38/38 mappés), et l'invariant §11 « aucun import SDK réel » tient (seules des mentions en prose). Seul point à nettoyer : la divergence de `name` ledger vs frontmatter pour pubmed-database (non bloquant).
