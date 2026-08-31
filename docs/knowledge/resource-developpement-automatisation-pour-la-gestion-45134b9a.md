---
id: resource-developpement-automatisation-pour-la-gestion-45134b9a
slug: resource-developpement-automatisation-pour-la-gestion-45134b9a
source_key: 'sha256:45134b9a5d0a464993a6d54182ebd2186a6059121d712b20a5c0c5ca1003d65b'
part_of: null
order: null
manifest: null
derived_from: 'sha256:45134b9a5d0a464993a6d54182ebd2186a6059121d712b20a5c0c5ca1003d65b'
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
  - alternance
  - finance
  - python
  - automatisation
  - gestion-actifs
  - api
  - bloomberg
  - sftp
  - modulaire
domain: finance & développement logiciel
---
# Développement & Automatisation pour la Gestion

## Summary

Rapport de stage d'alternance (2024-2025) de Melvyn Pommier chez BDF-Gestion, société de gestion de fonds (>40 Md€, 31 fonds). Présente l'architecture IT (3 datacenters SecNumCloud, VDI, VPN), les missions d'infogérance et deux projets techniques majeurs : (1) contrôle automatique de dégradation de notation de crédit via API Bloomberg/Jump + Python/Pandas + rapport email quotidien ; (2) refonte modulaire du flux Glimpse (SFTP/Paramiko, parsing FIX, API Jump, alertes mail). Vision : migration Nuxt 3, dashboard CSDR dynamique, écosystème Big Data/IA.

## Fields/API

**name**: Entreprise
**value**: BDF-Gestion — société de gestion de fonds (40 Md€, 31 fonds, 40 collaborateurs)
**name**: Infrastructure IT
**value**: 3 datacenters (PA6, PAR7S, TH3) certifiés SecNumCloud ANSSI ; VDI ; VPN RSA ; hébergement Cloud Temple
**name**: Projet 1 — Notation crédit
**value**: Script Python quotidien : pull API Jump (J vs J-1), filtre jours non ouvrés, classification Pandas, rapport HTML coloré envoyé à 5 pôles ; alertes + logs en cas d'erreur
**name**: Projet 2 — Refonte Glimpse
**value**: Architecture modulaire 4 packages (api/, core/, utils/, notifications/) ; SFTP Paramiko ; parsing FIX pour enrichissement 'venue' ; validation portefeuilles Excel→JSON via VBA ; alertes mail + logs
**name**: Outillage dev
**value**: Macro mkvenv, commandes pipadd/pyclean, modules réutilisables (logs, connexions API, e-mail), scripts VBA/Python ponctuels
**name**: Projets à venir
**value**: Migration Nuxt 3, refonte CSDR (PDF → dashboard dynamique), factorisation Big Data/IA
**name**: Stack principale
**value**: Python, Pandas, Paramiko, VBA, API REST Jump/Bloomberg, SFTP, HTML/email multiplateforme

## Constraints

- Données financières sensibles — flux entre systèmes internes (Jump PMS) et externes (Bloomberg, Glimpse/SFTP)
- Conformité réglementaire : suivi des dégradations de notation requis par les équipes Risques et Contrôle Interne
- Compatibilité email Outlook + Mail Apple pour les rapports HTML
- Continuité de flux : erreurs gérées sans blocage du pipeline ; alertes IT automatiques

## Examples

- Rapport de dégradation de notation : rouge = dégradation, vert = amélioration, orange = cas douteux ; distribué chaque matin à 5 pôles
- Flux Glimpse matinal : récupération SFTP → enrichissement FIX → transmission API Jump ; flux soir : extraction Jump → enrichissement venue → envoi Glimpse
