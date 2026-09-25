# Cadre d'utilisation de l'assistant de code sur EVE

Rédigé par Melvyn le 08/09/2026, pour Edmond. Ce document décrit comment l'assistant Claude Code est utilisé sur le dépôt EveBackEnd, ce qu'il lui est interdit de faire, et ce qui est vérifié par un humain avant qu'une ligne n'entre dans le dépôt.

## Le principe

L'assistant est utilisé comme un développeur expérimenté qui reprend un projet qu'il n'a pas écrit. Il respecte l'existant, il change peu, il prouve ce qu'il affirme, et il ne fait rien de plus que ce qui lui est demandé. Le code qu'il produit est lu et compris par moi avant tout commit. Aucun commit, aucun push, aucune PR ne part sans que je l'aie décidé explicitement, après relecture dans VS Code.

## Ce qui est interdit mécaniquement

Quatre verrous s'exécutent avant chaque action de l'assistant et la refusent si elle sort du cadre. Ils sont testés (une trentaine de tests unitaires) et leur état s'affiche au démarrage de chaque session.

1. Données. L'assistant ne lit jamais le contenu des fichiers des providers (dossiers Providers, Archives Tania, tmp_uploads, data_import_files, partage F:), ni aucun fichier csv, xlsx ou parquet qui n'est pas un document identifié. Il peut lister des noms et des tailles. Il n'affiche jamais une valeur ligne à ligne d'une base (ISIN, émetteur, montant), seulement des comptages et des agrégats. Le token API n'est jamais lu.
2. Git. Aucune écriture sur develop, master ou test1. Push uniquement sur mes branches features/melvyn/*. Jamais de push force, de reset hard, de clean, de suppression de branche ou de stash, jamais de commit amend ni de contournement des hooks. Les commits suivent la convention du dépôt et portent mon seul nom.
3. Périmètre. L'assistant n'écrit que dans le dossier EveBackEnd (et dans ses propres fichiers de travail, exclus du dépôt). Il ne touche ni aux autres dépôts, ni au poste, ni aux fichiers de C:\dev\Eve.
4. Forme. Après chaque écriture, un contrôle refuse les traces d'assistant : tirets typographiques, guillemets courbes dans le code, caractères invisibles, emojis dans le code, fins de ligne changées (le dépôt est en CRLF), espaces en fin de ligne, formules de remplissage, marqueurs de travail non terminé.

Tout ce dispositif est local à mon poste et exclu du dépôt via .git/info/exclude. Le dépôt partagé n'est pas modifié par sa mise en place.

## Ce qui est vérifié avant qu'un changement soit proposé

Chaque sujet est un chantier avec un dossier de travail (spécification, plan, journal des commandes lancées et de leurs résultats, revue, description de PR). Le déroulé est fixe et je valide à sept moments : la spécification, le plan, le diff dans VS Code, le résultat de la gate, les findings de la revue et ce qui en a été fait, un quiz de cinq questions sur le changement, et la description de PR.

La gate compare le code aux outils du poste (ruff, pyright en mode basic) par rapport à develop : seuls les problèmes nouveaux bloquent, les problèmes préexistants du dépôt sont listés sans être corrigés en douce. Elle lance la suite de tests complète sur une base sqlite en mémoire, jamais sur EveDev, et mesure la couverture des fichiers touchés. La revue est faite par des agents relecteurs en lecture seule sur trois axes (conventions du dépôt, conformité à la spécification, robustesse et tests), chaque finding étant ensuite vérifié de façon contradictoire avant d'être retenu. Pour les sujets structurants (schéma, modèle, migration, API, authentification, upload), deux propositions de conception sont mises en concurrence et la décision est écrite dans une fiche.

Le quiz est la mesure que je juge la plus importante : rien ne part que je ne sache expliquer. Une page pédagogique est générée à partir du diff, avec cinq questions, et j'y réponds avant de proposer la PR.

## Ce qui est tracé

Pour chaque chantier : la spécification validée, le plan, le journal (décisions, commandes et sorties, ce qui n'a pas été fait et pourquoi, constats hors périmètre), la revue avec un guide de lecture du diff, la description de PR avec les vérifications et leurs résultats, une fiche par décision structurante. La description de PR qui arrive sur Azure DevOps contient le contexte, les changements fichier par fichier, les vérifications avec leurs sorties, les risques, ce qui est hors périmètre et les points à trancher.

## Ce que ça ne garantit pas

Le dispositif empêche des classes d'erreurs connues et rend visibles les autres. Il ne remplace ni ma relecture ni la tienne en PR, et c'est voulu : les deux restent obligatoires. Les outils du poste (ruff, pyright, coverage) ne sont pas ajoutés à requirements.txt : c'est une décision qui te revient, je te la proposerai avec l'audit.

## Sources

Le dossier .claude du poste (règles, verrous, tests, manuel), le chantier chantiers/2026-09-08-init-claude-eve (spécification et journal), les tests d'Edmond du dépôt (data/tests) qui ont servi de modèle pour le style des tests.
