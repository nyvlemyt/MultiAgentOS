---
id: consolidation-log-append-only-keeper-written
slug: consolidation-log-append-only-keeper-written
source_key: 'sha256:31cda84f8e7cbbc44a881646a98406350a4868bb9ebbb8cfdef42bbeec950ac3'
lifecycle: active
trust: trusted
schema_version: '1'
---
# Consolidation Log (append-only, Keeper-written)
Audit trail for taxonomy/lifecycle governance events. One line per event, newest at bottom.

FORMAT: `<ISO-date> | <event> | ids=<comma-sep> | lane=<lane> | keeper=<who> | note=<short>`
EVENTS: supersede | lane-promote(L1→L2|L2→L3) | archive | reject-kept | merge
(First real lines land in Round 2 when the supersede write-path goes live.)

---
