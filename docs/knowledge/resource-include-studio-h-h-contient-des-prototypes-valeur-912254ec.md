---
id: resource-include-studio-h-h-contient-des-prototypes-valeur-912254ec
slug: resource-include-studio-h-h-contient-des-prototypes-valeur-912254ec
source_key: 'sha256:912254ec7b4169598db94da1aceb915110bd0aaaa8e04f889855971987aa577a'
part_of: null
order: null
manifest: null
derived_from: 'sha256:912254ec7b4169598db94da1aceb915110bd0aaaa8e04f889855971987aa577a'
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
  - C
  - langage-C
  - pointeurs
  - structs
  - types-de-données
  - fonctions
  - apprentissage
domain: programmation-systèmes
---
# include <studio.h> // .h contient des prototypes, valeur

## Summary

Aide-mémoire C couvrant les 4 couches à maîtriser pour apprendre un langage rapidement : types de base, structures de contrôle, types composés, fonctions — illustré par des extraits C canoniques (printf, passage par pointeur, struct sur pile et sur tas).

## Fields/API

**name**: Roadmap d'apprentissage universelle
**description**: Ordre recommandé pour tout langage : (1) types de base + opérations CRUD sur la donnée, (2) conditions et boucles, (3) types composés (struct/class), (4) fonctions/méthodes — puis héritage, polymorphisme, liaison dynamique.
**name**: Types de base en C
**description**: int, float, double, char. Déclaration globale en dehors de main(), locale à l'intérieur. Chaîne = tableau de char : char ch[10] = "salut";
**name**: printf et spécificateurs de format
**description**: %c = char, %s = chaîne (char*), %d = int. Référence complète via : man printf (Linux/macOS).
**name**: Passage par valeur vs. par pointeur
**description**: Par valeur : void f1(int a) — copie locale, l'original est inchangé. Par pointeur : void f1(int *a) / (*a)++ — modifie directement la valeur à l'adresse. Appel : f1(&x).
**name**: Struct — pile vs. tas
**description**: Sur pile : struct personne p1; p1.age = 30; Accès avec '.'. Sur tas : struct personne *p2; p2 = malloc(sizeof(struct personne)); Accès avec '->' (équivalent de (*p2).age).
**name**: #include <stdio.h>
**description**: Les fichiers .h contiennent les prototypes de fonctions (déclarations). stdio.h expose printf, scanf, etc. Note : la source écrit « studio.h » — c'est une coquille pour stdio.h.

## Constraints

- La source contient « studio.h » : corriger en stdio.h partout.
- L'initialisation char ch[10] = 'salut' doit utiliser des guillemets doubles : "salut".
- malloc nécessite #include <stdlib.h> en plus de stdio.h.
- p2 = malloc(sizeof(struct personne)) — ne pas oublier de libérer avec free(p2).
- Le passage par pointeur avec (*a)++ nécessite de déréférencer avant l'incrémentation pour éviter d'incrémenter l'adresse plutôt que la valeur.

## Examples

**label**: Hello world avec types de base
**code**: #include <stdio.h>
int x = 5;
int main() {
  char c = 'a';
  char ch[10] = "salut";
  if (c == 'a') { printf("hello %c %s %d\n", c, ch, x); }
  return 0;
}
**label**: Passage par pointeur
**code**: void f1(int *a) { (*a)++; }
// Appel :
f1(&x);  // x est modifié directement
**label**: Struct sur pile et sur tas
**code**: struct personne { int age, nss; char nom[50]; };
// Pile :
struct personne p1; p1.age = 30;
// Tas :
struct personne *p2 = malloc(sizeof(struct personne));
p2->age = 30;
free(p2);
