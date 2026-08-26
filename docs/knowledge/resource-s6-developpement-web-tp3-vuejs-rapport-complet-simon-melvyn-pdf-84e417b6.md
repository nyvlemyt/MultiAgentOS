---
id: >-
  resource-s6-developpement-web-tp3-vuejs-rapport-complet-simon-melvyn-pdf-84e417b6
slug: >-
  resource-s6-developpement-web-tp3-vuejs-rapport-complet-simon-melvyn-pdf-84e417b6
source_key: 'sha256:84e417b628b70ac1670df76c90aa4b454469a7d1dba63dafc9b599a5ad169fd6'
part_of: S6 - Développement Web
order: 3
manifest: null
derived_from: 'sha256:84e417b628b70ac1670df76c90aa4b454469a7d1dba63dafc9b599a5ad169fd6'
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
lane: workflows
schema_version: '1'
tags:
  - vuejs
  - vue3
  - composants
  - webpack
  - babel
  - eslint
  - npm
  - frontend
  - tp
  - scoped-css
  - slots
  - props
  - async
  - promise
domain: développement web frontend
---
# S6 - Développement Web — TP3_VueJS_Rapport_Complet_Simon_Melvyn.pdf

## Goal

Construire une application Vue 3 structurée par composants réutilisables, en maîtrisant l'outillage (npm, Webpack, Babel, ESLint) et les mécanismes fondamentaux de Vue 3 (props, slots, scoped CSS, fallthrough attributes, promesses).

## Prerequisites

- Node.js et pnpm installés
- Vue CLI installé globalement (@vue/cli)
- Notions de base HTML/CSS/JavaScript
- Compréhension élémentaire des modules npm

## Steps

**step**: 1
**title**: Comprendre l'outillage
**content**: Installation locale (node_modules du projet) vs globale (toute la machine). Packages locaux typiques : vue, pinia, vue-router, eslint. Packages globaux typiques : @vue/cli, vite, nodemon. Webpack regroupe les fichiers .vue/.js/.css en bundles compris par le navigateur. Babel traduit le JS moderne pour les anciens navigateurs selon la cible browserslist (ex : `["> 1%", "last 2 versions", "not dead", "not ie 11"]`). ESLint vérifie la qualité et le style du code selon les règles du projet.
**step**: 2
**title**: Créer et lancer le projet
**content**: Créer le projet avec Vue CLI en sélectionnant manuellement Babel, Router et Linter. Lancer le serveur de développement avec `pnpm run serve`. L'application est accessible sur http://localhost:8080/.
**step**: 3
**title**: Nettoyer le projet généré
**content**: Supprimer HelloWorld.vue et toutes ses références dans App.vue et HomeView.vue. Retirer les liens vers Vue CLI. Vider HomeView.vue. App.vue ne doit contenir que `<router-view/>`. Vérifier que le projet compile sans erreur ni avertissement.
**step**: 4
**title**: Créer le composant HomePage
**content**: Créer `src/pages/HomePage.vue` avec un simple `<div>` de texte. L'importer dans App.vue et l'afficher dans le template.
**step**: 5
**title**: Créer Header, Footer et BaseLayout
**content**: Créer `src/components/BaseHeader.vue` et `BaseFooter.vue` avec `<style scoped>` (les styles restent locaux au composant, sans risque de conflit). Créer `BaseLayout.vue` qui encapsule header + `<slot/>` + footer, simplifiant App.vue. Intégrer les composants dans App.vue via `<BaseLayout>`.
**step**: 6
**title**: Créer BaseButton avec prop color
**content**: Créer `src/components/BaseButton.vue` encapsulant `<button>` avec styles personnalisés (bordures arrondies, hover/focus, état désactivé). Ajouter une prop `color` acceptant `'primary'`, `'warn'` ou `'danger'`. Utiliser une `computed` property pour appliquer dynamiquement les classes CSS selon la prop. Afficher 4 instances dans HomePage.vue pour illustrer chaque variante. Note : les attributs non déclarés comme prop (class, style, role…) sont automatiquement transmis à l'élément racine unique du composant (« fallthrough attributes » Vue 3).
**step**: 7
**title**: Créer AsyncButton avec gestion de promesse
**content**: Créer `src/components/AsyncButton.vue` basé sur BaseButton. Ajouter une prop `onClick` recevant une fonction retournant une promesse. Gérer localement `isPending` (booléen) pour désactiver le bouton et afficher un indicateur de chargement pendant l'exécution. Utiliser `Promise.resolve(...).finally(() => isPending = false)` pour réactiver le bouton quelle que soit l'issue (résolution ou rejet). Ajouter `inheritAttrs: false` pour contrôler manuellement le transfert des attributs vers le `<BaseButton>` interne (sans quoi ils iraient sur le conteneur racine, pas sur le bouton réel). Dans HomePage.vue, utiliser un compteur `clickCount` pour incrémenter le délai d'attente à chaque clic (+1 seconde par clic).

## Result

Une application Vue 3 fonctionnelle avec une architecture en composants (BaseLayout, BaseHeader, BaseFooter, BaseButton, AsyncButton, HomePage), démontrant le scoped CSS, les props typées, les computed properties, les slots, les fallthrough attributes et la gestion asynchrone de boutons via des promesses.

## Next

- Ajouter la gestion d'état globale avec Pinia
- Implémenter le routing multi-pages avec vue-router
- Explorer les composables Vue 3 (logique réutilisable extraite des composants)
- Ajouter des tests unitaires avec Vitest
