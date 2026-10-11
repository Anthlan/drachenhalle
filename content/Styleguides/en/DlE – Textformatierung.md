# DlE – Text formatting

## Purpose

This document describes formatting rules for texts in Z:Route: Redemption. It distinguishes between **alliance announcements** and **regular messages**, because these areas have different technical limits.

## General rules

- Write in German or English to suit the recipients.
- Articles and announcements primarily address our own alliance members. Write from our alliance's perspective: preferably using **we**, **us** and **our**, and addressing members directly with **you** and **you all**.
- Avoid wording such as “the alliance”, “its members” or “players should” where “we”, “our members” or “you should” would be more natural.
- Explain game mechanics objectively and neutrally. Present context, recommendations and organisational processes as our shared knowledge and approach.
- Write the alliance tag as **DlE**.
- HTML tags must be opened and closed correctly.
- Use formatting selectively: few colours, short highlights and clear sections.
- Before sending, check the character limit against the complete source including HTML tags and emojis.
- Check new or uncertain tags with a short test message first.

## Alliance announcements

### Technical conditions

- Maximum **1,000 characters**.
- HTML formatting may be used.
- Normal line breaks may separate sections.
- An illustration may be attached to an announcement.
- Include HTML tags and emojis when planning the character count.

### Established tags

```html
<b>Bold text</b>
<color=#FFD700>Golden text</color>
<size=40>Larger text</size>
```

Tags can be combined:

```html
<color=#FFD700><b>Important heading</b></color>
```

Close tags in reverse order. Nesting must be complete.

### Caution with size and alignment

- Size values are relative to the game interface and should be tested before final use.
- A value such as `34` may appear smaller than standard text.
- `<align=center>` has not been accepted reliably and should be avoided.
- Colour and bold type are usually more robust for headings than elaborate alignment.

### Example: alliance announcement

```html
<color=#FFD700><b>DlE – ALLIANCE NEWS</b></color>
<color=#FF4040><b>IMPORTANT:</b></color> Please check current markers before the event.
<b>Task:</b> Hold WEST and reinforce threatened players.
<color=#7FFF00><b>Thank you for your support!</b></color>
```

### Example: role announcement

```html
<color=#FFD700><b>NEW RESPONSIBILITIES</b></color>
<b>Drachenherz</b> becomes Warlord, <b>Helltrain</b> handles Ambush and <b>DaVinci1986</b> takes over recruitment. Many thanks to <b>Lordmirko</b>, who has brought the Warlord role to life until now.
```

### Shortening order above 1,000 characters

1. Remove repetition.
2. Shorten the introduction and ending.
3. Reduce emojis.
4. Remove less important formatting tags.
5. Move details into an attached illustration or second message.

## Regular messages

### Technical conditions

- More text is available than in alliance announcements.
- Line breaks do not work reliably.
- `<br>` is not treated as a dependable line break.
- Structure content as a compact single-line message where possible.

### Suitable separators

```text
• Bullet
| Vertical bar
– Dash
▶ Section marker
```

### Example: compact deployment message

```html
<color=#FFD700><b>WEST:</b></color> Take position early | <color=#FF4040><b>ATTACK:</b></color> only after marking | <color=#7FFF00><b>SUPPORT:</b></color> reinforce threatened players immediately
```

### Example: factual reminder

```html
<b>Quick reminder:</b> Before starting, check whether research, construction or training actually runs during the matching bonus. | Activities already underway do not receive the bonus retrospectively.
```

## Recommended colours

Use colours functionally and to suit the dark DlE design:

- `#FFD700` – Gold: headings, alliance name, important positive terms
- `#FF4040` – Red: warnings, prohibitions, urgent notices
- `#7FFF00` – Green: benefits, permissions, positive calls to action
- White or default colour: regular body text

Too many colours make short messages restless. Two accent colours plus default text usually suffice per message.

## Writing style

- Write briefly, clearly and close to gameplay.
- Write from within our community rather than reporting on the alliance as an outside observer.
- Put the action first, then the reason.
- Avoid unnecessary jargon and long introductions.
- State clear roles and goals in strategies.
- Keep sensitive alliance communication subtle and factual: questions, brief notes and gentle jabs rather than personal attacks.
- Name players correctly, paying particular attention to capitalisation.

## Working with illustrations

- An illustration supplements the announcement but does not replace essential instructions.
- Text and image must not contradict each other.
- The main objective must be understandable without opening the image.
- Reusable tips use the same base name for text and image.

Example:

```text
Ueberfall.md
Ueberfall.png
```
