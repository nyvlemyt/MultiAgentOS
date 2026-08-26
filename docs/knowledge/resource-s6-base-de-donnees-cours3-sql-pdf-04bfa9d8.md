---
id: resource-s6-base-de-donnees-cours3-sql-pdf-04bfa9d8
slug: resource-s6-base-de-donnees-cours3-sql-pdf-04bfa9d8
source_key: 'sha256:04bfa9d87f1121c3cf9cce740109ac46b2d5eb466af450b9bdfab621348f4aec'
part_of: S6 - Base de données
order: 2
manifest: null
derived_from: 'sha256:04bfa9d87f1121c3cf9cce740109ac46b2d5eb466af450b9bdfab621348f4aec'
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
  - sql
  - base-de-données
  - DDL
  - DML
  - jointures
  - agrégation
  - contraintes
  - modèle-relationnel
domain: bases de données
---
# S6 - Base de données — Cours3_Sql.pdf

## Summary

Référence complète du langage SQL couvrant le modèle relationnel (tables, attributs, tuples), les quatre composantes du langage (DDL, DML, DCL, TCL), les types de données, les contraintes d'intégrité (PRIMARY KEY, FOREIGN KEY, NOT NULL, DEFAULT, UNIQUE, CHECK), les requêtes SELECT avec filtres (WHERE, LIKE, BETWEEN, IN, IS NULL), le tri (ORDER BY), les six fonctions d'agrégation (COUNT, SUM, AVG, MIN, MAX, GROUP_CONCAT), le regroupement (GROUP BY, HAVING), les cinq types de jointures (CROSS, INNER, LEFT, RIGHT, SELF), les opérateurs ensemblistes (UNION, INTERSECT, EXCEPT) et les sous-requêtes (IN/NOT IN, ANY, ALL, EXISTS/NOT EXISTS).

## Fields/API

**name**: Composantes SQL
**description**: DDL (Data Definition Language) : CREATE, ALTER, DROP — structure des données. DML (Data Manipulation Language) : INSERT, UPDATE, DELETE, SELECT — vie des données. DCL (Data Control Language) : GRANT, REVOKE — droits. TCL (Transaction Control Language) : COMMIT, ROLLBACK — transactions.
**name**: DDL — Création
**description**: CREATE DATABASE nomBD; / USE nomBD; pour créer et sélectionner une base. CREATE TABLE nomTable (attribut1 type1 [contraintes], ..., PRIMARY KEY (att), FOREIGN KEY att REFERENCES autreTable(pk)); pour créer une table. DROP TABLE [IF EXISTS] nomTable; pour supprimer. CREATE TABLE IF NOT EXISTS pour warning au lieu d'erreur.
**name**: Types de données principaux
**description**: INTEGER / INT, FLOAT / DECIMAL(p,s), VARCHAR(n), CHAR(n), DATE, DATETIME, BOOLEAN, TEXT / CLOB, BLOB. Attention : support variable selon le SGBD (ex. Oracle ne supporte pas DATETIME, MySQL ne supporte pas CLOB).
**name**: Contraintes d'attribut
**description**: PRIMARY KEY : unicité des tuples. NOT NULL : interdit la valeur NULL. DEFAULT valeur : valeur par défaut si INSERT ne fournit pas de valeur. UNIQUE : interdit les doublons sur cet attribut. CHECK (condition) : valide la valeur saisie (ex. CHECK(AGE>=18)). ENUM('v1','v2',...) : restreint aux valeurs listées.
**name**: Contraintes de table
**description**: PRIMARY KEY (att1, att2) : clé primaire composée. FOREIGN KEY att REFERENCES nomTable(pk) : clé étrangère garantissant l'intégrité référentielle. Ordre de création des tables important : la table référencée doit exister avant la table qui la référence.
**name**: ALTER TABLE
**description**: ADD (att type [contraintes]) : ajoute un attribut. DROP COLUMN att : supprime un attribut. MODIFY att type [contraintes] : modifie un attribut. ADD CONSTRAINT nomC contrainte : ajoute une contrainte. DROP CONSTRAINT nomC : supprime une contrainte.
**name**: DML — Manipulation
**description**: INSERT INTO table (att1, att2) VALUES (val1, val2); — insertion (attributs non listés reçoivent NULL ou DEFAULT). DELETE FROM table WHERE condition; — suppression de tuples (sans WHERE : vide la table entière). UPDATE table SET att1=val1, att2=val2 WHERE condition; — mise à jour.
**name**: SELECT — Requêtes de base
**description**: SELECT att1, att2 FROM table; — projection. SELECT * FROM table; — tous les attributs. SELECT DISTINCT att FROM table; — élimine les doublons. SELECT COUNT(*) FROM table; — compte toutes les lignes. WHERE condition; — filtre les lignes. ORDER BY att [ASC|DESC]; — tri (ASC par défaut).
**name**: Opérateurs WHERE
**description**: Comparaison : <, >, <=, >=, <>, !=. Logiques : AND, OR. Intervalle : BETWEEN val1 AND val2. Appartenance : IN (liste). Motif textuel : LIKE '%texte%' (% = 0..n caractères, _ = exactement 1 caractère). Null : IS NULL / IS NOT NULL.
**name**: Fonctions d'agrégation
**description**: COUNT(*) : toutes les lignes y compris doublons. COUNT(att) : lignes non-NULL. SUM(att) : somme (numérique). AVG(att) : moyenne (numérique). MIN(att) : valeur minimale. MAX(att) : valeur maximale. GROUP_CONCAT : concaténation. Utiliser DISTINCT dans la fonction pour exclure les doublons (ex. SUM(DISTINCT att)).
**name**: GROUP BY / HAVING
**description**: GROUP BY att : regroupe les lignes ayant la même valeur pour att, à utiliser avec une fonction d'agrégation. Placé après WHERE, avant ORDER BY. HAVING condition : filtre les groupes après agrégation (WHERE ne peut pas utiliser les fonctions d'agrégation, HAVING le permet).
**name**: Jointures
**description**: CROSS JOIN : produit cartésien (toutes combinaisons). INNER JOIN ... ON t1.att = t2.att : seules les lignes avec correspondance des deux côtés. LEFT JOIN : toutes les lignes de la table gauche + NULL si pas de correspondance à droite. RIGHT JOIN : toutes les lignes de la table droite + NULL si pas de correspondance à gauche. SELF JOIN : jointure d'une table avec elle-même via deux alias.
**name**: Opérateurs ensemblistes
**description**: UNION : union de deux résultats SELECT (élimine les doublons). INTERSECT : intersection (élimine les doublons). EXCEPT / MINUS : différence (nom varie selon le SGBD). Ajouter ALL pour conserver les doublons. Conditions : mêmes attributs dans les deux SELECT. Attention : MySQL ne supporte ni MINUS ni INTERSECT.
**name**: Sous-requêtes
**description**: IN (sous-requête) / NOT IN : teste si une valeur appartient au résultat de la sous-requête. ANY : vrai si la condition est vraie pour au moins un élément du résultat. ALL : vrai si la condition est vraie pour tous les éléments du résultat. EXISTS (sous-requête) : vrai si la sous-requête renvoie au moins un enregistrement. NOT EXISTS : vrai si la sous-requête ne renvoie rien.

## Constraints

- Une instruction SQL doit se terminer par un point-virgule pour être exécutée.
- SQL est déclaratif : l'utilisateur spécifie quoi obtenir, pas comment (c'est le SGBD qui décide).
- Pas de variables ni de structures de contrôle (if, while, for) en SQL pur.
- Les types de données ne sont pas universellement supportés : vérifier la compatibilité avec le SGBD cible.
- L'ordre de création des tables doit respecter les dépendances de clés étrangères (la table référencée doit exister en premier).
- DELETE FROM table sans WHERE supprime tous les tuples de la table.
- WHERE ne peut pas utiliser les fonctions d'agrégation — utiliser HAVING à la place.
- GROUP BY doit être placé après WHERE et avant ORDER BY.
- Les opérateurs ensemblistes exigent le même nombre et type d'attributs dans les deux SELECT.
- NULL != absence de données : NULL signifie une valeur inconnue ; utiliser IS NULL / IS NOT NULL pour le tester.

## Examples

- CREATE TABLE Client (numC INTEGER, nom VARCHAR(20) NOT NULL, prenom VARCHAR(20), PRIMARY KEY (numC));
- INSERT INTO proprietaire (numP, email, ville) VALUES (123, 'durand@gmail.com', 'Paris');
- UPDATE client SET numPermis='7589', ville='Lyon' WHERE nom='Delon';
- DELETE FROM Voiture WHERE numImmat='56AA46';
- SELECT DISTINCT marque FROM voiture;
- SELECT marque, modele FROM voiture WHERE achatA BETWEEN 2000 AND 2010;
- SELECT * FROM client WHERE prenom LIKE 'Jean%';
- SELECT COUNT(*), AVG(Salaire), MAX(Salaire) FROM Employes;
- SELECT idEquipe, COUNT(*) FROM Joueur GROUP BY idEquipe HAVING COUNT(*) > 5;
- SELECT * FROM Joueur AS J INNER JOIN EQUIPE AS E ON J.idEquipe = E.idEquipe;
- SELECT * FROM Joueur AS J LEFT JOIN EQUIPE AS E ON J.idEquipe = E.idEquipe;
- SELECT * FROM MATCHS M1 JOIN MATCHS M2 ON M1.idStade = M2.idStade AND M1.idMatch != M2.idMatch;
- SELECT V.immat FROM Voiture V WHERE NOT EXISTS (SELECT * FROM Location L WHERE V.immat = L.immat);
