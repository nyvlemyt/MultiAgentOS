# Shard — cluster `skill:core-agent`, lot D (Doer D)

Source: `affaan-m/ecc` (MIT). Copies d'inspection à `/tmp/ecc-inspect/skills/<slug>/` (RO).
Output skills à `packages/skills/library/<slug>/SKILL.md`. Audit barre LARGE (intake-audit T0/T1/T2).
Sanitize sweep run sur les 6 sources : zéro secret, zéro clé/JWT/private-key, zéro PII, zéro chemin home, zéro `@anthropic-ai/sdk`, zéro PAYG Anthropic, zéro `curl|sh`, zéro `npx ...@latest`.

| slug | décision | raison | dedup | chemin |
|---|---|---|---|---|
| `gan-style-harness` | adapt_now (T1) | Boucle adversariale Generator⇄Evaluator pour build autonome haute-qualité ; valeur propre forte, touche la spine orchestration. Performant, pas un stub. | Recoupe l'angle « verification » de `mas-reviewer`/Quality Controller mais distinct (harnais de BUILD itératif, pas un verdict post-hoc) → pas dup-no-better. | `packages/skills/library/gan-style-harness/SKILL.md` |
| `hexagonal-architecture` | adapt_now (T2) | Skill Ports & Adapters riche, multi-langage, playbook strangler ; arsenal backend qui élargit la capacité sans toucher la spine. Performant. | Aucun skill architecture dans `our-assets-index.md` (agents Software/Backend Architect existent, mais pas ce skill) → pas de dup. | `packages/skills/library/hexagonal-architecture/SKILL.md` |
| `inherit-legacy-style` | adapt_now (T2) | Anti style-drift sur projets legacy : directement aligné sur MAS (dispatch d'agents dans projets externes enregistrés par path). Riche, langage-agnostique. | Voisin de `init`/`code-review` mais angle distinct (extraction de conventions implicites + `.ai-style-rules.md`) → pas dup-no-better. | `packages/skills/library/inherit-legacy-style/SKILL.md` |
| `healthcare-cdss-patterns` | adapt_now (T2) | Verticale santé à valeur de domaine réelle (lib pure-function, interactions/dose/scores, zéro faux-négatif). Opérationnel et performant, pas un stub. | Aucun équivalent CDSS dans nos assets. | `packages/skills/library/healthcare-cdss-patterns/SKILL.md` |
| `healthcare-emr-patterns` | adapt_now (T2) | Verticale santé : workflows EMR/EHR (encounter single-page, templates red-flag, locked encounter, a11y stricte). Riche, pas un stub. | Aucun équivalent EMR ; complémentaire à `healthcare-cdss-patterns` (workflow vs moteur de règles). | `packages/skills/library/healthcare-emr-patterns/SKILL.md` |
| `healthcare-eval-harness` | adapt_now (T2) | Verticale santé : gate déploiement patient-safety (CDSS/PHI/data-integrity 100%-or-block). Opérationnel, framework-agnostique, pas un stub. | Aucun équivalent ; complète `eval-harness` (lot C) avec sémantique safety-critique. | `packages/skills/library/healthcare-eval-harness/SKILL.md` |

## Notes
- 6/6 keepers, 0 rejet. Aucun stub : les 3 healthcare-* sont des verticales riches à valeur de domaine réelle (barre LARGE → keep), pas des coquilles vides.
- `description` : conservé en string entre guillemets (triggers positifs + négatifs « Do NOT use ») conforme à `skills-reference.md`.
- **Prompt Defense Baseline** ajouté à `gan-style-harness` (pilote Planner/Generator/Evaluator) et `inherit-legacy-style` (pilote un agent de code legacy). Non ajouté aux 3 healthcare-* ni à `hexagonal-architecture` : ce sont des patterns/skills non-pilotes (lib de code + guides de structure), pas des agents.
- **Maintainer-safe rewrites** :
  - `gan-style-harness` : la source pilotait `claude -p --model opus` (flags shell + version hardcodée) + Playwright MCP. Réécrit pour router tout via `packages/core/src/llm.ts` (§11, abonnement), éval via skill `webapp-testing` contre dev-server local uniquement (pas d'égress tiers), boucle budget-gated (§8). Suppression des noms de modèle « Opus 4.6 » hardcodés.
  - `inherit-legacy-style` : écritures `.ai-style-rules.md`/hook `settings.json` confinées au sandbox du projet actif (§5 cross-project) ; install du hook PreToolUse = action gated, jamais auto.
  - `healthcare-eval-harness` : runs contre code local user-authorized uniquement (pas d'upload/scanner tiers) ; déploiement sur verdict SAFE = action gated séparée (§5) ; invocation framework-neutre (Vitest côté MAS).
- `metadata` complet sur les 6 : `origin: affaan-m/ecc`, `license: MIT`, `cluster: skill:core-agent`, `tier`, `status: library`. 1ère ligne body = commentaire source `<!-- pattern from affaan-m/ecc skills/<slug>/SKILL.md -->`. summary L1 ≤200 tok. 7 sections §12 (Overview / When to Use·NOT / Principles[source] / Process[numéroté] / Rationalizations[table] / Red Flags / Verification[pass·fail]).
