---
id: resource-playbooks-b6a0521e
slug: resource-playbooks-b6a0521e
source_key: 'sha256:b6a0521e24a2dfe38081796441223c9dfb1ebec915cc2b6d7e71a1943bcdd5d9'
part_of: null
order: null
manifest: null
derived_from: 'sha256:b6a0521e24a2dfe38081796441223c9dfb1ebec915cc2b6d7e71a1943bcdd5d9'
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
  - ansible
  - infrastructure-as-code
  - devops
  - automation
  - provisioning
  - playbook
  - inventory
  - yaml
  - ssh
  - agentless
domain: DevOps
---
# playbooks

## Summary

Ansible est un moteur d'automatisation open source sans agent (basé sur SSH + Python) couvrant trois cas d'usage : provisionnement d'infrastructure, gestion de configuration, et déploiement d'applications. Il repose sur deux artefacts centraux — l'Inventory (liste des machines cibles) et le Playbook (liste de tâches déclaratives) — organisés en Modules et Roles pour la réutilisabilité.

## Fields/API

**name**: Inventory
**type**: YAML file
**description**: Déclare les hôtes et groupes cibles. Supporte variables d'hôte/groupe, alias, clés SSH, utilisateur de connexion. Format : `all.children.<group>.hosts.<hostname>`.
**name**: Playbook
**type**: YAML file
**description**: Séquence de Plays. Chaque Play cible un groupe (`hosts`), déclare un `remote_user`, et liste des `tasks`. Chaque task appelle un Module nommé.
**name**: Module
**type**: built-in ou custom
**description**: Unité d'action atomique. Exemples intégrés : `ping`, `setup`, `yum`, `service`, `docker_container`, `template`. Extensibles via Ansible Galaxy (~3 681 modules en v2.9) ou Python custom.
**name**: Role
**type**: répertoire structuré
**description**: Regroupe tasks, handlers, files, templates, vars, defaults, meta pour un composant (ex. `apache`, `docker`). Référencé dans le Playbook via `roles: [<nom>]`.
**name**: Control Node
**type**: machine
**description**: La machine qui exécute Ansible. Nécessite Python + SSH. Pas d'agent requis sur les nœuds cibles.
**name**: Managed Node
**type**: machine cible
**description**: Serveur ou VM piloté via SSH. Aucun daemon Ansible à installer.

## Constraints

- Ansible est agentless : SSH + Python suffisent — aucun daemon à déployer sur les nœuds.
- Le style est déclaratif (état cible) et non impératif (suite de commandes).
- Playbooks recommandés < 100 lignes ; au-delà, découper en Roles.
- Utiliser Git pour versionner Inventory et Playbooks.
- Documenter chaque Role via un fichier README.
- Activer le linting (ansible-lint) avant tout déploiement.
- Structure de fichiers canonique : `site.yml`, `webservers.yml`, `roles/<role>/{tasks,handlers,library,files,templates,vars,defaults,meta}/`.

## Examples

**label**: Inventory minimal (YAML)
**code**: all:
  vars:
    ansible_user: myuser
    ansible_ssh_private_key_file: /path/to/key
  children:
    prod:
      hosts:
        my.dns.takima.io:
**label**: Playbook avec modules yum + template
**code**: - hosts: groupB
  remote_user: user
  tasks:
    - name: Ensure apache is at the latest version
      yum:
        name: httpd
        state: latest
    - name: Write the apache config file
      template:
        src: /srv/httpd.j2
        dest: /etc/httpd.conf
**label**: Playbook multi-roles avec become
**code**: - hosts: all
  become: yes
  roles:
    - docker
    - database
    - apache
**label**: Task dans un Role (roles/apache/tasks/main.yml)
**code**: - name: Ensure apache is at the latest version
  yum:
    name: httpd
    state: latest
