# Security- und Privacy-Audit

Stand: 29. September 2026  
Geprüfter Stand: `febd025` (`main`) einschließlich lokaler, noch nicht eingecheckter Änderungen; diese wurden nicht verändert.  
Repository: öffentliches GitHub-Repository mit statischer Astro-Website auf GitHub Pages und Dropbox-Dateianfrage.

## Kurzfazit

Das Projekt enthält im geprüften Stand keine erkannten klassischen Zugangsdaten wie API-Keys, Private Keys oder Passwörter. Die Anwendung ist bewusst öffentlich und soll ohne Anmeldung funktionieren. Öffentliche Erreichbarkeit ist deshalb für sich genommen **keine Schwachstelle**.

Die als „intern“ oder „hidden“ bezeichneten Ratsinhalte sind technisch öffentlich, das daraus entstehende Spiel- und Reputationsrisiko wird vom Betreiber bewusst akzeptiert. Die Wahrscheinlichkeit, dass ein zufälliger Besucher diese Inhalte findet und daraus einen konkreten Schaden verursacht, ist gering. Für jemanden, der gezielt das öffentliche Repository untersucht, sind die Inhalte dagegen leicht auffindbar. Entscheidend ist daher nicht die technische Auffindbarkeit, sondern die sehr geringe angenommene Wahrscheinlichkeit einer schädlichen Nutzung und der begrenzte mögliche Schaden.

Gesamtrisiko unter diesem Threat Model: **niedrig bis mittel**. Es gibt keine bestätigte kritische Schwachstelle und keine erkannten veröffentlichten Zugangsdaten. Die sinnvollsten technischen Verbesserungen betreffen Markdown-XSS, CI-Berechtigungen und den Umgang mit Daten, die Dritte über Dropbox hochladen.

## Threat Model und Bewertungsmethode

Der Audit bewertet Risiken unter folgenden Annahmen:

- Öffentlicher Zugriff ohne Benutzerkonto ist eine feste Produktanforderung.
- Das Repository, sämtliche eingecheckten Dateien und die erzeugte Website gelten grundsätzlich als öffentlich.
- Die Ratsinhalte dürfen öffentlich auffindbar sein; ihr mögliches Bekanntwerden ist ein bewusst akzeptiertes Geschäfts-/Spielrisiko.
- Schreibzugriff auf `main` haben nur vertrauenswürdige Maintainer; fremde Pull Requests werden nicht ungeprüft übernommen.
- Hochgeladene Dropbox-Dateien können von Dritten stammen. Deren Datenschutz und mögliche schädliche Dateien bleiben deshalb außerhalb der eigenen Risikobereitschaft relevant.

Bewertet werden **Eintrittswahrscheinlichkeit** und **Schadenshöhe** getrennt. „Exponiert“ bedeutet nicht automatisch „hohes Risiko“: Eine bereits öffentliche Information kann eine hohe Expositionswahrscheinlichkeit, aber nur eine geringe Schadenshöhe haben.

| Befund | Eintritt eines schädlichen Ereignisses | Möglicher Schaden | Restrisiko | Behandlung |
|---|---:|---:|---:|---|
| SEC-01 Ratsinhalte/Karte | sehr gering bis gering | gering bis mittel | **niedrig** | bewusst akzeptiert |
| SEC-02 öffentliche Dropbox-Inbox | gering | mittel bei Fehl-Uploads Dritter | **niedrig bis mittel** | Hinweis/Prozess absichern |
| SEC-03 Dropbox-State-Metadaten | gering | sehr gering | **niedrig** | optional minimieren |
| SEC-04 Markdown-XSS | gering | mittel | **niedrig bis mittel** | technisch härten |
| SEC-05 Pseudonyme/Metadaten | gering bei Einwilligung | gering bis mittel | **niedrig**, sonst mittel | Einwilligung sicherstellen |
| SEC-06 CI/Supply Chain | sehr gering | hoch | **niedrig bis mittel** | technisch härten |
| SEC-07 fehlende Prävention | gering | mittel | **niedrig** | Hygiene verbessern |
| SEC-08 Browser-Härtung | sehr gering | gering | **informativ** | optional |

## Befunde

### SEC-01 – Interne Ratsinhalte und Planungskarte sind öffentlich

**Restrisiko: niedrig · Wahrscheinlichkeit: sehr gering bis gering · Schaden: gering bis mittel · Status: bewusst akzeptiert**

Die Datei `Allianz/Allianz_Zukunft.md` bezeichnet sich ausdrücklich als interne Beratung und wird mit `##HIDDEN` markiert. Der Generator interpretiert das jedoch nur als Darstellungsmerkmal:

- `site/scripts/content-visibility.mjs:5-19` erkennt den Marker.
- `site/scripts/generate-docs.mjs:371-409` nimmt solche Dokumente weiterhin in die Dokumentliste auf.
- `site/scripts/generate-docs.mjs:538-551` rendert den vollständigen Inhalt.
- `site/src/pages/docs/[slug].astro:8-12` erzeugt statische Seiten für **alle** Dokumente, einschließlich der versteckten.
- `site/src/pages/rat.astro:8` und `:68-77` sammeln und verlinken genau diese Dokumente.
- `site/src/pages/docs/[slug].astro:56` setzt lediglich `noindex, nofollow`.

Am 29. September 2026 antworteten folgende URLs ohne Anmeldung mit HTTP 200:

- `https://anthlan.github.io/drachenhalle/rat/`
- `https://anthlan.github.io/drachenhalle/rat/karte/`
- `https://anthlan.github.io/drachenhalle/docs/zukunft-der-allianz/`
- die Raw-GitHub-URL der internen Markdown-Datei

Die Planungskarte enthält außerdem bestätigte Gebietsgrenzen, Koordinaten, Stadtlevel und Allianzzuordnungen (`Karte/GEBIETE.md`, `Karte/GRENZEN.md`). Selbst wenn Teile davon auf der gerenderten Karte noch nicht angezeigt werden, stehen sie im öffentlichen Repository.

**Auswirkung:** Außenstehende können interne Entscheidungsoptionen, Schwächen, Fusionsüberlegungen, Positionen und Gebietsplanung einsehen. Der realistische Schaden beschränkt sich primär auf einen möglichen taktischen Nachteil im Spiel oder Irritationen innerhalb der Community. Kontozugänge, Zahlungsdaten oder technische Systeme werden dadurch nicht kompromittiert.

**Bewertung:** Für einen zufälligen Website-Besucher ist das Auffinden unwahrscheinlich. Wer das Repository gezielt durchsucht, findet die Inhalte ohne besondere Kenntnisse; die technische Entdeckungswahrscheinlichkeit ist für diese Gruppe hoch. Dass daraus tatsächlich ein relevanter Schaden entsteht, wird unter dem angenommenen Nutzer- und Gegnerprofil als sehr gering eingeschätzt. Das Restrisiko ist daher niedrig und wird akzeptiert.

**Optionale Leitplanken ohne Anmeldung:**

- `HIDDEN` in `UNLISTED` umbenennen. Das beschreibt die tatsächliche Funktion korrekt und verhindert falsche Sicherheitsannahmen bei späteren Autoren.
- Direkt am Marker dokumentieren: „öffentlich per URL und im Git-Repository; nur aus der Navigation ausgeblendet“.
- Keine Zugangsdaten, Klarnamen, privaten Konfliktdetails oder Informationen mit realweltlichem Schadenspotenzial in diesen Bereich aufnehmen. Solche Daten fallen nicht unter die akzeptierte Spielstrategie-Ausnahme.

### SEC-02 – Öffentliche Dropbox-Inbox enthält Daten Dritter

**Restrisiko: niedrig bis mittel · Wahrscheinlichkeit: gering · Schaden: mittel bei Fehl-Uploads · Status: Designentscheidung mit verbleibendem Drittparteirisiko**

Die Website veröffentlicht zwei verschiedene Dropbox-Funktionen:

- eine Dateianfrage zum Hochladen in `site/src/components/SiteHeader.astro:5`;
- einen Shared-Folder-Link zum „Inbox ansehen“ in `site/src/components/InboxLink.astro:5-20`.

Der gleiche Shared-Folder-Link ist als Fallback in `site/scripts/generate-inbox-count.mjs:7-8` fest eingebaut. Das Skript verwendet ihn zusammen mit einem OAuth-Token, um den Inhalt rekursiv aufzulisten (`:44-88`).

Die Dateianfrage und die Shared-Folder-Seite antworteten beim unauthentifizierten Test mit HTTP 200. Die Shared-Folder-Antwort enthielt Download-/Preview-Funktionalität und keinen erkannten Login-Hinweis. Ob Dropbox jede einzelne Datei ohne JavaScript oder weitere Interaktion ausliefert, wurde nicht getestet.

**Auswirkung:** Noch nicht moderierte Einsendungen können Dateinamen, Bilder, Dokumentinhalte, personenbezogene Angaben oder schädliche Dateien enthalten. Das eigene bewusste Akzeptieren öffentlicher Inhalte deckt eine irrtümliche Veröffentlichung durch einen Dritten nicht automatisch ab. Der Inbox-Zähler selbst hat nur sehr geringe Schadenswirkung.

**Bewertung:** Missbrauch oder Fehlbedienung ist bei der kleinen, bekannten Nutzergruppe wahrscheinlich selten. Der mögliche Schaden ist höher als beim Ratsbereich, weil ein Uploader versehentlich fremde oder persönliche Daten veröffentlichen kann. Das ergibt ein niedriges bis mittleres Restrisiko, ohne dass eine Anmeldung erforderlich wäre.

**Leitplanken ohne Anmeldung:**

- Vor dem Upload deutlich und unmittelbar erklären, dass Upload, Dateiname und Inhalt sofort öffentlich einsehbar sein können. Die derzeitige allgemeine Bitte, keine personenbezogenen Daten anzugeben, sollte um diesen Punkt ergänzt werden.
- Nur erwartete Bild-/Dokumenttypen zulassen und veröffentlichte Dateien vor dem Öffnen als untrusted behandeln.
- Einen leicht erreichbaren Lösch-/Meldeweg anbieten.
- Wenn sofortige Sichtbarkeit nicht zwingend ist, kann eine kurze Moderationsstufe das Risiko senken, ohne Benutzerkonten einzuführen.
- Dropbox-App auf minimal notwendige Scopes und möglichst einen App-Ordner begrenzen. Refresh-Token nach der Umstellung rotieren, falls sein bisheriger Berechtigungsumfang unnötig breit war.
- Uploads soweit praktikabel auf Malware, unerlaubte Dateitypen, Metadaten und persönliche Inhalte prüfen.

### SEC-03 – Öffentliche Zustandsdatei verrät Dropbox- und Zuordnungsmetadaten

**Restrisiko: niedrig · Wahrscheinlichkeit: gering · Schaden: sehr gering · Status: bestätigt**

`.dropbox-inbox-state.json:3-40` ist eingecheckt und öffentlich per Raw-GitHub abrufbar. Sie enthält:

- internen Dropbox-Ordnerpfad;
- dauerhafte Dropbox-Datei-IDs;
- Revisionen;
- ursprüngliche Inbox-Pfade und Upload-Dateinamen;
- Zuordnung zu den später veröffentlichten Zieldateien und Spielernamen.

Die Werte sind keine direkten Zugangsdaten, erleichtern aber Korrelation, Profilbildung und interne Prozessanalyse.

**Bewertung und optionale Minimierung:**

- Die Metadaten ermöglichen keine Anmeldung und keinen direkten Dropbox-Zugriff. Bei bewusst öffentlicher Prozessdarstellung ist der Schaden sehr gering.
- Falls diese Prozessdetails keinen öffentlichen Nutzen haben, Datei in `.gitignore` aufnehmen und Zustand außerhalb des Repositorys speichern.
- Falls nur Duplikaterkennung benötigt wird, lokal gehashte IDs mit einem geheimen HMAC-Schlüssel statt Original-IDs speichern.
- Eine nachträgliche History-Bereinigung ist für diesen Befund angesichts der geringen Schadenshöhe nicht verhältnismäßig.

### SEC-04 – Gespeichertes XSS über Markdown-Inhalte möglich

**Restrisiko: niedrig bis mittel · Wahrscheinlichkeit: gering · Schaden: mittel · Status: technisch bestätigt**

Mehrere Generatoren wandeln Repository-Markdown mit `marked` in HTML um. Die Astro-Seiten geben das Ergebnis anschließend mit `set:html` aus, unter anderem in:

- `site/src/pages/docs/[slug].astro:324`, `:340`, `:369`, `:400-473`;
- `site/src/pages/neuigkeiten/[slug].astro:55`;
- `site/src/components/EventCard.astro:49`.

`marked` ist kein HTML-Sanitizer. Ein lokaler Test mit der gesperrten Version `18.0.14` bestätigte, dass sowohl Raw-HTML-Eventhandler als auch `javascript:`-Links im Ergebnis erhalten bleiben.

**Auswirkung:** Wer Markdown in `main` einschleusen kann, kann JavaScript im Ursprung `anthlan.github.io` ausführen, Besucher umleiten, Inhalte manipulieren oder Daten desselben Web-Origin auslesen. Bei ausschließlich vertrauenswürdigen Autoren und geprüftem Merge-Prozess ist die Eintrittswahrscheinlichkeit gering. Anders als die öffentliche Ratsseite wäre ein erfolgreicher XSS-Angriff jedoch eine echte Manipulation der Website und sollte deshalb technisch gehärtet werden.

**Mitigation:**

- Generiertes HTML vor `set:html` mit einer strikten Allowlist sanitizen, zum Beispiel mit `sanitize-html` oder DOMPurify im serverseitigen Build.
- Raw HTML in Markdown standardmäßig verwerfen.
- Link-Protokolle explizit auf `https:`, `http:` und erlaubte relative URLs begrenzen; `javascript:`, `data:` und ähnliche Schemes ablehnen.
- Regressionstests für `<script>`, Eventhandler, SVG, `javascript:`-Links und gefährliche `data:`-URLs hinzufügen.
- Zusätzlich eine Content Security Policy einsetzen. CSP ist zweite Verteidigungslinie und ersetzt die Bereinigung nicht.

### SEC-05 – Personen- und Standortbezug in Dateinamen, Bildern und Metadaten

**Restrisiko: niedrig bei Einwilligung, sonst mittel · Wahrscheinlichkeit: gering · Schaden: gering bis mittel · Status: bestätigt**

Das Repository veröffentlicht Ingame-Namen zusammen mit genauen Datums-/Uhrzeitangaben und teilweise geografischen Bezügen wie Berlin, Düsseldorf, Hamburg, Hannover, Rhein, Ruhrpott oder Schweiz. Dadurch lassen sich Pseudonyme, Aktivitätszeiten, Regionen und soziale Beziehungen korrelieren. Originalbilder sind über GitHub dauerhaft abrufbar, unabhängig von komprimierten Website-Derivaten.

Alle 211 versionierten PNG/JPEG/WebP-Dateien wurden auf vorhandene Metadatenblöcke geprüft. Vier Dateien enthalten EXIF, XMP und/oder IPTC:

- `Galerie/Charaktermodelle/Somea_Referenzmodell.jpg`
- `Galerie/Charaktermodelle/mysteryZ_Referenzmodell.jpg`
- `Galerie/Chatbilder/2026_09_05_1638_BenimmDichScreenshot_Anthlan_Somea.png`
- `Galerie/Chatbilder/2026_09_07_1533_Dropsdose_Anthlan_Drachenherz.jpg`

Im lesbaren Metadaten-Schnelltest wurden keine GPS-Koordinaten erkannt. Ein Bild enthält jedoch einen exakten Erstellungs-/Änderungszeitpunkt; weitere Blöcke nennen Bearbeitungssoftware beziehungsweise „Screenshot“. Das ist kein vollständiger forensischer EXIF-Parser, daher ersetzt das Ergebnis keine verbindliche Freigabeprüfung.

**Mitigation:**

- Vor jedem Commit Metadaten reproduzierbar entfernen, auch aus den Originaldateien im Repository.
- Dateinamen auf Tag oder Monat statt Minute reduzieren, sofern die genaue Uhrzeit nicht fachlich erforderlich ist.
- Ortsbezüge nur mit ausdrücklicher Zustimmung der betroffenen Person veröffentlichen; sonst neutral formulieren.
- Ein dokumentiertes Einwilligungs-, Lösch- und Aufbewahrungskonzept für Avatare, Chatbilder und Pseudonyme festlegen.
- Screenshots vor Veröffentlichung visuell auf Klarnamen, Nachrichten, IDs, Servernummern, Benachrichtigungen und UI-Kontodaten prüfen.

### SEC-06 – GitHub-Actions-Berechtigungen und Supply-Chain-Härtung

**Restrisiko: niedrig bis mittel · Wahrscheinlichkeit: sehr gering · Schaden: hoch · Status: bestätigt**

Der Workflow vergibt `pages: write` und `id-token: write` global (`.github/workflows/deploy-pages.yml:10-13`). Damit erhält auch der Build-Job mehr Rechte als nötig. Die Actions werden nur mit beweglichen Major-Tags referenziert (`actions/checkout@v6`, `withastro/action@v6`, `actions/deploy-pages@v5`) statt mit unveränderlichen Commit-SHAs.

Der Dropbox-Schritt führt ein Skript aus dem Repository mit drei langlebigen Secrets aus (`:28-34`). Jede in `main` gelangte Änderung an diesem Skript kann diese Secrets exfiltrieren. Das ist bei CI grundsätzlich relevant und macht Branch-Schutz sowie Reviewpflicht besonders wichtig.

**Mitigation:**

- Top-Level-Rechte auf `contents: read` reduzieren.
- `pages: write` und `id-token: write` nur am Deploy-Job setzen.
- Drittanbieter-Actions auf vollständige Commit-SHAs pinnen und die gewünschte Versionsnummer im Kommentar dokumentieren.
- Änderungen an `.github/workflows/**` und `site/scripts/generate-inbox-count.mjs` über `CODEOWNERS` und verpflichtendes Review absichern.
- Branch Protection für `main` aktivieren: kein direkter Push, mindestens ein Review, Statuschecks, keine Umgehung außer Break-Glass.
- Dropbox-Zählung nach Möglichkeit in einen separaten, minimal privilegierten Workflow ohne Pages-Schreibrecht verschieben.

### SEC-07 – Fehlende vorbeugende Security-Kontrollen

**Restrisiko: niedrig · Wahrscheinlichkeit: gering · Schaden: mittel · Status: bestätigt, Repository-Einstellungen teilweise nicht prüfbar**

Im Repository fehlen `SECURITY.md`, `CODEOWNERS`, Dependabot-Konfiguration und ein eigener Secret-Scan. Die Root-`.gitignore` ignoriert nur `.pnpm-store/` und `tmp/`; typische lokale Secrets und die Dropbox-State-Datei sind nicht abgedeckt. Ob GitHub Secret Scanning, Push Protection und Dependabot in den Repository-Einstellungen aktiviert sind, war aus der lokalen Arbeitskopie nicht feststellbar.

**Mitigation:**

- GitHub Secret Scanning und Push Protection aktivieren.
- Gitleaks oder TruffleHog als CI- und optionalen Pre-Commit-Scan einführen, jeweils inklusive Git-Historie.
- Dependabot/Renovate für npm und GitHub Actions aktivieren.
- `.gitignore` mindestens um `.env`, `.env.*` (mit Ausnahme einer sicheren Beispieldatei), Schlüsseldateien, lokale Credentials und `.dropbox-inbox-state.json` erweitern.
- `SECURITY.md` mit privatem Meldeweg und Reaktionsprozess anlegen.
- `CODEOWNERS` für Workflows, Buildskripte und Veröffentlichungsinhalte definieren.

### SEC-08 – Fehlende Browser-Härtung

**Restrisiko: informativ · Wahrscheinlichkeit: sehr gering · Schaden: gering · Status: bestätigt**

Es ist keine Content Security Policy im HTML konfiguriert. GitHub Pages erlaubt keine frei konfigurierbaren Response-Header pro Repository; einige Schutzmaßnahmen können aber als `<meta http-equiv>` gesetzt oder über einen vorgeschalteten Dienst realisiert werden.

**Mitigation:**

- Nach Bereinigung des Inline-JavaScripts eine möglichst enge CSP einführen, zum Beispiel mit `default-src 'self'`, ohne `unsafe-inline` für Skripte.
- `Referrer-Policy` und eine restriktive `Permissions-Policy` über einen vorgeschalteten Host/CDN setzen, falls das Projekt später umzieht.
- Externe Links behalten bereits sinnvoll `rel="noopener noreferrer"`; dieses Muster beibehalten.

## Positive Feststellungen

- Der Scan des aktuellen Stands und aller erreichbaren Commits fand keine typischen Signaturen für AWS-, GitHub-, Slack-, Stripe- oder Private-Key-Secrets.
- Die Dropbox-Zugangsdaten werden als GitHub-Actions-Secrets referenziert und nicht mit ihrem Wert eingecheckt.
- `pnpm audit --audit-level low` meldete am 29. September 2026 für den vollständigen Lockfile-Stand keine bekannten Schwachstellen.
- `package.json` und `pnpm-lock.yaml` sperren direkte Abhängigkeiten auf konkrete Versionen.
- Externe Links mit neuem Tab verwenden in den geprüften Komponenten `noopener noreferrer`.
- Dynamische Werte der Karten-Auswahl werden vor Verwendung in `innerHTML` HTML-escaped.
- Generierte Verzeichnisse und `node_modules` sind im `site`-Unterprojekt ignoriert.

## Empfohlener Zielzustand für „Public by Design“

Das öffentliche Repository und die Website bleiben vollständig ohne Anmeldung nutzbar. Sicherheit entsteht hier nicht durch Zugriffsschutz, sondern durch eine klare Veröffentlichungsgrenze: Alles Eingecheckte und Verlinkte wird als öffentlich behandelt.

Empfohlene Leitlinien:

1. **Ratsbereich:** öffentlich, aber korrekt als „nicht gelistet“ statt „vertraulich“ bezeichnet; akzeptiertes Spielrisiko dokumentieren.
2. **Dropbox-Inbox:** öffentlich ohne Anmeldung, aber mit eindeutigem Hinweis vor dem Upload, Dateitypbegrenzung und Löschweg.
3. **Content-Pipeline:** Markdown sanitizen, damit öffentliches Schreiben nicht automatisch aktiven Browsercode erlaubt.
4. **CI/CD:** minimale Berechtigungen, gepinnte Actions und Review für geheimnisführende Buildskripte.
5. **Bilder und Pseudonyme:** Veröffentlichung nur mit Einwilligung; Metadaten möglichst automatisiert entfernen.

## Prüfmethodik und Grenzen

Geprüft wurden der aktuelle Arbeitsbaum, alle erreichbaren Git-Commits, Workflow und Berechtigungsdeklarationen, Astro-/Node-Quellcode, Markdown-Rendering, bekannte npm-Advisories sowie Metadatenblöcke aller 211 versionierten Bilder. Die öffentlich erwarteten Seiten und Raw-GitHub-Dateien wurden unauthentifiziert per HTTP geprüft.

Nicht geprüft werden konnten private GitHub-Repository-Einstellungen, tatsächliche Dropbox-App-Scopes, Branch-Protection-Regeln, GitHub-Audit-Logs, Dropbox-Zugriffslogs und die vollständige visuelle/OCR-basierte Prüfung jedes Bildpixels. Regex-basierte Secret-Scans reduzieren das Risiko, können aber niemals beweisen, dass keine individuell aufgebauten Zugangsdaten vorhanden sind.
