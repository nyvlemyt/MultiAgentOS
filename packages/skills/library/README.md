# Arsenal froid — bibliothèque de skills & agents (récolte ECC)

Cette bibliothèque est le résultat de la campagne **ECC Harvest** : 877 skills + 32 fiches
agents, récoltés depuis [`affaan-m/ecc`](https://github.com/affaan-m/ecc) (MIT) et
[`mukul975/Anthropic-Cybersecurity-Skills`](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
(Apache-2.0, 754 skills cyber 100 % défensifs), audités et reformatés au standard CLAUDE.md §12.

> **Source de vérité des décisions** : `docs/intake/2026-06-16-ecc-harvest/ledger.tsv`
> (1050 intégrés / 244 rejetés / 2 triés) + `docs/intake/.../decisions/*.md` (142 dossiers, le « pourquoi » item par item).

---

## 1. Le modèle froid / chaud (pourquoi cette bibliothèque existe)

877 skills ne peuvent **pas** tenir dans le contexte de l'IA en même temps — ça exploserait la
fenêtre de tokens et le quota. D'où deux états :

| | **Froid** (cold) | **Chaud** (hot / actif) |
|---|---|---|
| Emplacement | `packages/skills/library/<slug>/SKILL.md` | `.claude/skills/<slug>/` |
| Chargé dans le contexte IA ? | **Non** — seul le résumé L1 de `index.json` est lu | **Oui** — corps §12 complet |
| Coût tokens | ~0 tant qu'inutilisé | réel |
| Combien | 877 (toute la bibliothèque) | uniquement les promus, à la demande |

Image : **froid = livre rangé** (on lit le titre au dos) · **chaud = livre ouvert sur le bureau**.

Deux niveaux par skill :
- **L1 (résumé ≤200 tokens)** dans `index.json` → ce que l'IA lit pour **décider**.
- **L2 (corps §12 complet)** dans le `SKILL.md` → chargé seulement **quand on en a besoin**.

---

## 2. Structure

```
packages/skills/library/
├── <slug>/SKILL.md      ← 877 skills froids (frontmatter + Prompt Defense Baseline + 7 sections §12)
└── index.json           ← GÉNÉRÉ (résumés L1) — gitignored, jamais committé

packages/agents/library/
├── <id>.md              ← 32 fiches agents froides (Tier B)
└── index.json           ← GÉNÉRÉ (miroir agents) — gitignored
```

**Pourquoi `index.json` est gitignored** : c'est un **artefact généré** (le test le reconstruit à
chaque `pnpm test`). Son texte de résumés déclenchait des faux positifs SonarCloud S7164
(« secret Dropbox » sur des mots techniques de 15 lettres). On ne le commit donc plus ; il se
régénère localement.

---

## 3. Tier A vs Tier B (rôle des agents — distinct de chaud/froid)

| | **Tier A — Orchestrateurs** | **Tier B — Spécialistes** |
|---|---|---|
| Rôle | Pilotent la mission, routent, **appellent** les Tier B | Exécution spécialisée |
| Exécutent ? | Non, jamais | Oui |
| Où | `packages/agents/fiches/` | `.claude/agents/` (58) + **`packages/agents/library/` (32 récoltés)** |

Les 32 fiches de cette bibliothèque sont des **Tier B froids** : appelés à la demande via
`delegate({ agent, task })`, jamais tous chargés d'office. Le **dispatcher** est le seul chemin
entre tiers ; un Tier B n'appelle jamais un Tier A. (Détail : AGENTS.md §1 + §6.bis.)

---

## 4. Comment l'IA retrouve un skill (flux froid → chaud)

1. **Découverte** — `mas-skill-router` lit **uniquement `index.json`** (résumés L1), jamais les
   corps. Code : `loadLibraryIndex()` dans `packages/skills/src/scanner.ts`
   (agents : `loadAgentLibraryIndex()` dans `packages/agents/src/library.ts`).
2. **Routage par domaine** — chaque cluster (`cyber:threat-hunting`, `skill:eng-lang`…) est mappé
   sur un domaine routeur via `clusterToDomain()` : on restreint par domaine puis par pertinence du résumé.
3. **Promotion à la demande** — `promoteSkill(repoRoot, slug)` copie le `SKILL.md` froid vers
   `.claude/skills/<slug>/`. **Seul moment** où le corps L2 entre en contexte.
4. **Traçabilité** — chaque skill garde `origin` + `license` en frontmatter ; le ledger relie
   chaque source à sa décision et son dossier.

---

## 5. Commandes utiles

```bash
# Régénérer les index (après ajout/modif de skills ou de fiches)
pnpm --filter @mas/skills build-library-index   # → packages/skills/library/index.json
pnpm --filter @mas/agents build-library-index   # → packages/agents/library/index.json

# Lire le catalogue (après régénération)
cat packages/skills/library/index.json | python3 -m json.tool | less
```

**Ne jamais** copier les 877 skills à la main dans `.claude/skills/` — ça anéantirait l'intérêt
du modèle froid/chaud. On promeut à la demande.

---

## 6. Garde-fous

- **Sécurité (§5)** : aucune arme / exploit / C2 dans la bibliothèque. Les skills cyber offensifs
  sont reformulés en défense (`detecting-and-preventing-*`, `testing-own-app-*`, `hardening-*`) ou
  rejetés. Décisions des lots bloqués par le garde-fou cyber d'Anthropic : `decisions/cyber-red-teaming-YAA.md` + `cyber-pentest-final.md`.
- **Tokens (§6 TOKEN_STRATEGY)** : froid par défaut, jamais d'auto-injection.
- **Connaissance (§12)** : la doctrine distillée est dans `docs/knowledge/` (catalogue MCP,
  scoring de risque, cycle mémoire) — lecture obligatoire avant de créer/modifier un skill.

---

## 7. Idée / Roadmap — console de gestion centralisée

Gérer 877 skills + 32 agents + règles + commandes via des fichiers et `git` ne passera pas à
l'échelle côté humain. **Idée déposée au backlog : une console cockpit pour piloter tout l'arsenal
depuis l'UI** (chercher / activer-désactiver / promouvoir / éditer / auditer skills, agents,
règles, commandes, MCP — au même endroit).

→ Carte détaillée : [`docs/backlog/arsenal-management-console.md`](../../../docs/backlog/arsenal-management-console.md)
