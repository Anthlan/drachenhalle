# ZRoute – DIE Drachenhalle

Dieses Repository enthält die veröffentlichte Wissensseite der Allianz **DIE** zu *Z:Route: Redemption*. Deutsch ist die redaktionelle Hauptfassung; Englisch, Französisch, Russisch und brasilianisches Portugiesisch werden als Übersetzungen gepflegt.

## Wo liegt was?

| Bereich | Zweck | Wird veröffentlicht? |
| --- | --- | --- |
| [`content`](content/README.md) | Eigentliche Seiteninhalte und sprachabhängige Wissensgrafiken | Ja |
| [`media`](media/README.md) | Sprachneutrale Bilder, Galerie, Karte und historische Medien | Ja |
| [`apps/website`](apps/website/README.md) | Astro-Anwendung, Generatoren, Tests und Build-Konfiguration | Erzeugt die Website |
| [`apps/page-views`](apps/page-views/README.md) | Separater Cloudflare-Worker für Seitenaufrufe | Separater Dienst |
| [`guides`](guides/README.md) | Archivregeln, redaktionelle Bauanleitungen und Bild-Prompts | Dokumentation |
| [`docs`](docs/README.md) | Technische Dokumentation und erzeugte Prüfberichte | Dokumentation |
| `.local`, `tmp`, `.tmp`, `state` | Lokale Importe, Laufzeitstände und temporäre Dateien | Nein, von Git ignoriert |

Damit bleibt die oberste Ebene bewusst klein: `content` und `media` sind die Inhalte, `apps` ist die Technik, `guides` beschreibt die Pflege und `docs` dokumentiert das System.

## Inhalte und Sprachen

Pflegbare Textquellen liegen unter `content/<Thema>/<Sprache>`. Registrierte Sprachcodes sind `de`, `en`, `fr`, `ru` und `pt`. Die deutsche Fassung ist führend. Übersetzungen besitzen dieselbe stabile Inhalts-ID, dürfen aber einen lokalisierten öffentlichen Seitennamen erhalten. Bestehende Links bleiben bei Umbenennungen als Weiterleitungen erhalten.

Die wichtigsten redaktionellen Bereiche sind:

- `Aktuelles`: Neuigkeiten für die Startseite
- `Termine`: kommende und archivierte Allianz-Events
- `Drachenwissen`: Tipps, Strategien, Event-Guides und Auswertungen
- `Tutorials`: Schritt-für-Schritt-Anleitungen
- `Allianz`: Regeln, Offiziere und Verantwortlichkeiten
- `Galerie`: beschreibende Seiten für Avatare, Modelle und Bildsammlungen
- `Styleguides`: veröffentlichte Gestaltungs- und Textregeln
- `Archiv`: historisch relevante, nicht mehr aktuelle Inhalte

Vor Inhaltsänderungen gelten die [Archivregeln](guides/editorial/ARCHIVREGELN.md). Die technische Sprachstruktur ist in der [Inhaltsdokumentation](content/README.md) beschrieben.

## Lokale Entwicklung

```powershell
cd apps/website
pnpm install
pnpm dev
```

Tests und vollständiger Produktions-Build:

```powershell
cd apps/website
pnpm test
pnpm build
```

GitHub Pages baut ausschließlich `apps/website`. Die Generatoren lesen veröffentlichte Inhalte aus `content` und Medien aus `media`.

## Inhalte einreichen

Allianzmitglieder können Bilder und Dokumente über die [ZRoute Upload-Inbox](https://www.dropbox.com/request/4ha3swzj8zyl4mez6j8g) einreichen. Für den Upload ist kein Dropbox-Konto erforderlich. Einsendungen werden vor der Übernahme geprüft, passend benannt und einem veröffentlichten Bereich zugeordnet. Lokale Importordner werden nicht eingecheckt.

## Dienste und Datenschutz

Der Pages-Workflow kann die Zahl der Dateien in der Dropbox-Inbox anzeigen. Dafür werden die Secrets `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` und `DROPBOX_REFRESH_TOKEN` verwendet. Ohne diese Secrets baut die Website weiterhin.

Der optionale Worker unter [`apps/page-views`](apps/page-views/README.md) zählt ausschließlich Seitenpfade und aggregierte Aufrufzahlen. Er setzt keine Cookies und speichert keine Browser-Kennungen. Ohne `PUBLIC_PAGE_VIEWS_API_URL` bleibt der Zähler ausgeblendet. Cloudflare Web Analytics kann zusätzlich über `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` aktiviert werden.

## Hinweis zu Rechten und Zugehörigkeit

Dies ist ein **inoffizielles Fan- und Community-Projekt** ohne Verbindung zum Entwickler oder Herausgeber von *Z:Route: Redemption*. Spielnamen, Marken und sonstige geschützte Bestandteile gehören den jeweiligen Rechteinhabern. Die Veröffentlichung dieses Repositorys erteilt keine allgemeine Erlaubnis zur Weiterverwendung der enthaltenen Texte, Bilder, Avatare oder Charaktermodelle.
