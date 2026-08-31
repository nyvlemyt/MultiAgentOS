---
id: resource-ou-protected-18a4703d
slug: resource-ou-protected-18a4703d
source_key: 'sha256:18a4703d356f914bc78de1e76be8dcf561021668dc91ec1a257dda7557bdbc66'
part_of: null
order: null
manifest: null
derived_from: 'sha256:18a4703d356f914bc78de1e76be8dcf561021668dc91ec1a257dda7557bdbc66'
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
doc_type: reference
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - UML
  - système d'information
  - architecture SI
  - modélisation
  - codification
  - diagrammes UML
  - client-serveur
  - SOA
domain: ingénierie logicielle
---
# ou {protected},

## Summary

Cours d'introduction aux Systèmes d'Information (SI) couvrant trois grands blocs : (1) la théorie des SI — décomposition SO/SP/SI, définitions (Rolland, Reix), quatre fonctions (collecter, mémoriser, traiter, diffuser), cycle de développement en trois phases (analyse 25 %, conception-réalisation 55 %, mise en œuvre 20 %), architectures (client/serveur 2-tiers, 3-tiers/N-tiers, distribuée, SOA/WOA) ; (2) la codification de l'information — définition, objectifs (unicité, gain espace/temps, contrôle de forme), cinq types (séquentielle, par tranches, articulée, hiérarchique/niveau, mnémonique) ; (3) UML 2.0 — raison d'être de la modélisation, historique (OMT+Booch+OOSE → UML 1.0 1997 → 2.0 2005), outils AGL, et catalogue des diagrammes : cas d'utilisation (acteurs, relations include/extend/généralisation, scénarios), structure statique (classes, objets, structure composite), interactions (séquences avec opérateurs alt/opt/loop/break/critical/ref, collaboration), états-transitions (états composés, concurrents, historique, gardes), activités (couloirs, signaux, jetons UML 2), diagramme de temps, déploiement (composants, nœuds).

## Fields/API

**name**: Système Opérant (SO)
**description**: Moyens humains/matériels/organisationnels qui exécutent les tâches constituant la finalité du système global.
**name**: Système de Pilotage (SP)
**description**: Prend les décisions, fixe les objectifs ; 'système nerveux' de l'entreprise.
**name**: Système d'Information (SI)
**description**: Intermédiaire SO↔SP et organisation↔environnement. Acquiert, traite, stocke et diffuse des informations (données, textes, images, sons).
**name**: Quatre fonctions du SI
**description**: 1. Collecter (sources internes + externes, filtrage qualité) ; 2. Mémoriser (fichiers, BDD, entrepôts) ; 3. Traiter (rechercher, trier, mettre à jour, produire) ; 4. Diffuser (SO ↔ SP ↔ environnement).
**name**: Cycle de développement d'un SI
**description**: Phase 1 — Analyse (25 %) : opportunité, faisabilité, cahier des charges. Phase 2 — Conception & Réalisation (55 %) : architecture fonctionnelle + BDD + code + tests. Phase 3 — Mise en œuvre (20 %) : basculement, formation, maintenance.
**name**: Architectures SI
**description**: Client/serveur 2-tiers (middleware : CORBA, ODBC…) ; 3-tiers (présentation / métier / accès données) ; N-tiers (couche métier découpée) ; Distribuée (CORBA, RMI, .NET Remoting) ; SOA 4-tiers (services publiés via annuaire) ; WOA (Web comme bus de services).
**name**: Codification — types
**description**: Séquentielle (0101, 0102…) ; Par tranches (plages par catégorie) ; Articulée (descripteurs, ex. numéro + année + catégorie) ; Hiérarchique/niveau (cas particulier articulée, arborescente) ; Mnémonique (consonants : FCTR ; abréviatif : FACT).
**name**: Information — modèle
**description**: Triplet : Entité (concept) + Attribut (caractéristique) + Valeur (occurrence). Ex. Employé / Nom / Nilson.
**name**: UML 2.0 — catalogue des diagrammes
**description**: Structure statique : classes, objets, structure composite, paquetages. Interactions : séquences (alt/opt/loop/break/critical/ref), collaboration. Comportement : états-transitions (composés, concurrents, historique, gardes, souche), activités (couloirs, signaux, jetons), diagramme de temps. Déploiement : composants, nœuds.
**name**: Diagramme de cas d'utilisation
**description**: Acteurs (rôle, pas forcément une personne), cas d'utilisation (fonctionnalité vue de l'extérieur). Relations : communication, inclusion (<<include>>), extension (<<extend>>), généralisation. Scénarios = instances de cas (primaires + secondaires).
**name**: Diagramme de classes — concepts clés
**description**: Classe (attributs : visibilité nom:type=défaut ; opérations : visibilité nom(args):type) ; Association (binaire, n-aire, réflexive, classe-association, navigabilité, multiplicité, rôles, visibilité) ; Agrégation (faible) vs Composition (forte) ; Généralisation/Spécialisation ; Classe abstraite ; Interface.
**name**: Diagramme d'états-transitions — syntaxe
**description**: Transition : événement [garde] / action. Types d'événements : appel d'opération, signal, durée (after(2s)), condition (when(var=3)). Actions entry/ exit/ do/ (activité interne). États composés, concurrents (swim lanes), historique (H, H*).
**name**: Outils UML (AGL)
**description**: Rational Software Architect, WhiteStarUML, Enterprise Architect, Visual Paradigm, Microsoft Visio.

## Constraints

- UML est un langage de modélisation, pas une méthode d'analyse.
- Une responsabilité ne doit pas être répartie sur plusieurs classes (règle CRC).
- Hiérarchie de classes : 2-3 niveaux acceptable, 10+ excessif.
- Codification articulée : risque de saturation des descripteurs et d'instabilité si une caractéristique de l'objet change.
- Codification séquentielle : non significative et impossible d'insertion.
- Tout attribut dérivé est une opération sans argument (notation : /nomAtr).
- Une classe abstraite contient au moins une opération abstraite et ne peut être instanciée.
- Dans UML 2.0, une Action est atomique ; une Activité est composée d'actions, nœuds de contrôle, nœuds d'objets et flèches.

## Examples

- Codification SIRET : identifie un établissement (code articulé, unique, gain espace/temps).
- Code étudiant à 8 chiffres : contrôle de forme — tout code ≠ 8 chiffres est rejeté.
- Association Professor–Course : 'Philippe enseigne le cours UML' → lien entre instances → association 'enseigne'.
- Agrégation School–Student : un étudiant peut appartenir à plusieurs écoles, cycle de vie indépendant.
- Composition School–Department : un département n'existe que dans une seule école, cycle de vie lié.
- Scénario GAB : acteurs = Porteur de carte, Client de la banque, Technicien (rechargement) ; cas = Distribuer argent, Consulter solde, Déposer chèque, Sécuriser transaction.
- Diagramme de séquence — opérateur alt : équivalent SI…ALORS…SINON pour modéliser deux comportements possibles.
- Diagramme d'activités — mousse au chocolat : actions parallèles (fork) pour fondre le chocolat ET séparer les œufs.
