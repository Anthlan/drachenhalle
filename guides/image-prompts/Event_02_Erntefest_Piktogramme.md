# Erntefest: sprachneutrale Handlungsübersicht im DIE-Stil

Werkzeug: integriertes Imagegen, Bildgenerierung mit Stilreferenz und anschließende Bearbeitung.

Artikelbild für alle Sprachfassungen: `media/knowledge/Events/Event_02_Erntefest.png`.
Identische Fassung zum separaten Teilen: `media/knowledge/Events/Event_02_Erntefest_Piktogramme.png`.

## Stil und Informationsaufbau

Grundlagen: `content/Styleguides/de/DlE-Stil – Tipps.md` und `content/Styleguides/de/DlE-Stil – Allianz-Mitteilungen.md`. Stilreferenz: `media/knowledge/Events/Event_01_GefechtsvorbereitungFlugbesatzung_Vorratsdepot.png`.

Hochformat 2:3, navy-goldener Allianzsaal, Pergament, Altmessing, Drachenrahmen und DIE-Wappen. Keine Sprachtexte; nur Zahlen, Rechenzeichen und der für alle Sprachen gleiche Allianzname DIE. Vier große Informationsbereiche:

- Täglich Gratis-Münze und Pass-Aufgaben abholen.
- Eine Münze für einen Würfel beziehungsweise eine Münze plus 60 Diamanten für zwei Würfel; gleicher Belohnungsertrag. Neutrale Belohnungssymbole, keine Deluxe-Truhen als garantierter Patrouillenertrag.
- Tagesangebote: 60 Tickets für 10 goldene Splitter; 100 Tickets für die Deluxe-Truhe mit 5.000 Veredelten Steinen als gewähltem Inhalt.
- 10 Körbe ergeben einen persönlichen Fülle-Punkt; 600 Körbe ergeben 60 Punkte. Zusätzlich muss der Server die Stufe erreicht haben; 10 goldene Splitter sind ein bestätigter Bestandteil der letzten Stufenbelohnung.

## Auflösung und Export

Imagegen wurde um 2048 × 3072 Pixel gebeten, lieferte jedoch 1024 × 1536 Pixel. Die veröffentlichte PNG ist ein 2×-Export mit Lanczos3 auf **2048 × 3072 Pixel**. Sie ist keine native Generierung in dieser Auflösung.

Native Stilfassung: `.local/work/erntefest/sources/Piktogramme_DIE_1024x1536.png`.
Korrigiertes Inhaltsschema als Bearbeitungsreferenz: `.local/work/erntefest/sources/Piktogramme_Korrekturschema.png`.
Die zuvor abgelehnte dekorative Fassung bleibt ausschließlich im lokalen Arbeitsbereich erhalten.

## Abschließender Bearbeitungsprompt

```text
Edit target: image 1, the corrected four-panel portrait Harvest Festival infographic.
Reference image 2: visual style of the DIE alliance's established fantasy strategy-room information posters.

Produce the FINAL HIGH-RESOLUTION VERSION at 2048 x 3072 pixels, portrait 2:3, with clean native detail and sharply readable symbols and numerals. Higher resolution is a specific user requirement.

Change ONLY the visual finish to make the DIE alliance identity much more unmistakable. Preserve every infographic instruction, icon relationship, numeral, arrow, equation, panel order and meaning from image 1.

DIE visual identity: a majestic warm candlelit medieval alliance strategy hall, rich DEEP NAVY fabric banners with subtle gold dragon heraldry, age-darkened wood, tooled leather, carefully engraved antique brass and restrained parchment. Cinematic, semi-realistic, noble and mature. The sheet should feel like an official page of the alliance's strategy folio, not a generic game infographic. Emphasize navy and aged gold over bright orange. Stronger fine dragon reliefs in the frame corners and a detailed gilded dragon crest at the top. Add only the short alliance name 'DIE' engraved into the small navy crest plate directly under the dragon; this is a universal brand name. No other words, headings, slogans or letters anywhere. Keep the header compact so all four information panels remain large and readable.

All facts and layout MUST remain unchanged:
Top: daily calendar/sun repeat icon -> turkey coin 1 + checked task list/claiming hand -> green check.
Second: single die costs turkey coin 1 and gives a neutral hand-with-star reward symbol; two dice cost turkey coin 1 + diamond 60 and give the IDENTICAL neutral hand-with-star symbol. Equals sign between the two rewards and green check on the single-die option. Never turn these back into deluxe chests.
Third: daily-market icon applying to BOTH exact equations: harvest tickets 60 -> golden puzzle shard 10; harvest tickets 100 -> optional deluxe chest -> silver refined stone disc 5000.
Fourth: vegetable baskets 10 -> cornucopia-point medallion 1. Below, vegetable baskets 600 -> cornucopia-point medallion 60 + community/server icon with a complete green five-segment progress bar -> golden puzzle shard 10.
Only numerals, mathematical arrows, + and =, and the small DIE crest are allowed as text. Do not add any extra costs, rewards or multipliers.
No post-apocalyptic structures, military depot, glossy plastic, cartoon toy aesthetic, oversized decorative still-life or new characters. Use the reference's authentic fantasy-alliance environment and engraved materials. Make all numbers crisp and legible at the requested 2048x3072 resolution.
```
