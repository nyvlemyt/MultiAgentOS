# ECC Harvest — décisions cluster `skill:core-eval` (lot L)

Doer: lot L (6 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Sanitize: scan secrets/PII/chemins-internes sur les 6 sources → 0 match (EXIT=1). RAS.

---

## design-system
- **décision**: adapt
- **raison**: génération de tokens + audit visuel 10 dimensions + détection AI-slop, le tout sur preuves repo-locales. Lentille anti-slop alignée `prompting-anthropic.md §5`.
- **sanitize**: clean. Machinery retirée: étape "research 3 competitor sites via browser MCP" = egress/scraping tiers → supprimée (§5/§8). Audit désormais preuve-locale uniquement; preview HTML self-contained.
- **dedup**: non — `frontend-design` génère un composant, ne fait pas d'audit de cohérence ni de système de tokens; `make-interfaces-feel-better` traite le détail micro, pas le système macro.
- **chemin library**: `packages/skills/library/design-system/SKILL.md`
- **état**: déjà-boosté, 7 sections §12, commentaire source, summary L1, metadata. Pas de Prompt Defense Baseline — correct: skill d'audit/génération, ne pilote pas un agent sur surface risquée.

## email-ops
- **décision**: adapt
- **raison**: workflow opérateur mailbox (triage/draft/reply/preuve-Sent) à valeur réelle. Surface comms absente de notre roster.
- **sanitize**: clean. Machinery contrainte (§5): envoi sortant = `risk:high` → skill ramené à **draft-and-verify only**. Aucun transport d'envoi écrit/appelé; envoi = action humaine gated qui fournit la preuve Sent. Stack ECC-native (`brand-voice`, `investor-outreach`...) retirée (skills inexistants chez nous). Prompt Defense Baseline ajouté (pilote un agent sur surface comms = risque injection/exfil).
- **dedup**: non — `internal-comms` rédige des formats internes (status/FAQ/incident), pas d'opération mailbox ni de preuve Sent.
- **chemin library**: `packages/skills/library/email-ops/SKILL.md`
- **état**: déjà-boosté, 7 sections §12 + Prompt Defense Baseline + gate §5 documenté (NE code aucun envoi). Conforme guidance-only.

## make-interfaces-feel-better
- **décision**: adapt
- **raison**: jeu de détails design-engineering concrets (concentric radius, optical alignment, tabular-nums, transition scope, hit areas) qui composent le poli. CSS-only, sûr.
- **sanitize**: clean. Aucune machinery exécutable; origine note "salvaged community PR" conservée en Overview. RAS.
- **dedup**: non — `design-system` = système/tokens macro + audit; ce skill = détail micro composant. Complémentaires (pair: design-system tokens → ce skill détail → ship).
- **chemin library**: `packages/skills/library/make-interfaces-feel-better/SKILL.md`
- **état**: déjà-boosté, 7 sections §12, summary L1. Pas de Prompt Defense Baseline — correct: référentiel CSS, ne pilote pas d'agent.

## mle-workflow
- **décision**: adapt
- **raison**: cycle ML production complet (data/prediction contracts, pipeline reproductible, promotion gates fail-closed, packaging serving, monitoring drift + rollback), scope-calibré. Surface MLOps absente du roster.
- **sanitize**: clean. Machinery retirée: cadrage coût/$ ("cost per prediction", "token-budget-advisor", routing par budget) recadré ou supprimé — §11 subscription-only, pas d'optimisation per-token. Name-dropping de skills ECC inexistants (`eval-harness`, `python-patterns`...) retiré du corps. Snippets Python (config gelée, gates) conservés — déterministes, sans dépendance externe.
- **dedup**: non — aucun skill ML/MLOps existant; `mas-reviewer` revoit une livraison, ne gère pas contrats data ni promotion gates.
- **chemin library**: `packages/skills/library/mle-workflow/SKILL.md`
- **état**: déjà-boosté, 7 sections §12, summary L1, metadata. Pas de Prompt Defense Baseline — correct: méthode d'ingénierie, ne pilote pas un agent externe.

## plankton-code-quality
- **décision**: reject
- **raison**: ce n'est PAS une lentille portable mais une **doc d'intégration d'un outil externe** (Plankton, @alxfazio) — hooks `.claude/hooks/` tiers à copier, `brew install jaq ruff uv` + `uv sync`, et hooks PostToolUse qui *spawn `claude -p` subprocess*. Machinery liée à l'install (non maintainer-safe en tant que skill); rien d'adoptable une fois retirées l'install + l'exécution subprocess tierce. La capacité résiduelle (lint write-time, config-tamper guard) est déjà couverte par notre pipeline de vérification (§7: pnpm lint/test/build + Sonar) et le quality-controller.
- **sanitize**: clean (pas de secret), mais T0 unsafe-machinery: exécution de code tiers non épinglé + subprocess `claude -p` = §5 hors-skill.
- **dedup**: oui partiel — enforcement qualité write-time recoupe notre gate Sonar/lint existant, sans le surpasser de façon portable.
- **chemin library**: — (aucun)

## production-audit
- **décision**: adapt
- **raison résiduelle (consigne B2)**: la *lentille maintainer-safe rewrite* de ce pattern est DÉJÀ absorbée dans `intake-audit` step 8. Valeur résiduelle vérifiée = la **capacité d'audit ship-readiness end-to-end** (5 lentilles risque + scoring 0-100 + caps durs 69/84 + format blockers/evidence/next-action), qui n'est PAS dupliquée: `intake-audit` décide d'AJOUTER un item, `mas-reviewer` vérifie UNE livraison vs son brief — aucun ne juge la ship-readiness d'une appli entière. Donc keep, pas reject.
- **sanitize**: clean. Machinery déjà maintainer-safe à la source (auteur a retiré `npx @latest`/scanners distants/upload tiers); on conserve cet état et on le réaffirme (§5/§8). Aucun envoi/exécution distante.
- **dedup**: non (voir raison résiduelle) — distinct de `intake-audit` et `mas-reviewer`; complète `mas-sec-reviewer` (gate ligne-à-ligne) en couvrant le niveau appli.
- **chemin library**: `packages/skills/library/production-audit/SKILL.md`
- **état**: déjà-boosté, 7 sections §12, summary L1 distinguant explicitement des 2 skills voisins. Pas de Prompt Defense Baseline — correct: skill d'audit, ne pilote pas un agent externe.

---

## Tableau récap

| slug | décision | chemin |
|------|----------|--------|
| design-system | adapt | `packages/skills/library/design-system/SKILL.md` |
| email-ops | adapt (guidance-only, §5 gated) | `packages/skills/library/email-ops/SKILL.md` |
| make-interfaces-feel-better | adapt | `packages/skills/library/make-interfaces-feel-better/SKILL.md` |
| mle-workflow | adapt | `packages/skills/library/mle-workflow/SKILL.md` |
| plankton-code-quality | reject | — (T0: doc d'install outil externe + subprocess tiers) |
| production-audit | adapt | `packages/skills/library/production-audit/SKILL.md` |

**Keepers (5)**: design-system, email-ops, make-interfaces-feel-better, mle-workflow, production-audit.
**Rejets (1)**: plankton-code-quality.
**production-audit**: KEEP — la lentille maintainer-safe est absorbée en B2, mais l'audit ship-readiness end-to-end (scoring/caps/lentilles risque) est une valeur résiduelle distincte de intake-audit et mas-reviewer.
