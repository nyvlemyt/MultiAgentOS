# Workflow — Dashboard visuel de suivi

Préférence utilisateur permanente (cf. `CLAUDE.md` §14.7), née le 2026-07-06 sur la mission
données OtakuGO : quand Claude a expliqué le plan data avec une page visuelle (diagrammes,
timelines, statuts, points à valider), la validation a pris quelques minutes au lieu
d'allers-retours de texte. À reproduire partout, dont dans MultiAgentOS lui-même.

## Quand déclencher

Systématique dès qu'un sujet est **structurant** :

- un plan ou une roadmap multi-étapes ;
- une architecture ou un schéma de données à faire valider ;
- un état d'avancement de mission (phases, verrous, décisions en attente) ;
- toute explication où l'utilisateur devrait « se représenter » quelque chose.

Ne pas déclencher pour : une réponse courte, un fix ponctuel, une question factuelle.

## La forme

Un **artifact HTML autonome** (pas de dépendances externes), avec :

1. **La thèse en une phrase** en haut + 3-5 chiffres clés.
2. **Le principe en une image** : avant/après, flux fléché, ou schéma en couches.
3. **Des analogies du quotidien** pour chaque concept (l'armoire, la vitrine, le portique…),
   le vocabulaire technique en second niveau.
4. **Des statuts visuels** : chips fait / en cours / à faire / verrouillé — l'état se lit
   sans lire le texte.
5. **Une section « À valider par toi »** : les seuls curseurs qui attendent une décision
   utilisateur, formulés en questions fermées.
6. Timelines pour les séquences réelles, tableaux courts pour les mappings, jamais de
   dump exhaustif.

## La règle d'or : une mission = une page vivante

- On **met à jour la même page** (même URL d'artifact) à chaque jalon : statuts qui
  passent au vert, nouvelles décisions, prochaine étape.
- On ne crée une nouvelle page que pour une nouvelle mission.
- La page garde une trace des fichiers/commits associés en pied de page.

## Intégration MultiAgentOS

- Le cockpit web (apps/web) applique le même principe pour ses écrans de mission :
  état d'une mission = visuel d'abord (phases, gates, coûts), texte ensuite.
- Les rapports de fin de mission des agents suivent ce format quand le sujet est
  structurant ; le Memory Keeper porte cette préférence dans le registre user.

## Exemple de référence

Mission données OtakuGO (2026-07-06) : page « Nos données, notre base, nos règles » —
6 étapes de pipeline avec statuts, armoire de stockage à 6 couches, timeline des ères
(« DBZ ≠ DB Super »), 3 nuits avec verrous, 4 curseurs à valider. Résultat : validation
complète en une lecture.
