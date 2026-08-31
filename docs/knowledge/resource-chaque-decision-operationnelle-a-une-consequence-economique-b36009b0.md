---
id: resource-chaque-decision-operationnelle-a-une-consequence-economique-b36009b0
slug: resource-chaque-decision-operationnelle-a-une-consequence-economique-b36009b0
source_key: 'sha256:b36009b059827d717adf950dbc27d67faeddf9be0bfc7b9d23c83a570e4d29f8'
part_of: null
order: null
manifest: null
derived_from: 'sha256:b36009b059827d717adf950dbc27d67faeddf9be0bfc7b9d23c83a570e4d29f8'
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
  - comptabilité
  - bilan
  - compte-de-résultat
  - SIG
  - BFR
  - fonds-de-roulement
  - amortissement
  - rentabilité
  - ingénierie-management
domain: gestion-financière
---
# CHAQUE DECISION OPERATIONNELLE A UNE CONSEQUENCE ECONOMIQUE

## Summary

Cours d'introduction à la gestion financière pour ingénieurs (EFREI). Couvre les deux documents comptables obligatoires (bilan et compte de résultat), leur articulation, les soldes intermédiaires de gestion (SIG), la capacité d'autofinancement (CAF), l'analyse fonctionnelle du bilan (FR / BFR / trésorerie) et les principaux ratios d'activité, de structure et de rentabilité. Fil conducteur : toute décision opérationnelle a une conséquence économique mesurable.

## Fields/API

**name**: Compte de résultat
**definition**: Tableau charges/produits sur une période. Classe les éléments en trois natures : exploitation, financier, exceptionnel. Enregistre les opérations à la date du fait générateur (facture), indépendamment de l'encaissement.
**formula**: Résultat = Produits − Charges
**levels**: - Résultat d'exploitation (REX / EBIT) = produits d'exploitation − charges d'exploitation
- Résultat courant = REX ± résultat financier
- Résultat net = Résultat courant ± résultat exceptionnel − IS
**name**: Amortissement
**definition**: Étalement du coût d'un investissement sur sa durée de vie estimée. Charge calculée (non décaissable). Réduit le résultat imposable.
**formula**: Amortissement annuel linéaire = Valeur d'origine / Durée de vie
**example**: Serveurs 100 000 € sur 5 ans → 20 000 €/an. Valeur nette comptable année 3 = 40 000 €.
**name**: Bilan
**definition**: Photographie du patrimoine à un instant T. ACTIF (emplois, classés par liquidité croissante) = PASSIF (ressources, classées par exigibilité croissante). Toujours équilibré.
**structure**: **actif**: - Immobilisations incorporelles/corporelles/financières
- Stocks
- Créances clients
- Trésorerie
**passif**: - Capitaux propres (capital + réserves + résultat)
- Dettes financières LT
- Dettes d'exploitation (fournisseurs, fiscales, sociales)
- Dettes financières CT (découverts)
**name**: Liens Bilan ↔ Compte de résultat
**definition**: Le résultat du compte de résultat s'inscrit au passif du bilan. Patrimoine ≠ Trésorerie : on peut être bénéficiaire et en découvert (décalages de paiement, créances non encaissées, amortissements non décaissés).
**name**: SIG — Soldes Intermédiaires de Gestion
**chain**: - Marge commerciale = Ventes marchandises − Coût d'achat des marchandises vendues  (négoce)
- Production = Production vendue ± stockée + immobilisée  (industrie/service)
- Valeur Ajoutée (VA) = Production + Marge commerciale − Consommations externes
- EBE (EBITDA) = VA + Subventions − Charges de personnel − Impôts & taxes
- REX (EBIT) = EBE − Dotations amortissements ± Provisions
- Résultat courant = REX ± Résultat financier
- Résultat net = Résultat courant ± Résultat exceptionnel − IS
**note**: VA se répartit entre : salariés (charges personnel), État (impôts/taxes), prêteurs (charges financières), actionnaires (dividendes), entreprise (amortissements + résultat non distribué).
**name**: CAF — Capacité d'Autofinancement
**formula**: CAF = EBE + autres produits encaissables − autres charges décaissables
**alt_formula**: CAF ≈ Résultat net + charges non décaissables (amortissements, provisions) − produits non encaissables
**uses**: - Financer investissements
- Couvrir provisions/pertes
- Rembourser emprunts
- Améliorer trésorerie
- Verser dividendes
**note**: Autofinancement = CAF − Dividendes versés. Produits de cession d'actifs exclus du calcul (caractère exceptionnel).
**name**: Bilan fonctionnel — FR / BFR / Trésorerie
**definitions**: **FR (Fonds de Roulement)**: Ressources stables − Emplois stables. Mesure si les investissements LT sont financés par des ressources LT.
**BFR (Besoin en Fonds de Roulement)**: Stocks + Créances clients − Dettes fournisseurs − Autres dettes circulantes. Besoin permanent lié au cycle d'exploitation.
**Trésorerie nette**: FR − BFR
**rule**: Équilibre sain : FR > 0 ET FR ≥ BFR. Si BFR > FR → problème de trésorerie.
**levers_BFR**: **réduire créances**: Raccourcir délais clients, acomptes, veille solvabilité
**réduire stocks**: Optimiser approvisionnements, plannings, coordination ventes/production
**allonger dettes**: Négocier délais fournisseurs
**name**: Ratios clés
**activity**: **Délai clients (jours)**: Créances clients / CA TTC × 360
**Délai fournisseurs (jours)**: Dettes fournisseurs / (Achats + charges externes) × 360
**structure**: **Couverture emplois stables**: Ressources stables / (Emplois stables + BFR)
**Liquidité**: (Créances + Trésorerie actif) / (Dettes circulantes + Découverts)
**Autonomie financière**: Capitaux propres / Dettes financières MLT
**Solvabilité**: Actif total / Dettes totales
**profitability**: **Taux marge brute exploitation**: EBE / CA
**Taux marge nette exploitation**: REX / CA
**Taux marge bénéficiaire**: Résultat net / CA
**Rentabilité économique (Re)**: REX / Ressources stables
**Rentabilité financière (Rf)**: Résultat net / Capitaux propres
**name**: Taux IS (France)
**value**: 25 % (taux normal) ; 15 % jusqu'à 38 120 € de bénéfice si CA < 10 M€

## Constraints

- Actif = Passif (identité comptable absolue).
- Le compte de résultat suit le principe de la comptabilité d'engagement : la date d'encaissement n'a pas d'impact sur le résultat.
- Résultat ≠ Trésorerie en présence de délais de paiement, d'amortissements ou d'emprunts.
- Le remboursement du capital d'un emprunt est un flux de bilan (pas une charge du compte de résultat).
- L'amortissement est une charge calculée, non décaissable : il n'affecte pas directement la trésorerie.
- Seule la production vendue enrichit l'entreprise sur l'exercice ; la production stockée augmente les stocks mais peut masquer des difficultés commerciales.
- Aucune compensation créance/dette envers un même tiers n'est possible comptablement.
- Délai inter-entreprises par défaut : 30 jours max (Code de commerce) ; négocié jusqu'à 60 jours.

## Examples

**label**: Compte de résultat Stream-musicefrei
**data**: Produits d'exploitation : 1 780 000 € (abonnements 1 400 000 + annonceurs 380 000). Charges d'exploitation : 1 190 000 €. REX = 590 000 €. Résultat courant = 600 000 €. IS = 150 000 €. Résultat net = 450 000 €.
**label**: Bilan fin d'année 1 — Stream-musicefrei
**data**: Actif : Immobilisations nettes 450 000 €, Créances 150 000 €, Trésorerie 640 000 € → Total 1 240 000 €. Passif : Capital 600 000 €, Résultat 450 000 €, Emprunts 180 000 €, Dettes fournisseurs 10 000 € → Total 1 240 000 €.
**label**: Amortissement linéaire
**data**: Bien 50 000 € sur 5 ans → annuité 10 000 €. Valeur nette après 3 ans = 20 000 €.
**label**: Effet levier financier
**data**: Trois entreprises X/Y/Z avec REX = 300, Re = 15 %. X (sans dette) : Rf = 10 %. Y (dette LT 1 200 à 10 %) : Rf = 15 %. Z (même dette à 17 %) : Rf = 8 %. → L'endettement amplifie Rf si Re > taux d'intérêt, la détériore sinon.
**label**: Calcul de la marge commerciale
**data**: CA = 2 400, Achats = 500, SI = 140, SF = 100. Coût d'achat vendues = 540. Marge = 1 860. Taux de marge = 3,4 ; taux de marque = 0,77.
