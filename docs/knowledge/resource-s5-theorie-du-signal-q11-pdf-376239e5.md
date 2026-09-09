---
id: resource-s5-theorie-du-signal-q11-pdf-376239e5
slug: resource-s5-theorie-du-signal-q11-pdf-376239e5
source_key: 'sha256:376239e5136a9e21c6d3cd120bbfd474d15cff7addc0e8ef8a07047451f81311'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 18
manifest: null
derived_from: 'sha256:376239e5136a9e21c6d3cd120bbfd474d15cff7addc0e8ef8a07047451f81311'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - signal-theory
  - convolution
  - fourier-transform
  - impulse-response
  - heaviside
  - dirac
  - low-pass-filter
  - transfer-function
domain: traitement du signal
---
# S5 - Théorie du signal — Q11.pdf

## Goal

Calculer la réponse impulsionnelle r(t) d'un système LTI à partir de la dérivée d'un signal s(t), puis établir sa fonction de transfert par transformée de Fourier et identifier la nature du filtre.

## Prerequisites

- Définition et propriétés de la fonction de Heaviside u(t) et du Dirac δ(t)
- Notion de convolution et d'élément neutre (δ est l'élément neutre de la convolution)
- Formule de la transformée de Fourier continue
- Notion de réponse impulsionnelle d'un système LTI

## Steps

**step**: 1
**title**: Dériver s(t)
**detail**: À partir de l'expression de s(t) (définie par morceaux via la fonction de Heaviside), calculer analytiquement la dérivée s'(t). La dérivée de la Heaviside donne le Dirac : d/dt[u(t)] = δ(t).
**step**: 2
**title**: Déduire la réponse impulsionnelle r(t)
**detail**: Utiliser la relation entre la sortie du système à l'entrée s'(t) et la réponse impulsionnelle. Puisque δ est l'élément neutre de la convolution, l'excitation par s'(t) — qui contient un Dirac — simplifie directement le calcul de r(t).
**step**: 3
**title**: Justifier l'intérêt de la méthode
**detail**: Heaviside est bien plus facile à reproduire physiquement qu'une impulsion de Dirac. Dériver un échelon de Heaviside produit un Dirac théorique, ce qui ramène le calcul à un problème standard exploitant la propriété de l'élément neutre de la convolution.
**step**: 4
**title**: Établir la fonction de transfert H(f)
**detail**: Appliquer la transformée de Fourier à r(t). Comme r(t) = 0 sur ]-∞ ; 0[, l'intégrale se réduit à [0 ; +∞[. On obtient H(f) par calcul direct de la transformée de Fourier unilatérale.
**step**: 5
**title**: Identifier la fonction réalisée par le système
**detail**: Analyser H(f) obtenu : la fréquence f apparaît au dénominateur, ce qui implique une atténuation croissante avec f. Les hautes fréquences sont filtrées, les basses passent sans atténuation : il s'agit d'un filtre passe-bas.
**step**: 6
**title**: Vérification numérique
**detail**: Calculer le module |H(f)| et tracer la représentation graphique. Évaluer H(f) en f = 0 : la valeur doit correspondre à la valeur théorique attendue (gain unitaire ou connu). Vérifier la cohérence avec le comportement passe-bas identifié à l'étape 5.

## Result

La réponse impulsionnelle r(t) du système est déterminée analytiquement. La transformée de Fourier de r(t) révèle une fonction de transfert H(f) avec f au dénominateur, caractéristique d'un filtre passe-bas. La vérification numérique en f = 0 confirme la cohérence théorie/calcul.

## Next

- Étudier un filtre passe-haut ou passe-bande par la même méthode (comparer les positions de f dans H(f))
- Explorer la réponse fréquentielle en traçant le diagramme de Bode
- Appliquer le théorème de Parseval pour relier énergie temporelle et fréquentielle
