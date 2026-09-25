# Rapport brut : capacités du harnais Claude Code non exploitées

Agent : `claude-code-guide` (agent de documentation du harnais). Lancé le 16/09/2026 au soir, axe F de l'audit du lot 2. Déposé tel quel, sans transcription. Sources : documentation officielle citée par URL dans le corps.

---

## 1. Fiches d'agent (.claude/agents/*.md)

Source : https://code.claude.com/docs/en/sub-agents.md

Champs obligatoires : `name`, `description`.

Champs optionnels de contrôle d'exécution : `model` (sonnet, opus, haiku, fable, ID complet, ou `inherit`) ; `effort` (low, medium, high, xhigh, max) ; `permissionMode` (default, acceptEdits, auto, dontAsk, bypassPermissions, plan) ; `maxTurns` ; `background` (false pour attendre le résultat) ; `omitClaudeMd` (true pour ne pas charger CLAUDE.md, v2.1.271+).

Champs mémoire et contexte : `memory` (user, project, local : mémoire persistante propre à l'agent entre sessions) ; `skills` (liste de skills préchargés au démarrage) ; `mcpServers`.

Champs permissions et outils : `tools` (liste blanche) ; `disallowedTools` (liste noire).

Exécution isolée : `isolation: worktree`.

Hooks et lancement : `hooks` (dictionnaire d'événements de hooks propres à cet agent) ; `initialPrompt` ; `color`.

Déduction de l'agent : les hooks propres à l'agent appliquent les mêmes événements que les hooks globaux, limités à cet agent. Un agent revue peut avoir des hooks qui vérifient les findings, un agent exécution des hooks qui valident avant d'agir.

Limitation documentée : les agents fournis par des plugins ignorent `hooks`, `mcpServers` et `permissionMode` pour des raisons de sécurité. Pour les utiliser, copier la fiche dans `.claude/agents/`.

## 2. Hooks

Source : https://code.claude.com/docs/en/hooks-guide.md

Événements documentés : SessionStart (matcher startup, resume, clear, compact, fork) ; Setup ; UserPromptSubmit ; UserPromptExpansion ; PreToolUse (peut bloquer) ; PermissionRequest ; PermissionDenied ; PostToolUse ; PostToolUseFailure ; PostToolBatch ; Notification (matcher permission_prompt, idle_prompt, auth_success, agent_needs_input, agent_completed, etc.) ; Stop ; StopFailure ; MessageDisplay ; SubagentStart ; SubagentStop ; TaskCreated (agent teams) ; TaskCompleted (agent teams) ; TeammateIdle (agent teams) ; InstructionsLoaded (matcher session_start, nested_traversal, path_glob_match, include, compact) ; ConfigChange ; CwdChanged ; DirectoryAdded ; FileChanged (matcher noms de fichiers littéraux) ; WorktreeCreate ; WorktreeRemove ; PreCompact ; PostCompact ; PreModelSwitch (peut bloquer) ; PostModelSwitch ; Elicitation ; ElicitationResult ; SessionEnd.

Entrée d'un hook (JSON sur stdin) : `session_id`, `cwd`, `hook_event_name` ; pour PreToolUse et PostToolUse, `tool_name` et `tool_input` ; pour UserPromptSubmit, `prompt` ; pour SessionStart, `source`. (Note du fil : le relevé de la tâche 3 du lot 1a a constaté sur ce poste les champs supplémentaires `agent_id`, `agent_type`, `permission_mode`, `prompt_id`, `scratchpad_dir`, `tool_use_id`, `transcript_path`, `effort`.)

Ce qu'un hook peut renvoyer : exit 0 (aucune objection ; pour UserPromptSubmit, stdout est ajouté au contexte) ; exit 2 (bloque, stderr devient le retour) ; JSON structuré sur stdout. Pour PreToolUse et PostToolUse : `permissionDecision` (allow, deny, ask), `permissionDecisionReason`, `updatedInput` (modifier les arguments de l'outil). Pour UserPromptSubmit : `additionalContext` (dans `hookSpecificOutput`), `blockPrompt`, `sessionTitle`. Pour Stop : `decision: "block"`.

Injection de contexte : documentée, un hook UserPromptSubmit ou SessionStart injecte du texte via `hookSpecificOutput.additionalContext`.

Relecture du rapport d'un sous agent par un hook : non documentée. SubagentStop reçoit l'événement de fin mais pas le rapport complet ; le rapport revient à l'appelant.

## 3. Communication entre agents

Sources : https://code.claude.com/docs/en/cross-session-messaging.md et https://code.claude.com/docs/en/agent-teams.md

Outils natifs : `ListAgents`, `SendMessage`.

Agent teams (expérimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) : un team lead (la session principale) coordonne ; des teammates (sessions indépendantes) travaillent en parallèle ; une liste de tâches partagée que les agents revendiquent et complètent ; messagerie directe par nom ; boîte aux lettres en fichiers JSON.

Limites documentées : texte brut seulement ; un message entrant n'approuve jamais une permission ; les sous agents n'héritent pas de la mémoire auto de la session principale ; pas d'imbrication d'équipes.

## 4. Workflows

Source : https://code.claude.com/docs/en/workflows.md

Un script JavaScript qui orchestre plusieurs sous agents en parallèle, exécuté en arrière plan dans un environnement isolé, hors de la conversation principale. Résultats intermédiaires en variables, pas dans le contexte. Chaque sous agent a sa propre fenêtre. Les hooks applicables aux sous agents tournent. Le mode de permission est demandé une fois au lancement.

Déduction de l'agent : pas d'approbation native entre agents dans un script ; le workflow ne bloque pas sur le résultat d'un relecteur. Pour un pipeline planificateur, exécutant, relecteur, contre-relecteur, les agent teams sont plus adaptés (liste de tâches partagée, communication structurée).

## 5. Skills

Source : https://code.claude.com/docs/en/skills.md

Frontmatter : `description` (obligatoire) ; `disable-model-invocation` ; `user-invocable` ; `context: fork` (isole le skill dans un sous agent) ; `agent` (type de sous agent quand fork) ; `allowed-tools` ; `disallowed-tools` ; `model` ; `effort` ; `background` ; `argument-hint` ; `arguments` ; `paths` (globs limitant l'auto activation).

`context: fork` : le skill ne voit pas l'historique, charge CLAUDE.md et l'agent nommé, rend son résultat à la conversation.

Donner un skill à un agent précis : le champ `skills` de la fiche d'agent précharge les skills listés pour cet agent seulement.

## 6. Mémoire

Source : https://code.claude.com/docs/en/memory.md

CLAUDE.md : `~/.claude/CLAUDE.md`, `./CLAUDE.md` ou `./.claude/CLAUDE.md`, `CLAUDE.local.md` ; chargement de toute l'arborescence ; taille recommandée sous 200 lignes ; imports par `@chemin`.

Auto memory : `~/.claude/projects/<projet>/memory/`, index `MEMORY.md` (200 premières lignes ou 25 Ko chargés à chaque session), fichiers de sujet chargés à la demande, types user, feedback, project, reference, survit aux compactions.

Règles à portée de chemin : `.claude/rules/*.md` avec frontmatter `paths:`, chargées seulement quand un fichier correspondant est lu.

Mémoire par agent : documentée, champ `memory` dans la fiche (user, project, local), répertoire séparé par agent. Pas de mémoire partagée au niveau d'une équipe.

## 7. Contexte et coût

Sources : https://code.claude.com/docs/en/context-window.md et https://code.claude.com/docs/en/memory.md

Compaction : `/compact` résume la conversation. Survivent : CLAUDE.md (rechargé), règles à portée de chemin (rechargées au prochain match), index de mémoire auto, fichiers lus récemment. Les descriptions de skills ne sont pas réinjectées après compaction, seuls les skills invoqués persistent.

Rapport d'un sous agent : il revient à son appelant et apparaît dans la conversation principale comme texte que le fil peut lire. Pas de mode silencieux documenté où il n'irait qu'à un hook.

CLAUDE.md : cible sous 200 lignes, l'adhérence baisse au delà ; les règles à portée de chemin servent à charger à la demande.

## 8. Plugins et marketplaces

Source : https://code.claude.com/docs/en/plugin-marketplaces.md

Un plugin se distribue par une marketplace (`marketplace.json`) référençant des plugins depuis GitHub, des chemins relatifs (dans le même dépôt de marketplace), des URL git (GitLab, auto hébergé), ou une URL directe de `marketplace.json`. Les chemins relatifs ne marchent qu'avec des sources git ou locales.

Instanciation dans un dépôt cible : `extraKnownMarketplaces` et `enabledPlugins` dans `.claude/settings.json`, distribués à qui clone le dépôt.

Versions : avec un champ `version`, mise à jour seulement quand il change ; sans, le SHA résolu du commit fait foi.

## 9. Ce que la documentation ne couvre pas (déductions de l'agent)

Pas d'orchestration native des approbations entre agents : pas de porte où un relecteur doit approuver avant que l'exécutant continue ; à orchestrer par prompts et messages.

Pas de contexte partagé persistant entre agents d'une équipe : chacun charge CLAUDE.md et ses skills ; les conventions partagées vont dans CLAUDE.md.

Pas de boucle automatique relecteur vers exécutant : un hook SubagentStop ou Stop déclenche une action mais ne relit pas le rapport ; il faudrait un agent intermédiaire.

## 10. Résumé de l'agent

Construisible avec certitude : une équipe avec un lead ; des fiches typées par rôle (model, effort, tools, skills, mémoire propre) ; des hooks aux points clés (TaskCreated, TeammateIdle, SubagentStop) ; des skills comme équipement par rôle ; CLAUDE.md et rules comme constitution partagée ; messagerie inter sessions ; mémoire auto par agent.

Dépend d'une orchestration manuelle : les approbations entre relecteurs et exécutants ; les boucles de retour ; le contexte dynamique par hooks.

Modèle recommandé par l'agent : agent teams plus fiches typées plus hooks d'assurance qualité plus skills par rôle. Les workflows conviennent au parallélisme massif sans forte coordination, pas à un pipeline d'approbation.
