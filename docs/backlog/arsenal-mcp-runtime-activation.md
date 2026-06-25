# Backlog — Activation runtime du MCP QMD pour les agents en boucle (0d/4c)

**Quand** : Étape 1 (chat live / dogfooding), quand un besoin réel d'appel agent → `query` existe. **Valeur** : haute — réalise enfin §Décision-5 au runtime. **Statut** : ✅ **DÉCIDÉ 2026-06-25 — Option B** : ADR 0007 §Décision-5 re-cadrée « câblage seulement », activation **différée à l'Étape 1** (amendement ADR daté ; code annoté dans `llm.real.ts` + `mission-llm.ts`). ADR ↔ code cohérents. Cette carte **trace l'activation ciblée future**. **Source** : `docs/learning/2026-06-25-night/U5-self-audit-0d.md` F1 · ADR 0007 §Décision-5 + amendement 2026-06-25 · `packages/core/src/llm.real.ts:57/107` · `packages/agents/src/mission-llm.ts:149-156,191` · `packages/agents/src/dispatch.ts:664`.

## Identity (quoi)

ADR 0007 §Décision-5 exige que l'outil `query` du MCP QMD devienne **appelable par un agent dispatché** (« preuve attendue : un agent appelle `query` pendant une mission »). 0d a ajouté `mcp?: boolean` à `ClaudeCodeLLMOptions` (`llm.real.ts:57`) qui injecte `mcpServers.qmd` + `allowedTools:['mcp__qmd__query']` (least-privilege, défaut OFF). **Mais** : `selectLLM` (le seul chemin dispatch) n'a pas de champ `mcp`, et aucun appelant ne le passe. Le flag est donc **inatteignable** depuis une mission réelle. La preuve ADR n'est satisfaite que par un test unitaire sur l'objet d'options.

## Why it matters

Une décision ADR « Accepted » dont le runtime ne réalise pas la clause centrale crée une **divergence ADR↔code** : on croit l'arsenal « consommé par les agents », il ne l'est pas. C'est exactement le défaut que 0d devait corriger (« le cerveau MCP dort »).

## Cost (install / maintenance / removal)

- **Install** : faible. Ajouter `mcp?: boolean` à l'opts de `selectLLM` (`mission-llm.ts:149`), le forwarder dans `claudeOpts`, l'exposer via `buildMissionLLM` derrière un opt-in env/config (défaut OFF pour rester byte-identique). +1 test « mcp on ⇒ options portent qmd ; off ⇒ inchangé ».
- **Maintenance** : faible — un flag opt-in de plus, aligné sur §11.bis (défaut OFF).
- **Removal** : trivial (supprimer le forward).

## Décision (2026-06-25) : **Option B — amender l'ADR, activation différée**

Tranché par Melvyn : on **amende ADR 0007 §Décision-5** en « câblage seulement, activation reportée à l'Étape 1 » (fait — amendement daté + annotations code) plutôt que d'activer maintenant. Raison : l'activation lance un sous-process `qmd mcp` par appel (coût/latence), le hot-path MCP est interdit par le périmètre 0d, et activer sans besoin live = surface/risque pour zéro valeur immédiate. ADR ↔ code sont désormais cohérents (plus de flou).

**Reste à faire (Étape 1, quand le besoin live est réel)** : câbler l'opt-in jusqu'au dispatch (`mcp?: boolean` sur l'opts de `selectLLM` → forward dans `claudeOpts` → exposé via `buildMissionLLM` derrière un opt-in env/config, défaut OFF) + **ciblage** (quels agents/missions) + 1 test « mcp on ⇒ options portent qmd ; off ⇒ byte-identique ».

## Liens
- `docs/backlog/cockpit-mcp-surface.md` (gouvernance/surface MCP — distinct : ici c'est l'activation runtime, pas l'UI).
- ADR 0003 amendement (QMD hors-worker via CLI ; MCP pour usage interactif + agent).

**Re-audit** : ouverture de l'Étape 1 (chat live).
