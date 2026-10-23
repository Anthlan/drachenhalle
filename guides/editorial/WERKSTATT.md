# Versteckter Arbeitsbereich

Die deutsche Werkstatt unter `/drachenhalle/werkstatt/` enthält teilbare Arbeitsstände. Sie wird nicht im Hauptmenü oder in der regulären Galerie verlinkt. Alle Werkstattseiten tragen `noindex, nofollow`; die Lokalisierung lässt den Bereich aus, da Arbeitsmaterial nur auf Deutsch gepflegt wird.

Der Bereich ist wie der Rat ohne Passwortschutz erreichbar. Nicht gelistet bedeutet nicht vertraulich: Jeder mit dem Link kann die Seiten und Bilder abrufen.

## Arbeitsstände ergänzen

- Pro Sichtstand eine datierte Astro-Seite unter `apps/website/src/pages/werkstatt/` anlegen und auf der Werkstatt-Startseite verlinken.
- Zugehörige Bilder unter `apps/website/public/workbench/<stand>/` speichern. Nur die zur Sichtung bestimmten Fassungen übernehmen, keine lokalen Bildaufträge oder verworfenen Varianten.
- Entwurfsstatus und Datum sichtbar nennen. Stabile Sprungmarken pro Figur erlauben das Teilen einzelner Entwürfe.
- Für Freigaben die bestätigten Charaktervorgaben in `guides/image-prompts/Chibi-Manga-Grundmaterial.md` beachten. Korpi92 bleibt archiviert; Skibbi hat zwei normale Beine und seinen kleinen Hasen.
- Die aktuelle Chibi-Runde ist unter `/drachenhalle/werkstatt/chibi-2026-10-22/` erreichbar. Veröffentlicht wird sie mit dem regulären Website-Deployment.
- Die bestätigten Grunddesigns liegen als M3-Modelle unter `media/gallery/Charaktermodelle`. Der ergänzende Sichtstand mit zwölf Posen und Ausdrücken je Figur steht unter `/drachenhalle/werkstatt/chibi-referenzen-2026-10-22/`. Seine Posenbögen bleiben bis zur Freigabe außerhalb der regulären Galerie.
