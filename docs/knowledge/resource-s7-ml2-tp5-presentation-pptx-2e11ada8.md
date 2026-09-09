---
id: resource-s7-ml2-tp5-presentation-pptx-2e11ada8
slug: resource-s7-ml2-tp5-presentation-pptx-2e11ada8
source_key: 'sha256:2e11ada834235bbcc4cc7807122517a4d45f209bf0b21b807eae8547e93312f5'
part_of: resource-s7-ml2-fa640f29
order: 7
manifest: null
derived_from: 'sha256:2e11ada834235bbcc4cc7807122517a4d45f209bf0b21b807eae8547e93312f5'
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
doc_type: reference
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - dbscan
  - outlier-detection
  - clustering
  - machine-learning
  - equity
  - electric-school-buses
  - environmental-justice
  - unsupervised-learning
domain: Machine Learning / Data Science
---
# S7 - ml2 — TP5_Presentation.pptx

## Summary

Projet ML2 EFREI Paris : détection d'outliers par DBSCAN sur un dataset WRI de 12 888 districts scolaires américains pour analyser l'équité d'adoption des bus scolaires électriques (ESBs). Résultat : 790 outliers (noise=-1), dont 133 ont adopté les ESBs (16,8% vs 10,3% dans le cluster moyen), signalant une possible inéquité de distribution des subventions. Trois profils-types d'outliers ESB=yes identifiés : taille hors-norme (Clark County), district riche en zone polluée (Etiwanda — signal d'inéquité), district très pauvre bénéficiaire de programmes ciblés (Camden — signal de justice environnementale).

## Fields/API

**name**: Dataset source
**value**: WRI (World Resources Institute) — Excel 7 feuilles, 19 517 lignes brutes, 12 888 après suppression NaN EJScreen, 87 colonnes feuille 1
**name**: Variables retenues (7)
**value**: log_nb_students (Cat.4b NCES), pm25 (Cat.5f EJScreen), pct_free_lunch (Cat.4e NCES), ozone (Cat.5h EJScreen), median_income (Cat.4f Census), asthma_rate (Cat.5l EJScreen), pct_low_income (Cat.5d EJScreen)
**name**: Colonnes exclues — raisons
**value**: Quartiles 5c/5e/5g/5i/5k/5m (discrets, distance euclidienne non applicable) ; flags binaires 5n-5q (incompatibles euclidien + redondants) ; composition raciale 4h-4u (redondance avec 5b) ; 3j/3k (>99% NaN) ; 2b contractor (93% NaN, biais non-aléatoire) ; 6a expression of interest (variance nulle)
**name**: Prétraitement
**value**: StandardScaler (mean=0, std=1) — obligatoire car median_income (14k–250k$) écraserait asthma_rate (0.05–0.16) sans normalisation. log_nb_students : transformation log pour neutraliser Los Angeles (427 795 élèves).
**name**: Paramètres DBSCAN
**value**: eps=1.0 (coude k-distance curve — eps=3.66 auto produisait 1 seul outlier ESB=yes, inexploitable) ; MinPts=10 (fourchette Ester 1996 / Schubert 2017 [8,14], seule valeur produisant 3 clusters équilibrés)
**name**: Résultats — clusters
**value**: Cluster 0 : 11 412 districts, revenu 66 743$, PM2.5=7.42, free lunch 46%, ESB=10,3% — profil américain moyen. Cluster 1 : 676 districts (NJ 76%), revenu 98 342$, PM2.5=7.76, free lunch 27,7%, ESB=6,8% — districts aisés, adoption paradoxalement sous la norme. Cluster 2 : 10 districts (Californie), revenu 62 919$, PM2.5=11.09, free lunch 78,3%, ESB=0% — plus vulnérables, aucun adoptant.
**name**: Résultats — noise
**value**: 790 outliers (label -1), 133 ESB=yes (16,8%), revenu médian 77 343$, PM2.5=6.64, free lunch 51%. Taux adoption le plus élevé de tous les groupes.
**name**: Profils-types outliers ESB=yes
**value**: ① Clark County NV (309 787 élèves, 115× moy.) — outlier de taille, pas d'inéquité ; ② Etiwanda Elementary CA (revenu 120 785$, PM2.5=10.6) — district riche en zone polluée, signal d'inéquité ; ③ Camden City NJ (revenu 30 247$, très pauvre) — bénéficiaire ARP/EPA, signal de justice environnementale.
**name**: Comparaison méthodes
**value**: DBSCAN : 790 outliers total, 133 ESB=yes — retenu. LOF : 787 outliers, 96 ESB=yes — comparable. HDBSCAN : 8 outliers, 0 ESB=yes — trop conservateur, inadapté. Consensus DBSCAN+LOF : 11 outliers ESB=yes confirmés par les deux méthodes (cas les plus robustes).
**name**: Limites
**value**: 33% des districts exclus (NaN EJScreen — Porto Rico non couvert, PM2.5=0 et asthme=0 artificiels) ; profil moyen des outliers hétérogène, pas clairement 'riche' ; inéquité et justice environnementale coexistent dans le noise.
**name**: Définition outlier DBSCAN
**value**: Observation (district entier) dont le profil combiné sur toutes les variables ne ressemble à aucun groupe — label -1. Distinct d'une valeur aberrante sur une seule colonne. Exemple : Camden City n'est extrême sur aucune variable isolée, mais sa combinaison (très pauvre + PM2.5 moyen + asthme faible) ne correspond à aucun cluster.

## Constraints

- DBSCAN exige des variables continues pour la distance euclidienne — exclure quartiles, binaires et variables à variance nulle
- Normalisation StandardScaler obligatoire avant DBSCAN si les variables ont des échelles hétérogènes
- eps doit être calibré sur la k-distance curve plutôt qu'automatiquement : le coude automatique peut produire un résultat inexploitable (ici 1 seul outlier ESB=yes à eps=3.66)
- MinPts dans [8,14] selon Ester 1996 / Schubert 2017 — vérifier l'équilibre des clusters résultants
- Un outlier DBSCAN n'est pas interprétable sans les clusters de référence — les clusters sont le référentiel, pas l'objectif

## Examples

**case**: Sélection eps=1.0 vs eps=3.66 (coude automatique)
**detail**: À eps=3.66, DBSCAN produit 1 seul outlier ESB=yes → résultat analytiquement inutile. À eps=1.0, 133 outliers ESB=yes → masse suffisante pour distinguer profils d'inéquité et de justice environnementale.
**case**: Camden City NJ — outlier sans valeur aberrante isolée
**detail**: Revenu 30 247$ (extrême), PM2.5 moyen, asthma_rate faible. Aucune variable prise seule ne le rendrait outlier ; c'est la combinaison qui ne correspond à aucun des 3 clusters.
**case**: Cluster 2 — paradoxe de non-adoption
**detail**: 10 districts californiens, PM2.5=11.09 (+50% vs moy.), free lunch 78,3% — exactement la cible des programmes WRI/EPA. Pourtant ESB=0%. Révèle un échec d'accès aux subventions pour les plus vulnérables.
