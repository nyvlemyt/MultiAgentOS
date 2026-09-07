# Intake Audit — Obsidian Bases comme couche « vitrine » tabulaire (2026-06-29)

> **Candidat** : adopter **Obsidian Bases** (la fonctionnalité native base-de-données /
> vue-tableau-sur-notes d'Obsidian) comme **sous-pattern de la vitrine** MAOS — des vues
> tabulaires filtrables/queryables sur les registres de `data/memory/`, en complément du
> graph-view et du moteur QMD.
> **Source signalée** : `unmuteai.com/value-gift/obsidian-bases` (même auteur que la vidéo Karpathy).
> **Constat dur** : cette URL est **gated** (mur d'inscription email) — contenu **inaccessible**.

## Guardrails (étape 0)

- **Local-first** ✓ — Obsidian = vault markdown local, déjà la vitrine retenue (project-doctrine.md).
- **Subscription-only (§11)** ✓ — aucune clé API, aucun PAYG.
- **Memory Keeper seul écrivain (§8)** ✓ — Bases est une couche **lecture/vue** : un fichier `.base` est de la **config de vitrine**, pas du contenu mémoire. Le Keeper reste seul à écrire le *contenu* de `data/memory/`.
- **Pas de framework sans ADR** ✓ — Obsidian est déjà la vitrine ; Bases est une *feature built-in*, zéro nouvelle dépendance.
- **§5 / source gated** ⚠ : ne **pas** router `unmuteai.com/value-gift/obsidian-bases` dans le pipeline de capture — un extracteur Defuddle n'y récolterait que le **formulaire de login** (titre « Connexion | Unmute »), produisant une fiche-savoir poubelle.

## Identité

- **Quoi exactement** : Obsidian **Bases** = vues base-de-données (table / cards) construites sur les *properties* (frontmatter) des notes ; filtrables, triables, formules. C'est la réponse Obsidian-native aux databases Notion, mais sur des `.md` locaux.
- **Source** : l'URL Unmute est un *lead-magnet* gated (3 méthodes — WebFetch, curl UA navigateur, WebSearch — confirment le redirect vers `/connexion?...&tab=register`, 0 occurrence de « obsidian »/« base » dans le HTML servi). **Aucun contenu substantiel récupérable.** Le savoir réel est aux **docs officielles** non-gated (`help.obsidian.md/bases`).
- **Récence / obsolescence** : Bases = feature core récente (2025) → **low-medium** (stable comme core ; syntaxe encore en évolution).
- **Résumé** :
  - Vue tabulaire/cards filtrable sur les properties des notes.
  - Pour MAOS : rendre les registres (`ideas`/`decisions`/`candidates`/wiki topical) en tables structurées.
  - Complémentaire — pas rival — du graph-view (exploration `[[wikilinks]]`) et de QMD (retrieval).

## Fit (relié fichier/phase)

- **Surface touchée** : `docs/knowledge/project-doctrine.md` (section vitrine, L178-181) ; la couche Obsidian sur `data/memory/<projectId>/` ; le **register-build différé Phase 5**.
- **Doublon ?** Net-new **en tant que pattern Bases**. « Obsidian = vitrine » est **doctrine acquise** mais **uniquement via le graph-view sur wikilinks** (project-doctrine.md L178-181 ; memory `project_karpathy-second-brain`). Bases (vue-tableau) n'apparaît que **nommée** dans `references.md:78` + `skills-reference.md:252` (capacité du repo externe `kepano/obsidian-skills`), **jamais adoptée** comme couche MAOS. → sous-pattern distinct, non audité.
- **Apport concret** : une vue Bases sur `data/memory/<projectId>/` donne une **face tabulaire** filtrable (ex. « toutes les decisions ouvertes par projet », « candidates pending par risque ») que ni le graph ni QMD ne donnent.

## Coûts (les trois)

- **Install** : enrichissement doctrine = **cheap** (une clause project-doctrine.md). Les **vraies vues `.base`** = à construire quand la couche registres Phase 5 existe (il faut des registres à afficher).
- **Maintenance** : un fichier `.base` dans le vault ; faible ; la syntaxe Bases peut évoluer.
- **Retrait** : **trivialement réversible** (supprimer le `.base` / le paragraphe doctrine).

## Sanitize (étape 4.bis)

**N/A** — aucun contenu étranger ingéré (l'URL gated n'a même pas pu être lue). Si plus tard on capture les docs officielles Obsidian, c'est du contenu public canonique → scan standard au moment de la capture.

## Scores (0–5)

| Axe | Score | Note |
|---|---|---|
| project_fit | 4 | Enrichit une doctrine vitrine déjà acquise, modalité de vue nouvelle |
| token_efficiency | 5 | Vue locale Obsidian ; coût LLM/token nul |
| safety | 4 | Local, lecture seule ; seul risque = router l'URL gated (écarté) |
| implementation_effort | 4 | Doctrine cheap ; vues `.base` = build Phase 5 (besoin des registres) |
| evidence_maturity | 3 | Feature core réelle ; mais la *source signalée* est gated → 0 contenu vérifiable |
| user_value | 4 | L'utilisateur veut explicitement ce savoir ; face tabulaire utile au second cerveau |
| phase_compatibility | 3 | Clause doctrine maintenant ; vues = Phase 5 register-build |

## KILL criteria (veto)

- **Source gated (`unmuteai.com/.../obsidian-bases`)** → **reject de cette URL comme source d'ingestion** : Defuddle n'y prend que le login form. Remplacer par `help.obsidian.md/bases` (canonique, non-gated) **ou** paste manuel après login utilisateur.
- **Build hors phase** (vues `.base` sur registres) → `backlog_next` Phase 5.
- **PAYG / clé API** → aucun. **Framework** → aucun.

## Décision : `reject` (l'URL Unmute gated comme source) + `adapt_now` (le pattern Bases-vitrine, doctrine) + `backlog_next` (les vues `.base`, Phase 5)

**Justification (≤4 lignes)** : le *sujet* (Bases comme face tabulaire de la vitrine) est net-new et bon marché à acter en doctrine, mais **la source signalée est inaccessible** → on **rejette l'URL** et on source le savoir aux docs Obsidian officielles. Le *principe* enrichit `project-doctrine.md` (`adapt_now`) ; les *vues réelles* attendent la couche registres Phase 5 (`backlog_next`).

## Appropriation (la version MAOS)

- **Source du savoir** : `help.obsidian.md/bases` (non-gated, propre à extraire) — **pas** l'URL Unmute. *(Convergence : cette page est aussi le **fixture idéal** pour finir l'extracteur web Defuddle → un savoir voulu + un test du tool en une fois.)*
- **Version MAOS** : un `.base` dans le vault `data/memory/` qui rend les registres en table (filtre par projet / statut / risque), **complémentaire** du graph-view, **jamais** un substitut à QMD (qui reste le moteur de retrieval).
- **Moins cher** : zéro LLM ; vue déclarative dans Obsidian.
- **Adapter l'item, pas le projet** : on ajoute une *modalité de vue* à la vitrine existante, on ne change aucune règle mémoire (§8 intact).

## Plan d'intégration (si go)

- **Maintenant (`adapt_now`, doc-only)** : ajouter à `docs/knowledge/project-doctrine.md` (après la section Obsidian/vitrine) une clause : « Bases = face tabulaire des registres, complément du graph-view ; QMD reste le moteur ; vues `.base` construites quand la couche registres existe (Phase 5). » Source = docs officielles, pas Unmute.
- **Optionnel (si l'utilisateur veut le contenu Unmute)** : login + paste manuel dans le pipeline de capture.
- **Backlog (`backlog_next`, Phase 5)** : `.base` views sur `data/memory/<projectId>/` au moment du register-build.

**Ce qu'il ne faut PAS faire** : ne pas ingérer l'URL gated ; ne pas faire de Bases un substitut à QMD ; ne pas builder les vues avant que les registres existent ; ne pas laisser un `.base` écrire du contenu mémoire (vue seulement).

## Ré-audit

Ré-auditer au **register-build Phase 5** (quand il y a des registres à afficher), ou si l'utilisateur fournit le contenu Unmute par paste manuel.

## Sources

- `unmuteai.com/value-gift/obsidian-bases` — **gated**, contenu non récupérable (rejetée comme source)
- [Obsidian Help — Bases](https://help.obsidian.md/bases) — source canonique non-gated (recommandée)
- Adjacents internes : `docs/knowledge/project-doctrine.md` L178-181 (Obsidian = vitrine via graph) ; `references.md:78` + `skills-reference.md:252` (Bases nommée dans kepano/obsidian-skills) ; memory `project_karpathy-second-brain`
