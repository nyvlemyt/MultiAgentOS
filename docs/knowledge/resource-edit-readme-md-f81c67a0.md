---
id: resource-edit-readme-md-f81c67a0
slug: resource-edit-readme-md-f81c67a0
source_key: 'sha256:f81c67a0bead1f0cd4a5eea9418f64d4cd9db88ae07f62672d58ccca3d80660b'
part_of: null
order: null
manifest: null
derived_from: 'sha256:f81c67a0bead1f0cd4a5eea9418f64d4cd9db88ae07f62672d58ccca3d80660b'
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
lane: workflows
schema_version: '1'
tags:
  - git
  - ci-cd
  - github-actions
  - docker
  - sonarcloud
  - devops
  - branching
  - version-control
domain: DevOps
---
# Edit README.md

## Summary

Cours EFREI 2026 couvrant deux axes DevOps : (1) les fondamentaux Git (VCS créé par Linus Torvalds en 2005, SHA-1, commits-snapshots, branches, working/staging/clean states) et (2) le pipeline CI/CD avec GitHub Actions et SonarCloud. Le flux type va du commit développeur → déclenchement workflow → build/test → publication image Docker → déploiement.

## Fields/API

**Git — états du fichier**: Working Directory (modifié, non tracé) → Staging Area (git add) → Clean Directory (git commit)
**Git — commandes d'inspection**: git diff, git status, git log, git log --graph --decorate --pretty=oneline --abbrev-commit --all
**Git — configuration initiale**: git config --global user.name / user.email
**Git — cycle de base**: git init → git add → git commit -m → .gitignore (gitignore.io)
**Git — références relatives**: HEAD, HEAD~1 (HEAD^), HEAD~2, HEAD~N ; aussi : branch name, tag, commit SHA
**Git — branches**: git branch <name>, git checkout <name>, git checkout -b <name> ; HEAD attaché (sur branche) vs détaché (sur commit SHA)
**CI/CD — étapes pipeline**: Commit → Build → Tests → Package (artifact repo) → Deploy (server)
**CI/CD — distinction CD**: Continuous Delivery = artefact poussé sur repo, déploiement manuel possible ; Continuous Deployment = déploiement entièrement automatique
**GitHub Actions — concepts clés**: Workflow, Event, Jobs, Steps, Actions, Templates ; config dans .github/workflows/*.yml
**GitHub Actions — structure .yml minimale**: name / on: [push] / jobs: <id>: runs-on: ubuntu-24.04 / steps: uses:/run:
**GitHub Actions — secrets**: Variables sensibles stockées dans les Secrets GitHub, jamais en clair dans le YAML
**SonarCloud — rôle**: Analyse statique : 20+ langages, couverture de tests, bugs & code smells, dette technique
**Outils CI/CD alternatifs**: Travis CI, Jenkins, GitLab CI, Circle CI
**Docker — rôle dans le pipeline**: Containerisation de l'application ; image publiée sur DockerHub en fin de pipeline CI

## Constraints

- Ne jamais mettre de données sensibles (secrets, credentials) dans le fichier main.yml — utiliser les Secrets GitHub.
- Protéger la branche main : ne pousser les images Docker que lors de commits sur main.
- Rollback automatique si les tests échouent.
- Ajouter des checks OWASP en extension du pipeline.
- Git utilise SHA-1 comme algorithme de checksum interne (160 bits).

## Examples

- Workflow minimal GitHub Actions : `on: [push]` → checkout → setup-node → npm install -g bats → bats -v
- Créer et switcher sur une branche feature : `git checkout -b feature` puis commits → `git checkout master`
- Ignorer les fichiers générés : ajouter `.idea/`, `*.svn`, `target/`, `bin/` dans `.gitignore` (générateur : gitignore.io)
- Inspecter un diff avant commit : `git diff` affiche les lignes +/- par fichier modifié
- Historique graphique : `git log --graph --decorate --pretty=oneline --abbrev-commit --all`
