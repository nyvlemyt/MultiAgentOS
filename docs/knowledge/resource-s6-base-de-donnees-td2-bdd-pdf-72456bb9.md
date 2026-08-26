---
id: resource-s6-base-de-donnees-td2-bdd-pdf-72456bb9
slug: resource-s6-base-de-donnees-td2-bdd-pdf-72456bb9
source_key: 'sha256:72456bb9981ab0700dfbf48a191e5cd689945aebd08ebbacd1fb7cdafe3bf61e'
part_of: S6 - Base de données
order: 4
manifest: null
derived_from: 'sha256:72456bb9981ab0700dfbf48a191e5cd689945aebd08ebbacd1fb7cdafe3bf61e'
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
  - bases-de-données
  - modélisation
  - schéma-relationnel
  - normalisation
  - SQL
  - E/A
  - 3FN
  - clés-primaires
  - clés-étrangères
domain: informatique / bases de données
---
# S6 - Base de données — TD2_BDD.pdf

## Goal

Pratiquer la modélisation de bases de données relationnelles : traduire des besoins métier en diagramme E/A, puis en schéma relationnel, puis normaliser en 3FN.

## Prerequisites

- Connaître le modèle entité-association (E/A)
- Comprendre les notions de clé primaire, clé étrangère et dépendance fonctionnelle
- Maîtriser les formes normales (1FN, 2FN, 3FN)

## Steps

**step**: 1
**title**: Exercice 1 — Traduction E/A → relationnel
**content**: À partir de diagrammes E/A fournis, dériver les tables relationnelles en identifiant : entités → tables, associations → clés étrangères ou tables de jonction, cardinalités → contraintes. Souligner les clés primaires, marquer les clés étrangères avec #.
**step**: 2
**title**: Exercice 2 — Cas Fnak.com (vente de CD en ligne)
**content**: Analyser le cahier des charges : clients (nom, prénom, adresse, téléphone, e-mail, mdp, programme fidélité), CD (titre, auteur, pochette, description, édition spéciale, prix), pistes de CD, paniers, lignes de panier (CD + quantité), factures (numéro unique, adresse facturation, adresse livraison, liste CD). Étapes : (a) proposer le diagramme E/A avec contraintes hors-diagramme ; (b) traduire en schéma relationnel avec clés primaires, clés étrangères et domaines ; (c) vérifier et proposer la version en 3FN.
**step**: 3
**title**: Exercice 3 — Normalisation de la relation Projection
**content**: Relation universelle : Projection(NumFilm, TitreFilm, DuréeFilm, NumSalle, NomSalle, CapacitéSalle, TypePlace, PrixPlace, DateProjection, HeureDeb). Identifier une clé primaire (ex. NumFilm, NumSalle, DateProjection, HeureDeb ou TypePlace). Repérer les dépendances fonctionnelles transitives (NomSalle et CapacitéSalle dépendent de NumSalle ; PrixPlace dépend de TypePlace ; TitreFilm et DuréeFilm dépendent de NumFilm). Éclater en tables autonomes pour atteindre la 3FN.
**step**: 4
**title**: Exercice 4 — Audit 3FN du schéma supérette
**content**: Schéma : Affecter(NoCaisse, Hdeb, Hfin, Caissiere, SomInit, SomFin) ; Facture(NoFact, NoCaisse, Dfact, Typepaie) ; LigneFact(NoFact, Article, PrixUnit, Qte). Vérifier les choix de clés (ex. clé de Affecter = NoCaisse + Hdeb d'après la contrainte d'unicité caissière/créneau). Analyser chaque table : dépendances partielles ou transitives ? LigneFact : PrixUnit dépend-il de Article seul (dépendance partielle sur NoFact) ? Proposer les corrections si hors 3FN.

## Result

À l'issue de ces quatre exercices, l'apprenant sait : lire un cahier des charges et le modéliser en E/A, dériver mécaniquement le schéma relationnel, identifier les violations de 2FN/3FN (dépendances partielles et transitives), et proposer un schéma normalisé en 3FN.

## Next

- Implémenter le schéma normalisé en SQL (CREATE TABLE avec contraintes FK)
- Écrire des requêtes SELECT, JOIN, GROUP BY sur le schéma Fnak.com ou supérette
- Explorer la forme normale de Boyce-Codd (BCNF) pour les cas limites de 3FN
