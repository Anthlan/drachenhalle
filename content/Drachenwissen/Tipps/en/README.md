# Tips

This folder collects detailed knowledge articles about alliance tips. Markdown files may and should provide more context than a compact alliance announcement or illustration: mechanics, application, worked examples, limitations, open questions and further sources.

Store related texts and illustrations directly here with the same unambiguous base name.

Illustration design follows the binding [`DIE style – Tips`](../../../../Styleguides/DlE-Stil%20%E2%80%93%20Tipps.md) guideline.

## Metadata and filters

Each tip file starts with frontmatter. Maintain the two attribute groups separately; the website uses them for cards, detail pages and combined filtering:

```yaml
---
arten:
  - Anleitung
  - Strategie
themen:
  - Kampf
  - Allianz
---
```

- Permitted values for **Type**: `Anleitung`, `Strategie`, `Optimierung`
- Permitted values for **Topic**: `Allianz`, `Events`, `Kampf`, `Truppen`, `Aufbau`, `Weltkarte`

Every tip requires at least one value from each group. Frontmatter is metadata only and is not displayed as article content.

## Tip file structure

Each Markdown file contains the complete knowledge page. Optionally, add a short version immediately before the detailed explanation:

```markdown
## Key points at a glance
```

If this section exists, the website automatically offers **“Short & concise”** and **“Detailed”** views. The short view contains only this section and the accompanying tip graphic. The detailed view begins at `## What is this tip for?` and includes all following sections, including sources and the copyable alliance announcement. There remains exactly one Markdown file per tip.

Where relevant to the particular tip, the detailed knowledge page should contain these sections:

1. **What is this tip for?** – purpose, benefits and suitable situations.
2. **Mechanics and instructions** – the mechanic and an understandable process.
3. **Examples and context** – calculations, variants or decision support.
4. **Limitations and open questions** – risks, version-dependent statements and details still to check.
5. **Sources and reliability** – in-game evidence, trustworthy external sources and review status.
6. **Alliance announcement to copy** – the complete in-game text in an `html` code block, unescaped and directly copyable.

The HTML block retains the substance of the approved in-game text unchanged. Additional information belongs in the knowledge article, not unchecked in the alliance announcement.

Where possible, verify external information online and link directly to it. Community statements must be recognisable as such. If information conflicts, current in-game displays take priority; mark uncertainties as open or still to test.

## Naming rules

- Pattern: `Tipp_XX_Kurztitel.extension`, for example `Tipp_01_Ueberfall.md` and `Tipp_01_Ueberfall.png`.
- The two-digit number matches the tip number in the content and is assigned consecutively.
- The short title describes the tip briefly and clearly. Use readable mixed case without spaces; German umlauts are written as `Ae`, `Oe`, `Ue` and `ss`.
- Related texts, HTML files and illustrations must share exactly the same base name.
- File extensions are lowercase. `README.md` is exempt from this content naming scheme.
