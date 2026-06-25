# Backlog — Activation runtime du MCP QMD pour les agents en boucle (0d/4c)

**Quand** : follow-up immédiat de 0d (ou correctif avant merge). **Valeur** : haute — sans ça, ADR 0007 §Décision-5 est câblé mais inerte. **Statut** : gap d'audit U5 (F1). **Source** : `docs/learning/2026-06-25-night/U5-self-audit-0d.md` F1 · ADR 0007 §Décision-5 · `packages/core/src/llm.real.ts:57/107` · `packages/agents/src/mission-llm.ts:149-156,191` · `packages/agents/src/dispatch.ts:664`.

## Identity (quoi)

ADR 0007 §Décision-5 exige que l'outil `query` du MCP QMD devienne **appelable par un agent dispatché** (« preuve attendue : un agent appelle `query` pendant une mission »). 0d a ajouté `mcp?: boolean` à `ClaudeCodeLLMOptions` (`llm.real.ts:57`) qui injecte `mcpServers.qmd` + `allowedTools:['mcp__qmd__query']` (least-privilege, défaut OFF). **Mais** : `selectLLM` (le seul chemin dispatch) n'a pas de champ `mcp`, et aucun appelant ne le passe. Le flag est donc **inatteignable** depuis une mission réelle. La preuve ADR n'est satisfaite que par un test unitaire sur l'objet d'options.

## Why it matters

Une décision ADR « Accepted » dont le runtime ne réalise pas la clause centrale crée une **divergence ADR↔code** : on croit l'arsenal « consommé par les agents », il ne l'est pas. C'est exactement le défaut que 0d devait corriger (« le cerveau MCP dort »).

## Cost (install / maintenance / removal)

- **Install** : faible. Ajouter `mcp?: boolean` à l'opts de `selectLLM` (`mission-llm.ts:149`), le forwarder dans `claudeOpts`, l'exposer via `buildMissionLLM` derrière un opt-in env/config (défaut OFF pour rester byte-identique). +1 test « mcp on ⇒ options portent qmd ; off ⇒ inchangé ».
- **Maintenance** : faible — un flag opt-in de plus, aligné sur §11.bis (défaut OFF).
- **Removal** : trivial (supprimer le forward).

## Recommendation : **adopt** (fix-now, petit)

Soit câbler l'opt-in jusqu'au dispatch, soit — si l'activation runtime est volontairement différée — **amender ADR 0007 §Décision-5** en « wiring-only, activation reportée » pour que l'ADR et le code coïncident. Ne pas laisser le flou.

## Liens
- `docs/backlog/cockpit-mcp-surface.md` (gouvernance/surface MCP — distinct : ici c'est l'activation runtime, pas l'UI).
- ADR 0003 amendement (QMD hors-worker via CLI ; MCP pour usage interactif + agent).

**Re-audit** : prochain gate de phase (avec le merge de 0d).
