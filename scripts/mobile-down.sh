#!/usr/bin/env bash
# mobile-down.sh — Close the Tailscale corridor and stop serving the cockpit.
# The worker/web processes are owned by `mobile-serve.sh` (Ctrl-C there stops them);
# this only resets the `tailscale serve` exposure, e.g. after a crash left it dangling.
set -euo pipefail

TS=""
if command -v tailscale >/dev/null 2>&1; then
  TS="$(command -v tailscale)"
elif [ -x "/Applications/Tailscale.app/Contents/MacOS/Tailscale" ]; then
  TS="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
else
  echo "Tailscale introuvable — rien à fermer."
  exit 0
fi

"$TS" serve --https=443 off >/dev/null 2>&1 || "$TS" serve reset >/dev/null 2>&1 || true
echo "✅ Couloir Tailscale fermé. Le cockpit n'est plus accessible depuis le téléphone."
