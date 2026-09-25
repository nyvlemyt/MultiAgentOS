# Backlog — les catégories §5 sont matchées par sous-chaîne (filet utile, pas étanche)

**Source** : câblage de `config/permissions.json#categories` (2026-09-13). Les catégories §5 étaient déclarées en prose dans CLAUDE.md mais le tableau `categories` était vide — le portique existait sans rien à comparer. Il est maintenant rempli ; cette fiche note ce que le remplissage ne peut **pas** faire.

## Ce qui marche aujourd'hui

`classifyRisk` (packages/core/src/risk-classifier.ts) compare le texte de la tâche (`titre\ndescription`) à chaque `action` déclarée, en **sous-chaîne insensible à la casse**. Une correspondance sur une catégorie `high`/`blocking` fait passer la tâche par le gate humain (`needs_validation` + ligne `validations`).

Deux tests verrouillent ça : `permissions-config.test.ts` (le fichier livré, pas un fixture) et `perms-shipped-gate.test.ts` (bout en bout, `high` met en attente / `blocking` bloque, même en autopilot).

## Les trois limites connues

1. **La sous-chaîne n'est pas de la compréhension.** `"send a message"` et `"send message"` sont deux entrées distinctes parce que `.includes()` est littéral. Chaque tournure non prévue passe à travers. On a couvert les formulations courantes EN + FR, pas toutes.
2. **`path-escape` ne peut pas être décidé sur du texte.** « écrire hors du chemin du projet actif » est une comparaison de chemins à l'exécution, pas un motif dans un titre de tâche. Les entrées déclarées (`/etc/`, `~/.ssh`, `~/.aws`) n'attrapent que les cibles écrites en clair. **Corrigé au niveau des diffs le 2026-09-15** (`path-guard.ts`, voir le tableau) ; reste la frontière des outils du moteur.
3. **`outbound-network` n'est textuel que sur le chemin du dispatch.** Le vrai gate d'hôte **existe déjà** : `assertFetchAllowed` (`packages/memory/src/conveyor/net-guard.ts`), livré en Brique 6 incrément 3, compare l'hôte à `allowed_hosts` et bloque SSRF/DNS-rebind. Il est branché sur les extracteurs du convoyeur (`url`, `youtube`), pas encore sur le chemin dispatch. La catégorie textuelle ne sert donc qu'à faire lever le gate humain **au moment du plan**, avant qu'un fetch parte.

## Pourquoi on s'arrête là pour l'instant

Le filet actuel est strictement meilleur que `categories: []` (qui n'attrapait rien) et il est protégé contre la régression. Passer à un matcher plus fin (tokenisation, lemmes, ou classification LLM du Sec Reviewer) est un changement de moteur, pas de config.

## Quand ce sera repris — l'état réel après la fusion des troncs (2026-09-13)

| Moitié de §5 | Contrôle runtime | État |
|---|---|---|
| Hôte réseau (`allowed_hosts`) | `assertFetchAllowed` / net-guard | **livré**, consommé par le convoyeur |
| Chemin (`path-escape`) — diffs produits par les agents Tier B | `assertDiffWithinProject` / path-guard (`packages/core/src/path-guard.ts`), câblé dans `gateProducedDiff` **avant tout critique** | **livré 2026-09-15** : `..`, chemins absolus, évasion par symlink (`realpath` injecté, miroir du DNS du net-guard), `.git/` ; une évasion → tâche `blocking` + pause humaine, zéro appel critique, dépense du producteur enregistrée |
| Chemin — écritures directes du moteur Claude Code (outils Write/Edit/Bash, `cwd = project.path`) | — | **manquant** : le SDK n'expose pas encore de hook `canUseTool` dans notre câblage ; seul `permissionMode` s'applique |
| Réutilisation du net-guard sur le chemin dispatch | — | manquante (notée dans `allowed-hosts-runtime-gate.md` §RESOLVED) |

1. ~~Écrire le pendant chemin du net-guard~~ **fait le 2026-09-15** : `assertWriteAllowed` / `assertDiffWithinProject` (`packages/core/src/path-guard.ts`), pause via `pauseForPathEscape` (`packages/agents/src/risk-gate.ts`). Tests : `path-guard.test.ts` (31 cas, seam `realpath` injecté) + `path-gate-wiring.test.ts` (bout en bout, traversée `..` et **vrai symlink sur disque**). La règle 4 ci-dessous est tenue pour les diffs : le texte de la tâche ne nomme aucun chemin, la garde lit le diff.
1bis. Brancher `assertWriteAllowed` sur les écritures directes du moteur dès que notre câblage SDK expose un hook d'outil (`canUseTool`) — même fonction, autre frontière.
2. Brancher le net-guard existant sur le chemin dispatch, pour qu'un agent-domaine sortant hérite du gate d'hôte sans le réécrire.
3. Faire retomber les entrées `path-escape` / `outbound-network` textuelles au rang de filet de première ligne au moment du *plan*, la décision dure revenant aux seams runtime.
4. TDD pour la frontière outil (1bis) : une écriture hors de `project.path` s'arrête au gate **même si son texte ne nomme aucun chemin** — déjà vrai pour les diffs.
