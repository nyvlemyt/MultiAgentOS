---
id: resource-run-a-container-from-the-mysql-image-latest-version-3f8f606c
slug: resource-run-a-container-from-the-mysql-image-latest-version-3f8f606c
source_key: 'sha256:3f8f606cafcf5e5c9f8848921a37afa31416eca5871bf6c4c564f25aa15a489c'
part_of: null
order: null
manifest: null
derived_from: 'sha256:3f8f606cafcf5e5c9f8848921a37afa31416eca5871bf6c4c564f25aa15a489c'
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
lane: resources
schema_version: '1'
tags:
  - docker
  - containers
  - devops
  - cli
  - images
  - dockerfile
  - docker-compose
domain: infrastructure
---
# run a container from the mysql image (latest version)

## Summary

Référence des commandes et concepts Docker essentiels : différence image/container, commandes `run`/`stop`/`kill`/`ps`, construction d'image via Dockerfile, docker-compose pour multi-containers, et Docker Hub comme registre d'images.

## Fields/API

**image_vs_container**: Une image est un snapshot versionné (la 'classe') ; un container est l'instance en cours d'exécution (l''objet').
**run_command**: docker run [options] <image>[:<tag>]
  -p <host_port>:<container_port>  — exposition de port
  --name <nom>                      — nommer le container
  -e <VAR>=<valeur>                 — variable d'environnement
  -d                                — mode détaché (background)
  -it                               — mode interactif (terminal)
**lifecycle_commands**: - docker container ps [-a]        — liste les containers (tous avec -a)
- docker container stop <nom>     — arrêt gracieux (SIGTERM)
- docker container kill <nom>     — arrêt immédiat (SIGKILL)
- docker images                   — liste les images locales
- docker network create <réseau>  — crée un réseau virtuel privé
**dockerfile_instructions**: **FROM**: Image de base (ex: ubuntu:18.10, java:21)
**RUN**: Commande exécutée au build (installation de dépendances)
**ENTRYPOINT**: Programme lancé au démarrage du container
**CMD**: Arguments par défaut passés à ENTRYPOINT
**build_command**: docker build . -t <nom-image>  — construit une image depuis le Dockerfile du répertoire courant
**docker_compose_keys**: **services**: Déclaration des containers (image, ports, variables, dépendances)
**networks**: Réseaux virtuels partagés entre services
**volumes**: Persistance de données entre redémarrages
**docker_hub**: Registre public d'images officielles (hub.docker.com) — équivalent d'un Maven Central pour les images Docker.

## Constraints

- 1 process = 1 container (ne pas mettre DB + webapp + reverse-proxy dans un seul container)
- Fixer les versions d'image (éviter le tag `latest` en production)
- Utiliser des images officielles comme base
- Viser la taille d'image la plus petite possible

## Examples

- docker run -p 3306:3306 mysql
- docker run -p 5432:5432 postgresql
- docker run --name my-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=toor mariadb
- docker container run nginx:1.15.8 --name my-nginx -d
- docker build . -t my-image
- docker-compose.yml avec services httpd + java-jre + postgres
