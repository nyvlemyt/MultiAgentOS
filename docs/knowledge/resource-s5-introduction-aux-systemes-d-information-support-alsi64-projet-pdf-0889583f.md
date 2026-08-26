---
id: >-
  resource-s5-introduction-aux-systemes-d-information-support-alsi64-projet-pdf-0889583f
slug: >-
  resource-s5-introduction-aux-systemes-d-information-support-alsi64-projet-pdf-0889583f
source_key: 'sha256:0889583fc35099b5dd2931d7062bb529d55ad78bcbfb14a7c86bbe085d5a33e4'
part_of: S5 - Introduction aux systèmes d'information
order: 2
manifest: null
derived_from: 'sha256:0889583fc35099b5dd2931d7062bb529d55ad78bcbfb14a7c86bbe085d5a33e4'
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
lane: workflows
schema_version: '1'
tags:
  - UML
  - analyse
  - conception
  - système d'information
  - e-commerce
  - cas d'utilisation
  - diagramme de classes
  - modélisation
domain: Génie logiciel / Systèmes d'information
---
# S5 - Introduction aux systèmes d'information — Support ALSI64 Projet.pdf

## Summary

Cahier des charges d'un projet étudiant (ALSI64, 2024-25) portant sur une boutique en ligne de produits audiovisuels. Le document définit le contexte applicatif, les fonctionnalités attendues et une séquence de 9 livrables UML à produire en équipe de 3-4 étudiants, présentés en soutenance de 20 min.

## Fields/API

**name**: Contexte applicatif
**value**: Application Web de vente de produits audiovisuels (caméras, micros, cartes mémoire, moniteurs, streamers, etc.) avec catalogue par catégories, panier/commande et espace administration.
**name**: Acteurs
**value**: Visiteur anonyme (consultation catalogue) · Utilisateur authentifié (commande, like, profil, contact) · Administrateur (validation comptes, gestion produits/profils, réinitialisation mot de passe)
**name**: Fonctionnalités clés
**value**: Inscription (compte inactif jusqu'à validation admin) · Connexion par email + mot de passe · Catalogue par catégories + promotions · Like produit (compteur visible) · Commande depuis fiche produit · Gestion profil (avatar, nom, prénom, adresse) · Messagerie webmaster · Note de satisfaction entreprise (0-10)
**name**: Règles métier notables
**value**: Login = adresse mail (identifiant non modifiable) · Seul l'admin peut valider/radier un compte · Suppression produit possible uniquement si stock = 0 · Avatar modifiable par l'utilisateur
**name**: Livrables UML demandés
**value**: 1. Diagramme de cas d'utilisation + description textuelle · 2. Diagrammes de séquence système · 3. Modèle du domaine (diagramme de classes) · 4. Maquettes UI · 5. Diagramme d'activité (navigation/cinématique) · 6. Diagramme état-transition (cycle de vie produit) · 7. Diagramme de classes participantes (domaine + contrôle + interface) · 8. Diagrammes d'interaction détaillés (classes participantes) · 9. Diagramme de classes de conception (avec opérations)
**name**: Contraintes organisationnelles
**value**: Équipe de 3-4 étudiants · Rapport écrit + soutenance 20 min à la dernière séance

## Constraints

- Le compte utilisateur n'est actif qu'après validation explicite par l'administrateur.
- Un produit ne peut être supprimé que si son stock est à 0.
- L'adresse mail est l'identifiant unique et non modifiable.
- Seul l'administrateur existe par défaut ; tout autre compte doit être créé puis validé.
- Les diagrammes d'interaction (livrable 8) doivent s'appuyer sur les classes du diagramme participantes (livrable 7), pas sur une boîte noire système.

## Examples

- Cas d'utilisation 'Passer commande' : acteur = Utilisateur authentifié → pré-condition : compte validé + produit sélectionné → flux : visualiser fiche produit → cliquer 'commander'.
- Cycle de vie produit (diagramme état-transition) : états typiques attendus → Disponible / En rupture / Obsolète (suppression si stock=0).
- Diagramme de classes participantes : classe Produit (domaine) + ProduitController (contrôle) + ProduitView (interface) collaborant pour le cas 'Visualiser fiche produit'.
