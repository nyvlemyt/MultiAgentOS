---
id: sonar-recurring-rules-canonical-fixes
slug: sonar-recurring-rules-canonical-fixes
source_key: 'sha256:04af60f8a50fc92c39afafa72c8f0727ed25e4f14ec5bc4b0a4bf97dd3f414e6'
lifecycle: active
trust: trusted
schema_version: '1'
---
# Sonar — recurring rules + canonical fixes

SonarCloud scans every PR (project `nyvlemyt_MultiAgentOS2`). The quality **gate**
only fails on rating thresholds, so MINOR/MAJOR smells pass the gate but still
count as issues. **Verification is not done until `scripts/sonar-pr-issues.sh <pr>`
exits 0** (zero open issues AND zero to-review hotspots) — see CLAUDE.md §7.

Avoid these upfront — they recur and each one costs a fix round-trip:

| Rule | Smell | Canonical fix |
|------|-------|---------------|
| **S5443** | hardcoded `/tmp/...` path literal (test fixtures, configs) | `join(tmpdir(), 'name')` — never a `/tmp` string literal, even for a never-written fixture field |
| **S7776** | `const X = [...]` used only for `.includes()` membership | `const X = new Set([...])` + `X.has()` |
| **S3735** | `void somePromise()` operator | extract a detached helper that does `p.then(undefined, () => undefined)`; never the `void` operator |
| **S6772** | JSX text node adjacent to an element (`<label>Text<input/></label>`) | wrap the text in `<span>Text</span>` |
| **S6848** | non-native element with handlers (`<section onDrop>`, `<li onClick>`) | add an `aria-label` / `role`; for a drop-zone, `aria-label="<col> column"` |
| **S7735** | negated condition in a ternary (`x !== y ? A : B`) | flip to `x === y ? B : A` |
| **S2871** | `.sort()` without a comparator | `.sort((a, b) => a.localeCompare(b))` (strings) or a numeric comparator |
| **S5852** | regex with overlapping quantifiers (`\s*(.*)`, anchored trim `/^-+\|-+$/`) | make quantifiers disjoint (`(\S.*)?`); for slugify use `split(/.../).filter(Boolean).join('-')` |
| **S3863** | same module imported twice | merge into one `import` |
| **S4325** | redundant `as T` assertion that doesn't change the type | drop it |
| **S4623** | passing `undefined` for an optional param | omit the argument |
| **S7780** | `'a\\b'` string with escaped backslash | `String.raw\`a\b\`` |
| **S4036** | `execFileSync('bash', ...)` resolved via PATH | absolute path: `execFileSync('/bin/bash', ...)` |
| **S5906** | `expect(arr.length).toBe(n)` in a test | use the dedicated matcher: `expect(arr).toHaveLength(n)` (only the `.length).toBe()` exact-equality form trips it; comparison matchers like `toBeGreaterThanOrEqual` are fine) |

**Process:** after `git push`, poll Sonar (the analysis keys off your HEAD sha), then
`scripts/sonar-pr-issues.sh <pr>`. Fix everything it lists — gate-failing or not —
before the phase is "done". A green gate with open smells is **not** done.
