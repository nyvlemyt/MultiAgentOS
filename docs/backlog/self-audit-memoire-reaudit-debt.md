# Self-audit — dette du cycle mémoire-reaudit (2026-06-06)

**Quoi.** Candidat self-audit (§13 CLAUDE.md « ré-auditer l'existant ») issu du cycle `2026-06-06-vibeflow-memoire-reaudit`. Le cycle a distillé RES-060 + RES-041 en entier mais a **différé deux dettes pour cause de budget** (lecture PDF-images lourde). Cette carte les capture pour qu'elles ne se perdent pas — à traiter au **pré-vol Phase 4** (mémoire = la phase qui suit), pas via un sous-cycle dédié.

**Statut.** Backlog / self-audit. Aucune correction faite ici. Cible : pré-vol Phase 4.

---

## 1. Re-vérification anti-stat-inventée des distillations ère-MCP (priorité haute) — ✅ RÉSOLU (2026-06-07)

> **✅ APURÉ — cycle `2026-06-07-vibeflow-paradigmes-statsweep`.** Stat-sweep ciblé exécuté contre les PDFs. **Résultat : 0 statistique fabriquée présentée comme sourcée** — aucun « 40 % Gartner » dormant dans les distillations mémoire. Toutes les valeurs citées comme sourcées sont présentes verbatim (avec page) dans les PDFs. Détail + table complète : `docs/learning/2026-06-07-vibeflow-paradigmes-statsweep/build-report.md` ; trace dans `memoire.md` (note de clôture). Ci-dessous = la cible historique, conservée pour traçabilité.

Les sections mémoire **distillées sous l'ère MCP** (sources 404, jamais re-confrontées au PDF) n'avaient **pas** été re-vérifiées au cycle 06-06. Risque = chiffre fabriqué présenté comme sourcé (piège « 40 % Gartner » du cycle gouvernance).

Re-vérifié contre PDF (par priorité de risque) :
- **RES-044** (`Rituel close-out 3 champs`) — friction « n°9 / n°10 » (sub-agents MCP p8 / 200+ entrées-3 mois p8-9) → **verbatim ✅**. Nuance : PDF dit « Exemple 9/10 » (tous deux frictions).
- **RES-034** (`Rituel consolidation 4 actions`) — « promouvoir 3 » (p8) / « index > 50 » (p9) / « 30 min/mois » (p5) → **verbatim ✅**.
- **RES-045** (`Cadre mental par où commencer`) — 3 couches (p4-5) / diagnostic 3 questions (p6-7) → **verbatim ✅**.
- **RES-029 / RES-056** (recoup) — RES-029 « 95 % » = headline PDF **non propagé** ✅ ; RES-056 « ≤500 tokens » = choix budget MAS (pas dans le PDF, mais présenté comme MAS, pas comme sourcé) → observation mineure, pas une correction.

**Méthode appliquée** : glance ciblé sur les chiffres (pas une re-distillation), via `pdftotext -layout` (couche texte présente sur les 6 PDFs). Cycle combiné « distill 061 + verify stats mémoire » comme prévu (économie budget, cf. `user_token-budget`).

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

- **RES-061** (3 Paradigmes) : ✅ **distillé** `gouvernance.md §RES-061` (cycle 06-07, en même temps que §1) + cross-ref `agent-patterns.md`. ⚠️ a fait émerger une contradiction interne vibeflow : « CLAUDE.md < 150 lignes » (RES-061) vs « < 200 lignes » (RES-012) — à trancher dans `self-audit-lean-claude-md.md`, non résolu ici.
- **RES-003** (Architecture du contexte) : `watch` dans l'INDEX — distill vs watch tranché définitivement au pré-vol Phase 4 (besoin lecture profonde, design context-pack).

---

**Référence** : `docs/learning/2026-06-06-vibeflow-memoire-reaudit/build-report.md` (scan anti-stat + contradictions), `docs/knowledge/vibeflow/memoire.md` (§Pont §5.bis), `docs/knowledge/memory-patterns.md` (§RES-041), `docs/knowledge/project-doctrine.md §5`, `docs/workflows/knowledge-bootstrap.md §5.bis`.
