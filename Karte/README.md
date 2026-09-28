# Interne Ratskarte

Die Ratskarte wird unter `/drachenhalle/rat/karte/` als nicht gelistetes Planungsinstrument erzeugt.

- `Kartenbasis.webp` enthält die aus den zehn Bildschirmaufnahmen zusammengesetzte, neutralisierte Kartenbasis.
- `gebiete.mask.png` enthält die technisch erkannten Gebietsflächen.
- `GEBIETE.md` steuert die sichtbaren Namen, Farben und optionalen Notizen.

Die Nummern sind fest mit der Grenzmaske verbunden. Für redaktionelle Änderungen genügt es daher, die Tabelle in `GEBIETE.md` zu bearbeiten. Die Seite nutzt das Spielkoordinatensystem mit `1 × 1` unten links und `999 × 999` oben rechts.

Die erste Grenzerkennung basiert auf den vorhandenen zehn Aufnahmen. Da die Aufnahmen die Spieloberfläche und zwei kleine Übergangslücken enthalten, sollte die Grenzmaske vor strategischer Verwendung visuell geprüft werden.
