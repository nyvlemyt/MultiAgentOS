# Deux actions hors du perimetre d'ecriture de l'assistant (regle securite.md, verrou garde_perimetre),
# a lancer par Melvyn depuis une console PowerShell locale (pas depuis un chemin UNC).
# Lecture seule tant que -Apply n'est pas passe.
[CmdletBinding()]
param([switch]$Apply)

$ErrorActionPreference = 'Stop'

# 1. Lanceur eve.cmd : le generateur pointe encore sur C:\dev\EVE (dossier parent).
#    On corrige la table du generateur puis on regenere les lanceurs (csdr, bdfg, maos, eve, cc).
$generateur = 'C:\dev\Setup-ClaudeLaunchers.ps1'
$ancien = "    eve  = 'C:\dev\EVE'"
$nouveau = "    eve  = 'C:\dev\Eve\EveBackEnd'"
$contenu = Get-Content $generateur -Raw
if ($contenu.Contains($ancien)) {
    Write-Host "[1] $generateur : ligne eve a corriger -> $($nouveau.Trim())"
    if ($Apply) {
        Set-Content -Path $generateur -Value $contenu.Replace($ancien, $nouveau) -Encoding UTF8 -NoNewline
        & $generateur -Apply
    }
} elseif ($contenu.Contains($nouveau)) {
    Write-Host "[1] generateur deja corrige"
} else {
    Write-Host "[1] ATTENTION : ligne eve introuvable dans $generateur, verifier a la main"
}

# 2. Ancien bucket memoire c--dev-EVE : les 5 fiches ont ete fusionnees dans c--dev-Eve-EveBackEnd
#    le 08/09/2026. On le reduit a une redirection pour eviter deux memoires divergentes.
$ancienBucket = Join-Path $env:USERPROFILE '.claude\projects\c--dev-EVE\memory'
if (Test-Path $ancienBucket) {
    $fiches = Get-ChildItem $ancienBucket -File | Where-Object { $_.Name -ne 'MEMORY.md' }
    Write-Host "[2] $ancienBucket : $($fiches.Count) fiche(s) a remplacer par une redirection"
    if ($Apply) {
        $archive = Join-Path $env:USERPROFILE '.claude\projects\c--dev-EVE\memory_archive_2026-09-08'
        New-Item -ItemType Directory -Force $archive | Out-Null
        foreach ($f in $fiches) { Move-Item $f.FullName (Join-Path $archive $f.Name) -Force }
        $index = "# Memory Index`n`n- [Memoire deplacee](memoire-deplacee.md) : tout est dans le bucket c--dev-Eve-EveBackEnd depuis le 08/09/2026`n"
        Set-Content -Path (Join-Path $ancienBucket 'MEMORY.md') -Value $index -Encoding UTF8
        $fiche = @"
---
name: memoire-deplacee
description: Ce bucket (C:\dev\EVE) n'est plus utilise, la memoire vit dans c--dev-Eve-EveBackEnd
metadata:
  type: project
---

Depuis le 08/09/2026 le dossier canonique de travail est C:\dev\Eve\EveBackEnd et la memoire est dans
le bucket c--dev-Eve-EveBackEnd. Les anciennes fiches sont archivees dans memory_archive_2026-09-08.
Si une session s'ouvre ici, relancer depuis C:\dev\Eve\EveBackEnd (lanceur eve.cmd).
"@
        Set-Content -Path (Join-Path $ancienBucket 'memoire-deplacee.md') -Value $fiche -Encoding UTF8
        Write-Host "[2] fait : fiches archivees, redirection ecrite"
    }
} else {
    Write-Host "[2] ancien bucket absent, rien a faire"
}

if (-not $Apply) { Write-Host "`nMode constat. Relancer avec -Apply pour appliquer." }
