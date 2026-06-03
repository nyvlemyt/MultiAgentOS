# Mémoire et Gestion de Contexte pour Agents

## Architecture recommandée pour MultiAgentOS

### Phase 4 MVP — Hybrid SQLite-Markdown

```
Source of truth : data/memory/<projectId>/*.md  (Markdown lisible)
Index dérivé   : data/memory/<projectId>/index.db (SQLite + FTS5)
Reconstruction : automatique si index perdu (SHA-256 hash des .md)
```

Pattern: **memweave** (https://towardsdatascience.com/memweave-zero-infra-ai-agent-memory-with-markdown-and-sqlite-no-vector-database-required/)

Avantages : zéro dépendance externe, rebuild automatique, lisible par humains.

### Phase 5+ — Semantic layer
Ajouter `sqlite-vec` quand >200 memories par projet.

---

## Systèmes de mémoire — Classement

| Système | Stars | Coût tokens | Priorité | Usage |
|---------|-------|------------|---------|-------|
| agentmemory | 20 500 | Faible | Haute | Hooks Claude Code natifs |
| codex-agent-mem | — | Très faible | Haute | Pattern Context Packs |
| memweave | — | Faible | Haute | Architecture data/memory/ |
| mem0 | 57 300 | Faible | Haute | Extraction memories sessions |
| MemOS (local plugin) | 9 500 | Faible | Haute | Memory OS unifié SQLite |
| Anthropic Prompt Caching | — | Très faible | Haute | Immédiat dans llm.ts |
| MCP Memory officiel | — | Faible | Moyenne | MVP Memory Keeper simple |
| SimpleMem | 3 500 | Très faible | Moyenne | Compression Phase 5 |
| Graphiti/Zep | 26 900 | Faible | Basse | Temporal graph Phase 5+ |
| LLMLingua | 6 200 | Faible usage | Basse | Requiert GPU |

---

## Patterns de mémoire détaillés

### rohitg00/agentmemory
URL: https://github.com/rohitg00/agentmemory
Stars: 20 500

**Architecture 4 niveaux** :
| Niveau | Contenu | Durée de vie |
|--------|---------|------------|
| Working memory | Outils appelés dans le turn courant | Turn |
| Episodic memory | Résumé de session | Session |
| Semantic memory | Faits, patterns extraits | Long terme |
| Procedural memory | Workflows, décisions | Long terme |

- Capture automatique via hooks (SessionStart, PostToolUse, Stop) — pas de logging manuel
- Retrieval : BM25 + vector + knowledge graph fusionnés via Reciprocal Rank Fusion
- Performance : 95.2% R@5 sur LongMemEval-S
- 12 hooks + 8 skills + MCP stdio server (53 outils)
- **Token savings : -92% vs naive context injection**

### mem0ai/mem0
URL: https://github.com/mem0ai/mem0 — Stars: 57 300

- Single-pass ADD-only (un seul appel LLM pour extraire)
- Temporal reasoning depuis avril 2026 : raisonnement "passé/présent/futur"
- Performance : 91.6 sur LoCoMo, 94.8 sur LongMemEval avec seulement 6-7k tokens/recall
- **MCP disponible** pour Claude
- ⚠️ Requiert OpenAI embeddings par défaut → reconfigurer pour rester local

### codex-agent-mem
URL: https://marcelocaporale.github.io/codex-agent-mem/

- SQLite + FTS5, zéro dépendance externe
- Format context pack : objectifs / contraintes / pending items / blockers / DoD
- `known_pack_hash` évite de renvoyer des packs inchangés
- Retrieval explicite via tools, pas d'injection automatique
- **Token savings : 86-97% selon projet**
- Architecture la plus proche du design actuel de MultiAgentOS

### MemTensor/MemOS
URL: https://github.com/MemTensor/MemOS — Stars: 9 500

- API unique add/retrieve/edit/delete
- SQLite local (`~/.openclaw/memos/memos.db`)
- FTS5 + vectors
- Self-evolving : L1 trace → L2 policy → L3 world model → crystallized Skills
- Partage par `user_id` = séparation `_global` vs `<projectId>` natif
- Token savings : 35.24% documenté, 72% via cloud plugin

---

## Prompt Caching — Guide pratique

Source: https://platform.claude.com/docs/en/build-with-claude/prompt-caching

### Paramètres clés
- **Minimum 1 024 tokens** pour Sonnet 4.5/4.6
- **TTL : 5 min** (gratuit) ou **1h** (2× le prix d'écriture)
- **Jusqu'à 4 breakpoints** `cache_control` par requête
- **Isolation workspace** depuis février 2026

### Pattern optimal pour le worker MultiAgentOS
```
[system prompt statique + outils]          → cache_control breakpoint #1
[context pack projet injecté]              → cache_control breakpoint #2
[conversation history]                     → auto-cached (croît à chaque turn)
[query utilisateur / task description]     → pas caché (change à chaque fois)
```

### Erreur classique à éviter
Mettre `cache_control` sur du contenu qui change (timestamps, état courant) → cache jamais hit.

### Économie estimée
Si les context packs projet font >1 024 tokens et sont réutilisés sur plusieurs turns : **économie 90%** sur ces tokens entre les turns.

---

## Compression de contexte

### Context Mode (plugin Claude Code)
URL: https://context-mode.com
Compression mesurée : 315KB → 5KB (×63). Playwright snapshot 56KB → 299 bytes.
Pattern : event log SQLite → snapshot rebuild on demand.

### LLMLingua (Microsoft)
URL: https://github.com/microsoft/LLMLingua — Stars: 6 200
Compression jusqu'à ×20. Requiert GPU (<8GB quantized) → pas adapté MVP local-first.

### ACON (context optimization)
URL: https://zylos.ai/research/2026-02-28-ai-agent-context-compression-strategies/
Réduit token usage de 26-54% en pic. Compatible API, gradient-free.
3 catégories : RL-based, LLM scoring, LLM annotation.

---

## QMD — Retrieval Layer Phase 4 (Nouveau — Audit 2026-06-03)

Source: https://github.com/tobi/qmd — analysé audit Phase 3

**Remplace** le plan custom `data/memory/<projectId>/index.db` SQLite FTS5 par quelque chose de beaucoup plus puissant, déjà construit et maintenu.

### Pourquoi QMD > custom FTS5

| Dimension | Custom FTS5 | QMD |
|-----------|------------|-----|
| Search | BM25 seulement | BM25 + vector + LLM reranking |
| Agent interface | Tool custom à écrire | MCP server natif (query, get, multi_get) |
| Query expansion | Non | Oui (Qwen3 local, automatique) |
| Stack | SQLite natif | TypeScript, Node ≥22 ✓ (v22.16.0) |
| Maintenance | Notre responsabilité | Maintenu par tobi |
| Models | Aucun | ~2GB (EmbeddingGemma 300M, Qwen3 Reranker 0.6B, QMD Query-Expansion 1.7B) |

### Architecture avec QMD

```
Memory Keeper ÉCRIT → data/memory/<projectId>/*.md  (5 registres Markdown)
QMD INDEXE          → collections MCP (auto re-index)
Agents LISENT       → qmd.query("...") via MCP tool
Humain VISUALISE    → Obsidian sur le même dossier (Phase 6+)
```

### Collections MCP recommandées

```json
{
  "mas-knowledge": ["docs/knowledge/", "docs/claude doc/", "docs/workflows/"],
  "mas-memory":    ["data/memory/"]
}
```

### ADR requis avant implémentation
`docs/decisions/0003-memory-storage-format.md` — décision QMD vs custom FTS5 + format SUMMARY.md.

### Prérequis
- Node 22+ ✓ (v22.16.0 confirmé)
- ~2GB disque libre pour modèles dans `~/.cache/qmd/models/`
- Pas d'API key, entièrement local

---

## vrai-memoire-agent-claude.md — Prompts Phase 4 Ready-to-Use

Source: `docs/claude doc/vrai-memoire-agent-claude.md`

Ce fichier contient les prompts copy-paste complets pour implémenter la mémoire Phase 4 :

1. **Prompt d'initialisation** : crée les 5 registres avec entrées-exemples adaptées au projet. À coller dans Claude Code, pose 3 questions diagnostics, génère tous les fichiers.

2. **Prompt close-out ritual** : 5 min en fin de session. Audite la session, propose des entrées BDR/LRN/BLK formatées, génère journal.md obligatoirement.

**Différence MAS vs usage personnel** : ce guide place la mémoire dans `.claude/memory/` (pour usage personnel). MAS place la mémoire dans `data/memory/<projectId>/` pour la séparation multi-projet. La logique est identique, seul le path change.

**Intégration Obsidian** : ouvrir `data/memory/<projectId>/` comme vault Obsidian (2 clics, rien à convertir). Utiliser `[[BDR-001]]` wikilinks dans les registres pour activer le graph view.

---

## Architecture cible par phase

### Phase 4 MVP
1. **Memory format** : memweave (Markdown + SQLite FTS5, zéro dépendance) — 5 registres dans `data/memory/<projectId>/`
2. **Retrieval layer** : **QMD MCP server** (remplace custom FTS5 — BM25+vector+LLM reranking)
3. **Context packs** : codex-agent-mem pattern (SQLite, hash-based, `SUMMARY.md` ≤500 tokens)
4. **Extraction** : mem0 ADD-only (single LLM call per session end) ou prompt close-out ritual
5. **Prompt caching** : 2 breakpoints dans `claudeCodeLLM` (system + context pack)

### Phase 5 — Semantic
5. `sqlite-vec` si QMD non retenu ou pour projets >200 memories sans QMD
6. MemOS ou agentmemory pour hooks Claude Code natifs

### Phase 6 — Temporal + Visualization
7. Obsidian sur `data/memory/` comme visualisation humaine (wikilinks activés)
8. kepano/obsidian-skills pour que Memory Keeper génère du Markdown Obsidian-compatible
9. Graphiti/Zep pour temporal knowledge graph sur projets à très longue durée

---

## Règles anti-patterns

**Rolling summaries seuls → À ÉVITER**
- Compression à l'écriture = décision irréversible sur la saillance
- Les summarizers perdent ~20% des faits encodés
- "Summarization drift" sur multi-hop compression

**Vector DB externe → Overkill pour local-first single-user**
- SQLite + FTS5 + sqlite-vec couvre 95% des besoins
- Chroma/Qdrant seulement si corpus >100K chunks

**Injection automatique au démarrage → Éviter**
- Coût fixe par session
- Préférer le retrieval on-demand avec tools explicites

---

## Ressources

- https://github.com/rohitg00/agentmemory
- https://github.com/mem0ai/mem0
- https://github.com/MemTensor/MemOS
- https://github.com/aiming-lab/SimpleMem
- https://github.com/getzep/graphiti
- https://github.com/letta-ai/letta
- https://github.com/microsoft/LLMLingua
- https://marcelocaporale.github.io/codex-agent-mem/
- https://context-mode.com
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **https://github.com/tobi/qmd** — retrieval layer Phase 4 (NOUVEAU)
- **https://github.com/kepano/obsidian-skills** — Phase 6 memory visualization
- `docs/claude doc/vrai-memoire-agent-claude.md` — prompts Phase 4 ready-to-use
