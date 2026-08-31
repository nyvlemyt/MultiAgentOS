---
id: resource-define-job-to-build-and-publish-docker-image-38898472
slug: resource-define-job-to-build-and-publish-docker-image-38898472
source_key: 'sha256:38898472fa174b80e6df469a8bd7d9ca144eef4a3a90d20c81c2d77592638754'
part_of: null
order: null
manifest: null
derived_from: 'sha256:38898472fa174b80e6df469a8bd7d9ca144eef4a3a90d20c81c2d77592638754'
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
doc_type: howto
actionability: area
lane: workflows
schema_version: '1'
tags:
  - github-actions
  - ci-cd
  - docker
  - maven
  - sonarcloud
  - devops
  - java
domain: DevOps
---
# define job to build and publish docker image

## Problem

Build, test, and publish Docker images automatically on every commit using GitHub Actions, while gating publication behind passing tests and protecting credentials.

## Solution

Create a `.github/workflows/main.yml` pipeline with three sequential jobs — `test-backend` (Maven build + tests), `build-and-push-docker-image` (Docker build, conditioned on `needs: test-backend`), and an optional SonarCloud quality gate — using GitHub Secrets for DockerHub and Sonar credentials.

**Step 1 — CI: build and test**
```yaml
name: CI devops 2025
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test-backend:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Build and test with Maven
        run: mvn clean verify --file ./simple-api/pom.xml
```
Testcontainers (declared in `pom.xml`) spin up a real PostgreSQL container during integration tests — no manual DB setup needed.

**Step 2 — CD: build Docker images**
```yaml
  build-and-push-docker-image:
    needs: test-backend
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login --username ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin

      - name: Build image and push backend
        uses: docker/build-push-action@v6
        with:
          context: ./simple-api
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/tp-devops-simple-api:latest
          push: ${{ github.ref == 'refs/heads/main' }}

      - name: Build image and push database
        uses: docker/build-push-action@v6
        with:
          context: ./database
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/tp-devops-database:latest
          push: ${{ github.ref == 'refs/heads/main' }}

      - name: Build image and push httpd
        uses: docker/build-push-action@v6
        with:
          context: ./httpd
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/tp-devops-httpd:latest
          push: ${{ github.ref == 'refs/heads/main' }}
```

**Step 3 — Quality gate: SonarCloud**
Add after the Maven build step in `test-backend`:
```yaml
      - name: Sonar analysis
        run: mvn -B verify sonar:sonar \
          -Dsonar.projectKey=<your-project-key> \
          -Dsonar.organization=<your-organization> \
          -Dsonar.host.url=https://sonarcloud.io \
          -Dsonar.login=${{ secrets.SONAR_TOKEN }} \
          --file ./simple-api/pom.xml
```
Store `SONAR_TOKEN`, `DOCKERHUB_USERNAME`, and `DOCKERHUB_TOKEN` in GitHub → Settings → Secrets → Actions.

## Variations

- Split into two separate workflow files: one for `test-backend` (triggers on `develop` and `main`), one for `build-and-push-docker-image` (triggers via `on: workflow_run` only when the test workflow passes on `main`).
- Use `docker/login-action@v3` instead of the raw `docker login` shell command for better credential handling and multi-registry support.
- Pin image tags to the commit SHA (`${{ github.sha }}`) in addition to `latest` for reproducible rollbacks.

## Pitfalls

- `needs: test-backend` is mandatory on the build job — omitting it causes Docker images to be built and pushed even when tests fail.
- Never hardcode DockerHub or Sonar credentials in the YAML — always use `secrets.*`; GitHub masks them in logs but they would be exposed in plain text otherwise.
- Tags must be all lower-case; uppercase characters in `DOCKERHUB_USERNAME` will cause the build-push action to reject the tag.
- `push: ${{ github.ref == 'refs/heads/main' }}` ensures images are built on every branch but published only from `main` — removing this condition leaks unreviewed images to the public registry.
- Maven must be run from the directory containing `pom.xml` or with `--file /path/to/pom.xml`; forgetting this causes a `No POM found` build failure.
