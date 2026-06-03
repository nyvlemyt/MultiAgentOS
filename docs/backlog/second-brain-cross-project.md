# Backlog — Second cerveau cross-projet (couche savoir/mémoire partagée)

**Quand** : extension Phase 4 → consolidée Phase 4.5/5. **Valeur** : structurante (c'est le cœur du « pourquoi MultiAgentOS »). **Statut** : concept utilisateur capturé, dépasse la Phase 4 actuelle (mémoire par projet) → candidat ADR. **Source** : demande utilisateur 2026-06-03.

## L'idée

Un « second cerveau » = couche savoir + mémoire **partagée**, qui :
- améliore la gestion mémoire au-delà de la mémoire par-projet de la Phase 4 actuelle ;
- sert à **construire MultiAgentOS lui-même** (build-time) **et** à tout **projet enfant** enregistré dans MultiAgentOS (runtime) ;
- réutilise la même source de savoir distillée (`docs/knowledge/`) que Claude consomme en build-time (cf. [`../workflows/knowledge-bootstrap.md`](../workflows/knowledge-bootstrap.md)).

## Différence vs Phase 4 actuelle

| Phase 4 (spec actuelle) | Second cerveau (cette carte) |
|--------------------------|------------------------------|
| Mémoire **par projet** (`data/memory/<projectId>/`) | Couche **transverse** : savoir global réutilisable cross-projet |
| Global memory plafonné ≤5 items/call | Savoir structuré (skills, patterns, doctrines), pas que des faits |
| Rehydrate la prochaine mission du **même** projet | Rehydrate **n'importe quel** projet + le build de MAS lui-même |

La Phase 4 est le socle (registres, Memory Keeper, write-path verrouillé). Le second cerveau est la **couche au-dessus** : promotion de savoir global, distillation de ressources, réutilisation cross-projet.

## Contraintes à respecter (ne pas casser)

- 5 registres + Memory Keeper seul à écrire dans `data/memory/` (CLAUDE.md §8).
- Plafond ≤5 items mémoire globale par mission (CLAUDE.md §12, signal-density test).
- Markdown + SQLite FTS5 d'abord ; Graphify/Obsidian/QMD = couche viz/sémantique plus tard (cf. `docs/knowledge/memory-patterns.md`).
- Progressive disclosure : summary L1 avant body.
- Pas de framework mémoire externe (mem0/MemOS) sans ADR.

## Ressources à distiller pour ça (au pré-vol Phase 4)

Dans `docs/ressources/` : « Mémoire d'un système IA — 3 niveaux + mapping outil », « La vraie mémoire de ton agent — 5 registres + Obsidian », « Le rituel de consolidation mémoire », « Le Registre Learning Records », « La Mémoire Projet pour ton IA », « Rituel close-out de session ». Déjà partiellement dans `docs/knowledge/memory-patterns.md`.

## Pont de persistance (exigence ferme — anti-oubli)

La mémoire Phase 4 doit prendre `docs/knowledge/` + `vibeflow/INDEX.md` comme **corpus de seed**. C'est ce qui garantit que tout le savoir distillé en build-time remonte dans le second cerveau runtime au lieu de diverger. Sans ce pont, on a deux stores qui s'ignorent. Détail + spirale d'enrichissement : [`../workflows/knowledge-bootstrap.md`](../workflows/knowledge-bootstrap.md) §5.bis. À acter dans l'ADR + dans les critères de sortie Phase 4.

## Action

1. **Phase 4 (socle)** : construire la mémoire par-projet comme spec'é. Ne pas dériver. **Inclure le pont de persistance** (seed depuis `docs/knowledge/`) dans les critères de sortie.
2. **Pré-vol Phase 4** : intake-audit des ressources mémoire ci-dessus → enrichir `memory-patterns.md`.
3. **Candidat ADR** : « Couche savoir cross-projet (second cerveau) » — trancher SQLite FTS5 vs graphe, build-time vs runtime sharing, frontière avec la mémoire par-projet. À écrire avant de coder l'extension.
