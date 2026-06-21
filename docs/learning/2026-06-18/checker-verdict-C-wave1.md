# Verdict CHECKER — ECC Harvest, Phase C vague 1 (cluster `skill:core-agent`)

- **Date** : 2026-06-18
- **Worktree** : `/Users/melvyn/Documents/02_PROJETS/maos-ecc` (branche `phase/ecc-harvest`)
- **Périmètre** : 15 keepers + 3 rejets, 3 shards, ledger réduit
- **Mode** : lecture seule, re-vérification indépendante (les Doers ne sont pas crus sur parole)

## Verdict : **NEEDS_WORK**

Un seul défaut bloquant, isolé et trivial à corriger : `continuous-agent-loop/SKILL.md` n'a **pas** la section canonique `## Process` exigée par §12. Tout le reste (sécurité, ledger, shards, lint, richesse) est propre.

---

## 1. Conformité §12 — 7 sections + frontmatter + commentaire source + metadata

Boucle sur les 15 fichiers. Légende : section = heading littéral présent (grep préfixe `^## <Section>`).

| skill | Overview | When to Use | Principles | Process | Rationalizations | Red Flags | Verification Criteria | `summary:` | `pattern from affaan-m/ecc` | metadata 5 clés | lignes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| agent-eval | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 79 |
| agent-harness-construction | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 89 |
| agent-introspection-debugging | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 106 |
| agent-self-evaluation | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 92 |
| agent-sort | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 88 |
| ai-first-engineering | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 85 |
| architecture-decision-records | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 108 |
| **continuous-agent-loop** | OK | OK* | OK | **MANQUE** | OK | OK | OK | OK | OK | OK | 115 |
| continuous-learning-v2 | OK | OK* | OK | OK | OK | OK | OK | OK | OK | OK | 130 |
| dashboard-builder | OK | OK* | OK | OK | OK | OK | OK | OK | OK | OK | 85 |
| data-scraper-agent | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 93 |
| dmux-workflows | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 93 |
| dynamic-workflow-mode | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 103 |
| enterprise-agent-ops | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 88 |
| eval-harness | OK | OK* | OK | OK | OK | OK | OK | OK | OK | OK | 101 |

`*` = variante de titre `## When to Use / When NOT` (au lieu de `## When to Use`). Acceptable : le préfixe canonique est présent et la section est riche (Use / Do NOT use). **Non bloquant.**

Variantes `## Verification Criteria (pass/fail)` / `(binary pass/fail)` : acceptables, préfixe canonique présent.

### Défaut bloquant unique
**`packages/skills/library/continuous-agent-loop/SKILL.md`** : aucune section `## Process`. Headings réels : `Prompt Defense Baseline` → `Overview` → `When to Use / When NOT` → `Principles` → `Loop Pattern Spectrum` → `Maintainer-safe adaptation` → `Rationalizations` → `Red Flags` → `Verification Criteria`. Le shard B justifie « Process [via Loop Pattern Spectrum + Decision flow] » — c'est une **ré-étiquette du Doer**, pas la section canonique exigée par §12. Le contenu opérationnel équivalent existe (spectre de patterns + decision flow), donc la correction est purement structurelle.

**Correction exacte** : renommer `## Loop Pattern Spectrum` (ligne 53) en `## Process` ; OU insérer un `## Process` court (ex. les 5 lignes du « Decision flow » + renvoi au spectre) avant le spectre. Le bloc « Decision flow » (l.74-81) est déjà la procédure de sélection — le plus propre est `## Process` chapeautant le spectre + le decision flow.

## 2. Pas de stub — échantillon lu en profondeur

- **agent-sort** (88 l.) : Process à 7 étapes concrètes (read repo → evidence grep → passes → table → install plan → router → verify), table Rationalizations, ancrage MAS (`packages/skills/library` vs `mas-*`, §5/§6/§8). Riche, adapté — pas un copier-coller.
- **continuous-learning-v2** (130 l.) : Process à 8 étapes (hook PreToolUse/PostToolUse → détection projet par hash git remote → distillation cheap-model → instincts atomiques → scope → confiance → MemoryProposal → promotion project→global), guide de scope. Très riche, ancré §6/§8/Memory Center.
- **eval-harness** (101 l.) : Process EDD à 8 étapes + grader cheat sheet + pass@k/pass^k + ancrage Quality Controller/§7. Riche.

Aucune section vide repérée ; toutes ≥ ~79 lignes. **Pas de stub.**

## 3. §11 / §11.bis — sécurité

- `grep -rn '@anthropic-ai/sdk' packages/skills/library/` → **vide.**
- `grep -rniE 'sk-ant|ANTHROPIC_API_KEY *=|AKIA' packages/skills/library/` → **vide.**
- `data-scraper-agent` : `GEMINI_API_KEY` mentionné comme **référence env free-tier** (§11.bis), explicitement « secrets via .env + GitHub Secrets only, never in code » ; PAYG Anthropic déclaré interdit. **Aucune clé en dur. Conforme.**

## 4. Rejets sans fichier

`packages/skills/library/{autonomous-loops,claude-devfleet,continuous-learning}` → **absents.** Conforme. (Note : le pattern d'`autonomous-loops` est replié dans `continuous-agent-loop` via commentaire double-source — légitime.)

## 5. Cohérence ledger ↔ réalité

`awk` sur `ledger.tsv` (cluster `skill:core-agent`) : **integrated=15, rejected=3, pending=33.**
- Les 15 `integrated` ont tous un dossier library (cross-check OK).
- Aucun dossier library hors des 15 integrated.
- Les 3 `rejected` (autonomous-loops, claude-devfleet, continuous-learning) sans dossier.
- 33 restent `pending`. **Cohérent.**

## 6. Shards complets

3 shards couvrent bien les 18 slugs, 6 chacun, décision + raison :
- **A** (56 l.) : agent-eval, agent-harness-construction, agent-introspection-debugging, agent-self-evaluation, agent-sort, ai-first-engineering.
- **B** (66 l.) : architecture-decision-records, autonomous-loops (reject), claude-devfleet (reject), continuous-agent-loop, continuous-learning (reject), continuous-learning-v2.
- **C** (19 l., table dense) : dashboard-builder, data-scraper-agent, dmux-workflows, dynamic-workflow-mode, enterprise-agent-ops, eval-harness.

**18/18 couverts.** Réserve : le shard B affirme à tort que continuous-agent-loop a « 7 sections (Process via Loop Pattern Spectrum) » — à corriger pour refléter la réalité après le fix §1.

## 7. Lint guard

`bash scripts/lint-no-sdk-payg.sh` → `PASS: no forbidden provider SDK imports (§11 + §11.bis)`, **exit 0.**

---

## Corrections requises avant PASS

1. **`continuous-agent-loop/SKILL.md`** : ajouter la section canonique `## Process` (renommer `## Loop Pattern Spectrum` ou chapeauter spectre + decision flow). **Seul défaut bloquant.**
2. (Cosmétique, recommandé) Corriger la note du shard B qui prétend que continuous-agent-loop a déjà un `## Process` — la rendre exacte après le fix.

Tout le reste est conforme. Une fois le `## Process` posé, le lot passe en **PASS**.
