---
id: resource-creation-d-un-petit-dataset-fictif-1a86790d
slug: resource-creation-d-un-petit-dataset-fictif-1a86790d
source_key: 'sha256:1a86790d4d290f35daa921523d958d8f72599b500be072d4129cdfec546077c7'
part_of: null
order: null
manifest: null
derived_from: 'sha256:1a86790d4d290f35daa921523d958d8f72599b500be072d4129cdfec546077c7'
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
  - ACM
  - analyse-des-correspondances-multiples
  - MCA
  - python
  - prince
  - matplotlib
  - visualisation
  - données-qualitatives
  - statistiques
domain: data-science
---
# Création d’un petit dataset fictif

## Goal

Apprendre à appliquer l'Analyse des Correspondances Multiples (ACM) sur un jeu de données qualitatives fictif et interpréter les graphiques produits : scree plot, carte des individus, carte des modalités, biplot.

## Prerequisites

- Python installé avec pandas, prince, matplotlib, seaborn (pip install prince)
- Notions de base sur les variables qualitatives / nominales
- Familiarité minimale avec pandas DataFrame

## Steps

**step**: 1
**title**: Créer le jeu de données fictif
**description**: Construire un DataFrame de 10 étudiants décrits par 4 variables qualitatives : Sexe (H/F), Régime (Omnivore/Végétarien/Végan), Boisson (Café/Thé/Jus), Sport (Foot/Basket/Natation).
**code**: import pandas as pd

data = {
    "Sexe": ["H", "F", "H", "F", "H", "F", "H", "F", "H", "F"],
    "Régime": ["Omnivore", "Végétarien", "Omnivore", "Végan", "Végétarien",
               "Omnivore", "Végan", "Végétarien", "Omnivore", "Omnivore"],
    "Boisson": ["Café", "Thé", "Jus", "Café", "Thé",
                "Café", "Jus", "Thé", "Jus", "Café"],
    "Sport": ["Foot", "Basket", "Foot", "Natation", "Basket",
              "Foot", "Natation", "Basket", "Foot", "Natation"]
}
df = pd.DataFrame(data)
**step**: 2
**title**: Lancer l'ACM avec prince
**description**: Instancier et ajuster un objet MCA à 4 composantes.
**code**: import prince

mca = prince.MCA(n_components=4, random_state=42)
mca = mca.fit(df)
**step**: 3
**title**: Calculer et afficher les valeurs propres (inertie)
**description**: Extraire les valeurs propres, calculer le pourcentage d'inertie par axe et l'inertie cumulée des deux premiers axes. Question : quelle part d'inertie expliquent Dim1+Dim2 ? Combien d'axes retenir ?
**code**: eigvals = mca.eigenvalues_
inertia = [val/sum(eigvals)*100 for val in eigvals]

print("Valeurs propres :", eigvals)
print("Inertie par axe (%) :", inertia)
print("Inertie cumulée Dim1+Dim2 :", sum(inertia[:2]))
**step**: 4
**title**: Tracer le scree plot
**description**: Visualiser la décroissance des valeurs propres en barplot + courbe. Identifier le coude : l'axe à partir duquel les valeurs propres deviennent faibles.
**code**: import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(6,4))
sns.barplot(x=list(range(1, len(inertia)+1)), y=inertia, color="skyblue")
plt.plot(range(1, len(inertia)+1), inertia, marker="o", color="red")
plt.title("Scree plot (ACM)")
plt.xlabel("Axes")
plt.ylabel("% Inertie expliquée")
plt.show()
**step**: 5
**title**: Tracer la carte factorielle des individus
**description**: Projeter uniquement les individus (étudiants) dans l'espace factoriel. Observer si des groupes se forment et ce que cela révèle de leurs profils de préférences.
**code**: fig, ax = plt.subplots(figsize=(6,6))
mca.plot_coordinates(df, ax=ax, show_row_points=True, show_column_points=False)
plt.title("ACM - Carte des individus")
plt.show()
**step**: 6
**title**: Tracer la carte factorielle des modalités
**description**: Projeter uniquement les modalités (catégories) dans l'espace factoriel. Repérer les modalités proches (ex. Café + Omnivore) et celles qui s'opposent.
**code**: fig, ax = plt.subplots(figsize=(6,6))
mca.plot_coordinates(df, ax=ax, show_row_points=False, show_column_points=True)
plt.title("ACM - Carte des modalités")
plt.show()
**step**: 7
**title**: Tracer le biplot (individus + modalités)
**description**: Superposer individus et modalités. La proximité d'un individu avec une modalité signifie que cet étudiant possède (ou est proche de) cette caractéristique. Exemple de lecture : un groupe 'Végétarien + Thé + Basket'.
**code**: fig, ax = plt.subplots(figsize=(6,6))
mca.plot_coordinates(df, ax=ax, show_row_points=True, show_column_points=True)
plt.title("ACM - Biplot (Individus + Modalités)")
plt.show()

## Result

On obtient 4 graphiques interprétables : un scree plot montrant la part d'inertie par axe, une carte des individus révélant d'éventuels regroupements de profils, une carte des modalités mettant en évidence les associations et oppositions entre catégories, et un biplot combiné permettant de lire directement quel étudiant se rapproche de quelles modalités.

## Next

- Appliquer l'ACM sur un jeu de données réel plus large
- Tester l'impact du nombre de composantes (n_components) sur l'inertie expliquée
- Combiner l'ACM avec une Classification Ascendante Hiérarchique (CAH) pour typologiser les individus
- Explorer d'autres librairies ACM en Python (FactorAnalyzer, statsmodels) ou en R (FactoMineR)
