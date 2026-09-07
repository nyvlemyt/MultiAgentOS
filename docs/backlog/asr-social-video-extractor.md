# Backlog — Local ASR extractor for no-caption videos + social platforms (link-first)

**Source**: user decision, 2026-07-06, during knowledge-os Brique 6 extractor work (PR #56 shipped the yt-dlp YouTube captions extractor). Prereqs installed the same day: whisper-cpp (`whisper-cli`) + ffmpeg.

## What

The Brique 6 conveyor can ingest a YouTube URL only when captions exist (yt-dlp extractor, PR #56). Two gaps remain:

1. **Videos without captions** — no transcript source, so the capture yields nothing useful.
2. **Social platforms** (Instagram, TikTok) — their hosts are not in the egress allowlist, so links are refused; local video/audio *files* are routed by `inferKind` to `'unknown'` → `capture_failed`.

The fix is a local ASR (automatic speech recognition) leaf that transcribes audio with whisper when no captions are available.

## Decision (user, 2026-07-06) — LINK-FIRST policy

Instagram / TikTok / YouTube content is ingested **via URL through yt-dlp** (it supports all three platforms). A local video file is the **fallback only**, for when the link is dead. Never ask the user to download-then-drop a file that a link can fetch.

## Why it's only backlog, not a fix-now

- No demand yet: every video captured so far had captions; no insta/tiktok link has been submitted.
- The Extractor interface is frozen (Brique 6); adding a leaf is mechanical but deserves its own TDD pass (model choice, timeout/size guards, egress allowlist review) rather than riding an unrelated PR.
- Brique 5 (cockpit Ressources/Connaissances tab) is the priority to close the knowledge-os base first.

## What to do (when picked up — trigger: first no-caption video or first insta/tiktok link)

1. **New leaf behind the frozen Extractor interface** in `packages/memory/src/conveyor/extractors/` (branch `knowledge-os/brique-1`). Resolution chain:
   - yt-dlp captions when they exist (already shipped for YouTube, PR #56) →
   - else download audio only (`yt-dlp -x`) →
   - transcribe with `whisper-cli` (whisper-cpp installed 2026-07-06; model choice TBD — base/small multilingual for French) →
   - emit the **same markdown shape as the YouTube extractor** (one pipeline downstream).
2. **Cover local video/audio files too**: teach `inferKind` the video/audio extensions (currently `'unknown'` → `capture_failed`) and route them into the same audio→whisper chain (ffmpeg is installed for demux/convert).
3. **Extend the egress allowlist**: add `instagram.com` / `tiktok.com` hosts alongside the existing YOUTUBE_HOSTS-style entries in `config/permissions.json` (net-guard from PR #56 stays the single gate).
4. TDD per §7: captions-present short-circuits ASR; no-caption falls through to whisper; non-allowlisted host still refused; dead link → local-file fallback path.
