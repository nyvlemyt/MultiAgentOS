# Backlog — contrat de rapport de mission (C3)

**Statut** : À FAIRE — noyau lot 1, Phase 9. **Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P3 + P4 + P22).
**Décision d'intake** : `implement_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.

## Le problème

`reports` (`packages/db/src/schema.ts:344-360`) stocke `humanMd` / `ai` / `diff` — trois champs
libres. Rien n'impose un TL;DR, un verdict, le périmètre **non** couvert, ni une preuve. Un rapport
peut donc affirmer « c'est fait, ça marche » sans qu'aucune commande n'ait été exécutée, et personne
ne le voit.

Le cockpit OtakuGO impose 9 sections + un verdict binaire + la règle « commande exacte et sortie
collée ». Trente-quatre missions montrent que ça tient, y compris les jours où ça va vite.

Le morceau qui vaut le plus est **P22** : les hypothèses de fragilité sont écrites par **celui qui
produit**, avant le verdict. MAOS n'a l'adversarial que côté relecteur — c'est le seul endroit du
lot qui corrige ce trou.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- `apps/web/lib/mission-report.ts` — `FinalReportContent` (what/why/how/tests) avec un commentaire
  **SEAM** explicite : « quand le vrai agrégateur arrive, on remplace ce corps ; le stockage et la
  page ne bougent pas ». C'est l'accroche prévue.
- `apps/web/lib/mission-progress.ts` — index par tâche déjà construit (pur, sans I/O).
- `ReviewerVerdict` existe déjà dans `@mas/core`, produit par les 4 critiques (`packages/agents/src/reviewers.ts`).

## Le travail

1. **Remplir le SEAM** de `mission-report.ts` au lieu d'ouvrir un chantier parallèle.
   `FinalReportContent` gagne : TL;DR (2 lignes) · Verdict · Périmètre couvert **et non couvert** ·
   Décisions (table) · Fichiers touchés · Vérifications (commande + extrait collé borné) ·
   **Hypothèses de fragilité ≥ 3** (chacune vérifiée ou déclarée non vérifiée) · Contradictions &
   risques · Questions ouvertes · Prochaine étape recommandée.
2. **Colonne `reports.verdict`** (+ migration) réutilisant le type `ReviewerVerdict` existant —
   pas de nouvelle énumération à maintenir en parallèle.
3. **Validateur Zod** exécuté à l'archivage : sections présentes, verdict posé, preuves non vides.
4. **`mas-reviewer`** refuse un rapport de mission sans preuve collée.
5. La « Prochaine étape recommandée » lit la `nextAction` de la première tâche non done
   (voir `reprise-universelle-next-action.md` — même fait, deux granularités, une seule vérité).
6. **Brancher la couture laissée par C1** : `collectMissionFacts` (`apps/web/lib/mission-facts.ts`)
   renvoie `reportVerdict: null` en dur tant que la colonne n'existe pas. Une fois `reports.verdict`
   migrée, lire le verdict du dernier `reports` de la mission (`kind = 'mission'`, le plus récent) et
   le passer dans les faits — la règle pure et ses tests existent déjà côté C1, rien d'autre à écrire.
   Détail de la couture : `docs/backlog/statut-verite-reconciliation.md` §Corrections a).

**Ce qu'on ne fait pas** : les rapports de **tâche** gardent leur format court. Le contrat lourd ne
s'applique qu'au niveau mission (discipline token, CLAUDE.md §6).

## Critère de sortie (binaire)

- [ ] L'archivage d'une mission dont le rapport ne passe pas le validateur est **refusé** (test).
- [ ] Une mission de démo archivée expose les 10 sections (dont Hypothèses de fragilité ≥ 3)
      + le verdict en DB.
- [ ] Un rapport de mission sans preuve collée est rejeté par `mas-reviewer` (test).
- [ ] `collectMissionFacts` lit `reports.verdict` (plus `null` en dur) et un test montre qu'un
      verdict `BLOCK` sur une mission déclarée `validated` sort `desynced = true`.
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).
