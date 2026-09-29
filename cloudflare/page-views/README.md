# Cloudflare-Aufrufzähler

Der Worker zählt Aufrufe pro Seite atomar in einer Cloudflare-D1-Datenbank. Die Anwendung schreibt nur Seitenpfad, Zählerstand und Änderungszeitpunkt in D1; sie setzt keine Cookies und speichert keine Browser-Kennungen. Ein erneutes Laden zählt als neuer Seitenaufruf, die Werte sind daher keine eindeutigen Besucherzahlen. Cloudflare verarbeitet die Anfrage als Infrastrukturbetreiber nach den für das Cloudflare-Konto geltenden Einstellungen.

## Einmalig bereitstellen

Voraussetzung ist ein Cloudflare-Konto. Im Verzeichnis `cloudflare/page-views`:

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
