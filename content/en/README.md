# ZRoute – DIE Dragon Hall

This repository is the central, structured collection of content about **Z:Route: Redemption** and the **DIE** alliance. Its main sections correspond directly to the navigation of the [website](https://anthlan.github.io/drachenhalle/en/).

## Languages

The website offers German, English, French, Russian and Brazilian Portuguese with a language selector on every page. Editable text sources live under `content/<Topic>/<Language>` (`de`, `en`, `fr`, `ru`, `pt`). Text-free images and character models are shared; translated knowledge graphics live beside the corresponding language files. The [language structure](../README.md) explains the workflow.

## Getting Started

- [Archive rules and project parameters](ARCHIVREGELN.md)
- [Style guides](../Styleguides/en/README.md)

Each subject folder contains its own `README.md` describing its purpose, intended use and applicable naming rules.

## Content

| Folder | Content |
| --- | --- |
| [`Aktuelles`](../Aktuelles/en/README.md) | Manually maintained news for the homepage |
| [`Termine`](../Termine/en/README.md) | Upcoming and past alliance events with a detail page, related knowledge articles and a calendar download |
| [`Galerie`](../Galerie/en/README.md) | Chat images, reaction images, avatars and character models |
| [`Drachenwissen`](../Drachenwissen/en/README.md) | Tips, strategies and information for everyday game and alliance life |
| [`Tutorials`](../Tutorials/en/README.md) | Guided step-by-step instructions for important processes |
| [`Allianz`](../Allianz/en/README.md) | Rules, officers, responsibilities and internal discussion papers |
| [`Styleguides`](../Styleguides/en/README.md) | Design and writing rules for consistent DIE content |
| [`Archiv`](../../Archiv/README.md) | Replaced, outdated or historically relevant content |
| [`site`](../../site) | Technical sources of the automatically generated website |

Under **Tools**, the website provides small interactive tools. The shield planner reads the next raid and any simultaneous capital conquest directly from event data, plans with 72-, 24-, 12- and 8-hour shields and freely chosen active combat windows, and can create personal calendar reminders. Known prices, replacement costs and weekly alliance-shop limits support cost planning. The healing planner calculates a safe instant-heal window from help duration, help limit and active helpers. For T5–T9, it uses base values of 60–100 seconds per soldier derived from in-game measurements; T1–T4 and T10 are extrapolated from the observed ten-second progression. Together with your personal healing speed, this produces a recommended number of soldiers, while personal in-game calibration remains available for mixed troops.

The interactive [Expedition Madness analysis](https://anthlan.github.io/drachenhalle/en/auswertungen/expeditionswahnsinn/) compares S105 and S97 participants and points in the capital conquest of 10 October 2026. Alliance filters, participation rates for the 20 alliances with known membership figures, contribution distribution and a searchable ranking with CSV export make the complete snapshot of 563 players accessible. Additional servers are listed separately. The underlying data is stored in `site/src/data/expedition-2026-10-10.json`.

## Submitting Content

Alliance members can submit images and documents through the [ZRoute Upload Inbox](https://www.dropbox.com/request/4ha3swzj8zyl4mez6j8g). No Dropbox account is required to upload.

Where possible, include your player name and a brief description of the content in the filename. Uploading a file must include permission to add it to this public archive. All submissions are reviewed before inclusion, appropriately named and placed in the intended folder.

### Website Inbox Counter

The Pages workflow counts all files in the shared Dropbox inbox folder twice an hour and displays the number beside the inbox icon. Filenames and other metadata are not published on the website. The repository requires the workflow secrets `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` and `DROPBOX_REFRESH_TOKEN` for this query. If they are missing, the website still builds and the inbox icon remains without a counter.

### Website Page Views

A small Cloudflare Worker counts views of each published page in a D1 database and also returns the total count. Both values appear in the footer. The application stores only the page path and aggregated counters; it sets no cookies and stores no browser identifiers. Setup is documented under [`cloudflare/page-views`](../../cloudflare/page-views/README.md). Without the workflow variable `PUBLIC_PAGE_VIEWS_API_URL`, the website continues to build normally and the counter stays hidden.

Cloudflare Web Analytics can additionally be enabled for private analysis of visits, countries, referrers, devices and popular pages. The site token is stored as the workflow variable `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`. To permanently exclude your own views in a browser, open `https://anthlan.github.io/drachenhalle/?traffic=off` once. `?traffic=on` enables counting again in that browser. Local development and automated browsers are never counted. The opt-out applies to both Web Analytics and the visible page counter.

## Design Principle

For chat and reaction images, purpose and visual style are maintained separately. Chat images tell scenes, while reaction images provide short, reusable replies or greetings. Both categories can independently use S1, S2, S3 or S4. The required guidelines are in [`Styleguides`](Styleguides), and assignments are in [`Galerie/STILINDEX.md`](../../Galerie/STILINDEX.md).

## Project Status

The repository is an archive maintained on an ongoing basis. New content is organised according to the documented storage and naming rules; outdated versions are archived transparently rather than silently overwritten. Changes remain traceable through Git history.

## Rights and Affiliation

This is an **unofficial fan and community project**. It is not connected to the developer or publisher of *Z:Route: Redemption*. Game names, trademarks and other protected elements belong to their respective rights holders.

Publishing this repository does not grant general permission to reuse its texts, images, avatars or character models. Unless expressly stated otherwise, use outside this project requires the permission of the respective creators or rights holders.
