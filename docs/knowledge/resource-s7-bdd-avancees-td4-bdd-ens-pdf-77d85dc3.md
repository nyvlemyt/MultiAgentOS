---
id: resource-s7-bdd-avancees-td4-bdd-ens-pdf-77d85dc3
slug: resource-s7-bdd-avancees-td4-bdd-ens-pdf-77d85dc3
source_key: 'sha256:77d85dc3476c941d2f4f0a3f749bdf080b20ab2fdd6d37863989f1a0d2d2f087'
part_of: S7 - BDD Avancées
order: 7
manifest: null
derived_from: 'sha256:77d85dc3476c941d2f4f0a3f749bdf080b20ab2fdd6d37863989f1a0d2d2f087'
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
  - sql
  - bases-de-données
  - requêtes
  - vues
  - utilisateurs
  - mysql
  - td
  - enseignement
domain: Bases de données
---
# S7 - BDD Avancées — TD4_BDD_ens.pdf

## Goal

Pratiquer les requêtes SQL avancées (GROUP BY, sous-requêtes, agrégats), la création et la gestion de vues, ainsi que la gestion des utilisateurs et des droits sur une base de données relationnelle (BDD Loueur).

## Prerequisites

- Avoir importé le fichier de création de la base de données 'Loueur' (tables : Client, Proprietaire, Voiture, Location)
- Accès à un SGBD MySQL/MariaDB avec un compte root
- Connaissances de base en SQL : SELECT, WHERE, JOIN, GROUP BY, ORDER BY

## Steps

**title**: Exercice 1 — Requêtes avancées sur la BDD Loueur
**items**: - 1. Marques avec plus de 3 voitures : SELECT marque FROM Voiture GROUP BY marque HAVING COUNT(*) > 3
- 2. Immat ayant parcouru plus de 800 km cumulés : SELECT immat FROM Location GROUP BY immat HAVING SUM(km) > 800
- 3. Modèles loués au moins 3 fois (avec count, ordre alphabétique) : SELECT modele, COUNT(*) AS nbLoc FROM Location JOIN Voiture USING(immat) GROUP BY modele HAVING COUNT(*) >= 3 ORDER BY modele ASC
- 4. Kilométrage d'Alain Delon par voiture : JOIN Client + Location sur codeC, filtrer nom='Delon' prenom='Alain', GROUP BY immat, SUM(km)
- 5. Km moyen en location par marque, ordre décroissant : SELECT marque, AVG(km) FROM Location JOIN Voiture USING(immat) GROUP BY marque ORDER BY AVG(km) DESC
- 6. Immat de la/les voitures les plus anciennes : SELECT immat FROM Voiture WHERE achatA = (SELECT MIN(achatA) FROM Voiture)
- 7. Immat avec compteur > toutes les Peugeot : SELECT immat FROM Voiture WHERE compteur > ALL (SELECT compteur FROM Voiture WHERE marque='Peugeot')
- 8. Immat avec prixJ > prixJ d'au moins une Ferrari : SELECT immat FROM Voiture WHERE prixJ > ANY (SELECT prixJ FROM Voiture WHERE marque='Ferrari')
- 9. Immat avec compteur > moyenne générale : SELECT immat FROM Voiture WHERE compteur > (SELECT AVG(compteur) FROM Voiture)
- 10. Immat avec compteur > moyenne de leur modèle (sous-requête corrélée) : SELECT immat FROM Voiture v1 WHERE compteur > (SELECT AVG(compteur) FROM Voiture v2 WHERE v2.modele = v1.modele)
- 11. Clients partageant un même numéro de permis : SELECT permis, GROUP_CONCAT(codeC) FROM Client GROUP BY permis HAVING COUNT(*) > 1
- 12. Clients utilisant le permis d'un autre : SELECT nom, permis FROM Client WHERE permis IN (SELECT permis FROM Client GROUP BY permis HAVING COUNT(*) > 1)
**title**: Exercice 2 — Création et gestion de vues
**items**: - Créer la vue TotalKm : CREATE VIEW TotalKm AS SELECT codeC, SUM(km) AS totalKm FROM Location GROUP BY codeC — NON modifiable (agrégat)
- Créer la vue Achat10 : CREATE VIEW Achat10 AS SELECT immat, marque, modele FROM Voiture WHERE achatA='2010' — Modifiable (sélection simple sur une seule table)
- Créer la vue Loc15 : CREATE VIEW Loc15 AS SELECT immat, codeC, annee, mois, numLoc, km FROM Location WHERE annee='2015' — Modifiable
- Tester la mise à jour de la location A-133 pour changer l'année à 2017 : UPDATE Loc15 SET annee='2017' WHERE numLoc='A-133' → le tuple disparaît de la vue (il ne satisfait plus WHERE annee='2015')
- Empêcher les mises à jour hors condition de la vue : ajouter WITH CHECK OPTION à la définition de Loc15 pour rejeter toute modification qui ferait sortir le tuple de la vue
**title**: Exercice 3 — Gestion des utilisateurs et des droits
**items**: - Créer l'utilisateur superbozo : CREATE USER 'superbozo'@'localhost' IDENTIFIED BY 'user'
- Lui accorder tous les droits : GRANT ALL PRIVILEGES ON loueur.* TO 'superbozo'@'localhost'
- Créer l'utilisateur bozo : CREATE USER 'bozo'@'localhost' IDENTIFIED BY 'user'
- Lui accorder seulement SELECT sur Location : GRANT SELECT ON loueur.Location TO 'bozo'@'localhost'
- Se connecter en tant que bozo et tenter INSERT dans Proprietaire → erreur de permission (accès refusé)
- Revenir en root, révoquer le droit DELETE de superbozo : REVOKE DELETE ON loueur.* FROM 'superbozo'@'localhost'
- Visualiser les droits : SHOW GRANTS FOR 'bozo'@'localhost'; SHOW GRANTS FOR 'superbozo'@'localhost'; SHOW GRANTS FOR CURRENT_USER()
- Supprimer les deux utilisateurs : DROP USER 'bozo'@'localhost'; DROP USER 'superbozo'@'localhost'

## Result

L'étudiant sait écrire des requêtes SQL avec sous-requêtes (corrélées et non corrélées), agrégats et filtres HAVING ; il sait créer des vues simples et agrégées, comprendre leur modifiabilité, et utiliser WITH CHECK OPTION ; il sait gérer le cycle complet de création/attribution/révocation/suppression de comptes utilisateurs MySQL.

## Next

- Approfondir les requêtes corrélées et les CTE (WITH … AS)
- Explorer les triggers et procédures stockées
- Étudier la gestion des transactions (COMMIT, ROLLBACK, niveaux d'isolation)
