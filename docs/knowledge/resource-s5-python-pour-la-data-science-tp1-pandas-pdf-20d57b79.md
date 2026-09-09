---
id: resource-s5-python-pour-la-data-science-tp1-pandas-pdf-20d57b79
slug: resource-s5-python-pour-la-data-science-tp1-pandas-pdf-20d57b79
source_key: 'sha256:20d57b79cb1d88904db2f7efdf789bef5ad74f1b251c89539e268d521e393f20'
part_of: resource-s5-python-pour-la-data-science-f152995e
order: 6
manifest: null
derived_from: 'sha256:20d57b79cb1d88904db2f7efdf789bef5ad74f1b251c89539e268d521e393f20'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - pandas
  - python
  - data-science
  - dataframe
  - analyse-donnees
  - TP
  - csv
  - manipulation-donnees
domain: Data Science
---
# S5 - Python pour la Data Science — TP1 Pandas.pdf

## Goal

Maîtriser les opérations fondamentales de Pandas (chargement, nettoyage, agrégation, sélection, transformation) à travers 4 exercices progressifs sur des datasets réels.

## Prerequisites

- Python installé avec pandas
- Datasets disponibles : supermarket_sales.csv, StudentsPerformance.csv, telecom_churn.csv, hubble_data.csv, hubble_data_no_headers.csv
- Connaissance de base des DataFrames pandas

## Steps

**exercise**: Exercice 1 — Analyse des ventes (supermarket_sales)
**tasks**: - Charger le dataset et afficher un résumé statistique (df.describe())
- Identifier et gérer les valeurs manquantes (df.isnull().sum(), df.fillna() ou df.dropna())
- Calculer le CA total par ville (df.groupby('City')['Total'].sum()) et identifier la ville max
- Trouver les 3 Product lines avec le CA moyen le plus élevé (groupby + mean + nlargest(3))
- Calculer le pourcentage des ventes totales par genre (groupby('Gender')['Total'].sum() / total * 100)
- Identifier les 5 factures avec le montant total le plus élevé (nlargest(5, 'Total'))
**exercise**: Exercice 2 — Performances des élèves (StudentsPerformance.csv)
**tasks**: - Charger le dataset et afficher le nombre d'élèves par genre (value_counts() sur la colonne gender)
- Comparer les scores moyens selon le niveau d'éducation des parents (groupby('parental level of education').mean())
- Compter les élèves avec un score parfait (100) dans au moins une matière (condition sur colonnes scores)
- Calculer la matrice de corrélation entre les scores des matières (df[score_cols].corr())
**exercise**: Exercice 3 — Churn télécom (telecom_churn.csv)
**tasks**: - Charger le dataset et afficher la taille (df.shape)
- Afficher colonnes et infos (df.columns, df.info())
- Convertir la colonne churn en entier (df['churn'] = df['churn'].astype(int))
- Afficher les stats des colonnes numériques (df.describe()) puis non-numériques (df.describe(include='object'))
- Afficher la distribution de churn (value_counts() ou groupby)
- Trier par total des frais de jour en ordre décroissant (sort_values(..., ascending=False))
- Calculer la proportion d'utilisateurs ayant churné (df['churn'].mean())
- Calculer le temps moyen au téléphone en journée pour les churners (groupby + filtre churn==1)
- Durée max des appels internationaux chez les fidèles sans forfait international (filtre churn==0 et international plan=='No')
- Afficher les colonnes de 'state' à 'area code' par indexation par nom (df.loc[:, 'state':'area code'])
- Afficher la dernière ligne (df.iloc[-1] ou df.tail(1))
- Afficher les 5 premières lignes où 'state' termine par 'V' (df[df['state'].str.endswith('V')].head(5))
- Remplacer 'No' par False et 'Yes' par True dans 'international plan' (df['international plan'].map({'No': False, 'Yes': True}))
**exercise**: Exercice 4 — Données Hubble (hubble_data.csv)
**tasks**: - Charger hubble_data.csv
- Renommer les colonnes distance→dist et recession_velocity→rec_vel (df.rename(columns={...}))
- Charger hubble_data_no_headers.csv en attribuant les noms dist et rec_vel (pd.read_csv(..., header=None, names=['dist','rec_vel']))
- Afficher les infos du dataset (df.info())
- Sélectionner la colonne dist avec tail() (df['dist'].tail())
- Afficher les 5 premières lignes de dist de 2 façons (df['dist'].head(5) et df.loc[:4, 'dist'])
- Calculer l'énergie E = K * dist + 0.5 * rec_vel² avec K=100 et ajouter la colonne E
- Ajouter la colonne dist2 = dist²
- Supprimer la colonne dist2 (df.drop(columns=['dist2']))
- Supprimer la deuxième ligne avec inplace=True (df.drop(index=1, inplace=True))
- Définir dist comme index (df.set_index('dist', inplace=True))
- Afficher le type, la moyenne et la médiane de la colonne E (dtype, mean(), median())
- Afficher les stats descriptives de la colonne E (df['E'].describe())
- Calculer et afficher la matrice de covariance (df.cov())
- Afficher la valeur 194.3740 de la matrice de 2 façons (iloc et loc)
- Mettre à jour E=1620 pour dist=2.0 (df.loc[2.0, 'E'] = 1620)
- Mettre à jour E=1800 pour dist=2.0 avec .at (df.at[2.0, 'E'] = 1800)

## Result

L'étudiant sait charger, inspecter, nettoyer, transformer et agréger des DataFrames Pandas ; il maîtrise la sélection par label/position (loc/iloc/at), le renommage, la suppression, la création de colonnes calculées, le tri, le filtrage conditionnel, les statistiques descriptives et la matrice de covariance.

## Next

- Visualisation des données avec Matplotlib / Seaborn (histogrammes, boxplots, heatmaps de corrélation)
- Nettoyage avancé : encodage de variables catégorielles, normalisation, détection d'outliers
- Introduction à Scikit-learn pour la modélisation (régression, classification)
