---
id: resource-ing1-ls3-s5-ec013fa4
slug: resource-ing1-ls3-s5-ec013fa4
source_key: 'sha256:ec013fa4eafecae3ff8dd974c4320dd45095a632c393cfa8a4b7b5acf3bff2cc'
part_of: null
order: null
manifest: null
derived_from: 'sha256:ec013fa4eafecae3ff8dd974c4320dd45095a632c393cfa8a4b7b5acf3bff2cc'
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
  - bdf-gestion
  - finance
  - asset-management
  - esg
  - python
  - django
  - vue-js
  - infrastructure-it
  - rapport-intermédiaire
domain: finance & système d'information
---
# ING1 – LS3 –S5

## Summary

Rapport intermédiaire de contrat d'alternance ING1 (Melvyn Pommier) chez BDF-Gestion, société de gestion créée en 1996 par la Banque de France. BDF-Gestion gère plus de 20 Md€ d'actifs via 32 fonds (27 FCP + 5 FCPE). Le stagiaire occupe un rôle hybride entre infogérance et développement logiciel au sein d'une équipe IT de ~40 personnes.

## Fields/API

**name**: Entreprise
**value**: BDF-Gestion, filiale de la Banque de France créée en 1996. Gestion de fonds propres + épargne salariale. 20 Md€ AUM, 32 fonds (27 FCP, 5 FCPE). ~40 collaborateurs.
**name**: Pôles métiers
**value**: Front-Office (gérants taux/actions + analystes ESG) ; Risques (contraintes dans PMS JUMP) ; Contrôle interne / RCCI ; Secrétariat / secrétaire général ; Middle-Office (liaison front/back, implémentation titres dans JUMP).
**name**: Infrastructure IT
**value**: Virtualisation complète via VMware ESX. Clients légers sur postes utilisateurs. Infogérant : Cloud Temple. VPN FortiClient + clé RSA pour télétravail. Active Directory pour gestion des droits. Masterisation VMware pour déploiement standardisé des postes. Datacenters redondants.
**name**: Équipe informatique
**value**: Deux secteurs : (1) infogérance/maintenance matériel (collaboration Cloud Temple) ; (2) développement logiciel sur mesure (applications, intégrations API/FTP, automatisations nocturnes). PMS = JUMP (Front to Back).
**name**: Mission principale
**value**: Mise à jour d'un outil ESG central. Développements Python/Django. Montée en compétence Vue.js/Nuxt pour un projet ESG stratégique. VBA pour automatisation/débogage. Infogérance ponctuelle (tickets, maintenance).
**name**: Organisation du travail
**value**: Pas de cahier des charges formel. Missions confiées à l'oral. Planning flexible, autonomie forte. Priorités adaptées en continu. Passage temporaire entre projets en cas de blocage.
**name**: Stack technique utilisée
**value**: Python, Django, VBA (acquis) ; Vue.js, Nuxt (en cours d'acquisition). API REST et FTP pour intégrations de données externes. Bibliothèque interne d'interrogation de l'API JUMP.
**name**: Positionnement du stagiaire
**value**: Interface infogérance / développement. Rôle hybride. Gestion multi-projets simultanés. Autonomie et réactivité requises.
**name**: Axes de progression identifiés
**value**: Approfondissement Vue.js/Nuxt ; formalisation du suivi de projet et de la documentation technique ; gestion des priorités ; communication et valorisation des compétences.
**name**: Tuteurs
**value**: Entreprise : Jean-François Feuvrier et Gaëtan Hardy. Pédagogique : Hatem Hajri.

## Constraints

- Critères ESG obligatoires sur tous les nouveaux fonds depuis fin 2023.
- BDF-Gestion ne peut créer d'OPCVM (interdit par l'AMF pour les banques centrales depuis fin 20e siècle).
- PSEE (Prestataires de Services Essentiels) : Cloud Temple, éditeur JUMP, filiales BNP Paribas.
- Accès distants sécurisés uniquement via VPN FortiClient + clé RSA.

## Examples

- Automatisation nocturne de l'actualisation des bases de données via FTP/API REST (JUMP).
- Création d'une bibliothèque Python facilitant l'interrogation de l'API JUMP.
- Mise à jour de l'outil ESG en Vue.js/Nuxt pour le Front-Office.
