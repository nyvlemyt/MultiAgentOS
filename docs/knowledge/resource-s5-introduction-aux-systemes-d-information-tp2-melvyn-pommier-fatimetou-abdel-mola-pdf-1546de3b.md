---
id: >-
  resource-s5-introduction-aux-systemes-d-information-tp2-melvyn-pommier-fatimetou-abdel-mola-pdf-1546de3b
slug: >-
  resource-s5-introduction-aux-systemes-d-information-tp2-melvyn-pommier-fatimetou-abdel-mola-pdf-1546de3b
source_key: 'sha256:1546de3beb5f24f1d06099b34e2ac73ceefec90a9909e72ee0a08ccb6e7f3376'
part_of: resource-s5-introduction-aux-systemes-d-information-11016ded
order: 3
manifest: null
derived_from: 'sha256:1546de3beb5f24f1d06099b34e2ac73ceefec90a9909e72ee0a08ccb6e7f3376'
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
  - use-case
  - UML
  - GAB
  - ATM
  - systèmes-d-information
  - banking
  - analyse-fonctionnelle
  - LSI3
domain: information-systems
---
# S5 - Introduction aux systèmes d'information — TP2 - Melvyn POMMIER - Fatimetou ABDEL MOLA.pdf

## Summary

Spécifications de 4 cas d'utilisation pour un Guichet Automatique Bancaire (GAB) : consultation de solde, retrait d'argent, dépôt d'argent liquide et dépôt de chèques. Chaque fiche suit le template UML standard (pré/post-conditions, règles de gestion, scénario nominal, extensions, priorité). TP2 — cours Introduction aux SI, LSI3, octobre 2024.

## Fields/API

**name**: Use case #
**type**: string
**description**: Nom du cas d'utilisation
**name**: Scénario #
**type**: string
**description**: Description courte du scénario couvert
**name**: Objectif dans le contexte
**type**: string
**description**: But fonctionnel du cas d'utilisation pour l'utilisateur
**name**: Pré-conditions
**type**: string
**description**: État du système requis avant l'exécution du cas
**name**: Post-condition (réussite)
**type**: string
**description**: État du système après exécution réussie
**name**: Post-condition (échec)
**type**: string
**description**: Message ou état du système en cas d'échec
**name**: Règles de gestion
**type**: string
**description**: Contraintes métier conditionnant la transaction
**name**: Description
**type**: ordered-list
**description**: Scénario nominal étape par étape
**name**: Extensions
**type**: ordered-list
**description**: Scénarios alternatifs ou d'échec, référencés par étape (ex : 1a, 2a)
**name**: Priorité
**type**: string
**description**: Criticité du cas pour l'utilisateur et/ou la banque

## Constraints

- Carte valide obligatoire et authentification PIN réussie pour tout accès.
- Retrait : solde suffisant ET distributeur approvisionné requis.
- Dépôt liquide : argent inséré correctement et GAB capable de traiter le dépôt.
- Dépôt chèque : confirmé uniquement après vérification/scan du chèque ; limite de dépôt applicable.
- Après 3 échecs PIN : session terminée.
- Échec connexion serveur : transaction annulée et billets/chèque retournés.
- Priorités : consultation = critique utilisateur / modéré banque ; retrait & dépôt liquide = critique pour les deux ; dépôt chèque = modéré utilisateur / élevé banque.

## Examples

**id**: UC1
**name**: Consultation de solde
**preconditions**: Carte valide insérée, authentification PIN réussie.
**nominal**: - Insérer carte
- Saisir PIN
- Sélectionner 'Consulter le solde'
- GAB affiche le solde récupéré du serveur.
**extensions**: - 1a : carte invalide → message d'erreur + fin de session
- 2a : PIN incorrect → nouvelle tentative ou fin après 3 échecs
- 3a : échec connexion serveur → message d'erreur + fin de session
**priority**: Critique utilisateur, modéré banque
**id**: UC2
**name**: Retrait d'argent
**preconditions**: Utilisateur authentifié, fonds suffisants.
**nominal**: - Insérer carte et s'authentifier
- Sélectionner 'Retrait d'argent' et le montant
- GAB vérifie fonds et distribue l'argent
- Solde mis à jour et reçu imprimé si demandé.
**extensions**: - 1a : fonds insuffisants → message d'erreur
- 2a : distributeur vide → informer l'utilisateur
- 3a : échec connexion serveur → message d'erreur + fin de session
**priority**: Critique utilisateur et organisation
**id**: UC3
**name**: Dépôt d'argent liquide
**preconditions**: Carte valide insérée, utilisateur authentifié.
**nominal**: - Insérer carte et s'authentifier
- Sélectionner 'Dépôt d'argent'
- Insérer l'argent dans le compartiment dédié
- GAB vérifie, compte l'argent et crédite le compte.
**extensions**: - 1a : dépôt échoue → message + renvoi de l'argent
- 2a : GAB ne peut traiter → fonction temporairement indisponible
- 3a : échec connexion serveur → annulation + renvoi des billets
**priority**: Critique utilisateur et organisation
**id**: UC4
**name**: Dépôt de chèques
**preconditions**: Utilisateur authentifié, chèque valide en sa possession.
**nominal**: - Insérer carte et s'authentifier
- Sélectionner 'Dépôt de chèques'
- Insérer le chèque dans l'emplacement prévu
- GAB scanne le chèque et enregistre le dépôt.
**extensions**: - 1a : chèque rejeté → message d'erreur + renvoi du chèque
- 2a : limite de dépôt atteinte → dépôt impossible
- 3a : échec connexion serveur → impression reçu 'dépôt en attente'
**priority**: Modéré utilisateur, élevé banque
