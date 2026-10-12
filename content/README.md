# Mehrsprachige Inhalte

Die Textquellen liegen nach Themen geordnet unter `content/`. Die Sprachordner `de/`, `en/` und `ru/` sind jeweils die letzte Ordnerebene direkt vor den Dateien. Gleiche Dateinamen verbinden Original und Übersetzung.

```text
content/
  Aktuelles/de/, en/ und ru/
  Allianz/de/, en/ und ru/
  Allianz/Charakterprofile/de/, en/ und ru/
  Drachenwissen/Tipps/de/, en/ und ru/
  Drachenwissen/Events/de/, en/ und ru/
  Tutorials/de/, en/ und ru/
  Termine/de/, en/ und ru/
```

Deutsch ist die Ausgangssprache. Projektregeln und Bildindizes bleiben an ihren bisherigen zentralen Stellen; deren englische Lesefassungen liegen im entsprechenden Themenordner unter `en/`. Bilder, Charaktermodelle, Zahlen und technische Quellen werden gemeinsam verwendet, damit Dateien nicht für jede Sprache kopiert werden müssen.

Die öffentlichen deutschen URLs bleiben unverändert. Englisch verwendet `/drachenhalle/en/`, Russisch `/drachenhalle/ru/`, jeweils mit demselben Seitenpfad. Die Sprachwahl führt zur entsprechenden Seite der anderen Sprache.

## Neue Inhalte und Sprachen

1. Einen Artikel unter `content/<Thema>/de/` anlegen und die gleiche Datei unter `content/<Thema>/en/` und `content/<Thema>/ru/` übersetzen. Dateinamen, Linkziele, technische Kennungen und Blockstruktur beibehalten. Menschlich lesbare Texte, Titel, Zusammenfassungen, Bildbeschreibungen und Ingame-Kopierversionen übersetzen.
2. UI-Texte stehen in `site/src/i18n/en.json` und `site/src/i18n/ru.json`. Zu jedem deutschen Originaltext gehören seine englische und russische Übersetzung. Platzhalter bleiben erhalten.
3. Weitere Sprachen in `site/src/i18n/config.json` registrieren und gleichnamige Sprachordner innerhalb der Themenordner sowie ein UI-Wörterbuch ergänzen.
4. Den vollständigen Build einschließlich Inhaltsgeneratoren ausführen. Der Build erzeugt Sprachseiten, Metadaten und einen Bericht über die Zuordnung der Übersetzungen.

Deutscher Text innerhalb bestehender Bilder bleibt Teil des Originalbildes. Die englische und russische Fassung übersetzen die begleitenden Texte und Bildbeschreibungen. Neue Bildvarianten können gezielt ergänzt werden.

Die Sprachordner liegen direkt im bestehenden OneDrive-Repository und werden gemeinsam über Git gepflegt. Es gibt keine zweite unabhängige Inhaltskopie außerhalb des Repositorys.

## Lokale Vorschau und Prüfung

Im Ordner `site` erzeugt `pnpm build` die Inhalte und beide Sprachfassungen. Danach stellt `pnpm preview` Deutsch unter `/drachenhalle/` und Englisch unter `/drachenhalle/en/` bereit. Die englischen Seiten entstehen beim statischen Build; die reine Astro-Entwicklungsansicht erzeugt sie nicht.

Der Build prüft, ob alle deutschen Textquellen eine Übersetzung besitzen und die Markdown-Blöcke sowie Textsegmente zusammenpassen. Tabellen, Hervorhebungen und Kopiervorlagen deshalb in derselben Struktur pflegen. Gemeinsame Spielkennungen und Linkziele bleiben stabil. Sprachwahl, Metadaten und interne Seitenlinks werden für jede registrierte Sprache erzeugt; dynamische Ergebnisse verwenden das passende Wörterbuch.


## Russische Fassung

Russisch ist für die gesamte Webseite verfügbar. Alle Inhalte haben eine entsprechende Datei im Sprachordner `ru/` als letzter Ebene. Namen, Modellkennungen, Linkziele und technische Angaben bleiben gemeinsam. Das UI-Wörterbuch steht in `site/src/i18n/ru.json`.

Die bebilderte Prüfung der sprachabhängigen Grafiken liegt unter `site/reports/russian-graphics-audit.html`, die strukturierte Liste daneben als JSON. Rastergrafiken mit deutschem Text verwenden vorerst weiterhin das gemeinsame Original.
