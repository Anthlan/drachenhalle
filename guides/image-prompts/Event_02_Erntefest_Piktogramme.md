# Erntefest: beschriftete Übersicht in fünf Sprachen

Werkzeug: integriertes Imagegen; Bearbeitung der vorhandenen Startbonus-Grafik am 24.11.2026.

Deutsches Artikelbild: `media/knowledge/Events/Event_02_Erntefest.png`.
Identische Fassung zum separaten Teilen: `media/knowledge/Events/Event_02_Erntefest_Piktogramme.png`.

## Inhalt und Gestaltung

Grundlagen: `content/Styleguides/de/DlE-Stil – Tipps.md` und `content/Styleguides/de/DlE-Stil – Allianz-Mitteilungen.md`. Hochformat 2:3, Navy, gealtertes Gold, Pergament und ein kompakter Drachenkopf. Deutsche Überschriften und erklärende Sätze ergänzen die Ressourcen- und Ablaufsymbole.

- Gratis-Münze sowie die sechs Tagesaufgaben ohne Kauf mit 1.300 Pass-Punkten und 30 Körben.
- Beide Würfelmodi mit Kosten und Schrittbereichen; Startbelohnungen und Feld-EP von 2–4 zufälligen Feldern.
- Mehr Startchancen und schnellerer Feldausbau durch die Doppelpatrouille, ohne pauschalen 2×-Gesamtertrag.
- 10 Sicherheitswert je regulärer Landung; Restwert bleibt erhalten.
- Tagesangebote: 60 Tickets für 10 goldene Universalsplitter; Deluxe-Truhe für 100 Tickets mit 5.000 Veredelten Steinen als wählbarem Inhalt.
- Füllhorn: 600 Körbe insgesamt entsprechen 60 persönlichen Punkten. Die letzte Stufenbelohnung setzt zusätzlich den Server-Meilenstein voraus und enthält unter anderem 10 goldene Universalsplitter.
- Unterschiedliche Laufzeiten von Pass/Füllhorn/Auszeichnung und Patrouille/Markt.

## Sprachfassungen und Auflösung

Die beschriftete deutsche Vorlage liegt auch auf Englisch, Französisch, Russisch und brasilianischem Portugiesisch vor. Die Sprachgrafiken stehen unter `content/Drachenwissen/Events/<Sprache>/Event_02_Erntefest.png` und werden auf den jeweiligen Sprachseiten als Artikel- und Downloadgrafik verwendet. Bildaufbau, Symbole, Zahlen und Bedingungen entsprechen der deutschen Vorlage; die registrierten Artikeltexte bleiben unverändert.

Die vollständigen Bildtexte und die vier verwendeten Imagegen-Prompts sind in [localization/Event_02_Erntefest.json](localization/Event_02_Erntefest.json) dokumentiert.

Imagegen lieferte **1024 × 1536 Pixel**. Der Projekt-Export ist mit Lanczos3 auf **2048 × 3072 Pixel** hochskaliert, keine native Generierung in dieser Auflösung.

Native Fassung: `.local/work/erntefest/sources/Erntefest_Beschriftet_DE_1024x1536.png`.
Native Sprachfassungen: `.local/work/erntefest/sources/Erntefest_Beschriftet_EN.png`, `Erntefest_Beschriftet_FR.png`, `Erntefest_Beschriftet_RU.png` und `Erntefest_Beschriftet_PT.png` im selben Ordner. Die Exportdaten stehen lokal in `localized-labelled-exports.json`.

## Eigene Inhaltsprüfung

Beschriftungen, Münz- und Diamantenkosten, Schrittbereiche, Startbonus, Tagespreise und die doppelte Füllhorn-Voraussetzung stimmen mit dem Guide überein. Die Grafik verspricht weder einen pauschalen doppelten Gesamtertrag noch einen festen zusätzlichen Ticketertrag.
Alle vier Übersetzungen wurden visuell auf vollständige und richtige Beschriftungen geprüft. Insbesondere bleiben die Zusatzkosten von 60 Diamanten, die frei wählbaren 5.000 Steine und beide Voraussetzungen der letzten Füllhorn-Belohnung erhalten.

Für die gemeldete interne Ablehnung wurde keine Begründung mitgeteilt. Eine erneute interne Freigabe ist damit nicht dokumentiert.

## Verwendeter Bearbeitungsprompt

```text
Use case: precise-object-edit / infographic-diagram.
Image 1 is the edit target, our approved-content Harvest Festival overview. Rework it into a clearly LABELLED GERMAN information sheet. Preserve the facts, 2:3 portrait ratio, recognizable turkey coin, diamond, shard, refined stone, basket and cornucopia icons, and the DIE fantasy-alliance identity. The prior image's unlabeled symbols were too unclear.

Audience: our alliance players. Make the content understandable WITHOUT the article. Use a compact dragon crest and the alliance brand "DIE", a modest title, four informative blocks and a small deadline footer. Main text must dominate over decorative frame. Muted deep NAVY, dark wood, aged brass/gold, parchment, ivory high-contrast lettering, warm low candlelight. Reduce the previous neon gold glow. Restrained relief icons with short labels; clean spacious typography, clearly readable on a phone. No characters, no combat scene, no real game UI redrawn, no tiny decorative script, no extra slogans. Use German umlauts correctly.

Render the following German text exactly, with hierarchy and appropriate line wrapping. All text is to be present; do NOT replace these explanations with unlabeled icons:

Header:
"ERNTEFEST"
"Täglich abholen"

Block 1 heading:
"GRATIS & TAGESAUFGABEN"
"1 Gratis-Münze täglich"
"6 Aufgaben ohne Kauf: 1.300 Pass-Punkte + 30 Körbe"

Block 2 heading:
"PATROUILLE & STARTBONUS"
Two side-by-side options:
"NORMAL"
"1 Würfel · 1–6 Schritte"
"1 Münze"
"DOPPELT"
"2 Würfel · 2–12 Schritte"
"1 Münze + 60 Diamanten"
Under both options, show a checkered start flag, a lap arrow and rising tile-level icon, with this shared rule:
"Über Start: Belohnungen + Feld-EP von 2–4 zufälligen Feldern."
"Doppelt ermöglicht mehr Startboni und schnelleren Feldausbau."
"Kein pauschaler 2×-Ertrag."
"10 Sicherheitswert je regulärer Landung. Restwert bleibt erhalten."

Block 3 heading:
"ERNTEMARKT · TÄGLICH"
"60 Tickets → 10 goldene Universalsplitter"
"100 Tickets → Deluxe-Truhe"
"wahlweise 5.000 Veredelte Steine"
"Nur vorhandene Tickets verplanen."

Block 4 heading:
"FÜLLHORN · BEIDE BEDINGUNGEN"
"10 Körbe = 1 Fülle-Punkt"
"600 Körbe gesamt = 60 persönliche Punkte"
"+ Server-Stufe erreicht → letzte Stufenbelohnung"
"Enthält unter anderem 10 goldene Universalsplitter."

Footer:
"FRISTEN PRÜFEN"
"Pass, Füllhorn und Auszeichnung enden vor Patrouille und Markt."

Facts/invariants:
Double patrol costs ONE coin plus 60 diamonds, not two coins. Each turn has one regular landing. There is no promise of twice ALL rewards, and no equals sign equating the total yields of the modes. Extra movement can produce more start crossings and tile development. Both personal contribution AND server progress are required for the final cornucopia milestone. 600 baskets is cumulative, not an additional payment per milestone. 5,000 refined stones are a selectable chest content, not a guaranteed extra.
Deliver crisp high-resolution artwork, ideally 2048x3072 pixels. No transparency.
```
