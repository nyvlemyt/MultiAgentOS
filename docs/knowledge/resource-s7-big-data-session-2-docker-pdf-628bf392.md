---
id: resource-s7-big-data-session-2-docker-pdf-628bf392
slug: resource-s7-big-data-session-2-docker-pdf-628bf392
source_key: 'sha256:628bf392b737df38492e38d7eaa73bb66385befd6949ca00f44156d7b5b7c9ff'
part_of: S7 - big data
order: 11
manifest: null
derived_from: 'sha256:628bf392b737df38492e38d7eaa73bb66385befd6949ca00f44156d7b5b7c9ff'
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
doc_type: explanation
actionability: resource
lane: resources
schema_version: '1'
tags:
  - docker
  - containers
  - virtualization
  - devops
  - deployment
  - portability
  - big-data
domain: infrastructure
---
# S7 - big data — Session 2 Docker.pdf

## Thesis

Docker résout trois problèmes fondamentaux du développement logiciel — organisation des dépendances, portabilité entre OS, protection de la machine hôte — en empaquetant une application et tout ce dont elle a besoin dans un conteneur léger et isolé.

## Context

Avant Docker (lancé en mars 2013), déployer un logiciel impliquait de gérer manuellement les dépendances, les versions d'OS et les conflits d'environnement ('ça marche sur ma machine'). La solution précédente — les machines virtuelles — résolvait l'isolation mais introduisait une surcharge lourde (OS complet, démarrage en minutes, consommation ressources élevée).

## Reasoning

Un conteneur Docker est un environnement d'exécution isolé qui partage le noyau de l'OS hôte au lieu d'en émuler un entier. Il contient uniquement les fichiers, bibliothèques et processus nécessaires à l'application. Résultat : démarrage quasi-instantané, empreinte mémoire réduite, reproductibilité garantie sur n'importe quel système. Pour la CI/CD, les conteneurs testés sont identiques à ceux envoyés en production — ce qui augmente la confiance dans les déploiements.

## Trade-offs

Conteneurs vs machines virtuelles : les conteneurs sont plus légers (pas d'OS dupliqué, démarrage rapide, open source) mais partagent le noyau hôte — moins d'isolation matérielle qu'une VM. Les VMs offrent une isolation plus forte et peuvent simuler du matériel spécifique, mais au prix d'une lourdeur (minutes de boot, overhead CPU/RAM) incompatible avec le déploiement réactif ou just-in-time.

## See also

- https://docs.docker.com/
- https://dockerbook.com/
- https://www.docker.com/blog/
