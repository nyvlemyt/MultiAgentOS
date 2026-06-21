# Backlog — Surface MCP du cockpit (opt-in par projet, règle connecteur)

**Quand** : P4 (mémoire/MCP) → surface cockpit ultérieure (Arsenal console, cf. [[project_ui_arsenal_console]]). **Valeur** : gouvernance (empêche le bloat du context window + cadre l'ajout de connecteurs). **Statut** : doctrine distillée, à porter en surface produit + §11.bis. **Source** : `docs/knowledge/mcp-connector-policy-and-catalog.md` (distillé 2026-06-21, ECC, MIT) + CLAUDE.md §11.bis (providers confinés, défaut OFF) + TOKEN_STRATEGY §6.

## La doctrine (déjà distillée, à appliquer côté produit)

**La règle connecteur** : un serveur MCP n'obtient un slot **défaut** que si **les deux** tiennent :
1. **Universel** — utile à ~tout le monde, sur tout harness, **sans clé API requise** (clé → opt-in).
2. **MCP bat un CLI/REST-dans-un-skill** — le job a vraiment besoin de ce que MCP seul donne : **état de session tenu, streaming, handshake d'auth, ou browsing structuré**. Sinon → c'est un **skill**, pas un serveur.

**Conséquence dure** : les schémas de tools se chargent dans **chaque** session → chaque connecteur défaut taxe le context window de tous. **Garder les défauts < 10** (défaut terrain 2026 = 0-2 + built-ins natifs). « Populaire » n'est pas un argument ; « stateful et universel » l'est.

## Application MAOS (ce que le cockpit doit faire)

- **MCP = opt-in, par projet** — jamais injecté globalement. Miroir exact de §11.bis (SDK providers confinés, défaut OFF) et de la discipline tokens §6 (« n'injecte pas ce dont tu n'as pas besoin »).
- **Test à 2 branches obligatoire avant tout passage en défaut** — un candidat connecteur passe la règle (universel + stateful) avant de devenir défaut ; sinon il reste opt-in ou redevient un skill.
- **Découverte ≠ install** — le cockpit peut *lister/découvrir* des serveurs (catalogue `mcp-connector-policy-and-catalog.md`), mais **jamais auto-installer** (doctrine [[reference_skills_sh]]). L'activation est un geste explicite par projet.
- **Surface produit** : à porter dans l'**Arsenal console** (gérer skills/agents/rules/commands/**MCP**/mémoire de façon centralisée, cf. [`arsenal-management-console.md`](arsenal-management-console.md)) — l'onglet MCP applique la règle et affiche le coût-contexte de chaque connecteur activé.

## Pourquoi pas maintenant

- C'est de la **doctrine + surface UI**, pas la campagne harvest. La connaissance est distillée (knowledge file) ; l'application produit attend P4 (où les premiers MCP réels — mémoire/Obsidian — arrivent) puis l'Arsenal console.
- Aucune décision de connecteur n'est prise ici : les candidats (mcp-obsidian, longhand, squish, omega-memory, cognee, serena, container-use, GhidraMCP/ida-pro…) passent l'intake-audit **un par un** en P4.

## Action

1. **§11.bis** : ajouter (au moment du build P4/surface) une clause « MCP servers : opt-in par projet, règle connecteur à 2 branches, défauts < 10 » — aujourd'hui §11.bis cadre les **SDK providers**, pas encore explicitement les **serveurs MCP**. À acter quand la surface est construite (ne pas modifier CLAUDE.md à blanc maintenant).
2. **Arsenal console** : onglet MCP = découverte (catalogue) + activation par-projet + affichage coût-contexte + application de la règle. Spéc dans [`arsenal-management-console.md`](arsenal-management-console.md).
3. **Candidat ADR** (optionnel) : « Surface MCP du cockpit » si l'implémentation soulève un arbitrage (où stocker l'état d'activation par projet : `config/permissions.json` ? table DB ?).

## Liens
- `docs/knowledge/mcp-connector-policy-and-catalog.md` (règle + catalogue + candidats P4).
- CLAUDE.md §11.bis (providers), §6 / TOKEN_STRATEGY §6 (tokens).
- [`arsenal-management-console.md`](arsenal-management-console.md) · [`second-brain-cross-project.md`](second-brain-cross-project.md) · [`continuous-learning-hooks.md`](continuous-learning-hooks.md).
