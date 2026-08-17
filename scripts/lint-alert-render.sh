#!/usr/bin/env bash
# Portique C12 (docs/backlog/statut-verite-reconciliation.md) :
# le seul rendu d'alerte autorisé est apps/web/components/AlertSurface.tsx.
# Toute autre definition de composant dont le nom contient Alert ou Banner
# dans apps/web est un rendu hors contrat (trois phrases non garanties,
# null != zero non garanti). Le nom doit CONTENIR, pas seulement finir par :
# un AlertBadge fait main est exactement le contournement a attraper.
set -euo pipefail

ROOT="${1:-apps/web}"
ALLOWED="components/AlertSurface.tsx"

HITS=$(grep -rlnE "^export function [A-Za-z]*(Alert|Banner)[A-Za-z]*\(" "$ROOT" \
  --include="*.tsx" 2>/dev/null \
  | grep -v "node_modules" \
  | grep -v "$ALLOWED" \
  || true)

if [[ -n "$HITS" ]]; then
  echo "ERROR: rendu d'alerte hors du composant contractuel (C12)" >&2
  echo "       Le seul rendu autorise est apps/web/$ALLOWED." >&2
  echo "$HITS" >&2
  exit 1
fi

echo "PASS: tous les rendus d'alerte passent par AlertSurface.tsx (C12)"
