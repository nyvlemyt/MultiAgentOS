---
status: accepted
date: 2026-09-16
decideur: le fil, par délégation de Melvyn du 16/09/2026 (mémoire `feedback-arbitrages-delegues`)
chantier: chantiers/2026-09-15-mini-entreprise-agents
---

# `.env` devient une zone protégée en écriture, et les onze arbitrages du lot 2a

Décisions prises dans la nuit du 16/09/2026, en mode autonome. Melvyn a délégué les arbitrages techniques le 16/09 au soir : les choix se prennent ici, avec leurs alternatives écartées, et il les relit au matin. Aucun n'exige sa main ; aucun ne touche un fichier suivi par git.

Source de la règle : `C:\dev\maos\CLAUDE.md` section 5, « Any write to `.env*`, secrets files, keystores », lue à la source le 16/09/2026. MAOS met ces écritures derrière un clic humain. Les hooks d'EVE n'ont pas de clic humain : leur contrat est `exit 2` (refus) ou `exit 0` (autorisé). La traduction EVE est donc le refus, et le recours est la main de Melvyn dans VS Code, comme pour `push --force`.

## Ce qui a motivé la décision

Sonde du 16/09 : aucun verrou ne refusait l'écriture sur `.env` ni `.env.dev1`, par aucun moyen. `.env` porte `DB_CONFIG`, n'est pas suivi par git, et une bascule vers `EveDev` ferait tourner `manage.py test` sur le serveur partagé, ce que `donnees.md` interdit sans exception. La seule barrière était une clause en prose de la fiche `developpeur-eve`, et le lot 1a a établi que ces clauses ne refusent rien.

## Les onze arbitrages, et leurs alternatives écartées

| # | Question | Choix | Alternative écartée, et pourquoi |
| --- | --- | --- | --- |
| 1 | Quel verrou porte la règle ? | `garde_perimetre` | `garde_donnees` : il refuse en lecture **et** en écriture, or la lecture de `.env` doit rester ouverte (`donnees.md`, secrets masqués). |
| 2 | Corriger `_lib._ressemble_a_un_chemin`, qui rejette tout token commençant par un point ? | **non**, collecte séparée dans `garde_perimetre` | Corriger `_lib` : il est partagé avec `garde_donnees` par `extraire_chemins_commande`. Un effet de bord non borné sur un second verrou, pour un besoin qui tient dans un seul. |
| 3 | Quel motif de nom ? | nom de fichier commençant par `.env`, après normalisation (donc insensible à la casse et aux formes Windows et Git Bash) | Une liste fermée (`.env`, `.env.dev1`) : elle raterait `.env.local`, `.env.bak` et tout nom futur. C'est le motif `.env*` de MAOS. |
| 4 | La suppression ? | refusée comme l'écriture | Ne viser que l'écriture : `rm .env` détruit autant qu'une réécriture, et rien dans git ne le rend. |
| 5 | Les interpréteurs (`python -c`, script du dépôt) ? | motif **ancré**, cherché dans le texte de la sous-commande | Le nom de fichier du token : le nom vit **à l'intérieur** d'un token, jamais seul, donc ce choix ratait le cas. Une recherche en sous-chaîne non ancrée : elle refuserait `os.environ`, `config.env` et `.venv`, qui sont des lectures ou ne sont pas des `.env`. |
| 6 | Quels verbes ? | trois familles : écrit ou détruit toutes ses cibles ; copie, où seule la destination compte ; interprète | Une famille unique sur tous les tokens : elle refuserait `cp .env sauvegarde`, qui est une **lecture** légitime (sauvegarder avant que Melvyn édite). |
| 7 | Quel message, quand la zone protégée et le périmètre s'appliquent tous deux ? | zone protégée d'abord | « Hors périmètre » d'abord : ce serait vrai mais trompeur, en laissant croire qu'il suffit de déplacer le fichier dans le projet pour pouvoir l'écrire. |
| 8 | Où va la sonde de `doctor` ? | dans `autotests()` | Dans `verifications()` : elle ferait passer le compte à 14 et casserait le critère « 13 OK » à chaque ajout de contrôle. `autotests()` est la section des sondes de hooks, faite pour ça. |
| 9 | Qui édite un fichier qui est lui-même la barrière ? | **le fil**, jamais un agent | `developpeur-eve` : l'argument « il modifierait sa propre cage » est **faux**, l'attaque l'a montré (les hooks sont relancés du disque à chaque appel, et le fil y est soumis pareillement). Le vrai motif tient en deux points : ce que le fil écrit, Melvyn le relit dans VS Code avec tout le contexte, alors qu'un agent n'a pour trace que son propre rapport ; et un hook qui **plante** (`exit 1`) n'arrête plus rien, sans que rien ne le dise. Règle bornée : elle vise les fichiers qui **sont** la barrière (`garde_*.py`, `_lib.py`, `settings.json`), pas les agents en général. |
| 10 | Qui écrit le fichier de verdict de la vérification indépendante ? | le fil, à partir du rapport brut déposé | L'agent lui-même : `relecteur-eve` déclare `tools: Read, Grep, Glob, Bash` et sa fiche dit qu'il n'écrit jamais. Lui demander d'écrire l'obligerait à contourner sa propre fiche par une redirection. La règle MAOS « lire le fichier du verdict, pas le retour du chat » est tenue autrement : rapport brut déposé tel quel dans `agents/`, puis **chaque commande relancée de ma main**. |
| 11 | La référence du manifeste d'empreintes, pendant une session autonome ? | **figée** à l'état de début de session | La reprendre après chaque point de contrôle, comme le prévoit le handoff : la commande a été refusée par le classifieur du mode automatique (motif « altération de journal d'audit »), refus non contourné. La règle adoptée est plus stricte : la liste des écarts doit être **exactement** celle des fichiers déclarés, sinon le lot s'arrête. |

## Ce que la décision coûte, et qui est assumé

- **Lire `.env` par un `python -c` devient refusé.** Le recours est `cat`, `grep` ou l'outil `Read`, qui restent ouverts. C'est le prix du choix 5 : le même mécanisme qui attrape un script qui écrit attrape un script qui lit.
- **Un faux positif sur les comptes rendus.** `_lib.decouper_commande` coupe sur les sauts de ligne : dans un document en ligne, chaque ligne du texte écrit devient une sous-commande. Une ligne de journal qui commence par un verbe d'écriture et cite le nom du fichier protégé est lue comme une vraie écriture. C'est arrivé à la première minute, sur le journal de ce lot. Contournement : reformuler, ou écrire le bloc dans le scratchpad puis le concaténer.
- **Deux contournements restent ouverts, écrits et non traités** : un chemin caché derrière une variable de shell (`D=.env` puis une redirection vers `$D`), et un programme qui écrit sans appartenir aux trois familles. C'est la limite déjà inscrite dans la docstring du verrou : il borne les erreurs franches, pas la mauvaise foi.
- **Le trou de la base partagée est rétréci, pas fermé** : `DB_CONFIG=... python manage.py test` en ligne de commande reste libre, aucun hook ne regarde `manage.py`.

## Verrouillage

Fait dans le lot : `garde_perimetre.py` (`PREFIXE_PROTEGE`, `_zone_protegee`, `_cibles_protegees`), quatorze cas de test dans `ZoneProtegeeEnEcritureTests`, une sonde dans `doctor.autotests()`, et la règle plus son recours écrits dans `.claude/rules/securite.md`, `.claude/README.md`, `CLAUDE.md` et la fiche `developpeur-eve`.

Ce qui ferait rouvrir cette fiche : un besoin légitime et répété d'écrire un `.env` depuis l'assistant (il n'en existe aucun aujourd'hui), ou un faux positif qui gênerait le travail courant plus d'une fois par session.
