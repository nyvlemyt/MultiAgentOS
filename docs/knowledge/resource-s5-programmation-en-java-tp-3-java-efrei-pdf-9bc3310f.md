---
id: resource-s5-programmation-en-java-tp-3-java-efrei-pdf-9bc3310f
slug: resource-s5-programmation-en-java-tp-3-java-efrei-pdf-9bc3310f
source_key: 'sha256:9bc3310f4bc44247b2172fa8d3fb073e3ea981867b6052e42049a4f7ddcb8a50'
part_of: S5 - Programmation en Java
order: 4
manifest: null
derived_from: 'sha256:9bc3310f4bc44247b2172fa8d3fb073e3ea981867b6052e42049a4f7ddcb8a50'
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
  - java
  - poo
  - héritage
  - encapsulation
  - polymorphisme
  - static
  - constructeurs
  - efrei
domain: programmation-java
---
# S5 - Programmation en Java — TP 3 JAVA EFREI.pdf

## Goal

Maîtriser les bases de la POO Java — encapsulation, héritage, polymorphisme, attributs statiques et constantes — à travers trois exercices progressifs (Personne→Programmeur, Vehicule→Avion, comptage statique).

## Prerequisites

- Environnement Java installé (JDK) avec un IDE (Eclipse/IntelliJ)
- Notions de variables, méthodes et packages Java
- Connaissance de la classe Scanner pour les entrées console

## Steps

**step**: 1
**title**: Exercice 1 — Classe de base Personne
**detail**: Créer un package 'lsiHeritage'. Y définir la classe Personne avec les attributs privés nom (String), prenom (String), anNaissance (int). Ajouter : un constructeur paramétré (nom, prénom, anNaissance), d'éventuels constructeurs supplémentaires, la méthode calculerAge() retournant 2024 - anNaissance, la méthode afficher() affichant 'Nom : xxx, Prénom : xxx, Age : xxx'. Dans une classe Start séparée, instancier 2 objets Personne, appeler afficher() et calculerAge(). Tenter d'accéder aux attributs depuis Start → constater le refus (private). Ajouter les getters et setters nécessaires.
**step**: 2
**title**: Exercice 2 — Sous-classe Programmeur
**detail**: Créer Programmeur extends Personne avec les attributs propres salaire (float), prime (float), pseudo (String). Implémenter 4 constructeurs : Programmeur() vide, Programmeur(salaire, prime), Programmeur(salaire, prime, pseudo), Programmeur(tous paramètres — appelle super() pour nom/prénom/anNaissance). Observer l'obligation d'appeler super() en première instruction. Ajouter afficher() (informations propres au Programmeur) et getSalaire() retournant salaire + prime. Répondre aux questions de réflexion : usage simultané de super et this, toString() et sa redéfinition. Finaliser avec la saisie console via Scanner (nom, prénom, anNaissance, pseudo, salaire, prime) et afficher le résultat attendu ('BIENVENUE !, Nom, Prénom, Pseudo, Age, Salaire total').
**step**: 3
**title**: Exercice 3-I — Classe Vehicule
**detail**: Créer Vehicule avec nbRoues (int) et estComplet (boolean). Constructeur à un paramètre (nbRoues) : estComplet initialisé à false. Méthodes : roule() affichant '(false/true) Les N roues tournent.', freine() affichant 'J'appuie sur le frein.', accesseur isEstComplet(), méthode invComplet() inversant estComplet.
**step**: 4
**title**: Exercice 3-II — Sous-classe Avion
**detail**: Créer Avion extends Vehicule avec nbReact (int). Constructeur(nbRoues, nbReact) appelant super(nbRoues). Méthodes : vole() affichant 'Je vole.', freine() redéfinie affichant 'J'inverse les N réacteurs.' puis appel super.freine(), roule() redéfinie affichant conditionnellement 'Je pousse les réacteurs.' si isEstComplet() est true, puis appel super.roule(). Utiliser l'accesseur (pas l'attribut direct) pour éviter le problème d'accès à un attribut privé hérité.
**step**: 5
**title**: Exercice 3-III — Classe Utilisation et polymorphisme
**detail**: Créer la classe Utilisation avec une méthode statique essai(). Instancier Vehicule(6), appeler roule() et freine(). Instancier Avion(4, 2), appeler invComplet() pour le rendre complet, puis roule(), vole(), freine(). Déclarer une référence Vehicule pointant sur Avion(8, 4) : appeler roule() (dispatching dynamique), constater qu'on ne peut pas appeler vole() sans cast, réaliser le downcast en Avion, puis vole() et freine(). Vérifier les affichages attendus.
**step**: 6
**title**: Exercice 3-IV — Comptage statique
**detail**: Ajouter dans Vehicule un attribut static int aNombre. Initialiser via un bloc static { aNombre = 0; } (this.aNombre n'a pas de sens car static n'est pas lié à une instance). Incrémenter dans chaque constructeur. Ajouter un accesseur statique getNombre(). Dans Utilisation, afficher aNombre aux 4 points clés pour observer son évolution. Comprendre qu'un seul compteur existe pour toute la classe, partagé par toutes les instances.
**step**: 7
**title**: Exercice 3-V — Constante statique finale
**detail**: Ajouter dans Vehicule : private static final int MIN_ROUES = 2; (convention SCREAMING_SNAKE_CASE). Dans le constructeur, s'assurer que nbRoues >= MIN_ROUES (sinon forcer à MIN_ROUES ou lever une exception). Si la constante est utile hors de la classe, la déclarer public — pas de risque car final. L'accéder depuis une autre classe via Vehicule.MIN_ROUES. Toujours utiliser la constante nommée et ne plus coder la valeur en dur.

## Result

Trois hiérarchies de classes Java fonctionnelles illustrant : encapsulation (private + getters/setters), héritage (extends + super), surcharge et redéfinition de méthodes, polymorphisme (référence parent pointant sur objet enfant + downcast), attributs et blocs statiques, constantes final static, et saisie utilisateur via Scanner.

## Next

- Introduire les classes abstraites et les interfaces Java
- Explorer les collections génériques (ArrayList, HashMap) pour gérer des listes de Personne/Programmeur
- Découvrir les exceptions (try/catch) pour sécuriser les saisies Scanner et le constructeur de Vehicule
