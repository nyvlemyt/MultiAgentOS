---
id: resource-ing1-lsi-bdml-6e-semestre-1819c330
slug: resource-ing1-lsi-bdml-6e-semestre-1819c330
source_key: 'sha256:1819c330c9983d855259c177f7a77eedf87316bfd95c85075da883ebcf97142c'
part_of: null
order: null
manifest: null
derived_from: 'sha256:1819c330c9983d855259c177f7a77eedf87316bfd95c85075da883ebcf97142c'
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
lane: knowledge
schema_version: '1'
tags:
  - apprenticeship
  - asset-management
  - python
  - data-engineering
  - BDF-Gestion
  - finance
  - automation
  - modular-architecture
  - Melvyn-Pommier
domain: professional-development
---
# ING1 - LSI / BDML - 6e semestre

## Thesis

Melvyn Pommier's 2024-2025 apprenticeship at BDF-Gestion (asset management subsidiary of Banque de France, ~40B€ AUM) produced production-grade Python automation tools for financial data pipelines, marking a clear progression from IT support and ad-hoc scripts toward autonomous modular software design — confirming a career orientation toward data engineering applied to finance.

## Context

BDF-Gestion was created in 1996 to manage Banque de France's proprietary funds (26 FCP + 5 FCPE). The IT team splits into infogérance (systems management, hardware, VMs via Cloud Temple/VMware) and software development (custom apps, API integrations). All workstations are virtualized; remote access uses FortiClient VPN + RSA key. Core financial software is PMS JUMP (poorly documented REST API). Melvyn joined in 2023, continued in ING1 at EFREI Paris (LSI track, targeting BDML specialization).

## Reasoning

Three pillars of work this year: (1) **Infogérance** — VM provisioning, Windows 10→11 migration support, incident resolution (e.g., president's network outage traced to BDF-side update). (2) **Dev standardization** — built `mkvenv` CLI macro (cross-platform) generating a full Python project skeleton: venv, pip-tools, pyproject.toml, logger/connection/mail modules, Git init, VS Code launch. Companion commands `pipadd` and `pyclean` reinforce the standard. (3) **Two major projects**: *Credit Rating Degradation Monitor* — daily Python script querying Jump API for J vs J-1 notations, handling non-trading days, classifying changes (upgrade/downgrade/anomaly), sending color-coded HTML email to 5 teams (Risks, Front, Middle Office, Compliance, IT) with error-alert fallback. *Glimpse Refactoring* — replaced a monolithic script with two independent modules: morning SFTP pull of Glimpse aggregated CSV (Paramiko, Pandas, STV DB insert, purge), and nightly preparation/push of internal trade data (modular architecture: `api/`, `data/`, `utils/`, `notifications/`). Key challenges included Jump API's missing venue data (solved by parsing FIX message files before nightly overwrite) and trade status finality (solved via J+1 logic since Middle Office validates next morning).

## Trade-offs

Monolithic scripts (fast to write, hard to maintain) vs. modular architecture (more upfront structure, but each stage is independently testable and error-isolated — a failure in one module does not block the full pipeline). Jump API is complex and under-documented: some data (venue/MIC code) is simply unavailable via the API, requiring FIX-file parsing as a workaround. Email formatting required multi-client testing (Apple Mail + Outlook) to avoid layout breakage. J+1 trade-status logic trades real-time accuracy for data correctness. Future CSDR project plans a backend-API + Nuxt 3 frontend split (widget-based customizable dashboard), reusing the same modular back-end pattern as Glimpse.

## See also

- PMS JUMP API
- Glimpse platform (financial transaction aggregator)
- CSDR regulation (Central Securities Depository Regulation)
- FIX protocol (financial messaging standard)
- Cloud Temple (infogérance partner)
- mkvenv internal macro
- Nuxt 3 migration (project Demain)
- EFREI Paris LSI/BDML curriculum
