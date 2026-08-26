---
id: resource-s7-base-de-donnees-lab2-pommier-zeriri-ren-pdf-d0278c55
slug: resource-s7-base-de-donnees-lab2-pommier-zeriri-ren-pdf-d0278c55
source_key: 'sha256:d0278c55aa00062d65322c0d48e4bbf7c0b8cf70df7ed52bc980088db158bae7'
part_of: S7 - base de données
order: 4
manifest: null
derived_from: 'sha256:d0278c55aa00062d65322c0d48e4bbf7c0b8cf70df7ed52bc980088db158bae7'
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
  - pl-sql
  - oracle
  - triggers
  - constraints
  - functions
  - procedures
  - packages
  - audit
  - database
domain: database
---
# S7 - base de données — lab2_POMMIER_ZERIRI_REN.pdf

## Summary

Lab PL/SQL sur une base scolaire (school.sql) couvrant le schéma E/R, les contraintes CHECK, quatre triggers, une fonction de moyenne, une procédure d'affichage par niveau, et leur encapsulation dans un package Oracle.

## Fields/API

**name**: Schéma E/R
**description**: Entités : STUDENTS, PROFESSORS, COURSES, RESULTS, WORKLOAD. RESULTS relie étudiants ↔ cours (notes). WORKLOAD relie professeurs ↔ cours.
**name**: Contraintes CHECK
**description**: points BETWEEN 0 AND 20 (results) ; year BETWEEN 1 AND 5 (students) ; base_salary < salary (professors).
**name**: Trigger trg_no_salary_decrease
**description**: BEFORE UPDATE OF salary ON professors — lève RAISE_APPLICATION_ERROR(-20001) si :NEW.salary < :OLD.salary.
**name**: Trigger trg_update_teacher_specialty
**description**: AFTER INSERT OR DELETE OR UPDATE ON professors — synchronise la table teacher_specialty (specialty, nb_teachers) via MERGE.
**name**: Trigger trg_cascade_workload
**description**: AFTER UPDATE OR DELETE ON professors FOR EACH ROW — supprime ou met à jour les lignes WORKLOAD liées à id_prof.
**name**: Trigger trg_audit_results
**description**: AFTER INSERT OR DELETE OR UPDATE ON results FOR EACH ROW — insère dans audit_results (user, date, opération INSERT/UPDATE/DELETE, student_id, course_id, points).
**name**: Fonction fn_average
**description**: RETURN NUMBER — SELECT AVG(points) FROM results WHERE id_student = p_student_id.
**name**: Procédure pr_result
**description**: Cursor sur tous les étudiants, appelle fn_average, affiche le niveau : Échec (<10), Moyen (<12), Assez bien (<14), Bien (<16), Très bien (≥16).
**name**: Package pkg_results
**description**: Spec + body encapsulant fn_average et pr_result. Le body de pr_result est simplifié (pas de branchement de niveau, affiche directement la moyenne).

## Constraints

- Oracle PL/SQL syntax (RAISE_APPLICATION_ERROR, MERGE, DBMS_OUTPUT, USER, SYSDATE).
- RAISE_APPLICATION_ERROR code doit être dans [-20999, -20000].
- Le trigger trg_update_teacher_specialty est de type statement (pas FOR EACH ROW) — recompute toutes les spécialités à chaque DML sur professors.
- La table teacher_specialty doit exister avant la création du trigger associé.
- La table audit_results doit exister avant la création du trigger trg_audit_results.
- Le body du package pr_result est une version allégée (sans niveaux) par rapport à la procédure standalone.

## Examples

- SELECT s.name, c.name, r.points FROM students s JOIN results r ON s.id_student = r.id_student JOIN courses c ON r.id_course = c.id_course ORDER BY s.name;
- SELECT p.name, c.name FROM professors p JOIN workload w ON p.id_prof = w.id_prof JOIN courses c ON w.id_course = c.id_course;
- ALTER TABLE results ADD CONSTRAINT chk_score CHECK (points BETWEEN 0 AND 20);
- SELECT pkg_results.fn_average(42) FROM dual;
