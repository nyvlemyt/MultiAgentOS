# Idée — Console de gestion centralisée de l'arsenal (cockpit)

**Statut :** idée backlog (déposée 2026-06-21, post-campagne ECC Harvest).
**Déclencheur de ré-audit :** après P4 (mémoire reliée) ou quand l'arsenal devient ingérable à la main.

## Ce que c'est

Une **page cockpit unique** pour gérer tout l'arsenal récolté **depuis l'UI**, au lieu de fichiers
+ `git` à la main. Tout centralisé : skills, agents, règles, commandes, MCP, mémoire.

Aujourd'hui on a 877 skills froids + 32 fiches agents + 109 règles + 6 commandes + un catalogue MCP.
La découverte passe par `index.json` et la promotion par `promoteSkill()` — **mais rien côté humain**
pour voir, filtrer, activer/désactiver, éditer ou auditer l'ensemble visuellement.

## Pourquoi pas maintenant

- L'arsenal vient juste d'être constitué (PR #32 DRAFT) ; priorité commander = P1→P5 du
  [[project_master-sequence]] (compétences → mockup → intégration → mémoire reliée → axes).
- Une vraie UI de gestion dépend de décisions de design (P2 mockup) et de la mémoire reliée (P4).
- Risque de sur-construire avant de savoir comment l'humain veut réellement piloter.

## Ce qu'elle ferait (surface envisagée)

| Zone | Fonction |
|---|---|
| **Skills** | Lister/chercher les 877 (par cluster/domaine/origine) · voir le résumé L1 · ouvrir le corps L2 · **promouvoir** (froid→chaud) / **rétrograder** · éditer le SKILL.md · voir le dossier de décision |
| **Agents** | Lister les 32 fiches Tier B · voir rôle/domaines/permissions · activer pour délégation · éditer |
| **Règles** | Parcourir `docs/rules/<langage>/` · activer par projet/stack |
| **Commandes** | Voir les 6 workflows · activer/désactiver |
| **MCP** | Catalogue (cf. `docs/knowledge/mcp-connector-policy-and-catalog.md`) · toggler par projet · appliquer la règle « Universal + MCP-beats-CLI » |
| **Mémoire** | Inbox des `MemoryProposal` · promouvoir/rejeter · voir le second-brain |
| **Audit** | État ledger (intégré/rejeté) · couverture des dossiers · doublons · santé Sonar |

## Ce qu'on en extrait (pattern, dès maintenant)

- L'infra de découverte existe déjà : `index.json` (skills + agents), `loadLibraryIndex` /
  `loadAgentLibraryIndex`, `promoteSkill`, `clusterToDomain`. La console serait surtout une **vue
  + actions** par-dessus ces primitives — pas de nouveau moteur.
- Réutilise l'« Agent Control Panel » déjà construit ([[project_ui_agent_control_panel]] — panel
  onglets, overrides DB + révisions de fiches) comme socle ; généraliser de « agents » à
  « arsenal » (skills/rules/commands/MCP).
- Garde le froid/chaud comme invariant UI : « promouvoir » = action explicite, jamais tout chaud.

## Liens

Relié à [[project_ui_agent_control_panel]] · [[project_master-sequence]] · [[project_linked_memory]] ·
`packages/skills/library/README.md` · `docs/knowledge/mcp-connector-policy-and-catalog.md`.
