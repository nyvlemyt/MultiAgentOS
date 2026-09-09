---
id: resource-s7-devops-17c280d9
slug: resource-s7-devops-17c280d9
source_key: 'sha256:17c280d91ab6c0399da8cb22a862ce83262998fdf009b5928e1518092fffa663'
part_of: null
order: null
manifest: null
derived_from: 'sha256:17c280d91ab6c0399da8cb22a862ce83262998fdf009b5928e1518092fffa663'
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
  - devops
  - docker
  - ansible
  - github-actions
  - ci-cd
  - git
  - infrastructure
  - automation
  - containers
  - configuration-management
domain: DevOps & Infrastructure
---
# S7 - DevOps

## Summary

Module DevOps S7 (EFREI) couvrant trois piliers : Docker (conteneurisation), GitHub Actions (CI/CD), et Ansible (gestion de configuration). Chaque pilier est décliné en cours magistral, TD (travaux dirigés) et TP (travaux pratiques).

## Fields/API

**name**: Docker
**description**: Conteneurisation d'applications. Comprend cours théorique (Devops & Docker EFREI.pdf), TD part 01 et TP part 01.
**subtopics**: - images
- conteneurs
- Dockerfile
- docker-compose
- registres
**name**: GitHub Actions / CI-CD
**description**: Automatisation des pipelines d'intégration et de déploiement continu via GitHub Actions. Comprend cours (Git & CI_CD Github Actions EFREI.pdf), TD part 02, TP part 02, et un dépôt TP dédié (github_tp).
**subtopics**: - workflows YAML
- jobs
- runners
- triggers
- secrets
- déploiement automatisé
**name**: Ansible
**description**: Gestion de configuration et provisionnement d'infrastructure. Comprend cours (Ansible EFREI.pdf), TD part 03 et TP part 03.
**subtopics**: - playbooks
- inventaires
- rôles
- modules
- idempotence
**name**: Structure pédagogique
**description**: Chaque outil suit la progression : cours magistral → TD (exercices guidés) → TP (mise en pratique autonome).
**subtopics**: - 10 fichiers au total
- 3 cours
- 3 TD
- 3 TP
- 1 dépôt GitHub associé

## Constraints

- Module de niveau S7 (Bac+4/5) — prérequis Linux, réseaux de base, Git fondamentaux supposés acquis.
- Les TPs GitHub Actions référencent un dépôt externe (github_tp) nécessaire pour les exercices.
- Les PDFs sont des supports EFREI — contenu académique, non des documentations officielles des outils.

## Examples

- TD part 01 Docker : construire et lancer un conteneur d'application web.
- TP part 02 GitHub Actions : créer un workflow CI qui teste et déploie une app sur push.
- TD part 03 Ansible : écrire un playbook qui installe et configure un serveur Nginx.
