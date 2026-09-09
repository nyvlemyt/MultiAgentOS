---
id: resource-list-of-cat-images-1f962f58
slug: resource-list-of-cat-images-1f962f58
source_key: 'sha256:1f962f58cec442826f3042772f76f11afb2cd59067a54fbed556375c26a15ff4'
part_of: null
order: null
manifest: null
derived_from: 'sha256:1f962f58cec442826f3042772f76f11afb2cd59067a54fbed556375c26a15ff4'
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
  - containers
  - dockerfile
  - flask
  - python
  - alpine
  - devops
domain: DevOps
---
# list of cat images

## Goal

Learn Docker fundamentals by running containers, exploring terminology, and building a Dockerized Python Flask app that displays random cat images.

## Prerequisites

- Basic command-line comfort
- Docker installed (Mac/Linux/Windows)
- Docker account on cloud.docker.com
- No prior Docker experience required; web dev experience helpful

## Steps

- Verify installation: `docker run hello-world`
- Pull Alpine image: `docker pull alpine`; list images with `docker images`
- Run commands in a container: `docker run alpine ls -l`, `docker run alpine echo 'hello'`
- Open an interactive shell: `docker run -it alpine /bin/sh`; exit with `exit`
- Inspect containers: `docker ps` (running), `docker ps -a` (all)
- Run a static site in detached mode: `docker run -d dockersamples/static-site`
- Expose ports with -P (random) or -p 8888:80 (fixed); pass env vars with -e; name container with --name
- Check port mapping: `docker port <name>`; stop/remove with `docker stop` + `docker rm` or `docker rm -f`
- Create flask-app directory with: app.py (Flask app with list of cat gif URLs), requirements.txt (Flask==3.1.0), templates/index.html (renders the gif URL)
- Write Dockerfile: FROM alpine:3.21.0 → RUN apk install python3+pip → WORKDIR → RUN venv → ENV PATH → COPY requirements.txt + RUN pip install → COPY app.py + templates → EXPOSE 5000 → CMD ["python", "/usr/src/app/app.py"]
- Build image: `docker build -t <username>/myfirstapp .`
- Run image: `docker run -p 8888:5000 --name myfirstapp <username>/myfirstapp`
- Open http://localhost:8888 and refresh to see random cat gifs

## Result

A running Dockerized Flask application accessible on localhost:8888, serving random cat GIFs. Learner understands images vs containers, key docker run flags (-d, -it, -p, -P, -e, --name), and the core Dockerfile instructions (FROM, RUN, COPY, EXPOSE, CMD, WORKDIR, ENV).

## Next

- Push image to Docker Hub: `docker push <username>/myfirstapp`
- Explore Docker Compose for multi-container apps
- Apply to practical DevOps exercises (TD part 02+)
- Read Dockerfile best practices documentation
