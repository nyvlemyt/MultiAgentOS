# Self-audit — dette du cycle mémoire-reaudit (2026-06-06)

**Quoi.** Candidat self-audit (§13 CLAUDE.md « ré-auditer l'existant ») issu du cycle `2026-06-06-vibeflow-memoire-reaudit`. Le cycle a distillé RES-060 + RES-041 en entier mais a **différé deux dettes pour cause de budget** (lecture PDF-images lourde). Cette carte les capture pour qu'elles ne se perdent pas — à traiter au **pré-vol Phase 4** (mémoire = la phase qui suit), pas via un sous-cycle dédié.

**Statut.** Backlog / self-audit. Aucune correction faite ici. Cible : pré-vol Phase 4.

---

## 1. Re-vérification anti-stat-inventée des distillations ère-MCP (priorité haute)

Les sections mémoire **distillées sous l'ère MCP** (sources 404, jamais re-confrontées au PDF) n'ont **pas** été re-vérifiées ce cycle. Risque = chiffre fabriqué présenté comme sourcé (exactement le piège « 40 % Gartner » du cycle gouvernance).

À re-vérifier contre PDF (par priorité de risque) :
- **RES-044** (`Rituel close-out 3 champs`) — la **friction « n°9 / n°10 »** (sub-agents MCP / 200+ entrées) → memoire.md. **Priorité 1** (claim numéroté, profil « 40 % Gartner »).
- **RES-034** (`Rituel consolidation 4 actions`) — seuils « promouvoir 3 / index > 50 / 30 min/mois ».
- **RES-045** (`Cadre mental par où commencer`) — « 3 couches / diagnostic ».
- **RES-029 / RES-056** — re-confronter (déjà 📁 local, risque plus faible).

**Méthode** : glance ciblé sur les chiffres (pas une re-distillation complète). **Folder dans le pré-vol Phase 4** OU dans le cycle RES-061 (3 Paradigmes, déjà `backlog_next:Phase3.5`) → 1 cycle combiné « distill 061 + verify stats mémoire », pas un sous-cycle isolé (économie budget, cf. `user_token-budget`).

## 2. Harmonisation des modèles de registres mémoire (RES-013 ↔ RES-029)

Trois modèles de registres coexistent ; MAS en a tranché un mais la doc n'est pas alignée :

| Source | Modèle | Statut MAS |
|--------|--------|-----------|
| RES-013 (`gouvernance.md`) | EDR / LEARNINGS / BLOCKERS / ITERATION_LOG / CONTEXT | **variante, pas mise à jour** |
| RES-029 / `project-doctrine.md §5` | decisions / learnings / blockers / journal / evals | **✅ canonique MAS** |
| RES-041 (`memory-patterns.md`) | ADR / LRN / EVAL (niveau 3 « jugement ») | sous-ensemble |

- **À faire** : dans `gouvernance.md` (RES-013), pointer le canonique RES-029 au lieu de re-décrire EDR/CONTEXT/ITERATION_LOG.
- **Nommage du registre de décisions** : `ADR-XXX` (RES-041) vs `EDR` (RES-013) vs **`BDR-XXX` (project-doctrine, RETENU)**. Même artefact → harmoniser sur **BDR**, choix assumé à tenir Phase 4.
- **Ne PAS faire** : renommer en silence dans un fichier sans aligner les autres (source d'incohérence ré-introduite).

## 3. Items déjà tracés ailleurs (pas dans cette carte)

- **RES-061** (3 Paradigmes) : `backlog_next:Phase3.5` dans l'INDEX — à distiller au pré-vol Phase 3.5 (combinable avec §1).
- **RES-003** (Architecture du contexte) : `watch` dans l'INDEX — distill vs watch tranché définitivement au pré-vol Phase 4 (besoin lecture profonde, design context-pack).

---

**Référence** : `docs/learning/2026-06-06-vibeflow-memoire-reaudit/build-report.md` (scan anti-stat + contradictions), `docs/knowledge/vibeflow/memoire.md` (§Pont §5.bis), `docs/knowledge/memory-patterns.md` (§RES-041), `docs/knowledge/project-doctrine.md §5`, `docs/workflows/knowledge-bootstrap.md §5.bis`.
