---
id: resource-s7-data-visualisation-projet-dataviz-analysefactorielle-pdf-a5799ed9
slug: resource-s7-data-visualisation-projet-dataviz-analysefactorielle-pdf-a5799ed9
source_key: 'sha256:a5799ed93aa636589971fa4fdfe7594417f8dd20bf583be48a0f8ebfc958f03f'
part_of: S7 - data visualisation
order: 4
manifest: null
derived_from: 'sha256:a5799ed93aa636589971fa4fdfe7594417f8dd20bf583be48a0f8ebfc958f03f'
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
doc_type: howto
actionability: area
lane: workflows
schema_version: '1'
tags:
  - analyse-factorielle
  - ACP
  - AFC
  - ACM
  - data-visualisation
  - python
  - projet-groupe
  - dataset
domain: data-science
---
# S7 - data visualisation — Projet dataViZ_analysefactorielle.pdf

## Problem

Mettre en œuvre les méthodes d'analyse factorielle (ACP, AFC, ACM) sur un jeu de données mixte (variables qualitatives et quantitatives) pour dégager des profils, axes et regroupements, et rédiger un rapport structuré accompagné d'un notebook Python.

## Solution

Travail en groupe de 4–5 étudiants en 7 étapes : (1) choisir un dataset riche avec variables quali + quanti ; (2) rédiger un descriptif (source, observations, variables, nettoyage) ; (3) formuler une problématique/hypothèse ; (4) appliquer successivement ACP (variables quantitatives), AFC (deux variables qualitatives), ACM (plusieurs variables qualitatives) — pour chacune : sélection des variables, préparation, code Python commenté, figures (scree plot, carte factorielle, biplot) ; (5) interpréter axes, regroupements, oppositions, inertie ; (6) conclure en répondant à l'hypothèse, en citant les limites et ouvertures ; (7) remettre rapport PDF + notebook .ipynb sur Moodle avant le 9 novembre à 23h59.

## Variations

- Dataset banque/marketing : Bank Marketing Dataset (Kaggle) — job, marital, education + age, balance.
- Dataset e-commerce : E-commerce UK Data (Kaggle) — Country, Description + Quantity, UnitPrice.
- Dataset éducation mondiale : Education Statistics Dataset (World Bank/Kaggle) — Country, Region + School enrollment.
- Dataset sciences sociales mixtes : CESSDA Data Catalogue ou UK Data Service — données quali + quanti sélectionnables.
- Dataset revenus : UCI Census Income — workclass, education + age, hours-per-week.
- Réservoir généraliste : Awesome Public Datasets (GitHub) pour datasets bien équilibrés quali + quanti.

## Pitfalls

- Négliger le nettoyage des données avant d'appliquer les méthodes (valeurs manquantes, types incorrects).
- Confondre les méthodes : ACP = variables quantitatives uniquement ; AFC = exactement deux variables qualitatives ; ACM = plusieurs variables qualitatives.
- Omettre les figures obligatoires (scree plot, cartes factorielles, biplot) ou les produire sans commentaire.
- Interpréter les axes sans lier les résultats à la problématique initiale.
- Remettre uniquement le rapport PDF sans le notebook .ipynb (les deux sont requis).
- Dépasser la deadline : 9 novembre à 23h59 sur Moodle — aucune mention de délai supplémentaire.
