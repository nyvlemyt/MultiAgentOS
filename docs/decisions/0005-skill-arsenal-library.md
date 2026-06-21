# ADR 0005 — Bibliothèque-arsenal de skills indexée (campagne ECC harvest)

- **Statut** : Accepted (2026-06-18)
- **Date** : 2026-06-18
- **Décideurs** : Melvyn + Claude (pré-flight campagne ECC harvest)
- **Sources** : `docs/intake/2026-06-16-ecc-harvest/PLAN.md` (architecture funnel, décisions §16-17), `CLAUDE.md §3` (layout repo), `CLAUDE.md §6` + `CLAUDE.md §12` (discipline tokens + format SKILL.md), `TOKEN_STRATEGY.md §5/§6/§10` (règles de chargement, anti-patterns), ADR 0004 (seam d'intake — la bibliothèque est l'aval de l'audit).

## Contexte

La campagne ECC harvest mine deux bibliothèques open-source de grande taille — [affaan-m/ecc](https://github.com/affaan-m/ecc) (270 skills + 67 agents + 92 commands + 113 rules) et [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (754 skills) — soit **~1297 items** à trier. La posture budgétaire retenue (PLAN §17) est de **boost intégral** : chaque keeper est réécrit au format `CLAUDE.md §12` (summary L1 + body L2) et amélioré, jamais ingéré à la légère. On parle donc, après tri et dedup, de **plusieurs centaines de keepers durables** : skills, agents, commands, rules.

Une question d'architecture doit être tranchée **avant** d'écrire le moindre keeper : **où vivent ces artefacts adoptés ?**

La contrainte dure vient de la discipline tokens. Tout ce qui se trouve sous `.claude/skills/` voit son frontmatter (donc son `summary` L1) injecté dans **chaque** session Claude Code par le mécanisme de découverte des skills. À l'échelle actuelle (une dizaine de `mas-*` skills) c'est négligeable ; à l'échelle de 200+ skills adoptés, c'est un **bloat systématique** de plusieurs milliers de tokens imposé à toutes les sessions, indépendamment de leur besoin réel — ce qui viole frontalement `TOKEN_STRATEGY.md §5` (« Never load a skill body unless the Skill Router explicitly hydrated it ») et §6/§10 (anti-pattern « loading skill bodies — load the 1-line summary, hydrate on demand »), et la règle `CLAUDE.md §6` (« Never inject a full skill body when a summary exists »).

Il faut donc un emplacement qui **stocke beaucoup** sans **injecter par défaut**.

## Décision

**1. Les keepers vivent dans une bibliothèque indexée, lue à la demande — pas sous `.claude/skills/`.**

```
packages/skills/library/
├── index.json                 # registre router-lisible (slug, summary L1, tags, source, provenance, re-audit date)
└── <slug>/
    └── SKILL.md               # format §12 complet (summary L1 + body L2)
```

- `mas-skill-router` lit **`index.json` uniquement** (summaries L1 ≤ 200 tokens) pour sélectionner les skills pertinents d'une tâche, puis hydrate le `SKILL.md` (body L2) **seulement** pour les skills retenus. Aucun body n'est jamais chargé en bloc. Ceci est exactement le contrat `mas-skill-router` (« Reads L1 summaries only — never loads full skill bodies ») et la règle de chargement `TOKEN_STRATEGY.md §5`.
- Chaque `SKILL.md` est écrit au **format `CLAUDE.md §12`** : champ `summary:` (L1, ≤ 200 tokens) pour l'injection, body (L2) avec Principles → Process → Rationalizations → Red Flags → Verification Criteria. Une provenance `// pattern from <repo> <path>` est citée en tête (CLAUDE.md §9.bis).

**2. `.claude/skills/` reste l'espace *actif* — la promotion y est *à la demande* uniquement.**

- Un skill n'est copié de la bibliothèque vers `.claude/skills/<id>/` que lorsqu'il devient un skill de premier plan, fréquemment utilisé et justifiant l'injection systématique de son summary. C'est un geste explicite, pas un défaut.
- Les `mas-*` skills existants restent où ils sont ; la bibliothèque est un **réservoir**, `.claude/skills/` la **vitrine** active.

**3. Les autres types d'artefacts ont leurs propres destinations (PLAN §8-11) :**

- **Rules** → `docs/rules/<lang>/` (arsenal documentaire par langage ; certaines rules TS/web/react/vue alimentent aussi `CLAUDE.md §7`).
- **Commands** → `.claude/commands/<name>.md` (slash commands ; dedup lourd — une command n'est gardée que si elle câble un workflow qu'on n'a pas).
- **Agents** → fiches Tier B / `packages/agents` (hors périmètre de cet ADR, traité par les clusters d'agents de la campagne).

**4. `index.json` est l'organe de dedup et de gouvernance.**

- Construit/mis à jour à chaque keeper adopté, il porte par entrée : `slug`, `summary` (L1), `tags`, `source` (repo + path d'origine), décision d'intake (`adopt`/`adapt`), et `re-audit date`. C'est le point de lookup unique pour éviter les doublons (croisé avec `our-assets-index.md` de la campagne) et pour que le router n'ait jamais à scanner l'arborescence.

## Rationale

- **Tokens** : séparer stockage et injection est la seule façon de garder des centaines de skills sans payer leur summary à chaque session. La bibliothèque ne coûte que ce que le router décide d'hydrater — fidèle à `TOKEN_STRATEGY.md §5/§6` et `CLAUDE.md §6`.
- **Scalabilité** : la campagne ECC est multi-sessions et le corpus ne fera que grossir. Un réservoir indexé absorbe la croissance ; `.claude/skills/` resterait sinon ingérable et pollué.
- **Dedup** : un `index.json` unique donne un point de vérité pour le lookup avant adoption (pas de re-dérivation par sous-agent), ce que la campagne exige pour ses fan-outs parallèles.
- **Continuité** : la bibliothèque est l'**aval naturel** du seam d'intake (ADR 0004) — un keeper audité devient une entrée de bibliothèque, sans nouveau chemin d'écriture à auditer.

## Alternatives rejetées

- **(a) Tout droit dans `.claude/skills/`** — rejeté : injecte 200+ frontmatters dans **chaque** session = bloat tokens systématique, viole `TOKEN_STRATEGY.md §5/§6/§10` et `CLAUDE.md §6`. C'est précisément le coût que la bibliothèque évite.
- **(b) git submodule du repo ECC** — rejeté : pas de réécriture au format §12 (les skills upstream ne sont pas conformes au boost), pas de dedup (on garderait doublons et déchets), couplage à l'amont (un upstream qui bouge casse notre arsenal), et risque sécurité d'un `install.sh`/contenu non audité importé en bloc — contraire au gate `mas-sec-reviewer` de la campagne (ADR 0004 §6) et à « all state in `data/`, external trees read-only » (CLAUDE.md §8).
- **(c) Package npm publié (`@mas/skills`)** — rejeté : overkill pour un produit **local-first** mono-utilisateur. Un registre de fichiers + `index.json` suffit ; publier/versionner un package ajoute une chaîne de build et de release sans bénéfice, et entrerait en tension avec la doctrine local-first.

## Consequences

**Positives**

- Coût tokens borné : zéro injection par défaut, hydratation à la demande par le router. Des centaines de skills sans pénalité de session.
- Scalabilité : la croissance du corpus n'augmente pas le coût d'une session.
- Dedup centralisé via `index.json` : lookup unique, fan-out parallèle sans collision (un fichier par item).
- Réversibilité : un skill se retire en supprimant son dossier + son entrée d'index ; pas de couplage upstream.

**Négatives / coûts**

- **`index.json` est un artefact à maintenir** : chaque adoption/retrait doit le mettre à jour, sous peine de désynchronisation avec l'arborescence (mitigation : génération depuis les frontmatters lors d'un rebuild d'index).
- **Étape de promotion explicite** : un skill très utilisé doit être promu manuellement vers `.claude/skills/` ; oublier la promotion peut laisser un skill chaud sous-exposé.
- **Le router doit lire l'index** : `mas-skill-router` dépend désormais de la présence et de la fraîcheur de `index.json` ; un index absent ou périmé dégrade la sélection (à couvrir par un test de cohérence index ↔ fichiers).

## Liens

- `CLAUDE.md §3` (layout repo) — **à compléter** : ajouter `packages/skills/library/` à l'arborescence documentée. Cette mise à jour est faite en **Phase E** de la campagne (cet ADR ne modifie pas `CLAUDE.md`).
- `CLAUDE.md §6` (discipline tokens — summaries d'abord) et `CLAUDE.md §12` (format SKILL.md : L1 summary + L2 body, Principles/Process/Rationalizations/Red Flags/Verification Criteria).
- `TOKEN_STRATEGY.md §5` (règles de chargement), §6 (caveman/summaries), §10 (anti-patterns — « load the 1-line summary, hydrate on demand »).
- `docs/intake/2026-06-16-ecc-harvest/PLAN.md` (architecture funnel, décisions §16-17, destinations par type §8-11).
- ADR 0004 (seam d'intake — la bibliothèque est l'aval de l'audit, écriture via le chemin existant).
