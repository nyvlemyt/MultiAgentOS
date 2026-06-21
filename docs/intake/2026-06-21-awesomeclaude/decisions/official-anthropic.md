# Lot — Ressources officielles Anthropic (home)

Audit batché (lentille intake-audit). Garde-fou dominant : **§11 billing isolation** (subscription-only ; `@anthropic-ai/sdk` PAYG interdit).

## Client SDKs — `anthropic-sdk-{python,ts,java,go,ruby,csharp,php}`
- **Identité** : SDK clients officiels API Anthropic (Messages API, tools, streaming).
- **Fit / doublon** : c'est précisément le SDK **interdit** par §11 (PAYG `@anthropic-ai/sdk`). Le lint guard `scripts/lint-no-sdk-payg.sh` bannit son import hors `packages/core/src/api-fallback/`.
- **KILL** : dépendance PAYG → **reject** automatique (§11, sans exception de test).
- **Décision** : `reject`. Aucune capture. (Connaissance déjà dans CLAUDE.md §11 + skill `claude-api`.)

## Agent SDKs — `claude-agent-sdk-{python,typescript}`
- **Identité** : SDK pour agents autonomes pilotant le moteur Claude Code.
- **Fit** : `claude-agent-sdk-typescript` **est déjà** notre injection LLM unique (`packages/core/src/llm.ts`, ADR 0001). Pas un ajout, un existant.
- **Décision** : `fold` — rien à intégrer ; noté que la home confirme notre choix d'archi (Agent SDK sur subscription, pas le client PAYG).

## Starters — Cookbook (45.4k), Quickstarts (17k)
- **Identité** : notebooks/recettes officiels (RAG, tool use, Skills, MCP) + apps prêtes à déployer.
- **Fit** : patterns potentiellement utiles, mais orientés API PAYG. Recettes Skills/MCP recoupent `docs/knowledge/skills-reference.md` + `mcp-connector-policy-and-catalog.md`.
- **3 coûts** : install nul (lecture), maintenance nulle, removal nul (ce sont des liens).
- **Décision** : `watch` — re-auditer seulement si une recette précise manque à notre connaissance. Registre-référence non nécessaire (orienté PAYG).

## Fournisseurs cloud — Bedrock, Vertex AI, Azure
- **KILL** : facturation per-token via cloud = hors mode subscription (§11). Notre worker refuse `ANTHROPIC_API_KEY` au démarrage.
- **Décision** : `reject`. (Les flags `CLAUDE_CODE_USE_BEDROCK/VERTEX` notés dans le cheatsheet comme *à ne pas activer*.)

## Références plateforme — Console, Documentation, Models&Pricing
- **Identité** : console dev, docs API, table modèles/prix.
- **Fit** : Models&Pricing = source canonique des IDs/prix → déjà maintenue dans le skill `claude-api` (Fable 5, Opus 4.8, etc.). `fold` (les deltas de specs 2026 sont repris via le cheatsheet, cf. subpages).
- **Décision** : Console + Docs → `register` (pointeurs utiles) ; Models&Pricing → `fold`.

## Transparence & sécurité — Transparency Hub, System Cards (Fable5/Mythos5, Opus 4.8/4.7/4.6, Sonnet 4.6, Opus 4.5 PDF, Haiku 4.5), Claude Code Security
- **Identité** : rapports capacité/sécurité par modèle + modèle de menace Claude Code.
- **§6** : **ne pas capturer les PDF** (coût token) — lien-référence seulement. Les specs modèles vivent déjà dans `claude-api`.
- **Fit** : *Claude Code Security* (modèle de menace) recoupe et renforce notre §5 + `docs/knowledge/risk-scoring-and-session-orchestration.md` → `fold` (pointeur cité dans le registre + note de re-lecture lors d'un durcissement sécu).
- **Décision** : system cards → `register`/`watch` (pointeurs) ; Claude Code Security → `fold`.

## Re-audit
Re-auditer si Anthropic publie un nouveau modèle (mettre à jour `claude-api`) ou si le mode subscription change (peu probable). Sinon stable.
