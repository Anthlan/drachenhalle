# Interne Ratskarte

Die Ratskarte wird unter `/drachenhalle/rat/karte/` als nicht gelistetes Planungsinstrument erzeugt.

- `gebiete.mask.png` enthält die aus den Bildschirmaufnahmen abgeleitete Grenzgeometrie. Beim Generieren werden durch Beschriftungen und HUD-Elemente entstandene Lücken automatisch geschlossen.
- `GEBIETE.md` hält Stadtlevel, regierende Allianz und eine optionale Planungsfarbe je Gebiet vor.
- `GRENZEN.md` überschreibt automatisch erkannte Gebiete mit bestätigten Eckpunkten aus dem Spiel.

Die Website zeigt ausschließlich Gebiete, deren Eckpunkte in `GRENZEN.md` bestätigt wurden. Die frühere automatisch erkannte Flächenaufteilung dient nur noch als Arbeitsreferenz und wird nicht mehr gerendert. Der aktuelle reduzierte Kartenmodus zeigt nur die bestätigten Gebietsgrenzen und das Stadtlevel. Allianz und Farbe bleiben für einen späteren Planungsschritt gespeichert, werden derzeit aber nicht auf der Karte ausgegeben.

Die schematische Kartenfläche misst exakt `1000 × 1000` Einheiten und verwendet für ihre äußeren Kanten intern die Werte `0` und `1000`. Die im Spiel sichtbaren Positionen reichen weiterhin von `1 × 1` unten links bis `999 × 999` oben rechts. Dadurch liegt der Mittelpunkt exakt bei `500 × 500`; das Zentrumsgebiet reicht von `450 × 450` bis `550 × 550`.

Grenzpunkte werden direkt auf dem ganzzahligen Raster gespeichert. Dabei bezeichnet `83,86` die Ecke zwischen den Feldern X `83/84` und Y `86/87`. So lassen sich die im Modus „Basis versetzen“ sichtbaren Rasterlinien ohne halbe Koordinaten in `GRENZEN.md` übernehmen.

Die erste Grenzerkennung basiert auf den vorhandenen zehn Aufnahmen. Da die Aufnahmen die Spieloberfläche und zwei kleine Übergangslücken enthalten, sollte die Grenzmaske vor strategischer Verwendung visuell geprüft werden.
