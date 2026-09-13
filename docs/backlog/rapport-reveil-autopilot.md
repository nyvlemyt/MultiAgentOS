# Backlog — rapport réveil autopilote (C8)

**Statut** : À FAIRE — lot 2, Phase 9. **Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P10).
**Décision d'intake** : `adapt_now` · T2 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.
**Dépend de** : `contrat-rapport-mission.md` (réutilise ses sections).

## Le problème

L'autopilote tourne la nuit et produit un bilan de chiffres. Au réveil, tu vois « 3 missions
avancées, 1 bloquée, 7 tâches faites » — des compteurs, pas un verdict. Rien ne te dit **ce qui
mérite ton attention en deux minutes**, ce que tu dois trancher, ni comment relancer.

Le cockpit OtakuGO a inventé le rapport « ☀️ Réveil » : verdict en tête, parcours guidé, section
« à valider par toi », « où tout se trouve », prompt de relance. La nuit devient inspectable en
cinq minutes.

## Ce que MAOS a déjà (vérifié 2026-08-14) — la moitié du travail est faite

C'est la carte où l'audit s'est le plus trompé : il la disait absente et à repousser après
l'activation de l'autopilote. Les deux sont faux.

- `packages/agents/src/daily-report.ts` — `emitDailyReport` **existe et tourne** : il journalise un
  event `daily_report` (missions avancées, bloquées, tâches faites, validations pending, quota,
  et les verdicts de l'Agent-Evaluator tallés par catégorie) **et** persiste un markdown dans
  `data/reports/<date>.md` via `toMarkdown` (l.100-133). Il n'écrit jamais dans `data/memory/` (§8 respecté).
- `apps/web/lib/autopilot.ts:90` — `latestDailyReport` le relit.
- `apps/web/app/(cockpit)/page.tsx:165-171` — la carte est **déjà rendue** au cockpit ;
  `lib/i18n.ts:26-32` porte déjà ses libellés fr/en.
- L'autopilote Phase 6 est vivant : table `schedules`, `runAutopilotTick`, `autopilot-tick.test.ts`.

Conclusion : ce n'est pas une construction, c'est un **habillage**. Le motif KILL « carte dormante
tant que l'autopilote n'existe pas » ne tient plus.

## Le travail

1. **Étendre `toMarkdown`** (`daily-report.ts`) aux 5 sections réveil, en réutilisant le vocabulaire
   du contrat de rapport C3 :
   - **Verdict en tête** (PASS / NEEDS_WORK / BLOCK sur la fenêtre) ;
   - **Ce que tu remarques en 2 minutes** — les 3 faits saillants, pas les compteurs bruts ;
   - **À valider par toi** — validations pending + décisions en attente, nommées (CLAUDE.md §14) ;
   - **Où tout se trouve** — chemins des artefacts produits pendant la fenêtre ;
   - **Prompt de relance** — consomme le générateur de `prompt-a-coller-par-mission.md`.
2. **Enrichir `DailyReport`** des champs manquants pour alimenter ces sections (faits saillants,
   artefacts) — calculés depuis les events de la fenêtre, déterministe, sans LLM.
3. **Rendu dédié au cockpit** : remplacer la ligne de compteurs de `page.tsx` par le rendu à
   sections, la section « à valider par toi » **visible**, pas repliée.

**Ce qu'on ne fait pas** : pas de nouvel event, pas de nouvelle table, pas de second chemin de
persistance. On garde `daily_report` + `data/reports/<date>.md`.

## Critère de sortie (binaire)

- [ ] À la fermeture d'une fenêtre autopilote de test (≥ 1 tâche exécutée), le rapport porte les
      **5 sections non vides** et est visible dans l'UI.
- [ ] 100 % des fenêtres de test produisent un rapport (aucune fenêtre muette).
- [ ] Le markdown persisté dans `data/reports/<date>.md` porte les mêmes 5 sections que l'UI (test).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).
