# Le plan : où on en est, et dans quel ordre on avance

Réécrit le 21/09/2026 au soir, sur le cap de Melvyn (`_missions/2026-09-21-vision-melvyn-et-reunion-du-22-09.md`, validé par lui le même jour), qui remplace le cap d'Edmond du 14/09 (`_missions/2026-09-14-retour-reunion-edmond.md`, `_decisions/0008`). Cette page est la **vue unique** : elle se lit en début de session, avant toute question sur l'état. `INDEX.md` liste les chantiers ; `_decisions/` les décisions ; `_externe/` les copies de lecture de code hors dépôt.

**État au 21/09 au soir.** Deux sessions travaillent en parallèle dans `EveBackEnd` : la **session principale** (S0) tient git, la branche `esgRatingLastModif`, cette page, `INDEX.md` et la mémoire ; la **session dédiée** (S1) prépare la réunion du 22/09 à 15 h et n'écrit que dans son dossier de chantier et `CONTEXT.md`. **La mission 0 est commitée et prouvée** : `65d1576` (merge de `develop` `6cf61db`), `9d53d2a` (les cinq tests), `9a482aa` (second merge, les trois commits d'Edmond, sans conflit) ; `GATE PASS` contre `origin/develop`, 164 tests ; **poussée** le 21/09 vers 19 h (`a5edddf..9a482aa`) ; `/security-review` faite le 21/09, aucune vulnérabilité nouvelle (`securite-2026-09-21.md`) ; `pr.md` réécrit le 21/09 ; **PR `!23` créée** dans la nuit du 21 au 22/09, de la branche vers `develop`, active, Edmond GERARD relecteur obligatoire, aucun conflit. Reste S3, **urgent le 22/09 puisque Edmond est notifié** : explain-diff en révision 3 et quiz, document d'explication pour Edmond, message. Les verrous du poste sont clos et acceptés (`_decisions/0012`) ; la mini entreprise d'agents est en pause avec handoff.

---

## 1. Le cap de Melvyn du 21/09

1. **EVE devient l'infocentre de BDF Gestion** : les données extra-financières qu'elle a déjà, et les données financières à construire, alimentées chaque jour depuis l'API entre les bases du nouveau PMS (**Tracker**) et BDFG, API développée en interne. Les providers alimentent l'extra-financier, Tracker le financier.
2. **Une façade d'API unique** pour les applications internes (CSDR par exemple) : le froid (J-2 et plus) servi par EVE, le chaud (intra-journée) servi par l'API Tracker. Schéma « Scénario 3 » : `_missions/2026-09-21-scenario-3-facade-infocentre-pms.png`. Melvyn penche pour que la façade soit EVE.
3. **L'interface web d'EVE, portée par Melvyn** : dépôt des fichiers providers, suivi des intégrations, statistiques, contrôle qualité affiché, consultation des données, interface d'API, process métier intégrés. Elle reprend le rôle de l'application de Gaëtan.
4. **Le flux cible** : l'utilisateur dépose (à la main, par répertoire surveillé ou par récupération automatique, à trancher), le fichier va dans EVE, EVE valide et stocke, puis EVE envoie à DEMAIN par sa propre API. **Utilisateur vers EVE, EVE vers DEMAIN.**
5. **Les rôles** : Edmond la data d'EVE ; Melvyn l'interface et la satisfaction des utilisateurs ; Gaëtan l'application actuelle ; Alice, gérante, le métier.
6. **La branche ESG d'abord**, comme le voulait Edmond le 14/09 : à finir et à lui remettre pour qu'il la merge lui même.

Ce qui tient du cap d'Edmond : la branche ESG d'abord, DEMAIN lit EVE. Ce qui change : l'application de Gaëtan n'est pas « rebranchée », elle est reprise par l'interface EVE, et ses traitements métier entrent dans EVE après décision ; « EVE ne fait aucun calcul » évolue (Edmond l'avait déjà nuancé le 18/09, `CLAUDE.md` reste à corriger sur ce point). Toujours de côté : `bdfg-core`, le module mail, l'app `integration/`.

---

## 2. Ce qui est établi au 21/09

| Fait | Source |
| --- | --- |
| Branche `features/melvyn/esgRatingLastModif`, `HEAD 9a482aa`, **à jour de `origin/develop` (`b058a29`)**, quatre commits d'avance (`a5edddf`, `65d1576` merge, `9d53d2a` tests, `9a482aa` merge), arbre propre hors deux fichiers non suivis, aucun stash, **poussée le 21/09, distant = local `9a482aa`** | `git push`, `git status -sb`, 21/09 vers 19 h |
| Les trois commits d'Edmond des 11 et 16/09 (`73ba518`, `f49e6ce`, `b058a29`, sur `functions.py` et `choices.py`) sont dans la branche sans conflit ; `makemigrations --check` muet ; `GATE PASS` contre `origin/develop`, 164 tests, 0 finding nouveau | journal du chantier, 21/09 |
| La gate compare par défaut à la branche locale `develop`, restée à `d17cde8` : contre elle, un finding pyright d'Edmond (`df_validated`, `functions.py:359`, commit `73ba518`) passe pour nouveau. Contre `origin/develop`, rien | `gate.py --base origin/develop` |
| `C:\tmp` n'existe pas : la sqlite de `.env` ne peut pas s'ouvrir (`runserver` et `migrate` locaux échoueraient ; la gate force sa propre sqlite) | `makemigrations` du 21/09, `RuntimeWarning` |
| Deux fichiers non suivis à la racine, à ne jamais commiter : `bdfg_equity_controversy_issuer_data_last.xlsx` (export de données, jamais lu) et `schema-eve-draft.html` | `git status`, `ls -la` |
| Le dispositif (`.claude/`, `chantiers/`, `CLAUDE.md`, `CONTEXT.md`, `graphify-out/`) est hors dépôt et sans sauvegarde connue | `.git/info/exclude` lignes 15 à 19 |
| Un arbre de travail périmé : `C:\dev\Eve\EveBackEnd-review`, détaché sur `39e6765` (Tania, 24/07) | `git worktree list` |
| `.env` pointe sur une sqlite locale : les tests ne touchent pas EveDev | `grep DB_CONFIG .env` |
| Sur la VM : pas de SQL Server complet, pas de droits d'administrateur local, mais **LocalDB SQL Server 2025** installé (instance `MSSQLLocalDB` à créer), **SSMS 18** installé, ODBC 17 et 18, `mssql-django 1.6`, `pyodbc 5.2.0` | `SqlLocalDB.exe versions`, `Test-Path`, `Get-OdbcDriver`, `pip show` |
| Aucune migration appliquée sur la base du serveur test1 ; tout l'était sur `EveDev` (Tania y travaillait) | Melvyn, 21/09 |
| Le verrou `garde_donnees` refuse au fil tout accès à `F:`, même un listage | refus du 21/09 sur `Get-ChildItem F:\...` |
| Le site `49153` est hébergé par IIS FastCGI dans `D:\EveBackEnd`, `web.config` porté par la seule branche `test1` ; `test1` = `develop` mergé le 11/09 (`9a0f3b0`) | établi le 14/09 |
| La décision `0004` (isolement des tests) n'est pas tranchée | Melvyn, 14/09 |

---

## 3. Les actions de ta main

Ce que git prouve, je le regarde en début de session ; le reste, je te le demande en une seule question.

| Action | État | Où c'est décrit |
| --- | --- | --- |
| Copier le code de `F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts\` dans `chantiers/_externe/esg-demain-scripts/` et écrire l'inventaire du dossier source | **à faire ce soir**, deux lignes PowerShell | fichier de mission du 21/09, section 7 |
| Lancer la session S1 avec son prompt, dans `EveBackEnd` | **à faire ce soir**, après la copie | `_missions/2026-09-21-prompt-session-S1-existant-providers-demain.md` |
| Donner le second chemin de code évoqué le 21/09 | à faire, S1 le demande | |
| Relire la branche ESG et demander les commits | **fait** le 21/09 (« on peut commit ») : trois commits posés | section 4, S0 |
| Donner le go pour le push de `features/melvyn/esgRatingLastModif` | **fait** le 21/09 (« c'est bon, il faut push »), poussée | section 4, S0 |
| Créer la PR dans Azure DevOps, Edmond relecteur obligatoire, sans complétion automatique | **fait** : PR `!23`, description courte `pr-azure-description.md` (3 679 caractères, limite 4 000), aucun conflit | section 4, S3 |
| Envoyer à Edmond le document d'explication et le message (la PR est publiée, il est notifié) | **à faire le 22/09**, après le reste de S3 | section 4, S3 |
| Ouvrir la session S3 avec le prompt de relance du handoff ESG | **à faire le 22/09**, avant ou après la réunion | `2026-09-08-esg-rating-last-modification/handoff.md` |
| Créer `C:\tmp` (ou changer le chemin de la sqlite dans `.env`) | quand tu veux, avant tout `runserver` local | section 2 |
| Supprimer l'arbre de travail périmé : `git worktree remove C:\dev\Eve\EveBackEnd-review` | quand tu veux, hors de mon périmètre | |
| Déplacer hors du dépôt `bdfg_equity_controversy_issuer_data_last.xlsx` (je ne le lis pas) | quand tu veux | |
| Sauvegarder `.env` et `.env.dev1` hors du dépôt (une ligne dans le handoff mission T) | à faire | `2026-09-15-mini-entreprise-agents/handoff.md` |
| Ajouter `CLAUDE.md` au manifeste d'empreintes | à faire | journal mission T du 17/09 |
| Créer ta base (LocalDB ou dev1), le `.env` correspondant, la base de recette test1 | S2, de ta main sur toutes les écritures | `_missions/cheminement-base-de-test.md` |
| Trancher la décision `0004` (isolement des tests) | S2 | `_decisions/0004` |
| Message et document pour Edmond sur la branche ESG | S3 : le message du 15/09 est à réécrire après les commits | `2026-09-08-esg-rating-last-modification/` |
| Contacter Gaëtan | fait de fait : réunion du 22/09 | |

---

## 4. Les sessions, dans l'ordre

### S0, la session principale (21/09) : le cap, puis la mission 0

Chantier `2026-09-08-esg-rating-last-modification`, niveau structurant (migration). Branche `features/melvyn/esgRatingLastModif`.

| Étape | Quoi | Qui | État et preuve |
| --- | --- | --- | --- |
| 0.a | Récap validé ; cette page, `INDEX.md`, la mémoire réécrits ; `_externe/` et le prompt S1 écrits | moi | **fait** le 21/09 |
| 0.b | Relecture de Melvyn et « on peut commit » | **toi** | **fait** le 21/09 |
| 0.c | Commit 1, le merge : `65d1576` (parents `a5edddf`, `6cf61db`) ; commit 2, les tests : `9d53d2a`, `ISSEquityEsgIssuerData: insertion and export tests for iss_esg_rating_last_modification.` Aucun co-auteur | moi | **fait**, `git log` ; gate PASS 164 tests rejouée juste avant |
| 0.d | Second merge : `git merge --no-edit origin/develop` (`b058a29`) : `9a482aa`, sans conflit ; `makemigrations --check` muet ; `/gate --base origin/develop` PASS, 164 tests, 0 finding nouveau | moi | **fait**, journal du 21/09 |
| 0.e | Push de la branche | moi, sur ta demande explicite | **fait** le 21/09 : `a5edddf..9a482aa`, distant = local |
| 0.f | Corriger `CLAUDE.md` (« aucun calcul financier »), avec `writing-for-agents` | moi | diff montré |

Ensuite S3. Rien de plus dans ce chantier ce soir.

### S1, session dédiée (21/09 au soir) : l'existant entre les providers et DEMAIN

Chantier `2026-09-21-existant-providers-demain`, à ouvrir par `/chantier`, niveau standard, lecture seule, aucune ligne dans le dépôt. Prompt : `_missions/2026-09-21-prompt-session-S1-existant-providers-demain.md`. Code : `_externe/esg-demain-scripts/` (copié par toi). Livrables pour le 22/09 à 13 h : `grille.md` (une ligne par provider et par traitement, sourcée), `support-reunion-2026-09-22.html` (page autonome projetable en visio), `vision.md` (pourquoi une interface EVE, le flux cible, le schéma corrigé), `questions-reunion.md`, glossaire dans `CONTEXT.md`. Agents : deux `chercheur-eve`, un `redacteur-eve`, un `relecteur-eve` niveau de preuve.

### S2 : les bases par environnement

Nouveau chantier à ouvrir par `/chantier`, niveau structurant (bases, `.env`, migrations : `securite.md`). Deux `architecte-eve` sur la question de fond : combien de bases, pour qui, et comment chaque environnement lit sa configuration.

- **Ta base de dev** : LocalDB recommandé (`SqlLocalDB.exe create MSSQLLocalDB`, base créée dans SSMS 18, `DB_CONFIG` vers `(localdb)\MSSQLLocalDB` écrit par toi dans `.env`, `migrate`, `createsuperuser`, token, `runserver`). Alternative : une base à toi sur dev1 (`_missions/cheminement-base-de-test.md`, étapes A et B).
- **La recette test1** : une base neuve sur dev1, migrée depuis zéro, `.env` du site changé par toi ; `develop` y est déployé après le merge d'Edmond. Pas de `migrate` sur la base actuelle de test1 (recommandation, section 6).
- **Le jeu de fichiers de test** : un fichier par provider depuis `C:\dev\Eve\Providers\` (tu confirmes la correspondance dossier vers `data_key`), script de remplissage dans l'ordre des 23 étapes (moi), lancement (toi), vérification par comptages (jamais une ligne).
- La décision `0004` se prend ici.

### S3 : la fin de la mission 0, avant le push

**Fait le 21/09** : push (`9a482aa`), `/security-review` (aucune vulnérabilité nouvelle, `securite-2026-09-21.md`, revérifiée de ma main), `/pr` (`pr.md` réécrit à l'état du 21/09, la version interne complète), **PR `!23` créée par Melvyn** dans la nuit du 21 au 22/09 (description courte `pr-azure-description.md`, la section « À trancher » retirée sur sa remarque : un seul point à confirmer avant merge reste dans la PR, les dates mois avant jour ; les autres questions vont dans le mail). Active, Edmond doit approuver, aucun conflit. **Reste, le 22/09** : page explain-diff en révision 3 et son quiz, document d'explication pour Edmond (`explications/`, Markdown converti en Word), message de remise réécrit ; Edmond approuve et complète le merge. **Session S3 à ouvrir avec le prompt de relance de `2026-09-08-esg-rating-last-modification/handoff.md`.** Puis déploiement de `develop` sur test1 avec la base neuve de S2. Point d'intégrité à jouer en lecture avant tout `migrate` sur une base qui a déjà des données : sur SQL Server, `ALTER COLUMN varchar -> date` échoue sur tout texte non convertible (requête de contrôle dans `pr.md`) ; sans objet sur une base neuve.

### S4 : le cadrage de l'interface web d'EVE

Après la réunion du 22/09. Chantier structurant : `domain-modeling` (les termes du cap), `codebase-design`, deux `architecte-eve` (la façade dans EVE ou à part ; la pile de l'interface), spec, découpage en sous-chantiers (dépôt et suivi des fichiers, qualité en ligne, consultation, explorateur d'API, façade Tracker). Skills de design avant toute ligne de HTML (`dataviz`, `impeccable`, `ui-ux-pro-max`).

### S5, S6, S7

S5 : les traitements métier retenus à la réunion, un chantier par traitement, règle « chercher d'abord pourquoi ils l'ont fait ainsi ». S6 : relier EVE et DEMAIN (`GET /export/demain`, `DEMAIN_eve`, décommissionnement des scripts remplacés). S7 : la partie financière et l'API entre les bases de Tracker et BDFG, horizon.

### S8, idée de Melvyn du 21/09 : son logger de CSDR dans EVE

Dans une **nouvelle branche**, jamais dans `esgRatingLastModif`. À cadrer par `/chantier` (léger ou standard selon l'ampleur), en tenant compte du `logger` qu'Edmond a déjà ajouté dans `data/functions.py` le 11/09 (`f49e6ce`, `logging.getLogger("data.functions")`) : on ne pose pas deux systèmes de journalisation côte à côte sans décision.

### ST : la mini entreprise d'agents, en pause

État dans `2026-09-15-mini-entreprise-agents/handoff.md` et `_decisions/0012`. Reprise (lots 2b tranches 3 et 4, 2d, 2e, puis 1b) quand tu le décides. **Une seule chose n'attend pas** : le dépôt de sauvegarde du dispositif (`.claude/`, `chantiers/`, `CLAUDE.md`, `CONTEXT.md`), petit chantier avec une décision (dépôt à côté avec copie, ou second `git-dir` sur le même arbre) et un dépôt Azure DevOps créé par toi.

---

## 5. Ce qui bloque quoi

```text
S0 : relecture (toi) -> commits 1 et 2 -> second merge + gate -> commit 3 -> S3 : explain-diff, document, PR, push -> Edmond merge
                                                                                                                      |
S1 : copie du code (toi) -> analyse -> support 22/09 13 h -> reunion 15 h -> decisions -> S4 interface -> S5 traitements -> S6 EVE vers DEMAIN
                                                                                                                      |
S2 : base de dev (toi) -> recette test1 neuve -> deploiement de develop merge -> jeu de test -> comptages -----------+
```

S0 et S1 tournent ce soir en parallèle ; S2 s'ouvre dès que tu veux les commandes ; S4 attend la réunion.

---

## 6. À valider par toi

1. **test1** : ne pas migrer la base actuelle ; recréer une base de recette propre à S2 et y déployer `develop` après le merge d'Edmond. Recommandation ; tu tranches.
2. **Ta base de dev** : LocalDB sur la VM (recommandé), ou une base à toi sur dev1 ?
3. **Le nom de ta base** : `EveDevMel`, ou un autre ?
4. **Le second chemin de code** de l'application de Gaëtan.
5. **La forme du support** de la réunion : page HTML autonome projetable (recommandé), Word, ou PowerPoint.
6. **Le dépôt de sauvegarde du dispositif** : quand, et sous quelle forme (voir ST).
7. Le push de la branche ESG : **tranché**, fait le 21/09.
8. **La base de la gate** : passer le défaut de `gate.py` à `origin/develop` (une ligne dans le dispositif), ou mettre à jour toi même la branche locale `develop` de temps en temps.

---

## 7. Ce qu'il ne faut pas perdre

- L'ordre des 23 étapes d'intégration (`2026-09-10-socle-de-travail/design.md` section 5) : S2 en a besoin.
- Le cheminement de la base (`_missions/cheminement-base-de-test.md`) : réutilisable à S2, avec LocalDB en option nouvelle, et `.env` désormais de ta seule main.
- La règle de reprise de l'existant : l'application de Gaëtan tourne en production depuis trois ans, ce qu'elle fait est ce que DEMAIN attend ; quand une façon de faire paraît perfectible, chercher d'abord pourquoi ils l'ont faite ainsi.
- La règle des deux mains : je ne lis aucune donnée, je n'écris sur aucun serveur ni base partagés, ni dans `.env` ; j'écris les scripts et les contrôles, tu les lances.
- Le partage `F:` ne se lit jamais depuis le fil : toute copie de code en vient de ta main, dans `_externe/`.
- L'audit CSDR (`2026-09-11-audit-csdr-vers-eve`) : CSDR est une application cliente de la façade ; ses limites connues serviront à S4.
- Les corrections du dispositif des 14 et 15/09 (lecture de cette page en premier, vérification des actions de ta main, test à l'insertion avant l'aval, section « Où le changement agit, où on le prouve », attaque de la spec et du plan, point d'étape validé avant d'agir) restent en vigueur.
