# Lot — Ressources éducatives & communauté (home)

## Cours officiels Anthropic (skilljar)
- **AI Fluency ×5** (Framework, Educators, Students, Nonprofits, Teaching) : pédagogie générale collaboration IA — hors périmètre dev MAOS. `register` (pointeur) ; pas de distillation (pas de matière technique nouvelle vs `prompting-anthropic.md`).
- **Building with the Claude API** : orienté API PAYG → `watch`/register (utile si on touche `api-fallback`, sinon non).
- **Claude Code in Action** : workflow Claude Code → `watch`/register ; recoupe `claude-code-context-and-modes.md` + le cheatsheet (cf. subpages).
- **Intro / Advanced MCP** : déjà notés (claude-code-and-mcp) — `register`.
- **Agent SDK Overview** : doc de notre dépendance (ADR 0001) → `register`.
- **Bedrock / Vertex courses** : §11 cloud PAYG → `reject`.
- **3 coûts** (groupe cours) : install nul, maintenance nulle, removal nul (liens). KILL : aucun apport technique non couvert → pas de distillation, juste register.

## Guides communautaires
- **wesammustafa/Claude-Code-Everything (2.1k)** : guide tout-en-un (setup, hooks, workflows, MCP, méthode BMAD). `watch`/register — source potentielle de patterns si une lacune apparaît ; recoupe largement notre `docs/knowledge/` + cheatsheet.
- **ykdojo/40+ Claude Code Tips (8.7k)** : astuces (statusline custom, réduire le system prompt, Gemini CLI comme sous-agent, conteneurisation, plugin dx). `watch`/register — quelques idées d'ops (Gemini-comme-minion recoupe notre router 3.5 multi-modèle ; conteneurisation recoupe `container-use` MCP). Pas de distillation immédiate.
- **sankalp ×2 (Claude Code 2.0, Agent Manager mindset)** : retours d'expérience (TODO.md, gestion coûts, context engineering, sous-agents). `watch`/register — le « Agent Manager mindset » + context engineering recoupent notre dispatcher + TOKEN_STRATEGY. Pas de matière nouvelle structurée.

## Communauté
- Discord / r/ClaudeAI / Facebook : `reject` (liens sociaux, aucune valeur d'intégration).

## Décision globale
Tout `register` (cours+guides) ou `reject` (cloud courses, réseaux sociaux). **Aucune distillation** : ces ressources sont soit déjà couvertes par `docs/knowledge/`, soit non-techniques. Les guides communautaires restent `watch` comme réservoir d'astuces ops à piocher en cas de lacune ponctuelle.

**Re-audit** : opportuniste — consulter wesammustafa/ykdojo si un besoin d'ops Claude Code précis émerge.
