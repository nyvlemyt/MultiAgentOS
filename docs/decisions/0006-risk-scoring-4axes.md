# ADR 0006 — Scoring de risque 4-axes (composite) pour le tagger Phase 6

- **Statut** : Proposed (2026-06-21) — à valider au gate de pré-vol Phase 6
- **Date** : 2026-06-21
- **Décideurs** : Melvyn + Claude (application des distillations ECC, campagne harvest)
- **Sources** : `docs/knowledge/risk-scoring-and-session-orchestration.md §1` (modèle 4-axes d'ecc2, MIT), `CLAUDE.md §5` (actions risquées, enum actuel), `config/permissions.json` + `config/project-stack-mappings.json` (listes allow/deny par stack), `mas-sec-reviewer` (gate existant), Phase 6 (classifieur de risque + autopilot).

## Contexte

CLAUDE.md §5 classe aujourd'hui chaque tâche sur un **enum binaire à 4 paliers** : `low / medium / high / blocking`. Le dispatcher pose ce tag, et `high`/`blocking` déclenchent toujours une validation humaine (même en autopilot). C'est simple et a tenu jusqu'ici, mais c'est un **classifieur grossier** :

- il encode **implicitement** deux dimensions pourtant décisives — la **réversibilité** (un edit ≪ un `rm -rf` / `git push --force`) et le **rayon d'effet** (un fichier ≪ tout le repo ≪ le système) ;
- il mélange dans un seul palier des actions de natures très différentes (un write `medium` dans `apps/` vs un `medium` qui touche un fichier sensible) ;
- il ne se branche pas naturellement sur les listes `allow`/`deny` déjà disponibles par stack (`config/project-stack-mappings.json`).

L'analyse d'`ecc-tui` (ecc2, distillée le 2026-06-21) propose un modèle strictement plus fin, déjà éprouvé en production sur un control-plane d'agents.

## Décision

**Adopter, pour le tagger de risque de la Phase 6, un scoring composite sur 4 axes** — sans supprimer l'enum §5, qui reste l'interface de gating.

### Les 4 axes (chacun normalisé 0.0–1.0)

| Axe | Mesure | Source d'entrée MAOS |
|---|---|---|
| **Base tool risk** | le tool lui-même (read ≪ write ≪ shell ≪ network) | listes `allow`/`deny` de `config/project-stack-mappings.json` + `config/permissions.json` |
| **File sensitivity** | le chemin cible (`.env`, secrets, keystores = haut) | §5 protected paths + catégories `config/permissions.json` |
| **Blast radius** | l'ampleur (un fichier ≪ repo-wide ≪ système / cross-projet) | périmètre du projet actif (`projects.path`) — write hors périmètre = max |
| **Irreversibility** | annulable ou non (edit ≪ `rm -rf` / `git push --force` / suppression de branche) | liste §5 des actions toujours gated |

### Composition et mapping

1. **Composite** = combinaison des 4 axes → score 0.0–1.0 (formule à fixer à l'implémentation ; un **max pondéré** est recommandé pour qu'un seul axe extrême — p.ex. irreversibility=1.0 sur `git push --force` — suffise à faire monter le composite, plutôt qu'une moyenne qui le diluerait).
2. **Action graduée** : `Allow / Review / RequireConfirmation / Block`.
3. **Pont vers l'enum §5 (interface de gating inchangée)** : le composite **mappe** sur `low/medium/high/blocking`. Invariant dur conservé : `high` et `blocking` **pausent toujours** pour un humain, même en autopilot. Les KILL déterministes de §5 (rm, `reset --hard`, `push --force`, write `.env`/secrets, write hors projet, `curl|sh`/`eval`/`sudo`, hosts hors allowlist) restent des **Block inconditionnels** — le score ne peut **jamais** les rétrograder.

Le score est donc une **couche d'affinement au-dessus** des règles déterministes, pas un remplacement : les règles §5 sont un plancher de sécurité, le 4-axes discrimine le reste (notamment la zone `medium` aujourd'hui floue).

## Rationale

- **Réversibilité + blast-radius deviennent explicites** : les deux dimensions que §5 n'encode qu'en creux pilotent désormais le tag, ce qui colle au modèle mental réel du danger (« est-ce annulable ? jusqu'où ça porte ? »).
- **Entrées déjà disponibles** : les listes `allow`/`deny` par stack alimentent directement l'axe base-tool — pas de nouvelle source à maintenir.
- **Compatibilité** : en mappant sur l'enum existant, aucun consommateur de §5 (sec-reviewer, UI topbar, autopilot) ne casse ; on gagne en finesse sans réécrire les gates.
- **Éprouvé** : modèle issu d'un control-plane d'agents en production (ecc2), attrape empiriquement `rm -rf`, `git push --force origin main`, lectures de `.env`/secrets.

## Alternatives rejetées

- **(a) Garder l'enum binaire seul** — rejeté : ne distingue pas réversibilité ni rayon d'effet ; la zone `medium` reste un fourre-tout. C'est exactement la grossièreté que cet ADR corrige.
- **(b) Remplacer §5 par le composite seul (supprimer les règles déterministes)** — rejeté : un score continu est *probabiliste* ; les interdits durs (write secrets, `push --force`, cross-projet) doivent rester des **Block déterministes** non rétrogradables (§5, garde-fou non négociable). Le score complète, ne remplace pas.
- **(c) Classifieur LLM par tâche (façon mode `auto` Claude Code, classifier Sonnet)** — rejeté **comme primitive interne** : coût tokens par action + non-déterminisme (§6). Le classifier natif de Claude Code reste une **couche externe complémentaire** (cf. `claude-code-context-and-modes.md §4`), pas notre tagger. Le 4-axes est déterministe et gratuit.

## Consequences

**Positives**
- Tag de risque plus fidèle → moins de faux `high` (friction) et moins de faux `low` (danger raté).
- Branche les configs permission existantes sans nouvelle dette de données.
- Interface §5 stable : adoption incrémentale, pas de big-bang.

**Négatives / coûts**
- **Formule à calibrer** : pondérations des 4 axes + seuils de mapping vers l'enum → à tester (table de cas : `rm -rf`, `push --force`, write `.env`, edit `apps/`, write cross-projet) au pré-vol Phase 6.
- **Surface de test élargie** : chaque axe + le composite + le mapping doivent être couverts (Vitest), sous peine de régression silencieuse du gating.
- **Risque de sur-ingénierie** si la formule devient opaque → garder un **max pondéré lisible**, documenté, avec cas-or de référence.

## Plan d'intégration (Phase 6, pas maintenant)

- **Cible** : pré-vol + build Phase 6 (classifieur de risque + autopilot). **Pas de code runtime sans go séparé** (cet ADR ne fait que trancher le modèle).
- **Fichiers pressentis** : tagger dans `packages/core` (ou `packages/tokens`/dispatcher selon l'archi Phase 6) ; entrées depuis `config/permissions.json` + `config/project-stack-mappings.json` ; consommé par `mas-sec-reviewer` + dispatcher.
- **DoD binaire** : (1) les 4 axes calculés et testés ; (2) composite + mapping vers `low/medium/high/blocking` testés ; (3) table de cas-or verte (les 6+ actions ci-dessus tombent dans le bon palier) ; (4) **invariant prouvé** : aucune action §5-KILL ne peut être rétrogradée sous `Block` par le score.
- **Ne PAS faire** : remplacer les règles déterministes §5 ; introduire un classifier LLM interne ; activer le composite en autopilot avant que la table de cas-or soit verte.

## Liens
- `docs/knowledge/risk-scoring-and-session-orchestration.md §1` (modèle 4-axes, source) + §4 (boucles d'autonomie bornées — même phase 6).
- `CLAUDE.md §5` (interface de gating, plancher déterministe — inchangé).
- `config/permissions.json` (catégories risquées) + `config/project-stack-mappings.json` (listes allow/deny par stack — entrée base-tool).
- `mas-sec-reviewer` (consommateur du tag), Phase 6 ROADMAP (classifieur + autopilot).
