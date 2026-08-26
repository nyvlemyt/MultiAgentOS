---
id: >-
  resource-s6-culture-economique-financiere-support-de-cours-ratios-danalyse-pdf-7d192de2
slug: >-
  resource-s6-culture-economique-financiere-support-de-cours-ratios-danalyse-pdf-7d192de2
source_key: 'sha256:7d192de27884f16d35a15c1648121b0393e8ef244211e75bbfdfc249033f868b'
part_of: resource-s6-culture-economique-financiere-e643c91c
order: 8
manifest: null
derived_from: 'sha256:7d192de27884f16d35a15c1648121b0393e8ef244211e75bbfdfc249033f868b'
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
  - finance
  - ratios
  - analyse-financiere
  - bilan
  - rentabilite
  - solvabilite
  - liquidite
domain: culture-economique-financiere
---
# S6 - Culture économique & financière — Support de cours - Ratios danalyse.pdf

## Summary

Présentation des principaux ratios d'analyse financière utilisés pour évaluer la performance, la structure et la rentabilité d'une entreprise. La permanence de la méthode de calcul est primordiale ; chaque ratio doit être interprété dans le temps, par rapport aux concurrents et aux normes sectorielles.

## Fields/API

**name**: Ratios d'activité — Délai clients
**formula**: (Créances clients / CA TTC) × 360
**unit**: jours
**interpretation**: Durée moyenne de règlement des clients
**name**: Ratios d'activité — Délai fournisseurs
**formula**: (Dettes fournisseurs / (Achats + autres charges externes)) × 360
**unit**: jours
**interpretation**: Durée moyenne de règlement des fournisseurs
**name**: Ratio de structure solide
**formula**: Ressources stables / (Emplois stables + BFR)
**unit**: coefficient
**interpretation**: Les ressources couvrent-elles investissements + besoin d'exploitation ?
**name**: Ratio de liquidité
**formula**: (Créances clients + Trésorerie actif) / (Dettes circulantes + Découverts bancaires)
**unit**: coefficient
**interpretation**: Le potentiel de trésorerie permet-il de régler les dettes à court terme ?
**name**: Ratio d'autonomie financière
**formula**: Capitaux propres / Dettes financières à MLT
**unit**: coefficient
**interpretation**: Qui contrôle l'entreprise — actionnaires ou créanciers ?
**name**: Ratio de solvabilité
**formula**: Actifs / Dettes
**unit**: coefficient
**interpretation**: Capacité à rembourser toutes les dettes par cession des actifs en cas de liquidation
**name**: Taux de marge brute d'exploitation (profitabilité)
**formula**: EBE / CA
**unit**: %
**interpretation**: Capacité à générer du résultat positif à partir du CA ; résultante de la politique de prix et du niveau des coûts
**name**: Taux de marge nette d'exploitation
**formula**: Résultat d'Exploitation / CA
**unit**: %
**interpretation**: Profitabilité après charges d'exploitation
**name**: Taux de marge bénéficiaire
**formula**: Résultat Net / CA
**unit**: %
**interpretation**: Profitabilité finale après IS
**name**: Taux de rentabilité économique brute (Re)
**formula**: Résultat d'Exploitation / Ressources stables totales
**unit**: %
**interpretation**: Capacité à générer du résultat à partir de l'ensemble des ressources engagées (propres + dettes)
**name**: Taux de rentabilité financière (Rf)
**formula**: Résultat Net / Capitaux propres
**unit**: %
**interpretation**: Rendement des capitaux propres pour les actionnaires

## Constraints

- La permanence de la méthode de calcul est indispensable pour comparer les ratios dans le temps.
- Un ratio n'a de sens qu'en comparaison : évolution temporelle, concurrents, normes sectorielles.
- Profitabilité ≠ Rentabilité : la profitabilité se lit sur les SIG (compte de résultat) ; la rentabilité rapporte un résultat aux moyens du bilan.
- L'effet de levier financier amplifie Rf > Re quand le taux d'intérêt < Re, mais détruit de la valeur quand le taux d'intérêt > Re (cas Z dans le tableau : Rf = 8 % < Re = 15 % à cause de frais financiers élevés à 17 %).

## Examples

**label**: Entreprise X — sans dette
**detail**: CP = 2000, Dettes LT = 0, RE = 300, RN = 200. Re = 300/2000 = 15 %. Rf = 200/2000 = 10 %. Sans levier, Rf < Re.
**label**: Entreprise Y — levier positif (taux intérêt 10 % < Re 15 %)
**detail**: CP = 800, Dettes LT = 1200, RE = 300, Frais financiers = 120, RN = 120. Re = 15 %. Rf = 120/800 = 15 %. Le levier améliore Rf.
**label**: Entreprise Z — levier négatif (taux intérêt 17 % > Re 15 %)
**detail**: CP = 800, Dettes LT = 1200, RE = 300, Frais financiers = 204, RN = 64. Re = 15 %. Rf = 64/800 = 8 %. Le levier détruit de la valeur pour les actionnaires.
