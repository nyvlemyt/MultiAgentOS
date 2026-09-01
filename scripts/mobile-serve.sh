#!/usr/bin/env bash
# mobile-serve.sh — Expose the MAOS cockpit to your phone over the Tailscale tailnet.
#
# Security model (CLAUDE.md §5/§11): the cockpit has no login, so the tunnel IS the
# boundary. We bind the cockpit to the Mac's *Tailscale IP* (the 100.x interface) only —
# so it answers on the tailnet (your devices) but NOT on the local Wi-Fi/LAN, and we don't
# depend on the tailnet's HTTPS-certificate feature being enabled. Optional HTTPS upgrade
# via `tailscale serve` is documented in docs/workflows/mobile-remote-access.md.
#
# Usage: pnpm mobile:up   (Ctrl-C tears everything down cleanly)
set -euo pipefail

PORT="${MAOS_PORT:-3000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --- locate the tailscale CLI (PATH, or inside the GUI app bundle) -----------------
TS=""
if command -v tailscale >/dev/null 2>&1; then
  TS="$(command -v tailscale)"
elif [ -x "/Applications/Tailscale.app/Contents/MacOS/Tailscale" ]; then
  TS="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
else
  echo "❌ Tailscale introuvable. Installe-le depuis le Mac App Store (cherche « Tailscale »)."
  echo "   Détails : docs/workflows/mobile-remote-access.md"
  exit 1
fi

# --- must be logged in -------------------------------------------------------------
if ! "$TS" status >/dev/null 2>&1; then
  echo "❌ Tailscale pas connecté. Ouvre l'app Tailscale (barre de menu) → Log in → compte Google."
  echo "   Puis relance : pnpm mobile:up"
  exit 1
fi

# --- discover the tailnet address of this Mac --------------------------------------
TS_IP="$("$TS" ip -4 2>/dev/null | head -1)"
TS_DNS="$("$TS" status --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.Self?.DNSName||"").replace(/\.$/,""))}catch{}})' 2>/dev/null || true)"
if [ -z "$TS_IP" ]; then
  echo "❌ Impossible de lire l'IP Tailscale. Vérifie que Tailscale est ON (bascule bleue)."
  exit 1
fi

# --- prod build of the cockpit if missing ------------------------------------------
if [ ! -d "apps/web/.next" ]; then
  echo "🔨 Build du cockpit (1ère fois, ~1 min)…"
  pnpm --filter @mas/web build
fi

PIDS=()
cleanup() {
  echo ""
  echo "🧹 Arrêt…"
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  exit 0
}
trap cleanup INT TERM EXIT

# --- start the orchestrator worker -------------------------------------------------
echo "⚙️  Démarrage du moteur (worker)…"
pnpm --filter @mas/worker start >/tmp/maos-worker.log 2>&1 &
PIDS+=("$!")

# --- start the cockpit, bound to the Tailscale interface only -----------------------
echo "🖥️  Démarrage du cockpit (tailnet $TS_IP:$PORT)…"
( cd apps/web && pnpm exec next start -H "$TS_IP" -p "$PORT" ) >/tmp/maos-web.log 2>&1 &
PIDS+=("$!")

# wait for the cockpit to answer
READY=""
for _ in $(seq 1 40); do
  if curl -sf "http://$TS_IP:$PORT" >/dev/null 2>&1; then READY=1; break; fi
  sleep 1
done

# --- keep the Mac awake while serving ----------------------------------------------
caffeinate -s -w "$$" &
PIDS+=("$!")

# --- print the phone URL -----------------------------------------------------------
echo ""
if [ -n "$READY" ]; then
  echo "✅ Cockpit en ligne. Sur ton iPhone (Tailscale ON), ouvre dans Safari :"
else
  echo "⚠️  Le cockpit met du temps à répondre (voir /tmp/maos-web.log). Adresses :"
fi
echo ""
[ -n "$TS_DNS" ] && echo "      http://$TS_DNS:$PORT"
echo "      http://$TS_IP:$PORT      (marche toujours, même si le nom ne résout pas)"
echo ""
echo "   Ajoute-la à l'écran d'accueil → ça devient une app. Ctrl-C ici = tout couper."
echo "   Logs : /tmp/maos-web.log  /tmp/maos-worker.log"
echo ""

wait
