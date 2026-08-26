---
id: resource-s6-base-de-donnees-tutorialfx-pdf-5addb372
slug: resource-s6-base-de-donnees-tutorialfx-pdf-5addb372
source_key: 'sha256:5addb37224bab6b4c87451ae5bff61a84c66456fd8e202bd0a259eb162d87490'
part_of: S6 - Base de données
order: 7
manifest: null
derived_from: 'sha256:5addb37224bab6b4c87451ae5bff61a84c66456fd8e202bd0a259eb162d87490'
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
  - javafx
  - java
  - crud
  - mysql
  - jdbc
  - mvc
  - dao
  - scenebuilder
  - fxml
domain: desktop-development
---
# S6 - Base de données — TutorialFX.pdf

## Goal

Build a JavaFX CRUD application (Create, Read, Update, Delete) for managing students, backed by a MySQL database, following the MVC pattern with a DAO layer.

## Prerequisites

- Java + JavaFX project setup (IntelliJ or Eclipse)
- MySQL server running locally with a database named 'student'
- MySQL Connector/J (JDBC driver) jar available
- SceneBuilder installed for visual FXML editing

## Steps

- **Step 1 – Create project:** New JavaFX project named StudentFX. Rename HelloApplication → Main, HelloController → StudentController, hello-view.fxml → student.fxml.
- **Step 2 – Model class:** Create Student.java with fields id (int), name (String), gender (String). Generate getters/setters, two constructors (name+gender, and all fields), toString() returning (name, gender).
- **Step 3 – Build the UI:** Open student.fxml in SceneBuilder. Replace default VBox with an AnchorPane. Add: Labels, a ListView (lvStudents), a TextField (txtName), a ComboBox (cmbGender), and action buttons. Assign fx:id to every control via the Code panel, then save.
- **Step 4 – Wire controller:** In StudentController, declare each UI control with @FXML annotation using the exact fx:id names. SceneBuilder's Controller panel can generate the @FXML statements automatically.
- **Step 5 – Initialize ComboBox:** Implement Initializable. In initialize(), populate cmbGender with ["Male", "Female"] via FXCollections.observableArrayList.
- **Step 6 – Hard-coded data (smoke test):** In initialize(), build a hardcoded List<Student> and bind it to lvStudents.setItems(). Run to verify the ListView renders.
- **Step 7 – Selection listener:** Add a listener on lvStudents.getSelectionModel().selectedItemProperty() using a lambda that calls displayStudentDetails(selectedStudent), which sets txtName.setText() and cmbGender.setValue().
- **Step 8 – Create the database:** In MySQL, create database 'student' with table 'studenttable' (columns: id INT PK AUTO_INCREMENT, name VARCHAR, gender VARCHAR). Insert sample rows.
- **Step 9 – Add JDBC driver:** Project Structure → Module → Dependencies → + → JARs → browse to MySQL Connector/J jar.
- **Step 10 – DBManager (DAO):** Create DBManager.java. Implement: Connector() returning a Connection via DriverManager.getConnection (jdbc:mysql://localhost:3306/student); close(conn, stmt, rs) for cleanup; loadStudents() that queries SELECT * FROM studenttable and returns List<Student>. In StudentController, instantiate DBManager in initialize() and replace hard-coded list with fetchStudents() → manager.loadStudents().
- **Step 11 – Verify selection still works:** No code change needed; displayStudentDetails from Step 7 already handles it. Run and confirm clicking a name populates the fields.
- **Step 12 – Add / Save / Cancel:** Add buttons btnAdd, btnSave, btnCancel. onNew() clears selection and blanks fields. onCancel() selects first item. onSave() constructs a Student from field values, calls manager.addStudent(s) (PreparedStatement INSERT), then refreshes via fetchStudents(). addStudent uses PreparedStatement with ? placeholders to prevent SQL injection.

## Result

A running JavaFX desktop app that loads students from MySQL on startup, lets the user select a student to view details, add a new student (with DB persistence), and refreshes the list automatically. MVC is respected: Student.java = Model, student.fxml = View, StudentController.java = Controller, DBManager.java = DAO.

## Next

- Implement Update: add a btnUpdate that calls manager.updateStudent(s) with a SQL UPDATE statement.
- Implement Delete: add a btnDelete that calls manager.deleteStudent(id) with a SQL DELETE statement.
- Refactor DBManager to use a connection pool (HikariCP) instead of opening/closing a connection per operation.
- Add input validation (empty name guard, null gender guard) before onSave().
- Style the UI with CSS (JavaFX stylesheets) for a polished look.
