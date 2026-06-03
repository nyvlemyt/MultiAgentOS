# Backlog — Design Stack cockpit (Phase 7)

**Quand** : Phase 7 (cockpit UI polish). **Source** : Google Doc "Ultimate Design Stack for Claude Code" (0xLoucash) + ressources design auditées.

## Pourquoi pas maintenant

Phase 3 = skill registry. Le cockpit UI existe (mocked + live `/skills`). Le polish design = Phase 7. Mais on range la stack ici pour ne pas la perdre.

## La stack design (3 outils combinés)

| Outil | Quoi | ⭐ | Install | Statut MAS |
|-------|------|-----|---------|-----------|
| **taste-skill** (Leonxlnx) | 12 skills design, anti-"AI slop" | 31k | `npx skills add github.com/Leonxlnx/taste-skill` | déjà dans `.claude/skills/`? non — Phase 7, audit sécu requis |
| **ui-ux-pro-max** | design thinking, IA, WCAG, responsive-first | 71k | déjà installé `.claude/skills/ui-ux-pro-max/` ✅ | présent |
| **21st.dev MCP** (magic-mcp) | component library, Inspiration/Icon/Magic Generate | — | API key 21st.dev | **REJETÉ — PAYG, viole §11** |

## Patterns extractibles (sans installer)

**3 paramètres de design intentionnel** (taste-skill) — à reprendre dans un skill MAS `cockpit-design` :
- `DESIGN_VARIANCE` : éviter les layouts symétriques génériques
- `MOTION_INTENSITY` : dosage des animations (Framer Motion)
- `VISUAL_DENSITY` : densité info (cockpit = dense, pas landing marketing)

**Problème "AI slop"** : l'IA défaut sur la moyenne statistique (layouts symétriques, boutons bleus, spacing uniforme, typo prévisible). Solution : choix esthétiques intentionnels. → MAS cockpit doit viser "dense et utile", pas "joli générique".

**Variantes de style** (taste-skill) : soft / minimalist / brutalist / redesign. Pour MAS : `industrial-brutalist` ou `minimalist` correspondent à l'esthétique cockpit.

## Mapping MAS Phase 7

| Étape | Outil/pattern | Note |
|-------|---------------|------|
| 1. Inspiration | `VoltAgent/awesome-design-md` (72 DESIGN.md) | copier 1 DESIGN.md (Linear/Vercel/Datadog) dans `apps/web/`, zéro install |
| 2. Génération | taste-skill `design-taste-frontend` + params | après audit sécu (skill-install-policy.md) |
| 3. Audit | pbakaus/impeccable `/impeccable audit` | après audit sécu |
| 4. Composants | Sonner (toast), Vaul (drawer) — emilkowal.ski | `npm install sonner` — purs React, pas d'API key |
| 5. Design system externe | skillui.vercel.app | extraire le design d'un projet enregistré → `.skill` |

**NE PAS utiliser** : 21st.dev MCP / magic-mcp (API key payante). Si besoin composants : awesome-design-md + Sonner/Vaul couvrent sans PAYG.

## Action

Phase 7. Audit sécu (skill-install-policy.md) avant taste-skill/impeccable. Créer skill `cockpit-design` MAS avec les 3 params + esthétique dense. Référence : skills-reference.md §Librairies Design.
