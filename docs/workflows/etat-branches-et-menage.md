# État des branches & ménage — audit du 2026-09-04

> **Pourquoi ce fichier.** À 47 branches locales et 7 worktrees, on ne sait plus sur laquelle se
> mettre. Cet audit tranche chaque branche avec un test **vérifiable**, pas à l'intuition, et laisse
> la trace pour qu'on ne re-enquête jamais sur les mêmes 47.

## Le vrai problème : deux troncs au lieu d'un

`main` n'est pas la vérité. `knowledge-os/brique-1` est un **second tronc** qui porte 493 fichiers
absents de `main` (tout le corpus mémoire + le convoyeur). Toutes les branches mémoire sont empilées
dessus. C'est ça qui rend le choix de branche impossible : selon le sujet, la base correcte est
`main` **ou** `brique-1`, et rien ne le dit.

**Tant que `brique-1` n'est pas dans `main`, le bordel revient.** Le ménage ci-dessous est
nécessaire mais pas suffisant ; la fusion des deux troncs est la seule correction durable.

## Le filet, posé avant toute suppression

46 tags `archive/2026-09-04/<branche>` ont été créés et **poussés sur origin**. Chaque branche
locale y est capturée à son état du 4 septembre. Conséquence : **aucune suppression de branche ne
peut plus rien perdre**, y compris pour les 27 branches qui portaient des commits n'existant que
localement (surtout de l'historique d'avant-squash).

Récupérer une branche archivée :

```bash
git switch -c <nom-voulu> archive/2026-09-04/<branche-avec-des-tirets>
```

## Comment une branche a été jugée

Trois tests, dans cet ordre. Une branche n'est déclarée morte que si les trois concordent.

1. **Sa PR est-elle mergée ?** (`gh pr list --state merged`) — signal fort, mais **pas suffisant** :
   `knowledge-os/brique-1` (PR #53) et `phase/ecc-harvest` (PR #34) ont eu une PR mergée *puis ont
   continué à recevoir du travail*. Le test naïf les aurait déclarées mortes à tort.
2. **Son sommet a-t-il bougé depuis la fusion ?** On compare le tip local au `headRefOid` de la PR.
   S'il a bougé, la branche porte du travail postérieur → vivante. C'est ce test qui rattrape
   `phase/ui-shell-hud` (+1 commit) et `phase/ui-shell-hud-sonar` (+2).
3. **Est-elle utilisée par un worktree ?** Une branche checked-out ne se supprime pas.

Le delta de fichiers vs `main` a été écarté comme critère : les squash-merges laissent un **delta
fantôme** (la base de fusion est le commit d'avant-squash), donc une branche entièrement livrée
affiche quand même des dizaines de fichiers de différence. C'est le piège de cet audit.

## Les 25 branches mortes

Contenu livré, sommet inchangé depuis la fusion, hors worktree.

| Branche | PR |
|---|---|
| `chore/bloc-c-agents` | #47 |
| `chore/bloc-d-hardening` | #48 |
| `chore/floor-hardening` | #46 |
| `chore/god-file-guardrails` | #66 |
| `claude/distracted-feistel-ac08cd` | #57 |
| `claude/infallible-bell-2113b5` | #50 |
| `claude/lucid-gagarin-0fabef` | #49 |
| `claude/magical-moser-d5769e` | #51 |
| `claude/md-excellence-fixes` | #52 |
| `claude/vibrant-swanson-fb4d4f` | #44 |
| `claude/wonderful-shannon-d3ff65` | #45 |
| `docs/dashboard-widget-note` | #64 |
| `feat/doctor-extraction-bins` | #59 |
| `feat/explain-diff-skill` | #65 |
| `fix/youtube-sublangs-429` | #58 |
| `knowledge-os/brique-6` | #54 |
| `knowledge-os/brique-6-extractors` | #55 |
| `knowledge-os/capture-dedup` | #62 |
| `knowledge-os/collection-etudes` | #72 |
| `knowledge-os/distill` | #61 |
| `knowledge-os/distill-robustesse` | #63 |
| `knowledge-os/pont-miroir` | #70 |
| `knowledge-os/provenance-portable` | #68 |
| `knowledge-os/redistill-titres` | #71 |
| `claude/keen-germain-87642b` | contenu de #66, zéro delta vs `main` |

## Les branches vivantes, et pourquoi

**Troncs** — `main` · `knowledge-os/brique-1` (second tronc, 493 fichiers hors main) ·
`phase/ecc-harvest` (récolte ECC, worktree dédié `/Users/melvyn/Documents/02_PROJETS/maos-ecc`).

**PR ouvertes** — `chore/coverage-gate` (#74) · `claude/heuristic-curie-a1789a` (#75) ·
`docs/no-attribution-footer` (#76) · `claude/promotion-memoire-s3b-b5154f` (#77) ·
`claude/memoire-v2-design-d70b90` (poussée le 2026-09-04, sans PR encore).

**Parkée par décision** — `claude/determined-solomon-246948` (accès mobile Tailscale, à sortir sur go
explicite).

**À trancher (vieilles, jamais passées en PR)** — `phase/2-real-claude` (4 mois) ·
`claude/sharp-goodall-7801a8` · `claude/funny-goldberg-d31643` · `claude/elegant-knuth-9e2613` ·
`claude/loving-kare-5a9a2c` · `claude/verification-multiagent-os-2be365` · `docs/phase4-preflight` ·
`claude/optimistic-roentgen-fb0b49` · `claude/hopeful-mcnulty-0837ba` ·
`phase/ui-shell-hud` · `phase/ui-shell-hud-sonar`. Toutes archivées par tag : les supprimer ne perd
rien, et leur contenu utile a été repris ailleurs ou est périmé.

## Travail récupéré au passage (2026-09-04)

Trois worktrees portaient du travail **non commité**, donc à la merci d'un `rm` :

- `memoire-v2-design-d70b90` → les **4 livrables de la session design mémoire v2** (audit du gap
  retrieval, ré-audit Graphify, ADR 0010, découpage I0→I11). Commités et poussés.
- `brique-6-defuddle` → 2 audits d'intake du 29 juin (portabilité `.claude/` → `.agent/`, Obsidian
  Bases en vitrine). Commités et poussés.
- `optimistic-roentgen-fb0b49` → une variante de `capture.test.ts` : **doublon** des tests déjà
  mergés par #62, écrits différemment. Rien d'unique, jetable.

## Les commandes

Suppression des 25 branches mortes — **local puis distant**. Relire la liste avant de lancer ; la
suppression de branche est une action gatée (CLAUDE.md §5), elle ne s'exécute pas sans toi.

```bash
git branch -D chore/bloc-c-agents chore/bloc-d-hardening chore/floor-hardening chore/god-file-guardrails claude/distracted-feistel-ac08cd claude/infallible-bell-2113b5 claude/lucid-gagarin-0fabef claude/magical-moser-d5769e claude/md-excellence-fixes claude/vibrant-swanson-fb4d4f claude/wonderful-shannon-d3ff65 docs/dashboard-widget-note feat/doctor-extraction-bins feat/explain-diff-skill fix/youtube-sublangs-429 knowledge-os/brique-6 knowledge-os/brique-6-extractors knowledge-os/capture-dedup knowledge-os/collection-etudes knowledge-os/distill knowledge-os/distill-robustesse knowledge-os/pont-miroir knowledge-os/provenance-portable knowledge-os/redistill-titres claude/keen-germain-87642b
```

```bash
git push origin --delete knowledge-os/collection-etudes knowledge-os/distill-robustesse knowledge-os/pont-miroir knowledge-os/provenance-portable knowledge-os/redistill-titres docs/dashboard-widget-note feat/explain-diff-skill chore/god-file-guardrails
```

Retrait des worktrees dont le sujet est clos :

```bash
git worktree remove /Users/melvyn/Documents/02_PROJETS/multiAgentOS/.claude/worktrees/hopeful-mcnulty-0837ba --force
```

## La règle, pour que ça ne revienne pas

1. **Un seul tronc.** Une fois `brique-1` dans `main`, toute nouvelle branche part de `main`. Plus
   jamais de second tronc long : un chantier multi-sessions vit sur des branches courtes qui
   atterrissent dans `main` une par une.
2. **Une branche meurt à sa fusion.** Supprimer local + distant dans la minute qui suit le merge.
   Le tag d'archive n'est un filet que pour le passé ; à l'avenir, la PR mergée *est* l'archive.
3. **Un worktree meurt avec son sujet.** `git worktree remove` fait partie de la clôture, pas d'un
   ménage semestriel.
4. **Rien de non commité en fin de session.** Le travail de trois worktrees a survécu par chance ;
   la règle est de commiter avant de fermer, même en WIP.
