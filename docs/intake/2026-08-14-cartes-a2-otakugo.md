# Intake — les 13 cartes A2 (patterns cockpit OtakuGO → MAOS)

> Dossier d'intake **par lot** (skill `intake-audit`, règle « wide-bar + tiers » du §7).
> Un lot = un dossier ; chaque carte porte sa propre décision, ses propres scores, son propre KILL.
> Entrée : `docs/audits/otakugo/A2-patterns-cockpit.md` (22 patterns jugés, PASS passe 2, 2026-08-13).
> Ce dossier **décide et adapte** ; il n'intègre pas (le cycle de mission exécute).
> Date : 2026-08-14 · Re-audit : à la sortie de la Phase 9 Étape 1, ou si une carte n'a pas
> bougé de statut 60 jours après sa création (voir §Re-audit).

## 0. Garde-fous (rappel avant toute décision)

| Contrainte | Portée sur ce lot |
|---|---|
| §11 facturation | Aucune carte n'introduit de dépendance PAYG ni `ANTHROPIC_API_KEY`. Les cartes qui touchent au routage modèle (C13) restent sous `RouterLLMClient` / abonnement. |
| §8 mémoire | Aucune carte n'écrit dans `data/memory/` — seul le Memory Keeper le fait. C2 (registre des retours) vit dans `ideas`, **pas** dans la mémoire. |
| §5 actions risquées | C9 renforce le gating (portique anti-commit-auto), ne l'affaiblit pas. Aucune carte ne crée de chemin d'écriture non gaté vers un projet externe. |
| §2 stack verrouillée | Aucune carte n'introduit de framework. Tout tient dans Next 15 / Drizzle / Vitest. Zéro ADR requis. |
| ≤7 outils par agent | Aucune carte n'ajoute d'outil à un agent Tier A. |
| Phase | Phase courante = **9 · Exploitation & Auto-construction** (Étape 0/1). Les cartes du noyau y sont dedans ; le reste part en `backlog_next` daté. |

## 1. Sanitize — vérification indépendante (§4.bis)

Scan re-exécuté ce jour sur les 10 fichiers d'audit (je n'ai pas fait confiance au verdict A3) :

```
grep -nEc "AKIA…|BEGIN PRIVATE KEY|gh[pousr]_…|github_pat_…|JWT|db-url-with-creds|email-perso" docs/audits/**
→ 0 sur les 10 fichiers
```

- **CRITICAL : 0.** Aucune clé, aucun token, aucune URL de base à identifiants, aucun e-mail personnel.
- **INFO** : la seule famille de correspondances « internal refs » est `/Users/melvyn/` — chemin
  du propriétaire dans son propre dépôt local-first. Attendu, non traité comme fuite.
- Les cartes ne transportent **aucun code exécutable externe** (ce sont des descriptions de
  pattern), donc pas de réécriture maintainer-safe ni d'en-tête Prompt Defense à appliquer :
  aucune de ces 13 cartes ne devient un agent ou un skill importé tel quel.

**Sanitize : PASS.**

## 2. Ce que la vérification dans le code a changé

A2 a jugé les patterns en lisant MAOS ; cette passe a **relu le code ligne à ligne** pour chaque
carte. Cinq écarts significatifs, qui modifient le contenu ou le rang des cartes.

| # | Ce que disait A2 | Ce que le code dit | Conséquence |
|---|---|---|---|
| **C8** | « format Réveil absent », à séquencer avec l'autopilot Phase 6 | `packages/agents/src/daily-report.ts` **émet déjà** un event `daily_report` (missions avancées/bloquées, tâches faites, validations pending, quota, verdicts Agent-Evaluator) ; `apps/web/lib/autopilot.ts:90` le lit ; `i18n.ts:26-32` porte déjà `card.dailyReport*` rendu au cockpit. L'autopilot Phase 6 **existe** (`schedules`, `runAutopilotTick`, `autopilot-tick.test.ts`) | La carte n'est plus « construire un rapport réveil » mais « **habiller les 5 sections réveil sur le rapport quotidien existant** ». Coût divisé ; le motif KILL « carte dormante » tombe. **C8 remonte** |
| **C9** | Panneau « à committer » alimenté par un `git status` lecture seule | MAOS n'a **aucun** `git status` (grep = 0) mais a déjà `sandbox-diff.ts` (`validateDiffApplies`, `git apply --check`, non mutant) et `review-gate.ts` qui **exige `diffValid`** avant approbation | Le modèle MAOS est **diff-first**, pas working-tree-first. La carte devient « surface du diff en attente + message de commit préparé », branchée sur `sandbox-diff`, pas un nouveau lecteur git |
| **C1** | Ajouter un heartbeat worker + fonction de réconciliation | `events` est déjà indexée `(missionId, createdAt)` (schema.ts:200) → **l'âge du dernier event est déjà un signal de vie interrogeable**, sans nouvel émetteur. Et `apps/web/lib/health.ts:23` porte déjà exactement la doctrine visée (calcul au read, aucune table, déterministe, `now: Date` injecté) | v1 livrable **sans toucher au worker** : la réconciliation s'écrit à côté de `computeProjectHealth`, même fichier, même contrat. Le heartbeat dédié devient un raffinement v2, pas un prérequis |
| **C3** | Nouveau template de rapport + colonne `verdict` | `apps/web/lib/mission-report.ts` a déjà `FinalReportContent` (what/why/how/tests) avec un commentaire **SEAM** explicite (« swap this body quand le vrai agrégateur arrive, le stockage et la page ne bougent pas ») ; `mission-progress.ts` fournit l'index par tâche ; `ReviewerVerdict` existe déjà dans `@mas/core` | La carte **étend le contrat existant** au lieu d'en créer un parallèle, et réutilise le type verdict déjà partagé par les 4 critiques. Pas de nouvelle énumération |
| **C5 + C13** | Deux cartes distinctes | Les deux ajoutent **un champ au même type** (`PlannerTask`, `packages/core/src/llm.ts:112-121`), touchent le même skill planner, la même résolution dispatch et le même fichier de tests | **Fusion en une carte** « contrat de tâche enrichi ». 13 cartes → 12 |

Deux confirmations sèches, sans surprise : **C4** est bien absent (`mission-script.ts` est un mock de
chat, pas un exporteur de prompt) et **C7** aussi (22 `route.ts`, zéro `API.md`).

## 3. Décisions par carte

Scores 0-5 sur `fit · tokens · sûreté · effort(5 = peu d'effort) · preuve · valeur · phase`.
Tier : **T1** = touche la colonne vertébrale (orchestration, mémoire, sécurité, intake, dispatch) ·
**T2** = élargit la capacité sans toucher la colonne · **T0** = rejet.

### C1 — Statut vérité + badge désynchronisé  → `implement_now` · T1

- **Existant vérifié** : `missions.status` (schema.ts:79-91) écrit par le FSM, jamais confronté ;
  `apps/web/lib/health.ts:23` = même doctrine déjà en place pour la santé projet ;
  `events` indexée par mission+date ; carte historique `docs/backlog/mission-dashboard-branch-closed.md`
  (specs préservées, code abandonné).
- **Version MAOS améliorée** : `reconcileMissionStatus(facts, now)` **pure**, posée dans
  `apps/web/lib/` à côté de `computeProjectHealth`, mêmes règles (aucune table, `now` injecté,
  zéro LLM). Faits v1, tous déjà en base : âge du dernier `events` de la mission · verdict du
  dernier `reports` · validations `pending` · budget dépassé. Sortie = `{declared, computed, desynced, reason}`.
  Le badge consomme le type d'alerte de C12 (livrées ensemble).
- **Ce qu'on ne fait pas** : pas de heartbeat worker en v1, pas de colonne de statut calculé
  (le calcul au read est la doctrine `health.ts` — la stocker, c'est recréer le mensonge).
- **Scores** : 5 · 5 · 5 · 4 · 5 · 5 · 5. **KILL** : aucun.
- **DoD binaire** : un test d'intégration tue le worker en plein `executing` → le cockpit affiche
  le badge désynchronisé **avec sa raison en ≤ 60 s**, sans édition manuelle de la DB ; `pnpm -r test` vert.

### C12 — Contrat d'alertes  → `implement_now` · T1 *(fusionné dans la livraison C1)*

- **Existant vérifié** : aucun type `Alert` ; les surfaces d'état existantes sont `health.ts`,
  `autopilot.ts` (`BudgetPause`) et `components/BudgetPauseBanner.tsx` — trois rendus ad hoc.
- **Version MAOS améliorée** : au lieu d'un contrat neuf appliqué à des alertes futures, on
  **enveloppe les trois surfaces existantes** : type `Alert {quoi, pourquoi, action, route, sévérité}`
  validé Zod, migration de `BudgetPauseBanner` + validations pending + budget dessus, puis le badge
  désync de C1 comme premier client neuf. Règle « aucun fait ⇒ aucune alerte » (null ≠ zéro) testée par famille.
- **Pourquoi fusionner avec C1** : le badge désync *est* une alerte. Les livrer séparément, c'est
  écrire deux fois le rendu.
- **Scores** : 5 · 5 · 5 · 4 · 4 · 4 · 5. **KILL** : aucun.
- **DoD binaire** : le validateur refuse une alerte à champ vide (test) ; test null≠zéro vert par
  famille ; grep : aucun rendu d'alerte hors du composant contractuel.

### C3 — Contrat de rapport de mission (P3+P4+P22)  → `implement_now` · T1

- **Existant vérifié** : `reports` (schema.ts:344-360) = `humanMd/ai/diff`, sans structure ni verdict ;
  `mission-report.ts` porte `FinalReportContent` + le commentaire SEAM ; `mission-progress.ts` donne
  l'index par tâche ; `ReviewerVerdict` déjà défini dans `@mas/core` et produit par les 4 critiques
  (`reviewers.ts`).
- **Version MAOS améliorée** : on **remplit le SEAM** au lieu d'ouvrir un chantier parallèle.
  `FinalReportContent` gagne les sections manquantes (périmètre non couvert · décisions ·
  vérifications avec commande + extrait borné · **hypothèses de fragilité ≥ 3** · contradictions ·
  questions ouvertes · prochaine étape). `reports.verdict` réutilise le type `ReviewerVerdict`
  existant — pas de nouvelle énumération à maintenir. Validateur Zod à l'archivage. Les rapports de
  **tâche** gardent le format court (discipline token §6).
- **Le morceau qui vaut le plus** : P22 — les ≥ 3 hypothèses de fragilité sont écrites par **celui
  qui produit**, pas par le relecteur. MAOS n'a l'adversarial que côté critique ; c'est le seul
  endroit du lot qui corrige ça.
- **Scores** : 5 · 4 · 5 · 3 · 5 · 5 · 5. **KILL** : aucun.
- **DoD binaire** : l'archivage d'une mission dont le rapport ne passe pas le validateur est refusé
  (test) ; une mission de démo expose les 10 sections + verdict en DB ; `pnpm -r test` vert.

### C10 — Reprise universelle (`next_action`)  → `implement_now` · T1

- **Existant vérifié** : `next_action` **absent du runtime** (les seules occurrences sont dans
  `packages/skills/library/agent-harness-construction/SKILL.md` — le principe est déjà dans notre
  arsenal froid, jamais câblé). `conversations`/`messages` gardent l'historique, pas la consigne.
- **Version MAOS améliorée** : colonne `tasks.nextAction`, écrite par `dispatch-tick.ts` à **chaque**
  changement d'état. Amélioration vs A2 : la « prochaine étape recommandée » de C3 (niveau mission)
  et `nextAction` (niveau tâche) sont **le même fait à deux granularités** — on les lie explicitement
  (le rapport lit la `nextAction` de la première tâche non done), ce qui évite deux vérités.
  Le skill `agent-harness-construction` fournit la forme d'observation (`status` + `summary` +
  `next_actions` + `artifacts`) : on l'applique enfin.
- **Scores** : 5 · 5 · 5 · 4 · 5 · 5 · 5. **KILL** : aucun.
- **DoD binaire** : tuer le worker en milieu de mission → relance → reprise à la première tâche non
  done sans intervention ni perte, et le prompt de reprise contient la `nextAction` ; `pnpm -r test` vert.

### C9 — Écritures externes en attente  → `implement_now` · T1

- **Existant vérifié** : zéro `git status` dans `apps/` et `packages/` ; mais `sandbox-diff.ts`
  (`validateDiffApplies`, `git apply --check`, jamais mutant) et `review-gate.ts` (approbation
  conditionnée à `diffValid`) posent déjà le modèle **diff-first** ; `reports.diff` stocke le diff.
- **Version MAOS améliorée** : la carte ne construit pas un lecteur de working tree — elle **expose
  ce que MAOS produit déjà** : panneau « écritures en attente » listant, par projet actif, les diffs
  validés non appliqués (source `reports.diff` + `validateDiffApplies`), avec un message de commit
  conventionnel préparé, copiable, **jamais exécuté**. Plus le portique CI de la famille
  `scripts/lint-no-sdk-payg.sh` : aucun chemin de `apps/`/`packages/` n'invoque `git commit|push`
  sur un path de projet externe. Reprend au passage P16 : le path cible re-vérifié à chaque écriture.
- **Scores** : 5 · 5 · 5 · 4 · 4 · 5 · 5. **KILL** : aucun (renforce §5).
- **DoD binaire** : 2 fichiers modifiés d'un projet externe de test → listés avec commande de commit
  préparée ; portique CI exit 0 sur le repo, exit 1 sur un fixture violant la règle (vert/rouge/vert) ;
  aucune exécution de commit par MAOS (absence prouvée par le portique).

### C4 — Prompt à coller par mission  → `implement_now` · T1 *(après C3 + C10)*

- **Existant vérifié** : absent. `mission-script.ts` / `manager-script.ts` / `agent-script.ts` sont
  des **mocks de conversation**, pas des exporteurs. `templates.ts` = données de projet, sans rapport.
- **Version MAOS améliorée** : générer le prompt **depuis la même source que le prompt envoyé par le
  worker**, pas depuis un template jumeau — sinon l'issue de secours dérive de la réalité en trois
  sprints. Deux sorties : prompt de lancement et prompt de reprise (qui consomme la `nextAction` de C10
  et impose le contrat de rapport C3). Bloc copiable dans le détail mission + lien `vscode://file/`.
- **Dépendance réelle** : sans C3 et C10, le prompt exporté est creux. D'où le rang 5 du noyau.
- **Scores** : 5 · 4 · 5 · 3 · 5 · 5 · 5. **KILL** : aucun.
- **DoD binaire** : sur 1 mission réelle, coller le prompt dans une session Claude Code vierge
  produit l'exécution de la 1re tâche + un rapport au format C3 (vérifié une fois, tracé) ; le bloc
  est présent pour 100 % des missions `planned+`.

### C8 — Rapport réveil  → `adapt_now` · T2 *(promu : bien moins cher que prévu)*

- **Existant vérifié** : `daily-report.ts` émet déjà l'event `daily_report` avec 9 champs ;
  `autopilot.ts:90` le lit ; `i18n.ts:26-32` le rend au cockpit ; l'autopilot Phase 6 tourne.
- **Version MAOS améliorée** : ce n'est plus une construction mais un **habillage** — les 5 sections
  réveil (verdict en tête · ce que tu remarques en 2 min · à valider par toi · où tout se trouve ·
  prompt de relance) posées sur les données déjà collectées, en réutilisant le contrat C3.
- **Correction assumée d'A4** : A4 séquençait C8 en M3 « pas avant l'activation autopilot ».
  L'autopilot **est** activé et le rapport **existe** ; le motif KILL « carte dormante » ne tient plus.
- **Scores** : 4 · 5 · 5 · 4 · 4 · 5 · 5. **KILL** : aucun.
- **DoD binaire** : à la fermeture d'une fenêtre autopilot de test (≥ 1 tâche exécutée), le rapport
  porte les 5 sections non vides et est visible dans l'UI ; 100 % des fenêtres de test en produisent un.

### C11 — Vérification indépendante ternaire  → `adapt_now` · T1 *(avant tout merge piloté)*

- **Existant vérifié** : `reviewers.ts` (4 critiques réels, `COVERAGE_PROMPT` recall-first),
  `review-phase.ts` (séquence QC → sec → reviewer → Agent-Evaluator advisory),
  `review-gate.ts` (`diffValid` + exigence de test cité). `mas-reviewer/SKILL.md` a le verdict
  global, pas le ternaire par point ni la re-exécution obligatoire.
- **Version MAOS améliorée** : **ne pas ajouter un 5e critique.** Ajouter un *mode* « vérification
  indépendante » à la séquence existante : contrôle diff-déclaré (`git diff --name-status` vs la
  section « Fichiers touchés » de C3 — les deux bouts existent déjà), ≥ 5 affirmations re-exécutées
  (commande + extrait collé), ternaire par point (PROUVÉ / RÉFUTÉ / NON VÉRIFIABLE), ≥ 1 cas fabriqué.
  Règle comparative : matérialiser la version d'avant et exécuter **les deux** sur le corpus complet.
  Le vérificateur reste **strictement read-only** (doctrine `mas-reviewer` conservée).
- **Verrou** : livrée **avant** le premier merge d'un projet externe exécuté par le worker MAOS.
- **Scores** : 5 · 3 · 5 · 3 · 5 · 4 · 4. **KILL** : aucun ; contrainte d'ordre, pas de veto.
- **DoD binaire** : sur 1 mission réelle, verdict avec contrôle diff-déclaré + ≥ 5 points ternaires
  (commande + extrait chacun) + ≥ 1 cas fabriqué ; un point RÉFUTÉ force verdict ≠ PASS ; zéro fichier
  de l'objet vérifié modifié par le vérificateur (test) ; le skill passe la relecture §12.

### C5 + C13 — Contrat de tâche enrichi (`nature` + `escalate_when`)  → `adapt_now` · T1 *(fusion)*

- **Existant vérifié** : `PlannerTask` (llm.ts:112-121) = `agentHint · skillsHint · dependsOn ·
  budgetTokens · risk` — ni `nature` ni `escalate_when`. `escalate_when` existe **au niveau des fiches
  d'agents** (`packages/agents/fiches/*.md:35-41`), jamais au niveau mission/tâche.
  Routage réel : `dispatch.ts:597,774` retombe sur `proj?.defaultModel ?? 'claude-haiku-4-5'` ;
  `config/model-routing.json` route par domaine→provider ; `agentOverrides.model` (schema.ts:372)
  ajoute une couche projet.
- **Version MAOS améliorée** : une seule carte, un seul type touché. `PlannerTask` gagne
  `nature: 'arbitrage-synthese' | 'implementation' | 'mecanique'` et `escalateWhen: string[]`
  (conditions **observables**, testables). Résolution du modèle = `max(modèle-par-risque,
  modèle-par-nature)` **puis** override projet, avec le garde-fou inverse conservé : jamais le gros
  modèle pour une tâche mécanique low-risk. Condition d'escalade matée → tâche `needs_validation`
  + une entrée `validations` avec UNE question précise ; les tâches indépendantes continuent.
- **Pourquoi la fusion** : même type, même skill planner, même résolution dispatch, même fichier de
  tests. Deux cartes = deux migrations de contrat pour un seul changement de forme.
- **Scores** : 5 · 4 · 5 · 3 · 4 · 4 · 4. **KILL** : aucun.
- **DoD binaire** : `nature=arbitrage-synthese` + risk:low → modèle > haiku ; `nature=mecanique` +
  risk:low → reste haiku ; risk:high → opus quelle que soit la nature ; une mission plannée porte
  ≥ 1 `escalateWhen` et son match bascule la tâche en `needs_validation` avec la question posée.

### C6 — Décision à défaut appliqué, veto possible  → `backlog_next` · T2

- **Existant vérifié** : `decisions` (schema.ts:141-151) porte `source {user, mission, validation,
  agent}` mais ni `status`, ni `options`, ni `defaultApplied`, ni `appliesAt` ; `lib/decisions.ts`
  ne fait que create/list. `validations` modélise déjà la porte bloquante (pending/approved/rejected).
- **Version MAOS améliorée** : garder les **deux canaux séparés et étanches** — `validations` = porte
  dure (risk ≥ high, rien ne passe sans clic) ; `decisions` = fenêtre de veto, **réservée aux
  décisions réversibles risk:low**, refus dur au-delà (testé). Le rendu « à trancher par toi » est
  déjà exigé par CLAUDE.md §14 : la carte l'alimente, elle ne le réinvente pas.
- **Pourquoi `backlog_next` et pas maintenant** : sa valeur apparaît quand plusieurs missions
  tournent en parallèle et qu'une décision réversible bloque une vague. Aujourd'hui le goulot est
  ailleurs (statut qui ment, reprise, preuve).
- **Scores** : 4 · 5 · 4 · 4 · 4 · 3 · 3. **KILL** : aucun. **Phase cible** : 9 · Étape 1.

### C2 — Registre des retours commandant  → `backlog_next` · T2

- **Existant vérifié** : `ideas` (schema.ts:112-136) a déjà `status`, `priorityScore`, `sourceDossier`,
  `ideaIdLink` vers la mission ; `docs/workflows/commander-feedback-loop.md` porte déjà la doctrine
  de capture par gate avec bloc à coller et triage via `intake-audit`.
- **Version MAOS améliorée** : **aucune nouvelle table.** A2 laissait le choix ; le code tranche —
  `ideas` porte déjà 90 % du besoin. Ajouter `kind: 'feedback'` + un identifiant lisible stable
  (R-NNN), une vue « Registre des retours », et la règle dure : transition vers `livre` refusée sans
  porteur lié. Le runbook existant devient le chemin d'entrée officiel.
- **Scores** : 4 · 5 · 5 · 4 · 4 · 4 · 3. **KILL** : aucun. **Phase cible** : 9 · Étape 1.

### C7 — API lisible par un agent  → `backlog_next` · T2

- **Existant vérifié** : 22 `route.ts` sous `apps/web/app/api/**`, **aucun** `API.md`. Le skill
  `update-docs` (sections générées depuis les sources de vérité) est disponible ; la famille de
  portiques `scripts/*.sh` existe.
- **Version MAOS améliorée** : `apps/web/API.md` avec doctrine de parité (« ce que Melvyn voit à
  l'écran, un agent le lit ici ») + section **Garanties** (qui écrit quoi, jamais de commit auto —
  elle documente C9) ; section générée pilotée par `update-docs` ; portique de comptage exit 0/1.
  Mise à jour CLAUDE.md §3 (nouveau fichier de doc).
- **Déclencheur naturel** : le jour où un pont projet-externe ↔ MAOS se construit. Pas avant.
- **Scores** : 4 · 4 · 5 · 4 · 4 · 3 · 3. **KILL** : aucun. **Phase cible** : 9 · Étape 1.

## 4. Rejets et non-reprises

- **P20** (cockpit sans framework) — `reject`, confirmé : §2 verrouille Next 15 + Drizzle.
- **P21** (FEATURE_TEMPLATE 20 sections) — `reject`, confirmé : spécifique Flutter/OtakuGO ;
  notre équivalent utile (contrat de rapport) est C3.
- **P5, P12, P16, P18, P19** — déjà couverts, re-vérifiés : pipeline 3 étages (`review-phase.ts`),
  table des rationalisations (les 6 `mas-*/SKILL.md`), gates deny-by-default (`config/permissions.json`
  + `mas-sec-reviewer`), worktree par mission (harnais + `superpowers:using-git-worktrees`),
  portiques binaires (`scripts/lint-no-sdk-payg.sh`, `scripts/sonar-pr-issues.sh`). Rien à faire.
- **Aucune carte T0** : aucune des 13 n'est un doublon-sans-mieux, un squelette vide, ni un risque.

## 5. Plan d'intégration

**Lot 1 — noyau (Phase 9, maintenant)** : C1+C12 (une livraison) → C3 → C10 → C9 → C4.
Ordre imposé par les dépendances réelles : C4 consomme C3 et C10 ; le badge de C1 consomme le type
de C12. Budget indicatif : ~150 k tokens par carte, gate 5 checks à chaque PR, merge = Melvyn.

**Lot 2 — cartes rapides ou verrouillantes** : C8 (habillage, peu cher) et C11 (verrou : livrée
avant le premier merge d'un projet externe exécuté par le worker). C5+C13 fusionnée suit —
elle touche le contrat de tâche, donc de préférence après que C3 ait figé le contrat de rapport.

**Lot 3 — `backlog_next` datés** : C6, C2, C7 — fiches créées, statut consigné, déclencheurs écrits
(C6 : plusieurs missions parallèles · C2 : première vraie vague de retours · C7 : pont externe).

**Ce qu'on ne fait pas** : créer 13 fichiers de backlog d'un coup pour « ne rien perdre ». Une carte
sans déclencheur ni date est une carte morte — c'est précisément le travers que l'audit a relevé
chez le cockpit OtakuGO.

### État de création des fiches (2026-08-14)

| Lot | Carte | Fiche |
|---|---|---|
| 1 | C1 + C12 | `docs/backlog/statut-verite-reconciliation.md` ✅ |
| 1 | C3 | `docs/backlog/contrat-rapport-mission.md` ✅ |
| 1 | C10 | `docs/backlog/reprise-universelle-next-action.md` ✅ |
| 1 | C9 | `docs/backlog/ecritures-externes-a-committer.md` ✅ |
| 1 | C4 | `docs/backlog/prompt-a-coller-par-mission.md` ✅ |
| 2 | C8 | `docs/backlog/rapport-reveil-autopilot.md` ✅ |
| 2 | C11 | `docs/backlog/verification-independante-ternaire.md` ✅ |
| 2 | C5 + C13 | `docs/backlog/contrat-tache-nature-escalate.md` ✅ |
| 3 | C6 · C2 · C7 | non créées — déclencheurs consignés au §3, à créer quand ils tombent |

## 6. Décision globale et re-audit

**Décision** : `implement_now` pour C1+C12, C3, C10, C9, C4 · `adapt_now` pour C8, C11, C5+C13 ·
`backlog_next` daté pour C6, C2, C7 · `reject` confirmé pour P20 et P21.
Justification : chacune est ancrée sur un fichier existant vérifié ce jour ; aucune n'introduit de
framework, de dépendance PAYG ou de chemin d'écriture non gaté ; les trois reportées n'ont pas
encore de déclencheur réel dans la phase courante.

**Re-audit** : à la sortie de la Phase 9 Étape 1, ou pour toute carte restée sans changement de
statut 60 jours après création (soit le 2026-10-13 au plus tard pour le lot 3).
