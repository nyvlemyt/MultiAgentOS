# Skills et Librairies de Référence

## skills.sh — registre interrogeable (intake 2026-06-13)

Registre open-source de skills opéré par Vercel : leaderboard d'installs, badges d'audits sécu
(Gen Agent Trust Hub / Socket / Snyk), CLI `npx skills add <owner/repo>`. Multi-plateforme, gratuit.

**Usage MultiAgentOS** (dossier : `docs/intake/2026-06-13-skills-sh-find-skills.md`) :
- **Découverte build-time** : "existe-t-il un skill pour X ?" → `npx skills find [query]` (skill
  `find-skills`, vercel-labs, 2M installs, 22.2k★) ou recherche directe sur skills.sh.
- Leaderboard + badges sécu = signal `evidence_maturity` gratuit pour les dossiers d'intake.
- **Règle dure (§5)** : `npx skills add` exécute du code tiers → tout skill découvert passe
  `intake-audit` + `skill-install-policy.md` avant install dans le repo. Découverte oui,
  auto-install jamais. Intégration runtime (worker) = backlog Phase 5, via `runGatedIntake`.

## Librairies de skills prioritaires

| Repo | Stars | Contenu |
|------|-------|---------|
| VoltAgent/awesome-agent-skills | — | 1400+ skills de 30+ orgs (Anthropic, Stripe, Vercel...) |
| addyosmani/agent-skills | — | 23 skills lifecycle complets (Define→Plan→Build→Verify→Review→Ship) |
| muratcankoylan/Agent-Skills-for-Context-Engineering | — | 15 skills modulaires context engineering |
| Piebald-AI/claude-code-system-prompts | — | Tous les system prompts de Claude Code v2.1 (~40 agent prompts) |
| repowise-dev/claude-code-prompts | — | 35+ templates organisés en 6 catégories |
| obra/superpowers | 215 000 | Framework skills déjà intégré dans MultiAgentOS |
| wshobson/agents | — | 83 plugins, 191 agents, 155 skills — marketplace cross-CLI |

---

## Format SKILL.md — Spec officielle

Source: https://agentskills.io/specification

```
.claude/skills/[skill-name]/
├── SKILL.md              # YAML frontmatter + body ≤500 lignes
├── references/           # docs supplémentaires (1 niveau max)
│   └── *.md
├── scripts/              # code déterministe exécutable
└── assets/               # templates statiques
```

### YAML frontmatter complet
```yaml
---
name: skill-name-kebab-case       # ≤64 chars, lowercase+hyphens
description: |                    # ≤1024 chars, third person
  Use this skill when [trigger positifs].
  Do NOT use for [triggers négatifs].
---
```

**Règle clé** : les negative triggers ("Do NOT use for X") sont aussi importants que les triggers positifs pour éviter les mauvaises activations dans le dispatcher.

---

## Progressive Disclosure — 3 niveaux

Inspiré de muratcankoylan/Agent-Skills-for-Context-Engineering et la spec officielle :

| Niveau | Contenu | Tokens | Quand charger |
|--------|---------|--------|---------------|
| L1 | `name` + `description` (metadata) | ~100/skill | Toujours — au démarrage worker |
| L2 | `SKILL.md` complet | <5000 | À l'activation de la skill |
| L3 | Fichiers `references/` + `scripts/` | Variable | On-demand sur besoin spécifique |

→ **Implication Phase 3** : `packages/skills/router.ts` charge L1 pour tous les skills au démarrage, hydrate L2/L3 seulement quand un skill est sélectionné pour une tâche.

---

## Patterns de Skills (addyosmani/agent-skills)

### Structure lifecycle skill
```
SKILL.md
├── YAML frontmatter (name, description avec triggers positifs ET négatifs)
├── Overview (1-2 paragraphes)
├── When to Use
├── Process (étapes numérotées)
├── Rationalizations Table (anti-excuses → contre-arguments)
├── Red Flags (signes que le skill est mal utilisé)
└── Verification Criteria (critères binaires pass/fail)
```

### Table des rationalisations (pattern unique)
La table des rationalisations force l'agent à ne pas se décharger :

| Excuse | Réalité |
|--------|---------|
| "C'est juste une petite tâche" | Les petites tâches deviennent complexes. Utiliser le skill. |
| "Je me souviens de ce skill" | Les skills évoluent. Lire la version actuelle. |
| "Ça ne compte pas comme une tâche" | Action = tâche. Vérifier avant de faire. |

---

## Patterns de Context Engineering (muratcankoylan)

### Signal-density test
Avant d'injecter du contexte : **si sa suppression ne changerait pas l'output, ne pas l'injecter.**
→ Applicable à `TOKEN_STRATEGY.md §6` et le mode éco.

### Observation masking
Remplacer les verbose tool outputs par des résumés compacts avant injection LLM.
```
file_read(path) → résumé 50 tokens plutôt que contenu brut 2000 tokens
```

### Routage explicite inter-skills
Chaque fichier SKILL.md peut référencer les autres skills :
```markdown
## Related Skills
- Use `security-review` after this skill for high-risk tasks
- Combine with `test-driven-development` for implementation tasks
```

---

## System Prompts de Production (Piebald-AI + repowise)

### Architecture des prompts Claude Code (Piebald-AI)
Source: https://github.com/Piebald-AI/claude-code-system-prompts

- **Fragments conditionnels** : pas un monolithe, mais des fragments réassemblés selon contexte
- **System reminders injectés dynamiquement** selon l'état de la session
- **Titres descriptifs + token counts** pour chaque fragment
- ~40 agent prompts, ~60 system prompts, ~130 tool descriptions, ~40 system reminders

### Pattern adversarial verification (repowise)
Source: https://github.com/repowise-dev/claude-code-prompts

```
Coordinator → Builder (implémente)
           → Verifier (évalue indépendamment avec verdict PASS/FAIL/PARTIAL)
           → Résultat intégré
```

→ Exactement le rôle du Quality Controller dans AGENTS.md.

### Pattern de safety tiering
```
Actions normales → auto-approve
Actions avec impact external → validation requise
Actions destructives → confirmation explicite + review
```

---

## Three-Tier Model Strategy (wshobson/agents)

Source: https://github.com/wshobson/agents

```typescript
const MODEL_ROUTING = {
  risk_high: 'claude-opus-4-8',     // architecture, sécurité, décisions critiques
  risk_medium: 'claude-sonnet-4-6', // backend, frontend, ML
  risk_low: 'claude-haiku-4-5',     // docs, indexing, résumés, déploiement
};
```

→ Implémentation dans `packages/core/src/llm.ts` Phase 3.5.

---

## Techniques de Prompting Avancées

### Self-Consistency (Google, 2022 → toujours SOTA 2026)
- CoT booste précision de 10-20%
- Self-consistency (multiples chemins + vote majoritaire) ajoute +12-18% vs CoT seul
- **Applicabilité** : décomposition de missions → générer 3 plans → voter sur le meilleur

### GEPA — Reflective Prompt Evolution (ICLR 2026 Oral)
Source: https://github.com/gepa-ai/gepa
- Pattern "observe → reflect → mutate → test" pour amélioration itérative des skills
- Outperforms GRPO de +6pp, MIPROv2 de +12pp, avec 35× moins de rollouts
- **Applicabilité Phase 5+** : auto-amélioration des skills à partir des traces d'exécution

### Anthropic Prompt Improver — 4 étapes
1. Identification des exemples existants
2. Draft initial avec sections XML
3. Chain-of-thought détaillé
4. Amélioration des exemples
→ Utiliser via Console pour développer les fiches agents

---

## Processus 5-Phases pour Créer un Skill (RES-054 @le_gouverneur_ia)

Source: `docs/claude doc/ressources.md` RES-054 "L'usine à compétences sur mesure"

Ce process est utilisé par `pnpm skills:reindex` pour générer les summaries L1 des 6 orchestrator skills. Il est aussi la méthode canonique pour créer tout nouveau skill dans MAS.

### Les 5 phases

1. **Cadrage** : comprendre précisément ce qu'on codifie. Vérifier que ça n'existe pas déjà. Poser la question "Est-ce un skill ou un agent ?" (test binaire).

2. **Découpage en angles** : casser le sujet en 3-10 angles indépendants. Ex pour `mas-skill-router` : routing logic, L1/L2 disclosure, budget enforcement, domain taxonomy, escalation rules.

3. **Recherche en parallèle** : recherches approfondies par angle. Lire les docs/knowledge/ pertinents. Rapide et dense.

4. **Synthèse & rédaction** : écrire le skill complet avec la structure lifecycle (Overview → When to Use → Process → Rationalizations → Red Flags → Verification Criteria). Écrire le summary L1 (≤200 tokens).

5. **Validation** : relecture par le responsable du projet avant activation. Vérifier : negative triggers présents ? Verification Criteria binaires ? Principles section cite une source ?

### Règle absolue
Un skill générique téléchargé ne connaît pas ton projet. Un skill fabriqué dans ton projet devient une brique fiable réutilisable. Préférer toujours la fabrication à l'import.

---

## Librairies de Design Skills — Phase 7 Reference

### Leonxlnx/taste-skill (31.7k⭐)
Source: https://github.com/Leonxlnx/taste-skill

11 skills design pour AI agents. Anti-pattern design (élimine les UIs génériques). Installation: `npx skills add https://github.com/Leonxlnx/taste-skill`.

Skills clés :
- `design-taste-frontend` v2 : paramètres variance/motion/density configurables
- `redesign-existing-projects` : audit + amélioration UI existante
- `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui` : variantes

**Usage MAS Phase 7** : cockpit dense et utile. `redesign-existing-projects` pour auditer `/skills` page.
**Sécurité** : Shell 100%, audit sécu requis avant install.

### pbakaus/impeccable
Source: https://github.com/pbakaus/impeccable

Design skill Claude Code avec 7 référentiels (typography, color, spatial, motion, interaction, responsive, UX writing) + 23 commandes + 27 règles anti-patterns déterministes.

Commandes clés : `/impeccable audit`, `/impeccable polish`, `/impeccable critique`.

**Usage MAS Phase 7** : cockpit UI polish, élimination "AI tells".
**Sécurité** : CLI + Playwright optionnel, audit sécu requis avant install.

### VoltAgent/awesome-design-md
Source: https://github.com/VoltAgent/awesome-design-md

72 fichiers DESIGN.md de marques connues (AI platforms, fintech, dev tools). Format markdown, directement lisible par AI agents.

**Usage MAS Phase 7** : copier 1 DESIGN.md d'inspiration dans `apps/web/` pour guider le cockpit redesign. Zéro installation, zéro dépendance.

### kepano/obsidian-skills
Source: https://github.com/kepano/obsidian-skills — Steph Ango (CEO Obsidian)

Skills Claude Code qui apprennent à l'agent à écrire du Markdown Obsidian-compatible : wikilinks `[[BDR-001]]`, properties frontmatter, JSON Canvas, Bases.

**Usage MAS Phase 6** : Memory Keeper génère des registres avec wikilinks → Obsidian graph view montre les connexions entre decisions/learnings/blockers.

---

## Skills à créer pour MultiAgentOS

Basé sur l'audit des ressources. Ces skills n'existent pas encore dans `.claude/skills/` :

| Skill | Domain | Phase | Source d'inspiration |
|-------|--------|-------|---------------------|
| `quality-controller` | code-review | 3.5 | repowise adversarial verification + RES-037 3 modes |
| `context-pack-builder` | memory | 4 | codex-agent-mem pattern + RES-056 SUMMARY.md |
| `skill-router-advanced` | planning | 3.5 | wshobson three-tier + domain routing |
| `agent-budget-monitor` | planning | 3 | 12-Factor factor 3 |
| `plan-then-execute` | planning | 3.5 | spec-kit decomposition pattern |
| `multi-agent-coordinator` | planning | 5 | LangGraph HITL pattern + depth=1 constraint |

---

## Ressources à explorer

- VoltAgent/awesome-agent-skills : https://github.com/VoltAgent/awesome-agent-skills
- addyosmani/agent-skills : https://github.com/addyosmani/agent-skills
- muratcankoylan context engineering : https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
- Piebald system prompts : https://github.com/Piebald-AI/claude-code-system-prompts
- repowise prompts : https://github.com/repowise-dev/claude-code-prompts
- wshobson/agents : https://github.com/wshobson/agents
- **Leonxlnx/taste-skill** : https://github.com/Leonxlnx/taste-skill (Phase 7, audit sécu d'abord)
- **pbakaus/impeccable** : https://github.com/pbakaus/impeccable (Phase 7, audit sécu d'abord)
- **kepano/obsidian-skills** : https://github.com/kepano/obsidian-skills (Phase 6)
- **VoltAgent/awesome-design-md** : https://github.com/VoltAgent/awesome-design-md (Phase 7)
