# Mehrsprachige Inhalte

`content` enthält die eigentlichen redaktionellen Quellen der Website. Deutsch (`de`) ist die Hauptfassung; Englisch (`en`), Französisch (`fr`), Russisch (`ru`) und brasilianisches Portugiesisch (`pt`) sind davon abgeleitete Übersetzungen.

## Ablage

Die Sprache ist die letzte Ordnerebene vor der Markdown-Datei:

```text
content/
  Aktuelles/de/, en/, fr/, ru/, pt/
  Allianz/de/, en/, fr/, ru/, pt/
  Drachenwissen/Tipps/de/, en/, fr/, ru/, pt/
  Drachenwissen/Events/de/, en/, fr/, ru/, pt/
  Termine/de/, en/, fr/, ru/, pt/
  Tutorials/de/, en/, fr/, ru/, pt/
```

Der relative Dateiname ist die stabile interne Inhalts-ID. Er bleibt in allen Sprachen gleich und wird nicht als sichtbarer Seitentitel behandelt. Dadurch lassen sich Original und Übersetzungen zuverlässig verbinden, Links prüfen und bestehende URLs weiterleiten. Öffentliche URLs werden unabhängig davon über die Routenregistrierung in `apps/website/src/i18n/routes.mjs` verständlich lokalisiert.

Beispiel:

```text
content/Drachenwissen/Tipps/de/Tipp_01_TruppenEffizientBewegen.md
content/Drachenwissen/Tipps/fr/Tipp_01_TruppenEffizientBewegen.md
```

Beide Dateien beschreiben denselben Inhalt. Der französische Seitentitel, die Navigation und der öffentliche französische Pfad dürfen französisch sein; die technische Inhalts-ID bleibt stabil.

## Pflegeablauf

1. Deutsche Hauptfassung unter `content/<Thema>/.../de/` anlegen oder ändern.
2. Dieselbe Inhalts-ID in allen registrierten Sprachordnern pflegen.
3. Übersetzen: Titel, Zusammenfassungen, Fließtext, Bildbeschreibungen und Ingame-Kopiervorlagen.
4. Unverändert lassen: technische IDs, Rechenwerte, Serverkennungen, Linkziele und die Markdown-Blockstruktur.
5. Neue öffentliche Bereiche oder besonders wichtige Seitennamen in `apps/website/src/i18n/routes.mjs` mit einer stabilen Routen-ID registrieren.
6. `pnpm test` und `pnpm build` in `apps/website` ausführen.

UI-Texte stehen aktuell in den Sprachkatalogen `apps/website/src/i18n/<Sprache>.json`. Platzhalter wie `${count}` müssen in jeder Übersetzung unverändert erhalten bleiben.

## Bilder

Textfreie Bilder und Charaktermodelle werden gemeinsam aus `media` verwendet. Übersetzte Wissensgrafiken liegen neben dem zugehörigen Sprachtext unter `content`. Spielscreenshots bleiben unveränderte Originalaufnahmen; ihre Begleittexte und Alternativtexte werden übersetzt. Bild-Prompts gehören nach `guides/image-prompts`, nicht zwischen die veröffentlichten Inhalte.

## URL- und Kompatibilitätsregeln

- Deutsch bleibt ohne Sprachpräfix unter `/drachenhalle/` erreichbar.
- Übersetzungen verwenden `/drachenhalle/en/`, `/fr/`, `/ru/` und `/pt/`.
- Bereichs- und Werkzeugnamen werden pro Sprache übersetzt.
- Alte URLs mit deutschem Pfad hinter einem Sprachpräfix bleiben als Weiterleitung erhalten.
- Canonical- und `hreflang`-Verweise zeigen auf die tatsächlich lokalisierte URL; Deutsch ist zusätzlich `x-default`.

## Lokale Prüfung

```powershell
cd apps/website
pnpm test
pnpm build
pnpm preview
```

Die zusätzlichen Sprachseiten entstehen beim Produktions-Build. Die reine Astro-Entwicklungsansicht zeigt primär die deutsche Quelle. Der Build prüft die vorhandenen Übersetzungen und ihre Blockstruktur und schreibt je Sprache einen Prüfbericht unter `dist/languages/<Sprache>/translation-report.json`.

Der bebilderte russische Grafik-Audit liegt unter `docs/reports/localization/generated`. Zeiten in Termindaten behalten ihre ursprüngliche Zeitzone; Übersetzungen ändern keine Spielwerte, Koordinaten oder Rechenparameter.
