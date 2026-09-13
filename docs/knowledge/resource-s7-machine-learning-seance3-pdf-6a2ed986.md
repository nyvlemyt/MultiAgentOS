---
id: resource-s7-machine-learning-seance3-pdf-6a2ed986
slug: resource-s7-machine-learning-seance3-pdf-6a2ed986
source_key: 'sha256:6a2ed986308860181e3e84a65fc8f57f98bfa5082219974991d9c16ccfaa7006'
part_of: resource-s7-machine-learning-f79ea225
order: 20
manifest: null
derived_from: 'sha256:6a2ed986308860181e3e84a65fc8f57f98bfa5082219974991d9c16ccfaa7006'
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
  - naive-bayes
  - probabilistic-classification
  - bayes-theorem
  - machine-learning
  - gaussian
  - LDA
  - QDA
  - prior
  - posterior
  - conditional-probability
domain: machine-learning
---
# S7 - machine learning — seance3.pdf

## Thesis

Naive Bayes est un classificateur probabiliste basé sur le théorème de Bayes qui suppose l'indépendance conditionnelle des caractéristiques — hypothèse « naïve » qui simplifie radicalement le calcul tout en restant efficace sur de nombreuses tâches de classification.

## Context

Présenté dans un cours de Machine Learning I (EFREI Paris, Autumn 2024) au chapitre III. Prend place dans la famille des méthodes d'apprentissage supervisé probabilistes, à côté de l'Analyse Discriminante Linéaire (LDA) et Quadratique (QDA). L'exemple fil rouge est la classification du genre (F/G) d'élèves-ingénieurs à partir de leur taille (175 observations, 13 valeurs de taille).

## Reasoning

**Fondements probabilistes mobilisés :**

1. **Probabilité jointe** `p(xi, Ck) = nik / N` : fréquence conjointe d'une valeur de taille xi et d'une classe Ck dans le corpus.
2. **Probabilité marginale** `pX(xi) = ci / N` : obtenue par la règle de somme — `pX(xi) = Σk p(xi, Ck)`.
3. **Probabilité a priori de classe** `Pr(Ck) = Nk / N` : sans aucune information sur la taille ; leur somme vaut 1.
4. **Probabilité conditionnelle** `p(xi / Ck) = nik / Nk` : vraisemblance d'observer xi sachant la classe ; reliée à la jointe par la règle produit `p(xi, Ck) = p(xi/Ck) · Pr(Ck)`.
5. **Théorème de Bayes** : `Pr(Ck/x) ∝ p(x/Ck) · Pr(Ck)` — le postérieur est proportionnel au produit de la vraisemblance et du prior.
6. **Hypothèse naïve** : les caractéristiques (features) sont conditionnellement indépendantes entre elles sachant la classe → le calcul de la vraisemblance se factorise en produit de probabilités univariées : `p(X/Ck) = Π_j p(xj/Ck)`.

**Procédure de classification (4 étapes) :**
1. Construire la table de fréquences par attribut / cible.
2. En déduire les tables de probabilités (vraisemblances et priors).
3. Calculer le postérieur `P(Ck|X)` pour chaque classe par le produit des vraisemblances × prior.
4. Affecter l'observation à la classe de postérieur maximal.

**Variables continues — extension gaussienne :**
Quand une feature est numérique, on modélise `X | Y=k ~ N(μk, σk²)` et on évalue la densité gaussienne `p(x | y=k) = (1 / (√(2π)·σk)) · exp(-(x-μk)² / (2σk²))` à la place de la fréquence tabulée. La probabilité marginale s'obtient par la somme pondérée des densités conditionnelles.

## Trade-offs

**Naive Bayes :**
- ✅ Très rapide à entraîner, fonctionne bien sur petit dataset, interprétable.
- ❌ L'hypothèse d'indépendance des features est rarement vérifiée en pratique (d'où le qualificatif « naïve »).

**LDA (Analyse Discriminante Linéaire) :** hypothèse que toutes les classes partagent la même matrice de covariance (σ0 = σ1) → frontière de décision linéaire. Plus stable avec peu de données.

**QDA (Analyse Discriminante Quadratique) :** chaque classe a sa propre matrice de covariance (σ0 ≠ σ1) → frontière quadratique. Plus flexible, mais nécessite davantage de données pour estimer les covariances sans sur-apprentissage.

**Choix pratique :** si les covariances inter-classes sont similaires → LDA ; si elles diffèrent significativement → QDA ; si la dimension est élevée et les features approximativement indépendantes → Naive Bayes.

## See also

- LDA — Analyse Discriminante Linéaire
- QDA — Analyse Discriminante Quadratique
- Régression logistique (autre classificateur probabiliste discriminatif)
- Théorème de Bayes
- Distribution normale / gaussienne
- Apprentissage supervisé — introduction
