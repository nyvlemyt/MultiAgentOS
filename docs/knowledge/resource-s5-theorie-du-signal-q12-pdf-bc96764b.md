---
id: resource-s5-theorie-du-signal-q12-pdf-bc96764b
slug: resource-s5-theorie-du-signal-q12-pdf-bc96764b
source_key: 'sha256:bc96764bd26db97a833ca8b870fd254351b66b3f74e9f1f78e0792d72a8b59bc'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 19
manifest: null
derived_from: 'sha256:bc96764bd26db97a833ca8b870fd254351b66b3f74e9f1f78e0792d72a8b59bc'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - fourier-transform
  - signal-theory
  - sampling
  - nyquist
  - euler-formulas
  - linearisation
  - amplitude-spectrum
domain: signal-processing
---
# S5 - Théorie du signal — Q12.pdf

## Thesis

Pour calculer la Transformée de Fourier d'un signal y(t) exprimé comme un produit de sinusoïdes, on commence par le linéariser via les formules d'Euler afin de le décomposer en somme d'exponentielles complexes, puis on applique les propriétés de linéarité et de décalage fréquentiel de la TF. La condition d'échantillonnage de Nyquist-Shannon (Fe ≥ 2·f_max) garantit ensuite qu'aucune distorsion par repliement n'apparaît.

## Context

Document pédagogique produit dans le cadre du cours S5 — Théorie du signal (I1-APP.LSI, septembre 2024) par Sara Tchinda et Lucas Baury. Il s'agit de la question Q12 d'une série d'exercices, traitée sous forme de diaporama de dérivation pas-à-pas. Les formules mathématiques précises sont intégrées en tant qu'images dans le PDF source et ne sont pas extractibles en texte brut ; seule la structure logique et la méthode sont restituées ici.

## Reasoning

La dérivation se déroule en quatre étapes : (1) Linéarisation — on utilise les identités d'Euler (cos θ = (e^{jθ}+e^{-jθ})/2, sin θ = (e^{jθ}-e^{-jθ})/(2j)) pour transformer un produit de sinusoïdes en une somme d'exponentielles complexes à fréquences distinctes ; (2) Calcul de Y(f) — par linéarité de la TF et par la propriété de décalage fréquentiel (TF{e^{j2πf₀t}} = δ(f − f₀)), chaque terme donne un pic de Dirac pondéré ; la transformée Y(f) est donc une combinaison de Dirac aux fréquences harmoniques du signal ; (3) Spectre d'amplitude |Y(f)| — on calcule le module de chaque coefficient complexe pour tracer le spectre à raies ; (4) Condition d'échantillonnage — pour éviter le repliement spectral (aliasing), la fréquence d'échantillonnage Fe doit satisfaire Fe ≥ 2·f_max (théorème de Nyquist-Shannon) ; dans l'exercice, f_max est identifiée à partir du spectre Y(f) calculé ; (5) Cas Fe = 10·f₀ — on trace le spectre du signal échantillonné : les répliques de Y(f) sont séparées de Fe = 10·f₀ dans le domaine fréquentiel, bien au-delà du critère minimal, garantissant l'absence de recouvrement spectral.

## Trade-offs

La méthode par linéarisation via Euler est systématique et exacte pour des signaux polynomiaux en sinusoïdes, mais le nombre de termes croît exponentiellement avec l'ordre du produit. En pratique, pour des signaux complexes, on préfère une TF numérique (FFT). Par ailleurs, choisir Fe très supérieure à 2·f_max (ici ×5) réduit le risque d'aliasing mais augmente le débit de données ; le choix optimal dépend du filtre anti-repliement disponible.

## See also

- Théorème de Nyquist-Shannon
- Peigne de Dirac (échantillonnage)
- Convolution dans le domaine fréquentiel
- Formules d'Euler
- Propriétés de la TF : linéarité et décalage fréquentiel
- Transformée de Fourier discrète (TFD / FFT)
