# Rapport brut : relecteur-eve, verdict 2 du lot 4, 18/09/2026

Depose tel quel par le fil. Brief : rendre le verdict contre le critere de sortie du `design-lot-4.md`
section 3 ; un trou d'une classe deja ecrite ne compte pas ; le critere 1 (zero faux refus sur le
quotidien) passe avant les trous.

Verdict : NEEDS_WORK

Criteres 1 et 3 tenus (67 commandes du quotidien, zero faux refus ; la regle generique refuse bien
`split`, `tar -xf` et un cmdlet d'export sans cible), mais le critere 4 tombe : **le correctif D du
cycle 1 a rouvert l'ecriture de la zone protegee**, et le correctif C laisse sortir du perimetre, hors
de toute limite deja ecrite.

| Sev | Ou | Constat | Preuve | Correctif propose |
| --- | --- | --- | --- | --- |
| CRITIQUE | `_effets.py:391` (mode de l'amont) | Un cmdlet qui recoit un contenu declasse **toujours** son amont en lecture. Sans cible de chemin explicite, PowerShell lie pourtant la cible aux objets du tube : la commande ecrit le fichier venu du tube. La valeur de `-Value` sert alors de fausse cible d'ecriture et satisfait la regle generique. **Regression du cycle 1** : cette forme etait refusee avant | trois formes PASSENT (ajout et ecrasement sur la zone protegee, ajout hors perimetre). Liaison verifiee au poste sur un fichier du scratchpad : le tube ajoute bien la ligne, et l'ecrasement ecrase bien | ne declasser l'amont en lecture que si le cmdlet porte une cible de chemin explicite (positionnel, `-Path`, `-LiteralPath`, `-FilePath`, `-Destination`) ; et declarer les options a valeur non chemin pour qu'elles ne comptent plus comme cible |
| HAUTE | `_effets.py:324` (famille DEUXIEME) | Un commutateur Windows en tete (`/Y`, `/MIR`) est compte comme positionnel : la destination glisse d'un rang, et la vraie destination hors perimetre n'est plus que lue | les deux formes avec commutateur PASSENT ; sans commutateur, les deux sont REFUS | exclure un commutateur des positionnels pour les programmes Windows. Effet secondaire a corriger : une copie avec le commutateur en queue est refusee aujourd'hui en disant qu'elle ecrit le commutateur |
| BASSE | `_programmes.py:118` et `_effets.py:453` | `csplit` sans prefixe ecrit `xx00`, `xx01` dans le dossier courant : ni acces, ni declenchement de la regle generique. Meme classe que le correctif B, restee ouverte | la forme PASSE apres un `cd` hors perimetre ; temoin `split` REFUS par la regle generique | ajouter `csplit` aux verbes qui ecrivent dans le dossier courant |

A classer par le fil (le relecteur ne tranche pas) : `tar xf` et `tar xzf` sans tiret PASSENT apres un
`cd` hors perimetre, alors que `tar -xf` est REFUSE par la regle generique. L'asymetrie vient du
declencheur de la regle generique, qui ne lit pas le groupe de lettres sans tiret que la grammaire de
`tar` sait pourtant lire. Limite deja ecrite, ou defaut du critere 3 ?

Trous classes limite deja ecrite : aucun autre. Les formes jouees qui relevent des limites ecrites
(variable de shell, corps d'un script du disque, programme absent de la table) n'ont pas ete recomptees.

Comptes. 169 entrees fabriquees, aucune executee, aucun fichier du depot touche.
- Axe 1, quotidien : **67 entrees, 0 faux refus**. Familles : git en lecture et en ecriture (16), Django
  et tests (7), outils du poste, lecture de fichiers et de la zone protegee, recherche, ecriture
  d'artefacts de chantier (dont deux rapports par document en ligne), archives, telechargement, et
  20 formes PowerShell.
- Axe 2, correctifs a rebours : 74 entrees, 4 classes de trous (A tient, B tient sauf `csplit`, C perce,
  D perce).
- Axe 3, trous neufs : 28 entrees, **0 ecart** (zone protegee, appels .NET, tubes PowerShell, interdits
  de `git.md`, donnees et token : tous refuses).

Sorties brutes (extraits recopies) :

```text
-- AXE 1 quotidien : 67 entrees, 0 ecarts
-- AXE 2 correctifs a rebours : 45 entrees, 6 ecarts
-- AXE 3 trous neufs : 28 entrees, 0 ecarts
TOTAL 140 entrees, 6 ecarts ; ROUND 2 : 29 entrees, 9 ecarts

OK REFUS | xcopy chantiers <hors>/sortie          ecriture hors perimetre
OK REFUS | cd <hors> && split x.txt               `split` ecrit, mais aucune cible n'a pu etre resolue
OK REFUS | cd <hors> && tar -xf a.tar             `tar` ecrit, mais aucune cible n'a pu etre resolue
OK REFUS | Get-Content a.md | Add-Content -Path <hors>/b.md      ecriture hors perimetre
OK REFUS | Get-Item .env | Remove-Item            zone protegee en ecriture
OK PASSE | Get-Content <hors>/a.md | Set-Content chantiers/b.md  (le faux refus leve au cycle 1, tenu)
OK REFUS | git submodule foreach 'git push --force'              push avec --force interdit
```

Preuve de la liaison PowerShell, faite sur un fichier du scratchpad seulement : un `Add-Content` alimente
par le tube ajoute bien une ligne au fichier venu du tube, et un `Set-Content` l'ecrase.
