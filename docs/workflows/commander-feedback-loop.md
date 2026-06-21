# Boucle de Commandant (Commander Feedback Loop) — runbook

> Doctrine permanente : comment le feedback humain (le commandant) entre dans la boucle de
> travail à **chaque gate de phase**, sans jamais perdre une idée, et ressort en findings Doer
> + règles durables. Mine le pattern de deux skills ECC (non installés, gated) : capture→évolue
> façon `continuous-learning-v2`, exécution façon `orch-change-feature`. Moteur de tri =
> skill `intake-audit` (déjà installé).

## Pourquoi

Le cycle Doer↔Checker valide contre **le spec écrit**. Il ne voit pas le ressenti produit du
commandant (UX, design, « ça me va pas », nouvelles idées). Un **PASS checker ≠ validation
commandant**. Cette boucle capte cette couche et la branche sur la machine existante.

## Quand

- **À chaque gate de phase**, avant merge si la PR est ouverte (coût de correction quasi nul).
- Sur une feature déjà mergée : capturer maintenant, exécuter selon impact aval.
- Règle de timing : ne pas attendre la fin. Les couches UI s'empilent ; une faute non dite en
  phase N est héritée par N+1/N+2 et coûte ~3× à défaire.

## Étapes

### 1. Le commandant dump (brut, non structuré)
Bloc à coller, rempli, une fois par phase concernée :

```
## REVUE COMMANDANT — phase: <nom>
Ce qui marche / à garder:
Ce qui marche PAS / bugs:
UX / design à changer:
Idées / ajouts:
Consignes / principes (= à graver si récurrent):
Priorité ressentie (1 phrase):
```

### 2. Triage (via `intake-audit`)
Pour chaque item : `type` (bug / UX / idée / principe / règle) · `sévérité` · **destination** :

| Destination | Quand | Action |
|---|---|---|
| `fold-in-PR` | PR encore ouverte | finding renvoyé au Doer, corrigé avant merge |
| `phase-corrective` | déjà mergé **et** bloque l'aval | mini-phase (réutilise `orch-change-feature`-style : update tests→change impl→review→gated commit) |
| `backlog` | pas urgent | écrit comme axe dans la roadmap, « sur le côté », jamais jeté |
| `→ mémoire / docs/knowledge` | idée/lien durable | fichier mémoire ou `reference_links_registry` |
| `→ CLAUDE.md §` | principe récurrent | nouvelle règle gravée (rare, fort signal) |

Une idée non prioritaire **n'est jamais jetée** : minimum `backlog` + capture mémoire.

### 3. Persistance (anti-oubli)
- La revue intégrale → `docs/learning/<date>/commander-review.md` (committé).
- Faits stratégiques durables → mémoire projet (`project_*`), liens → `reference_links_registry`.
- Principes récurrents → CLAUDE.md / mémoire `feedback_*`.

### 4. Rendu
Findings numérotés prêts à coller en Doer + liste de ce qui devient règle durable + état du
routage (quoi fold-in, quoi backlog, quoi gravé).

## Intégration au phase-gate (CLAUDE.md §13)

Le self-audit de fin de phase gagne une étape : **Revue de Commandant** entre « 5 checks verts »
et « feu vert phase N+1 ». Séquence de gate :

1. 5 checks verts (test · lint · build · smoke · Sonar exit 0).
2. Checker PASS (verdict committé).
3. **Revue de Commandant** (ce runbook) → findings routés.
4. Feu vert humain explicite → phase suivante (mémoire `feedback_phase-gates`).

## Garde-fous

- Le commandant **prime** sur le checker (CLAUDE.md / instruction priority).
- Ne grave en CLAUDE.md qu'un principe **récurrent**, pas un one-shot.
- Token : la capture est gratuite ; batcher l'exécution (fold-in si PR ouverte, sinon regrouper).
