---
status: accepted
date: 2026-09-17
decideur: le fil, par délégation de Melvyn du 16/09/2026 (mémoire `feedback-arbitrages-delegues`) ; Melvyn a demandé le 17/09 au matin de « bien reprendre » (plan, modules, tests avant, motif, puis code)
chantier: chantiers/2026-09-15-mini-entreprise-agents
---

# Refondation des verrous de commande : un scanner, une table, deux fonctions

## Ce qui a motivé la décision

La nuit du 16 au 17/09 a produit cinq régressions et six verdicts non PASS sur les verrous, pour une cause unique nommée par la revue de clôture (`revue-lot-2b1.md`, finding 3) : « quel programme est lancé » est écrit trois fois (`_lib._index_du_shell`, `garde_perimetre._programmes_invoques`, `garde_git._arguments_git`) et « ce qu'un programme écrit » deux fois (`_cibles_ecriture`, `_cibles_protegees`). Chaque correctif fermait un trou dans un exemplaire et le laissait dans les autres. Le 17/09 au matin, deux lectures légitimes ont été refusées à cause d'un repli silencieux du découpeur (`shlex` échoue, `commande.split()` prend le relais et fabrique une cible `/dev/null;`). Melvyn : « une correction implique une autre erreur, ça prouve que tu as mal commencé ».

## Les deux propositions, et le choix

Deux `architecte-eve` ont reçu le même brief (spec `design-lot-3.md`, corpus de 262 cas écrit avant le code, les quatre fichiers de verrous, `path-guard.ts` de MAOS en lecture) avec deux contraintes opposées. Rapports bruts : `agents/2026-09-17-architecte-eve-A-scanner-table.md`, `agents/2026-09-17-architecte-eve-B-objets-registre.md`.

| Critère | A : scanner maison, table `_programmes.py`, deux fonctions | B : objets, registre de familles, lexeur substituable (`shlex` POSIX après retrait des documents) |
| --- | --- | --- |
| Cohérence avec `.claude/hooks/` (frozensets, NamedTuple, fonctions) | 4 | 3 (Protocol et sous-classes, style absent des hooks) |
| Rayon d'impact | 3 | 3 |
| Réversibilité | 4 | 4 |
| Testabilité | 5 | 5 |
| Effort | 2 | 2 |
| **Tient le corpus sans repli ?** | **oui** : le scanner garde les antislashs Windows et les quotes en milieu de token | **non tel quel** : `shlex` POSIX rend `rm C:\dev\maos\x.md` en `rm C:devmaosx.md`, chemin relatif donc **dans le projet** (sonde de ma main, `scratchpad/sonde_shlex2.py`) |

**Choix : A**, pour la dernière ligne, qui est un trou et non un style. Vérifié de ma main : les deux modes de `shlex` échouent chacun sur une forme du corpus (non POSIX : `--format='%(x) %(y)'`, here-string `@' '@` ; POSIX : heredoc à apostrophe, antislashs nus). Aucun réglage ne tient sans repli, et le repli est ce qu'on supprime.

**Deux greffes de B**, retenues parce qu'elles corrigent A sur un point du contrat :

1. Un troisième mode d'accès, `META`, pour les programmes qui ne lisent que des métadonnées (`ls`, `stat`, `Get-ChildItem`...) : `garde_donnees` doit refuser `ls -la token_api.txt` et laisser passer `ls -la C:/dev/Eve/Providers`. A ne rendait rien pour eux, ce qui perdait le premier cas. Le mode `DETRUIT` de B n'est pas repris : aucun cas du corpus ne distingue détruire d'écrire ; `origine` porte le verbe pour le message.
2. La règle d'or de B sur les documents en ligne, adoptée en toutes lettres : « le corps d'un document est du texte, sauf s'il alimente un shell ou un interprète ».

**Écarté de B** : le port `Lexeur` avec deux adaptateurs Bash et PowerShell. Un seul scanner traite les deux, avec un drapeau de mode (en PowerShell l'accent grave échappe, la here-string est `@' '@`) : une seam à un adaptateur est une indirection (`codebase-design`).

## Arbitrages pris avec la décision

| # | Question | Choix | Alternative écartée |
| --- | --- | --- | --- |
| 1 | Où vit le savoir sur les programmes ? | un fichier de données pur, `_programmes.py`, sans fonction ni import, lu par `_commande` et `_effets` | dans `_effets` : `_commande` a besoin des enveloppes et des shells, donc un cycle ou une duplication |
| 2 | `find` | ses cibles sont son point de départ **et** les valeurs de `-name`, `-iname`, `-path` quand une action détruit (`-delete`, `-exec rm`) | « le point de départ seul » (spec r1) : `find . -name '.env' -delete` passait, contradiction trouvée par l'attaque |
| 3 | `git` côté effets | `git rm` (sans `--cached`), `git mv`, `git clean` écrivent leurs cibles ; les autres sous-commandes sont `META` | `git` tout `META` : `git rm .env` détruisait le fichier sans que la zone protégée le voie |
| 4 | `cd` | l'analyse suit `cd <dossier>` et résout les chemins relatifs des invocations suivantes contre ce dossier | ignorer : `cd C:/dev/maos && rm CLAUDE.md` passait |
| 5 | `-EncodedCommand` | toute option qui est un préfixe de `-encodedcommand` à partir de `-e`, plus `-ec` | la forme longue seule : PowerShell accepte les préfixes |
| 6 | Qui écrit le code ? | le fil (fichiers qui **sont** la barrière, `_decisions/0010` arbitrage 9) | `developpeur-eve` |
| 7 | Plan attaqué avant l'exécution ? | oui, un `relecteur-eve` sur l'axe enchaînement, pendant que le module 1 (scanner), sans dépendance, commence | attendre : le scanner n'a aucun appelant, son écriture ne préjuge de rien |

## Ce que la décision coûte, et qui est assumé

- Un scanner maison d'environ 150 lignes, le seul code délicat : ses défauts propres sont bornés par le corpus et par la vérification contradictoire (un relecteur qui fabrique ses entrées).
- Une quinzaine de tests en place couplés à des fonctions internes qui disparaissent (`decouper_commande`, `premier_mot`, `_programmes_invoques`, `_cibles_*`, `_arguments_git`) sont réécrits sur `analyser` et `acces` ; leurs attendus ne changent pas.
- Un programme inconnu du catalogue ne produit aucun accès : c'est la limite d'aujourd'hui, elle reste écrite dans `securite.md`.
- Une variable de shell (`$HOME/x`) n'est pas résolue : limite écrite, cas `rm_variable_limite` au corpus.

## Verrouillage

Corpus `corpus_contrat.py` (315 cas au moment de la décision), `test_contrat.py`, copies de départ dans `etat-depart/lot-3/`. Ce qui ferait rouvrir cette fiche : un cas du corpus qu'aucune famille de la table ne peut exprimer sans toucher au scanner, ou un coût de hook mesuré au-dessus de 100 ms sur le corpus entier.
