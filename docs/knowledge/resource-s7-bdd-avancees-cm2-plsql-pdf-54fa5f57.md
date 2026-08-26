---
id: resource-s7-bdd-avancees-cm2-plsql-pdf-54fa5f57
slug: resource-s7-bdd-avancees-cm2-plsql-pdf-54fa5f57
source_key: 'sha256:54fa5f579054954ca3ce13c764db5b1a379be183599e73ec0cac89718a12a52b'
part_of: resource-s7-bdd-avancees-03c845ab
order: 5
manifest: null
derived_from: 'sha256:54fa5f579054954ca3ce13c764db5b1a379be183599e73ec0cac89718a12a52b'
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
  - database
  - stored-procedures
  - triggers
  - cursors
  - exceptions
  - packages
  - functions
  - control-structures
domain: databases
---
# S7 - BDD Avancées — CM2-PLSQL.pdf

## Summary

PL/SQL (Procedural Language / SQL) is Oracle's procedural extension to SQL. It adds loops, conditions, variables, cursors, exception handling, and named sub-programs (procedures, functions, packages, triggers) to plain SQL. A PL/SQL program is organised into blocks with three sections: DECLARE (optional — variables, cursors, exceptions), BEGIN … END (mandatory — executable statements), and EXCEPTION (optional — error handlers). Blocks can be anonymous or named; named blocks are stored in the database and reused without recompilation.

## Fields/API

**name**: Block structure
**description**: Every PL/SQL unit follows the pattern: optional DECLARE section → mandatory BEGIN…END section → optional EXCEPTION section, terminated by a bare '/' to force execution in SQL*Plus. Blocks may be nested. Variable scope follows nesting level.
**name**: Block types
**description**: Anonymous blocks: no header, cannot be called by name. Named blocks: Procedure (no return value), Function (returns a typed value), Package (groups objects), Trigger (runs automatically on IUD events).
**name**: Variable declaration syntax
**description**: name [CONSTANT] type [NOT NULL] [:= expression]; — declared in DECLARE. Name ≤ 30 chars. CONSTANT and NOT NULL both require an initialiser. %TYPE anchors a variable's type to a column (table.column%TYPE) or another variable. %ROWTYPE anchors a record to a full cursor or table row.
**name**: Scalar types
**description**: VARCHAR2(n) — variable-length string up to n chars (NULL = empty string in Oracle). CHAR(n) — fixed-length. NUMBER(n,m) — n total digits, m decimals. DATE. BOOLEAN (TRUE/FALSE/NULL). INTEGER.
**name**: Global variables (SQL*Plus)
**description**: Prefix the name with ':' to declare or reference a SQL*Plus bind variable, e.g. :g_salary := v_sal / 12. Can be shared across PL/SQL blocks in the same session.
**name**: Assignment
**description**: Direct: identifier := expression. From query: SELECT col1, col2 INTO var1, var2 FROM table WHERE condition — the query MUST return exactly one row.
**name**: Operators & built-in functions
**description**: Arithmetic, logical, concatenation (||) operators same as SQL. Exponentiation: **. Single-line comment: --. Multi-line: /* … */. SQL scalar functions (UPPER, SUBSTR, REPLACE, TO_CHAR, SYSDATE, SUM, COUNT, …) are all available.
**name**: Conditional: IF
**description**: IF condition THEN … [ELSIF condition THEN …] [ELSE …] END IF; — supports RETURN inside a function branch.
**name**: Loop: LOOP / EXIT WHEN
**description**: LOOP … EXIT [WHEN condition]; … END LOOP; — infinite loop with explicit exit. Loops and blocks can carry labels (<<label_name>>) for EXIT label WHEN condition to break out of an outer loop.
**name**: Loop: FOR
**description**: FOR index IN [REVERSE] lower..upper LOOP … END LOOP; — index is implicitly declared (do not re-declare). &Nb substitution prompts the user at runtime in SQL*Plus.
**name**: Loop: WHILE
**description**: WHILE condition LOOP … END LOOP; — condition is evaluated before each iteration.
**name**: Exception handling
**description**: EXCEPTION section uses WHEN exception_name [OR …] THEN … clauses. WHEN OTHERS catches all unhandled exceptions and must come last. SQLCODE returns the numeric error code; SQLERRM returns the associated message string.
**name**: Predefined Oracle exceptions
**description**: Raised implicitly. Key names: NO_DATA_FOUND, TOO_MANY_ROWS, INVALID_CURSOR, ZERO_DIVIDE, DUP_VAL_ON_INDEX.
**name**: Non-predefined Oracle exceptions
**description**: Declare a name, associate it with an Oracle error number via PRAGMA EXCEPTION_INIT(exception_name, -error_number); in the DECLARE section, then handle in EXCEPTION.
**name**: User-defined exceptions
**description**: Declare in DECLARE, raise explicitly with RAISE exception_name. To return a message and code to the caller: RAISE_APPLICATION_ERROR(error_code, message) — error_code must be between -20000 and -20999.
**name**: Triggers
**description**: CREATE [OR REPLACE] TRIGGER name [BEFORE | AFTER] [INSERT [OR] UPDATE [OR] DELETE] ON table [FOR EACH ROW] [WHEN (condition)] DECLARE … BEGIN … EXCEPTION … END; / — fires automatically on IUD. :New.col and :Old.col access new/old row values inside BEGIN (colon required). In WHEN clause use New.col without colon. Predicates INSERTING, UPDATING, DELETING return BOOLEAN to distinguish the triggering event inside a combined trigger. Manage with ALTER TRIGGER name [ENABLE | DISABLE], DROP TRIGGER name, SELECT trigger_name FROM User_Triggers.
**name**: Inline procedures
**description**: Declared inside a DECLARE block: PROCEDURE name [(p1 [IN|OUT|IN OUT] type, …)] IS [locals] BEGIN … EXCEPTION … END; — called by name within the enclosing block. Default mode is IN.
**name**: Stored procedures
**description**: CREATE [OR REPLACE] PROCEDURE name [(params)] IS … BEGIN … EXCEPTION … END; / — persisted in DB, called from PL/SQL as name(args) or from SQL*Plus as EXECUTE name(args). Dropped with DROP PROCEDURE name. Described with DESC name.
**name**: Inline functions
**description**: FUNCTION name [(params)] RETURN type IS [locals] BEGIN … RETURN value; EXCEPTION … END; — declared in DECLARE, called in expressions within the enclosing block.
**name**: Stored functions
**description**: CREATE [OR REPLACE] FUNCTION name [(params)] RETURN type IS … BEGIN … RETURN(value); EXCEPTION … END; / — called in PL/SQL as var := name(args) or in SQL*Plus as EXECUTE :var := name(args). Dropped with DROP FUNCTION name.
**name**: Packages
**description**: Two-part structure. Specification (public interface): CREATE [OR REPLACE] PACKAGE name IS [variable/type/cursor/procedure/function declarations] END [name]; / — Body (implementation): CREATE [OR REPLACE] PACKAGE BODY name IS [procedure/function bodies] END [name]; / — Called as package_name.object_name(params). Allows Oracle to load multiple objects into memory at once.
**name**: Explicit cursors
**description**: Declared as CURSOR name IS SELECT … (no INTO). Lifecycle: OPEN name → FETCH name INTO var1[,var2…] (one row per call) → CLOSE name. Attributes: %ISOPEN (Boolean), %FOUND (Boolean — last FETCH returned a row), %NOTFOUND (Boolean — last FETCH returned no row), %ROWCOUNT (Number — rows fetched so far). Shortcut: FOR rec IN cursor LOOP … END LOOP (OPEN/FETCH/CLOSE implicit, record implicitly declared).
**name**: Records
**description**: cursor_name%ROWTYPE declares a record typed to the cursor's SELECT list. Fields accessed as record.column_name.
**name**: Implicit cursors
**description**: Created automatically for every DML/SELECT executed outside an explicit cursor. Attributes via SQL% prefix: SQL%ROWCOUNT (INTEGER), SQL%FOUND (Boolean), SQL%NOTFOUND (Boolean), SQL%ISOPEN (always FALSE — closed immediately after execution).

## Constraints

- SELECT INTO must return exactly one row — zero rows raises NO_DATA_FOUND, multiple rows raises TOO_MANY_ROWS.
- Variables declared NOT NULL must be initialised; CONSTANT variables must also be initialised.
- Variable names are limited to 30 characters.
- User-defined error codes passed to RAISE_APPLICATION_ERROR must be in the range -20000 to -20999.
- WHEN OTHERS must always be the last WHEN clause in an EXCEPTION section.
- In a trigger WHEN clause, reference :New/:Old without the colon; inside the BEGIN section the colon is mandatory.
- A cursor's DECLARE section must not include an INTO clause; INTO is only used in FETCH.
- A FETCH on a closed cursor raises an error; always CLOSE after processing.
- The FOR LOOP index variable is implicitly declared — declaring it again in DECLARE causes a conflict.
- No standalone SELECT is allowed in the executable section; use SELECT INTO or a cursor.
- Packages cannot be instantiated, called directly, or nested inside other packages.
- SET SERVEROUTPUT ON must be active in SQL*Plus/script to see DBMS_OUTPUT.PUT_LINE output.

## Examples

**label**: Minimal block
**code**: BEGIN
  null;
END;
/
**label**: Variable declaration and SELECT INTO
**code**: DECLARE
  v_deptnum NUMBER(2);
  v_loc     VARCHAR2(15);
BEGIN
  SELECT deptnum, loc INTO v_deptnum, v_loc
  FROM dept WHERE name_dep = 'INFO';
  DBMS_OUTPUT.PUT_LINE(v_deptnum || ' ' || v_loc);
END;
/
**label**: IF / ELSIF / ELSE
**code**: IF v_beginning >= 100 THEN
  RETURN (2 * v_beginning);
ELSIF v_beginning >= 50 THEN
  RETURN (5 * v_beginning);
ELSE
  RETURN (v_beginning);
END IF;
**label**: Basic LOOP with EXIT WHEN
**code**: DECLARE
  v_count NUMBER(2) := 1;
  v_date  DATE;
BEGIN
  v_date := SYSDATE;
  LOOP
    INSERT INTO article VALUES (v_count, v_date);
    v_count := v_count + 1;
    EXIT WHEN v_count > 10;
  END LOOP;
END;
/
**label**: FOR LOOP
**code**: DECLARE
  v_date DATE;
BEGIN
  v_date := SYSDATE;
  FOR i IN 1..&Nb LOOP
    INSERT INTO article VALUES (i, v_date);
  END LOOP;
END;
/
**label**: WHILE LOOP
**code**: DECLARE
  v_count NUMBER(2) := 1;
  v_date  DATE;
BEGIN
  v_date := SYSDATE;
  WHILE v_count < 10 LOOP
    INSERT INTO article VALUES (v_count, v_date);
    v_count := v_count + 1;
  END LOOP;
END;
/
**label**: Nested loops with labels
**code**: BEGIN
  <<ext_loop>>
  LOOP
    v_count := v_count + 1;
    EXIT WHEN v_count > 10;
    <<int_loop>>
    LOOP
      EXIT ext_loop WHEN total = 1;
      EXIT int_loop WHEN int_done = 1;
    END LOOP int_loop;
  END LOOP ext_loop;
END;
/
**label**: Predefined exception handling
**code**: BEGIN
  ...
  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE(TO_CHAR(studnum) || ' Invalid');
  WHEN TOO_MANY_ROWS THEN
    DBMS_OUTPUT.PUT_LINE('Invalid Data');
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Other errors');
    ROLLBACK;
END;
/
**label**: Non-predefined exception (PRAGMA EXCEPTION_INIT)
**code**: DECLARE
  e_integ_viol EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_integ_viol, -2291);
BEGIN
  ...
EXCEPTION
  WHEN e_integ_viol THEN
    DBMS_OUTPUT.PUT_LINE('violation of an integrity constraint');
END;
/
**label**: User-defined exception with RAISE_APPLICATION_ERROR
**code**: DECLARE
  x NUMBER;
  very_small_x EXCEPTION;
BEGIN
  IF x < 5 THEN RAISE very_small_x; END IF;
EXCEPTION
  WHEN very_small_x THEN
    RAISE_APPLICATION_ERROR(-20002, 'the value of x is too small !!');
END;
/
**label**: Capturing error code and message
**code**: DECLARE
  v_error_code    NUMBER;
  v_error_message VARCHAR2(255);
BEGIN
  ...
EXCEPTION
  WHEN OTHERS THEN
    v_error_code    := SQLCODE;
    v_error_message := SQLERRM;
    INSERT INTO errors VALUES (v_error_code, v_error_message);
END;
/
**label**: Trigger with :New/:Old and Inserting/Deleting predicates
**code**: CREATE OR REPLACE TRIGGER UpdateNbStudents
AFTER INSERT OR DELETE ON Student
FOR EACH ROW
BEGIN
  IF INSERTING THEN
    UPDATE Class SET Nb_Stu = Nb_Stu + 1
    WHERE Id_Class = :New.Id_Class;
  END IF;
  IF DELETING THEN
    UPDATE Class SET Nb_Stu = Nb_Stu - 1
    WHERE Id_Class = :Old.Id_Class;
  END IF;
END;
/
**label**: Trigger with WHEN condition (no colon in WHEN)
**code**: CREATE OR REPLACE TRIGGER UpdateNbStudents
AFTER INSERT ON Student
FOR EACH ROW
WHEN (New.Age > 18)
BEGIN
  UPDATE Class SET Nb_Stu = Nb_Stu + 1
  WHERE Id_Class = :New.Id_Class;
END;
/
**label**: Stored procedure
**code**: CREATE OR REPLACE PROCEDURE AddProd(
  PrefPro Prod.RefPro%TYPE,
  PPriUni Prod.PriUni%TYPE,
  PErr    OUT NUMBER)
IS
BEGIN
  INSERT INTO Prod VALUES(PrefPro, PPriUni);
  COMMIT;
  PErr := 0;
EXCEPTION
  WHEN OTHERS THEN PErr := 1;
END;
/
**label**: Stored function
**code**: CREATE OR REPLACE FUNCTION NbEmp(
  PNumDep Emp.Dept_Id%TYPE,
  PErr    OUT NUMBER)
RETURN NUMBER IS
  VNB NUMBER(4);
BEGIN
  SELECT COUNT(*) INTO VNB FROM Emp WHERE Dept_id = PNumDep;
  PErr := 0;
  RETURN VNB;
EXCEPTION
  WHEN OTHERS THEN PErr := 1; RETURN NULL;
END;
/
**label**: Package specification and body
**code**: -- Specification
CREATE OR REPLACE PACKAGE PackProd IS
  CURSOR Cprod IS SELECT RefPro, DesPro FROM PRODUCT;
  PROCEDURE AddProd(PrefPro Prod.RefPro%TYPE, PErr OUT NUMBER);
END PackProd;
/

-- Body
CREATE OR REPLACE PACKAGE BODY PackProd IS
  PROCEDURE AddProd(PrefPro Prod.RefPro%TYPE, PErr OUT NUMBER) IS
  BEGIN
    INSERT INTO Prod VALUES(PrefPro, NULL);
    COMMIT; PErr := 0;
  EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN PErr := 1;
    WHEN OTHERS           THEN PErr := 1;
  END;
END PackProd;
/
**label**: Explicit cursor: OPEN / FETCH / CLOSE
**code**: CREATE OR REPLACE FUNCTION FindCourse(name_in IN VARCHAR2)
RETURN NUMBER IS
  cnumber NUMBER(4);
  CURSOR C1 IS
    SELECT course_number FROM courses WHERE course_name = name_in;
BEGIN
  OPEN C1;
  FETCH C1 INTO cnumber;
  IF C1%NOTFOUND THEN cnumber := 9999; END IF;
  CLOSE C1;
  RETURN cnumber;
END;
/
**label**: Cursor FOR-LOOP with %ROWTYPE record
**code**: DECLARE
  CURSOR Cur_Stud IS SELECT * FROM Stud;
BEGIN
  FOR Rec_Stud IN Cur_Stud LOOP
    DBMS_OUTPUT.PUT_LINE(Rec_Stud.name || ' ' || Rec_Stud.addr);
  END LOOP;
END;
/
**label**: Implicit cursor attribute SQL%ROWCOUNT
**code**: DECLARE
  v_category NUMBER := 605;
BEGIN
  DELETE FROM Item WHERE category = v_category;
  DBMS_OUTPUT.PUT_LINE(SQL%ROWCOUNT || ' Lines Deleted');
END;
/
