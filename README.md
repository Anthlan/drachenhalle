# ZRoute – DIE Drachenhalle

Dieses Repository ist die zentrale, strukturierte Sammlung von Inhalten rund um **Z:Route: Redemption** und die Allianz **DIE**. Seine Hauptbereiche entsprechen direkt der Navigation der [Website](https://anthlan.github.io/drachenhalle/).

## Einstieg

- [Archivregeln und Rahmenparameter](ARCHIVREGELN.md)
- [Styleguides](Styleguides/README.md)

Jeder Fachordner enthält eine eigene `README.md` mit seinem Zweck, seiner vorgesehenen Verwendung und den dort geltenden Benennungsregeln.

## Inhalte

| Ordner | Inhalt |
| --- | --- |
| [`Aktuelles`](Aktuelles/README.md) | Manuell gepflegte Neuigkeiten für die Startseite |
| [`Termine`](Termine/README.md) | Kommende und vergangene Allianz-Events mit Detailseite, passenden Wissensinhalten und Kalender-Download |
| [`Galerie`](Galerie/README.md) | Chatbilder, Reaktionsbilder, Avatare und Charaktermodelle |
| [`Drachenwissen`](Drachenwissen/README.md) | Tipps, Strategien und Informationen für den Spiel- und Allianzalltag |
| [`Tutorials`](Tutorials/README.md) | Geführte Schritt-für-Schritt-Anleitungen für wichtige Abläufe |
| [`Allianz`](Allianz/README.md) | Regeln, Offiziere, Verantwortlichkeiten und interne Beratungsunterlagen |
| [`Styleguides`](Styleguides/README.md) | Gestaltungs- und Textregeln für konsistente DIE-Inhalte |
| [`Archiv`](Archiv/README.md) | Ersetzte, veraltete oder historisch relevante Inhalte |
| [`site`](site) | Technische Quellen der automatisch erzeugten Website |

Unter **Tools** stellt die Website kleine interaktive Werkzeuge bereit. Der Schildrechner liest den nächsten Raubzug und eine mögliche parallele Hauptstadteroberung direkt aus den Termindaten und erzeugt auf Wunsch persönliche Kalendererinnerungen. Der Heilrechner wird auf Grundlage von Tipp 8 ergänzt.

## Inhalte einreichen

Allianzmitglieder können Bilder und Dokumente über die [ZRoute Upload-Inbox](https://www.dropbox.com/request/4ha3swzj8zyl4mez6j8g) einreichen. Für den Upload ist kein Dropbox-Konto erforderlich.

Bitte im Dateinamen nach Möglichkeit den eigenen Spielernamen und einen kurzen Inhaltshinweis angeben. Mit dem Upload muss die Aufnahme der Datei in dieses öffentliche Archiv erlaubt sein. Alle Einsendungen werden vor der Übernahme geprüft, passend benannt und in den vorgesehenen Ordner eingeordnet.

### Inbox-Zähler der Website

Der Pages-Workflow zählt zweimal pro Stunde alle Dateien im freigegebenen Dropbox-Inbox-Ordner und zeigt die Anzahl am Inbox-Symbol. Dateinamen oder andere Metadaten werden nicht auf der Website veröffentlicht. Für die Abfrage benötigt das Repository die GitHub-Actions-Secrets `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` und `DROPBOX_REFRESH_TOKEN`. Fehlen sie, wird die Website weiterhin gebaut und das Inbox-Symbol bleibt ohne Zähler.

### Aufrufzahlen der Website

Ein kleiner Cloudflare Worker zählt die Aufrufe jeder veröffentlichten Seite in einer D1-Datenbank und liefert zusätzlich die Gesamtzahl aus. Im Footer werden beide Werte angezeigt. Die Anwendung speichert nur den Seitenpfad und die aggregierten Zählerstände; sie setzt keine Cookies und speichert keine Browser-Kennungen. Die Einrichtung ist unter [`cloudflare/page-views`](cloudflare/page-views/README.md) dokumentiert. Ohne die GitHub-Actions-Variable `PUBLIC_PAGE_VIEWS_API_URL` wird die Website weiterhin normal gebaut; der Zähler bleibt dann ausgeblendet.

## Gestaltungsprinzip

Bei Chat- und Reaktionsbildern werden Verwendungszweck und Darstellungsstil getrennt gepflegt. Chatbilder erzählen Szenen, Reaktionsbilder liefern kurze wiederverwendbare Antworten oder Grüße. Beide Kategorien können unabhängig davon in S1, S2, S3 oder S4 gestaltet sein. Die verbindlichen Vorgaben befinden sich unter [`Styleguides`](Styleguides), die Zuordnung im [`Galerie/STILINDEX.md`](Galerie/STILINDEX.md).

## Projektstatus

Das Repository ist ein fortlaufend gepflegtes Archiv. Neue Inhalte werden nach den dokumentierten Ablage- und Benennungsregeln eingeordnet; veraltete Fassungen werden nachvollziehbar archiviert statt stillschweigend überschrieben. Änderungen bleiben über die Git-Historie nachvollziehbar.

## Hinweis zu Rechten und Zugehörigkeit

Dies ist ein **inoffizielles Fan- und Community-Projekt**. Es besteht keine Verbindung zum Entwickler oder Herausgeber von *Z:Route: Redemption*. Spielnamen, Marken und sonstige geschützte Bestandteile gehören den jeweiligen Rechteinhabern.

Die Veröffentlichung dieses Repositorys erteilt keine allgemeine Erlaubnis zur Weiterverwendung der enthaltenen Texte, Bilder, Avatare oder Charaktermodelle. Soweit nicht ausdrücklich anders angegeben, ist für eine Nutzung außerhalb dieses Projekts die Zustimmung der jeweiligen Urheber beziehungsweise Rechteinhaber erforderlich.
