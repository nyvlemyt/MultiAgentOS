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

### La charte visuelle (référence : page OtakuGO « Nos données, notre base, nos règles »)

Validée par l'utilisateur le 2026-07-07 après comparaison directe (un essai en thème
sombre a été rejeté). Non négociable :

- **Fond papier clair** `#FAF9F6`, encre `#26242E` — jamais de thème sombre en fond de
  page : le cadre hôte des artifacts est clair, le texte hors panneaux devient illisible
  (prouvé). Le sombre revient **par panneaux d'accent** (mixte validé 2026-07-07) :
  cartes de chiffres clés, nœuds de flux et bandeau de trace en `#141B23` avec texte
  clair `#DCE4EC` / chiffres ambre `#E8B34B` — jamais pour du texte courant.
- Palette : accent `#C8405F` (points chauds, décisions), structure `#55527E` (eyebrows,
  nœuds de flux), `#2F7D4F` ok · `#A96F14` attention · `#8A8794` muted ; chips pastel
  (fond teinté clair + texte coloré), jamais de badge sombre.
- Cartes blanches, bord `#E6E3DC`, rayon 10-12 px ; étapes en pastilles numérotées ;
  statuts en lignes à liseré gauche coloré.
- **Zéro scroll horizontal de page** : les flux fléchés wrappent (`flex-wrap`), seuls
  les tableaux scrollent, dans leur propre cadre.
- Sommaire à ancres en tête dès que la page dépasse 3 sections.
- Gros titre ~2.3rem/800, thèse ~1.2rem, chiffres clés en cartes dès l'en-tête.

## La règle d'or : une mission = une page vivante

- On **met à jour la même page** (même URL d'artifact) à chaque jalon : statuts qui
  passent au vert, nouvelles décisions, prochaine étape.
- On ne crée une nouvelle page que pour une nouvelle mission.
- La page garde une trace des fichiers/commits associés en pied de page.

### Persistance de l'URL : le fichier `.url` committé

L'URL d'un artifact ne vit pas que dans la mémoire par-machine (une session sur un autre
poste la perdrait). Chaque mission à dashboard actif committe un raccourci dans
`docs/resources/dashboards/<mission>.url` (format `[InternetShortcut]`, double-cliquable).

Registre actuel :

| Mission | Fichier |
|---------|---------|
| Ingestion cours S1→S7 | `docs/resources/dashboards/ingestion-cours.url` |

### Règle de reprise (obligatoire en début de session)

Au démarrage de **toute session touchant une mission à dashboard actif** :

1. Lire le fichier `.url` correspondant dans `docs/resources/dashboards/`.
2. `WebFetch` de la page pour connaître son état actuel.
3. Calculer le delta (ce qui a changé depuis : statuts, jalons, décisions).
4. **Redéployer la même page** (paramètre `url=` de l'outil Artifact) **avant** le
   rapport final de session — jamais de nouvelle page, jamais de rapport sans redéploiement.

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

## Widgets inline (ajout 2026-07-13)

Quand l'environnement expose l'outil `visualize show_widget` (Claude Code desktop),
le préférer à l'artifact pour les **points d'étape ponctuels** : le widget se rend
directement dans la conversation (metric cards, barres de progression, checklists
« fait / reste / à valider », boutons `sendPrompt` qui lancent l'action suivante).

- Widget inline = photo d'un instant, dans le fil de la discussion.
- Artifact = page vivante multi-sessions (la règle « une mission = une page » reste).
- Les deux se combinent : widget pour le point du jour, artifact pour la mission.

Validé par Melvyn le 2026-07-13 (point d'avancement pipeline AniList/Supabase).
