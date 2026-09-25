# Rapport brut : ce que portent les branches non fusionnées de MAOS

Agent : `chercheur-eve`. Lancé le 16/09/2026 au soir, axe D de l'audit du lot 2. Déposé tel quel. Lecture seule : aucun `checkout`, `merge`, `switch`, `stash`, `fetch` ; `git merge-tree --write-tree` utilisé pour simuler les fusions (écrit des objets arbre, ne touche ni référence ni index ni arbre de travail). Consommation : 116 883 tokens, 23 appels, 13 minutes.

---

**Question.** Parmi les 20 lignes que rend `git branch -r --no-merged knowledge-os/brique-1`, lesquelles portent du travail qui n'est pas déjà dans le tronc, et lequel est transposable à EVE ?

**Réponse en trois lignes.** Les 20 lignes sont 18 branches de travail plus `origin/main` plus le pointeur `origin/HEAD`. Sur les 18, treize n'apportent plus rien à `brique-1` (leur PR a été fusionnée puis `brique-1` a continué ; ce qu'elles « ajouteraient » est de l'ancien code) et cinq portent du contenu unique : `claude/memoire-v2-design-d70b90` (ADR 0010 et trois audits, 1 104 lignes, fusion propre), `chore/menage-branches` (l'audit des branches, fusion propre), `memory/classifieur-porte-provenance` (un commit du 07/09 : amendement de l'ADR 0004 et code du classifieur, 6 conflits dont 4 doublons périmés), `knowledge-os/brique-6-url-extractor` (uniquement deux notes d'intake du 29/06 ; le code est périmé) et `docs/no-attribution-footer` (une ligne de `CLAUDE.md`, identique à `origin/main`). **Le clone n'a pas été rafraîchi depuis le 08/09 14h32** : tout ce qui suit vaut à cette date.

## 1. Ce que dit l'audit existant

Source : `origin/chore/menage-branches:docs/workflows/etat-branches-et-menage.md`, commit `4c3427f` du 07/09/2026 (Melvyn), audit daté du 04/09, rédigé sur le poste Mac (47 branches locales, 7 worktrees).

1. Diagnostic : deux troncs au lieu d'un. `knowledge-os/brique-1` porte 493 fichiers absents de `main` ; « tant que `brique-1` n'est pas dans `main`, le bordel revient ». La fusion des deux troncs est la seule correction durable.
2. Filet : 46 tags `archive/2026-09-04/<branche>` créés et poussés ; toute suppression est réversible par `git switch -c <nom> archive/2026-09-04/<branche>`.
3. Méthode : une branche est morte si sa PR est fusionnée, son sommet n'a pas bougé depuis, aucun worktree ne l'utilise. Le delta de fichiers vs `main` est écarté à cause du « delta fantôme » des squash-merges.
4. 25 branches déclarées mortes, dont 8 encore sur `origin` : `collection-etudes`, `distill-robustesse`, `pont-miroir`, `provenance-portable`, `redistill-titres`, `dashboard-widget-note`, `explain-diff-skill`, `god-file-guardrails`.
5. Vivantes : troncs `main`, `brique-1`, `phase/ecc-harvest` ; PR ouvertes #74, #75, #76, #77 ; `memoire-v2-design` poussée le 04/09 sans PR.
6. Travail récupéré le 04/09 dans trois worktrees non commités.
7. Règle : un seul tronc ; une branche meurt à sa fusion ; un worktree meurt avec son sujet ; rien de non commité en fin de session.
8. Le document ne connaît pas quatre des branches d'aujourd'hui : `chore/menage-branches`, `fix/skills-index-yaml-block-scalars`, `memory/classifieur-porte-provenance`, `phase9/statut-verite-alertes`.
9. Écart mesuré : quatre des cinq PR « ouvertes » ont été fusionnées depuis (#74, #75, #76 dans `main` le 07/09 ; #77 dans `brique-1` le 07/09).
10. La partie locale de ses commandes ne s'applique pas à ce clone Windows (deux branches locales, un worktree).

## 2. Table des 20 lignes

| Branche | Commits | Dernier | Base | Contenu | Apport réel à brique-1 | EVE ? | Audit existant |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `chore/coverage-gate` | 2 | 04/09 | main | doctrine, code | rien (identique) ; PR #74 | non | fusionnée depuis |
| `chore/god-file-guardrails` | 3 | 31/07 | main | hook `limit-file-size.sh`, `settings.json`, `CLAUDE.md`, backlog, intake | rien d'unique ; hook identique dans brique-1 ; PR #66 | non | morte, à supprimer |
| `chore/menage-branches` | 1 | 07/09 | main | `docs/workflows/etat-branches-et-menage.md` | +137 lignes, fusion propre, unique | oui (méthode) | c'est l'audit |
| `claude/heuristic-curie-a1789a` | 2 | 01/09 | main | roadmap, backlog, fixtures | rien (identique) ; PR #75 | non | fusionnée depuis |
| `claude/memoire-v2-design-d70b90` | 1 | 07/09 | brique-1 | ADR 0010 (249 l.), audit gap-retrieval (303), intake graphify-réaudit (275), backlog incréments TDD (267) | +1 104 lignes, fusion propre, unique | oui | poussée 04/09 sans PR |
| `claude/promotion-memoire-s3b-b5154f` | 8 | 07/09 | brique-1 | backlog, 25 knowledge, 17 fichiers memory | rien d'unique ; PR #77 squashée dans brique-1 | non | fusionnée depuis |
| `docs/dashboard-widget-note` | 1 | 20/07 | brique-1 | workflow dashboard | rien (identique) ; PR #64 | non | morte |
| `docs/no-attribution-footer` | 2 | 07/09 | main | `CLAUDE.md` 1 ligne | +1/-1, identique à `origin/main` (#76) | oui (même règle qu'EVE) | fusionnée dans main |
| `feat/explain-diff-skill` | 1 | 31/07 | main | commande et skill explain-diff | rien (identique) ; PR #65 | non | morte |
| `fix/skills-index-yaml-block-scalars` | 2 | 02/09 | main | code `packages/skills` | rien d'unique ; PR #73 | non | absente |
| `knowledge-os/brique-6-url-extractor` | 25 | 07/09 | brique-1 | 2 intake (29/06), backlog, spec, 19 fichiers memory | unique : `intake/2026-06-29-agent-folder-portability.md` (+94) et `obsidian-bases-vitrine.md` (+89) ; code : 5 conflits périmés | oui, portabilité seulement | absente sous ce nom |
| `knowledge-os/collection-etudes` | 1 | 31/08 | brique-1 | code memory | rien d'unique ; PR #72 | non | morte |
| `knowledge-os/distill-robustesse` | 2 | 20/07 | brique-1 | code distill | rien ; PR #63 | non | morte |
| `knowledge-os/pont-miroir` | 1 | 26/08 | brique-1 | registers.ts | rien ; PR #70 | non | morte |
| `knowledge-os/provenance-portable` | 1 | 10/08 | brique-1 | ADR 0008 (identique), 8 fichiers memory | rien ; PR #68 | non | morte |
| `knowledge-os/redistill-titres` | 6 | 31/08 | brique-1 | distill code | rien ; PR #71 | non | morte |
| `origin/main` | 1 | 07/09 | brique-1 | `CLAUDE.md` 1 ligne (#76) | +1/-1 | oui | tronc |
| `memory/classifieur-porte-provenance` | 8 (1 propre `62a0834`) | 07/09 | brique-1 | amendement ADR 0004 (+90), backlog classifieur résolu, 4 knowledge, 24 fichiers memory dont `classifier.ts`, `reclassify.ts` | unique : 15 fichiers, +678/-94 ; 6 conflits dont 4 doublons périmés de #77 | oui | absente |
| `phase9/statut-verite-alertes` | 18 | 25/08 | main | 21 fichiers `apps/web`, backlog statut-vérité (identique) | rien d'unique ; PR #69 | non | absente |
| `origin/HEAD` | pointeur | | | | | | |

Total : 85 commits propres sur 18 branches. Trois groupes : quatre identiques à brique-1 ; neuf périmées (la fusion réinjecterait d'anciennes lignes) ; cinq à contenu unique. Seules deux branches touchent `.claude/` et leurs fichiers sont déjà dans brique-1 à l'identique. `brique-1` porte 471 fichiers sous `.claude/` : 398 sous `skills/` (26 `SKILL.md`), 60 sous `agents/`, 8 `commands/`, 3 `hooks/`.

## 3. Les branches qui intéressent EVE

**`claude/memoire-v2-design-d70b90`** : `docs/decisions/0010-memoire-v2-graphe-et-fiches-vivantes.md` (statut « Proposed », quatre clauses « en attente de l'arbitrage de Melvyn ») ; `docs/audits/2026-09-04-gap-retrieval-qmd.md` (le levier est la structure des fiches, pas le classement ; corpus dupliqué à 19,5 %, 71 % de titres = nom de fichier) ; `docs/intake/2026-09-04-graphify-reaudit-memoire.md` ; `docs/backlog/memoire-v2-increments-tdd.md` (I0 à I11, 1 incrément = 1 session = 1 branche = 1 PR). Fusion propre.

**`memory/classifieur-porte-provenance`**, commit propre `62a0834` (07/09, 11 fichiers, +595/-107) : amendement du 07/09 de l'ADR 0004 (« les 5 registres ne reçoivent pas d'ingéré »). Idées transposables au dispositif mémoire d'EVE : une porte de provenance qui lit trois champs déjà remplis et échoue fermée ; un tag humain explicite surclasse l'heuristique ; le chemin de capture devient zéro LLM par construction ; une passe `reclassify` retire les décisions déjà stockées.

**`chore/menage-branches`** : l'audit lui même, méthode en trois tests, filet de tags, règle du tronc unique. Transposable à la pratique git d'EVE. Fusion propre.

**`knowledge-os/brique-6-url-extractor`**, seulement `d432f93` : `docs/intake/2026-06-29-agent-folder-portability.md` tranche « faut-il renommer `.claude/` en `.agent/` ? Non » et documente la convention `.agents/` + `AGENTS.md`.

**`docs/no-attribution-footer`** et `origin/main` : une ligne de `CLAUDE.md`, « No attribution footer in commits, never Co-Authored-By ». Même règle que la décision EVE du 08/09.

## 4. État de `main` et `brique-1` face à `origin`

| Fait | Source | Fiabilité |
| --- | --- | --- |
| `main` local : 0 devant, 7 derrière `origin/main` | `git rev-list --left-right --count main...origin/main` = `0 7` | établi (au fetch du 08/09) |
| `brique-1` local = `origin/knowledge-os/brique-1` (`377f636`) | `0 0` | établi |
| `brique-1` a 61 commits absents de `origin/main` ; `origin/main` a 1 commit absent de `brique-1` : `25cbb75` (#76) | `61 1` | établi |
| Dernier fetch : 08/09/2026 14:32 | `ls -la .git/FETCH_HEAD` | l'état d'`origin` depuis est inconnu |
| Tags : 38 `archive/2026-09-04/*` en local (l'audit en annonce 46) | `git tag -l` | les 8 manquants sont inconnus |
| Quatre branches sans tag d'archive local | boucle `git rev-parse` | établi |
| Un seul worktree, deux branches locales | `git worktree list` | établi |

## 5. Ce qui demande la main de Melvyn (faits, pas de décision)

1. Rafraîchir le clone (`git fetch --prune`) : tout ce mémo vaut à l'état du 08/09 14:32.
2. `main` local est en avance-rapide possible sur `origin/main`.
3. `brique-1` n'a pas `25cbb75` : un merge d'`origin/main` le rapporte et ferme `docs/no-attribution-footer`.
4. Deux branches à contenu unique fusionnent proprement : `claude/memoire-v2-design-d70b90` (ADR 0010 « Proposed » attendant quatre arbitrages) et `chore/menage-branches`.
5. `memory/classifieur-porte-provenance` : le seul commit propre est `62a0834` ; une fusion entière produit 6 conflits dont 4 doublons périmés. Options : merge avec résolution, ou reprise du seul commit.
6. `knowledge-os/brique-6-url-extractor` : seul `d432f93` est unique ; une fusion entière produit 5 conflits de code périmé.
7. Les 13 autres branches n'apportent rien. Huit figurent déjà dans le `git push origin --delete` de l'audit ; cinq ont été fusionnées après l'audit et relèvent de sa règle « une branche meurt à sa fusion ». Trois n'ont pas de tag d'archive local.
8. La question de fond reste ouverte : `brique-1` porte 61 commits que `main` n'a pas ; l'audit dit que la fusion des deux troncs est la seule correction durable.
9. Vérifier le nombre de tags distants (46 annoncés, 38 en local) : `git ls-remote --tags origin`, non lancé (réseau).

## 6. Sources

`git branch -r --no-merged`, `git show origin/chore/menage-branches:docs/workflows/etat-branches-et-menage.md`, `git rev-list --left-right --count` (trois paires), `git branch --contains 25cbb75` (vide), `git merge-base`, `git rev-list --count` par branche, `git log --format` par branche, `git diff --name-status` et `--stat` par branche, `git merge-tree --write-tree --name-only` par branche (exit 0 pour 7, exit 1 pour 11), `git diff` sur les fichiers en conflit, `comm -12` sur les fichiers doctrine, `git ls-tree`, `git tag -l`, `git for-each-ref`, `ls -la .git/FETCH_HEAD`, `git worktree list`, `git --version` (2.55.0.windows.5).

**Inconnues** : état d'`origin` après le 08/09 ; les 8 tags manquants ; branches locales non poussées sur le Mac ; sort de `phase/ecc-harvest` et `claude/determined-solomon-246948`, citées vivantes par l'audit mais absentes d'`origin` dans ce clone.
