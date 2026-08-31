---
id: resource-lab-2-pl-sql-ren-romain-zeriri-rayan-pommier-melvyn-536806e0
slug: resource-lab-2-pl-sql-ren-romain-zeriri-rayan-pommier-melvyn-536806e0
source_key: 'sha256:536806e0b2c7c3316fcbbf34c246774f0654c2634fd7d58b8a0e6631078c403d'
part_of: null
order: null
manifest: null
derived_from: 'sha256:536806e0b2c7c3316fcbbf34c246774f0654c2634fd7d58b8a0e6631078c403d'
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
  - plsql
  - oracle
  - sql
  - triggers
  - constraints
  - stored-procedures
  - packages
  - database
  - school-db
domain: database
---
# Lab 2 – PL/SQL –REN ROMAIN – ZERIRI RAYAN – POMMIER Melvyn

## Summary

Lab PL/SQL sur une base de données scolaire (school.sql). Couvre le schéma E/R (STUDENTS, PROFESSORS, COURSES, RESULTS, WORKLOAD), les contraintes CHECK, quatre triggers (protection salaire, comptage spécialité, cascade workload, audit notes), une fonction de moyenne, une procédure d'affichage par niveau, et un package regroupant les deux.

## Fields/API

**name**: Schéma E/R
**description**: Tables : STUDENTS, PROFESSORS, COURSES, RESULTS (notes 0-20), WORKLOAD. RESULTS relie étudiants ↔ cours ; WORKLOAD relie professeurs ↔ cours.
**name**: Contraintes CHECK
**description**: points BETWEEN 0 AND 20 (results) ; year BETWEEN 1 AND 5 (students) ; base_salary < salary (professors).
**name**: Trigger trg_no_salary_decrease
**description**: BEFORE UPDATE OF salary ON professors — lève RAISE_APPLICATION_ERROR(-20001) si NEW.salary < OLD.salary.
**name**: Trigger trg_update_teacher_specialty
**description**: AFTER INSERT/DELETE/UPDATE ON professors — synchronise la table teacher_specialty (specialty, nb_teachers) via MERGE.
**name**: Trigger trg_cascade_workload
**description**: AFTER UPDATE/DELETE ON professors FOR EACH ROW — supprime ou met à jour les lignes WORKLOAD correspondantes.
**name**: Trigger trg_audit_results
**description**: AFTER INSERT/DELETE/UPDATE ON results FOR EACH ROW — insère dans audit_results (v_user, date_maj, desc_maj INSERT|DELETE|UPDATE, student_id, course_id, points).
**name**: Fonction fn_average
**description**: fn_average(p_student_id NUMBER) RETURN NUMBER — SELECT AVG(points) FROM results WHERE id_student = p_student_id.
**name**: Procédure pr_result
**description**: Parcourt tous les étudiants via curseur, appelle fn_average, affiche le niveau : Échec (<10), Moyen (<12), Assez bien (<14), Bien (<16), Très bien (≥16).
**name**: Package pkg_results
**description**: Regroupe fn_average et pr_result dans un package Oracle (spécification + corps). Encapsule la logique métier note/niveau.

## Constraints

- Oracle PL/SQL uniquement (syntaxe RAISE_APPLICATION_ERROR, DBMS_OUTPUT, MERGE, FOR EACH ROW).
- La table teacher_specialty doit exister avant la création du trigger trg_update_teacher_specialty.
- La table audit_results doit exister avant la création du trigger trg_audit_results.
- Le package pkg_results redéfinit fn_average indépendamment — deux implémentations identiques coexistent (standalone + packaged).

## Examples

**label**: Notes de chaque étudiant
**code**: SELECT s.name, c.name, r.points FROM students s JOIN results r ON s.id_student = r.id_student JOIN courses c ON r.id_course = c.id_course ORDER BY s.name;
**label**: Professeurs et leurs cours
**code**: SELECT p.name, c.name FROM professors p JOIN workload w ON p.id_prof = w.id_prof JOIN courses c ON w.id_course = c.id_course;
**label**: Appel procédure niveau
**code**: EXEC pr_result; -- ou pkg_results.pr_result;
