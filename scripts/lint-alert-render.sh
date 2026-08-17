#!/usr/bin/env bash
# Portique C12 (docs/backlog/statut-verite-reconciliation.md) :
# le seul rendu d'alerte autorisé est apps/web/components/AlertSurface.tsx.
# Toute autre definition de composant dont le nom contient Alert ou Banner
# dans apps/web est un rendu hors contrat (trois phrases non garanties,
# null != zero non garanti). Le nom doit CONTENIR, pas seulement finir par :
# un AlertBadge fait main est exactement le contournement a attraper.
#
# Le portique refuse de lier un NOM, pas d'appeler une fonction : aucun motif
# n'exige la parenthese ouvrante, donc une signature dont le nom et le "(" sont
# sur deux lignes source reste attrapee.
#
# Limites connues et assumees (documentees, pas silencieuses) :
#   - `export * from './banners'` n'est pas attrape, mais la definition qu'il
#     re-exporte l'est (motifs 1 a 3) des lors qu'elle vit dans un .tsx.
#   - une declaration locale NON exportee (`function InlineBanner() {}` au
#     milieu d'une page) n'est pas attrapee : l'elargir ferait tomber tout
#     `const BannerHeight = 40` local dans le portique.
#   - `export default memo(FooBanner)` n'est pas attrape par le motif 5.
set -euo pipefail

ROOT="${1:-apps/web}"
ALLOWED="components/AlertSurface.tsx"

# Un chemin errone ferait passer le portique en silence : un portique qui ne
# scanne rien doit crier, pas dire PASS.
if [[ ! -d "$ROOT" ]]; then
  echo "ERROR: racine de scan introuvable : $ROOT" >&2
  exit 2
fi

S='[[:space:]]'

# Nom de composant React : PascalCase (majuscule initiale) contenant Alert ou
# Banner. La majuscule initiale est le discriminant qui distingue un RENDU
# (<AlertBanner/>) d'un CONSTRUCTEUR de fait (budgetPauseAlert, qui retourne un
# Alert sans jamais le rendre) — React lui-meme impose cette casse au JSX.
# Chaque motif ancre ce nom juste apres son mot-cle, donc le camelCase ne peut
# pas se faufiler par le milieu d'un identifiant.
NAME='([A-Z][A-Za-z0-9_]*)?(Alert|Banner)[A-Za-z0-9_]*'

# 1. export [default] [async] function FooBanner
# 2. export const|let|var FooBanner   (fleche, memo(), forwardRef())
# 3. export [default] [abstract] class FooBanner
# 4. export { FooBanner } [from '...']  — la classe [,[:space:]] force le nom a
#    commencer un item de liste, sinon `export { budgetPauseAlert }` tomberait.
# 5. export default FooBanner;         — la forme scindee de 1.
PATTERNS=(
  "^${S}*export${S}+(default${S}+)?(async${S}+)?function${S}+${NAME}"
  "^${S}*export${S}+(const|let|var)${S}+${NAME}"
  "^${S}*export${S}+(default${S}+)?(abstract${S}+)?class${S}+${NAME}"
  "^${S}*export${S}*[{]([^}]*[,[:space:]])?${NAME}"
  "^${S}*export${S}+default${S}+${NAME}${S}*;?${S}*$"
)

# .tsx uniquement : un rendu exige du JSX. Scanner les .ts ferait tomber le
# contrat lui-meme (lib/alerts.ts) dans son propre portique.
RAW=""
for pattern in "${PATTERNS[@]}"; do
  RAW+=$(grep -rnE "$pattern" "$ROOT" --include="*.tsx" 2>/dev/null || true)
  RAW+=$'\n'
done

# L'exclusion porte sur le CHEMIN (champ 1), pas sur la ligne entiere : un
# fichier hors contrat qui cite AlertSurface.tsx en commentaire reste attrape.
HITS=$(printf '%s' "$RAW" \
  | grep -v "node_modules" \
  | awk -F: -v allowed="$ALLOWED" \
      'NF && substr($1, length($1) - length(allowed) + 1) != allowed' \
  | sort -u || true)

if [[ -n "$HITS" ]]; then
  echo "ERROR: rendu d'alerte hors du composant contractuel (C12)" >&2
  echo "       Le seul rendu autorise est apps/web/$ALLOWED." >&2
  echo "$HITS" >&2
  exit 1
fi

echo "PASS: tous les rendus d'alerte passent par AlertSurface.tsx (C12)"
