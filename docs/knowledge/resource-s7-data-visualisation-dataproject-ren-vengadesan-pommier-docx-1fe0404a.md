---
id: >-
  resource-s7-data-visualisation-dataproject-ren-vengadesan-pommier-docx-1fe0404a
slug: >-
  resource-s7-data-visualisation-dataproject-ren-vengadesan-pommier-docx-1fe0404a
source_key: 'sha256:1fe0404a5a4dbb4bb92592efc2caf06b17744ef03da33d422a76e9e82a6c36ae'
part_of: resource-s7-data-visualisation-0f395360
order: 1
manifest: null
derived_from: 'sha256:1fe0404a5a4dbb4bb92592efc2caf06b17744ef03da33d422a76e9e82a6c36ae'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - ACP
  - PCA
  - AFC
  - ACM
  - analyse-factorielle
  - data-visualisation
  - census-income
  - variables-qualitatives
  - variables-quantitatives
  - réduction-dimensionnalité
  - socio-économique
domain: data science
---
# S7 - data visualisation — DataProject_REN_VENGADESAN_POMMIER.docx

## Thesis

Les trois méthodes d'analyse factorielle (ACP, AFC, ACM) se complètent pour explorer la structure socio-économique du Census Income Dataset : l'ACP révèle les dimensions quantitatives, l'AFC les associations entre paires de variables qualitatives, et l'ACM synthétise l'ensemble des catégories en un plan factoriel unique — confirmant que niveau d'éducation, type d'emploi et revenu forment le gradient dominant du jeu de données.

## Context

Rapport de projet S7 (EFREI, 06/11/2025, prof. Stefani El Kalamouni) appliquant trois méthodes de réduction de dimensionnalité sur le Census Income Dataset (UCI ML Repository, recensement US 1994 — 32 561 individus, 15 variables : 6 quantitatives, 9 qualitatives). Variable cible : revenu >50 K$ ou ≤50 K$/an. Problématique : comment les caractéristiques professionnelles et démographiques influencent-elles le niveau de revenu ? Prétraitement commun : valeurs manquantes codées '?' → suppression/imputation ; variables quantitatives centrées-réduites pour l'ACP ; variables qualitatives factorisées pour AFC/ACM.

## Reasoning

**ACP** (6 variables quantitatives : age, fnlwgt, education-num, capital-gain, capital-loss, hours-per-week) : valeurs propres entre 0,802 et 1,311 — répartition homogène. Critère de Kaiser (λ>1) → 3 axes retenus, confirmés par le coude de l'éboulis. Ces 3 composantes cumulent ~57 % de variance (~80 % avec 4 axes). PC1 (capital-gain, education-num, hours-per-week) oppose profils à fort capital/éducation/heures vs profils faibles. PC2 (age, capital-loss) capte une dimension démographique et patrimoniale. fnlwgt évolue en sens inverse de capital-gain et hours-per-week. Un cluster distinct à fort capital et haut revenu potentiel est visible dans le nuage des individus. **AFC** (variables qualitatives deux à deux : travail vs salaire, éducation vs salaire) : les axes factoriels montrent qu'un niveau d'emploi et d'éducation plus élevé corrèle avec des salaires plus hauts. La part d'inertie expliquée croît avec les axes principaux. **ACM** (toutes variables qualitatives) : Dim1 = 42,86 %, Dim2 = 29,03 %, cumul = 71,9 % — suffisant pour interpréter la structure principale. Dim1 oppose deux profils nets : (1) favorisé — revenu >50K, métiers qualifiés (Exec-managerial, Prof-specialty), éducation élevée (Masters, Doctorate), statut Husband ; (2) défavorisé — revenu ≤50K, métiers manuels/service (Handlers-cleaners, Other-service), éducation basse (HS-grad, Some-college), statut Not-in-family. Dim2 corrèle sexe, rôle familial et origine géographique. Le cercle des corrélations confirme : axe 1 ← revenu + éducation + métier ; axe 2 ← statut familial + sexe + pays d'origine.

## Trade-offs

**ACP** : puissante sur les variables numériques, aveugle aux catégorielles — ne peut pas décrire les relations entre sexe, emploi ou statut matrimonial. **AFC** : révèle les associations entre deux variables qualitatives sans contrainte d'échelle numérique, mais très sensible au codage (matrices de Burt/co-occurrence) ; descriptive uniquement, ne remplace pas les tests d'indépendance (chi²). **ACM** : vision globale multi-variables qualitatives, complémentaire de l'ACP ; en revanche, graphiques rapidement chargés avec de nombreuses modalités, et les modalités rares (ex. native-country) peuvent distordre artificiellement le plan factoriel. Aucune des trois méthodes n'établit de causalité — elles sont toutes exploratoires.

## See also

- Census Income Dataset — UCI ML Repository
- Critère de Kaiser (λ > 1)
- Diagramme des éboulis (scree plot)
- Cercle des corrélations
- Biplot (ACP)
- Matrice de Burt (ACM/AFC)
- Tests d'indépendance (chi²)
