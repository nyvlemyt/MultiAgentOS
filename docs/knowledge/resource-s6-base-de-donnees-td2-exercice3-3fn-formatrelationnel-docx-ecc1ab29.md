---
id: resource-s6-base-de-donnees-td2-exercice3-3fn-formatrelationnel-docx-ecc1ab29
slug: resource-s6-base-de-donnees-td2-exercice3-3fn-formatrelationnel-docx-ecc1ab29
source_key: 'sha256:ecc1ab2968411405b75831e6c792db6a8c25f0b3991f68f5a693694c011aabf7'
part_of: resource-s6-base-de-donnees-fb2fe2f1
order: 6
manifest: null
derived_from: 'sha256:ecc1ab2968411405b75831e6c792db6a8c25f0b3991f68f5a693694c011aabf7'
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
  - normalisation
  - 3FN
  - base-de-données
  - dépendances-fonctionnelles
  - SQL
  - modélisation-relationnelle
domain: bases de données
---
# S6 - Base de données — TD2_Exercice3_3FN_FormatRelationnel.docx

## Goal

Décomposer une relation non normalisée (Projection) en 3e Forme Normale (3FN) en identifiant les dépendances fonctionnelles et en produisant un schéma relationnel valide.

## Prerequisites

- Connaître la notion de clé primaire et de clé candidate
- Comprendre les dépendances fonctionnelles (DF)
- Savoir distinguer 1FN, 2FN et 3FN (pas de DF partielle, pas de DF transitive vers la clé)

## Steps

**step**: 1
**title**: Identifier la clé primaire minimale de la relation initiale
**detail**: La relation Projection(NumFilm, TitreFilm, DuréeFilm, NumSalle, NomSalle, CapacitéSalle, TypePlace, PrixPlace, DateProjection, HeureDeb) a pour clé minimale : (NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace). Cette combinaison garantit l'unicité car une même séance peut proposer plusieurs types de places à des prix différents.
**step**: 2
**title**: Lister toutes les dépendances fonctionnelles
**detail**: - NumFilm → TitreFilm, DuréeFilm (un numéro identifie un film)
- NumSalle → NomSalle, CapacitéSalle (un numéro identifie une salle)
- TypePlace → PrixPlace (le prix ne dépend que du type de place)
- (NumFilm, NumSalle, DateProjection, HeureDeb) → Projection (une séance est définie par ces 4 attributs)
- (NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace) = clé complète
**step**: 3
**title**: Détecter les violations de 2FN et 3FN
**detail**: Les DF NumFilm → TitreFilm/DuréeFilm, NumSalle → NomSalle/CapacitéSalle et TypePlace → PrixPlace sont des dépendances partielles par rapport à la clé complète : violation de 2FN. Il n'y a pas de DF transitive résiduelle une fois les tables séparées.
**step**: 4
**title**: Créer une table par source de dépendance fonctionnelle
**detail**: Chaque déterminant autonome devient la clé primaire de sa propre table :
- FILM (NUMFILM PK, TITREFILM, DUREEFILM)
- SALLE (NUMSALLE PK, NOMSALLE, CAPACITESALLE)
- TYPEPLACE (TYPEPLACE PK, PRIXPLACE)
- PROJECTION (NUMFILM, NUMSALLE, DATEPROJECTION, HEUREDEB — clé composite PK ; FK vers FILM et SALLE)
- PLACEPROJECTION (NUMFILM, NUMSALLE, DATEPROJECTION, HEUREDEB, TYPEPLACE — clé composite PK ; FK vers PROJECTION et TYPEPLACE)
**step**: 5
**title**: Écrire le DDL SQL final
**detail**: Déclarer les tables dans l'ordre des dépendances (tables référencées avant tables référençantes) avec les contraintes PRIMARY KEY et FOREIGN KEY. Exemple d'ordre : FILM → SALLE → TYPEPLACE → PROJECTION → PLACEPROJECTION.

## Result

Cinq tables en 3FN sans redondance : FILM, SALLE, TYPEPLACE, PROJECTION, PLACEPROJECTION. Chaque fait est stocké une seule fois ; les mises à jour (prix, capacité, titre) n'affectent qu'une ligne dans la table appropriée.

## Next

- Vérifier la BCNF (Boyce-Codd) si des clés candidates supplémentaires existent
- Rédiger les requêtes JOIN pour reconstituer la vue Projection complète
- Passer à la 4FN si des dépendances multi-valuées sont détectées
