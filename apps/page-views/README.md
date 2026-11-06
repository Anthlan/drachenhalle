# Cloudflare-Aufrufzähler

## Gemeinsamer Kartenplan

Der bestehende Worker stellt zusätzlich `GET /api/season-plan` und `POST /api/season-plan` bereit. Der Plan wird dauerhaft in derselben D1-Datenbank in einer eigenen Tabelle `season_plans` gespeichert. Gespeichert werden Feldadressen, Allianzzuordnungen, Notizen, Versionsnummer und Änderungszeitpunkt.

Lesen ist von den konfigurierten Website-Ursprüngen aus ohne Anmeldung möglich. Schreiben erfordert den geheimen Bearbeitungsschlüssel `SEASON_PLAN_EDIT_TOKEN` im Authorization-Header. Ein Bearbeitungslink trägt diesen Schlüssel im URL-Fragment `#edit=…`; die Website übernimmt ihn in den Sitzungsspeicher und entfernt ihn aus der Adresszeile. Schlüssel niemals in Git, öffentliche Leselinks oder Build-Variablen aufnehmen.

Die Website verwendet `PUBLIC_PLAN_API_URL`, alternativ die bestehende Variable `PUBLIC_PAGE_VIEWS_API_URL`. Die Variable enthält nur die Worker-Basisadresse. Ohne konfigurierte API bleibt der lokale Planer verfügbar. Der normale Link öffnet den gemeinsamen Plan lesend, der Bearbeitungslink aktiviert die Bearbeitung. Bestehende `#plan=…`-Links öffnen weiterhin eine lokale Momentaufnahme.

Nach Änderungen am Worker erneut bereitstellen. Einmalig einen mindestens 32 Zeichen langen Zufallsschlüssel über `wrangler secret put SEASON_PLAN_EDIT_TOKEN` hinterlegen. Der lokal erzeugte Bearbeitungslink liegt unter `.local/work/Politics/Kartenplan_Bearbeitungslink.txt` und wird nicht veröffentlicht. Bei einer Schlüsselrotation werden alte Links ungültig.

Die Browser aktualisieren den Plan alle fünf Sekunden, solange die Seite sichtbar ist. Aktualisierungen schreiben nur die geänderten Felder und verwenden eine atomare Versionsprüfung. Bei Konflikten werden die aktuellen Serverdaten geladen und ausstehende eigene Änderungen erneut versucht; bei Änderungen am selben Feld gilt die zuletzt erfolgreich gespeicherte Bearbeitung. Verbindungsprobleme werden sichtbar angezeigt, ausstehende Änderungen bleiben bis zur nächsten erfolgreichen Speicherung vorgemerkt. Vor dem Schließen mit ungespeicherten Änderungen warnt der Browser. Bei einem neu eingerichteten leeren Serverplan kann ein Bearbeiter über „Lokalen Plan übernehmen“ seinen bisherigen Browserplan einmalig übernehmen; alternativ steht der JSON-Import zur Verfügung.

Der Worker zählt Aufrufe pro Seite atomar in einer Cloudflare-D1-Datenbank. Die Anwendung schreibt nur Seitenpfad, Zählerstand und Änderungszeitpunkt in D1; sie setzt keine Cookies und speichert keine Browser-Kennungen. Ein erneutes Laden zählt als neuer Seitenaufruf, die Werte sind daher keine eindeutigen Besucherzahlen. Cloudflare verarbeitet die Anfrage als Infrastrukturbetreiber nach den für das Cloudflare-Konto geltenden Einstellungen.

## Einmalig bereitstellen

Voraussetzung ist ein Cloudflare-Konto. Im Verzeichnis `apps/page-views`:

```powershell
pnpm install
pnpm exec wrangler login
pnpm deploy
```

Wrangler legt die D1-Datenbank beim ersten Deployment automatisch an und gibt anschließend eine URL wie `https://drachenhalle-page-views.<konto>.workers.dev` aus. Die Tabelle wird beim ersten Aufruf automatisch erzeugt.

Danach im GitHub-Repository unter **Settings → Secrets and variables → Actions → Variables** die Repository-Variable `PUBLIC_PAGE_VIEWS_API_URL` mit dieser Worker-URL anlegen. Beim nächsten Pages-Deployment wird der Zähler im Footer aller Seiten eingeblendet.

Für eine abweichende Domain muss `ALLOWED_ORIGINS` in `wrangler.jsonc` ergänzt und der Worker erneut veröffentlicht werden.

## Lokal prüfen

```powershell
pnpm test
pnpm dev
```

Die lokale Website darf laut Voreinstellung unter `http://localhost:4321` auf den Worker zugreifen. Damit Astro den Zähler einbindet, beim lokalen Start zusätzlich `PUBLIC_PAGE_VIEWS_API_URL` auf die von Wrangler angezeigte lokale URL setzen.

## Eigene Aufrufe ausschließen

Einmal `https://anthlan.github.io/drachenhalle/?traffic=off` in jedem eigenen Browser und auf jedem eigenen Gerät öffnen. Die Einstellung wird lokal im Browser gespeichert; der sichtbare Zähler wird dann nur noch gelesen und nicht erhöht. `?traffic=on` hebt den Ausschluss wieder auf. Auf `localhost` und in automatisierten Browsern wird nie hochgezählt.
