# Archive Rules and Project Parameters

## Project

- **Game:** Z:Route: Redemption
- **Alliance spelling on this website:** DIE
- **Previous names:** DRR / Drachenritter
- **Technical note:** The spelling `DIE` is blocked by the game’s filter. Within the game, `DlE` must therefore be used.
- **Player name:** Anthlan
- **Purpose of the archive:** Centrally preserve reusable texts, images, rules, instructions, strategies and analyses for the game and alliance.

On this website and in the repository, the alliance is consistently called **DIE**. Technical filtering may require different spelling in-game. The previous names **DRR** and **Drachenritter** are used only when documenting a historical state.

## Content Scope

- Content relates exclusively to **Z:Route: Redemption**, the **DIE** alliance and the associated game context.
- Personal or professional information does not belong in alliance texts, graphics or character descriptions.
- Pandora content is treated separately from general tips.
- Unconfirmed game mechanics are clearly labelled **unconfirmed**, **to be tested** or **community note**.
- Where possible, numbers, bonuses and game mechanics should be documented with a screenshot, in-game display or reliable source.

## Folder Structure

- `content/Aktuelles/<Language>`: homepage news in every registered language (`de`, `en`, `fr`, `ru`, `pt`)
- `content/Termine/<Language>`: alliance events with a date, time, dedicated detail page, related knowledge content and calendar download
- `Galerie`: chat images, reaction images, avatars and character models
- `content/<Topic>/<Language>`: parallel text sources for Dragon Knowledge, Alliance and Tutorials; identical relative paths and filenames in `de`, `en`, `fr`, `ru` and `pt`
- `Styleguides`: required rules for design and text formatting
- `Archiv`: replaced, outdated or purely historical versions
- `site`: technical sources and website build scripts

## Storage Rules

1. Keep storage as flat as possible. Do not create extra subfolders for individual tips, instructions or images.
2. Related text and its graphic receive exactly the same base filename.
3. Move outdated versions to `Archiv`. Avoid filenames such as `final`, `final2` or `neu_neu`.
4. Filenames should identify the content without opening the file.
5. Preserve the capitalisation of player names as shown in-game or in the image.
6. Document structural changes and new required rules through meaningful Git commits.

## Filename Rules

### Tips and Instructions

Tips use a two-digit sequence number and a short descriptive name:

```text
Tipp_XX_Kurztitel.Dateiendung
```

Text and image use the same base filename:

```text
Tipp_01_Ueberfall.md
Tipp_01_Ueberfall.png
```

For instructions, the topic is provisionally placed first:

```text
Thema_Kurztitel.Dateiendung
AllianzShop_SchrittFuerSchritt.md
AllianzShop_SchrittFuerSchritt.png
```

If text is saved as formatted HTML, the base filename also remains unchanged. Rules for currently empty sections will be refined as needed when their first content is added.

### Avatars

Pattern:

```text
Spielername_YYYY_MM_DD_HHMM.Dateiendung
```

Examples:

```text
mysteryZ_2026_08_07_1817.png
DRACHENHERZ_2026_08_24_1257.png
```

The player name comes first so that all of a player’s variants appear together. Its spelling matches the name in the image exactly.

### Character Models and Character Scenes

A general reference image uses:

```text
Spielername_Referenzmodell.Dateiendung
```

Examples:

```text
Anthlan_Referenzmodell.png
Drachenherz_Referenzmodell.png
```

Character models do not use timestamps. If several reference images are needed for one player, append the view or focus:

```text
Spielername_Referenzmodell_Front.Dateiendung
Spielername_Referenzmodell_Ganzkoerper.Dateiendung
Spielername_Referenzmodell_Seite.Dateiendung
Spielername_Referenzmodell_Gesicht.Dateiendung
Spielername_Referenzmodell_Ausruestung.Dateiendung
```

Preserve the player name’s capitalisation as used in-game or in the reference image.

### Chat and Reaction Images

Pattern:

```text
YYYY_MM_DD_HHMM_Kurztitel_[Hauptfiguren].Dateiendung
```

The timestamp comes first because chronological organisation matters more than grouping by a single character. Main characters are appended only when they can be clearly identified; multiple names are each separated by an underscore. The short title and main character names contain no spaces.

- `Galerie/Chatbilder` contains scenic or narrative images.
- `Galerie/Reaktionsbilder` contains short, reusable replies and greetings.

Folders describe purpose only. Visual styles S1, S2, S3 and S4 are assigned independently in the central `Galerie/STILINDEX.md`. A scenic chibi image therefore remains an S3 chat image; a reaction image is not automatically S3 simply because of its category.

Examples:

```text
2026_09_17_2043_KaffeeOderSomea_Anthlan_Somea.png
2026_09_18_0718_Kaffeepause.png
2026_09_25_2331_Passt_Anthlan.png
```

## Handling Historical Content

- Content with DRR, old roles or obsolete rules is not silently overwritten.
- If it remains worth documenting, clearly label it and move it to `Archiv`.
- The current version always uses **DIE** and the latest confirmed roles and rules.

## Lifecycle of Limited-Time Events

- After its confirmed end for our alliance, add a limited-time event under “Events → Event Archive” and label it “Finished for us · Limited-time event”. Give an end date only when confirmed.
- Keep the guide, graphics and calculator available for reference. Display an archive notice on the guide and calculator; no longer promote the event as current or running.
- Remove event-specific calculators from the regular Tools menu and link them from the archive entry. Preserve existing URLs where possible.
- Mark related launch and promotional news with `archived: true` in every language source. Keep source files; the news generator publishes neither the listing nor the article page.
- Maintain archive entries and status labels in every registered language. If an event returns, recheck durations, currencies, prices and rewards before presenting it as current again.
