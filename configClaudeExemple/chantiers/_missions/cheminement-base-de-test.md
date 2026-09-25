# Une base à toi sur `BDFG-SRV-DEV1` : le cheminement complet

Écrit le 14/09/2026 pour Melvyn. Il a tous les droits sur le SQL Server du serveur de dev, il sait à peu près faire, il veut le chemin entier pour ne pas avancer par bouts. Tania l'avait prévu : « construire des bases de données dédiées : 1 pour recette + 1 pour chaque développeur » (`passation_notes.md:50`).

**Pourquoi maintenant.** Le site `49153` tourne sur `EveDev`, et `EveDev` a servi aux essais de Tania : son contenu n'est pas une référence. Une base à toi, remplie dans l'ordre depuis les fichiers sources, est la seule façon d'avoir des données dont tu connais l'origine, et le seul endroit où jouer sans gêner Edmond.

**Cinq étapes.** Les deux premières se font tout de suite, sans rien attendre. La troisième dépend de la cartographie (mission 1) pour être complète, mais un premier remplissage est possible avec les fichiers déjà sur le poste. Tout ce qui écrit sur le serveur est de ta main ; j'écris les scripts et les contrôles.

```text
A. créer la base  ->  B. brancher une instance EVE dessus et migrer  ->  C. remplir dans l'ordre  ->  D. vérifier  ->  E. y brancher DEMAIN_eve
     toi, SSMS              toi, ton poste, 27 migrations               script (moi), lancement (toi)   comptages       mission 3
```

## A. Créer la base (SSMS, sur le serveur)

Nom proposé : `EveDevMel` (celui du chantier socle du 10/09). Même collation qu'`EveDev` pour que tris et comparaisons de texte se comportent pareil :

```sql
SELECT DATABASEPROPERTYEX('EveDev', 'Collation') AS collation_evedev;
```

```sql
CREATE DATABASE [EveDevMel] COLLATE <collation lue ci dessus>;
```

Ton compte Windows est celui qui migrera et remplira : s'il n'est pas `sysadmin`, il lui faut `db_owner` sur la base (`CREATE USER [DOMAINE\toi] FOR LOGIN [DOMAINE\toi]; ALTER ROLE db_owner ADD MEMBER [DOMAINE\toi];`). Le compte du pool IIS n'a besoin de rien tant que l'instance tourne depuis ton poste (étape B).

## B. Brancher une instance EVE et migrer (ton poste)

Le projet lit sa configuration dans `.env` (python-decouple, `eve_back/settings.py:81-88`) : `DB_CONFIG` présent, c'est SQL Server ; absent, c'est sqlite. `.env.dev1` est le modèle : moteur `mssql`, `ODBC Driver 17 for SQL Server`, `trusted_connection`, sans mot de passe.

1. **Le driver ODBC est il sur ton poste ?**

   ```powershell
   Get-OdbcDriver -Name "ODBC Driver 17 for SQL Server" -Platform 64-bit
   ```

   S'il manque, il s'installe depuis le site Microsoft (installateur signé), rien dans le dépôt ne change.

2. **Un fichier d'environnement pour ta base.** Copie de `.env.dev1` en `.env.mel`, avec `"NAME":"EveDevMel"` à la place d'`EveDev`, et `EVE_LOG_DIR` vers un dossier à toi (le chemin de `.env.dev1` pointe sur le partage). Je l'écris si tu veux ; il ne contient aucun secret hors la `SECRET_KEY`, qu'on copie sans l'afficher.

3. **Basculer** : le projet ne lit que `.env`. Bascule explicite, et retour explicite :

   ```powershell
   Copy-Item .env .env.sqlite.sauvegarde; Copy-Item .env.mel .env
   ```

   **Tant que `.env` pointe sur le serveur, la suite de tests ne se lance que par `/gate`**, qui force sqlite en mémoire : un `manage.py test` direct créerait `test_EveDevMel` sur le serveur.

4. **Migrer** : les 27 migrations (`0001` à `0027` une fois la mission 0 faite ; `0026` si tu le fais avant) créent le schéma complet.

   ```powershell
   .\.venv\Scripts\python.exe manage.py migrate
   ```

   Preuve : `.\.venv\Scripts\python.exe manage.py showmigrations | Select-String -Pattern "\[ \]"` rend rien.

5. **Ton compte et ton token** : `createsuperuser`, puis le token permanent par le même bout de shell que `C:\dev\Eve\outils\init_base_locale.ps1` (il crée un `PermanentToken` pour l'utilisateur) ou par `POST /auth/login` une fois le serveur lancé.

6. **Lancer** : `.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000`. Swagger sur `http://127.0.0.1:8000/`, branché sur ta base du serveur. C'est déjà « la base sur le serveur, pas en local », ce que tu voulais le 10/09 ; seul le code tourne sur ton poste.

**Plus tard, un second site IIS sur `dev1`** (son dossier, son port, son `.env`) pour que `DEMAIN_eve` puisse l'appeler sans ton poste allumé. Ça demande de savoir comment le site actuel est monté : c'est la phase 0 de `serveur-dev-test1.md` qui le dira (`web.config`, pool).

## C. Remplir dans l'ordre

L'ordre a été vérifié dans le code le 10/09 (`chantiers/2026-09-10-socle-de-travail/design.md`, section 5, 23 étapes). Les sept premières construisent les référentiels, tout le reste en dépend :

| # | Appel | Pourquoi à cette place |
| --- | --- | --- |
| 1 | `POST /insert_data/jump_issuer_data` | source primaire du référentiel issuer |
| 2 | `POST /insert_data/bdfg_issuer_data` | apporte `code_issuer_capital_parent` |
| 3 | `POST /insert_data/iss_asset_data` | source secondaire de LEI |
| 4 | `POST /build_referential/issuer` | lit les trois précédents |
| 5 | `POST /insert_data/jump_asset_data` | source primaire du référentiel asset |
| 6 | `POST /insert_data/bdfg_asset_data` | source du référentiel asset |
| 7 | `POST /build_referential/asset` | lit 5, 6 et le référentiel issuer |
| 8 à 22 | `POST /insert_data/<provider>` | les flux providers, ordre libre entre eux |
| 23 | `POST /build/proprietary/bdfg_equity_controversy_issuer_data` | consomme MSCI, ISS, Sustainalytics et le référentiel issuer |

Deux règles du code à respecter : `insert_data` accepte CSV `;` ou parquet, jamais xlsx ; et l'`integration_process_id` de chaque appel doit être **strictement supérieur** au précédent du même flux (`test_an_integration_id_not_greater_than_the_previous_one_is_rejected`). Un identifiant daté du type `20260915` convient.

**Ce qu'il faut pour remplir, et d'où ça vient :**

| Besoin | D'où | État |
| --- | --- | --- |
| Quel fichier pour quel `data_key` (le dossier `Providers\` a 21 sous dossiers, `DataKey` 21 flux, la correspondance n'est pas écrite dans le dépôt) | `Providers\Modop_Fichiers_providers.docx`, `Suivi dev.xlsx` : **tu les lis** (liste de lecture, mission 1) | à faire |
| Quel fichier est « le bon », le plus récent, complet | même lecture, plus les dates des fichiers (relevé fait, dans la liste de lecture) | à faire |
| Le script qui enchaîne les appels : lit un manifeste (`data_key`, fichier, identifiant), poste dans l'ordre, s'arrête à la première erreur, écrit un compte rendu (code HTTP, lignes insérées) sans jamais afficher une valeur | **moi** ; PowerShell ou Python, hors du dépôt EVE (dans `chantiers/` ou `C:\dev\Eve\outils\` si tu m'ouvres ce dossier) | à écrire, dès que tu dis où |
| Le lancement | **toi**, contre `http://127.0.0.1:8000/` avec ton token | après le script |

Un premier remplissage des sept étapes référentiel est possible **tout de suite** avec les fichiers du miroir `C:\dev\Eve\Providers\` (`Jump_Issuer` 5 fichiers d'avril à juillet 2026, `Jump_Asset` 7, `BDFG_Asset_Data` 3, `ISS_Multi_security_File` 3 dont un de juin 2026), dès que tu confirmes quel dossier nourrit quel `data_key`.

## D. Vérifier

Agrégats seulement, jamais une ligne.

- Par table : `SELECT COUNT(*)` et la liste des `integration_process_id` distincts, à comparer aux lignes des fichiers sources (le compte rendu du script les donne).
- Par flux : `GET /data_quality_assessment_report/{data_key}`, qui mesure couverture, volume, fraîcheur.
- Contre `EveDev` : les mêmes comptages, en lecture seule, pour voir où les essais de Tania ont laissé des traces (identifiants d'intégration multiples, volumes différents). C'est la réponse chiffrée à « est ce que les données d'EveDev sont bonnes ».

## E. Ensuite

`DEMAIN_eve`, la version test de DEMAIN (`passation_notes.md:54`), pointée sur ton instance : c'est la mission 3. Elle attend que la base soit remplie et que `FillDataEsgDemain` soit compris (Gaëtan, que tu vois toi même).

## Ce que je te demande pour avancer

1. Le nom de la base te va (`EveDevMel`) ou tu en veux un autre ?
2. Où j'écris le script de remplissage : `chantiers/` (déjà ouvert) ou `C:\dev\Eve\outils\` (à m'ouvrir) ?
3. Dès que tu as lu le modop des providers : la correspondance dossier vers `data_key`, au moins pour les sept premières étapes.
