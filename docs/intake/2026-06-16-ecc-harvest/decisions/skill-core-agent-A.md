# ECC Harvest — décisions cluster `skill:core-agent` (lot A)

Doer: lot A (6 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).

---

## agent-eval
- **décision**: adapt
- **raison**: méthode d'éval reproductible agents/modèles (pass-rate × consistance × temps), axe coût/$ supprimé (§11 subscription-only).
- **dedup**: non — `mas-reviewer` revoit une livraison unique, pas une comparaison de candidats; aucun skill d'éval head-to-head dans notre surface.
- **chemin library**: `packages/skills/library/agent-eval/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (7 sections §12, commentaire source, summary L1, metadata, 0 `@anthropic-ai/sdk`). Pas de Prompt Defense Baseline — correct: c'est une méthode d'éval, ne pilote pas un agent.

## agent-harness-construction
- **décision**: adapt
- **raison**: conception de l'action-space/observations/recovery/budget-contexte d'un agent; aligné sur la règle ≤7 outils/agent + discipline L1 (§6).
- **dedup**: non — `skill-creator` crée un skill, pas la conception du harness d'un agent.
- **chemin library**: `packages/skills/library/agent-harness-construction/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (7 sections §12 + Prompt Defense Baseline présent — pilote un agent, correct).

## agent-introspection-debugging
- **décision**: adapt
- **raison**: boucle capture→diagnostic→recovery minimale→rapport pour runs qui bouclent/dérivent; escalade humaine sur risque/blocage (§5).
- **dedup**: non — distinct de `mas-reviewer` (vérification post-change) et `agent-harness-construction` (design).
- **chemin library**: `packages/skills/library/agent-introspection-debugging/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (7 sections §12 + Prompt Defense Baseline présent — correct).

## agent-self-evaluation
- **décision**: adapt
- **raison**: auto-réflexion 5 axes (accuracy/completeness/clarity/actionability/conciseness) avec preuve par axe; réflexion, pas un gate (complète `mas-reviewer`).
- **dedup**: non — complémentaire, ne remplace pas le gate Reviewer; aucun skill d'auto-éval existant.
- **chemin library**: `packages/skills/library/agent-self-evaluation/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (7 sections §12 + Prompt Defense Baseline présent — correct).

## agent-sort
- **décision**: adapt
- **raison**: plan de surface skill/agent par repo, tri DAILY vs LIBRARY adossé à des preuves repo-locales; cadre la surface `packages/skills/library` vs set `mas-*` toujours chargé. Install/delete = étape opérateur gated (§5).
- **dedup**: non — `skill-creator` (authoring) et `intake-audit` (entrée d'un NOUVEL item externe) sont distincts; aucun skill de curation de surface chez nous.
- **chemin library**: `packages/skills/library/agent-sort/SKILL.md`
- **état**: neuf (audité + boosté depuis `/tmp/ecc-inspect`; source ECC non-stub; frontmatter MAS T1/library + Prompt Defense Baseline — pilote un agent de curation; corps §12 réécrit/amélioré, non recopié).

## ai-first-engineering
- **décision**: adapt
- **raison**: modèle opératoire d'ingénierie quand les agents produisent l'essentiel du code (planning > frappe, eval > anecdote, review = comportement système); aligné §7 (vérif 5 checks) + §5 (risk gates).
- **dedup**: non — doctrine d'équipe/archi, pas couvert par `prompting-anthropic.md` (technique de prompt) ni un agent existant.
- **chemin library**: `packages/skills/library/ai-first-engineering/SKILL.md`
- **état**: neuf (source ECC substantielle non-stub; frontmatter MAS T1/library + Prompt Defense Baseline; corps §12 enrichi vers MAS, non recopié).

---

### Récap
- 6/6 keepers (tous `adapt`). 0 reject (aucun stub; tous substantiels et sans dedup).
- 4 déjà-boostés & conformes (non réécrits). 2 neufs (`agent-sort`, `ai-first-engineering`).
- Garde-fous: 0 `@anthropic-ai/sdk`, 0 secret/PAYG dans les 6 outputs.
