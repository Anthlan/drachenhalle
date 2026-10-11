# Mehrsprachige Inhalte

Die Textquellen liegen nach Themen geordnet unter `content/`. Die Sprachordner `de/` und `en/` sind jeweils die letzte Ordnerebene direkt vor den Dateien. Gleiche Dateinamen verbinden Original und Übersetzung.

```text
content/
  Aktuelles/de/ und en/
  Allianz/de/ und en/
  Allianz/Charakterprofile/de/ und en/
  Drachenwissen/Tipps/de/ und en/
  Drachenwissen/Events/de/ und en/
  Tutorials/de/ und en/
  Termine/de/ und en/
```

Deutsch ist die Ausgangssprache. Projektregeln und Bildindizes bleiben an ihren bisherigen zentralen Stellen; deren englische Lesefassungen liegen im entsprechenden Themenordner unter `en/`. Bilder, Charaktermodelle, Zahlen und technische Quellen werden gemeinsam verwendet, damit Dateien nicht für jede Sprache kopiert werden müssen.

Die öffentlichen deutschen URLs bleiben unverändert. Englisch verwendet `/drachenhalle/en/` mit demselben Seitenpfad. Die Sprachwahl führt zur entsprechenden Seite der anderen Sprache.

## Neue Inhalte und Sprachen

1. Einen Artikel unter `content/<Thema>/de/` anlegen und die gleiche Datei unter `content/<Thema>/en/` übersetzen. Dateinamen, Linkziele, technische Kennungen und Blockstruktur beibehalten. Menschlich lesbare Texte, Titel, Zusammenfassungen, Bildbeschreibungen und Ingame-Kopierversionen übersetzen.
2. UI-Texte stehen in `site/src/i18n/en.json`. Zu jedem deutschen Originaltext gehört seine englische Übersetzung. Platzhalter bleiben erhalten.
3. Weitere Sprachen in `site/src/i18n/config.json` registrieren und gleichnamige Sprachordner innerhalb der Themenordner sowie ein UI-Wörterbuch ergänzen.
4. Den vollständigen Build einschließlich Inhaltsgeneratoren ausführen. Der Build erzeugt Sprachseiten, Metadaten und einen Bericht über die Zuordnung der Übersetzungen.

Deutscher Text innerhalb bestehender Bilder bleibt Teil des Originalbildes. Die englische Fassung übersetzt die begleitenden Texte und Bildbeschreibungen. Neue Bildvarianten können gezielt ergänzt werden.

Die Sprachordner liegen direkt im bestehenden OneDrive-Repository und werden gemeinsam über Git gepflegt. Es gibt keine zweite unabhängige Inhaltskopie außerhalb des Repositorys.

## Lokale Vorschau und Prüfung

Im Ordner `site` erzeugt `pnpm build` die Inhalte und beide Sprachfassungen. Danach stellt `pnpm preview` Deutsch unter `/drachenhalle/` und Englisch unter `/drachenhalle/en/` bereit. Die englischen Seiten entstehen beim statischen Build; die reine Astro-Entwicklungsansicht erzeugt sie nicht.

Der Build prüft, ob alle deutschen Textquellen eine Übersetzung besitzen und die Markdown-Blöcke sowie Textsegmente zusammenpassen. Tabellen, Hervorhebungen und Kopiervorlagen deshalb in derselben Struktur pflegen. Gemeinsame Spielkennungen und Linkziele bleiben stabil. Sprachwahl, Metadaten und interne Seitenlinks werden für jede registrierte Sprache erzeugt; dynamische Ergebnisse verwenden das passende Wörterbuch.
