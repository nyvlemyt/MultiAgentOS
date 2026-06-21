# Our Assets Index — dedup lookup for ECC Harvest

Generated for Task B3 (frontmatter-only scan; bodies NOT read). Later subagents check this table
before adopting any ECC item so we never re-derive what we already own.

Source dirs scanned (worktree root):
- `.claude/skills/` — 24 skills
- `.claude/agents/` — 56 agent fiches (+ 3 non-agent docs: EXECUTIVE-BRIEF, QUICKSTART, nexus-strategy)
- `.claude/commands/` — 1 command
- `packages/agents/fiches/` — 7 Tier B fiches

---

## `.claude/skills/` (24)

| name | one-line summary |
|------|------------------|
| algorithmic-art | p5.js generative/algorithmic art with seeded randomness |
| brand-guidelines | Apply Anthropic brand colors/typography to artifacts |
| canvas-design | Create visual art in .png/.pdf using design philosophy |
| claude-api | Build/debug/optimize Claude API / Anthropic SDK apps (with prompt caching) |
| doc-coauthoring | Structured workflow for co-authoring documentation/specs |
| docx | Create/read/edit/manipulate Word .docx documents |
| frontend-design | Distinctive production-grade frontend UI generation |
| intake-audit | Decide whether ANY candidate addition enters MultiAgentOS (intake dossier) |
| internal-comms | Write internal comms in company formats (status/leadership/FAQ/incident) |
| mas-context-manager | Build/refresh per-project context pack (≤4k tokens) |
| mas-memory-keeper | Review and promote agent-proposed memory candidates (sole memory writer) |
| mas-mission-planner | Decompose NL mission into typed task DAG (PlannerOutput JSON) |
| mas-reviewer | Verify mission outputs vs brief; PASS/NEEDS_WORK/BLOCK |
| mas-sec-reviewer | Mandatory gate before risk:high/blocking tasks; PASS/BLOCK |
| mas-skill-router | Select skills + Tier B agents per task; 3-tier model routing (L1 summaries only) |
| mcp-builder | Build high-quality MCP servers (FastMCP / Node TS SDK) |
| pdf | Read/extract/merge/split/form-fill/OCR PDFs |
| pptx | Create/read/edit .pptx slide decks |
| skill-creator | Create/modify/optimize/eval skills |
| slack-gif-creator | Create animated GIFs optimized for Slack |
| theme-factory | Style artifacts with preset/on-the-fly themes (colors/fonts) |
| web-artifacts-builder | Elaborate multi-component claude.ai HTML artifacts (React/Tailwind/shadcn) |
| webapp-testing | Interact/test local web apps via Playwright |
| xlsx | Create/read/edit spreadsheets (.xlsx/.xlsm/.csv/.tsv) |

## `.claude/agents/` (56)

| name | one-line summary |
|------|------------------|
| Brand Guardian | Brand identity development, consistency, strategic positioning |
| Image Prompt Engineer | Photography prompt engineering for AI image generation |
| Inclusive Visuals Specialist | Culturally accurate, non-stereotypical image/video generation |
| UI Designer | Visual design systems, component libraries, pixel-perfect UI |
| UX Architect | Technical architecture + UX, CSS systems, implementation guidance |
| UX Researcher | User behavior analysis, usability testing, research insights |
| Visual Storyteller | Visual narratives, multimedia, brand storytelling |
| Whimsy Injector | Personality/delight/playful elements in brand experiences |
| AI Data Remediation Engineer | Self-healing data pipelines via local SLMs + semantic clustering |
| AI Engineer | ML model development, deployment, production AI features |
| Autonomous Optimization Architect | Shadow-tests APIs for perf with cost/security guardrails |
| Backend Architect | Scalable system design, DB architecture, API, cloud infra |
| CMS Developer | Drupal/WordPress themes, plugins, content architecture |
| Code Reviewer | Constructive review: correctness, maintainability, security, perf |
| Codebase Onboarding Engineer | Fast codebase understanding by reading/tracing source |
| Data Engineer | Pipelines, lakehouse, ETL/ELT, Spark, dbt, streaming |
| Database Optimizer | Schema design, query optimization, indexing, tuning |
| DevOps Automator | Infra automation, CI/CD, cloud operations |
| Email Intelligence Engineer | Extract structured data from raw email threads |
| Embedded Firmware Engineer | Bare-metal/RTOS firmware (ESP32, STM32, nRF, FreeRTOS, Zephyr) |
| Feishu Integration Developer | Feishu/Lark Open Platform integration |
| Filament Optimization Specialist | Restructure/optimize Filament PHP admin interfaces |
| Frontend Developer | Modern web (React/Vue/Angular), UI impl, perf |
| Git Workflow Master | Git workflows, branching, conventional commits, rebasing, worktrees |
| Incident Response Commander | Production incident management, post-mortems, SLO/SLI |
| Minimal Change Engineer | Minimum-viable diffs, refuses scope creep |
| Mobile App Builder | Native iOS/Android + cross-platform mobile dev |
| Rapid Prototyper | Ultra-fast PoC/MVP creation |
| Security Engineer | Threat modeling, vuln assessment, secure code review, incident response |
| Senior Developer | Premium impl (Laravel/Livewire/FluxUI, advanced CSS, Three.js) |
| Software Architect | System design, DDD, architectural patterns, technical decisions |
| Solidity Smart Contract Engineer | EVM contracts, gas optimization, DeFi, security-first |
| SRE (Site Reliability Engineer) | SLOs, error budgets, observability, chaos engineering |
| Technical Writer | Developer docs, API references, READMEs, tutorials |
| Threat Detection Engineer | SIEM rules, MITRE ATT&CK mapping, threat hunting, detection-as-code |
| Voice AI Integration Engineer | Speech transcription pipelines (Whisper/ASR), diarization |
| WeChat Mini Program Developer | WeChat 小程序 dev (WXML/WXSS/WXS, payments, subscriptions) |
| Behavioral Nudge Engine | Adapt software interaction cadence/style to user motivation |
| Feedback Synthesizer | Collect/analyze/synthesize multi-channel user feedback |
| Product Manager | Full product lifecycle: discovery→strategy→roadmap→GTM→measurement |
| Sprint Prioritizer | Agile sprint planning, feature prioritization, resource allocation |
| Trend Researcher | Market intelligence, emerging trends, competitive analysis |
| Experiment Tracker | Experiment design, A/B tests, hypothesis validation |
| Jira Workflow Steward | Jira-linked Git workflows, traceable commits, release-safe branches |
| Project Shepherd | Cross-functional project coordination, timelines, stakeholders |
| Studio Operations | Day-to-day studio efficiency, process optimization |
| Studio Producer | High-level creative/technical orchestration, portfolio management |
| Senior Project Manager | Specs→tasks, realistic scope, exact spec requirements |
| Accessibility Auditor | Audit interfaces vs WCAG, test with assistive tech |
| API Tester | API validation, performance testing, QA across integrations |
| Evidence Collector | Screenshot-obsessed QA, visual proof, default 3-5 issues |
| Performance Benchmarker | Measure/analyze/improve system performance |
| Reality Checker | Evidence-based certification, default "NEEDS WORK" |
| Test Results Analyzer | Test result evaluation, quality metrics, actionable insights |
| Tool Evaluator | Evaluate/test/recommend tools, software, platforms |
| Workflow Optimizer | Analyze/optimize/automate workflows across business functions |

Non-agent docs in dir (skipped): `EXECUTIVE-BRIEF.md`, `QUICKSTART.md`, `nexus-strategy.md`.

## `.claude/commands/` (1)

| name | one-line summary |
|------|------------------|
| security-review | Complete a security review of the pending changes on the current branch |

## `packages/agents/fiches/` — Tier B fiches (7)

| name | one-line role |
|------|---------------|
| context-manager | Build and refresh per-project context packs from the external project path |
| memory-keeper | The only agent allowed to write to the long-term memory store |
| mission-planner | Turn a NL mission into a clarified objective + a typed task DAG |
| quality-controller | Post-execution PROCESS/RULES gate; runs BEFORE the Reviewer; a BLOCK stops the mission |
| reviewer | Review diffs and artifacts before the mission transitions review → validated |
| sec-reviewer | Risk gate; mandatory before any task with risk ≥ high reaches execution |
| skill-router | Pick the right skills and Tier B agents per task, with a token-budget estimate |
