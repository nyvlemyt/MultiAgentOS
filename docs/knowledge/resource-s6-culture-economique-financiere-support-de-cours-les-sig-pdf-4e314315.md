---
id: >-
  resource-s6-culture-economique-financiere-support-de-cours-les-sig-pdf-4e314315
slug: >-
  resource-s6-culture-economique-financiere-support-de-cours-les-sig-pdf-4e314315
source_key: 'sha256:4e3143153af43370ccb32250e39352d06380726c6a46b73f6b9587494d3a7d76'
part_of: S6 - Culture économique & financière
order: 7
manifest: null
derived_from: 'sha256:4e3143153af43370ccb32250e39352d06380726c6a46b73f6b9587494d3a7d76'
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
  - SIG
  - analyse-financière
  - EBE
  - valeur-ajoutée
  - CAF
  - marge-commerciale
  - résultat-exploitation
  - comptabilité
  - indicateurs-financiers
domain: finance & comptabilité
---
# S6 - Culture économique & financière — Support de cours - Les SIG.pdf

## Summary

Les Soldes Intermédiaires de Gestion (SIG) décomposent la formation du résultat net en une cascade d'indicateurs pour comprendre où l'entreprise crée ou détruit de la richesse. Ils distinguent trois niveaux (exploitation, financier, exceptionnel) et séparent charges décaissables / non décaissables, permettant une lecture de la performance indépendante des choix de financement ou d'amortissement.

## Fields/API

**name**: Chiffre d'affaires (CA)
**definition**: Montant net HT des ventes de la période (marchandises, production vendue ou prestations), après réductions commerciales.
**formula**: CA = ventes nettes HT
**name**: Marge commerciale
**definition**: Richesse dégagée par le négoce pur (revente sans transformation). Indicateur clé des entreprises commerciales.
**formula**: Marge = Ventes de marchandises − Coût d'achat des marchandises vendues
CAMV = Achats de marchandises +/− Variation de stocks
Taux de marge = Marge / CAMV
Taux de marque = Marge / CA HT
**name**: Production
**definition**: Notion plus large que le CA pour les entreprises de production/service ; inclut ce qui est vendu, stocké ou utilisé en interne.
**formula**: Production = Production vendue + Production stockée (+/−) + Production immobilisée
**name**: Valeur Ajoutée (VA)
**definition**: Richesse créée par l'entreprise : ce qu'elle ajoute aux biens et services achetés à l'extérieur. Répartie entre salariés, État, prêteurs, actionnaires et l'entreprise elle-même.
**formula**: VA = Production + Marge commerciale − Consommations en provenance des tiers
(Consommations tiers = MP + appros + services extérieurs + sous-traitance + crédit-bail + énergie…)
**name**: Excédent Brut d'Exploitation (EBE / EBITDA)
**definition**: Résultat généré par l'activité courante avant politique financière et amortissements ; potentiel de trésorerie d'exploitation. Indépendant de la politique d'endettement, des taux d'intérêt et de la politique d'amortissement.
**formula**: EBE = VA + Subventions d'exploitation − Impôts et taxes − Charges de personnel
**name**: Résultat d'Exploitation (REX / EBIT)
**definition**: EBE corrigé de l'effort d'investissement (amortissements) et de l'estimation des risques (provisions). Mesure la performance opérationnelle indépendamment de la politique financière et fiscale.
**formula**: REX = EBE − Dotations aux amortissements & dépréciations − Dotations aux provisions + Reprises de provisions +/− Autres produits et charges d'exploitation
**name**: Résultat Courant
**definition**: Résultat récurrent intégrant le coût de la politique de financement (charges et produits financiers).
**formula**: Résultat Courant = REX + Produits financiers − Charges financières
**name**: Résultat Net
**definition**: Solde final après éléments exceptionnels, participation des salariés et impôt société. Destiné à être réinvesti ou distribué.
**formula**: Résultat Net = Résultat Courant + Résultat Exceptionnel − Participation des salariés − Impôt sur les sociétés
**name**: Capacité d'Autofinancement (CAF)
**definition**: Flux net potentiel de trésorerie généré par l'activité ; différent du résultat net car réintègre les charges non décaissables (amortissements, provisions).
**formula**: CAF = EBE + Autres produits encaissables − Autres charges décaissables
(ou : CAF = Résultat Net + charges non décaissables − produits non encaissables, hors cessions d'actifs)
**name**: Autofinancement
**definition**: Part de la CAF effectivement conservée dans l'entreprise pour financer son développement.
**formula**: Autofinancement = CAF − Dividendes versés

## Constraints

- La marge commerciale s'applique uniquement aux entreprises de négoce (revente sans transformation).
- Seule la production vendue enrichit l'entreprise sur l'exercice ; une forte hausse de la production stockée est un signal d'alerte (problème de ventes ou de prévision).
- Les cessions d'immobilisation sont exclues du calcul de la CAF (caractère exceptionnel, hors activité normale).
- EBE, REX et CAF sont indépendants de la politique d'amortissement ; le résultat courant intègre la politique financière ; le résultat net intègre les éléments exceptionnels.
- Les amortissements et provisions sont des charges calculées (non décaissables) : ils réduisent le résultat comptable sans sortie de trésorerie.
- 5 % des bénéfices sont légalement obligatoires en réserve dans la limite de 10 % du capital (contrainte sur la distribution de dividendes).
- Une CAF insuffisante implique un recours obligatoire à des fonds externes (emprunt, augmentation de capital), fragilisant la relation avec banquiers et actionnaires.

## Examples

**label**: Calcul de la marge commerciale (négoce)
**data**: CA = 2 400 ; Achats marchandises = 500 ; Stock initial = 140 ; Stock final = 100
**result**: CAMV = 500 + (140 − 100) = 540 | Marge = 2 400 − 540 = 1 860 | Taux de marge = 1 860 / 540 = 3,4 (1 € de coût génère 3,4 € de marge) | Taux de marque = 1 860 / 2 400 = 0,77 (1 € de vente génère 0,77 € de marge)
**label**: Lecture comparative N vs N-1 (tableau SIG complet)
**data**: N : CA vendu 66 850 (−5 %), production stockée 8 350 (+++), VA 52 290 (+7 %), EBE 8 290 (−9 %), DAP 7 830 (+++), Provisions 4 920 (+++), REX −1 830, Charges financières 11 260 (++++) , Résultat net −8 700 | N-1 : CA 70 500, VA 48 700, EBE 9 100, REX 6 610, Résultat net 4 310
**result**: Diagnostic en cascade : (1) augmentation de la production masque un recul des ventes réelles ; (2) amélioration de la VA par baisse des consommations intermédiaires ; (3) dégradation de l'EBE malgré la VA en hausse → forte augmentation des charges de personnel (pb productivité) ; (4) REX déficitaire en N → nouveaux investissements (DAP ++) + provisions clients (qualité portefeuille ?) ; (5) résultat courant fortement négatif → frais financiers élevés révélant un déséquilibre de la structure financière.
