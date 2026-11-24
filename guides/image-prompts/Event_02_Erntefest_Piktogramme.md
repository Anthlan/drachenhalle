# Erntefest: sprachneutrale Handlungsübersicht im DIE-Stil

Werkzeug: integriertes Imagegen; gezielte Bearbeitung des vorhandenen Motivs am 24.11.2026.

Artikelbild für alle Sprachfassungen: `media/knowledge/Events/Event_02_Erntefest.png`.
Identische Fassung zum separaten Teilen: `media/knowledge/Events/Event_02_Erntefest_Piktogramme.png`.

## Stil und Inhalt

Grundlagen: `content/Styleguides/de/DlE-Stil – Tipps.md` und `content/Styleguides/de/DlE-Stil – Allianz-Mitteilungen.md`. Hochformat 2:3, navy-goldener Allianzsaal, Pergament, Altmessing, Drachenrahmen und DIE-Wappen. Keine Sprachtexte; nur Zahlen, Rechenzeichen und DIE.

- Täglich Gratis-Münze, Pass-Aufgaben und Belohnungen abholen.
- Normale Patrouille: ein Würfel, 1–6 Schritte, 1 Münze. Doppelpatrouille: zwei Würfel, 2–12 Schritte, 1 Münze + 60 Diamanten.
- Beim Erreichen oder Überqueren von Start: Belohnungen und Feld-EP von 2–4 zufälligen Feldern. Mehr Strecke ermöglicht häufigere Startboni und schnelleren Feldausbau. Kein Gleichheitszeichen für die Gesamterträge, kein pauschaler 2×-Belohnungsmultiplikator und keine pauschale Empfehlung zugunsten eines Modus.
- Markt: täglich 60 Tickets für 10 goldene Splitter; 100 Tickets für die Deluxe-Truhe mit 5.000 Veredelten Steinen als gewähltem Inhalt.
- Füllhorn: 10 Körbe ergeben 1 persönlichen Punkt; 600 Körbe ergeben 60 Punkte. Für die letzte Serverbelohnung muss zusätzlich der Server-Meilenstein erreicht sein; sie enthält unter anderem 10 goldene Splitter.

## Auflösung und Quellen

Imagegen lieferte 1024 × 1536 Pixel. Die veröffentlichte PNG ist ein 2×-Export mit Lanczos3 auf **2048 × 3072 Pixel**, keine native Generierung in dieser Auflösung.

Native korrigierte Fassung: `.local/work/erntefest/sources/Piktogramme_Startbonus_1024x1536.png`.
Die überholte Grafik mit gleichgesetzten Gesamterträgen bleibt nur lokal unter `.local/work/erntefest/rejected/Piktogramme_ohneStartbonus_2048x3072.png`.

Die zwei Würfel sind durch den Allianz-Screenshot belegt; der Startbonus steht in Regel 4 des Spielscreens `media/knowledge/Events/Event_02_Erntefest_Regeln.jpg`. Der häufigere Startdurchlauf bei gleicher Münzzahl ist eine Folgerung aus der höheren mittleren Würfelstrecke unter Annahme fairer Würfel. Der zusätzliche Ticketertrag ist nicht beziffert.

## Verwendeter Bearbeitungsprompt

```text
Use case: precise-object-edit / infographic-diagram.
Input image 1 is the edit target: the existing language-neutral Harvest Festival strategy sheet for the DIE alliance. Preserve its navy-and-aged-gold fantasy strategy hall style, dragon frame, DIE crest, parchment, composition, sharp pictograms, and portrait 2:3 ratio.

Correct ONLY the SECOND panel, which currently falsely equates the total rewards of single-die and double-die patrol.
Replace that entire panel's information with this accurate compact pictogram diagram:
- Top left: ONE die; cost ONE turkey coin with numeral 1; walking-footstep symbol with range "1–6".
- Top right: TWO dice; cost ONE turkey coin with numeral 1 plus a blue diamond with numeral 60; walking-footstep symbol with range "2–12".
- Bottom of this panel: a prominent circular lap arrow passing a checkered START FLAG, then an arrow to a small group of reward-board tiles labelled "2–4", with a reward star and a rising level arrow. This is the shared rule: every time the start square is reached or passed, receive rewards and tile experience from 2–4 random tiles. Connect the faster two-dice movement to this lap/start-bonus illustration. It means extra travel allows more start bonuses and faster tile development at the extra diamond cost.
- REMOVE the equals sign between total rewards. REMOVE the green check that recommends the single die as equal in total yield. Do NOT show any reward "2x" multiplier or promise twice all rewards. Do NOT show two ordinary landings per double-die turn.
Make this panel readable and uncluttered. It may use both its upper and lower halves.

Keep the other THREE panels completely unchanged:
Top daily panel: calendar/repeat icon -> turkey coin 1 + claim task scroll -> green check.
Market panel: calendar applies to BOTH equations: harvest tickets 60 -> golden shard 10; harvest tickets 100 -> selection chest -> refined stone disc 5000.
Bottom panel: baskets 10 -> abundance medallion 1; baskets 600 -> abundance medallion 60 + completed green five-stage SERVER progress -> golden shard 10.

Only the existing brand "DIE", numerals, mathematical signs and arrows are allowed as text. No language words, no headings, no START or XP lettering. Keep transparent_background false.
Output target 2048 x 3072 pixels, preserving the existing high-resolution presentation and exact 2:3 framing.
```
