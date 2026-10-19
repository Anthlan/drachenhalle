# Conseils

Ce dossier rassemble des articles de connaissances détaillées sur les conseils d'alliance. Les fichiers Markdown peuvent et devraient fournir plus de contexte qu'une annonce d'alliance compacte ou une illustration: mécanique, application, exemples travaillés, limitations, ouvert questions et autres sources.

Entreposez des textes et des illustrations directement ici avec le même nom de base sans ambiguïté.

Le dessin d'illustration suit la fixation [`DIE style – Tips`](../../../../Styleguides/DlE-Stil%20%E2%80%93%20Tipps.md) directive.

## Métadonnées et filtres

Chaque fichier de pointe commence par la première matière. Maintenez les deux groupes d'attributs séparément; le site Web les utilise pour les cartes, les pages de détail et le filtrage combiné:

```yaml
---
- Oui.
  - Les
  - Stratégie
les hommes:
  - Kampf
  - Allianz
---
```

- Valeurs autorisées pour **Type**: `Anleitung`, `Strategie`, `Optimierung`
- Valeurs autorisées pour **Thème**: `Allianz`, `Events`, `Kampf`, `Truppen`, `Aufbau`, `Weltkarte`

Chaque astuce nécessite au moins une valeur de chaque groupe. La première est seulement des métadonnées et n'est pas affichée comme contenu d'article.

## Structure du fichier de pointe

Chaque fichier Markdown contient la page de connaissances complète. En option, ajoutez une version courte immédiatement avant l'explication détaillée:

```markdown
## Points clés en un coup d'oeil
```

Si cette section existe, le site web offre automatiquement **,Court & concis,** et **,Détaillé,** vue. La vue courte contient seulement cette section et le graphique de pointe. La vue détaillée commence à `## What is this tip for?` et comprend toutes les sections suivantes, y compris les sources et l'annonce d'alliance copiable. Il reste exactement un fichier Markdown par tip.

Le cas échéant, la page de connaissances détaillée devrait contenir ces sections:

1. **À quoi sert cette astuce ?** – but, avantages et situations appropriées.
2. **Mécanique et instructions** – le mécanicien et un processus compréhensible.
3. **Exemples et contexte** – calculs, variantes ou soutien à la décision.
4. **Limites et questions ouvertes** – risques, déclarations de version dépendantes et détails encore à vérifier.
5. **Sources et fiabilité** – des preuves en jeu, des sources externes dignes de confiance et un statut d'examen.
6. **Annonce de l'Alliance à copier** – le texte complet dans le jeu dans un `html` bloc de code, non-rayé et directement copiable.

Le bloc HTML conserve la substance du texte approuvé dans le jeu inchangé. Des informations supplémentaires sont incluses dans l'article de connaissance, non pas non-cochées dans l'annonce d'alliance.

Si possible, vérifier les informations externes en ligne et y faire directement un lien. Les déclarations communautaires doivent pouvoir être recomposées en tant que telles.

## Règles de désignation

- Modèle & #160;: `Tipp_XX_Kurztitel.extension`, par exemple `Tipp_01_Ueberfall.md` et `Tipp_01_Ueberfall.png`.
- Le numéro à deux chiffres correspond au numéro de pointe du contenu et est attribué consécutivement.
- Le titre court décrit la pointe brièvement et clairement. Utilisez un boîtier mixte lisible sans espaces; les umlauts allemands sont écrits comme `Ae`, `Oe`, `Ue` et `ss`.
- Les textes, fichiers HTML et illustrations associés doivent partager exactement le même nom de base.
- Les extensions de fichiers sont minuscules. `README.md` est exempté de ce schéma de nommage de contenu.
