---
id: resource-s5-programmation-en-java-projet-2024-pdf-ead0fc22
slug: resource-s5-programmation-en-java-projet-2024-pdf-ead0fc22
source_key: 'sha256:ead0fc229259c7954d3f1fec840e527bca7758e19a4152bbaeeff9a79bbc351c'
part_of: S5 - Programmation en Java
order: 1
manifest: null
derived_from: 'sha256:ead0fc229259c7954d3f1fec840e527bca7758e19a4152bbaeeff9a79bbc351c'
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
lane: resources
schema_version: '1'
tags:
  - java
  - jdbc
  - projet-etudiant
  - base-de-donnees
  - menu-console
  - poo
domain: génie-logiciel
---
# S5 - Programmation en Java — Projet 2024.pdf

## Summary

Cahier des charges du projet final Java S5 (rendu 16/01/2024). L'application est une interface console de gestion de programmeurs stockés en base de données, pilotée par un menu à 6 options (lister, supprimer par id ×2, ajouter, modifier, quitter). Elle impose une architecture précise : classe `Programmeur`, interface `ActionsBDD`, implémentation `ActionsBDDImpl`, classe `Menu`, classe `Start` (main ≤ 2 instructions). Livrables : code source + JavaDoc + readme.txt.

## Fields/API

**name**: Menu options
**value**: 1=lister tous, 2=supprimer (par id), 3=supprimer (autre critère), 4=ajouter, 5=modifier (par id), 6=quitter ; saisie invalide → message d'erreur, menu représenté à chaque fois
**name**: Classe Programmeur
**value**: Attributs = colonnes table Programmeur ; anNaissance: int, salaire: double, prime: double ; 3 exceptions spécifiques à gérer
**name**: Interface ActionsBDD
**value**: Déclare toutes les méthodes correspondant aux 5 options fonctionnelles du menu
**name**: Classe ActionsBDDImpl
**value**: Implémente ActionsBDD ; toutes les requêtes SQL déclarées dans des constantes séparées
**name**: Classe Menu
**value**: Gère la saisie utilisateur et le dispatch vers ActionsBDDImpl
**name**: Classe Start
**value**: Contient main() ; maximum 2 instructions dans main
**name**: Base de données
**value**: SGBD au choix ; base PROG_BD ; utilisateur/mot de passe au choix
**name**: Livrables
**value**: Code source, JavaDoc, readme.txt (instructions lancement, SGBD choisi, fonctionnalités manquantes + raison, améliorations ajoutées)
**name**: Dépôt
**value**: Espace « Rendu Projet LSIx » — pas d'envoi par mail
**name**: Délai
**value**: 16/01/2024 à 23:55

## Constraints

- main() ≤ 2 instructions
- Toutes les requêtes SQL dans des constantes (déclarées globalement, initialisées localement)
- Les améliorations ne doivent pas supprimer les fonctionnalités de base
- Architecture obligatoire : Programmeur + ActionsBDD + ActionsBDDImpl + Menu + Start
- Gestion des exceptions obligatoire (dont 3 exceptions spécifiques à Programmeur)
- JavaDoc obligatoire

## Examples

- Choix 1 → affichage tabulaire de tous les programmeurs en base
- Choix 2 → saisie d'un id ; message si id inexistant, suppression si id valide
- Choix 5 → saisie d'un id ; message si id inexistant, modification des champs si id valide
- Amélioration possible : interface graphique, statistiques, tables supplémentaires en base
