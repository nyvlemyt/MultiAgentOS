---
id: resource-s7-devops-td-part-02-github-actions-devops-pdf-b00f542d
slug: resource-s7-devops-td-part-02-github-actions-devops-pdf-b00f542d
source_key: 'sha256:b00f542d602ca84d037d39b397f3aceccbd665eb2db92287ab6221052397b144'
part_of: S7 - DevOps
order: 5
manifest: null
derived_from: 'sha256:b00f542d602ca84d037d39b397f3aceccbd665eb2db92287ab6221052397b144'
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
  - git
  - github
  - ssh
  - devops
  - branch-protection
  - version-control
  - ci-cd
domain: DevOps
---
# S7 - DevOps — TD part 02 - Github Actions - Devops.pdf

## Goal

Set up a GitHub account with SSH key authentication, fork and clone a repository, publish a first commit, and configure branch protection rules on the master branch.

## Prerequisites

- Git CLI installed locally
- A school email address for GitHub sign-up
- Terminal access with ssh-keygen available
- An IDE (IntelliJ recommended)

## Steps

- Sign up to GitHub using your school email address; choose the free individual plan.
- Fork the course project repository into your own GitHub workspace.
- Clone the fork locally via HTTPS to verify Git is working: `git clone <https_url>`.
- Generate a 4096-bit RSA SSH key pair: `ssh-keygen -t rsa -b 4096 -f ~/.ssh/<keyName>` (leave passphrase empty for this course).
- Display the public key with `cat ~/.ssh/<keyName>.pub`, copy its full content.
- Add the public key to GitHub under Settings → SSH and GPG keys → New SSH key.
- Re-clone the repository using the SSH URL (`git@github.com:…`) to confirm passwordless access.
- Open `README.md` in your IDE, add a line (e.g. 'This project is now mine'), and save.
- Stage the change: `git add .`
- Commit: `git commit -m "edit readme"`
- Push to master: `git push origin master`
- In GitHub Settings → Branches, add a Branch protection rule with pattern `master` to prevent destructive operations (e.g. force-push).
- Optionally set the repository to Private and store sensitive values in GitHub Secrets (never commit passwords or API keys).

## Result

A GitHub account linked to an SSH key, a forked project with a published commit visible online, and a protected master branch that blocks accidental destructive pushes.

## Next

Configure a GitHub Actions CI pipeline (TD part 03+) to automate build and test on every push to the repository.
