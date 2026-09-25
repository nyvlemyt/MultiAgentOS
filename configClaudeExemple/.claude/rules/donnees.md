# Données : ce que je ne lis jamais

Les données providers d'EVE sont sous licence et confidentielles. Le verrou `garde_donnees.py` refuse mécaniquement les appels ci-dessous ; cette règle dit le pourquoi et couvre ce qu'un verrou ne peut pas voir.

## Fichiers et dossiers

- Contenu jamais lu : `C:\dev\Eve\Providers\`, `C:\dev\Eve\Archives Tania\`, `EveBackEnd\tmp_uploads\`, `EveBackEnd\data_import_files\`, `C:\dev\EVE_old\`, le partage `F:`, et tout `.csv`, `.xlsx`, `.xls`, `.parquet` qui n'est pas un document identifié.
- Documents identifiés (lisibles) : `C:\dev\Eve\Data_Quality_ExpressionDeBesoins.xlsx`, `Champs_JUMP_dans_EVE.xlsx`, `Suivi dev.xlsx`, `data_catalog\data_catalog.xlsx`, tout ce qui est sous `documentation\`, `CR Projet\`, `Documentation Projet Tania\`, `Modélisation\`, `Spécification\`, `MVP\`, `Releases\`, et les exports `issuer_schemas_*.xlsx` produits par `GET /issuer_schemas_xlsx` (définition des schémas, alias et contraintes de champs : aucune valeur de donnée, ajouté le 18/09/2026 sur demande de Melvyn).
- Noms, tailles, dates, arborescences : autorisés (`ls`, `dir`, `Get-ChildItem`, `du`, `find` sans `-exec`). Les en-têtes d'un fichier de données ne se lisent que si Melvyn le demande pour un besoin précis, jamais une ligne de valeurs.
- `C:\dev\Eve\token_api.txt` : jamais lu ni affiché.

## Bases de données

- Base par défaut : la sqlite locale déclarée dans `.env`. Les tests tournent sur sqlite en mémoire, `DB_CONFIG` forcé par `/gate`.
- EveDev (SQL Server `BDFG-SRV-DEV1`) : lecture seule, uniquement sur demande explicite de Melvyn, jamais de `migrate`, jamais d'écriture, jamais de `manage.py test` (Django tenterait de créer une base de test sur le serveur).
- Valeurs ligne à ligne (ISIN, noms d'émetteurs, montants, dates, identifiants) : jamais affichées, quelle que soit la base. Comptages, agrégats, schéma, liste des `integration_process_id` : oui. Exemple de la bonne limite (07/09/2026) : 85 999 lignes, 73 633 NULL, 0 valeur non convertible.

## Secrets

- `.env` et `.env.dev1` sont lisibles (autorisation de Melvyn du 13/08/2026) ; les valeurs secrètes (`SECRET_KEY`, mots de passe) sont masquées dans toute sortie. La base partagée s'authentifie par `trusted_connection`, sans mot de passe.
- Une sortie qui a laissé passer une valeur de données ou un secret se signale tout de suite, et le fichier qui la contient est purgé avant tout commit.
