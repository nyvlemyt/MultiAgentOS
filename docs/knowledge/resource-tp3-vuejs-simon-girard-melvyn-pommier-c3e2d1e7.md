---
id: resource-tp3-vuejs-simon-girard-melvyn-pommier-c3e2d1e7
slug: resource-tp3-vuejs-simon-girard-melvyn-pommier-c3e2d1e7
source_key: 'sha256:c3e2d1e7a38cab458bc679033bd0c8123504333296915ce122f5cbf0ea1031fb'
part_of: null
order: null
manifest: null
derived_from: 'sha256:c3e2d1e7a38cab458bc679033bd0c8123504333296915ce122f5cbf0ea1031fb'
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
  - vuejs
  - vue3
  - webpack
  - babel
  - eslint
  - composants
  - props
  - slots
  - promesses
  - frontend
domain: développement web
---
# TP3 – VueJS – Simon Girard – Melvyn Pommier

## Goal

Créer une application Vue 3 structurée avec composants réutilisables, props dynamiques, slots et gestion asynchrone, en partant d'un projet Vue CLI vierge.

## Prerequisites

- Node.js et pnpm installés
- Vue CLI installé globalement (@vue/cli)
- Notions de base HTML/CSS/JavaScript
- Compréhension des composants web

## Steps

**title**: Créer le projet Vue CLI
**detail**: Lancer `vue create <nom-projet>` en sélectionnant manuellement Babel, Router et Linter/ESLint. Les paquets (vue, pinia, vue-router, eslint) s'installent localement dans node_modules du projet. @vue/cli lui est installé globalement sur la machine.
**title**: Lancer le serveur de développement
**detail**: Exécuter `pnpm run serve`. Webpack regroupe tous les fichiers .vue, .js, .css en un bundle compréhensible par le navigateur. L'application est accessible sur http://localhost:8080/.
**title**: Nettoyer le projet généré
**detail**: Supprimer HelloWorld.vue et retirer toutes ses références dans App.vue et HomeView.vue. App.vue ne doit contenir que <router-view/>. Le projet doit compiler sans erreur ni avertissement.
**title**: Créer le composant HomePage
**detail**: Créer src/pages/HomePage.vue avec un simple <div> contenant du texte. Importer et afficher ce composant dans App.vue.
**title**: Créer BaseHeader et BaseFooter
**detail**: Créer src/components/BaseHeader.vue et BaseFooter.vue. Les intégrer dans App.vue aux côtés de HomePage. Utiliser <style scoped> pour isoler les styles au composant : ils ne s'appliquent qu'à lui et n'interfèrent pas avec les autres composants.
**title**: Créer BaseLayout avec slot
**detail**: Créer src/components/BaseLayout.vue qui encapsule BaseHeader et BaseFooter avec un <slot/> entre les deux. Simplifier App.vue en utilisant <BaseLayout><HomePage/></BaseLayout>. Le slot insère dynamiquement le contenu enfant sans changer le rendu visuel.
**title**: Créer BaseButton avec styles et prop color
**detail**: Créer src/components/BaseButton.vue encapsulant <button> avec styles personnalisés (couleur, border-radius, hover, focus, état désactivé). Ajouter une prop `color` acceptant les valeurs 'primary', 'warn' ou 'danger'. Utiliser une computed property pour appliquer dynamiquement les classes CSS selon la prop. Afficher quatre instances dans HomePage.vue.
**title**: Créer AsyncButton pour la gestion asynchrone
**detail**: Créer AsyncButton.vue à partir de BaseButton. Ajouter la prop `onClick` (fonction retournant une promesse). Dans handleClick(), envelopper l'appel dans Promise.resolve(...), passer isPending à true pendant l'exécution, afficher ⏳, et utiliser .finally() (pas .then()) pour réactiver le bouton quelle que soit l'issue (résolution ou rejet). Ajouter `inheritAttrs: false` pour contrôler manuellement le transfert des attributs vers BaseButton interne et non vers le conteneur racine.
**title**: Implémenter le délai progressif
**detail**: Dans HomePage.vue, ajouter un compteur clickCount. À chaque clic, incrémenter clickCount et passer une promesse dont le délai est clickCount × 1000 ms. L'utilisateur attend une seconde supplémentaire à chaque clic.

## Result

Une application Vue 3 fonctionnelle avec architecture en composants (BaseLayout, BaseHeader, BaseFooter, BaseButton, AsyncButton, HomePage), styles scopés isolés, props dynamiques pour la couleur des boutons, slots pour la composition, et gestion d'état asynchrone avec désactivation automatique du bouton pendant l'exécution d'une promesse.

## Next

- Ajouter Pinia pour la gestion d'état global
- Configurer Vue Router avec des routes nommées et des paramètres dynamiques
- Explorer les composables (Composition API) pour extraire la logique réutilisable
- Mettre en place des tests unitaires avec Vitest sur les composants créés
