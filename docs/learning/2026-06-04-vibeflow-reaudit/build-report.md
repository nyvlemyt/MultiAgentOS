# Build-report — cycle `2026-06-04-vibeflow-reaudit` (DOER)

**Rôle** : Doer. **Date** : 2026-06-04. **Working tree** : modifié, **NON commité** (le Checker audite, l'orchestrateur tranche le commit).

## Périmètre

Ré-auditer la distillation vibeflow (Batch 1, faite avant sur sources MCP incomplètes / 404) contre les PDFs réels de `docs/ressources/`. Cycle ciblé sur les **2 findings** déjà confirmés par un vérificateur (cf. `PROMPTS.md` §SCOPE), pas une reprise exhaustive :

1. `gouvernance.md §RES-024` : stat « 40 % Gartner » présentée comme sourcée mais **absente** du PDF « Audite tes agents IA en 10 minutes ».
2. PDF « Structurer la gouvernance AVANT de déployer tes agents IA » **lu mais non distillé** au Batch 1 (4 piliers détaillé + checklist pre-deploy + contract.yaml long-form). Trancher le mapping RES, distiller le net-new ou justifier le skip.

> Note contexte git : le working tree contient AUSSI les changements Batch 1 (encore non commités). Ce rapport ne couvre que les **deltas de ce cycle** (voir §Fichiers touchés).

## Table RES ↔ PDF (vérifiée par ouverture des PDFs)

| RES / doc | PDF `docs/ressources/` | Statut mapping |
|-----------|------------------------|----------------|
| RES-024 | `Audite tes agents IA en 10 minutes (framework 4 piliers).pdf` | ✅ sûr (audit de l'existant) |
| RES-023 (candidat A) | `Gouverner tes Agents IA Templates + Prompts.pdf` | ⚠️ nommé « le guide Gouverner tes agents IA » par RES-024 |
| RES-023 (candidat B) | `Structurer la gouvernance AVANT de déployer tes agents IA.pdf` | ⚠️ fit INDEX « cadrage→monitoring » + contrat 100+ lignes |
| RES-040 | `RES-040 — 3 dérives silencieuses…pdf` (seul PDF portant son n°) | ✅ |

**Conflit de mapping non tranché à 100 %** : deux preuves se contredisent.
- Preuve titre : RES-024 (p.6) dit « RES-023 (le guide *Gouverner tes agents IA*) te donne la structure avant de déployer » → pointe **candidat A**.
- Preuve contenu : RES-024 (section contract.yaml) dit « la version longue 100+ lignes est dans RES-023 » → seul **candidat B** contient ce contrat 100+ lignes ; et l'INDEX décrit RES-023 « cadrage→monitoring » (lifecycle complet) = candidat B.

**Décision Doer** : ne PAS renuméroter de force. Garder la distillation existante de A sous le label RES-023 dans `agents-skills.md` (contenu fidèle au PDF A), et distiller B comme **compagnon explicite** dans `gouvernance.md` avec un encart « mapping non tranché ». Les deux PDFs sont réels, lus, fidèlement distillés ; seule l'étiquette numérique reste ambiguë → **question ouverte pour l'orchestrateur** (cf. §Questions).

## Table décisions

| Ressource | Décision | Justification |
|-----------|----------|---------------|
| Fix #1 « 40 % Gartner » | **adapt_now (correction)** | stat réelle mais d'un autre PDF (« Structurer AVANT » p.5) ; retirée de l'ouverture RES-024, re-sourcée dans la section compagnon |
| « Structurer AVANT » (net-new) | **adapt_now** | net-new réel : 4 piliers détaillés (MANDATE/SCOPE/CHECKPOINTS/ESCALATION.md), pre-deploy 10-Q (Escalade ×4), contract.yaml long-form 100+ lignes. Mappe permissions.json + fiche + budget. Cible cloud (Managed) rejetée §11 |
| Découpage 4-fichiers par agent | **reject (archi)** | verbeux, inutile pour single-user ; MAS garde 1 fiche/agent (RES-048). On extrait la structure des champs, pas le multi-fichier |

## Fichiers touchés (deltas de CE cycle)

- `docs/knowledge/vibeflow/gouvernance.md` — (a) ouverture RES-024 corrigée (retrait/re-source 40 %) ; (b) **nouvelle section** « Structurer la gouvernance AVANT de déployer » (4 piliers détaillé + pre-deploy 10-Q + contract.yaml long-form + 40 % correctement sourcé + Application MAS) ; (c) ligne synthèse + note ré-audit.
- `docs/knowledge/vibeflow/agents-skills.md` — encart « Source / mapping » ajouté à la section RES-023 (clarifie PDF source A + renvoi au compagnon B + ambiguïté).
- `docs/knowledge/vibeflow/INDEX.md` — ligne RES-023 enrichie (2 PDFs + ⚠️ mapping non tranché) ; note ré-audit ajoutée.
- `docs/learning/2026-06-04-vibeflow-reaudit/build-report.md` — ce fichier.

**Aucun nouveau fichier de knowledge** (consigne respectée). Aucune édition de `CLAUDE.md`. Aucun code/config/.env touché (`pnpm-lock.yaml` modifié = préexistant, hors scope, à exclure du commit).

## Fidélité — écarts corrigés / vérifiés

- **40 % Gartner** : confirmé absent du PDF RES-024 (« Audite 10 min »), présent dans « Structurer AVANT » p.5 (« 40 % des initiatives agentiques sont annulées avant la fin (source : Gartner) »). Misattribution corrigée.
- **Scan anti-stat-inventée des sections Batch 1** (ouvert PDF + passage) : 95 %/5 %/200 lignes/50k tokens (RES-012), score /30 + seuils 0-3/4-6/7-10 (RES-008), $0.08/h + 8 avril 2026 + Brain/Hands/Session (RES-016), 90 % automatisations déguisées (RES-015), score /10 + 5 patterns (RES-023). **Toutes présentes dans leurs PDFs respectifs.** Seul le 40 % était mal attribué.
- Contenu RES-024 (4 piliers condensé, verdict PROD/STAGING/BLOQUÉ/ARRÊTER, contract.yaml minimal 30 lignes, risques systémiques, cas spécial Q10 kill switch) : re-vérifié présent dans le PDF RES-024 — distillation Batch 1 fidèle, hors le 40 %.
- Net-new « Structurer AVANT » distillé fidèlement depuis les 14 pages (4 fichiers par pilier, pre-deploy 10-Q avec poids Escalade ×4 et Q9 mode dégradé / Q10 kill switch hors stack, arbre contract.yaml complet).

## Contradictions signalées (pas intégrées en silence)

- **Managed Agents = cible cloud PAYG ($0.08/h + tokens)** dans « Structurer AVANT » et RES-016 → **interdit CLAUDE.md §11**. Framework 4 piliers **adopté en local** ; cible cloud **rejetée** explicitement dans la section (Application MAS, dernière puce). Cohérent avec le traitement RES-016 (Batch 1).
- **Découpage 4-fichiers par agent** contredit notre « 1 fiche ≤200 lignes » (RES-048) → signalé et **non adopté** (extraction de la structure de champs uniquement).

## Questions ouvertes (pour l'orchestrateur)

1. **Mapping RES-023** : trancher A (« Gouverner Templates+Prompts ») vs B (« Structurer AVANT ») ? Preuves contradictoires documentées ci-dessus. Option propre possible : assigner B = RES-023 (lifecycle cadrage→monitoring + contrat 100+ lignes) et A = un autre n° / doc compagnon non numéroté. Je n'ai pas renuméroté pour éviter la churn avant ton arbitrage.
2. Le PDF « Structurer AVANT » n'est dans **aucune ligne RES de l'INDEX** (table RES-keyée). Le laisser comme « compagnon RES-024 / candidat RES-023 » documenté, ou lui créer une entrée propre une fois le mapping tranché ?

## Passe de correction post-verify (2026-06-04, Doer pass 2)

Verify-report rendu **PASS** (que des 🟡, zéro 🔴/🟠). Findings 🟡 corrigés dans la limite du scope Doer :

| Finding verify | Action | Fichier |
|----------------|--------|---------|
| 🟡 label « compagnon RES-024 » (header) vs « candidat RES-023 » (corps/INDEX) | header neutralisé → « candidat RES-023 / compagnon RES-024 » (les 2 labels portés ensemble, ambiguïté reste explicite, mapping toujours escaladé à l'orchestrateur) | gouvernance.md (header section) |
| 🟡 « 40 % Gartner » cité « p.4 » | corrigé **p.4 → p.5** (2 occurrences) | build-report.md (ce fichier) |
| 🟡 self-audit « dépasse largement 200 lignes » | corrigé : `wc -l CLAUDE.md` = **200 pile** → « au seuil (règle < 200), pas largement au-dessus » | self-audit-lean-claude-md.md |
| 🟡 RES-015 « 6 erreurs » tableau tronqué | softener fidélité §12 : (1)(2) marquées **confirmées verbatim**, (3)-(6) marquées **à confirmer** (recoupent les thèmes du doc). Re-lecture page 10 = tableau toujours tronqué au rendu PDF, non résoluble | agents-skills.md |
| 🟡 `pnpm-lock.yaml` working tree | no-op : déjà exclu du commit proposé (carry-over Batch 1) | — |

Aucun nouveau finding introduit. Aucune édition CLAUDE.md / code / .env. Working tree toujours non commité.

## Commit proposé (NE PAS exécuter avant verdict Checker + arbitrage orchestrateur)

```bash
git add docs/knowledge/vibeflow/gouvernance.md \
        docs/knowledge/vibeflow/agents-skills.md \
        docs/knowledge/vibeflow/INDEX.md \
        docs/backlog/README.md \
        docs/backlog/self-audit-lean-claude-md.md \
        docs/learning/
git commit -m "docs(knowledge): reaudit vibeflow batch 1 — fix 40% misattribution, distill 'Structurer AVANT' framework"
```

Exclure `pnpm-lock.yaml` (modif préexistante, hors apprentissage). NB : ce commit emporterait aussi les deltas Batch 1 encore non commités — l'orchestrateur décide s'il sépare en 2 commits (Batch 1 distill + reaudit) ou les fusionne.

**STOP** — aucune phase de build. Working tree laissé modifié pour audit du Checker.
