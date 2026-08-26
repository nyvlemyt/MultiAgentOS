---
id: resource-s7-devops-td-part-03-ansible-devops-pdf-e2d17e3d
slug: resource-s7-devops-td-part-03-ansible-devops-pdf-e2d17e3d
source_key: 'sha256:e2d17e3d4af6ae993b599a35001eded64b1240dee0b7c80d43caa275e6583222'
part_of: S7 - DevOps
order: 6
manifest: null
derived_from: 'sha256:e2d17e3d4af6ae993b599a35001eded64b1240dee0b7c80d43caa275e6583222'
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
  - ansible
  - devops
  - ssh
  - provisioning
  - apache
  - linux
  - infrastructure
domain: DevOps
---
# S7 - DevOps — TD part 03 - Ansible - Devops.pdf

## Goal

Discover Ansible by running ad-hoc commands against a remote server: verify the installation, establish SSH connectivity, ping the host via Ansible, and provision an Apache web server.

## Prerequisites

- Ansible installed (Linux/macOS only — Windows requires WSL or a VM)
- A remote Debian server with a known domain name (e.g. firstname-lastname-formation.takima.io)
- A private SSH key for that server

## Steps

- 1. Verify Ansible: run `ansible --version` to confirm install, config file location, and Python version.
- 2. Fix SSH key permissions: `chmod 400 <path_to_your_key>` — required before any SSH or Ansible use.
- 3. Test raw SSH access: `ssh -i <path_to_your_key> admin@<server_domain>` then `exit`.
- 4. Register the server in Ansible's inventory: `sudo nano /etc/ansible/hosts` → add the server domain name, save.
- 5. Ping the server with Ansible: `ansible all -m ping --private-key=<path_to_your_key> -u admin` — a 'pong' response confirms connectivity, user existence, and auth.
- 6. Install Apache (with privilege escalation): `ansible all -m apt -a "name=apache2 state=present" --private-key=<path_to_your_key> -u admin --become` — `--become` runs as superuser (admin must be in the wheel group).
- 7. Create an HTML page: `ansible all -m shell -a 'echo "<html><h1>Hello World</h1></html>" > /var/www/html/index.html' --private-key=<path_to_your_key> -u admin --become`
- 8. Start the Apache service: `ansible all -m service -a "name=apache2 state=started" --private-key=<path_to_your_key> -u admin --become`
- 9. Open a browser and navigate to `http://<server_domain>` — the Hello World page confirms success.

## Result

A remote Debian server provisioned with Apache serving a custom HTML page, configured entirely through Ansible ad-hoc commands without manual SSH intervention.

## Next

Move to the Ansible practical part: write playbooks, use roles, and automate multi-step deployments declaratively instead of with individual ad-hoc commands.
