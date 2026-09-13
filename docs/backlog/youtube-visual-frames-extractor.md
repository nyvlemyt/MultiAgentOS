# Backlog — YouTube visual-frames extractor (the `--frames` bolt-on)

**Source**: Brique 6 increment-3 design, 2026-06-29 (user choice (a): ship transcript+metadata now, defer visual frames). Spec: `docs/superpowers/specs/2026-06-29-web-video-extractors-design.md` §2 DEFER + D6.

## What

The shipped `youtube` extractor captures what is **said and described** (transcript + title + description + chapters). It does **not** capture what is **only shown on screen** — slides, diagrams, code, demos the speaker displays without reading aloud. This card is the opt-in `--frames` extension that adds that visual layer.

Target output: append a `## Frames` section to the same youtube markdown body — a deduped, time-stamped set of frame descriptions (and any on-frame text), interleavable with the transcript timeline.

## Why it's only backlog, not built now

Cost analysis (frozen in the increment-3 design):

- **Token cost dominates.** Each frame → a vision pass ≈ 1–1.5k tokens + its description. A 30-min talk with scene-detection ≈ 50–200 frames → 50–300k tokens; an hour of dense slides → 500k+. Via the Agent-SDK subscription (§11), so quota-not-€ — but it **eats the ~23h session rate-cap**, and it is **recurring per video**.
- **Complexity.** Transcript = one pinned binary (`yt-dlp`), already the pdf.ts pattern. Frames = full video download + `ffmpeg` frame extraction + scene-detection + dedup + N vision calls. 3–4 new moving parts.
- **Latency.** Subs are KB / seconds; frames are MB–GB download + extraction + N sequential vision calls → minutes per video.
- **Noise.** Redundant frames (static slide held for minutes), useless frames (talking head, transitions) pollute the Knowledge OS search unless deduped/scene-gated.
- **The transcript already carries ~70–80% of the visual info** indirectly ("as you can see, it goes from 3 to 7%"). The marginal gain is dense unspoken slides only.

## What to do (when picked up)

1. Add a `frames?: { maxFrames, sceneThreshold }` option to the youtube extractor factory (default off — `--frames` CLI flag opts in **per video**).
2. Download video (or a low-res stream) via `yt-dlp`; extract key-frames with `ffmpeg` scene-detection (`select='gt(scene,<threshold>)'`), **not** fixed-interval; dedup near-identical frames; enforce a **hard cap** `maxFrames` (never an unbounded vision bill).
3. Describe each kept frame via the existing Agent-SDK vision seam (§11-safe, **budget-gated** — `evaluateBudget` before the batch, pause with `budget_exceeded`, same guard as the conveyor LLM-on-abstain path).
4. Append the `## Frames` markdown section (timestamp + description + any OCR'd on-frame text); keep `trust: 'untrusted'`.
5. TDD with an injected frame-source + vision seam (zero ffmpeg/network/vision in units); one real smoke on a slide-dense talk.

**Socket already shipped**: the youtube leaf returns markdown and the frames block is purely additive (new option + new section) — no rework of the transcript path. This is the (b) increment the user said they would spec later.
