# Self-audit — Lean CLAUDE.md + audits réflexifs Batch 1

**Quoi.** Candidat self-audit (§13 CLAUDE.md « ré-auditer l'existant ») issu de la distillation Batch 1 Gouvernance/Agents (2026-06-04). Regroupe les signaux où une ressource pointe une dette potentielle de **nos propres artefacts** — à traiter au gate Phase 3.5, pas maintenant.

**Statut.** Backlog / self-audit. Aucune édition de `CLAUDE.md` n'a été faite pendant la distillation (consigne explicite). Cette carte note la dette, elle ne la corrige pas.

---

## 1. Lean CLAUDE.md (signal principal)

- **Origine** : **RES-012 DON'T#1** énonce la règle opérationnelle : *« Le CLAUDE.md doit faire moins de 200 lignes pour rester efficace. Chaque instruction doit être assez précise pour être vérifiable. »* (NB : le PDF `022-Lean claude.pdf` s'avère être la page **Overview des Claude Code Docs**, pas un guide « lean CLAUDE.md » — la règle provient donc de RES-012, vérifié au cycle index-reconciliation 2026-06-05.)
- **Constat** : notre `CLAUDE.md` est à **200 lignes pile** (`wc -l`, 2026-06-04). La règle RES-012 dit « < 200 » → **au seuil, pas largement au-dessus**, mais déjà non conforme à la cible et en croissance (13 sections + sous-sections 9.bis, 12, 13). Risque : dilution du signal, instructions non toutes « vérifiables » au sens binaire.
- **À auditer (Phase 3.5)** :
  - chaque instruction de CLAUDE.md est-elle **vérifiable** (binaire pass/fail) ou seulement déclarative ?
  - quelles sections peuvent migrer vers un fichier référencé (ex. §12 règles knowledge → déjà dans `docs/knowledge/`, §9.bis Inspiration → ADR 0001) en ne gardant que le pointeur ?
  - cible : noyau exécutoire court + renvois, sans perdre les règles non-négociables (§5 risky actions, §11 billing).
- **Ne PAS faire** : raccourcir mécaniquement en supprimant des garde-fous. Le but est densité de signal, pas suppression. La décision finale est humaine (Melvyn), pas l'agent (anti Delegation Feedback Loop, RES-036).
- **Lien** : c'est un cas d'application de DURCIR (RES-036, gouvernance.md) — une règle de niveau 3 (doctrine) doit être lue et appliquée, donc visible et vérifiable.

## 2. Audits réflexifs à faire tourner sur MAS lui-même (gate Phase 3.5)

Les frameworks distillés ce batch sont conçus pour auditer un projet existant. MAS **est** un projet existant → les retourner sur nous-mêmes (le projet se bootstrap avec sa propre méthode, `knowledge-bootstrap.md §4`) :

- **RES-024 — 4 piliers + grille verdict** : auditer les 6 fiches Tier A (Mandat / Périmètre / Checkpoints / Escalade). Verdict attendu par fiche : PRÊT PROD / STAGING / BLOQUÉ. Vérifier en particulier le **kill switch « hors de la stack »** (arrêt du worker indépendant de l'agent) et le **budget max par agent**.
- **RES-008 — 3 dettes (doc / technique / cognitive)** : score /30 attendu en zone « sain » (0-9) si la discipline tient. Sert de mesure objective de la santé du repo au gate.
- **RES-023 — prompt audit 6-checks** : chevauchements / zones grises entre Tier A (Reviewer vs Quality Controller vs Sec Reviewer) — vérifier qu'aucune responsabilité n'est sans propriétaire.
- **RES-015 — Q10 « testé sur un cas limite »** : ajouter ce critère aux Verification Criteria des `mas-*` SKILL.md et des fiches.

## 3. Quand / comment

- **Quand** : au **gate Phase 3.5** (self-audit de phase, `CLAUDE.md §13`). Pas avant — hors scope Phase 3.
- **Comment** : via le mission lifecycle (l'audit décide, ne réimplémente pas l'exécution). Sortie attendue : rapport `docs/workflows/phaseN-self-audit-*.md` + dette corrigée OU backloguée.
- **Ré-audit** : à chaque gate de phase suivant (la longueur de CLAUDE.md ne fera que croître si non surveillée).

---

**Référence** : `docs/knowledge/vibeflow/gouvernance.md` (RES-024/008/012), `docs/knowledge/vibeflow/agents-skills.md` (RES-023/015), `docs/workflows/knowledge-bootstrap.md §5`, `docs/workflows/intake-audit-template.md`.
