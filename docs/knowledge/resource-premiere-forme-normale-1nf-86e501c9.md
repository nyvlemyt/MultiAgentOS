---
id: resource-premiere-forme-normale-1nf-86e501c9
slug: resource-premiere-forme-normale-1nf-86e501c9
source_key: 'sha256:86e501c9362328d859d29b42d7c2cc0e4eff81bb84897b3b4a8e47c78868adea'
part_of: null
order: null
manifest: null
derived_from: 'sha256:86e501c9362328d859d29b42d7c2cc0e4eff81bb84897b3b4a8e47c78868adea'
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
  - database
  - normalization
  - 1NF
  - 2NF
  - 3NF
  - BCNF
  - 4NF
  - 5NF
  - functional-dependencies
  - relational-model
  - schema-design
domain: database
---
# Première Forme Normale (1NF)

## Goal

Maîtriser les cinq formes normales (1NF → 5NF) en appliquant chaque règle sur des schémas concrets, afin de produire des bases relationnelles sans redondance ni anomalies de mise à jour.

## Prerequisites

- Connaître la notion de table, attribut et clé primaire (clé simple et composite)
- Comprendre ce qu'est une dépendance fonctionnelle (X → Y : la valeur de X détermine Y)
- Savoir lire un schéma relationnel en notation positionnelle : Table(col1, col2, …)

## Steps

**form**: 1NF — Atomicité
**rule**: Chaque attribut doit contenir une valeur unique et indivisible ; aucun groupe répétitif n'est autorisé.
**diagnostic**: Repérer les attributs multi-valeurs (champ 'Address' groupant rue + CP + ville) et les colonnes à valeurs multiples séparées par des virgules (Authors, Categories).
**fix**: Décomposer l'attribut non-atomique en colonnes distinctes (Street, PostalCode, City, Country). Sortir chaque valeur répétée dans une table dédiée reliée par la clé (BookAuthors(ISBN, Author), BookCategories(ISBN, Category)).
**example**: **before**: Clients(Num, Lastname, Firstname, Address, Phone) — Address = '8 Rue de Valois, 75001, Paris, France'
**after**: Clients(Num, Lastname, Firstname, Street, PostalCode, City, Country, Phone)
**form**: 2NF — Élimination des dépendances partielles
**rule**: La relation doit être en 1NF et chaque attribut non-clé doit dépendre de la totalité de la clé primaire (composite), pas seulement d'une partie.
**diagnostic**: Identifier les attributs qui ne dépendent que d'une partie de la clé composite : dans Order(OrderNumber, ItemCode, Date, Qty, Description), Date → OrderNumber seul, Description → ItemCode seul.
**fix**: Extraire chaque dépendance partielle dans sa propre table. Orders(OrderNumber, Date) + Items(ItemCode, Description) + OrderItems(OrderNumber, ItemCode, Qty).
**example**: **before**: Rentals(RentalID, EquipmentID, EquipmentName, EquipmentType, CustomerID, CustomerName, RentalDate, ReturnDate, Condition) — clé = (RentalID, EquipmentID)
**after**: Equipment(EquipmentID, EquipmentName, EquipmentType) + Rentals(RentalID, CustomerID, CustomerName, RentalDate, ReturnDate) + RentalItems(RentalID, EquipmentID, Condition)
**form**: 3NF — Élimination des dépendances transitives
**rule**: La relation doit être en 2NF et aucun attribut non-clé ne doit dépendre d'un autre attribut non-clé (pas de chaîne CléPrimaire → A → B).
**diagnostic**: Dans Vehicle(NumImmatr, NumPermit, Power, Brand, Lastname, Firstname) : NumImmatr → NumPermit → Lastname, Firstname — dépendance transitive via NumPermit (non-clé).
**fix**: Sortir la chaîne transitive dans une table dédiée. Vehicles(NumImmatr, Power, Brand, NumPermit) + Drivers(NumPermit, Lastname, Firstname).
**example**: **before**: Gradebook(ID-Stud, Course, Name-Stud, Class, Grade, Unit, ID-Prof, Name-Prof, Nb-h) — transitif : Course → ID-Prof → Name-Prof
**after**: Students(ID-Stud, Name-Stud, Class) + Professors(ID-Prof, Name-Prof) + Courses(Course, Unit, ID-Prof, Nb-h) + Grades(ID-Stud, Course, Grade)
**form**: BCNF — Forme Boyce-Codd
**rule**: La relation doit être en 3NF et, pour toute dépendance X → Y, X doit être une superclé (généralisation stricte de 3NF, détecte les anomalies que 3NF rate quand il y a plusieurs clés candidates).
**diagnostic**: Dans Assignment(#Child, #Activity, Moderator) : Moderator → #Activity existe, mais Moderator n'est pas une superclé → violation BCNF même si la table est en 3NF.
**fix**: Décomposer autour du déterminant non-superclé. ModeratorActivities(Moderator, Activity) + ChildAssignments(Child, Moderator).
**example**: **before**: Assignments(EmployeeID, DepartmentID, ManagerID) — ManagerID → DepartmentID viole BCNF (ManagerID ≠ superclé)
**after**: EmployeeManagers(EmployeeID, ManagerID) + ManagerDepartments(ManagerID, DepartmentID)
**form**: 4NF — Élimination des dépendances multivariées indépendantes
**rule**: La relation doit être en BCNF et ne doit pas contenir plus d'une dépendance multivariée (MVD) indépendante. Notation : X →→ Y ('X détermine multi-valué Y').
**diagnostic**: Dans Student(StudentID, Lang, Course) : StudentID →→ Lang ET StudentID →→ Course sont indépendantes → explosion combinatoire de tuples, redondances artificielles.
**fix**: Scinder chaque MVD indépendante dans sa propre table. StudentLang(StudentID, Lang) + StudentCourse(StudentID, Course).
**example**: **before**: Catalog(SupplierNumber, ProductNumber, Subsidiary, SupplierName, Price) — deux MVD indépendantes + dépendance transitive SupplierName
**after**: Suppliers(SupplierNumber, SupplierName) + SupplierProducts(SupplierNumber, ProductNumber, Price) + SupplierSubsidiaries(SupplierNumber, Subsidiary)
**form**: 5NF — Élimination des dépendances de jointure
**rule**: La relation doit être en 4NF et ne doit pas pouvoir être reconstruite exactement par jointure naturelle de projections plus petites (pas de dépendance de jointure non triviale).
**diagnostic**: Dans Sales(Agent, Company, Product) : la règle 'si un agent vend un produit ET représente la société fabricante, alors il vend ce produit pour cette société' implique que Sales = AgentProducts ⋈ AgentCompanies ⋈ CompanyProducts → dépendance de jointure.
**fix**: Décomposer en toutes les projections binaires de la contrainte. AgentProducts(Agent, Product) + AgentCompanies(Agent, Company) + CompanyProducts(Company, Product).
**example**: **before**: Teaching(Teacher, Subject, School) — contrainte 'si enseignant enseigne la matière ET l'école propose la matière, alors il l'enseigne dans cette école' → dépendance de jointure
**after**: TeacherSubjects(Teacher, Subject) + TeacherSchools(Teacher, School) + SchoolSubjects(School, Subject)

## Result

Un ensemble de tables relationnelles sans anomalies d'insertion, de mise à jour ou de suppression. Chaque fait est stocké une seule fois au bon endroit, les requêtes sur des sous-parties (ville, auteur, catégorie) deviennent directes, et l'intégrité référentielle est assurée structurellement plutôt que par convention.

## Next

- Pratiquer sur des schémas complets (e-commerce, RH, gestion de stock) en partant de la 1NF et en montant jusqu'à BCNF systematiquement
- Étudier les cas où dénormaliser volontairement est justifié (performances OLAP, tables de reporting) et documenter la décision
- Approfondir les MVD et dépendances de jointure (4NF/5NF) via la théorie des lossless-join decompositions de Fagin
