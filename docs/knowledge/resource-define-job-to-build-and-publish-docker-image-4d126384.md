---
id: resource-define-job-to-build-and-publish-docker-image-4d126384
slug: resource-define-job-to-build-and-publish-docker-image-4d126384
source_key: 'sha256:4d1263843a586f261c68e654d1d25f8b64cbb663aea4a9a1e983e207e71d0314'
part_of: null
order: null
manifest: null
derived_from: 'sha256:4d1263843a586f261c68e654d1d25f8b64cbb663aea4a9a1e983e207e71d0314'
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

Build, test, and publish Docker images automatically on every push to main, with code quality analysis, using GitHub Actions.

## Solution

Create a `.github/workflows/main.yml` pipeline with three sequential jobs: (1) `test-backend` runs `mvn clean verify` on ubuntu-24.04 with JDK 21 (uses Testcontainers for DB integration tests); (2) `build-and-push-docker-image` (needs: test-backend) builds images via `docker/build-push-action@v6` for each service (backend, database, httpd), logs in via `docker login --password-stdin` using secrets, and pushes only on `refs/heads/main`; (3) SonarCloud analysis is added as a step inside `test-backend` via `mvn -B verify sonar:sonar` with project key, org, host URL, and `${{ secrets.SONAR_TOKEN }}`.

Minimal `main.yml` skeleton:
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
      - name: Build, test and analyze
        run: mvn -B verify sonar:sonar
          -Dsonar.projectKey=<key>
          -Dsonar.organization=<org>
          -Dsonar.host.url=https://sonarcloud.io
          -Dsonar.login=${{ secrets.SONAR_TOKEN }}
          --file ./simple-api/pom.xml

  build-and-push-docker-image:
    needs: test-backend
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login
          --username ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin
      - name: Build image and push backend
        uses: docker/build-push-action@v6
        with:
          context: ./simple-api
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/tp-devops-simple-api:latest
          push: ${{ github.ref == 'refs/heads/main' }}
```

## Variations

- Split into two separate workflow files: one for testing (triggered on develop + main), one for build/push (triggered via `on: workflow_run` only after the test workflow passes on main).
- Add semantic versioning tags alongside `:latest` using `docker/metadata-action`.
- Use a matrix strategy to build multiple service images in parallel within the same job.

## Pitfalls

- `needs: test-backend` is mandatory on the build job — without it, Docker images are pushed even when tests fail.
- Docker Hub credentials must be stored as GitHub Actions secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN), never hardcoded in the YAML.
- Image tags must be all lower-case; uppercase characters cause `docker/build-push-action` to error.
- Testcontainers requires Docker-in-Docker to be available on the runner — ubuntu-24.04 hosted runners support this natively.
- `push: ${{ github.ref == 'refs/heads/main' }}` ensures feature-branch commits build but do not publish to Docker Hub.
