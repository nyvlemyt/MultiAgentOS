# Intake — skills.sh + find-skills (2026-06-13)

*Produced by the `intake-audit` skill.*

- **Type** : registre de skills (skills.sh) + skill de découverte (find-skills)
- **Source** : https://www.skills.sh · https://www.skills.sh/vercel-labs/skills/find-skills · repo vercel-labs/skills
- **Récence / obsolescence** : actif 2026 (find-skills first-seen jan 2026) / low
- **Résumé** :
  - Registre open-source de skills d'agents opéré par Vercel : marketplace + leaderboard + CLI `npx skills add <owner/repo>`
  - Multi-plateforme (Claude Code, Cursor, Codex, Copilot, …), gratuit
  - Skills listés avec audits sécu tiers (Gen Agent Trust Hub, Socket, Snyk)
  - find-skills : 2.0M installs, 22.2k★ — `npx skills find [query]` cherche leaderboard+GitHub, filtre par installs (≥1k), réputation, stars, puis installe via `npx skills add`

## Fit
- **Découverte** : répond à "existe-t-il déjà un skill pour X ?" — alimente le pipeline intake `kind: 'skill'` construit en Phase 4.5 producer (`intakeSource` → dossier → triage → install gated).
- **Signal gratuit** : leaderboard + badges sécu = proxy `evidence_maturity` pour nos audits.
- Surface touchée : `docs/knowledge/skills-reference.md` (référence), backlog runtime. Pas de doublon : nos librairies référencées (VoltAgent, addyosmani…) sont des listes statiques ; skills.sh est interrogeable + métriques vivantes.

## Coûts
- **Install** : ~0 (référence doc) ; find-skills perso = 1 dossier de skill, trivial
- **Maintenance** : nulle (service hébergé) ; risque = dépendance à un index tiers pour la découverte (acceptable : découverte ≠ exécution)
- **Retrait** : trivial (référence doc + un skill local) — réversibilité haute

## Scores (0–5)
project_fit 4 · token_efficiency 4 · safety 3 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 3

## KILL criteria
- PAYG / clé API → **pass** (gratuit, local)
- Exécute du code sans audit sécu → **hit partiel** : `npx skills add` exécute du code tiers. Mitigation obligatoire : chaque skill découvert passe `intake-audit` + `skill-install-policy.md` AVANT install repo (§5). find-skills "découvre+installe" en un geste → chez nous **découverte oui, auto-install jamais**.
- Hors phase → **hit partiel** : intégration runtime (worker qui découvre/installe seul) = hors 4.5 → backlog Phase 5.

## Décision
- **skills.sh (référence de découverte)** : `adapt_now` — ajouté à `docs/knowledge/skills-reference.md`, utilisé comme source d'intake build-time.
- **find-skills (usage build-time perso, hors repo)** : `adapt_now` — installable dans `~/.claude` utilisateur ; jamais auto-déclenché par les agents MAS.
- **Intégration runtime MAS** (découverte automatisée dans le worker) : `backlog_next`, cible Phase 5 (Tier B) ou 4.5-receptacle — passe par `runGatedIntake` (kind skill/repo) + sec-reviewer.

## Appropriation
Version MultiAgentOS = skills.sh comme **source amont du pipeline intake existant** : `npx skills find` (manuel) → `intakeSource({kind:'skill'})` → dossier + candidat → triage Keeper → install gated. Zéro nouveau write-path, zéro LLM.

## Ré-audit
Re-check à l'ouverture de Phase 5 (intégration runtime) ou si le registre introduit un modèle payant / change de gouvernance.
