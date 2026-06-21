# Lot — Claude Code & MCP (home)

## Claude Code — site/docs, product page, Desktop (Cowork), install CLI, Chrome (Beta)
- **Identité** : le harness Claude Code lui-même + ses surfaces (CLI, Desktop GUI Cowork, contrôle navigateur).
- **Garde-fou** : « jamais copier d'infra harness/installeurs » (CLAUDE.md). On *utilise* Claude Code, on ne l'absorbe pas.
- **Fit** : la *doc* est référence ; *Cowork* (GUI non-technique) et *Claude for Chrome* (contrôle navigateur multi-onglet) sont des inspirations UX lointaines pour le cockpit, à noter sans coder.
- **Décision** : docs/desktop/chrome → `register` (pointeurs UX) ; product page (marketing) → `reject`. Aucune capture de l'installeur (`curl | bash` = §5 interdit de toute façon).

## MCP — site officiel, cours Intro/Advanced, punkpeye/awesome-mcp-servers (89k)
- **Identité** : standard MCP (Linux Foundation) + cours Anthropic + plus grande liste communautaire de serveurs MCP.
- **Fit** : alimente directement `docs/knowledge/mcp-connector-policy-and-catalog.md` et P4 (second-brain MCP). `awesome-mcp-servers` = source de découverte pour le catalogue opt-in.
- **3 coûts** : install nul (découverte), maintenance = re-scan ponctuel, removal nul. **Découverte uniquement — jamais auto-install** (doctrine `reference_skills_sh` + règle connecteur <10 défauts).
- **Décision** : site MCP → `register` ; cours → `watch`/register (référence pédagogique) ; punkpeye/awesome-mcp-servers → `register` comme source de découverte du catalogue (la sous-page `top-mcp-servers` en distille déjà un sous-ensemble — cf. subpages-distillations).
- **Re-audit** : à la phase P4 (linked-memory) — re-scanner awesome-mcp-servers pour candidats mémoire/Obsidian.
