---
id: >-
  resource-s6-culture-economique-financiere-exercice-bilan-fonctionnel-f-r-bfr-et-ratios-enonce-docx-3020a3ed
slug: >-
  resource-s6-culture-economique-financiere-exercice-bilan-fonctionnel-f-r-bfr-et-ratios-enonce-docx-3020a3ed
source_key: 'sha256:3020a3edca24c8206fb9ca1a797458681717362f608d57e06f9ff6719baf05d7'
part_of: resource-s6-culture-economique-financiere-e643c91c
order: 1
manifest: null
derived_from: 'sha256:3020a3edca24c8206fb9ca1a797458681717362f608d57e06f9ff6719baf05d7'
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
  - bilan-fonctionnel
  - FR
  - BFR
  - trésorerie
  - ratios-financiers
  - culture-économique
  - comptabilité
  - finance
domain: finance & comptabilité
---
# S6 - Culture économique & financière — Exercice - Bilan fonctionnel, F R-BFR et ratios [énoncé].docx

## Goal

Construire un bilan fonctionnel à partir d'un bilan comptable, puis calculer le FR, le BFR, la trésorerie nette et quatre catégories de ratios financiers.

## Prerequisites

- Savoir lire un bilan comptable (actif / passif, brut / net, amortissements)
- Connaître les notions d'actif immobilisé, actif circulant, capitaux propres, dettes LT et CT

## Steps

**step**: 1
**title**: Reclasser le bilan comptable en bilan fonctionnel
**detail**: Le bilan fonctionnel regroupe les postes en quatre masses : Emplois Stables (ES), Ressources Stables (RS), Actif Circulant / Passif Circulant, Trésorerie Active (TA) / Trésorerie Passive (TP). Clé : les immobilisations sont prises en valeur BRUTE (110 000), les amortissements basculent côté Ressources Stables (10 000). Les dettes financières CT (découvert, agios) rejoignent la Trésorerie Passive.
**bilan_fonctionnel**: **emplois**: **emplois_stables_ES**: 110000
**actif_circulant**: **stocks**: 23000
**créances_clients**: 10000
**trésorerie_active_TA**: **disponibilités**: 2000
**total**: 145000
**ressources**: **ressources_stables_RS**: **capitaux_propres**: 55000
**dettes_fi_LT**: 40000
**amort_et_dépréciat**: 10000
**total_RS**: 105000
**passif_circulant**: **dettes_fournisseurs**: 20000
**dettes_fiscales_et_sociales**: 15000
**trésorerie_passive_TP**: **dettes_fi_CT**: 5000
**total**: 145000
**step**: 2
**title**: Calculer le Fonds de Roulement Net Global (FRNG)
**formule**: FRNG = RS − ES
**calcul**: 105 000 − 110 000 = −5 000
**interprétation**: FRNG négatif : les ressources stables ne couvrent pas la totalité des emplois stables. Signal de fragilité structurelle.
**step**: 3
**title**: Calculer le Besoin en Fonds de Roulement (BFR)
**formule**: BFR = Emplois circulants − Ressources circulantes
**calcul**: (23 000 + 10 000) − (20 000 + 15 000) = 33 000 − 35 000 = −2 000
**interprétation**: BFR négatif : les dettes d'exploitation (fournisseurs, fiscal-social) financent l'actif circulant. Favorable pour la trésorerie courante.
**step**: 4
**title**: Calculer la Trésorerie Nette (TN)
**formule**: TN = FRNG − BFR  ou  TN = TA − TP
**calcul**: −5 000 − (−2 000) = −3 000  |  vérif : 2 000 − 5 000 = −3 000
**interprétation**: Trésorerie nette négative : la société est en découvert net. La situation est tendue malgré un BFR favorable.
**step**: 5
**title**: Calculer les quatre ratios
**ratios**: **ratio_de_structure**: **formule**: RS / (ES + BFR)
**calcul**: 105 000 / (110 000 − 2 000) = 0,97
**lecture**: Proche de 1 : les ressources stables couvrent presque les emplois durables. Légère insuffisance.
**ratio_de_liquidité**: **formule**: (Créances clients + Disponibilités) / (Dettes circulantes + Découvert bancaire)
**calcul**: (10 000 + 2 000) / (35 000 + 5 000) = 0,30
**lecture**: Très faible : la société ne peut couvrir ses dettes courtes à court terme avec ses actifs liquides seuls.
**ratio_autonomie_financière**: **formule**: Capitaux propres / Dettes financières
**calcul**: 55 000 / 40 000 = 1,38
**lecture**: Supérieur à 1 : les fonds propres excèdent les dettes financières. Indépendance financière satisfaisante.
**ratio_de_solvabilité**: **formule**: Total actifs / Total dettes
**calcul**: (110 000 + 23 000 + 10 000 + 2 000) / (40 000 + 20 000 + 15 000 + 5 000) = 145 000 / 80 000 = 1,81
**lecture**: Supérieur à 1 : l'actif total couvre les dettes. La société est globalement solvable.

## Result

Bilan fonctionnel construit (total équilibré 145 000 €), FRNG = −5 000 €, BFR = −2 000 €, TN = −3 000 €. Ratios : structure 0,97 | liquidité 0,30 | autonomie 1,38 | solvabilité 1,81.

## Next

- Analyser l'évolution de ces ratios sur 2 ou 3 exercices (analyse dynamique)
- Comparer avec les normes sectorielles (streaming / tech start-up)
- Étudier les leviers pour redresser la trésorerie : négocier les délais fournisseurs, accélérer les encaissements clients, refinancer une partie des dettes CT en LT
