---
id: resource-s7-base-de-donnees-lab2-plsql-pdf-bdaf5871
slug: resource-s7-base-de-donnees-lab2-plsql-pdf-bdaf5871
source_key: 'sha256:bdaf58710b1fb742bd9a13f0f3eaae2a0bdb6aa62382ba66e4ff046e4561ae80'
part_of: resource-s7-base-de-donnees-d1856687
order: 2
manifest: null
derived_from: 'sha256:bdaf58710b1fb742bd9a13f0f3eaae2a0bdb6aa62382ba66e4ff046e4561ae80'
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
  - plsql
  - oracle
  - triggers
  - constraints
  - functions
  - procedures
  - packages
  - audit
  - sql
  - database
domain: database
---
# S7 - base de données — Lab2-PLSQL.pdf

## Goal

Pratiquer PL/SQL sur Oracle Live SQL en maîtrisant les contraintes CHECK, les triggers (sécurité, redondance, cascade), les fonctions/procédures stockées et les packages, à partir d'un schéma école fourni.

## Prerequisites

- Accès à Oracle Live SQL (compte actif)
- Fichier school.sql fourni par l'instructeur
- Connaissances de base en SQL (SELECT, INSERT, UPDATE, DELETE)
- Notion de modèle E/R

## Steps

**step**: 1
**title**: Warm-up — charger et explorer le schéma
**detail**: Dans Oracle Live SQL → Schema, importer school.sql et l'exécuter. Conserver toutes les requêtes dans un éditeur local (la base est temporaire et disparaît à la fin de session). Dessiner le diagramme E/R par rétro-ingénierie. Écrire une requête affichant les notes de chaque étudiant par cours, triées par nom. Écrire une requête listant les professeurs et les cours qu'ils enseignent (nom prof + nom cours).
**step**: 2
**title**: Contraintes CHECK sur les tables existantes
**detail**: ALTER TABLE pour ajouter : (a) note entre 0 et 20 sur la table RESULTS ; (b) champ YEAR de l'étudiant limité à 1–5 sur STUDENTS ; (c) salaire de base d'un professeur strictement inférieur au salaire courant sur TEACHERS.
**step**: 3
**title**: Trigger 1 — salaire non décroissant
**detail**: Créer un trigger BEFORE UPDATE sur TEACHERS qui lève une EXCEPTION si le nouveau salaire est inférieur à l'ancien. Rappel : utiliser DROP TRIGGER avant de modifier un trigger existant.
**step**: 4
**title**: Trigger 2 — redondance automatique TEACHER_SPECIALTY
**detail**: Créer la table TEACHER_SPECIALTY(SPECIALTY VARCHAR2(20) PK, NB_TEACHERS NUMBER). Créer un trigger AFTER INSERT/DELETE/UPDATE sur TEACHERS qui maintient NB_TEACHERS à jour en utilisant les prédicats INSERTING / DELETING / UPDATING. Tester sur des exemples d'insertion, suppression et modification.
**step**: 5
**title**: Trigger 3 — cascade de suppression/mise à jour vers WORKLOAD
**detail**: Créer un trigger qui, lors de la suppression d'un professeur ou du changement de son identifiant dans TEACHERS, met à jour (ou supprime) les lignes correspondantes dans la table WORKLOAD.
**step**: 6
**title**: Trigger 4 — piste d'audit sur RESULTS
**detail**: Créer la table AUDIT_RESULTS(V_USER, DATE_MAJ, DESC_MAJ, STUDENT_ID, COURSE_ID, Points). Créer un trigger AFTER INSERT/DELETE/UPDATE sur RESULTS qui insère une ligne dans AUDIT_RESULTS avec : USER (utilisateur BD courant), SYSDATE, le type d'opération ('INSERT','DELETE','NEW','OLD'), et les valeurs concernées.
**step**: 7
**title**: Fonction fn_average
**detail**: Créer une fonction qui prend un STUDENT_ID en paramètre et retourne la moyenne de ses notes (SELECT AVG(points) FROM RESULTS WHERE student_id = p_id).
**step**: 8
**title**: Procédure pr_result
**detail**: Créer une procédure qui appelle fn_average pour chaque étudiant et affiche la mention correspondante : < 10 = 'Échec', 10–12 = 'Passable', 12–14 = 'Assez bien', 14–16 = 'Bien', ≥ 16 = 'Très bien'.
**step**: 9
**title**: Package
**detail**: Regrouper fn_average et pr_result dans un package (CREATE PACKAGE + CREATE PACKAGE BODY). Montrer comment les appeler : nom_package.fn_average(id) et EXEC nom_package.pr_result.

## Result

Un jeu complet de DDL/DML PL/SQL : contraintes CHECK, 4 triggers couvrant intégrité salariale, redondance, cascade et audit, une fonction de moyenne, une procédure d'affichage avec mentions, et un package Oracle regroupant les deux.

## Next

- Curseurs explicites et boucles FOR CURSOR pour traiter des jeux de résultats complexes
- Gestion avancée des exceptions (PRAGMA EXCEPTION_INIT, RAISE_APPLICATION_ERROR)
- Optimisation des triggers (éviter les mutations de table, trigger composé)
- Packages avancés : surcharge de sous-programmes, variables de package, initialisation
