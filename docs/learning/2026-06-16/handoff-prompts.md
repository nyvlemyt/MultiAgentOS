# Handoff prompts — 2026-06-16

Two independent UI-shell features, each with a ready-to-paste **Doer** then **Checker**
prompt. Run each pair in its own session. Specs are the contract.

- Feature A — Agent Control Panel → `docs/superpowers/specs/2026-06-16-agent-control-panel-design.md`
- Feature B — Rich Composer → `docs/superpowers/specs/2026-06-16-rich-composer-design.md`

Both are Phase-0 mock UI: real DB + real read-only disk where the spec says, scripted
reply otherwise. No live LLM. Conventions: CLAUDE.md §7 (5 checks incl. Sonar exit 0),
TDD per `superpowers:test-driven-development`, knowledge-base first (§12). **Open PRs as
DRAFT** (the user merges early otherwise). Sequencing: A and B are largely independent
(A = agent-page side panel; B = the composer input). If they collide in
`ConversationPanel.tsx`, B rebases onto A.

**How to launch:** paste the **Orchestrator** prompt below into one fresh session — it
decomposes the work and spawns its own Doer/Checker sub-agents. Or, to drive manually,
paste the per-feature **Doer** then **Checker** prompts into separate sessions yourself.

---

## MASTER — ordre d'exécution (toutes les phases)

Roadmap complète : `docs/superpowers/specs/2026-06-16-cockpit-roadmap.md`.
**Règle token :** une phase = une session fraîche, prompt court, exécution subagent-driven
(l'orchestrateur ne code pas, il spawn Doer puis Checker). PR EN DRAFT, l'utilisateur merge.

| # | Phase | Session | Dépend de | Prompt à coller |
|---|-------|---------|-----------|-----------------|
| 0 | Merge **#29** (FR + rapports) | — (toi) | — | (merge GitHub) |
| 1 | **Mission-dashboard** (chat mission + index + rapport final *seam*) | fraîche, après #29 mergé | #29 | bloc **M · ORCHESTRATOR** ci-dessous |
| 2 | **Spec A — Agent Control Panel** | fraîche, **en parallèle** de 1 | #29 (rebase si collision `ConversationPanel.tsx`) | bloc **ORCHESTRATOR** (A) + A·DOER/A·CHECKER |
| 3 | **Spec B — Rich Composer** | fraîche, **après** 1 (touche le composer partagé) | 1 mergé | bloc **ORCHESTRATOR** (B) + B·DOER/B·CHECKER |
| 4 | **Manager projet** (page projet + rapport d'état agrégé) | fraîche | 1 mergé (rapports finaux) | à rédiger au lancement (spec dans roadmap §2.2) |
| 5 | **Export fichiers rapports** (.md/.html dans le projet, gated §5) | fraîche | 1 mergé | à rédiger (roadmap §2.6) |
| 6 | **ECC + Cybersec harvest** | session(s) dédiée(s) **attended**, budget levé | indépendant | `docs/intake/2026-06-16-ecc-harvest/KICKOFF-PROMPT.md` |
| 7 | **Vrai LLM** (capstone) | fraîche, budget-gated | tout l'UI | à rédiger en dernier |

**Lançables en parallèle dès #29 mergé :** 1 (mission-dashboard) + 2 (Spec A) + 6 (ECC,
si tu acceptes le quota). 3/4/5 attendent 1. 7 en dernier.

---

## ORCHESTRATOR (one session, spawns its own sub-agents)

```
Tu orchestres la livraison de deux features UI de MultiAgentOS, en lançant tes propres
sous-agents (un Doer puis un Checker par feature). Tu ne codes pas toi-même : tu délègues,
tu vérifies les verdicts, tu cures les commits.

Lis d'abord CLAUDE.md (§4, §5, §7, §9.bis, §11, §12) et les deux specs :
- docs/superpowers/specs/2026-06-16-agent-control-panel-design.md   (feature A)
- docs/superpowers/specs/2026-06-16-rich-composer-design.md         (feature B)

Pour CHAQUE feature, dans l'ordre A puis B (B peut démarrer en parallèle ; si conflit dans
ConversationPanel.tsx, B rebase sur A) :
1. Spawn un sous-agent DOER avec le bloc "X · DOER" correspondant ci-dessous (verbatim).
   Le Doer code en TDD, n'auto-merge pas, ouvre une PR EN DRAFT, et ne se déclare "fait"
   qu'avec les 5 checks verts (pnpm -r test · lint · build · smoke · Sonar exit 0 + gate OK).
2. Quand le Doer rend, spawn un sous-agent CHECKER avec le bloc "X · CHECKER" (verbatim).
   Le Checker est frais + sceptique, rejoue les 5 checks, et ÉCRIT son verdict dans
   docs/learning/2026-06-16/checker-verdict-{a,b}.md (committé) — ce fichier fait foi.
3. Lis le verdict. Si NEEDS_WORK/BLOCK → renvoie les findings au Doer (re-spawn) jusqu'à PASS.
   Si PASS → tu cures le commit. Ne merge jamais sans feu vert humain explicite.

Règles non négociables transmises à chaque sous-agent : TDD ; knowledge-base d'abord (§12) ;
Inspiration Voie 2 pour le composer (§9.bis) ; aucun import @anthropic-ai/sdk (§11) ;
refus écriture hors sandbox projet (§5) ; sonar-recurring-rules.md lu avant l'UI ;
PR en DRAFT. Rapporte à la fin : état des 5 checks par feature + chemins des deux verdicts.
```

---

## A · DOER

```
Tu es le Doer pour la feature "Agent Control Panel" de MultiAgentOS.

Lis CLAUDE.md (surtout §4 autonomie, §5 actions gated, §7 vérification, §12 knowledge base)
puis le spec complet : docs/superpowers/specs/2026-06-16-agent-control-panel-design.md.
Avant de coder, lis docs/knowledge/ pertinents (agent-patterns.md) et le radar
docs/knowledge/vibeflow/INDEX.md (CLAUDE.md §12).

Branche : git checkout -b phase/agent-control-panel (depuis phase/ui-multi-conversations).

Implémente exactement le spec, en TDD (superpowers:test-driven-development) :
1. Migration Drizzle : tables agent_overrides + fiche_revisions (champ summary inclus).
2. lib/agent-config.ts (merge défaut+override, save), lib/agent-fiche.ts (read/write disque,
   snapshot, pruneFicheRevisions = garde 10 / purge >30j, revisionsNeedCleanup). Tests d'abord.
3. Server actions agent-config-actions.ts (updateAgentConfig, toggleAgentSkill, saveFiche +
   confirm, restoreFicheRevision). Aucune écriture fichier hors .claude/agents / packages/agents.
4. Composant AgentControlPanel.tsx à onglets (Profil/Skills/Fiche/Activité) + sous-onglets,
   remplaçant l'aside statique des pages /projects/[slug]/agents/[id] et /agents/[id].
   Page projet = override DB + fiche lecture seule. Page base = fiche éditable + historique,
   Profil/Skills lecture seule.
5. Confirm UI : montée autonomie→autonome/autopilote, montée budget, save fiche, restore.
6. Carte "nettoyer l'historique ?" sur l'onglet Fiche quand revisionsNeedCleanup.

Respecte les règles Sonar (docs/knowledge/sonar-recurring-rules.md) AVANT d'écrire le code UI.
Ne touche pas au fix de bug threads déjà présent (key={conv.id}).

Vérification finale obligatoire (les 5 checks, colle les sorties) :
pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke · Sonar.
Pousse la branche, ouvre une PR EN DRAFT (base phase/ui-multi-conversations), puis lance
l'analyse Sonar du HEAD sha et tourne scripts/sonar-pr-issues.sh <pr> jusqu'à exit 0
(zéro issue ouverte, zéro hotspot à revoir) ET qualitygates/project_status == OK.
Ne déclare "fait" que quand les 5 checks sont verts. Ne merge pas.
```

## A · CHECKER

```
Tu es le Checker pour la feature "Agent Control Panel". Tu ne codes pas (sauf micro-fix
si le Doer a laissé un check rouge trivial — sinon tu renvoies au Doer).

Lis le spec docs/superpowers/specs/2026-06-16-agent-control-panel-design.md et la PR/branche
phase/agent-control-panel. Vérifie point par point :
- agent_overrides scopé (agentId, projectId NOT NULL) ; page projet n'écrit JAMAIS de fichier.
- page base écrit le vrai .md + snapshot dans fiche_revisions (avec summary) avant write.
- pruneFicheRevisions = 10 dernières ET purge >30j ; revisionsNeedCleanup correct (bornes).
- confirm présent sur autonomie↑/budget↑/save fiche/restore.
- onglets corrects et miroir projet/base comme spécifié.
- aucune écriture hors sandbox projet / .claude/agents / packages/agents (§5).
- tests Vitest couvrent merge, snapshot/restore round-trip, prune, gating UI.

Rejoue les 5 checks toi-même : pnpm -r test · pnpm lint · pnpm build ·
pnpm --filter @mas/web smoke · Sonar (script exit 0 + gate OK). Colle les sorties.

Écris ton verdict dans docs/learning/2026-06-16/checker-verdict-a.md (committé) :
verdict PASS / NEEDS_WORK / BLOCK, findings numérotés, et l'état des 5 checks. Le verdict
dans le fichier fait foi (la session principale le lit sans copier-coller).
```

---

## B · DOER

```
Tu es le Doer pour la feature "Rich Composer" de MultiAgentOS.

Lis CLAUDE.md (§5 gated, §7 vérif, §11/§11.bis billing, §12 knowledge) puis le spec :
docs/superpowers/specs/2026-06-16-rich-composer-design.md. Lis docs/knowledge/ pertinents
et le radar docs/knowledge/vibeflow/INDEX.md. Inspiration Voie 2 (CLAUDE.md §9.bis) :
regarde comment siteboon/claudecodeui et sugyan/claude-code-webui font le composer
(slash, file-ref, attachments) avant d'écrire — porte le PATTERN, cite la source en commentaire.

Branche : git checkout -b phase/rich-composer (depuis phase/ui-multi-conversations).
NB : si la branche A (phase/agent-control-panel) a déjà modifié ConversationPanel.tsx,
rebase dessus pour éviter le conflit.

Implémente le spec en TDD :
1. lib/model-capabilities.ts (map mock), lib/composer-commands.ts (parseSlash/applyCommand
   purs), lib/token-estimate.ts (heuristique pure), lib/project-tree.ts (walk lecture seule
   de projects.path, gitignore-aware, REFUSE tout chemin hors projectPath — §5). Tests d'abord.
2. Server action searchProjectFiles(projectId, query) lecture seule.
3. Composant Composer.tsx extrait de ConversationPanel (SlashMenu, FileRefMenu, ContextChips,
   ModelEffortPicker). Bouton attach gated par modelCapabilities[model].images → stub différé.
4. ConversationPanel reçoit le payload riche et garde son seam send() (reply scripté).
5. /mode raising autonomie → même confirm que feature A.

Aucun import de @anthropic-ai/sdk (§11). Respecte sonar-recurring-rules.md avant d'écrire l'UI.
Ne touche pas au fix bug threads (key={conv.id}).

Vérification finale (5 checks, colle sorties) : pnpm -r test · pnpm lint · pnpm build ·
pnpm --filter @mas/web smoke · Sonar (script exit 0 + gate OK). Pousse, PR EN DRAFT
(base phase/ui-multi-conversations). Ne déclare "fait" qu'avec les 5 verts. Ne merge pas.
```

## B · CHECKER

```
Tu es le Checker pour la feature "Rich Composer". Tu ne codes pas (sauf micro-fix trivial).

Lis le spec docs/superpowers/specs/2026-06-16-rich-composer-design.md et la branche
phase/rich-composer. Vérifie :
- parseSlash/applyCommand purs et testés (chaque commande, inconnue, sans arg) ; pas d'exécution.
- model-capabilities gate bien l'affordance attach (caché si images=false).
- token-estimate monotone avec longueur+chips, 0 sur vide.
- project-tree : lecture seule, gitignore-aware, capé, REFUSE chemin hors projectPath (§5) —
  teste explicitement ce refus.
- Composer extrait proprement, ConversationPanel garde son seam send().
- aucun import @anthropic-ai/sdk (lance scripts/lint-no-sdk-payg.sh) (§11).
- confirm sur /mode autonomie↑.

Rejoue les 5 checks : pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke ·
Sonar (script exit 0 + gate OK). Colle les sorties.

Écris ton verdict dans docs/learning/2026-06-16/checker-verdict-b.md (committé) :
PASS / NEEDS_WORK / BLOCK, findings numérotés, état des 5 checks. Le fichier fait foi.
```

---

## M · ORCHESTRATOR (mission-dashboard — une session fraîche, après #29 mergé)

```
Tu orchestres la livraison du MISSION-DASHBOARD de MultiAgentOS en lançant tes propres
sous-agents (un Doer puis un Checker). Tu ne codes pas toi-même : tu délègues, tu vérifies.

Lis d'abord : CLAUDE.md (§5, §7, §8, §11, §12), la spec
docs/superpowers/specs/2026-06-16-mission-dashboard-design.md (= le contrat), et
docs/knowledge/ pertinents. Branche neuve off main : phase/ui-mission-dashboard.

1. Spawn un sous-agent DOER avec le bloc "M · DOER" ci-dessous (verbatim). TDD, PR EN DRAFT,
   pas d'auto-merge, "fait" seulement avec 5 checks verts (pnpm -r test · lint · build ·
   smoke · scripts/sonar-pr-issues.sh <pr> exit 0 + gate OK).
2. À la remise, spawn un sous-agent CHECKER (bloc "M · CHECKER", verbatim) : frais, sceptique,
   rejoue les 5 checks, écrit le verdict dans docs/learning/2026-06-16/checker-verdict-m.md
   (committé) — ce fichier fait foi.
3. Boucle Doer↔Checker jusqu'à PASS + Sonar exit 0, puis passe la PR "ready" et rends la main.
Garde tout en FR (langue primaire). NE merge PAS, NE push PAS sur main.
```

## M · DOER

```
Tu es le Doer du MISSION-DASHBOARD. Autonome, TDD. Branche phase/ui-mission-dashboard (off main).
Contrat = docs/superpowers/specs/2026-06-16-mission-dashboard-design.md. Lis-le + CLAUDE.md
(§5/§7/§8/§11/§12) + docs/knowledge/sonar-recurring-rules.md AVANT de coder. Inspecte d'abord :
apps/web/app/(cockpit)/missions/[id]/page.tsx, apps/web/lib/conversations.ts,
apps/web/lib/reports.ts, apps/web/components/manager/ConversationPanel.tsx,
apps/web/app/(cockpit)/conversation-actions.ts, packages/db/src/schema.ts.

Construis, chaque étape RED→GREEN (Vitest), commit par étape (Conventional ≤60 chars, finir
chaque message par Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>) :
1. Migration 0010 : conversations.mission_id (text nullable) + index ; garde le chain-guard vert
   (packages/db migrations-meta.test). Étends conversations.ts : scope 'mission'
   (where projectId+missionId) ; createConversation/listConversations le supportent.
2. sendMissionMessage (server action) + scripted reply (réutilise le seam manager/agent).
3. lib mission-progress.ts : missionProgress(tasks, reports) pur → {done,total,steps}. TDD.
4. Page /missions/[id] = dashboard : en-tête existant + chat mission (ConversationPanel kind
   'mission', multi-thread, key={conv.id}) + Index d'avancement + Rapports par tâche (existant)
   + Agents impliqués (liens conv projet) + bouton "Générer le rapport final" → server action
   créant un reports kind='mission' (mock structuré what/why/how/tests + index ; SEAM, ne pas
   sur-investir le contenu) + affichage/lien.
5. FR partout. Mets à jour smoke si le markup change (garde un heading attendu pour /missions/[id]).
HARD RULES : pas de @anthropic-ai/sdk ; écritures mémoire seulement via tables candidates (§8) ;
NE jamais exporter MAS_MOCK_LLM globalement ; applique sonar-recurring-rules en amont (pas de
ternaire imbriqué, replaceAll, regex bornées, <output> sur role=status, pas de key=index,
node: prefixes, localeCompare). Si une étape déborde, livre le cœur + documente le reste en M-b.
QUAND FINI : pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke (colle les
tails), corrige jusqu'au vert. Écris docs/learning/2026-06-16/mission-dashboard-build-report.md
(livré, fichiers, tails, déferts) + commit. Pousse la branche, ouvre la PR EN DRAFT (base main),
drive Sonar (scripts/sonar-pr-issues.sh <pr>) jusqu'à exit 0 + gate OK. NE merge PAS.
Rends : fichiers, nb de commits, pass/fail + chiffres des 5 checks, n° de PR.
```

## M · CHECKER

```
Tu es le Checker du MISSION-DASHBOARD. READ-ONLY — ne modifie pas le source. Branche
phase/ui-mission-dashboard. Vérifie contre docs/superpowers/specs/2026-06-16-mission-dashboard-design.md
+ CLAUDE.md (§5/§7/§8/§11/§12). Pour chaque point de la spec : confirme ou faute (sévérité).
Rejoue les 5 checks toi-même (pnpm -r test · lint · build · smoke · sonar-pr-issues exit 0 +
gate OK), colle les tails. Grep les invariants : pas de @anthropic-ai/sdk ; pas d'écriture
data/memory/ hors Memory Keeper ; §5 gate intact ; migration 0010 chain propre. Vérifie que le
rapport final est bien un SEAM (mock structuré, pas de sur-ingénierie) et que tout est FR.
Écris le verdict dans docs/learning/2026-06-16/checker-verdict-m.md (committé,
docs(mission-dashboard): checker verdict) : PASS / NEEDS_WORK / BLOCK + findings numérotés +
état des 5 checks. Le fichier fait foi. NE push PAS sur main.
```
