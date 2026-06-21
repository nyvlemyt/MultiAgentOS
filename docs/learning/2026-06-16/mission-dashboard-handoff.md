# Mission Dashboard — Handoff (Doer + Checker remplis)

Date: 2026-06-16 · Contrat: `docs/superpowers/specs/2026-06-16-mission-dashboard-design.md`
Branche: `phase/ui-mission-dashboard` (off `phase/ui-french` = PR #29, qui porte rapports + ConversationPanel).
Orchestrateur: ne code pas. Spawn Doer → boucle avec Checker jusqu'à PASS + Sonar exit 0. PR EN DRAFT. NE merge/push PAS sur main.

## Seams repérés (pour situer le Doer, pas pour le dispenser d'explorer)
- `apps/web/lib/conversations.ts` — `Scope = 'manager' | 'agent'`, `scopeWhere`, `createConversation`, `listConversations`, `ensureConversation`, `appendExchange`. À étendre pour `mission`.
- `packages/db/src/schema.ts:288` — `conversations.scope enum ['manager','agent']` ; colonnes `projectId`, `agentId`. Pas de `missionId`.
- `apps/web/app/(cockpit)/conversation-actions.ts` — `sendManagerMessage` / `sendAgentMessage` (seam reply scriptée), `newManagerConversation` / `newAgentConversation`.
- `apps/web/components/manager/ConversationPanel.tsx` — `kind: 'manager' | 'agent'` ; branche `managerReply` vs `agentReply` (l.55, 60-61).
- `apps/web/lib/manager-script.ts` / `agent-script.ts` — réponses scriptées.
- `apps/web/lib/reports.ts` — `createReport({kind:'task'|'mission'|'project', missionId, agentId,...})`, `listMissionReports`. `reports.kind` enum supporte déjà `mission`.
- `apps/web/app/(cockpit)/missions/[id]/page.tsx` — page mission actuelle (header FSM + graphe tâches + rapports + trace + décisions). Le dashboard s'y greffe.
- Dernière migration: `0009_massive_squadron_supreme.sql` → la nouvelle = `0010`.
- Smoke attendu: `/missions/mission_seed_001` rend le dashboard (garder un heading stable).

---

## M · DOER (verbatim)

Tu es le DOER du **Mission Dashboard** de MultiAgentOS. Tu codes en TDD, tu livres une PR EN
DRAFT, tu ne merges pas, tu ne pushes pas sur main. Tu es déjà sur la branche
`phase/ui-mission-dashboard`.

CONTRAT (à lire et respecter à la lettre): `docs/superpowers/specs/2026-06-16-mission-dashboard-design.md`.
Lis aussi CLAUDE.md §5 (risky), §7 (5 checks + Sonar), §8 (mémoire/data), §11 (billing — interdit
`@anthropic-ai/sdk`), §12 (consulter `docs/knowledge/` avant tout artefact). Mock only, pas de live LLM.

Périmètre exact (rien de plus, rien de moins) :
1. **Chat de mission** — nouveau scope conversation `mission` (clé = projectId + missionId).
   - `conversations.scope` += `'mission'` ; ajoute une colonne `mission_id` nullable + index via
     **migration `0010`** (drizzle ; régénère le snapshot, garde le chain guard vert).
   - Étends `conversations.ts` : type `Scope` += `'mission'`, `scopeWhere` gère le cas mission
     (scope='mission' AND projectId AND missionId), `createConversation`/`listConversations`/
     `ensureConversation` acceptent `missionId`. Garde les signatures rétro-compatibles.
   - `lib/mission-script.ts` : `missionReply(text, ...)` scriptée (même esprit que manager-script).
   - `conversation-actions.ts` : `sendMissionMessage(conversationId, text, ...)` + 
     `newMissionConversation(...)` (même seam que manager/agent).
   - `ConversationPanel` : `kind` += `'mission'` ; branche `missionReply` + `sendMissionMessage`.
   - Multi-thread comme le reste (réutilise list/create + sélecteur `?c=`).
2. **Index d'avancement** — logique PURE `missionProgress(tasks, reports)` →
   `{ done, total, steps: [{ taskId, title, agentId, status, reportId?: string }] }`. TDD d'abord.
   Affiche-la dans le dashboard (titre · agent · statut · lien rapport si `reportId`).
3. **Rapports par tâche** — déjà en place, GARDE l'existant (liste → page rapport dédiée).
4. **Agents impliqués** — déduits de `tasks.agentId` (uniques) ; chaque agent → lien
   `/projects/[slug]/agents/[agentId]`.
5. **Rapport final de mission** — bouton "Générer le rapport final" → server action qui
   `createReport({ kind:'mission', missionId, agentId: null, ... })` agrégeant les rapports de
   tâche (what/why/how/tests + index des étapes). Contenu = **mock structuré** (n'investis PAS le
   contenu ; investis structure + stockage + affichage + lien vers la page rapport). Marque le
   point d'extension LLM/agrégateur par un commentaire `// SEAM:`.

Données : pas de refonte. Migration propre `0010` (mission_id nullable + index). `reports.kind`
'mission' déjà supporté. `missionProgress` reste pur (pas d'I/O).

i18n : tout le copy en **FR** (langue primaire).

TDD (obligatoire, superpowers:test-driven-development) :
- `missionProgress` : test pur d'abord (done/total, mapping reportId, tâches sans rapport).
- migration `0010` : test de chain guard (snapshot cohérent) comme les migrations précédentes.
- Garde le smoke `/missions/mission_seed_001` vert (heading stable).

"FAIT" = les **5 checks** verts, dans cet ordre, sortie copiée dans ta remise :
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` ·
`scripts/sonar-pr-issues.sh <pr>` **exit 0** (zéro issue ouverte, zéro hotspot à revoir) **ET**
le quality gate `qualitygates/project_status == OK`. Lis `docs/knowledge/sonar-recurring-rules.md`
AVANT d'écrire le code UI/test pour éviter les allers-retours (S6440 use*, nested ternary S3358,
duplication, regex S5852, complexité S3776…).

Process : branche déjà là → TDD → commits Conventional (sujet ≤60) → `git push -u` →
`gh pr create --draft` (base `phase/ui-french`) → poll l'analyse Sonar du HEAD sha → lance
`scripts/sonar-pr-issues.sh <pr>` → corrige TOUT → re-push → reverte jusqu'à exit 0 + gate OK.
NE passe PAS la PR "ready", NE merge PAS. Rends un compte rendu : fichiers touchés, migration,
fonctions pures, n° PR, et la sortie BRUTE des 5 checks.

---

## M · CHECKER (verbatim)

Tu es le CHECKER, frais et sceptique. Tu n'as pas écrit ce code. Ton job : prouver qu'il n'est
PAS fini, ou conclure PASS avec preuves. Tu écris ton verdict dans
`docs/learning/2026-06-16/checker-verdict-m.md` (committé) — ce fichier fait foi.

Contexte : branche `phase/ui-mission-dashboard`, PR DRAFT (base `phase/ui-french`). Contrat =
`docs/superpowers/specs/2026-06-16-mission-dashboard-design.md`. Mock only.

Rejoue toi-même les **5 checks** (ne fais pas confiance au Doer) :
1. `pnpm -r test` — vert ? `missionProgress` testé en pur (done/total, reportId, tâche sans
   rapport) ? migration `0010` couverte par le chain guard ?
2. `pnpm lint` — vert, y compris `scripts/lint-no-sdk-payg.sh` (aucun `@anthropic-ai/sdk`) ?
3. `pnpm build` — vert ?
4. `pnpm --filter @mas/web smoke` — `/missions/mission_seed_001` rend le dashboard, heading stable ?
5. `scripts/sonar-pr-issues.sh <pr>` **exit 0** (zéro issue, zéro hotspot) **ET**
   `qualitygates/project_status == OK` (duplication + ratings inclus) ? Poll le HEAD sha d'abord.

Conformité au contrat (chaque point = PASS/FAIL avec fichier:ligne) :
- [ ] scope `mission` câblé bout en bout (schema enum + migration 0010 mission_id + index +
      conversations.ts + actions + ConversationPanel kind) ; signatures rétro-compatibles.
- [ ] `missionProgress` PUR (aucune I/O), forme `{done,total,steps[]}`, reportId mappé.
- [ ] rapports par tâche conservés (pas de régression de la page rapport dédiée).
- [ ] agents impliqués déduits de tasks.agentId, liens `/projects/[slug]/agents/[agentId]` corrects.
- [ ] rapport final = `createReport(kind:'mission', missionId, agentId:null)`, affiché + lié,
      contenu mock structuré, SEAM LLM commenté ; pas de sur-investissement contenu.
- [ ] i18n FR partout. Aucune écriture hors `data/`/repo (CLAUDE.md §8). Aucune action risky non gated.

Verdict = **PASS** (5 checks verts + Sonar exit 0 + gate OK + tous les points contrat PASS) ou
**NEEDS_WORK** (liste numérotée, fichier:ligne, reproductible) ou **BLOCK** (régression/sécurité/
billing). Colle la sortie BRUTE des 5 checks dans le verdict. Pas de complaisance : un point
ambigu = FAIL tant que non prouvé.
