# Shard — cluster `skill:core-agent`, lot C (Doer C)

Source: `affaan-m/ecc` (MIT). Inspection copies at `/tmp/ecc-inspect/skills/<slug>/`.
Output skills at `packages/skills/library/<slug>/SKILL.md`. Audit barre LARGE (intake-audit T0/T1/T2).
Sanitize sweep run on all 4 new sources: zéro secret, zéro PII, zéro `@anthropic-ai/sdk`, zéro PAYG Anthropic.

| slug | décision | raison | dedup | chemin | état |
|---|---|---|---|---|---|
| `dashboard-builder` | implement_now (T1) | Skill observabilité opérationnel et complet (5 axes, questions-avant-panneaux, JSON importable). Pas de dup dans nos assets. | Aucun skill/agent observabilité dans `our-assets-index.md`. | `packages/skills/library/dashboard-builder/SKILL.md` | déjà-boosté (vérifié conforme : 7 sections §12, commentaire source, summary L1, metadata complet, 0 PAYG ; pas de Prompt Defense — skill non-pilote, domaine observabilité) |
| `data-scraper-agent` | implement_now (T1) | Pipeline COLLECT→ENRICH→STORE riche et performant ; cognition free-tier (Gemini, §11.bis OK), exécution Claude-only. Valeur propre forte. | Pas d'équivalent collecte de données planifiée dans nos assets. | `packages/skills/library/data-scraper-agent/SKILL.md` | neuf (réécrit §12 complet ; Prompt Defense ajouté ; maintainer-safe : secrets via .env/Secrets, robots.txt, pas d'égress non autorisée) |
| `dmux-workflows` | implement_now (T1) | Orchestration parallèle panes+worktrees disciplinée ; utile pour le dispatcher MAS. Performant, valeur propre. | Recoupe partiellement `mas-skill-router`/dispatcher mais angle distinct (exécution tmux/worktree parallèle), pas une dup-no-better. | `packages/skills/library/dmux-workflows/SKILL.md` | neuf (réécrit §12 complet ; Prompt Defense ajouté ; maintainer-safe : pane manager = tooling tiers untrusted, review avant install, pas de `curl|sh`) |
| `dynamic-workflow-mode` | implement_now (T1) | Discipline harnais task-local + eval gate + handoff ; mappe sur lifecycle/§4/§5. | Pas de dup ; complémentaire à `dynamic` côté planning. | `packages/skills/library/dynamic-workflow-mode/SKILL.md` | déjà-boosté (vérifié conforme : 7 sections, Prompt Defense présent, source comment, summary L1, metadata, 0 PAYG) |
| `enterprise-agent-ops` | implement_now (T1) | Source ECC était un stub léger (51 l.) mais le LENS (4 domaines ops + incident pattern + métriques) est solide et mappe sur worker/events/budgets/§4/§5/§11. Boost le rend opérationnel. | Pas d'équivalent ops agent long-lived dans nos assets. | `packages/skills/library/enterprise-agent-ops/SKILL.md` | neuf (réécrit §12 complet à partir du lens ; Prompt Defense ajouté ; ancré sur surfaces MAS, pas d'ops-stack parallèle) |
| `eval-harness` | implement_now (T1) | Framework EDD complet (capability/regression, 4 graders, pass@k/pass^k, seuils). Couche mesure du Quality Controller, feed §7. | Complémentaire à `mas-reviewer`/Quality Controller (mesure vs verdict), pas une dup. | `packages/skills/library/eval-harness/SKILL.md` | neuf (réécrit §12 complet ; Prompt Defense ajouté ; security sign-off reste humain §5) |

## Notes
- 6/6 keepers, 0 rejet. Aucun stub-no-content irrécupérable ; `enterprise-agent-ops` était léger mais son lens portait de la valeur → boosté plutôt que rejeté (barre LARGE).
- `description` field : conservé en string entre guillemets (triggers positifs + négatifs « Do NOT use ») conforme à `skills-reference.md`.
- `data-scraper-agent` : la source mentionnait `GEMINI_API_KEY` (clé tierce free-tier, autorisée §11.bis, missing-key dégrade sans crash). Aucune clé Anthropic, aucun `@anthropic-ai/sdk`.
