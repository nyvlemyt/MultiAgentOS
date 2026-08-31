---
id: resource-s7-devops-tp-part-03-ansible-devops-pdf-a975b472
slug: resource-s7-devops-tp-part-03-ansible-devops-pdf-a975b472
source_key: 'sha256:a975b47222f255c727e55c773bcf6147db3a00525ccc2aaa4899720de6311c9a'
part_of: resource-s7-devops-17c280d9
order: 9
manifest: null
derived_from: 'sha256:a975b47222f255c727e55c773bcf6147db3a00525ccc2aaa4899720de6311c9a'
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
  - docker
  - ci-cd
  - infrastructure
  - playbooks
  - roles
  - continuous-deployment
domain: DevOps & Infrastructure
---
# S7 - DevOps — TP part 03 - Ansible - Devops.pdf

## Goal

Install Ansible, configure an inventory, write playbooks, deploy a Dockerized application (db + api + proxy + frontend) to a remote server, and wire continuous deployment via GitHub Actions.

## Prerequisites

- A remote server accessible via SSH with an admin user and private key
- Ansible installed on the local machine
- Docker Hub account with application images already pushed
- GitHub repository with Actions enabled
- Basic familiarity with YAML and Linux package management

## Steps

**step**: 1
**title**: Create a project-specific inventory
**detail**: Create `my-project/ansible/inventories/setup.yml` declaring the `prod` group with `ansible_user: admin` and `ansible_ssh_private_key_file`. Test reachability with `ansible all -i inventories/setup.yml -m ping`.
**step**: 2
**title**: Gather facts and run ad-hoc commands
**detail**: Use the `setup` module to query OS facts (`filter=ansible_distribution*`). Use the `apt` module with `state=absent` to remove unwanted packages (e.g. Apache2). Demonstrates idempotency: running the same command twice produces no extra change.
**step**: 3
**title**: Write a minimal playbook
**detail**: Create `ansible/playbook.yml` targeting `all` hosts with `become: true`. Add a single `ping` task to validate execution. Run with `ansible-playbook -i inventories/setup.yml playbook.yml`. Validate syntax first with `--syntax-check`.
**step**: 4
**title**: Write an advanced playbook to install Docker
**detail**: Expand the playbook with tasks: install prerequisite apt packages, add Docker GPG key (`apt_key`), add Docker APT repository (`apt_repository` using `ansible_facts['distribution_release']`), install `docker-ce`, create a Python venv at `/opt/docker_venv`, install the Docker SDK (`pip install docker`), ensure the Docker service is started (`service` module, `state: started`).
**step**: 5
**title**: Refactor into Ansible roles
**detail**: Run `ansible-galaxy init roles/docker` to scaffold the role. Move Docker installation tasks to `roles/docker/tasks/main.yml`. Keep only the `tasks/` and `handlers/` directories. Call the role from the playbook with `roles: [docker]`.
**step**: 6
**title**: Create application deployment roles
**detail**: Create one role per application component: `install_docker`, `create_network` (use `docker_network` module with correct `ansible_python_interpreter`), `launch_database` (use `docker_container` with env vars for DB credentials), `launch_app` (use `docker_container` with env vars for `application.yml`), `launch_proxy` (httpd/reverse-proxy container). Each role uses `docker_container` module pointing to the correct DockerHub image.
**step**: 7
**title**: Integrate continuous deployment in GitHub Actions
**detail**: Add an Ansible deployment job to the existing GitHub Actions workflow, triggered after a new image is pushed to DockerHub. The job runs `ansible-playbook` against the remote inventory. Consider restricting auto-deploy to tagged/semver images only (not every push to `latest`) to reduce risk of deploying broken images automatically.
**step**: 8
**title**: Add and configure the frontend
**detail**: Configure the httpd proxy role to route `/api` requests to the backend container and serve the frontend static assets. Update GitHub Actions to also build and push the frontend image, then redeploy via Ansible.
**step**: 9
**title**: (Going further) Ansible Vault + Docker-based runner
**detail**: Encrypt the SSH private key and other secrets with `ansible-vault`. Run the Ansible playbook inside a Docker image that packages Ansible, passing the vault password at runtime. Enables fully containerized, secret-safe CD pipelines.

## Result

A fully automated deployment pipeline: Ansible provisions Docker on the remote server, deploys the database, API, and reverse-proxy containers with correct env vars and networking, and GitHub Actions triggers a fresh Ansible run on every DockerHub image push.

## Next

- Restrict continuous deployment to tagged semantic-version images to prevent accidental broken-image rollouts
- Use Ansible Vault to encrypt secrets (SSH keys, DB passwords) instead of storing them in plaintext
- Run Ansible from a dedicated Docker image in CI to avoid installing Ansible on GitHub-hosted runners
- Add health-check tasks after deployment to verify containers are responding before reporting success
