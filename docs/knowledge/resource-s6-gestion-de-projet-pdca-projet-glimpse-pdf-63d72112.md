---
id: resource-s6-gestion-de-projet-pdca-projet-glimpse-pdf-63d72112
slug: resource-s6-gestion-de-projet-pdca-projet-glimpse-pdf-63d72112
source_key: 'sha256:63d7211292029398d83e3f937488376232f8e45c2e3f83e2624db638a7e110cf'
part_of: resource-s6-gestion-de-projet-20404db8
order: 4
manifest: null
derived_from: 'sha256:63d7211292029398d83e3f937488376232f8e45c2e3f83e2624db638a7e110cf'
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
  - pdca
  - python
  - automation
  - pipeline
  - api
  - scheduling
  - security
  - gpg
  - sql
domain: gestion de projet / intégration de données
---
# S6 - Gestion de projet — PDCA_Projet_Glimpse.pdf

## Problem

Automatiser l'échange de données entre une API interne (Jump) et une plateforme tierce (Glimpse) : envoyer les ordres du jour le soir et récupérer les résultats enrichis le matin, tout en sécurisant les secrets et en rendant le pipeline maintenable.

## Solution

Deux scripts Python indépendants planifiés (cron ou équivalent) : `send_data` (soir) extrait les ordres de Jump et les envoie à Glimpse ; `receive_data` (matin) récupère les données Glimpse et les charge en SQL local. Les secrets (`.env`, clé privée) sont chiffrés via GPG ; un script `setup_project.py` gère le déchiffrement à l'initialisation. Le projet est structuré dans VSCode avec des bibliothèques Python adaptées.

## Variations

- Remplacer la planification locale par un orchestrateur (Airflow, Prefect) pour un meilleur monitoring et des retries automatiques.
- Stocker les secrets dans un vault dédié (HashiCorp Vault, AWS Secrets Manager) plutôt que via GPG sur disque.
- Exposer les résultats SQL via un dashboard BI plutôt qu'une exploitation SQL directe.

## Pitfalls

- Bus factor = 1 : une seule personne maîtrise le projet — risque critique en cas d'absence.
- Documentation minimale : pas de README ni schéma d'architecture au moment du rapport, ce qui freine toute passation.
- Dépendance aux APIs externes (Jump, Glimpse) : tout changement de contrat casse le pipeline sans préavis.
- Absence de logs structurés : les erreurs silencieuses sont difficiles à détecter a posteriori.
- Aucun test automatisé sur les traitements complexes : les régressions passent inaperçues.
