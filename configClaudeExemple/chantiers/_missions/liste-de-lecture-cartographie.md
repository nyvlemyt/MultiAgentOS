# Cartographie de l'alimentation : ce que tu lis, ce que tu y cherches

Écrit le 14/09/2026. Règle fixée par Melvyn : **je recense, tu lis, tu me rapportes, je consigne.** Je n'ouvre aucun Word, PowerPoint ni Excel. Ce document te dit quoi ouvrir, dans quel ordre, et quelle question chaque document doit t'aider à fermer. Tout ce qui est listé a été relevé par nom, date et taille, sans lecture.

## La question à fermer

Pour chaque flux (21 `data_key`, plus JUMP, plus les controverses), **quel programme récupère la donnée aujourd'hui, où il l'écrit, à quelle fréquence, qui le lance, dans quel langage et quel dépôt, et ce qu'il faudrait changer pour qu'il dépose dans EVE.** La grille à remplir est en fin de document.

## Ce que j'ai déjà lu (texte brut, autorisé), pour ne pas le relire

- `Documentation Projet Tania\Notes\passation_notes.md` (24/07/2026), section PROD/DEV lignes 50 à 60 : `FillDataEsgDemain` est un script de l'IT, en place, à voir avec Gaëtan, point de branchement visé `export/demain`, sources dans le dépôt C# de l'IT (chemin ligne 53) ; une version test `DEMAIN_eve` existe ; deux micro services autour de DEMAIN sont à décommissionner, `ConvertControversesToJson` et `CreateFileControverses`, dans le dossier `ESG_Demain\Scripts` du partage des applications (lignes 56 et 57) ; les données financières (portefeuille, position, prix) et la réplication de l'historique JUMP sont posées, pas commencées. Section Controverses ligne 36 : un dossier du partage Front office nourrit `build/proprietary`. Section INFOCENTRE : décommissionnement avril 2027, schéma JUMP demandé à l'IT.
- `Documentation Projet Tania\Notes\Pentaho.md` (20/04/2026) : Pentaho est l'ETL de l'Infocentre, « application à part », « transforme en csv », validation interne sans contrôle, « pas autonome » ; il porte l'historique de JUMP ; son décommissionnement est conditionné au MVP EVE.

## La liste de lecture, dans l'ordre

Chaque ligne : le document, pourquoi lui, et ce que tu cherches en le lisant. Les plus rentables en premier.

| # | Document | Date, taille | Ce que tu cherches |
| --- | --- | --- | --- |
| 1 | `Providers\Modop_Fichiers_providers.docx` | 04/03/2026 | **la correspondance dossier vers `data_key`**, qui dépose les fichiers, d'où ils viennent (mail, portail, extraction), à quel rythme, et s'il existe une conversion avant `insert_data` (le modop `Etapes conversion CSV sur Excel.docx` du 28/10/2025 en est peut être la trace) |
| 2 | `Releases\1.0.0\Runbook.docx` | 27/04/2026, 124 Ko | **l'exploitation** : qui lance quoi, dans quel ordre, quand ; comment le site IIS est monté et déployé ; s'il y a une tâche planifiée ; les noms de serveurs et de comptes |
| 3 | `Releases\Dossier_Technique_MVP_ETL.docx` | 24/04/2026 | **l'architecture d'intégration du MVP** : les composants, les flux entre partage, EVE, Infocentre, DEMAIN ; ce qui était prévu pour l'automatisation |
| 4 | `Releases\1.0.0\Release-Note.docx` | 24/04/2026 | le périmètre livré en 1.0.0 : quels flux étaient intégrés, par quel moyen |
| 5 | `Modélisation\ArchitectureCible.drawio` (06/10/2025) et `ArchitectureTargetV2.drawio` (01/09/2025) | | le schéma cible : où EVE se place par rapport à JUMP, DEMAIN, Infocentre, Pentaho ; ce qui devait disparaître. S'ouvre avec draw.io ou l'extension VS Code |
| 6 | `CR Projet\26.04.23 - ROADMAP MVP.pptx`, `26.03.24 - POINT GLOBAL.pptx`, `25.10.09 - Bilan 1A.pptx` | 2025 et 2026 | les décisions de comité : qui porte l'alimentation, ce qui a été arbitré sur JUMP et DEMAIN, le calendrier |
| 7 | `MVP\Actions-Acteurs.xlsx`, `MVP\Cadrage MVP.docx` | 23/04/2026 | **qui fait quoi** : les acteurs par action, donc les propriétaires des programmes |
| 8 | `CR Projet\Calendrier.xlsx` | 24/03/2026 | les fréquences d'arrivée par fournisseur, si c'est un calendrier de livraisons |
| 9 | `C:\dev\Eve\Suivi dev.xlsx` | vivant | le suivi des flux côté `insert_data` (Tania le cite pour l'intégration, `passation_notes.md:13`) |
| 10 | `data_catalog\data_catalog.xlsx` | vivant | les champs par flux et leur source : utile pour la correspondance fichier vers schéma, pas pour les programmes |
| 11 | `Spécification\SPEC_DATA.pdf` (03/03/2026), `strcutres data.xlsx` (23/03/2026) | | la spec des données ; probablement déjà reprise dans `documentation\SPEC_data.md`, à ne lire que si un flux reste obscur |
| 12 | `Documentation Projet Tania\Notes\Week *.txt` : 34 notes hebdomadaires du 10/11/2025 au 09/07/2026, plus `MIDDLE.txt` (22/01/2026), `REU SECGE_DATA 19012025.txt`, `CR Référentiel ASSET.txt` (24/03/2026) | de 100 octets à 5,5 Ko chacune | le fil des décisions ; à lire en dernier, en cherchant JUMP, DEMAIN, Gaëtan, Pentaho, providers. Ce sont des `.txt` : si tu préfères que je les lise moi, dis le |

## Hors documents : les trois autres sources

1. **Gaëtan**, que tu vois toi même : ce que fait `FillDataEsgDemain`, où il lit aujourd'hui, à quel rythme, qui le lance ; si tu peux accéder au dépôt C# de l'IT et au dossier `ESG_Demain\Scripts` du partage des applications ; qui dépose les fichiers providers.
2. **Le serveur `dev1` lui même**, puisque tu y es allé : `Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' } | Select-Object TaskName, TaskPath` montre les tâches planifiées, donc les programmes qui tournent tout seuls. Et la phase 0 de `serveur-dev-test1.md` documente le site IIS.
3. **Les journaux copiés sur le poste** : `C:\dev\Eve\logs\django.log` (418 Ko) et `eve_api.log` (12 Ko), arrêtés au 23/07/2026. Un journal d'API dit qui a appelé quel endpoint et quand : c'est l'histoire réelle des intégrations passées, à condition qu'il ne porte pas de valeurs de données. Tu les ouvres, ou tu m'autorises à les lire en ne relevant que les endpoints et les dates.

## Ce que le poste dit déjà sans ouvrir un fichier

### Les 21 dossiers de `Providers\`, relevés le 14/09/2026 (noms et dates seulement)

| Dossier | Fichiers | Du | Au | Sous dossiers | Rythme apparent |
| --- | --- | --- | --- | --- | --- |
| `BDFG_Asset_Data` | 3 | 06/2026 | 07/2026 | | mensuel ou à la demande |
| `BDFG_Equity_Controversy_Demain` | 9 | 04/2026 | 07/2026 | | fréquent (9 en 3 mois) : c'est la sortie vers DEMAIN |
| `BDFG_Proprietary_Data` | 1 | 03/2025 | 03/2025 | | ponctuel |
| `BDFG_SupraEmetteurs` | 1 | 02/2026 | 02/2026 | | ponctuel |
| `CDCB_quali` | 2 | 02/2026 | 07/2026 | | semestriel ? |
| `ISS_Bond` | 4 | 12/2025 | 04/2026 | | |
| `ISS_Controversy` | 4 | 03/2026 | 07/2026 | `09.25` | semestriel (mars, septembre) |
| `ISS_ESG` | 5 | 01/2026 | 07/2026 | `03.25`, `09.25` | semestriel |
| `ISS_Multi_security_File` | 3 | 03/2025 | 06/2026 | | |
| `Iceberg` | 6 | 01/2026 | 07/2026 | `12.23`, `12.24`, `demain_export` | annuel, plus un export DEMAIN |
| `Jump_Asset` | 7 | 04/2026 | 07/2026 | | fréquent : extractions JUMP |
| `Jump_Issuer` | 5 | 04/2026 | 07/2026 | | fréquent : extractions JUMP |
| `MSCI_Controversy` | 3 | 03/2026 | 07/2026 | `03.26`, `09.25` | semestriel |
| `MSCI_PAB_Taxo` | 2 | 12/2025 | 04/2026 | | |
| `SNP_data` | 7 | 05/2026 | 07/2026 | `03.25`, `09.25` | semestriel, plusieurs fichiers par livraison |
| `Sovereign_Debt` | 4 | 02/2026 | 04/2026 | | |
| `Sustainanalytics` | 3 | 03/2026 | 07/2026 | `03.26`, `09.25` | semestriel |
| `Trucost_Coal` | 4 | 09/2025 | 07/2026 | `03.2025`, `09.2025` | semestriel |
| `Trucost_Fossile` | 6 | 09/2025 | 07/2026 | `03.2025`, `09.2025`, `output` | semestriel |
| `Trucost_Paris_Alignment` | 6 | 03/2026 | 07/2026 | `2024`, `2025` | annuel |
| `Trucost_Taxonomy` | 5 | 02/2025 | 07/2026 | `2023`, `2024` | annuel |

Les dates sont celles des fichiers sur le poste (copie du partage), pas forcément celles des livraisons : la colonne « rythme » est une hypothèse à confirmer par le modop (ligne 1). Les sous dossiers `09.25` sur cinq fournisseurs annoncent une **livraison de septembre** : c'est maintenant, et personne ne sait encore qui la dépose ni où.

### Deux dossiers du poste absents de la carte du 13/08

- `C:\dev\Eve\EVE_Onboarding\` : trois pages HTML du 21/08/2026 (`index.html`, `histoire.html`, `journal.html`, 43 à 60 Ko). À identifier : si c'est un travail d'assistant d'août, il peut contenir une lecture du projet déjà faite.
- `C:\dev\Eve\logs\` : voir ci dessus.

## La grille à remplir

Une ligne par flux. Tu me donnes les cases que tu trouves, document par document, je tiens la grille dans `chantiers/2026-09-15-cartographie-alimentation/cartographie.md` une fois le chantier ouvert.

| Flux (`data_key`) | Fournisseur | Dossier partage | Programme actuel (nom, langage, dépôt) | Déclencheur (qui, humain ou planifié) | Fréquence | Destination aujourd'hui (partage, Infocentre, DEMAIN, EVE) | Format reçu | Propriétaire | Pour viser EVE, il faut |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `jump_issuer_data` | JUMP | `Jump_Issuer` | | | | | | | |
| `jump_asset_data` | JUMP | `Jump_Asset` | | | | | | | |
| ... les 19 autres | | | | | | | | | |
| controverses vers DEMAIN | BDFG | `BDFG_Equity_Controversy_Demain` | `CreateFileControverses`, `ConvertControversesToJson` ? | | | DEMAIN | | | |
| historique JUMP | JUMP | | Pentaho | | | Infocentre | csv | IT ? | |
| lecture par DEMAIN | | | `FillDataEsgDemain` (IT, C#) | | | DEMAIN | | Gaëtan, IT | brancher sur `export/demain` |

Les lignes vides sont le travail. Les trois dernières sont ce qu'on sait déjà.
