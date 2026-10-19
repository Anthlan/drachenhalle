# Calendrier

Ce dossier contient les événements affichés sous **Calendrier** Chaque événement est créé comme son propre fichier Markdown.

## Nom du fichier

```text
AAAA_MM_DD_Titre court.md
```

## Modèle

```markdown
---
titre: "Event title"
date: "2026-09-28"
durée: "20:00"
fin: "21:00"
catégorie: "Événement de la fête"
lieu: "Clavardage de la Alliance"
résumé : « Résumé succinct pour l'aperçu du calendrier. »
relative à: "Tipp-07-allianz-hinterhalt, eventankuendigung-hinterhalt"
---

D'autres informations sur l'événement sont disponibles ici.
```

`time`, `end`, `endDate`, `location` et `related` sont facultatives. `endDate` Utilisations `YYYY-MM-DD` et n'est nécessaire que pour les événements se terminant un jour plus tard. Sans le temps, l'événement est affiché comme une journée entière. Le site génère automatiquement une page de détail et un fichier de calendrier pour chaque événement, prêt à importer dans un smartphone, Outlook ou Google Calendrier.

Sous `related`Pour les événements récurrents familiers tels que Embuscade d’alliance, Raid, Zombie Siege et Conquête de la capitale, le générateur ajoute automatiquement les éléments pertinents existants. contenu.
