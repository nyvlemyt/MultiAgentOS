# A2 — Patterns cockpit OtakuGO → MAOS (jugement d'intake)

> Produit le 2026-08-13 par le Doer A2 de `docs/audits/2026-08-12-otakugo-audit-pipeline.md` §5.
> Révisé le 2026-08-13 (passe de correction unique post-Checker, verdict NEEDS_WORK) : findings
> F1→F9 de `A2-checker-verdict.md` traités — P22 ajouté (F1), règle 4 + diff-déclaré + décision
> read-only dans P14/C11 (F2/F4/F5), P17 requalifié déjà-couvert→adapter + carte C13 (F3/F8),
> chiffres corrigés 18→20 sections et 32→33 fiches (F6/F7), couplage P5↔C11 signalé (F9).
> Méthode : `docs/workflows/intake-audit-template.md` (verdict enum + critère KILL par item).
> Racine cockpit (lecture seule) : `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP-cockpit/` —
> tous les chemins « cockpit » ci-dessous sont relatifs à cette racine. Les chemins MAOS sont
> relatifs à la racine du repo MAOS. Aucun code produit copié (citations ≤ 3 lignes, preuve uniquement).

# TL;DR

Le cockpit OtakuGO (34 missions pilotées, protocole transposé de MAOS puis ayant évolué seul) rend surtout des **patterns de fiabilité** : statut calculé depuis les faits, rapports à sections imposées avec preuve collée, reprise après mort de session, écritures jamais auto-commitées. **22 patterns jugés : 5 adopter, 10 adapter, 5 déjà-couverts, 2 rejetés** — les 15 adopter/adapter tiennent en **13 cartes backlog** (en annexe, à valider par Melvyn avant création de fichiers). Ce qu'on ne prend pas : la stack (Node natif + SPA vanilla — notre stack est verrouillée) et le template de feature Flutter (spécifique OtakuGO). La plus grosse valeur immédiate : **C1 (statut-vérité + badge désynchronisé)**, **C3 (contrat de rapport avec verdict + preuves)** et **C10 (reprise universelle)** — les trois attaquent la même faiblesse MAOS : un état DB qui peut mentir quand une session meurt.

## Table des patterns

| # | Pattern | Preuve cockpit | Équivalent MAOS | Verdict | Carte |
|---|---------|----------------|-----------------|---------|-------|
| P1 | Statut calculé depuis les faits + badge « désynchronisé » | `tools/anilist-pipeline/reference/lib/truth.js:76-101` · `docs/missions/PROTOCOL.md:21-27` | `packages/db/src/schema.ts:79-91` (statut stocké, jamais réconcilié) · `PRODUCT_SPEC.md` §5 | **adapter** | C1 |
| P2 | Registre des retours patron (R1→R33, statut par retour) | `docs/missions/RETOURS-MELVYN.md:1-14` | `docs/workflows/commander-feedback-loop.md` · `packages/db/src/schema.ts:112-136` (ideas) | **adapter** | C2 |
| P3 | Trio fiche / état vivant / rapport à sections imposées | `docs/missions/PROTOCOL.md:29-75` · `docs/missions/_state/OP-24.md` · `docs/missions/_reports/OP-24-rapport.md` | `packages/db/src/schema.ts:344-360` (reports sans sections ni verdict) | **adapter** | C3 |
| P4 | Done binaire + verdict + vérifications « commande + sortie collée » | `docs/missions/PROTOCOL.md:56-108` · `docs/missions/_reports/OP-24-rapport.md:74-112` | `.claude/skills/mas-reviewer/SKILL.md` (verdict oui, preuve collée non) | **adapter** | C3 |
| P5 | Pipeline 3 étages R33 (prompteur → exécutant → vérificateur) | `docs/missions/OP-31-representant-de-carte.md:79-93` · `docs/missions/RETOURS-MELVYN.md:72` | `PRODUCT_SPEC.md` §5 (planner → worker → reviewers) · `AGENTS.md` | **déjà-couvert** | — |
| P6 | « Prompt à coller » par fiche (issue de secours humaine) | `docs/missions/OP-31-representant-de-carte.md:95-109` · `docs/missions/README.md:7-13` | absent (dispatch SDK `apps/worker/`, aucun prompt exportable) | **adopter** | C4 |
| P7 | `escalate_when` par fiche de mission | `docs/missions/OP-31-representant-de-carte.md:73-77` · `docs/missions/PROTOCOL.md:124-129` | `packages/agents/fiches/*.md` (niveau agent seulement) · `packages/agents/fiches/skill-router.md:66-75` | **adapter** | C5 |
| P8 | Vagues de lancement + décisions D1→D9 « défaut appliqué, veto possible » | `docs/missions/README.md:31-61,144-155` | vagues : `packages/db/src/schema.ts:169` (dependsOnJson) ; décisions-avec-défaut : absent de `schema.ts:141-151` | **adapter** | C6 |
| P9 | API « ce que l'humain voit, un agent le lit » | `tools/anilist-pipeline/reference/API.md:1-9` | 22 routes `apps/web/app/api/**` mais aucun contrat documenté pour agents (absent) | **adopter** | C7 |
| P10 | Rapport « ☀️ Réveil » après batch nocturne | `docs/missions/_reports/OP-20-passe6-REVEIL.md` | `CLAUDE.md` §14 + `docs/workflows/dashboard-visuel-de-suivi.md` (format Réveil absent) · `packages/db/src/schema.ts:277-292` (schedules) | **adapter** | C8 |
| P11 | Écritures jamais auto-commitées + bandeau « à committer » + commit préparé | `tools/anilist-pipeline/reference/API.md:180-188,213` · `docs/missions/README.md:24-29` | `CLAUDE.md` (commit sur demande) · `packages/db/src/schema.ts:344-360` (reports.diff) ; surface UI : absent | **adopter** | C9 |
| P12 | Registre des rationalisations excuse → réalité | `docs/missions/PROTOCOL.md:143-153` | `CLAUDE.md` §12 + les 6 `.claude/skills/mas-*/SKILL.md` (table présente, vérifié par grep) | **déjà-couvert** | — |
| P13 | Reprise universelle + « PROCHAINE ACTION SUR REPRISE » | `docs/missions/PROTOCOL.md:155-159` · `docs/missions/missions.json:5` · `docs/missions/_state/OP-24.md:85,99-101` | `packages/db/src/schema.ts` (sessionId, conversations) ; contrat de reprise : absent | **adopter** | C10 |
| P14 | Vérification externe par session fraîche AVANT merge (7 règles, ternaire par point) | `docs/missions/VERIFICATION.md:7-41` · `docs/missions/_reports/VERIF-2026-08-09-OP24.md` | `.claude/skills/mas-reviewer/SKILL.md` (adversarial, mais ni ternaire par point ni re-exécution obligatoire) | **adapter** | C11 |
| P15 | Alertes « aucun fait ⇒ aucune alerte », 3 phrases obligatoires (quoi/pourquoi/action) | `tools/anilist-pipeline/reference/API.md:232-239` | absent (aucune doctrine d'alerte cockpit MAOS) | **adopter** | C12 |
| P16 | Gates data deny-by-default + garde-fou identité re-vérifié avant CHAQUE écriture | `docs/missions/PROTOCOL.md:110-122` · `docs/missions/_state/OP-24.md:6-8` | `CLAUDE.md` §5 · `config/permissions.json` · `.claude/skills/mas-sec-reviewer/SKILL.md` | **déjà-couvert** | — |
| P17 | Routage modèle/effort par NATURE de tâche (arbitrage → gros modèle même low-risk) | `docs/missions/PROTOCOL.md:131-141` | `.claude/skills/mas-skill-router/SKILL.md` (three-tier par risque seul) · `packages/agents/src/dispatch.ts:597,774` (défaut projet) | **adapter** | C13 |
| P18 | Une mission = une branche + un worktree dédié | `docs/missions/PROTOCOL.md:161-171` | `SKILLS_REGISTRY.md:75` (`superpowers:using-git-worktrees`) + isolation worktree du harnais | **déjà-couvert** | — |
| P19 | Portiques : vérification récurrente → script binaire exit 0/1 | `docs/missions/VERIFICATION.md:47-49` | `scripts/lint-no-sdk-payg.sh` · `scripts/sonar-pr-issues.sh` · gate 5 checks `CLAUDE.md` §7 | **déjà-couvert** | — |
| P20 | Cockpit web sans framework (Node natif + SPA vanilla, 246 tests) | `tools/anilist-pipeline/reference/server.js` · `public/app.js` (A0-recon §5) | `CLAUDE.md` §2 (stack verrouillée Next.js 15 + Drizzle) | **rejeter** | — |
| P21 | FEATURE_TEMPLATE à 20 sections par feature | `docs/features/templates/FEATURE_TEMPLATE.md` | `packages/db/src/schema.ts:263-271` (context packs) · fiches mission MAOS | **rejeter** | — |
| P22 | Remise en question finale obligatoire du producteur (≥3 hypothèses de fragilité avant verdict) | `docs/missions/PROTOCOL.md:100-102` | `.claude/skills/mas-reviewer/SKILL.md` (adversarial côté RELECTEUR seulement) ; côté producteur : absent | **adapter** | C3 |

Décompte : **5 adopter · 10 adapter · 5 déjà-couvert · 2 rejeter** (15 portés par 13 cartes, C3 couvrant P3+P4+P22). Révision post-Checker : P22 ajouté (F1), P17 requalifié déjà-couvert → adapter (F3).

## Détail par pattern

### P1 — Statut calculé depuis les faits + badge « désynchronisé »

- **Description** : le statut d'une mission n'est jamais tapé : une machine à états pure le dérive des FAITS (board du state file le plus frais toutes branches confondues via `git show`, verdict du rapport, état de merge). Le statut « déclaré » de `missions.json` n'est qu'un historique ; s'il diverge du calcul, badge « désynchronisé ». Ordre strict : verdict NEEDS_WORK/BLOCK → ATTENTION ; tâche BLOCKED → BLOQUÉE ; PASS+merged → LIVRÉE ; PASS → MERGE EN ATTENTE ; board actif → EN COURS ; branche seule → LANCÉE ; sinon À LANCER.
- **Preuve d'usage** : `tools/anilist-pipeline/reference/lib/truth.js:76-101` (`computeStatus`, OP-14) ; doctrine « Le statut d'une mission ne s'édite plus jamais à la main » dans `docs/missions/PROTOCOL.md:21-27` ; consommé par `/api/missions` (`tools/anilist-pipeline/reference/API.md:36-50`, champs `calc.*`, `desync`).
- **Équivalent MAOS** : `packages/db/src/schema.ts:79-91` — `missions.status` est une colonne écrite par le code FSM (`PRODUCT_SPEC.md` §5), jamais réconciliée avec la réalité observable. Si le worker meurt en plein `executing`, la mission reste `executing` pour toujours ; si une branche est mergée hors MAOS, rien ne le voit. Le besoin est déjà documenté côté MAOS : `docs/backlog/mission-dashboard-branch-closed.md` (specs préservées d'un dashboard mission).
- **Verdict** : **adapter** — MAOS n'a pas de state files multi-branches à fusionner (la DB est unique), donc on ne porte pas `assembleTruth` ; on porte l'idée : *statut stocké = déclaré ; une fonction pure de réconciliation calcule la vérité depuis les faits observables (âge du dernier event/heartbeat, verdict du dernier report, validations pending, git du projet externe en lecture seule) et l'UI badge tout écart*.
- **KILL évalué** : (coût) la réconciliation sur projets EXTERNES peut produire de faux « désync » (leur git n'appartient pas à MAOS) → non déclenché si la v1 se limite aux faits internes (events, reports, validations) + git externe en lecture seule best-effort. (doublon) le FSM existant n'est PAS un doublon : il écrit le statut, il ne le vérifie pas. (complexité) fonction pure + tests, même facture que `truth.js` (testé sans I/O) — bornée.
- **Brique porteuse** : `packages/core` (fonction pure `reconcileMissionStatus`), `apps/worker` (heartbeat event), `apps/web` (badge + raison).

### P2 — Registre des retours patron (R1→R33)

- **Description** : chaque phrase de Melvyn devient une ligne numérotée, datée, avec un statut enum (`mission` / `décision` / `livré` / `à cadrer`) et le fichier/mission qui la porte. Doctrine clé : « Un retour n'est jamais “traité” parce qu'une session l'a lu — il est traité quand une mission le porte ou qu'une décision le clôt. » Créé parce que les retours vivaient dans l'inbox et l'historique de sessions : invisibles, perdus au nettoyage.
- **Preuve d'usage** : `docs/missions/RETOURS-MELVYN.md:1-14` (doctrine + légende), 33 retours tracés R1→R33, chacun pointant sa mission (ex. R27→OP-31, R33 = principe acté porté par les fiches OP-31→34).
- **Équivalent MAOS** : `docs/workflows/commander-feedback-loop.md` (capture par gate de phase, routage fold-in/backlog/mémoire — build-time, par date, dispersé dans `docs/learning/<date>/`) ; `packages/db/src/schema.ts:112-136` (table `ideas`, statut `inbox→converted`, lien `ideaIdLink` vers la mission) ; registre `feedback` de la mémoire (doctrine `docs/knowledge/memory-patterns.md`). Le **delta** : aucun registre unique numéroté où CHAQUE retour a un statut de cycle de vie et un « porté par » — la boucle commandant capture mais ne tient pas de registre pérenne consultable.
- **Verdict** : **adapter** — ne pas créer une 4e surface : donner aux `ideas` un sous-type retour (`kind: feedback`), un identifiant lisible R-NNN, et une vue registre ; interdiction de passer `livré` sans porteur (mission ou décision liée).
- **KILL évalué** : (doublon) c'est LE risque : si la carte ne fait que renommer l'Ideas Inbox, elle meurt — non déclenché car le delta est le triplet {statut de cycle de vie par retour, lien porteur obligatoire, unicité du registre} qu'aucune des trois surfaces MAOS n'a. (coût) une colonne + une vue. (complexité) nulle — pas de LLM.
- **Brique porteuse** : schéma DB (`ideas.kind` ou table légère `feedbacks`), UI (vue registre), doctrine dans la fiche du Memory Keeper.

### P3 — Trio fiche / état vivant / rapport à sections imposées

- **Description** : chaque mission maintient trois artefacts committés à squelette imposé : la **fiche** (frontmatter id/modèle/effort/où/dépendances/vague/statut + déclencheur + périmètre + hors-périmètre + risque + escalate_when + prompt), l'**état vivant** `_state/OP-XX.md` (board `# | Tâche | Statut | Preuve`, log chronologique, § Reprise) mis à jour EN CONTINU (« une session peut mourir n'importe quand »), et le **rapport** `_reports/OP-XX-rapport.md` à 9 sections imposées, écrit AVANT le résumé terminal.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:29-75` (squelettes verbatim) ; exécution réelle : `docs/missions/_state/OP-24.md` (board 10 lignes avec preuve par ligne) et `docs/missions/_reports/OP-24-rapport.md` (9 sections tenues).
- **Équivalent MAOS** : la fiche ≈ `missions` + PlannerOutput (`.claude/skills/mas-mission-planner/SKILL.md`) ; l'état vivant ≈ `tasks` + `events` en DB (le principe « l'état survit à la session » est déjà MAOS : `PRODUCT_SPEC.md` §10 « zero in-memory-only state ») ; le rapport ≈ `packages/db/src/schema.ts:344-360` (`reports.humanMd/ai/diff`) — **sans sections imposées ni colonne verdict**.
- **Verdict** : **adapter** — la moitié « état vivant en DB » est structurellement couverte ; ce qui manque est le **contrat de contenu** : sections imposées du rapport de mission + verdict + preuves (fusionné avec P4 dans la carte C3).
- **KILL évalué** : (coût tokens) imposer 9 sections à chaque micro-TÂCHE serait du gonflage → non déclenché en le limitant aux rapports `kind=mission` (les rapports de tâche gardent un format court). (rigidité) le cockpit prouve l'inverse : « Les sections imposées existent pour les jours où ça se passe bien AUSSI » (`PROTOCOL.md:153`).
- **Brique porteuse** : schéma DB (`reports.verdict`), `packages/core` (template + validateur Zod du rapport de mission), skill `mas-reviewer` (le contrôle).

### P4 — Done binaire + verdict + vérifications « commande + sortie collée »

- **Description** : « done » n'est pas un ressenti : checklist binaire (critères de la fiche un par un, analyze/tests/migrations, zéro placeholder), verdict ternaire PASS / NEEDS_WORK / BLOCK « binaire, pas de score flou », et section Vérifications où chaque affirmation porte **la commande exacte + sa sortie collée** — « la preuve, pas l'affirmation ». Un critère invérifiable est déclaré tel, jamais vert par déduction.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:56-108` (§2 rapport, §3 done binaire, §4 « preuve avant affirmation ») ; en réel : `docs/missions/_reports/OP-24-rapport.md:74-112` (identité staging, `migration list`, `db push` — sorties collées) ; nuance assumée du 11/12→12/12 déclarée dans le verdict même (l.12-17).
- **Équivalent MAOS** : `.claude/skills/mas-reviewer/SKILL.md` (verdict PASS/NEEDS_WORK/BLOCK, findings avec fait+chemin+conséquence+confiance — vérifié) ; `superpowers:verification-before-completion` (`SKILLS_REGISTRY.md`) ; gate 5 checks `CLAUDE.md` §7. **Manque** : la colonne verdict sur `reports`, et l'exigence « sortie collée » comme contrat du rapport (aujourd'hui le reviewer lit des artefacts, il n'exige pas la preuve d'exécution dans le rapport du producteur).
- **Verdict** : **adapter** (même carte C3 que P3 — c'est le même contrat de rapport).
- **KILL évalué** : (coût tokens) coller des sorties gonfle les rapports → non déclenché avec des extraits bornés (le cockpit colle 3-10 lignes, jamais des dumps). (doublon) mas-reviewer vérifie déjà — mais côté PRODUCTEUR rien n'impose la preuve ; le reviewer vérifie plus vite quand la preuve est déjà collée.
- **Brique porteuse** : `packages/core` (contrat de rapport), fiches Tier A des exécutants (obligation de preuve), `mas-reviewer` (refus si preuve absente).

### P5 — Pipeline 3 étages R33 (prompteur → exécutant → vérificateur)

- **Description** : habitude actée le 10/08 (R33) : chaque mission = un agent qui écrit le brief d'exécution (sans coder), un agent qui exécute le brief à la lettre, un agent vérificateur adversarial qui re-exécute de zéro ; l'orchestrateur ne code pas. Trace OP complète exigée (fiche, state, rapport, vérif).
- **Preuve d'usage** : `docs/missions/OP-31-representant-de-carte.md:79-93` (§ Pipeline de production, 3 étages avec livrables nommés) ; `docs/missions/RETOURS-MELVYN.md:72` (R33 « principe acté »).
- **Équivalent MAOS** : c'est le mission lifecycle natif — `PRODUCT_SPEC.md` §5 : `clarified→planned` (Mission Planner émet le DAG = l'étage prompteur, PlannerOutput = le brief), `dispatched→executing` (worker = exécutant), `executing→review` (Code Reviewer + Sec Reviewer = vérificateurs). La pipeline d'audit MAOS elle-même tourne en Doer/Checker (`docs/audits/2026-08-12-otakugo-audit-pipeline.md` §Méthode : « les deux systèmes convergent »).
- **Verdict** : **déjà-couvert** — le protocole cockpit a été transposé DE MAOS puis a reconvergé ; adopter « en plus » créerait un second pipeline concurrent du FSM.
- **KILL évalué** : KILL doublon **déclenché** (c'est précisément pourquoi le verdict n'est pas « adopter »). Seul résidu intéressant : l'étage 1 écrit un brief *fichier* relisible par l'humain (`_briefs/OP-31-EXECUTION.md`) là où PlannerOutput est du JSON — résidu absorbé par C3 (rapport lisible) et C7 (API lisible), pas de carte dédiée.
- **Couplage de verdicts (F9)** : « déjà-couvert » n'est plein, pour l'étage 3, qu'une fois **C11 réalisée** — le mas-reviewer actuel lit les artefacts sans re-exécuter de zéro (constat porté par P14). Si C11 était écartée au tri des cartes, requalifier P5 en « partiellement couvert ».

### P6 — « Prompt à coller » par fiche (issue de secours humaine)

- **Description** : chaque fiche se termine par un bloc prompt autonome : coller ce bloc dans un Claude Code vierge suffit à lancer la mission avec protocole, contexte, garde-fous et critères de done. Le board a un mode d'emploi « 2 minutes » (ouvrir le dossier, choisir le modèle, coller). Le pilotage survit donc à l'outillage : pas de serveur, pas d'orchestrateur requis.
- **Preuve d'usage** : `docs/missions/OP-31-representant-de-carte.md:95-109` (prompt complet avec garde-fous) ; `docs/missions/README.md:7-13` (mode d'emploi) ; 33 des 34 fiches OP portent le bloc (comptage Checker F7 : `ls OP-*.md` = 34, `grep -l 'Prompt à coller'` = 33).
- **Équivalent MAOS** : **absent** — le dispatch passe par le worker + Agent SDK (`apps/worker/`) ; si MAOS est en panne ou si Melvyn veut piloter à la main (autonomie `manual`, fallback `claude --print` prévu par `CLAUDE.md` §2), aucune mission n'est exportable en prompt.
- **Verdict** : **adopter** — générer, pour chaque mission planifiée, un « prompt à coller » (lancement) et un prompt de reprise, affichés dans le détail mission. C'est le mode dégradé assumé du produit et le pont avec les projets pilotés hors-MAOS (OtakuGO aujourd'hui).
- **KILL évalué** : (risque produit) si l'issue de secours devient la voie normale, MAOS perd la trace des runs → non déclenché : le prompt généré impose le rapport/état (comme le cockpit : le prompt contient le protocole), et l'usage visé est panne/manual/transition. (coût) génération template depuis des données déjà en DB — trivial.
- **Brique porteuse** : `apps/web` (UI détail mission), `packages/core` (template de prompt depuis mission+tasks+garde-fous).

### P7 — `escalate_when` par fiche de mission

- **Description** : chaque fiche liste SES conditions d'escalade métier (ex. OP-31 : « deux variantes indiscernables → présenter les deux, ne pas trancher » ; « >10 % d'œuvres sans signal → le dire, proposer un fallback »). Règle générale : hésitation qui change le résultat, ou action irréversible/externe → BLOCKED + UNE question précise, et on continue ce qui est indépendant. « Ne jamais broder pour avancer quand même. »
- **Preuve d'usage** : `docs/missions/OP-31-representant-de-carte.md:73-77` ; doctrine `docs/missions/PROTOCOL.md:124-129` ; utilisé aussi comme canal de veto sur les décisions (`docs/missions/README.md:154-155`).
- **Équivalent MAOS** : `escalate_when` existe **au niveau agent** (`packages/agents/fiches/*.md`, 10 fiches — vérifié) et il est enforced par le router (`packages/agents/fiches/skill-router.md:66-75` : keyword match → `requires_validation: true`). **Au niveau mission/tâche : absent** — `tasks.risk` + `validations` gèrent le risque générique, pas les conditions d'escalade *spécifiques au contenu de la mission*.
- **Verdict** : **adapter** — le Mission Planner émet `escalate_when[]` par mission (et par tâche si pertinent) dans PlannerOutput ; le worker les injecte dans le prompt de l'exécutant ; condition matée → `blocked` + question dans validations.
- **KILL évalué** : (complexité) des conditions invérifiables par l'exécutant seraient du bruit → non déclenché : le cockpit montre le bon calibre (conditions observables et testables : « >10 % sans signal »). (doublon) `risk` enum ne couvre pas ça : risk = catégorie d'action, escalate_when = ambiguïté métier. Deux axes orthogonaux.
- **Brique porteuse** : `mas-mission-planner` (schéma PlannerOutput), `apps/worker` (injection + gestion blocked), `packages/db` si on persiste la condition matée.

### P8 — Vagues de lancement + décisions D1→D9 « défaut appliqué, veto possible »

- **Description** : les missions se lancent par vagues nommées (A→H) dérivées des dépendances, visualisées en graphe mermaid sur le board. Les décisions à trancher sont numérotées (D1→D9) avec table `décision | défaut appliqué`, et une règle explicite : les fiches appliquent un défaut recommandé, Melvyn peut opposer un **veto avant lancement ou en cours** — le travail n'attend pas l'arbitrage quand un défaut raisonnable existe.
- **Preuve d'usage** : `docs/missions/README.md:31-61` (graphe des vagues), `:144-155` (« Décisions D1→D5 (défauts appliqués, veto possible) », « Un veto sur D1→D5 = dis-le avant de lancer la fiche concernée ») ; D6→D9 dans les fiches vague G/H (`docs/missions/README.md:89-92`).
- **Équivalent MAOS** : vagues = **déjà-couvert** par le DAG (`packages/db/src/schema.ts:169` `dependsOnJson`, ordre topologique du worker) — seule la *visualisation* en vagues manque, affaire d'UI. Décisions : la table `decisions` (`schema.ts:141-151`) LOGGE des décisions prises ; les `validations` (`schema.ts:241-250`) bloquent en attendant un clic. **Aucune des deux ne porte « décision ouverte avec options, défaut appliqué, fenêtre de veto »** — c'est un 3e mode : avancer sans bloquer, réversiblement.
- **Verdict** : **adapter** (la moitié décisions ; la moitié vagues est déjà couverte) — étendre `decisions` avec `status: pending|acted|vetoed`, `options` et `default_applied`, affiché en « à trancher par toi » sur le dashboard.
- **KILL évalué** : (sécurité) un « défaut appliqué » sur une action risquée contredirait `CLAUDE.md` §5 → non déclenché en restreignant le mécanisme aux décisions **réversibles risk:low** (le cockpit fait pareil : les défauts D1→D5 sont des choix de design réversibles, jamais des writes prod). (doublon) validations = bloquant, ceci = non-bloquant réversible ; complémentaires.
- **Brique porteuse** : schéma DB (extension `decisions`), `apps/web` (section « à valider par toi », déjà exigée par `CLAUDE.md` §14), Mission Planner (émettre les décisions avec défaut).

### P9 — API « ce que l'humain voit, un agent le lit »

- **Description** : le cockpit expose une API JSON documentée dans un fichier unique écrit POUR les agents : « ce que Melvyn voit à l'écran, un agent le lit ici — et les verdicts écrits par l'un sont immédiatement visibles par l'autre ». Parité stricte humain/agent (mêmes données, mêmes validations serveur), exemples curl par endpoint, garanties d'écriture explicites en bas de doc.
- **Preuve d'usage** : `tools/anilist-pipeline/reference/API.md:1-9` (doctrine), 40+ endpoints documentés avec rôle/paramètres/exemples, section Garanties (`:280-287`).
- **Équivalent MAOS** : les routes existent (22 `route.ts` sous `apps/web/app/api/**` : missions, ideas, decisions, memory, validations, stream…) mais **aucun contrat documenté** : un agent (ou un futur pont OtakuGO→MAOS type OP-19) ne peut pas découvrir la surface sans lire le code. Le skill `update-docs` (génération depuis les sources de vérité) existe et attend précisément ce genre de cible.
- **Verdict** : **adopter** — écrire `apps/web/API.md` (ou `docs/api-cockpit.md`) au format cockpit : rôle, paramètres, exemple, garanties d'écriture ; générer/synchroniser via `update-docs` pour tuer la dérive.
- **KILL évalué** : (maintenance/dérive) une doc d'API manuscrite pourrit → c'est le vrai risque ; non déclenché si la génération est câblée sur les routes (sinon la carte DOIT être abandonnée — critère de sortie en tient compte). (coût) une passe de doc + un check.
- **Brique porteuse** : docs + skill `update-docs` (section générée), CI (check de fraîcheur).

### P10 — Rapport « ☀️ Réveil » après batch nocturne

- **Description** : après une nuit de travail autonome, le rapport n'est pas un log : il est écrit pour une lecture au réveil — TL;DR avec verdict, « Ce que tu vas remarquer en 2 minutes » (parcours de vérification guidé, serveur laissé allumé), « À valider par toi » (décisions explicites, rien de bloquant), « Où tout se trouve », et un prompt prêt pour relancer une passe. Captures avant/après jointes.
- **Preuve d'usage** : `docs/missions/_reports/OP-20-passe6-REVEIL.md` (structure complète, 105 findings triés, avant/après 14 vues) ; restitution citée comme style de travail dans `docs/audits/otakugo/A0-recon/cockpit.md` §7.
- **Équivalent MAOS** : `CLAUDE.md` §14 (essentiel d'abord, plan, recommandation, dashboard) + `docs/workflows/dashboard-visuel-de-suivi.md` couvrent la doctrine générale de restitution ; `CLAUDE.md` §4 exige déjà « Report on resume » pour l'autopilot et la table `schedules` (`packages/db/src/schema.ts:277-292`) existe. **Le format Réveil lui-même (parcours guidé + à-valider + relance) n'existe nulle part.**
- **Verdict** : **adapter** — définir le template « rapport de réveil » comme rapport `kind=mission` obligatoire de fin de fenêtre autopilot, avec ses 5 sections.
- **KILL évalué** : (opportunité) si l'autopilot Phase 6 reste inutilisé, le format n'a pas d'occasion → risque réel de carte dormante ; accepté en la séquençant AVEC l'activation autopilot (pas avant). (coût) template + un point d'accrochage dans le worker — faible.
- **Brique porteuse** : `apps/worker` (fin de fenêtre autopilot), `packages/core` (template), `apps/web` (rendu + section « à valider par toi »).

### P11 — Écritures jamais auto-commitées + bandeau « à committer » + commit préparé

- **Description** : tout ce que le cockpit écrit est git-tracked, whitelisté, et **jamais commité automatiquement** : un bandeau « à committer » liste les fichiers modifiés (`git status` lecture seule), et l'outil prépare le message de commit conventionnel exact (`git add … && git commit -m …`) **sans jamais l'exécuter**. Anti-écrasement par `baseHash` (409 si le fichier a bougé depuis lecture).
- **Preuve d'usage** : `tools/anilist-pipeline/reference/API.md:180-188` (« JAMAIS de commit auto », whitelist dure, 3 gardes), `:213` (`/api/writes/pending` → `commit` « jamais exécuté »), `docs/missions/README.md:24-29` (« tu committes toi-même »).
- **Équivalent MAOS** : la règle de non-commit existe en doctrine (`CLAUDE.md` : commit seulement sur demande ; §8 : le projet externe est read-only-by-default, les agents produisent des diffs — `reports.diff`, `schema.ts:344-360`). **La surface produit est absente** : rien ne montre à Melvyn « voici ce qui a été écrit et pas commité » ni ne lui prépare la commande.
- **Verdict** : **adopter** — pour le projet actif : panneau « écritures en attente » (git status RO sur le path du projet) + message de commit conventionnel préparé, jamais exécuté ; garde CI qui interdit tout `git commit/push` programmatique vers un projet externe.
- **KILL évalué** : (sans-objet ?) si MAOS ne faisait que du diff-out, le bandeau serait inutile → non déclenché : le pilotage réel d'OtakuGO depuis MAOS (but de cet audit) écrira dans le projet externe derrière gate, et ce pattern est exactement le filet sous cette écriture. (complexité) lecture seule de git — bornée.
- **Brique porteuse** : `apps/web` (panneau projet), `apps/worker` (garde), CI (portique anti-commit-auto, même famille que `scripts/lint-no-sdk-payg.sh`).

### P12 — Registre des rationalisations excuse → réalité

- **Description** : table à deux colonnes dans le protocole : l'excuse type de l'agent (« c'est une petite tâche », « les tests ont sûrement passé », « je finirai le state file à la fin ») en face de la réalité qui la démonte. Sert de vaccin comportemental relu par chaque worker à chaque mission.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:143-153` (§8, 7 rationalisations).
- **Équivalent MAOS** : `CLAUDE.md` §12 impose une « Rationalizations table » dans chaque SKILL.md ; vérifié par grep : les 6 skills `mas-*` (`.claude/skills/mas-{mission-planner,reviewer,context-manager,memory-keeper,sec-reviewer,skill-router}/SKILL.md`) la portent.
- **Verdict** : **déjà-couvert** — même dispositif, placé au niveau skill (au plus près de l'exécution) plutôt qu'au niveau protocole unique.
- **KILL évalué** : KILL doublon **déclenché** : ajouter une table protocole-monde en plus des tables par-skill diluerait (deux endroits à maintenir). Résidu : si un jour un « protocole worker » unique est écrit pour les missions externes (cf. C3/C10), y reprendre les 3 excuses spécifiques aux state files du cockpit — note, pas carte.

### P13 — Reprise universelle + « PROCHAINE ACTION SUR REPRISE »

- **Description** : n'importe quelle session (même vierge) reprend n'importe quelle mission avec UN prompt constant : « Lis PROTOCOL.md puis _state/OP-XX.md et continue à la première tâche non DONE. » Chaque entrée du log se termine par « PROCHAINE ACTION SUR REPRISE : <action précise> » ; si la reprise manque de contexte, c'est un bug du state file (« corrige-le d'abord »). Le template feature a le même gène (« Next Step For AI » : une action précise).
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:155-159` (§9) ; `docs/missions/missions.json:5` (`reprise_universelle` machine-lisible) ; `docs/missions/_state/OP-24.md:85` (PROCHAINE ACTION en plein log) et `:99-101` (§ Reprise) ; `docs/features/templates/FEATURE_TEMPLATE.md:97-99`.
- **Équivalent MAOS** : `projects.sessionId`, `conversations`/`messages` persistants (`packages/db/src/schema.ts:294-329`) permettent de *retrouver* une conversation — mais **aucun contrat de reprise** : une tâche `running` dont la session est morte ne dit nulle part quelle est la prochaine action précise, et rien ne définit « continuer à la première tâche non done » comme geste standard (le STATE.md de la pipeline d'audit applique ce pattern à la main — preuve du besoin, pas de l'outillage).
- **Verdict** : **adopter** — le worker écrit `next_action` (event ou colonne) à chaque changement d'état ; l'UI expose « Reprendre » ; le prompt de reprise généré (cf. C4) consomme ce champ.
- **KILL évalué** : (doublon) les conversations persistantes ne couvrent PAS ça : relire 200 messages n'est pas une reprise, c'est de l'archéologie — non déclenché. (coût) un champ + une discipline d'écriture worker ; le cockpit prouve que ça tient sur 34 missions.
- **Brique porteuse** : `apps/worker` (écriture next_action), `packages/db` (event type ou colonne `tasks.nextAction`), `apps/web` (bouton Reprendre).

### P14 — Vérification externe par session fraîche AVANT merge (7 règles, ternaire par point)

- **Description** : principe R26 : « on vérifie le travail des branches AVANT de merger, pas l'inverse. » Un vérificateur **frais** (jamais le producteur), zéro confiance (chaque affirmation re-prouvée par exécution réelle), qui **fabrique ses propres cas** (défauts plantés) et contrôle le **fond, pas la forme** (règle 4 : matérialiser la version d'AVANT via `git show <sha>:fichier` et exécuter les deux versions sur les mêmes données ; pour la data, re-mesurer sur le corpus complet, jamais un échantillon). Verdict ternaire PAR POINT (PROUVÉ / RÉFUTÉ / NON VÉRIFIABLE) écrit et committé dans `VERIF-<date>-<objet>.md` — « s'il n'est pas écrit, il n'existe pas ».
- **Preuve d'usage** : `docs/missions/VERIFICATION.md:7-41` (les 7 règles + gabarit) ; appliqué en réel : `docs/missions/_reports/VERIF-2026-08-09-OP24.md` (et 8 PR draft tenues en attente de vérification, `docs/missions/README.md` R26).
- **Équivalent MAOS** : `.claude/skills/mas-reviewer/SKILL.md` — session distincte, adversarial, couverture d'abord, verdict PASS/NEEDS_WORK/BLOCK : la posture y est. **Manque** : le ternaire par affirmation testée, l'obligation de RE-EXÉCUTER (le reviewer lit les artefacts), la fabrication de cas adversariaux, le contrôle de fond avant/après de la règle 4 (`VERIFICATION.md:16-18`), le contrôle diff-déclaré vs diff-réel (gabarit point 1, `VERIFICATION.md:35`), le verdict-fichier committé. Les prompts Checker de la pipeline d'audit utilisent déjà PROUVÉ/RÉFUTÉ/NON VÉRIFIABLE (`docs/audits/2026-08-12-otakugo-audit-pipeline.md` §4-6) — convergence de fait, non institutionnalisée dans le skill.
- **Verdict** : **adapter** — enrichir `mas-reviewer` (ou créer un mode « vérification indépendante ») : échantillon d'affirmations re-exécutées, ternaire par point avec commande+extrait, ≥1 cas fabriqué, verdict écrit en fichier/report.
- **KILL évalué** : (coût tokens) re-exécuter TOUT serait ruineux → non déclenché : échantillonnage borné (≥5 points), exactement ce que fait la pipeline d'audit actuelle. (doublon) c'est une évolution du skill existant, pas un nouveau skill.
- **Brique porteuse** : skill `mas-reviewer` (process + output), `packages/db` (`reports.verdict` de C3 réutilisé).

### P15 — Alertes « aucun fait ⇒ aucune alerte », 3 phrases obligatoires

- **Description** : le module d'alertes n'invente jamais un cas depuis une donnée absente (« `null` ≠ zéro ») et chaque alerte porte obligatoirement trois phrases : **quoi** (le fait), **pourquoi** (la conséquence), **action** (le geste à faire), plus la route et la commande. Léger par construction (aucun appel réseau, caches seulement).
- **Preuve d'usage** : `tools/anilist-pipeline/reference/API.md:232-239` (« les trois phrases sont obligatoires », « Aucun fait ⇒ aucune alerte », familles decisions/bloquées/désync/à-committer…).
- **Équivalent MAOS** : **absent** — le cockpit MAOS affiche des états (dashboard §4 PRODUCT_SPEC) mais aucune doctrine d'alerte : rien ne garantit qu'une donnée manquante ne fabrique pas une fausse alerte, ni qu'une alerte dise quoi faire.
- **Verdict** : **adopter** — comme *règle de conception* du cockpit MAOS (validateur de type sur {quoi, pourquoi, action} + test null≠zéro), pas comme port du module.
- **KILL évalué** : (sur-UI) un centre de notifications complet serait hors-phase → non déclenché : la carte se limite au contrat de forme des alertes existantes et futures (bloquées, validations pending, budget dépassé, désync C1). Coût quasi nul, valeur = confiance dans le tableau de bord.
- **Brique porteuse** : `apps/web` (type Alert + validateur + tests), consommé par C1 (désync) et le dashboard existant.

### P16 — Gates data deny-by-default + garde-fou identité re-vérifié avant chaque écriture

- **Description** : interdits durs codés et relus : « JAMAIS la prod, quel que soit le prétexte », staging only, jamais de service_role côté client, pas de force push / suppression / envoi externe → BLOCKED + question. Discipline d'exécution remarquable : l'identité de la cible (ref staging vs prod) est re-vérifiée **avant chaque écriture**, pas au démarrage.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:110-122` (§5) ; `docs/missions/_state/OP-24.md:6-8` (« Garde-fou identité (re-vérifié avant CHAQUE écriture) ») et `_reports/OP-24-rapport.md:76-84` (preuve collée).
- **Équivalent MAOS** : `CLAUDE.md` §5 (actions risquées toujours gated, liste équivalente), `config/permissions.json` (point d'extension des catégories), `.claude/skills/mas-sec-reviewer/SKILL.md` (gate obligatoire high/blocking, « For risk:blocking — ALWAYS BLOCK »).
- **Verdict** : **déjà-couvert** — la doctrine MAOS est la même famille, déjà enforcée par le sec-reviewer et le dispatcher.
- **KILL évalué** : KILL doublon **déclenché**. Deux résidus à router SANS carte ici : (1) les catégories OtakuGO (« prod Supabase interdite », « staging write ») devront entrer dans `config/permissions.json` à l'enregistrement du projet — c'est le travail d'A4 (pipeline §7, process 4) ; (2) le réflexe « re-vérifier l'identité de la cible à CHAQUE écriture » mérite une ligne dans la fiche du worker/sec-reviewer — absorbé par la garde de C9.

### P17 — Routage modèle/effort par NATURE de tâche (requalifié en passe de correction, F3)

- **Description** : table de référence dans le protocole : architecture/arbitrages/synthèse multi-sources → gros modèle effort high **même sans action risquée** ; implémentation complexe → modèle médian ; tâche mécanique bornée → petit modèle, avec le garde-fou symétrique « Jamais le gros modèle pour du low-risk ». Discipline sous-agents attenante : profondeur 1, fan-out en un seul tour, jamais de sous-agent pour ce qu'on peut faire directement.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:131-141` (§7) ; champs `modele`/`effort` portés par chaque fiche et `missions.json` (`docs/missions/missions.json:11-12`) ; en réel, Fable 5 affecté à des missions d'arbitrage/design sans risque d'action (OP-01, OP-05, OP-19 — `docs/missions/README.md:72,76,87`).
- **Équivalent MAOS** : trois étages, aucun n'encode la charge cognitive — `.claude/skills/mas-skill-router/SKILL.md` route par RISQUE seul (three-tier : risk_high→opus, risk_medium→sonnet, risk_low→haiku), `config/model-routing.json` route par DOMAINE vers un provider (ADR 0002), et au dispatch réel `packages/agents/src/dispatch.ts:597,774` retombe sur `proj?.defaultModel ?? 'claude-haiku-4-5'`. Conséquence : une synthèse multi-sources risk:low part sur haiku (ou le défaut projet) là où le cockpit lui donne Fable 5 effort high.
- **Verdict** : **adapter** — requalifié : le verdict initial « déjà-couvert » n'était sincère que sur l'axe risque (finding F3 du Checker) ; l'axe nature-de-tâche est réellement absent et son manque sous-modélise les tâches cognitivement lourdes mais sans risque d'action.
- **KILL évalué** : (doublon) le three-tier risque existe et reste — on ajoute une dimension à la résolution, pas un second routeur → non déclenché. (coût) risque de sur-modélisation si la nature est mal classée → mitigé en bornant l'enum à 3 natures et en conservant le garde-fou cockpit (jamais le gros modèle pour du mécanique low-risk). Résidu F8 : la règle « sous-agents profondeur 1 » n'a pas d'équivalent MAOS cité (`superpowers:dispatching-parallel-agents` couvre le fan-out, pas la limite de profondeur) — porté par C13.
- **Brique porteuse** : `mas-mission-planner` (émettre la nature par tâche), `mas-skill-router` (résolution modèle = max des deux axes), `packages/agents/src/dispatch.ts` (application).

### P18 — Une mission = une branche + un worktree dédié

- **Description** : chaque mission travaille dans SON worktree git (« une autre session peut te voler le working tree en pleine mission — constaté sur OP-17 »), créé au début, retiré à la fin ; le worker committe sur sa branche et ne merge jamais sans validation. Règle de cohabitation : une seule mission « dépôt principal » à la fois (data lake).
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:161-171` (§10, décision Melvyn 21/07) ; worktrees réels dans chaque state file (ex. `_state/OP-24.md:2`).
- **Équivalent MAOS** : `SKILLS_REGISTRY.md:75` (`superpowers:using-git-worktrees`, methodology), isolation `worktree` native du harnais d'agents, concurrence 1 mission/projet au MVP (`PRODUCT_SPEC.md` §5), interdiction de merge sans gate (`CLAUDE.md` §5).
- **Verdict** : **déjà-couvert**.
- **KILL évalué** : KILL doublon **déclenché**. L'incident OP-17 (vol de working tree) est la preuve d'usage qui justifie de GARDER notre règle — rien à ajouter.

### P19 — Portiques : vérification récurrente → script binaire exit 0/1

- **Description** : « toute vérification récurrente gagnera à être transformée en portique » : un contrat de sortie devient un script binaire (exit 0/1) branché en hook/CI — exemple : garde God-file 800 lignes ; garde anti-collision de migrations ajoutée par OP-24 dans le même esprit (testée vert/rouge/vert).
- **Preuve d'usage** : `docs/missions/VERIFICATION.md:47-49` ; `_state/OP-24.md:78` (garde-fou hygiène testé dans les deux sens).
- **Équivalent MAOS** : `scripts/lint-no-sdk-payg.sh` (portique billing §11, câblé dans `pnpm lint`), `scripts/sonar-pr-issues.sh` (exit 0 = Sonar clean), gate 5 checks (`CLAUDE.md` §7).
- **Verdict** : **déjà-couvert** — MAOS pratique déjà le portique, jusque dans sa définition du « done ».
- **KILL évalué** : KILL doublon **déclenché**. Le réflexe « tester le portique vert/rouge/vert » (OP-24) est une bonne hygiène déjà conforme à notre TDD §7 — rien à créer.

### P20 — Cockpit web sans framework (Node natif + SPA vanilla)

- **Description** : le cockpit logiciel est un serveur Node natif (`server.js`, 1484 l., zéro framework, zéro build) + SPA vanilla (app.js 4481 l.) + 19 modules lib chacun doublé d'un fichier de test (246 tests). Prouvé robuste et rapide à faire évoluer par agents.
- **Preuve d'usage** : `tools/anilist-pipeline/reference/server.js` · `public/app.js` · 19 `test/*.test.js` (inventaire `docs/audits/otakugo/A0-recon/cockpit.md` §5).
- **Équivalent MAOS** : `CLAUDE.md` §2 — stack verrouillée (Next.js 15 + TS + Tailwind + shadcn/ui, Drizzle/SQLite, worker tsx) ; « Do not introduce frameworks outside this list without an ADR ».
- **Verdict** : **rejeter** (voir § Rejets argumentés).
- **KILL évalué** : KILL **déclenché** — contrainte de stack (étape 0 du template d'intake : hard constraint jamais violée). C'est un choix technologique, pas un pattern transposable.

### P21 — FEATURE_TEMPLATE à 20 sections par feature

- **Description** : un fichier vivant par feature applicative (Goal, Scope, Out of Scope, Feature Folder, Supabase Tables, Backend Contract, RLS Rules, UX Rules, Implementation Plan, Current Progress, Decisions, Risks, Tests, Next Step For AI…), maintenu au fil du développement Flutter.
- **Preuve d'usage** : `docs/features/templates/FEATURE_TEMPLATE.md` (+ 14 fiches `docs/features/` et `FEATURE_INDEX.md`, A0-recon §4).
- **Équivalent MAOS** : les fiches mission + `context_packs` (`packages/db/src/schema.ts:263-271`) couvrent le besoin MAOS de contexte par unité de travail ; les sections listées sont propres au développement Flutter/Supabase d'OtakuGO (RLS, Feature Folder…).
- **Verdict** : **rejeter** (voir § Rejets argumentés).
- **KILL évalué** : KILL **déclenché** — doublon avec fiche mission + context pack, et spécificité domaine (2 sections sur 20 seraient réutilisables). Le seul gène précieux, « Next Step For AI », est déjà porté par P13/C10.

### P22 — Remise en question finale obligatoire du producteur (ajouté en passe de correction, F1)

- **Description** : avant de poser son verdict, le PRODUCTEUR fait sa propre passe adversariale — « si ce travail était faux, où le serait-il ? » — avec **au moins 3 hypothèses de fragilité** listées, chacune vérifiée ou explicitement déclarée non vérifiée. C'est le seul garde-fou AUTO-adversarial du protocole : il attrape les erreurs avant même que le vérificateur n'arrive.
- **Preuve d'usage** : `docs/missions/PROTOCOL.md:100-102` (§4 « Remise en question finale obligatoire »).
- **Équivalent MAOS** : l'adversarial existe côté RELECTEUR (`.claude/skills/mas-reviewer/SKILL.md`, « Adversarial Verification Pattern ») et côté vérification externe (P14/C11, échantillon ≥5 points) — côté producteur : **absent**. Aucun contrat n'oblige l'exécutant à chercher ses propres failles avant de rendre.
- **Verdict** : **adapter** — section « Hypothèses de fragilité (≥3) » ajoutée au contrat de rapport de mission (carte C3), chaque hypothèse marquée vérifiée / non vérifiée.
- **KILL évalué** : (coût tokens) une passe réflexive par rapport de MISSION (pas par tâche) coûte quelques centaines de tokens et évite des cycles reviewer→correction bien plus chers → non déclenché. (théâtre) risque que la section devienne rituelle (3 hypothèses de complaisance) → mitigé : `mas-reviewer` teste EN PREMIER les hypothèses déclarées — elles balisent ses vérifications, ce qui rend la complaisance détectable.
- **Brique porteuse** : `packages/core` (template + validateur C3), fiches Tier A exécutantes (obligation), `mas-reviewer` (consomme les hypothèses comme points d'entrée).

## Annexe : cartes backlog proposées

> Format `docs/backlog/` : contexte · travail · critère de sortie **binaire**. À valider par Melvyn
> AVANT création de fichiers séparés — rien n'est écrit dans `docs/backlog/` par cette phase.
> Séquençage précis (phase cible, dépendances avec l'enregistrement d'OtakuGO) = travail d'A4.

### C1 — `statut-verite-reconciliation.md` (P1)

- **Contexte** : `missions.status` (schema.ts:79-91) est écrit par le FSM mais jamais confronté à la réalité : worker mort en `executing` → statut mensonger à vie ; merge externe → invisible. Le cockpit OtakuGO résout ça depuis OP-14 : statut CALCULÉ depuis les faits, stocké = simple « déclaré », badge désynchronisé (truth.js). Le besoin MAOS est déjà tracé dans `docs/backlog/mission-dashboard-branch-closed.md`.
- **Travail** : (1) fonction pure `reconcileMissionStatus(facts)` dans `packages/core` — faits v1 : âge du dernier event de la mission (heartbeat worker à ajouter), verdict du dernier report, validations pending, présence/merge de branche du projet externe (git RO best-effort) ; (2) heartbeat worker (event périodique pendant `executing`) ; (3) badge « désynchronisé » + raison dans l'UI missions ; (4) tests unitaires de la machine à états (I/O stubée, comme truth.js).
- **Critère de sortie (binaire)** : un test d'intégration tue le worker en plein `executing` → le cockpit affiche le badge désynchronisé avec raison en ≤ 60 s sans aucune édition manuelle de la DB ; `pnpm -r test` vert.

### C2 — `registre-retours-commandant.md` (P2)

- **Contexte** : les retours verbaux de Melvyn n'ont pas de registre pérenne : `commander-feedback-loop.md` capture par gate (fichiers datés dispersés), la table `ideas` reçoit des idées — mais aucun endroit ne garantit « chaque retour a un numéro, un statut de cycle de vie, et la mission qui le porte ». Le cockpit le prouve sur 33 retours : R1→R33, statuts `mission/décision/livré/à cadrer`, doctrine « un retour n'est jamais traité parce qu'une session l'a lu ».
- **Travail** : (1) sous-type retour dans `ideas` (`kind: feedback` + id lisible R-NNN) ou table légère dédiée ; (2) statut enum {a_cadrer, decision, mission, livre} + lien porteur (mission/décision) ; (3) vue « Registre des retours » dans le cockpit ; (4) règle : transition vers `livre` refusée sans porteur lié ; (5) doctrine ajoutée à la fiche Memory Keeper (les retours ne transitent pas par la mémoire, ils vivent au registre).
- **Critère de sortie (binaire)** : créer 3 retours de test → chacun reçoit un R-NNN unique et apparaît dans la vue avec son statut ; tenter de passer un retour sans porteur à `livre` → refus (test API) ; 100 % des retours listés avec statut non vide.

### C3 — `contrat-rapport-mission.md` (P3 + P4 + P22)

- **Contexte** : `reports` (schema.ts:344-360) stocke `humanMd/ai/diff` sans structure ni verdict : rien n'impose TL;DR, périmètre non couvert, vérifications avec preuve. Le cockpit impose 9 sections + verdict binaire + « commande exacte + sortie collée » (PROTOCOL §2-4) et 34 missions montrent que ça tient, y compris les jours fastes.
- **Travail** : (1) colonne `reports.verdict` enum {PASS, NEEDS_WORK, BLOCK} (+ migration) ; (2) template de rapport `kind=mission` dans `packages/core` : TL;DR (2 lignes) · Verdict · Périmètre couvert/non couvert · Décisions (table) · Fichiers touchés · Vérifications (commande + extrait collé borné) · **Hypothèses de fragilité (≥3, chacune vérifiée ou déclarée non vérifiée — P22/F1)** · Contradictions & risques · Questions ouvertes · Prochaine étape recommandée ; (3) validateur Zod (sections présentes, verdict posé) exécuté à l'archivage ; (4) `mas-reviewer` refuse un rapport de mission sans preuves collées ; les rapports de TÂCHE gardent un format court (pas de gonflage token).
- **Critère de sortie (binaire)** : l'archivage d'une mission dont le rapport ne passe pas le validateur est refusé (test) ; une mission de démo archivée expose les 10 sections (dont Hypothèses de fragilité ≥3) + verdict en DB ; `pnpm -r test` vert.

### C4 — `prompt-a-coller-par-mission.md` (P6)

- **Contexte** : MAOS n'a aucune issue de secours : si le worker/SDK est en panne, ou en autonomie `manual` (fallback `claude --print`, CLAUDE.md §2), aucune mission n'est exportable. Le cockpit termine chaque fiche par un prompt autonome (protocole + contexte + garde-fous + done) qui a réellement lancé 34 missions.
- **Travail** : (1) template `packages/core` générant depuis mission+tasks+risques : un « Prompt à coller » (lancement) et un prompt de reprise (consomme `next_action` de C10) ; le prompt inclut l'obligation de rapport (contrat C3) et les garde-fous §5 pertinents ; (2) bloc copiable dans le détail mission de l'UI ; (3) lien `vscode://file/` vers le projet (le launcher R13 du cockpit).
- **Critère de sortie (binaire)** : sur 1 mission réelle de test, coller le prompt généré dans une session Claude Code vierge (hors MAOS) produit l'exécution de la 1re tâche + un rapport au format C3 — vérifié une fois, tracé dans le rapport de la carte ; le bloc est présent pour 100 % des missions `planned+`.

### C5 — `escalate-when-par-mission.md` (P7)

- **Contexte** : `escalate_when` n'existe qu'au niveau des fiches d'agents (enforcement router, skill-router.md:66-75). Les conditions d'escalade *métier propres à une mission* (« deux variantes indiscernables → ne pas trancher ») n'ont aucun véhicule : l'exécutant brode ou bloque au hasard. Le cockpit les porte par fiche depuis la vague G.
- **Travail** : (1) champ `escalate_when[]` (mission et/ou tâche) dans le schéma PlannerOutput de `mas-mission-planner` — conditions observables et testables exigées ; (2) injection dans le prompt de l'exécutant par le worker ; (3) condition matée → tâche `blocked` + entrée `validations` avec UNE question précise ; le travail indépendant continue.
- **Critère de sortie (binaire)** : test unitaire : une mission plannée porte ≥1 escalate_when ; simulation d'un match → la tâche passe `needs_validation`/`blocked` avec la question posée, les tâches indépendantes continuent ; `pnpm -r test` vert.

### C6 — `decisions-a-defaut-applique.md` (P8)

- **Contexte** : MAOS sait bloquer (validations) et logger (decisions), pas « avancer sur un défaut raisonnable en laissant une fenêtre de veto » — le mode qui a permis au cockpit de lancer la vague A sans attendre 5 arbitrages (D1→D5 : « défauts appliqués, veto possible »). Résultat : zéro mission retardée par une décision réversible.
- **Travail** : (1) étendre `decisions` : `status` {pending, acted, vetoed}, `options` (a/b/c + conséquence), `defaultApplied`, `appliesAt` ; (2) restriction dure : réservé aux décisions **réversibles risk:low** (les high/blocking restent des validations bloquantes, CLAUDE.md §5) ; (3) section « À trancher par toi » du dashboard (déjà exigée par CLAUDE.md §14) listant les pending avec leur défaut ; (4) veto → marque `vetoed` + tâche corrective proposée.
- **Critère de sortie (binaire)** : test : créer une décision pending avec défaut → elle apparaît dans « à trancher » ; poser un veto avant `appliesAt` → statut `vetoed` et le défaut n'est pas appliqué ; une décision risk:high est refusée par ce canal (test) ; `pnpm -r test` vert.

### C7 — `api-doc-agents.md` (P9)

- **Contexte** : 22 routes sous `apps/web/app/api/**` sans contrat documenté : ni un agent, ni le futur pont OtakuGO↔MAOS (OP-19 cockpit, jamais lancée) ne peuvent découvrir la surface sans lire le code. Le cockpit documente 40+ endpoints avec la doctrine « ce que Melvyn voit à l'écran, un agent le lit ici » + garanties d'écriture explicites.
- **Travail** : (1) `apps/web/API.md` : doctrine de parité, table par endpoint (rôle, paramètres, exemple), section Garanties (qui écrit quoi, jamais de commit auto) ; (2) section générée synchronisée via le skill `update-docs` (routes = source de vérité) pour tuer la dérive ; (3) mise à jour CLAUDE.md §3 si nouveau fichier top-level de doc.
- **Critère de sortie (binaire)** : 100 % des `route.ts` existants ont leur entrée dans API.md (script de comptage exit 0/1 façon portique P19) ; relancer la génération ne produit aucun diff ; une route ajoutée sans doc fait échouer le check (testé une fois).

### C8 — `rapport-reveil-autopilot.md` (P10)

- **Contexte** : l'autopilot MAOS (§4 : « Report on resume », table `schedules` prête) n'a pas de format de restitution. Le cockpit a inventé le rapport « ☀️ Réveil » (OP-20 passe 6) : verdict en tête, parcours guidé « ce que tu vas remarquer en 2 minutes », « à valider par toi », « où tout se trouve », prompt de relance — la nuit devient inspectable en 5 minutes au réveil.
- **Travail** : (1) template `packages/core` du rapport de fin de fenêtre autopilot (5 sections ci-dessus, s'appuie sur le contrat C3) ; (2) accrochage worker : fermeture de fenêtre `schedules` → génération du rapport `kind=mission` ; (3) rendu dédié dans le cockpit avec la section « à valider par toi » en visible (CLAUDE.md §14). Séquencer AVEC l'activation réelle de l'autopilot Phase 6 — pas avant (sinon carte dormante, cf. KILL P10).
- **Critère de sortie (binaire)** : à la fermeture d'une fenêtre autopilot de test (≥1 tâche exécutée), un rapport réveil existe avec les 5 sections non vides et est visible dans l'UI ; 100 % des fenêtres de test en produisent un ; `pnpm -r test` vert.

### C9 — `ecritures-externes-a-committer.md` (P11)

- **Contexte** : la règle « jamais de commit auto » est doctrinale chez MAOS mais sans surface : Melvyn ne voit nulle part ce qu'un agent a écrit dans son projet externe et pas commité. Le cockpit l'a résolu : bandeau « à committer » (`/api/writes/pending`, git status RO) + message de commit conventionnel préparé, jamais exécuté. C'est le filet exact sous le pilotage d'OtakuGO depuis MAOS.
- **Travail** : (1) panneau « écritures en attente » du projet actif : `git status` lecture seule sur `projects.path`, liste des fichiers modifiés ; (2) message de commit conventionnel préparé (copiable, jamais exécuté) ; (3) portique CI (famille `scripts/lint-no-sdk-payg.sh`) : aucun chemin de code `apps/`/`packages/` n'invoque `git commit|push` sur un path de projet externe ; (4) reprendre au passage le réflexe P16 : l'identité de la cible (path du projet actif) re-vérifiée à chaque écriture du worker.
- **Critère de sortie (binaire)** : modifier 2 fichiers d'un projet externe de test via une mission → le panneau les liste avec la commande de commit préparée ; grep-portique en CI exit 0 sur le repo, exit 1 sur un fixture violant la règle (testé vert/rouge/vert) ; aucune exécution de commit par MAOS (absence vérifiée par le portique).

### C10 — `reprise-universelle-next-action.md` (P13)

- **Contexte** : une session MAOS qui meurt en cours de tâche ne laisse aucune consigne de reprise : `conversations` garde l'historique (archéologie), pas la prochaine action. Le cockpit survit à la mort de session depuis 34 missions : « PROCHAINE ACTION SUR REPRISE » écrite à chaque étape + prompt universel « continue à la première tâche non DONE », y compris en clé machine-lisible (`missions.json:5`).
- **Travail** : (1) le worker écrit `next_action` (texte précis) à CHAQUE changement d'état de tâche — event typé ou colonne `tasks.nextAction` ; (2) règle fiche worker : ne jamais terminer un pas sans next_action à jour (« la session peut mourir n'importe quand ») ; (3) bouton « Reprendre » dans l'UI mission (re-dispatch à la première tâche non done, next_action en tête de prompt) ; (4) alimente le prompt de reprise de C4.
- **Critère de sortie (binaire)** : test d'intégration : tuer le worker en milieu de mission → relancer → la mission reprend à la première tâche non done sans intervention ni perte, et le prompt de reprise contient la next_action ; `pnpm -r test` vert.

### C11 — `verification-independante-ternaire.md` (P14)

- **Contexte** : `mas-reviewer` juge sur lecture d'artefacts ; le cockpit exige plus dur avant merge (R26) : re-exécution réelle de chaque affirmation, cas adversariaux fabriqués, verdict ternaire PAR POINT (PROUVÉ/RÉFUTÉ/NON VÉRIFIABLE) écrit en fichier. Les Checkers de la pipeline d'audit MAOS le font déjà à la main — preuve que la méthode nous manque en standard.
- **Travail** : (1) enrichir `.claude/skills/mas-reviewer/SKILL.md` d'un mode « vérification indépendante » : contrôle diff-déclaré d'abord (`git diff --name-status <base>..<tip>` = exactement la section Fichiers touchés — gabarit `VERIFICATION.md:35`, F5) ; ≥5 affirmations re-exécutées (commande + extrait collé), ternaire par point, ≥1 cas fabriqué (défaut planté) ; **règle 4 (F2)** pour toute affirmation COMPARATIVE : matérialiser la version d'avant (`git show <sha>:fichier`) et exécuter les DEUX versions sur les mêmes données — data = corpus complet, jamais un échantillon ; verdict global inchangé (PASS/NEEDS_WORK/BLOCK) ; (2) **décision règle 6 (F4)** : le vérificateur reste STRICTEMENT read-only (doctrine mas-reviewer conservée) — un RÉFUTÉ borné est renvoyé au Doer pour UNE passe de correction puis re-check, jamais corrigé par le vérificateur ; un RÉFUTÉ non borné bloque et remonte à Melvyn ; (3) sortie persistée via `reports` (verdict C3) ; (4) déclenchement : missions risk ≥ medium ou touchant un projet externe.
- **Critère de sortie (binaire)** : sur 1 mission réelle, le verdict produit contient le contrôle diff-déclaré + ≥5 points ternaires avec commande+extrait chacun + ≥1 cas fabriqué, et toute affirmation comparative du rapport a été testée en exécutant les deux versions ; un point RÉFUTÉ force verdict ≠ PASS et zéro fichier de l'objet vérifié n'est modifié par le vérificateur (test) ; le skill passe la relecture §12 (sections lifecycle complètes).

### C12 — `contrat-alertes-cockpit.md` (P15)

- **Contexte** : aucune doctrine d'alerte dans le cockpit MAOS : rien n'empêche une donnée absente de fabriquer une fausse alerte, ni une alerte muette sur l'action à faire. Le cockpit OtakuGO (OP-27) a un contrat : « aucun fait ⇒ aucune alerte » (null ≠ zéro) et trois phrases obligatoires {quoi, pourquoi, action} + route + commande.
- **Travail** : (1) type `Alert` (`apps/web/lib/`) avec {quoi, pourquoi, action, route, sévérité} non vides — validation Zod ; (2) test « null ≠ zéro » : toute source de données absente produit zéro alerte (pas une alerte d'absence) ; (3) migrer les affichages d'état existants (tâches bloquées, validations pending, budget) vers ce contrat ; consommé par C1 (désync).
- **Critère de sortie (binaire)** : le validateur refuse une alerte à champ vide (test) ; le test null≠zéro passe sur chaque famille d'alertes ; 100 % des alertes rendues dans l'UI passent par le type validé (grep : aucun rendu d'alerte hors du composant contractuel).

### C13 — `routage-nature-de-tache.md` (P17)

- **Contexte** : trois étages MAOS choisissent un modèle et aucun n'encode la charge cognitive : `mas-skill-router` route par risque (three-tier), `config/model-routing.json` par domaine→provider, et le dispatch réel retombe sur le défaut projet (`packages/agents/src/dispatch.ts:597,774` : `defaultModel ?? claude-haiku-4-5`). Une synthèse multi-sources ou un arbitrage risk:low part donc sur haiku. Le cockpit route par NATURE sur 34 fiches (arbitrage/synthèse → Fable 5 effort high même sans risque d'action ; mécanique → petit modèle) avec le garde-fou inverse « jamais le gros modèle pour du low-risk » (`PROTOCOL.md:131-141`).
- **Travail** : (1) dimension `nature` par tâche dans PlannerOutput (enum bornée : `arbitrage-synthese` | `implementation` | `mecanique`) émise par `mas-mission-planner` ; (2) résolution dans `mas-skill-router` + dispatch : modèle = max(modèle-par-risque, modèle-par-nature), garde-fou conservé (jamais le gros modèle pour une tâche mécanique low-risk) ; (3) résidu F8 : graver la discipline sous-agents du cockpit dans les fiches Tier A exécutantes — profondeur 1 (aucun équivalent MAOS aujourd'hui ; le fan-out en un tour est couvert par `superpowers:dispatching-parallel-agents`).
- **Critère de sortie (binaire)** : tests unitaires du routage : une tâche `nature=arbitrage-synthese` + risk:low reçoit un modèle > haiku ; une tâche `nature=mecanique` + risk:low reste sur haiku ; une tâche risk:high reste sur opus quelle que soit la nature ; `pnpm -r test` vert.

## Rejets argumentés

### P20 — Cockpit web sans framework (Node natif + SPA vanilla) — REJETER

Le cockpit logiciel OtakuGO est une réussite *dans son contexte* : zéro framework, zéro build, 246 tests, évolué par agents sur 8 vagues. Mais c'est un **choix de stack, pas un pattern** : MAOS a verrouillé Next.js 15 + TypeScript + Drizzle (`CLAUDE.md` §2, « Do not introduce frameworks outside this list without an ADR ») et possède déjà un cockpit fonctionnel dessus. Porter quoi que ce soit du code (serveur natif, SPA vanilla) violerait à la fois la contrainte de stack (KILL étape 0 de l'intake) et la règle « on porte des patterns, jamais du code » de cette pipeline. **Ce qui survit du cockpit web n'est pas sa technique mais ses contrats** — statut-vérité (C1), API documentée (C7), writes-pending (C9), alertes (C12) — tous portés par ailleurs. Coût d'un port : réécriture complète pour zéro gain fonctionnel ; doublon : total.

### P21 — FEATURE_TEMPLATE à 20 sections — REJETER

Le template de feature (`docs/features/templates/FEATURE_TEMPLATE.md`) est un outil de **développement produit Flutter/Supabase** : sur 20 sections (comptage Checker F6, `grep -c '^## '`), l'essentiel est spécifique au domaine OtakuGO (Feature Folder `lib/features/`, Supabase Tables, RLS Rules, Migration ID, `flutter analyze`). Côté MAOS, l'unité de travail est la mission — déjà servie par la fiche mission + PlannerOutput + `context_packs` (`packages/db/src/schema.ts:263-271`) ; ajouter un registre de features par projet externe dupliquerait les fiches mission et créerait une surface de maintenance sans consommateur (KILL : doublon + coût de maintenance, template à 90 % inapplicable hors Flutter). Les deux gènes universels du template sont récupérés ailleurs : « Next Step For AI » → C10 (reprise), « Current Progress » → état vivant DB (P3, structurellement couvert). Si un jour MAOS pilote le développement produit d'OtakuGO au point d'avoir besoin de fiches feature, c'est OtakuGO qui les possède déjà — MAOS les LIRA (projet enregistré par path), il n'a pas à se les approprier.

### Note transverse (leçon, pas pattern) — le double registre déclaré/calculé

L'histoire de `missions.json.statut` est instructive en creux : le cockpit a d'abord tenu un statut déclaré à la main, a subi la désynchronisation (R16 : « j'ai mergé… mais ce n'est pas à jour sur le site »), puis a dû construire truth.js + badge + resync pour s'en sortir. **MAOS ne doit jamais introduire de second registre de statut** (fichier, doc, board) à côté de la DB : C1 ajoute une *vue calculée* et un badge, pas un deuxième stockage. Cette leçon est intégrée à la carte C1 (le statut stocké devient le « déclaré », la vérité est recalculée à la lecture).
