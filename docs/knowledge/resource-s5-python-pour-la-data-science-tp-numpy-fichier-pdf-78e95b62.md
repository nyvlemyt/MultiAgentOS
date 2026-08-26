---
id: resource-s5-python-pour-la-data-science-tp-numpy-fichier-pdf-78e95b62
slug: resource-s5-python-pour-la-data-science-tp-numpy-fichier-pdf-78e95b62
source_key: 'sha256:78e95b62542c4bd680ad7dc11abfaab141e8f94ff3e9beba8216901283caca3c'
part_of: S5 - Python pour la Data Science
order: 5
manifest: null
derived_from: 'sha256:78e95b62542c4bd680ad7dc11abfaab141e8f94ff3e9beba8216901283caca3c'
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
  - numpy
  - python
  - data-science
  - csv
  - fichiers
  - statistiques
  - tp
domain: Data Science
---
# S5 - Python pour la Data Science — TP Numpy Fichier.pdf

## Goal

Maîtriser la lecture, l'écriture et l'analyse de fichiers CSV avec NumPy à travers 6 exercices progressifs couvrant import, export, filtrage, agrégation et statistiques descriptives.

## Prerequisites

- Python installé avec NumPy (numpy.genfromtxt, numpy.savetxt)
- Notions de base sur les tableaux NumPy (ndarray, slicing, axes)
- Fichiers CSV fournis : etudiants.csv, temperatures.csv, ventes.csv, population.csv

## Steps

**num**: 1
**title**: Lecture CSV — notes étudiants
**actions**: - Lire etudiants.csv (colonnes : Nom, Maths, Physique, Informatique) avec numpy.genfromtxt.
- Exclure la colonne 0 (noms) et calculer la moyenne par matière (axis=0).
- Identifier l'étudiant avec la meilleure moyenne (mean par ligne, argmax).
**num**: 2
**title**: Écriture CSV — catalogue produits
**actions**: - Créer un tableau NumPy avec colonnes Nom, Quantité, Prix.
- Écrire dans produits.csv via numpy.savetxt avec delimiter et header.
- Relire le fichier pour vérification.
**num**: 3
**title**: Statistiques sur températures mensuelles
**actions**: - Lire temperatures.csv (colonnes : Jour, Température).
- Calculer moyenne, max et min sur la colonne Température.
- Trouver le ou les jours à température maximale (np.where ou argmax).
**num**: 4
**title**: Filtrage et agrégation — ventes produits
**actions**: - Lire ventes.csv (colonnes : Produit, Quantité vendue, Prix unitaire).
- Calculer ventes totales = quantité × prix pour chaque ligne.
- Afficher les totaux et identifier le best-seller (argmax).
**num**: 5
**title**: Analyse de croissance de population
**actions**: - Lire population.csv (colonnes : Année, Population) sur 10 ans.
- Calculer les variations annuelles (np.diff sur la colonne Population).
- Identifier l'année de plus forte croissance.
**num**: 6
**title**: Fonction générique de statistiques CSV
**actions**: - Écrire une fonction qui accepte un chemin de fichier CSV numérique.
- Utiliser numpy.genfromtxt pour charger les données.
- Calculer moyenne, écart-type, min et max par colonne (axis=0).
- Sauvegarder les résultats dans un nouveau CSV au format : colonne, moyenne, écart_type, min, max.

## Result

À l'issue des 6 exercices, l'étudiant sait lire et écrire des CSV avec NumPy, appliquer des statistiques descriptives (mean, std, min, max), filtrer et agréger des données tabulaires, et encapsuler ces opérations dans une fonction réutilisable.

## Next

- Passer à pandas pour une manipulation CSV plus expressive (DataFrame, groupby, merge).
- Explorer numpy.loadtxt vs genfromtxt pour les cas de données manquantes.
- Introduire matplotlib pour visualiser les séries temporelles issues des exercices 3 et 5.
