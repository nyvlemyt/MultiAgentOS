---
id: resource-s6-base-de-donnees-cours1-intro-ea-pdf-e43661c1
slug: resource-s6-base-de-donnees-cours1-intro-ea-pdf-e43661c1
source_key: 'sha256:e43661c11f2114e3a2c35e9cb1dd3239e4f58009f111b69f51069fe898b2c7a4'
part_of: S6 - Base de données
order: 1
manifest: null
derived_from: 'sha256:e43661c11f2114e3a2c35e9cb1dd3239e4f58009f111b69f51069fe898b2c7a4'
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
  - bases-de-données
  - SGBD
  - modèle-E/A
  - entité-association
  - MCD
  - MLD
  - MPD
  - cardinalités
  - modèle-conceptuel
  - modèle-relationnel
domain: database-design
---
# S6 - Base de données — Cours1_intro-EA.pdf

## Summary

Référentiel des concepts fondamentaux des SGBD et du Modèle Entité/Association (E/A). Couvre : motivation et historique des SGBD (avant 1960 → 2000), architecture trois couches (conceptuelle/logique/physique), et l'intégralité des primitives du MCD — entités, associations, propriétés, clés, cardinalités, types d'association, conseils de conception. Cours ALSI61, 2024-2025.

## Fields/API

**Base de données (BDD)**: Conteneur de données structurées mémorisées sur support permanent, interrogeable et partageable par plusieurs applications.
**SGBD**: Logiciel permettant de stocker, lire, écrire, modifier, trier et supprimer des données d'une BDD. Instancié sous forme de programme serveur.
**Programme serveur**: Instance du SGBD sur une machine ; seul responsable des accès à la BDD et de l'utilisation des ressources (mémoire, disques).
**Programme client**: Application qui se connecte au serveur via réseau, transmet des requêtes et reçoit des données ; n'a aucune connaissance directe de la BDD.
**Indépendance physique**: Ajouter/modifier/supprimer des données sans se soucier de l'organisation physique ; un remaniement du stockage ne modifie pas les traitements.
**Indépendance logique**: Un même ensemble de données peut être vu différemment selon les utilisateurs ; une modification logique ne touche pas les applications non concernées.
**Couche conceptuelle (MCD)**: Représentation indépendante de tout SGBD, centrée sur la compréhension métier. Exemple : Modèle Entité/Association.
**Couche logique (MLD)**: Organisation logique employée par le SGBD, définit la structure de représentation. Exemple : modèle relationnel (tables).
**Couche physique (MPD)**: Implémentation réelle sur disque. Exemple : SQL (Structured Query Language).
**Entité**: Objet du monde réel (concret ou abstrait) clairement identifiable, à propos duquel on veut enregistrer des informations. Représentée par un rectangle ; nom en haut, propriétés en bas, identifiant souligné.
**Association**: Lien sémantique non orienté entre 2 ou plusieurs entités, chacune jouant un rôle. Représentée par un losange/ellipse. Peut être binaire, cyclique (réflexive) ou n-aire.
**Propriété (attribut)**: Donnée élémentaire décrivant une entité ou une association. Possède optionnellement un type et un domaine de valeurs (entier, booléen, chaîne…).
**Clé (identifiant)**: Ensemble minimum d'attributs tel qu'il n'existe pas deux occurrences ayant les mêmes valeurs pour ces attributs. Mentionnée en soulignant les attributs concernés.
**Cardinalité (min, max)**: Paire indiquant le nombre minimal (0 ou 1) et maximal (1 ou N) de participations d'une occurrence d'entité à une association. Notion obligatoire du modèle E/A.
**Types d'association**: **[1:1]**: Association 1 à 1 — les deux cardinalités maximales valent 1.
**[1:N]**: Association 1 à plusieurs — une des cardinalités maximales vaut N.
**[N:N]**: Association plusieurs à plusieurs — les deux cardinalités maximales valent N.
**Processus de conception**: **Analyse**: Étude de l'existant, des besoins, des choix et des contraintes.
**MCD**: Représentation graphique non formelle des aspects importants du problème.
**MLD**: Description formelle, indépendante de l'implémentation.
**MPD**: Implémentation dans le SGBD cible à partir du MLD, avec optimisations.
**Modèle de données — 4 descripteurs**: **Structure**: Comment les données sont-elles organisées ?
**Intégrité**: Comment les données sont-elles liées entre elles ?
**Manipulation**: Comment créer, mettre à jour et supprimer les données ?
**Recherche**: Comment chercher et repérer des données spécifiques ?

## Constraints

- Une entité possède au moins une propriété : son identifiant.
- L'identifiant (clé primaire) ne peut jamais être NULL.
- Une association n'a pas d'identifiant explicite — il est dérivé des entités qu'elle relie.
- La cardinalité est obligatoire sur chaque branche d'une association dans le modèle E/A.
- Le type d'association ([1:1], [1:N], [N:N]) se détermine à partir des cardinalités MAXIMALES des deux branches.
- Ne pas surestimer la dimension d'une association : préférer le binaire sauf si la sémantique impose du ternaire (ex. prix variant selon le fournisseur ET le projet).
- Ne pas placer sur une association les attributs appartenant à une entité participante (et inversement) : un attribut appartient à l'entité dont il est une caractéristique propre.
- Ne pas exprimer d'associations redondantes déductibles par transitivité.
- Se placer au bon niveau du discours : l'univers du discours définit ce qui devient entité (ex. 'magasin' devient entité seulement si on gère un ensemble de magasins).

## Examples

**cas**: Entité simple
**description**: Entité THEATRE avec identifiant 'Nom du théâtre' (souligné) ; Entité ARTISTE avec identifiant 'Immatriculation'.
**cas**: Association binaire avec propriété
**description**: ARTISTE —(participe à)— SPECTACLE. Si le cachet dépend de l'artiste ET du spectacle, c'est une propriété de l'association, non de l'entité.
**cas**: Cardinalités [1:1] / [1:N]
**description**: VOITURE (1,N) — possède — PROPRIÉTAIRE (1,1) : une voiture appartient à exactement 1 propriétaire ; un propriétaire possède au moins 1 voiture mais peut en avoir plusieurs.
**cas**: Association redondante à supprimer
**description**: Si un employé ne travaille que dans un projet administré par son département, l'association directe EMPLOYÉ—PROJET est déductible par transitivité et doit être retirée.
**cas**: Historique SGBD
**description**: Avant 1960 : fichiers plats. 1960 : SGBD hiérarchiques/réseaux. 1970 : SGBD relationnels. 1980 : SGBD-O (orienté objet). 2000 : Bases XML.
