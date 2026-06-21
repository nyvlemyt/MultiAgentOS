# Lot — Méta-listes communautaires (home + route /awesome-claude-skills)

Toutes sont des **listes curatées *de* skills/agents/prompts/MCP** — méta-sources, pas du contenu intégrable directement. Garde-fou : on a **déjà** récolté 877 skills + 32 agents (campagne ECC/cybersec). Le risque ici = **dupliquer**. Lentille : reject-comme-source-de-récolte-future, register le pointeur.

| Liste | ★ | Contenu | Recoupement | Décision |
|---|---|---|---|---|
| hesreallyhim/awesome-claude-code | 46.3k | slash-commands, CLAUDE.md, CLI tools, workflows | recoupe nos 6 commandes adoptées + ECC commands (92 triés) | `register` + `watch` (récolte future possible si commander veut) |
| travisvn/awesome-claude-skills | 13.4k | ressources skills | recoupe nos 877 skills froids | `register` (reject-comme-récolte : doublon massif) |
| BehiSecc/awesome-claude-skills | 9.5k | skills catégorisés (docs, dev, data) | idem 877 | `register` (reject-comme-récolte) |
| langgptai/awesome-claude-prompts | 5.2k | exemples de prompts | recoupe `docs/knowledge/prompting-anthropic.md` | `register` (reject-comme-récolte) |
| vijaythecoder/awesome-claude-agents | 4.3k | équipe d'agents dev | recoupe nos 32 fiches Tier B froides | `register` (reject-comme-récolte) |
| **VoltAgent/awesome-claude-code-subagents** | 21.7k | **100+ sous-agents full-stack** | partiel : plus gros pool d'agents que notre 32 | `register` + **`watch`** — candidat de récolte agents la plus prometteuse si une phase « élargir l'arsenal agents » s'ouvre |
| punkpeye/awesome-mcp-servers | 89k | serveurs MCP | cf. catalogue MCP | `register` (voir claude-code-and-mcp) |

## Identité / fit / 3 coûts (groupé)
- **Identité** : annuaires GitHub maintenus par la communauté.
- **Fit** : sources de récolte *potentielles*, pas des ajouts. Les intégrer maintenant = relancer une mega-campagne de tri (1000+ items) en doublon de ce qu'on a déjà.
- **3 coûts** : install = une campagne entière (élevé) ; maintenance = re-sync ; removal = ledger jetable. Le ratio coût/valeur marginale est mauvais **tant qu'on n'a pas épuisé l'arsenal actuel** (877+32, encore inertes côté runtime — cf. décision « câbler l'arsenal » en suspens).
- **KILL** : doublon massif avec l'arsenal existant → reject-comme-récolte-immédiate.
- **Décision** : tout `register` dans `reference_links_registry` (sources de récolte future) ; `VoltAgent/awesome-claude-code-subagents` + `hesreallyhim/awesome-claude-code` flaggés `watch` (les deux plus distinctifs). **Aucune récolte maintenant** — priorité = câbler l'arsenal froid déjà acquis dans le runtime avant d'en acquérir plus.

## Route /awesome-claude-skills
- Cette sous-page du site **redirige/route** vers les listes communautaires de skills ci-dessus — pas de contenu propre. `fold` dans ce lot.

## Re-audit
À ré-ouvrir si/quand le commander lance une « phase élargissement arsenal » ET que l'arsenal actuel est câblé+consommé en runtime. Cible prioritaire alors : VoltAgent (agents) + hesreallyhim (workflows/commands).
