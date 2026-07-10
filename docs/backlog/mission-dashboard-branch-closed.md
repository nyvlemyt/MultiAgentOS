# Branche `phase/ui-mission-dashboard` close — specs préservées

**Statut** : CLOSED (décision utilisateur 2026-07-07)
**Branche** : `phase/ui-mission-dashboard` (tip 3579cc5, 2026-06-16, checker PASS, jamais mergée)

## Ce que la branche contenait

Dashboard de mission dans le cockpit web (~3 000 lignes) : `mission-progress` /
`mission-report` / `mission-script` dans `apps/web/lib/`, conversation scopée mission,
migration `0010_mission_conversations` + snapshot.

## Pourquoi close

- Sa migration 0010 est en conflit avec la chaîne Drizzle actuelle (0010–0012 pris
  par d'autres features) : irrécupérable telle quelle, il faudrait tout re-générer.
- Le principe « état de mission = visuel d'abord » vit désormais dans CLAUDE.md §14.7
  (`docs/workflows/dashboard-visuel-de-suivi.md`) et sera porté par la Brique 5
  cockpit (onglet Ressources/Connaissances) au moment du re-build.

## Ce qui est préservé

- `docs/learning/specs/2026-06-16-mission-dashboard-design.md`
- `docs/learning/specs/2026-06-16-cockpit-roadmap.md`
- `docs/learning/specs/2026-06-16-agent-control-panel-design.md`
- `docs/learning/specs/2026-06-16-rich-composer-design.md`
- `docs/learning/2026-06-16/checker-verdict-m.md`

Si un futur dashboard de mission cockpit se construit, repartir de ces specs et du
schéma `conversations.missionId` (l'idée), pas du code de la branche (les migrations).
