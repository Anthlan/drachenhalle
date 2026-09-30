# Termine

Dieser Ordner enthält die Events, die auf der Website unter **Termine** erscheinen. Jeder Termin wird als eigene Markdown-Datei angelegt.

## Dateiname

```text
YYYY_MM_DD_Kurztitel.md
```

## Vorlage

```markdown
---
title: "Titel des Events"
date: "2026-09-28"
time: "20:00"
end: "21:00"
category: "Allianz-Event"
location: "Allianzchat"
summary: "Kurze Zusammenfassung für die Terminübersicht."
related: "tipp-07-allianz-hinterhalt, eventankuendigung-hinterhalt"
---

Hier stehen weitere Informationen zum Event.
```

`time`, `end`, `endDate`, `location` und `related` sind optional. `endDate` wird im Format `YYYY-MM-DD` nur für Termine benötigt, die an einem späteren Tag enden. Ohne Uhrzeit wird der Termin als ganztägig dargestellt. Zu jedem Termin erzeugt die Website automatisch eine eigene Detailseite und eine Kalenderdatei zum Import in Smartphone, Outlook oder Google Kalender.

Unter `related` können kommagetrennte Slugs vorhandener Tipps, Event-Guides oder Eventankündigungen eingetragen werden. Für wiederkehrende bekannte Ereignisse wie Allianz-Hinterhalt, Raubzug, Zombie-Belagerung und Hauptstadteroberung ergänzt der Generator die bereits vorhandenen passenden Inhalte automatisch.
