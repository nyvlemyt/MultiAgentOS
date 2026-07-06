# Spec — Conveyor Web + Video Extractors (Brique 6, increment 3)

- **Date**: 2026-06-29
- **Statut**: build-now increment. Continues the chain `#53 (fiche contract) → #54 (conveyor core) → #55 (PDF leaf + pipeline + CLI) → this (web + video leaves + first network egress)`.
- **Branch**: `knowledge-os/brique-6-url-extractor` off `knowledge-os/brique-1`. PR base = `knowledge-os/brique-1`. (Carries the uncommitted WIP already in the worktree: `defuddle@^0.19.1` + `linkedom@^0.18.12` added to `@mas/memory`, plus the two intake dossiers `docs/intake/2026-06-29-agent-folder-portability.md` and `docs/intake/2026-06-29-obsidian-bases-vitrine.md`.)
- **Contracts (frozen, build against — never re-decide)**:
  - ADR `docs/decisions/0008-living-knowledge-os.md` clauses 4–6, 11.
  - The `Extractor` interface + `ExtractorRegistry` frozen in #54 (`packages/memory/src/conveyor/extractor.ts`).
  - Increment-2 spec `docs/superpowers/specs/2026-06-28-conveyor-extractors-design.md` (PDF leaf D1, CLI D5, guardrails §4). This increment fills its named DEFER prises **URL extractor** and **YouTube extractor**.
  - CLAUDE.md §5 (risky-action gating, the `allowed_hosts` network control) + §11 (billing isolation).
- **Frozen sockets this increment fills**:
  - `conveyor/extractor.ts` — open-string `sourceKind` registry; `unknown → capture_failed`. New leaves register here.
  - `conveyor/extractors/pdf.ts` — the `resolveBin` / `execFileSync` / injected-runner pattern to copy; `ExtractorEmptyError` to reuse.
  - `conveyor/pipeline.ts` + `mas-cli.ts` — `extract → SAS → classify → manifest → captureCandidates`; the CLI kind-router (today: non-`.pdf` → `unknown_source_kind` dead-letter) which this increment teaches `url` / `html` / `youtube`.
  - `config/permissions.json#allowed_hosts` + `packages/core/src/permissions.ts` (Zod schema, field present, **never read at runtime** — backlog `docs/backlog/allowed-hosts-runtime-gate.md`). This increment is its first consumer.

---

## 1. Why this increment exists

#55 made the conveyor operable end-to-end for **local files** (PDF). It deferred every leaf whose normalization quirks "ne sont connaissables que d'un vrai fichier déposé". We now have the real targets in hand — an Obsidian-docs article page (`https://help.obsidian.md/bases`) and a YouTube talk — so the URL and video leaves can be written against real responses instead of blind.

This increment also crosses a **first-of-its-kind boundary**: the project's **first outbound network egress**. Until now every fetch was either a local file or an LLM call through the Agent-SDK/router seam. The URL and YouTube leaves issue real HTTP. CLAUDE.md §5 already declares "network calls to hosts not in `allowed_hosts`" as an always-gated risky action, but that control is schema-only and dead (`allowed-hosts-runtime-gate.md`). So the **net-guard built here is the enforcement the §5 control was always promised** — and closes that backlog card.

Two user decisions, frozen 2026-06-29:
- **Blocked / paywalled pages** → ship the *paste* escape-hatch now (`html` leaf, zero network), defer credential-login behind a clean socket.
- **YouTube** → capture *transcript + metadata* (what is **said and described**) now; defer *visual frames* (what is **only shown**) to a named bolt-on with the design recorded.

## 2. Scope (frozen by user — choice (a), 2026-06-29)

### BUILD now
1. **`conveyor/net-guard.ts`** — `assertFetchAllowed(url, { resolve })` SSRF + allowlist gate for every outbound fetch this project makes. Closes `allowed-hosts-runtime-gate.md`.
2. **`conveyor/extractors/bin.ts`** — extract the `resolveBin` / `BIN_DIRS` helper out of `pdf.ts` into a shared module (pdf.ts re-imports it; no behaviour change). Reused by the YouTube leaf.
3. **`conveyor/extractors/url.ts`** — article URL → clean markdown via guarded fetch + Defuddle (`markdown:true`, linkedom DOM). Fills the named **URL extractor** prise.
4. **`conveyor/extractors/html.ts`** — pasted page HTML or already-clean text → markdown via Defuddle (no network). The blocked-page escape-hatch.
5. **`conveyor/extractors/youtube.ts`** — YouTube URL → transcript + metadata markdown via pinned `yt-dlp` subprocess. Fills the named **YouTube extractor** leaf.
6. **CLI routing + allowlist seed** — `mas-cli.ts` infers `youtube` / `url` / `html` (in addition to `pdf`); `--html [file|-]` reads a pasted blob (file or stdin). Seed `config/permissions.json#allowed_hosts` with the verification hosts (`help.obsidian.md`, `www.youtube.com`, `youtube.com`, `youtu.be`, `m.youtube.com`).

### DEFER (named prise, design recorded — not built)
- **YouTube visual-frames** (`--frames`) — sample frames (scene-detection + dedup + hard cap N) through an Agent-SDK vision pass, append a `## Frames` section to the same markdown. *Prise: the youtube extractor returns markdown; the frames block is purely additive (a `frames?: FrameOpts` option on the factory + a new markdown section). Budget-gated + opt-in per video.* Backlog card: `docs/backlog/youtube-visual-frames-extractor.md`.
- **Credential / authenticated fetch** (paywall auto-login) — *Prise: the `html` paste leaf already ingests any blocked page's content; an authenticated fetcher is an additive `url`-side strategy that would store a §5-gated secret and drive a headless login. Not built; no secret stored.*
- **DOCX/PPTX/OCR leaves, SimHash near-dup** — unchanged backlog leaves from #55.

## 3. Design decisions (spec-level)

### D1 — `net-guard`: SSRF block + allowlist, never-silent, the §5 enforcement
- `assertFetchAllowed(url, { resolve })` throws a typed `BlockedHostError` (→ pipeline dead-letter `host_not_allowed`, visible + relaunchable) unless **all** hold:
  - scheme ∈ `{http, https}` (reject `file:`, `ftp:`, `data:`, `gopher:`, …);
  - the host, **and every IP it resolves to**, is public — reject loopback (`127.0.0.0/8`, `::1`), private (`10/8`, `172.16/12`, `192.168/16`, `fc00::/7`), link-local (`169.254/16`, `fe80::/10`), and unspecified/`0.0.0.0`. The DNS resolution + post-resolution re-check is the **anti-rebind** step (a hostname that passes the allowlist but resolves to an internal IP is blocked);
  - the host ∈ `perms.allowed_hosts` (exact host match; empty allowlist = nothing allowed = secure default).
- `resolve` (DNS) is an **injected seam** → unit tests run with zero network and assert each rejection branch deterministically.
- This is exactly step 1 of `allowed-hosts-runtime-gate.md`: "host-check seam at the single outbound boundary → compare against `perms.allowed_hosts` → route a miss through the §5 gate." In the conveyor (user-initiated CLI capture) the §5 "pause for validation" renders as: **refuse + tell the user which host to add to the allowlist** — never a silent skip, never an auto-add. The broader dispatch-path wiring (domain agents routing a miss through the interactive §5 pause) reuses this same seam; that card is marked resolved by landing the seam + first consumer.

### D2 — `url` extractor: guarded fetch + Defuddle, redirect-safe
- `assertFetchAllowed(url)` **before** the first byte. Fetch with `redirect: 'manual'` + a timeout (`AbortController`) + a response-size cap (stream, abort past `MAX_BYTES`); **re-assert `assertFetchAllowed` on every `Location` hop** (a 3xx to an internal host is the classic SSRF bypass) up to a small `MAX_REDIRECTS`.
- `linkedom.parseHTML(html).document` → `new Defuddle(document, { markdown: true }).parse()` → `{ content: markdown, title, … }`. Defuddle's built-in `markdown:true` removes the need for Turndown (the prise note in #55 named Defuddle + Turndown; the installed `defuddle@0.19.1` does markdown natively → simpler, one less dep).
- `source_key = url:<sha256(finalUrl)>` (canonicalized: lowercase host, strip fragment + tracking query params). `trust: 'untrusted'` always. Markdown body carries a `# <title>` + a `> source: <finalUrl>` provenance header.
- Fetch seam injected (`{ fetch }`) → tests use a fake. Empty extraction (`< MIN_EXTRACT_CHARS`) or parse failure → typed throw → pipeline `extractor_empty` / `extractor_crash`. Never a half-result.

### D3 — `html` extractor: paste escape-hatch, zero egress
- Source = a raw blob (HTML or already-clean text), no URL, **no network, no guard**. This is the answer to "I can give the content of the page that blocks access."
- If the blob looks like HTML (contains a tag) → `linkedom` + `Defuddle({ markdown:true })` (same cleaner as `url`, factored into a shared `htmlToMarkdown(html)`); else treat as pre-cleaned text → wrap as a fenced/plain markdown body directly.
- `source_key = html:<sha256(blob)>`. `trust: 'untrusted'`. Idempotent re-paste matches by content hash.

### D4 — `youtube` extractor: yt-dlp transcript + metadata (the pdf.ts pattern)
- Architecturally a clone of the PDF leaf: pinned binary via the shared `resolveBin('yt-dlp')`, `execFileSync` (args as array → no shell, no injection), an injected `YoutubeRunner` seam so tests spawn **zero** subprocess.
- **Egress trust boundary**: yt-dlp does its own HTTP, so the net-guard cannot wrap its fetch. Instead: (a) `assertFetchAllowed` on the **input URL host** before spawning (must be an allowlisted YouTube domain), and (b) trust the pinned binary. This distinction is deliberate and documented in-file.
- Pull metadata JSON + subtitle/auto-caption track with `--skip-download` (no video bytes — cheap, fast): metadata via `-J`; captions via `--write-subs --write-auto-subs --sub-format vtt --skip-download` into a temp dir, then read + strip VTT → plain transcript (prefer manual subs over auto; prefer user-lang then any).
- Markdown body = `# <title>` · `> channel · upload_date · duration` · `## Chapters` (if any) · `## Description` · `## Transcript`. `source_key = youtube:<videoId>` (canonical id, rename/locale-stable). `trust: 'untrusted'`.
- Both transcript **and** description empty ⇒ `ExtractorEmptyError` (reused from pdf.ts) → dead-letter, never a hollow candidate.

### D5 — CLI routing + allowlist seed
- `mas-cli.ts` kind inference: host ∈ YouTube domains → `youtube`; other `http(s)://` → `url`; `--html [file|-]` (path or `-` for stdin) → `html`; `.pdf` → `pdf` (existing); else → existing `unknown_source_kind` dead-letter (never silent).
- Seed `config/permissions.json#allowed_hosts` with the five verification hosts. This is a real config edit (the allowlist goes from empty → the hosts the smokes need), committed with the increment; adding more hosts later is a one-line user edit.
- Default path stays **zero-LLM** (rules-only classify, §11-safe). Defuddle + yt-dlp are local tools, not model calls.

### D6 — visual-frames deferred, socket recorded
- The youtube leaf returns markdown; `--frames` would append a `## Frames` section built from sampled+deduped key-frames described by an Agent-SDK vision pass. The cost analysis (token-dominant, ~50–300k tokens/video, quota not €; ffmpeg + scene-detect + per-frame vision; minutes/video; noise risk) is why it is opt-in per video + hard-capped. Full design lives in the backlog card; the socket is additive (no rework). This is the (b) spec the user will add later.

## 4. Non-negotiable guardrails (preserved from #55 §4)
- **Network egress (NEW, §5)**: every outbound fetch passes `assertFetchAllowed`; a non-allowlisted or SSRF-shaped target is refused + surfaced, never silently fetched. Empty allowlist = deny-all default.
- **Anti-injection**: every web/video body is `trust: 'untrusted'`, `wrapUntrusted`-fenced before any LLM stage, never auto-promoted (`canAutoPromote('untrusted') === false`).
- **One door**: the pipeline writes only through `captureCandidates`. New leaves add no new write path.
- **Never-silent**: blocked host / empty / oversize / crash / unknown-kind → `capture_failed` + reason, visible + relaunchable.
- **§11 billing**: no `@anthropic-ai/sdk` import; Defuddle + linkedom + yt-dlp are local; the deferred frames vision pass goes through the existing Agent-SDK seam + budget gate, never PAYG.
- **No shell injection**: yt-dlp via `execFileSync` (args array); binaries resolved to absolute paths from the fixed `BIN_DIRS` allowlist (no PATH lookup — S4036).
- **Barrel hygiene**: net-guard + new extractors are **not** re-exported through `@mas/memory`'s `index.ts` (Brique 1d Next-smoke rule) — consumed only by the CLI/pipeline via relative imports.

## 5. Done-criteria (this increment)
- TDD on each new unit:
  - **net-guard**: scheme reject · loopback/private/link-local/unspecified reject (v4 + v6) · DNS-rebind (host allowlisted but resolves internal) reject · not-in-allowlist reject · allowlisted+public pass · empty-allowlist deny-all.
  - **url**: guarded-fetch happy path → markdown+title · redirect-to-internal-host blocked mid-chain · timeout/oversize → typed throw · empty → `extractor_empty` · content-hash `source_key` · `trust:untrusted`.
  - **html**: HTML blob → cleaned markdown · plain-text blob → passthrough markdown · content-hash key · no network touched (asserted via no-fetch seam).
  - **youtube**: metadata+transcript → composed markdown · manual-subs preferred over auto · chapters rendered · both-empty → `ExtractorEmptyError` · non-allowlisted host → blocked before spawn · injected runner → zero subprocess · `youtube:<id>` key.
  - **CLI**: each kind routed correctly · `--html -` reads stdin · unknown kind → dead-letter not skip.
- **5-check gate green on HEAD**: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar (`scripts/sonar-pr-issues.sh <pr>` exit 0 **and** `qualitygates/project_status == OK`, analysis sha == HEAD).
- **End-to-end smokes (real network, hosts seeded)**: `pnpm mas capture https://help.obsidian.md/bases` → a clean `pending` markdown candidate (ingests Obsidian Bases for real); one real YouTube URL → transcript candidate; one `--html` paste → candidate with no network call.
- `docs/backlog/allowed-hosts-runtime-gate.md` marked resolved (seam + first consumer landed); `docs/backlog/youtube-visual-frames-extractor.md` written.
- PR opened **as draft** off `knowledge-os/brique-1`.

## 6. Out of scope (explicit)
Visual-frames extractor · credential/authenticated fetch · DOCX/PPTX/OCR leaves · SimHash near-dup · LLM distillation to `docs/knowledge` · the `docs/ressources→docs/resources` rename · cockpit Brique 5 Inbox UI. Each has a named prise here or in the design-spec §9 backlog.
