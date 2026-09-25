# Intake : skills de design frontend (dataviz, impeccable, et trois non lus)

Grille : `.claude/skills/REGISTRE.md`, procedure d'ajout. Ecrit le 17/09/2026 par le fil, apres que
Melvyn a signale qu'un schema HTML livre le jour meme (schema de la base EVE) etait rate visuellement
(couleurs, carre, police, look generique), sans qu'aucun skill de design n'ait ete invoque avant de
l'ecrire. Cinq skills de design sont deja presents dans la liste des skills disponibles de ce poste :
`dataviz`, `impeccable`, `ui-ux-pro-max`, `web-design-guidelines`, `design-md`. Aucun n'a de ligne dans
`REGISTRE.md` : ce dossier ouvre l'examen, il ne le termine pas pour les trois derniers.

## 0. Contraintes dures

Aucune ne rejette d'office pour `dataviz` et `impeccable` sur ce qui a ete lu : pas de cle API, pas de
reseau constate dans les fichiers lus, pas de code execute (le script `validate_palette.js` de dataviz et
`context.mjs` d'impeccable existent mais n'ont pas ete lances). Point de vigilance : `impeccable` sait
ecrire des fichiers de configuration persistants dans le projet (`PRODUCT.md`, `DESIGN.md`, un hook) via
son setup : cette machinerie n'a pas ete invoquee ici, volontairement (voir decision).

Pour `ui-ux-pro-max`, `web-design-guidelines`, `design-md` : aucune contrainte dure evaluee, ces skills
n'ont pas ete ouverts.

## 1. Identite

- `dataviz` : skill fourni avec le poste (repertoire `bundled-skills`, version d'installation 2.1.274),
  chemin `D:\Users\mpommier.BDF-GESTION.000\AppData\Local\Temp\claude\bundled-skills\2.1.274\...\dataviz`.
  Lu le 17/09/2026 : `SKILL.md`, `references/palette.md`, `references/marks-and-anatomy.md`. Non lus :
  `choosing-a-form.md`, `color-formula.md`, `interaction.md`, `components.md`, `anti-patterns.md`,
  `scripts/validate_palette.js`.
- `impeccable` : installe au niveau utilisateur, `D:\Users\mpommier.BDF-GESTION.000\.claude\skills\impeccable`.
  Lu le 17/09/2026 : `SKILL.md`, `reference/craft-floor.md`. Non lus : la vingtaine d'autres fichiers de
  `reference/` (`new-work.md`, `operate.md`, `polish.md`, `critique.md`, `audit.md`, etc.), `scripts/context.mjs`,
  `scripts/pin.mjs`.
- `ui-ux-pro-max`, `web-design-guidelines`, `design-md` : identifies uniquement par leur description dans
  la liste des skills disponibles. Aucun fichier ouvert.

## 2. Ce que ca ameliore, concretement

Le probleme concret : `chantiers/2026-09-15-mini-entreprise-agents/dashboard.html` et le brouillon de
schema de base (hors chantier, `schema-eve-draft.html`) sont ecrits en CSS a la main, sans reference a un
systeme de couleurs valide ni a des regles de mise en page. Resultat nomme par Melvyn : cartes carrees
identiques, bordure coloree a gauche, ligne de chiffres en tuiles, police systeme par defaut. Ce sont
exactement les quatre motifs que `impeccable/reference/craft-floor.md` liste comme des defauts a eviter
(« same-size cards », « colored border-left above 1px », « hero-metric template », « system sans as
display face »).

Ce que `dataviz` apporte : une palette categorielle a huit teintes validee (contraste, daltonisme) dans
`references/palette.md`, et des specifications de forme (`marks-and-anatomy.md`) pour les tuiles de
chiffres et les indicateurs, au lieu de couleurs choisies a l'oeil.

Ce que `impeccable` apporte : un vocabulaire de mode (Persuade / Operate / Read) qui aurait evite de traiter
un schema de lecture comme un tableau de bord d'application, et une liste de bannissements concrets
(`craft-floor.md`) directement applicable a toute page HTML produite pour un chantier.

Qui couvrait deja la fonction : personne. Aucune regle d'EVE (`qualite.md`, `communication.md`) ne dit
comment choisir une couleur ou une police pour un artefact HTML ; `communication.md` demande seulement
« fond clair, sans tiret typographique ».

## 3. Les trois couts

| Cout | Reponse |
| --- | --- |
| Installation | `dataviz` et `impeccable` sont deja presents sur le poste (pas d'installation a faire). Le cout reel est la lecture integrale restante : cinq fichiers de reference pour `dataviz`, une vingtaine pour `impeccable`. |
| Maintien | aucun fichier EVE ne depend de ces skills pour fonctionner (ce sont des references consultees a la demande) ; le risque est que `impeccable` cree `PRODUCT.md`/`DESIGN.md`/un hook si son setup complet est lance un jour sans decision explicite |
| Retrait | total et immediat pour l'usage fait ici : aucune trace n'est laissee dans le depot par la simple invocation du skill. Si le setup complet d'`impeccable` est utilise plus tard, son propre `doctor` et son retrait manuel devront etre verifies |

## 4. Lecture integrale et assainissement

**Non terminee.** Ce dossier documente une lecture partielle, suffisante pour corriger un artefact precis,
pas l'audit complet exige par la procedure avant adoption definitive. Aucun appel reseau ni identifiant
n'a ete vu dans les fichiers lus. Aucun script (`validate_palette.js`, `context.mjs`, `pin.mjs`) n'a ete
execute : c'est une decision, pas un oubli, tant que la lecture integrale n'est pas faite.

## 5. Decision

**`adapter`, provisoire, pour `dataviz` et `impeccable`** : la lentille (palette validee, specs de tuiles,
vocabulaire de mode, liste de bannissements) est adoptee pour le schema de base livre aujourd'hui. La
machinerie (`validate_palette.js`, tout le flux `context.mjs` / `PRODUCT.md` / `DESIGN.md` / hook
d'impeccable) n'est **pas** adoptee : elle attend la lecture integrale et une decision explicite dans la
mission dediee que Melvyn a demandee.

**Mise a jour du 17/09/2026, apres demande explicite de Melvyn : `ui-ux-pro-max` passe a `adopte`.** Les
quatre scripts d'execution (`core.py`, `search.py`, `design_system.py`, `reasoning_contract.py`, 4 025
lignes) ont ete relus par recherche ciblee (`requests`, `urllib`, `socket`, `subprocess`, `os.system`,
`eval`, `exec`, chemins de profil, `password`/`secret`/`api_key`) : aucun appel reseau, aucun identifiant,
un seul homonyme sans rapport (nom de fonction `_stack_query_requests_legacy`). Les usages de mots comme
`password` ou une URL Google Fonts sont des donnees de classification ou de validation de provenance, pas
des appels sortants. `scripts/tests/` (10 fichiers, fixtures, 292 Ko) et `scripts/validate_data.py`
(maintenance du catalogue) sont retires du dossier vendu, non necessaires a une simple interrogation.
Les fichiers de donnees (`data/*.csv`, `*.json`, 192 palettes, 74 typographies, etc.) n'ont pas ete relus
ligne a ligne : `garde_donnees` refuse la lecture directe d'un `.csv`, et la revue de securite porte sur
le code qui les consomme (fait), pas sur le contenu editorial des tableaux (juge hors risque : palettes de
couleur, paires de polices, checklists UX). Vendu dans `.claude/skills/ui-ux-pro-max/` avec un bandeau de
source en tete de `SKILL.md` et le chemin d'invocation corrige (`$CLAUDE_PROJECT_DIR` au lieu de
`${CLAUDE_PLUGIN_ROOT}`, qui n'a pas de sens hors installation par marketplace).

Doublon avec `dataviz` sur les graphiques : **tranche**, pas cumule sans role. `dataviz` reste la
reference pour la couleur de series de donnees (palette validee daltonisme/contraste, specs de marks) ;
`ui-ux-pro-max` sert au style produit, a la palette/typographie generale et a sortir d'un rendu par defaut
trop generique. Les deux se consultent, aucun ne remplace l'autre.

**`veille` pour `web-design-guidelines` et `design-md`** : preuve nulle aujourd'hui (rien lu), non
demandes par Melvyn pour l'instant. `design-md` vise les projets Stitch, qu'EVE n'utilise pas : signal de
rejet probable, a confirmer en l'ouvrant si jamais demande.

## 7. Ce qui devient la version EVE

Pour l'instant, rien n'est copie ni reecrit : les deux skills sont utilises tels quels, en lecture, pour un
artefact ponctuel. Si la mission les adopte pour de bon, la regle habituelle s'applique (motif porte, pas
la machinerie non epinglee, bandeau anti-injection en tete si du contenu est repris).

## 8. Plan d'integration propose, et re-audit

Chantier cible : une mission dediee (« audit et ajout design frontend »), distincte du lot en cours,
couvrant : lecture integrale des cinq skills, decision ferme skill par skill, doublon `dataviz` /
`ui-ux-pro-max` a trancher, et si `impeccable` est retenu au-dela du simple usage en lecture, decision
explicite sur l'activation de son hook et la creation de `PRODUCT.md`/`DESIGN.md` (impact perimetre a
verifier avec `garde_perimetre`). Ne pas faire : lancer le setup complet d'`impeccable` ou son hook sans
cette decision.

Re-audit : avant tout usage de ces skills au-dela d'un artefact HTML ponctuel, et dans tous les cas avant
2026-12.
