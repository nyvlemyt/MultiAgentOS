# Backlog — Mobile / remote access to the MAOS cockpit (Route A: tunnel + autopilot)

**Source**: user direction, 2026-06-26. Until this card it had **zero repo footprint** — it lived only in session memory; this card fixes that so the direction survives outside any one session.

## What

Give the user the cockpit from a phone (or any remote machine), so long-running work can be launched and supervised away from the desk:

- **Route A** = expose the MAOS cockpit remotely via a **Tailscale** or **cloudflared tunnel** (no public hosting, no re-architecture — the local Next.js app stays the single instance).
- Pair it with **autopilot mode** for long batches (§4): kick off a mission from the phone, let the autopilot scheduler run the non-risky batch, read the wake report later. Risky actions stay gated (§5) regardless of where the click comes from.
- **Port the mobile UX patterns from siteboon/claudecodeui** — the CLAUDE.md §9.bis primary reference repo already solved cockpit-on-a-phone (project picker, session list, responsive shell); port the pattern, not the code, and cite the source file.

## Why it's only backlog, not a fix-now

- **Explicitly NOT scheduled** — this is a parked direction awaiting prioritization against knowledge-os completion (Brique 5 cockpit tab and the rest of the base-completion track come first).
- Exposing the cockpit off-localhost has security weight (auth in front of the tunnel, §5 gates over a remote link) that deserves a deliberate pass, not a side quest.

## What to do (when picked up — after knowledge-os base completion, on explicit user go)

1. Pick the tunnel (Tailscale serve vs cloudflared) with a mini intake-audit: auth story, latency, free-tier limits; put an auth layer in front either way.
2. Verify the §5 risky-action gates and autonomy-level display behave identically over the tunnel (the topbar autonomy indicator must be visible on mobile).
3. Mobile UX pass on the cockpit shell, porting siteboon/claudecodeui patterns (responsive nav, touch targets, session list first).
4. Wire the autopilot loop for remote use: launch from phone → batch runs → daily/wake report readable from phone.
