---
id: resource-todo-add-the-compiled-java-aka-bytecode-aka-class-6043a7fa
slug: resource-todo-add-the-compiled-java-aka-bytecode-aka-class-6043a7fa
source_key: 'sha256:6043a7faad880df70c0353e1857561fb23bab072ea517b346034687e3b9428a0'
part_of: null
order: null
manifest: null
derived_from: 'sha256:6043a7faad880df70c0353e1857561fb23bab072ea517b346034687e3b9428a0'
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
lane: workflows
schema_version: '1'
tags:
  - docker
  - devops
  - postgresql
  - java
  - spring-boot
  - apache-httpd
  - docker-compose
  - multistage-build
  - reverse-proxy
  - docker-hub
domain: DevOps
---
# TODO:  Add the compiled java (aka bytecode, aka .class)

## Goal

Build and orchestrate a 3-tier web application (Apache reverse proxy + Spring Boot Java API + PostgreSQL database) using Docker and docker-compose, then publish the images to Docker Hub.

## Prerequisites

- Docker installed and daemon running
- Docker Hub account created
- Basic Linux terminal knowledge
- Java JDK 21 available locally (only needed for the pre-multistage Hello World step)
- Maven available locally (only needed before the multistage build step)

## Steps

**title**: Create the Docker network
**body**: Run `docker network create app-network`. All containers will join this network so they can communicate by service name instead of the deprecated `--link` flag.
**title**: Database — build the PostgreSQL image
**body**: Write a Dockerfile based on `postgres:17.2-alpine`. Set `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` via `ENV` (or pass them at runtime with `-e` to avoid hard-coded secrets). Copy `01-CreateScheme.sql` and `02-InsertData.sql` into `/docker-entrypoint-initdb.d/`; they run in alphabetical order on first start. Build: `docker build -t my-database .`.
**title**: Database — run with volume and verify via Adminer
**body**: Start the container with a host volume for persistence: `docker run -d --name db --net=app-network -v /my/own/datadir:/var/lib/postgresql/data my-database`. Launch Adminer on the same network: `docker run -p 8090:8080 --net=app-network --name=adminer -d adminer`. Browse to http://localhost:8090 and confirm the `departments` and `students` tables exist with seed data.
**title**: Backend — Hello World .class in a container
**body**: Compile `Main.java` locally with `javac Main.java`. Write a Dockerfile: `FROM eclipse-temurin:21-jre-alpine`, copy `Main.class`, set `CMD ["java", "Main"]`. Build and run; you should see `Hello World!` in the console. This validates the JRE base image before adding Maven complexity.
**title**: Backend — multistage Spring Boot build
**body**: Generate a Spring Boot 3.4.5 Maven project (Java 21, Spring Web, Jar packaging) from Spring Initializr. Add a `GreetingController` with a `GET /` endpoint. Write a two-stage Dockerfile: stage 0 (`eclipse-temurin:21-jdk-alpine`) installs Maven via apk, copies `pom.xml` + `src/`, runs `mvn package -DskipTests` (optionally cache deps first with `mvn dependency:go-offline`). Stage 1 (`eclipse-temurin:21-jre-alpine`) copies only the resulting jar and sets `ENTRYPOINT ["java","-jar","myapp.jar"]`. The runtime image ships no compiler — smaller and safer.
**title**: Backend — connect to the database
**body**: Replace the generated `src/` and `pom.xml` with the provided `simple-api` source. Edit `src/main/resources/application.yml` so the JDBC URL references the database container by its service name (e.g., `jdbc:postgresql://db:5432/db`). Rebuild the image and run it on `app-network`. Verify by hitting `/departments/IRC/students`; expect JSON with Eli Copter.
**title**: HTTP server — Apache reverse proxy
**body**: Choose `httpd:2.4` as the base image. Copy a custom `httpd.conf` (retrieved with `docker exec <container> cat /usr/local/apache2/conf/httpd.conf` or `docker cp`) into the image. Append the `<VirtualHost>` block that loads `mod_proxy` + `mod_proxy_http` and proxies all traffic to `http://backend:8080/`. Build and run on `app-network`, publishing port 80. The reverse proxy decouples the public entry point from the backend address and enables future SSL termination and load balancing.
**title**: Orchestrate with docker-compose
**body**: Create `docker-compose.yml` with three services (`database`, `backend`, `httpd`). Key points: `backend` declares `depends_on: [database]`; `httpd` declares `depends_on: [backend]`; only `httpd` exposes a host port (80); database and backend ports are internal only. Add a named volume for the database, a shared network, environment variables for DB credentials (use `.env` file or compose `environment` block — never hard-code in the file), and `restart: unless-stopped`. Run with `docker compose up --build -d`.
**title**: Publish images to Docker Hub
**body**: Authenticate: `docker login`. Tag each image with a version: `docker tag my-database USERNAME/my-database:1.0`. Push: `docker push USERNAME/my-database:1.0`. Repeat for backend and httpd images. Add a README on Docker Hub describing expected env vars and the compose file so teammates can pull and run without reading source.

## Result

A fully functional 3-tier web API accessible on http://localhost, orchestrated by docker-compose. The reverse proxy routes external requests to the Spring Boot API, which queries a schema-initialised and data-seeded PostgreSQL database whose data survives container restarts via a Docker volume. All three images are versioned and published to Docker Hub.

## Next

- Add CI/CD pipeline (GitHub Actions) to build and push images automatically on each push
- Introduce secrets management (Docker secrets or an `.env` file excluded from git) instead of inline env vars
- Explore Kubernetes for production-grade orchestration and horizontal scaling
