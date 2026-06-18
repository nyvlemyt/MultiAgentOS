# Shard — cluster `skill:core-agent`, lot F (Doer F — FAMILLE orch-*)

Source: `affaan-m/ecc` (MIT). Inspection copies at `/Users/melvyn/Documents/02_PROJETS/Tkinter/ecc/skills/<slug>/`.
Output skills at `packages/skills/library/<slug>/SKILL.md`. Audit barre LARGE (intake-audit T0/T1/T2).
Sanitize sweep run sur les 6 sources : zéro secret, zéro PII, zéro `@anthropic-ai/sdk`, zéro PAYG Anthropic.

## Décision de consolidation

Les 6 skills `orch-*` sont une **FAMILLE paramétrique d'un seul pattern**. ECC lui-même les décrit ainsi :
`orch-pipeline` est le « shared engine », et les 5 autres sont des « thin wrappers » qui « do not
re-implement any work — they classify the request, choose which phases run, and delegate ».

Lecture des 6 : les 5 wrappers ne portent **aucun contenu opérationnel propre**. Chacun se réduit à
3 paramètres injectés dans le même pipeline `Intake→Research→Plan→(Scaffold)→TDD→Review→Commit` :
- **size floor** (standard / small / large),
- **phase mask** (quelles phases tournent),
- **first-move rule** (new test / changed test / failing regression test / green-first / read-spec-then-slice).

Garder 5 fichiers quasi-dups = redondance pure (drift + coût tokens), exactement ce que la règle
barre-LARGE proscrit (dup-no-better). **Décision : UN skill paramétré `orch-pipeline`** qui absorbe
les 5 modes dans une table de modes (Step 0), + le size classifier + les 2 gates humains. Les 5
wrappers → `reject (consolidé dans orch-pipeline)`.

## Tableau

| slug | décision | raison | dedup | chemin |
|---|---|---|---|---|
| `orch-pipeline` | implement_now (T1) — KEEPER consolidé | Spine d'orchestration gated Research→Plan→TDD→Review→Commit + size classifier + 2 gates humains. Absorbe les 5 modes en table paramétrique. Touche la colonne vertébrale MAS (dispatch/lifecycle). Valeur propre forte. | Nos `mas-mission-planner` (DAG), `mas-skill-router`, `mas-reviewer`, `mas-sec-reviewer`, Tier B `tdd`/`code-reviewer` sont les **briques**, pas l'umbrella workflow gated single-repo. Pas une dup — additif, et les 2 gates mappent sur §4/§5. | `packages/skills/library/orch-pipeline/SKILL.md` |
| `orch-add-feature` | reject (consolidé dans orch-pipeline) | Thin wrapper sans contenu propre : mode `add-feature` (floor standard, mask 0→1→2→4→5→6, first move = new failing tests). Devient une ligne de la table de modes. | Consolidé. | — |
| `orch-change-feature` | reject (consolidé dans orch-pipeline) | Thin wrapper : mode `change-feature` (floor small, mask light, first move = changed tests). Ligne de table. | Consolidé. | — |
| `orch-fix-defect` | reject (consolidé dans orch-pipeline) | Thin wrapper : mode `fix-defect` (floor small/trivial, first move = failing regression test). Ligne de table. | Consolidé. | — |
| `orch-refine-code` | reject (consolidé dans orch-pipeline) | Thin wrapper : mode `refine-code` (floor standard, behavior-neutral, first move = green-first). Ligne de table. | Consolidé. | — |
| `orch-build-mvp` | reject (consolidé dans orch-pipeline) | Thin wrapper : mode `build-mvp` (floor large, ajoute phase 3 Scaffold, first move = read-spec→vertical slices). Ligne de table. | Consolidé. La boucle GAN externe d'ECC → remplacée par la boucle dispatch/worker MAS (maintainer-safe). | — |

## Notes

- **1 keeper, 5 rejets-par-consolidation.** Aucun rejet « unsafe/stub » : les 5 wrappers sont rejetés
  uniquement parce qu'ils sont des variantes du même engine, pas par manque de valeur. La valeur des
  5 modes est **conservée** dans `orch-pipeline` (table Step 0).
- **Maintainer-safe** : les commandes ECC (`/feature-dev`, `/gan-build`, `/build-fix`) et le harnais
  GAN installé en repo sont remplacés par la délégation aux agents/skills MAS-natifs
  (`mission-planner`, `superpowers:test-driven-development`, `code-reviewer`, `mas-reviewer`,
  `mas-sec-reviewer`). Aucun binaire tiers installé, aucun `curl | sh`.
- **Prompt Defense Baseline** : ajouté en tête de corps (skill adopté d'une source externe).
- **§11 / §5** : les 2 gates humains (post-Plan, pré-Commit) mappent sur l'autonomie §4 et le risk
  gate §5 ; security-review trigger explicite ; aucun PAYG, aucun `@anthropic-ai/sdk`.
- `description` : string entre guillemets, triggers positifs + négatifs (« Do NOT use ») conforme
  `skills-reference.md`.
