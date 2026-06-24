# Wave A — Independent Checker Verdict

> Branch `phase/9-audit-0a0b` (HEAD `16730ae`), cut from `phase/9b-pipeline` tip `e1dbe7b`.
> READ-ONLY review. The Checker did not edit source, commit, or push.
> Verifies the build-report's claims against the plan exit criteria A1–A5 and CLAUDE.md §5/§7/§8/§11.

## VERDICT: **PASS**

Wave A is verification + mechanical tech-debt cleanup + a single safe doc/fiche fix. Every
claim in the build-report was independently re-run or re-read and held. The two carry-forwards
(R4 live project-memory demo; agents consuming the MCP brain) are documented honestly as
expected gaps scheduled into 0c/0d — not hidden failures. No guardrail tripped. Scope was
respected (no 0c/0d work). The only gating prerequisite is the post-push Sonar scan of PR #38
confirming exit 0 — that is the orchestrator's step, not a Checker fault (the live S5906 count
of 27 is the pre-existing main-branch count; the local diff fully converts all 27 sites).

## Evidence table

| Check | Plan ref | Method (re-run by Checker) | Result | Match build-report? |
|---|---|---|---|---|
| S5906 — 27 sites converted | A2 / Task S | `git diff` count of `+…toHaveLength` = **27**, distributed 3·4·1·1·2·5·1·2·3·1·1·1·1·1 across the 14 files (= inventory exactly) | **PASS** | yes (27→0 local) |
| S5906 — no weakening | A2 / Task S | Every removed line was a `.length).toBe(n)` (grep: 0 removed lines that aren't length-`toBe`); 1:1 add/del per file; no deleted assertion, no `// NOSONAR` | **PASS** | yes |
| S5906 — live Sonar count | A2 | `curl …rules=typescript:S5906&resolved=false` → **total 27** (pre-existing main count; PR #38 scan not yet landed — expected per plan) | **PENDING (post-push)** | yes (report says verify post-push) |
| Tests | A5 | `pnpm -r test` → core 106 · db 15 · skills 28 · memory 87 · agents 114 · web 143 · worker 8 = **501 / 0 fail** | **PASS** | exact match |
| Lint | A5 | `pnpm lint` → exit 0; PAYG guard PASS (no forbidden SDK import) | **PASS** | exact match |
| Build | A5 | `pnpm build` → exit 0 | **PASS** | exact match |
| Smoke | A5 | `pnpm --filter @mas/web smoke` → **32 passed**, exit 0 | **PASS** | exact match |
| R5 FTS fallback | A1 / Task R | `MAS_RETRIEVAL_BACKEND=fts pnpm mem:eval` → exit 0, `backend=fts`, **6 skip / 0 fail** (degrades, never crashes) | **PASS** | exact match |
| R6 eval auto | A1 / Task R | `pnpm mem:eval` → exit 0, `backend=qmd`, **6 pass / 0 fail / 0 skip** | **PASS** | exact match |
| R4 project-scope tests exist + pass | A1 / Task R | `retriever.test.ts` "restricts project hits to one project" (l160), "does not leak another project" (l168), "filters by projectId" (l232), "filters by scope" (l64); `context.test.ts` "includes a per-project summary…" (l26) — all present, memory pkg 87/87 green | **PASS** | exact match |
| R4 / R3 gaps documented honestly | A1 | Empty project-corpus + "MCP exposed not consumed → 0d" spelled out in plan §R4 and build-report §1; not presented as proven | **PASS** | yes |
| R1/R2 MCP probes @0.88 | A1 | Orchestrator-only tools — not re-runnable by Checker; eval rows `sem-forgetting`/`arsenal-*` (the testable proxy) pass under qmd | **ACCEPTED (proxy verified)** | n/a |
| U1 fix-now safe + fiche loadable | A3 / Task U | Diff adds ONLY a `limits:` block (no role/tools/import change). `reviewers.ts` consumes fiches via `readFileSync(...).trim()` raw text — NO YAML parse → a new frontmatter key cannot break loading | **PASS** | exact match |
| §11 no SDK import | Guardrail | `@anthropic-ai/sdk` hits in diff are prose-only (plan/report describing the ban); `providers/` untouched | **PASS** | yes |
| §8 no `data/memory/` write | Guardrail | No `data/memory/` path in diff | **PASS** | yes |
| §5 no destructive op | Guardrail | `--force`/`reset --hard`/`rm` hits in diff are prose-only (docs forbidding them) | **PASS** | yes |
| Scope discipline (no 0c/0d) | CAMPAIGN §5 | AGENTS.md UNTOUCHED; only `quality-controller.md` fiche changed; no MCP-consumption code; no product source touched | **PASS** | yes |

## Findings (severity-tagged)

- **[info] U1 commit hash.** Build-report §3 cites the U1 fix-now commit as `2cc9d83` — verified: `2cc9d83 docs(A): self-audit fix-now — quality-controller fiche limits key`. Accurate.
- **[info] Live S5906 = 27 is the main-branch count, not a regression.** The plan explicitly anticipated this (PR-scan lags until #38 analysis lands). The local diff fully converts all 27 sites with `toHaveLength`. Stated for transparency; not a defect.
- **[info] R1/R2 @0.88 scores rely on orchestrator-only MCP tools.** The Checker cannot re-run the raw MCP `vec` probes, but the `pnpm mem:eval` harness (which the Checker DID re-run, 6/6 pass on qmd) exercises the same semantic + arsenal recall path as a faithful proxy. Claim accepted.
- **[info] Smoke webpack cache warnings.** `ENOENT … .pack.gz` warnings appear in the smoke log — benign Next.js dev-cache noise; the run still reports 32 passed / exit 0.
- **[positive] U5 ADR-0003 cross-check** independently plausible: `reviewers.ts` and the retriever seam match the amendment prose; build-report correctly marks it "no action — positive verification."

## Gating prerequisite (not a fault)

- **A2 / A5 Sonar (check 5):** closes only when the pushed PR #38 Sonar scan confirms `scripts/sonar-pr-issues.sh <pr>` exit 0 (0 issues / 0 hotspots, incl. 0 of 27 S5906) + `qualitygates/project_status` OK. This is the orchestrator's post-push step. PASS is conditioned on it the same way 0b was — not a defect of the build.

## Disposition

PASS. The local 4 checks are green, the 27 S5906 sites are fully and faithfully converted with
no weakening, the U1 fix is safe and the fiche remains loadable, all Task-R claims are either
re-verified or honestly documented as expected gaps, every guardrail (§5/§8/§11) held, and the
wave did not drift into 0c or 0d. Recommend the orchestrator: push the DRAFT PR, poll for the
HEAD-sha Sonar analysis, run `scripts/sonar-pr-issues.sh` to confirm exit 0 + gate OK, then
close A2/A5 and proceed to the Wave A gate.

```json
{
  "wave": "A",
  "branch": "phase/9-audit-0a0b",
  "head": "16730ae",
  "verdict": "PASS",
  "checks": {
    "tests": { "pass": 501, "fail": 0, "exit": 0 },
    "lint": { "exit": 0, "payg_guard": "PASS" },
    "build": { "exit": 0 },
    "smoke": { "passed": 32, "exit": 0 },
    "mem_eval_auto": { "exit": 0, "backend": "qmd", "pass": 6, "fail": 0, "skip": 0 },
    "mem_eval_fts": { "exit": 0, "backend": "fts", "pass": 0, "fail": 0, "skip": 6 },
    "sonar": { "status": "pending_post_push", "live_s5906_total": 27, "note": "27 = pre-existing main count; local diff converts all 27 sites" }
  },
  "s5906": { "sites_converted": 27, "files": 14, "weakened": 0, "deleted": 0, "nosonar": 0 },
  "task_R": {
    "R1": "accepted_proxy", "R2": "accepted_proxy", "R3": "documented_gap_to_0d",
    "R4_wiring": "pass_tests_present", "R4_live_demo": "documented_gap", "R5": "pass", "R6": "pass"
  },
  "task_U": { "fix_now_applied": 1, "fix_now_safe": true, "fiche_still_loadable": true, "backlogged_to_0c": ["U2", "U3"], "backlogged_section3": ["U4"], "positive": ["U5"] },
  "guardrails": { "sdk_payg_import": "none", "providers_untouched": true, "data_memory_write": "none", "destructive_git_op": "none" },
  "scope": { "did_0c_work": false, "did_0d_work": false, "agents_md_touched": false, "new_fiches": 0, "product_source_touched": false },
  "gating_prerequisite": "post-push Sonar PR#38 scan exit 0 + gate OK (orchestrator step, like 0b)"
}
```
