# Qualité : comment j'écris et je vérifie

EVE est fait pour durer. Le niveau visé est celui d'un développeur expérimenté qui reprend un projet qu'il n'a pas écrit : il respecte ce qui existe, il change peu, il prouve ce qu'il affirme.

## Avant d'écrire

- Chercher le motif existant et le suivre : la déclaration `Field(...)` des schémas pandera, les `cls: type["X"]`, les docstrings narratives des tests d'Edmond, les modèles `null=True, blank=True`. Une nouvelle façon de faire se propose, elle ne s'introduit pas en douce.
- Rechercher et réutiliser avant de créer : le dépôt, sa documentation, `CONTEXT.md`, puis les bibliothèques déjà présentes. Toute dépendance nouvelle se demande à Melvyn, s'épingle en version et s'inscrit au REGISTRE.
- **Quand une idée vient d'ailleurs, on porte le motif, jamais le code, et on cite la source en tête.** Rien ne se recopie depuis `C:\dev\maos`, un dépôt public ou un skill vendu : on lit à la source, on comprend pourquoi ça marche là-bas, on réécrit au format d'EVE, et la première ligne du fichier dit d'où vient l'idée (chemin exact, date de lecture). Motif : une reprise littérale emporte des hypothèses qui ne sont pas les nôtres (un runtime, une base de données, une autre convention de commit), et personne ne sait plus, six mois après, ce qui était pensé pour EVE et ce qui a été collé. Une source citée est aussi ce qui permet de **ré-auditer** : la version EVE d'aujourd'hui se compare à l'originale de demain.
- Le plus petit diff qui résout le problème. Pas de « tant qu'on y est » : ce que je remarque en chemin va dans les constats hors périmètre du journal, proposé, jamais fait.
- Un changement de champ se vérifie sur toute la chaîne : schéma pandera, modèle Django, migration, `documentation\`, tests. C'est la famille d'incohérence la plus fréquente du dépôt (`case_end_date`, `controversy_case_score`).
- Niveau de rigueur décidé à l'entrée (léger, standard, structurant, voir `CLAUDE.md`), jamais revu à la baisse en cours de route.

## En écrivant

- Fins de ligne : le dépôt est en CRLF. Éditions ciblées (outil Edit ou remplacement binaire), jamais de réécriture complète d'un fichier suivi.
- Commentaires pour le pourquoi, à la densité du fichier, dans la langue du fichier (code et docstrings en anglais, comme le dépôt). Aucun marqueur d'assistant, aucun emoji dans le code, aucun tiret typographique, aucun caractère caché (largeur nulle, espace insécable, sélecteur, homoglyphe, contrôle). Le verrou `verif_style.py` le vérifie à chaque écriture ; `nettoyer_caracteres.py` purge un fichier sur demande de Melvyn.
- Type hints sur toutes les signatures, comme le code existant. Jamais de `# type: ignore` nu.
- Erreurs explicites, aucun échec silencieux, validation aux frontières (pandera y est déjà).
- Documentation mise à jour dans le même chantier quand un comportement, un contrat ou un workflow change, dans la langue et le style du fichier touché.

## Tests

- TDD pour toute logique nouvelle : test rouge, implémentation minimale, test vert. Les tests se placent au niveau des interfaces publiques (endpoints, fonctions de schéma), pas des détails internes.
- Un changement de champ se prouve d'abord là où il agit : à l'insertion (`data/tests/e2e/test_insert_data.py` : type stocké, sentinelles en NULL, format non couvert), puis aux contrats aval (export DEMAIN, export last, rapport qualité). Retour d'Edmond du 14/09/2026.
- Arrange, Act, Assert ; nommés par le comportement (`test_a_missing_date_keeps_its_row_with_no_age`), comme la suite existante.
- Ni test tautologique (qui recalcule l'attendu comme le code) ni test couplé à l'implémentation. Un test de caractérisation d'un défaut connu se marque `known_defect`, comme dans le dépôt.
- La suite complète tourne sur sqlite en mémoire, `DB_CONFIG` forcé. Elle ne touche jamais EveDev.

## Avant de dire « c'est fait »

- `/gate` : PASS montré avec sa sortie, jamais raconté. Seuls les findings nouveaux bloquent ; les 35 findings ruff préexistants du dépôt ne sont pas à moi.
- Seuils en avertissement : fonction < 50 lignes, fichier < 800, imbrication <= 4. Le dépôt a un fichier de 6 092 lignes : on le signale, on ne le découpe pas sans décision.
- Chaque affirmation de réussite cite la commande et sa sortie. Ce qui n'a pas été vérifié est dit non vérifié.
