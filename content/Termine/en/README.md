# Calendar

This folder contains events shown under **Calendar** on the website. Each event is created as its own Markdown file.

## Filename

```text
YYYY_MM_DD_ShortTitle.md
```

## Template

```markdown
---
title: "Event title"
date: "2026-09-28"
time: "20:00"
end: "21:00"
category: "Alliance event"
location: "Alliance chat"
summary: "Short summary for the calendar overview."
related: "tipp-07-allianz-hinterhalt, eventankuendigung-hinterhalt"
---

Further event information goes here.
```

`time`, `end`, `endDate`, `location` and `related` are optional. `endDate` uses `YYYY-MM-DD` and is needed only for events ending on a later day. Without a time, the event is displayed as all-day. The website automatically generates a detail page and calendar file for each event, ready to import into a smartphone, Outlook or Google Calendar.

Under `related`, enter comma-separated slugs of existing tips, event guides or event announcements. For familiar recurring events such as Alliance Ambush, Raid, Zombie Siege and Capital Conquest, the generator automatically adds the relevant existing content.
