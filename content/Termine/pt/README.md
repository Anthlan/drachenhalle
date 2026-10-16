# Calendário

Esta pasta contém eventos mostrados abaixo **Calendário** no site. Cada evento é criado como seu próprio arquivo Markdown.

## Nome do arquivo

```text
YYYY_MM_DD_ShortTitle.md
```

## Modelo

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

`time`, `end`, `endDate`, `location` e `related` são opcionais. `endDate` utilizações `YYYY-MM-DD` e é necessária apenas para eventos que terminam num dia posterior. Sem tempo, o evento é exibido como um dia inteiro. O site gera automaticamente uma página de detalhes e um arquivo de calendário para cada evento, pronto para ser importado para um smartphone, Outlook ou Google Calendar.

Sub `related`, inserir colunas separadas por vírgula de dicas existentes, guias de eventos ou anúncios de eventos. Para eventos familiares recorrentes, tais como Alliance Ambush, Raid, Zombie Siege e Capital Conquest, o gerador adiciona automaticamente o conteúdo existente relevante.
