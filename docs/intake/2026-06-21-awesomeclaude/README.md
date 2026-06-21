# Intake — awesomeclaude.ai (récolte complète)

**Date** : 2026-06-21 · **Branche** : `phase/ecc-harvest` · **PR #32 (DRAFT)**
**Source** : <https://awesomeclaude.ai> + repo `github.com/webfuse-com/awesome-claude` (MIT) + 4 sous-pages de contenu.
**Méthode** : moteur intake-audit (skill `intake-audit`), batché par catégorie (un shard `decisions/*.md` par lot, décision item par item dans le ledger). Identique aux récoltes ECC/cybersec.

## Nature de la source (constat de pré-vol)

awesomeclaude.ai est un **annuaire de liens curatés**, pas un dépôt de skills/agents. Composition :
- ~70 % **ressources officielles Anthropic** (SDK, docs, system cards, cours, fournisseurs cloud) → références, pas de matière à intégrer en froid.
- ~15 % **méta-listes communautaires** (awesome-claude-code, ×2 awesome-claude-skills, prompts, agents, subagents, mcp-servers) → listes *de* skills/agents ; recoupent massivement nos 877 skills + 32 agents déjà récoltés (ECC) → **register comme sources de récolte future, ne pas dupliquer**.
- ~10 % **extensions / apps / thèmes / infra harness** → CLAUDE.md garde-fou « jamais copier d'infra harness » → reject.
- 4 **sous-pages de contenu** (cheatsheet, vibe-coding-guide, ralph-wiggum, top-mcp-servers) → **seule vraie matière à distiller** dans `docs/knowledge/`.

**Conclusion** : aucune nouvelle compétence à ajouter à l'arsenal froid (tout est soit méta-liste de choses déjà récoltées, soit infra harness). La valeur = **4 distillations de connaissance** + **enrichissement du registre de liens** + **augmentation du catalogue MCP** (dont `mcp-obsidian`, cible directe de P4).

## Bilan (50 items)

| Décision | Compte | Sens |
|---|---|---|
| `fold` (intégré) | 6 | distillé dans un fichier `docs/knowledge/` existant |
| `adapt` (intégré) | 2 | nouvelle section knowledge (ralph-wiggum, MCP catalog) |
| `register` | 21 | ajouté à `reference_links_registry` (mémoire) |
| `watch` | — (couvert par register/reject) | re-auditer si la source devient récoltable |
| `reject` | 14 | infra harness / SDK PAYG / cloud hors §11 / déjà couvert |

0 pending. Ledger : `ledger.tsv`. Distillations : voir `decisions/subpages-distillations.md`.

## Garde-fous appliqués
- §11 : les `anthropic-sdk-*` (PAYG) et fournisseurs cloud (Bedrock/Vertex/Azure) sont **rejetés** — mode subscription-only ; seul `claude-agent-sdk-*` (déjà notre dépendance) est noté.
- « Jamais copier d'infra harness/installeurs » : extensions IDE, thèmes, apps desktop, scripts d'install → reject.
- §6 : PDF system cards **non capturés** (lien-référence seulement) ; specs modèles déjà dans le skill `claude-api`.
- §12 : distillations citées (source + licence MIT) dans les fichiers `docs/knowledge/`.
