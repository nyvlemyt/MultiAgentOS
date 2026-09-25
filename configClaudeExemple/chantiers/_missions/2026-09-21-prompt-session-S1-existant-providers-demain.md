# Prompt de la session S1 : l'existant entre les providers et DEMAIN, pour la réunion du 22/09

Écrit le 21/09/2026 par la session principale. À coller tel quel dans une **session neuve ouverte dans `C:\dev\Eve\EveBackEnd`** (le lanceur `eve.cmd` ou VS Code), une fois la copie du code faite (section 7 du fichier de mission). La session principale continue en parallèle sur la branche ESG : les deux ne se marchent pas dessus parce que chacune n'écrit que dans son périmètre, dit ci dessous.

```text
Reprends EVE pour une session dédiée. Lis dans cet ordre, en entier, et ne lis rien d'autre avant d'avoir fini :
chantiers/PLAN.md, chantiers/_missions/2026-09-21-vision-melvyn-et-reunion-du-22-09.md,
chantiers/_externe/LISEZMOI.md.

Chantier : 2026-09-21-existant-providers-demain, à ouvrir par /chantier, niveau standard, lecture seule :
aucune ligne n'entre dans le dépôt EVE, aucune branche. Une autre session (la principale) tient en même
temps la branche features/melvyn/esgRatingLastModif, git, PLAN.md, INDEX.md et la mémoire : tu n'y touches
pas, tu n'écris aucune mémoire. Tu écris seulement dans chantiers/2026-09-21-existant-providers-demain/
et dans CONTEXT.md (glossaire, par domain-modeling : PMS Tracker, API interne entre les bases de Tracker
et BDFG, infocentre, façade, données froides et chaudes, DEMAIN, l'application de Gaëtan).

Etat : demain 22/09 à 15 h, en visio, Melvyn présente à Edmond (la data d'EVE), Alice (gérante, le
métier) et Gaëtan (auteur de l'application actuelle) ce que fait aujourd'hui l'application de Gaëtan
entre les fichiers providers et DEMAIN, provider par provider : calculs et regroupements métier, JSON
produits, URL et appels curl vers DEMAIN, et comment les données entrent dans DEMAIN. Puis sa vision :
les utilisateurs déposent dans EVE, EVE valide et stocke, EVE envoie à DEMAIN par sa propre API. Le code
de l'application est en copie de lecture dans chantiers/_externe/esg-demain-scripts/ (copié par Melvyn
depuis F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts\, code seul ; l'inventaire du dossier source est
dans _inventaire-source.txt). Le partage F: ne se lit jamais ; les fichiers de données jamais ; aucune
valeur de donnée ne sort, même si un script en contient.

Premiere action, une seule : ouvre le chantier par /chantier existant-providers-demain et, dans le
brainstorm, pose à Melvyn une seule question groupée : (1) le second chemin de code qu'il a évoqué,
(2) la forme du support (page HTML autonome projetable en visio, recommandée ; Word ou PowerPoint
sinon), (3) ce qu'il attend de la réunion (garder ou jeter par traitement, valider le principe de
l'interface EVE, les deux), (4) s'il manque des fichiers dans la copie d'après l'inventaire (un JSON de
configuration, par exemple). Sans attendre sa réponse, lance le travail sur la copie.

Ensuite : deux chercheur-eve en lecture seule sur la copie, un axe chacun (les traitements métier par
provider ; l'envoi vers DEMAIN : URL, format JSON, authentification, ordre des appels), rapports bruts
dans agents/, chaque fait revérifié par toi au grep avant reprise. Livrables, dans le dossier du
chantier : grille.md (une ligne par provider et par traitement, sourcée fichier et ligne) ;
support-reunion-2026-09-22.html (page autonome, fond clair, sans tiret typographique ; invoquer dataviz
puis impeccable avant d'écrire une ligne de HTML) ; vision.md (pourquoi une interface EVE, le flux cible
utilisateur vers EVE puis EVE vers DEMAIN, le schéma _missions/2026-09-21-scenario-3-facade-infocentre-pms.png
avec sa correction : Tracker est le PMS, l'API entre ses bases et BDFG est interne) ; questions-reunion.md
(ce qu'il faut trancher demain, dont le mode de dépôt : manuel, répertoire surveillé, récupération
automatique). Relecture du support par redacteur-eve (style, aucune valeur de donnée) et par un
relecteur-eve sur l'axe niveau de preuve (chaque affirmation sur le code renvoie à un fichier et une
ligne). Tout doit être prêt pour la relecture de Melvyn le 22/09 à 13 h.

Garde-fous propres à cette session : les rapports d'agents ne montent pas au chat tels quels ; au plus
trois messages à Melvyn entre son ordre et le bloc jalon ; quand une façon de faire de Gaëtan paraît
perfectible, chercher d'abord pourquoi ils l'ont faite ainsi (elle tourne en production depuis trois
ans) ; aucune exécution du code copié ; /fin-session avec handoff dans le dossier du chantier, et la
ligne d'INDEX.md et de PLAN.md à mettre à jour est dite dans le handoff, pas écrite par toi.
```
