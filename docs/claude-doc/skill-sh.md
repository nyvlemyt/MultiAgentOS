**Your AI agent is only as smart as the skills you give it.** **[skills.sh](http://skills.sh/) (by Vercel) is the open directory where you find pre-built skills for Claude Code, Cursor, Codex and 50+ other agents — and install any of them with a single command.** But here's the part most people skip: skills are executable instruction sets with access to your files, shell, and API keys. This guide shows you how to find,** ** *audit* , and install your first skill safely — then scales up to advanced workflows and use cases.

---

## What You'll Learn

* What Agent Skills and** **[skills.sh](http://skills.sh/) actually are (in plain English)
* How to install your first skill in one command
* How to** ****audit a skill for safety before you run it** (the step nobody talks about)
* The full beginner workflow: Find → Audit → Install → Use
* Advanced moves: multi-agent installs, updating skills, building your own
* Real use cases to spark ideas

---

## Prerequisites

* [ ]** ** **Node.js** installed (so you can run** **`npx`) — grab it at** **[nodejs.org](http://nodejs.org/)
* [ ] An AI coding agent installed:** ** **Claude Code** , Cursor, Codex, GitHub Copilot, Cline, etc.
* [ ] A terminal you're comfortable opening (Mac Terminal, iTerm, or VS Code's built-in terminal)
* [ ] 15–20 minutes for your first end-to-end install

No deep coding knowledge required. If you can copy-paste a command, you can do this.

---

## What Are Agent Skills?

An** ****Agent Skill** is a reusable capability you bolt onto your AI agent. It's a package — usually just a** **`SKILL.md` file with some instructions (and sometimes scripts) — that teaches your agent how to do a specific job well.

Think of it like procedural knowledge. Out of the box, your agent is a smart generalist. A skill turns it into a specialist on demand:

* A** **`frontend-design` skill teaches it your design conventions
* A** **`release-notes` skill teaches it to generate changelogs from git history
* A** **`security-audit` skill teaches it to scan code for vulnerabilities

Skills are an open standard now adopted across Anthropic, OpenAI, GitHub, Cursor and more — so one skill often works across multiple agents.

---

## What Is** **[skills.sh](http://skills.sh/)?

[skills.sh](http://skills.sh/) is** ****Vercel's open directory for agent skills** — basically a package manager + marketplace for AI agent capabilities. You browse skills on the site, then install them with the** **`skills` CLI.

The core commands you'll use:

```bash
npx skills find [query]      # Search for skills by keyword
npx skills add <owner/repo>  # Install a skill from GitHub
npx skills check             # Check for skill updates
npx skills update            # Update all installed skills
```

<aside> 💡

**The #1 skill on the whole site is** **`find-skills`.** Instead of guessing which skill to install, you tell your agent what you're trying to do and it finds the best-fit skill for that exact job. It's the easiest on-ramp to the whole ecosystem.

</aside>

---

## ⚠️ Read This First: Why Auditing Matters

This is the most important section in the guide, so don't skip it.

Skills are** ****not** harmless text files. They're executable instruction sets that can access your filesystem, run shell commands, and touch your API keys. The community marketplace has** ****no automated vetting** — anyone can publish a skill. A malicious one can hide:

* **Prompt injection** — hidden instructions that hijack your agent
* **Command injection** — sneaky** **`eval()`,** **`exec()`, or shell calls
* **Data exfiltration** — quietly sending your env variables or credentials out
* **Hidden payloads** — zero-width characters or HTML comments you can't see

<aside> 🛡️

**The rule: Never install a skill you haven't audited.** Treat every skill like code from a stranger — because it is. The good news: auditing takes under a minute with the right script.

</aside>

---

## The Beginner Workflow: Find → Audit → Install → Use

Four steps. Do them in order every single time.

---

### Step 1: Find a Skill

There are two ways to discover skills:

**Option A — Browse the site:** Go to** **[skills.sh](http://skills.sh/), search for what you need (e.g. "testing", "design", "security"), and copy the** **`owner/repo` identifier.

**Option B — Let your agent find it (recommended for beginners):** Install** **`find-skills` first, then just describe your task in plain English:

```bash
npx skills add vercel-labs/skills --skill find-skills
```

Now tell your agent:** ***"I need to write tests for my React app"* — and it surfaces the best skill for the job. No guessing.

---

### Step 2: Audit It (Don't Skip)

Before you install** ** **anything** , run it through a security audit. This is the "script we provided" step — point your agent at the skill and have it scan for the red flags listed above.

**The simplest safe approach:**

1. Pull the skill's repo /** **`SKILL.md` without installing it into your agent's active path yet
2. Run your security-audit skill or script against it
3. Read the report — it grades findings by severity:** ****Critical, High, Medium, Low**

**What a good audit checks for:**

| Check               | What it catches                                                   |
| ------------------- | ----------------------------------------------------------------- |
| Hidden instructions | HTML comments, zero-width characters, encoded payloads            |
| Prompt injection    | Attempts to override your agent's rules or jailbreak it           |
| Command injection   | Dangerous `eval()`, `exec()`, `os.system()`, `shell=True` |
| Data exfiltration   | Unauthorized network calls, credential or clipboard access        |
| Path traversal      | Attempts to escape directories and read unauthorized files        |
| Risky dependencies  | Unpinned versions, typosquats, known CVEs                         |

<aside> ✅

**Decision rule:** Green / Low only → safe to install. Any Critical or High finding → do** ****not** install until you understand exactly what it does. When in doubt, skip it.

</aside>

---

### Step 3: Install It

Once a skill passes the audit, install it with one command:

```bash
npx skills add <owner/repo>
```

If a repo contains multiple skills, target the one you want:

```bash
npx skills add <owner/repo> --skill <skill-name>
```

The CLI clones the skill and asks which agent(s) to add it to (Claude Code, Cursor, Codex, etc.). Pick your agent and it's wired in automatically.

---

### Step 4: Use It

Open your agent and give it a task related to the skill. It now has the new capability loaded — no extra configuration needed. The agent will reach for the skill automatically when the task matches.

That's the full loop. Find it, audit it, install it, use it.

---

## Advanced Guide

Once you've got the basics down, here's where it gets powerful.

### Install Across Multiple Agents at Once

The CLI can push a single skill to every agent you use — Claude Code, Cursor, Codex, Windsurf, and 50+ more — so you don't manually copy** **`SKILL.md` files between tools.

### Keep Skills Updated

Skills evolve. Stay current without reinstalling:

```bash
npx skills check    # See what's outdated
npx skills update   # Update everything at once
```

### Build Your Own Skill

A skill is just a folder with a** **`SKILL.md` file containing YAML frontmatter (a** **`name` and** **`description`) plus a markdown body of instructions:

```
---
name: my-skill
description: What this skill does and when to use it.
---

## Instructions
Step-by-step guidance the agent should follow when this skill is active.
```

Push it to GitHub and you can install it on any machine — or share it with your team via** **[skills.sh](http://skills.sh/).

### Stay Lean

<aside> ⚡

**Power move:** Don't hoard skills. Too many active skills bloats your agent's context and degrades performance. Install what the current project needs, audit each one, and remove skills you're not using. A focused agent beats an overloaded one.

</aside>

---

## Use Cases — What to Actually Build

Ideas to get the wheels turning:

* **Coding:** A** **`code-review` or** **`owasp-security-check` skill that scans every PR before you merge
* **Testing:** A skill that writes tests in your framework's exact conventions
* **Design:** A** **`frontend-design` skill that enforces your design system on every component
* **DevOps:** A skill that generates release notes from git history automatically
* **Deployment:** Vercel's** **`vercel-deploy` skill — say "deploy this" and get a live URL back
* **Research:** A skill that pulls and summarizes documentation for any library
* **Integrations:** Skills that connect your agent to Linear, Notion, or your CRM
* **Content/Marketing:** A skill that turns a brief into a polished post in your brand voice

The pattern: any task you do repeatedly and want done** ***consistently* is a candidate for a skill.

---

## Troubleshooting

* `npx skills` command not found
  Make sure Node.js is installed (run** **`node -v` to check).** **`npx` ships with Node. If it's installed and still failing, restart your terminal so it picks up the updated PATH.
* The skill installed but my agent isn't using it
  Confirm you selected the right agent during install, and that the skill landed in that agent's skills directory. Then give the agent a task that clearly matches the skill's description — agents reach for skills based on the** **`description`field in the** **`SKILL.md`.
* My audit flagged something — should I install?
  If it's a Critical or High finding, no. Read the specific finding first. Many flags are false positives (e.g. a legitimate network call), but some are real. If you can't confidently explain why the flagged code is safe, don't install it.
* A skill broke after an update
  Run** **`npx skills check` to see versions, then reinstall the previous known-good version by targeting the repo directly. Pin to a version you trust for production work.

---

## Recap

1. **Skills** = reusable capabilities that turn your generalist agent into a specialist
2. [**skills.sh**](http://skills.sh/) = Vercel's open directory; install anything with** **`npx skills add <owner/repo>`
3. **Always audit before you install** — skills can run code and access your files
4. **The loop:** Find → Audit → Install → Use, every single time
5. **Scale up** with multi-agent installs, updates, and your own custom skills

<aside> 🚀

**The unlock:** Once you trust your install process, your agent stops being a blank chatbot and starts acting like it already knows the job. Find the skill, check it's safe, install it — and let it work.

</aside>

---

Want more guides like this? Check out the full library of setup guides, cheat sheets, and skill tutorials in the** **[Lead Magnet Hub](https://www.notion.so/2e06a397f23b8034a426cf7f8cc0d6c3).
