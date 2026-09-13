---
id: resource-ing1-lsi-bdml-6e-semestre-54294f7b
slug: resource-ing1-lsi-bdml-6e-semestre-54294f7b
source_key: 'sha256:54294f7bfc6464b67b339137e8508dbdff5a842d8e05b600dd53ae0888e87552'
part_of: null
order: null
manifest: null
derived_from: 'sha256:54294f7bfc6464b67b339137e8508dbdff5a842d8e05b600dd53ae0888e87552'
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
  - alternance
  - asset-management
  - python
  - data-engineering
  - bdf-gestion
  - finance
  - automatisation
  - efrei
  - apprenticeship
domain: data engineering / finance
---
# ING1 - LSI / BDML - 6e semestre

## Summary

Rapport d'activités de 6e semestre (ING1 LSI/BDML, EFREI Paris) de Melvyn Pommier en alternance chez BDF-Gestion (filiale de gestion d'actifs de la Banque de France). Couvre le contexte entreprise, les missions d'infogérance, les projets de développement Python (automatisation de flux financiers, architecture modulaire), et le bilan de compétences.

## Fields/API

**entreprise**: **nom**: BDF-Gestion
**creation**: 1996
**actifs_sous_gestion**: >40 milliards €
**fonds**: 31 (26 FCP + 5 FCPE)
**localisation**: Paris 2e arrondissement
**effectif**: ~40 personnes
**pôles_métier**: - Front-Office (gérants taux + actions)
- Risques
- Contrôle interne
- Secrétariat
- Middle-Office
**pôles_IT**: - Infogérance (partenaire Cloud Temple)
- Développement logiciel
**infrastructure**: Virtualisation complète VmWare, clients légers, VPN FortiClient + RSA, Active Directory, datacenters redondants
**missions_infogérance**: - Création/configuration de VMs pour nouveaux arrivants
- Maintenance matériel
- Préparation équipements télétravail (certificats RSA, VPN)
- Suivi tickets Cloud Temple
- Migration Windows 10 → 11 (tests compatibilité, résolution incidents post-migration)
**outils_développés**: **mkvenv**: Macro CLI (Windows/Linux/macOS) générant un environnement Python complet : venv, requirements.in/txt, architecture projet (README, main.py, .env, .vscode, src/, tests/), pyproject.toml (black/isort/mypy), git init + premier commit, ouverture VS Code
**pipadd**: Ajout rapide de bibliothèques (met à jour requirements.in, installe, régénère requirements.txt)
**pyclean**: Vérification et nettoyage des fichiers Python
**modules_réutilisables**: **logger.py**: Logs colorisés (loguru) + fichiers journaux
**connection.py**: Connexion universelle API avec retry et gestion d'erreurs
**request.py**: Fonctions spécifiques API Jump
**mail_service.py**: Connexion messagerie, lecture/filtrage/envoi emails automatiques
**config.py**: Chargement centralisé des variables .env via python-dotenv
**projets_développement**: **controle_notation**: **objectif**: Surveillance quotidienne automatisée des dégradations/améliorations de notation de crédit (Bloomberg → API Jump)
**tech**: Python, Pandas, API Jump, email SMTP
**fonctionnement**: Récupération notations J et J-1 via API Jump, comparaison DataFrame, classification (amélioration/dégradation/atypique), rapport HTML colorisé, envoi mail à 5 pôles (Informatique, Risques, Taux, Contrôle Interne, Middle Office), alerte + log en cas d'erreur
**gestion_jours_fériés**: Recul automatique au dernier jour de marché effectif
**glimpse_refonte**: **contexte**: Flux bidirectionnel quotidien avec Glimpse (agrégateur de données de transactions) — remplace un script monolithique
**flux_entrant**: Script Python (Paramiko SFTP) récupère CSV Glimpse chaque matin, nettoyage Pandas, insertion base STV, purge historique, mail confirmation/alerte
**flux_sortant**: **architecture**: 4 modules : api/ (connexion Jump), data/ (logique métier), utils/ (logs, dates, config), notifications/ (mails + SFTP)
**sélection_portefeuilles**: Fichier Excel généré automatiquement + macro VBA → parametre.json
**enrichissement_ordres**: API Jump /order + /asset + /broker, jointures DataFrame, recalcul prix
**logique_J+1**: Contournement limite Jump : statuts définitifs disponibles uniquement le lendemain
**venue_information**: Parsing fichiers FIX (format messagerie financière) pour récupérer plateforme d'exécution (Tradeweb, Bondvision…), valeur par défaut OTC/XOFF
**envoi**: Fichier .xlsx déposé sur SFTP Glimpse + mail confirmation
**projets_à_venir**: **demain_nuxt3**: Migration Nuxt 2 → Nuxt 3 (routing, composants, store, Vite) d'une interface interne
**csdr**: Refonte du projet CSDR (frais de règlement-livraison non dénouée) : back-end Python (API Jump + fichiers BNP) exposant une API interne + front-end Nuxt 3 avec tableau de bord personnalisable (widgets), annotations, export PDF
**compétences_acquises**: - Python avancé (Pandas, Django)
- Nuxt/Vue.js
- Architecture modulaire
- APIs REST (Jump, SFTP/Paramiko)
- Protocole FIX
- Gestion d'erreurs et supervision automatisée
- Finance de marché (notations, CSDR, ESG, PMS)
**formation**: **école**: EFREI Paris
**cycle**: ING1, filière LSI (Logiciels et Systèmes d'Information)
**spécialisation_cible**: BDML (Bases de Données et Machine Learning)
**formation_antérieure**: BUT Informatique, IUT Villetaneuse (Sorbonne Paris Nord)

## Constraints

- Environnement financier réglementé (AMF, CSDR, ESG) avec fortes contraintes de confidentialité
- API Jump peu documentée, structure éclatée
- Compatibilité email multi-plateforme (Mail Apple + Outlook)
- Fichiers FIX récupérés avant écrasement nocturne — fenêtre temporelle contrainte
- Statuts de trades définitifs disponibles en J+1 uniquement via PMS Jump

## Examples

- Rapport de notation J vs J-1 : DataFrame croisé, classification automatique, email HTML colorisé envoyé chaque matin à 5 pôles
- Flux Glimpse : fichier Excel → VBA → parametre.json → script Python → xlsx déposé sur SFTP Glimpse chaque soir
- mkvenv : une commande terminal génère un projet Python complet prêt à coder en quelques secondes
