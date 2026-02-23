# Reading View Line Numbers

An [Obsidian](https://obsidian.md) plugin that displays source-line numbers in the Reading View gutter. Numbers correspond to the starting source line of each rendered block, matching the line numbers shown in Editing View.

## Features

- Gutter line numbers in Reading View, aligned with source line positions
- Per-window toggle via right-click menu on the document body, tab, or file navigator
- Option to number from line 1 of the full document or from line 1 after frontmatter
- Global enable/disable toggle in settings
- Theme-compatible styling using Obsidian CSS variables

## Installation

1. Copy the plugin folder into your vault's `.obsidian/plugins/` directory and name it `reading-view-line-numbers`
2. Ensure `main.js`, `manifest.json`, and `styles.css` are present in that folder
3. Enable the plugin in **Settings → Community Plugins**

> Not yet listed in the Obsidian community plugin browser.

## Usage

Open any file in Reading View. Line numbers appear in the left gutter.

### Per-window toggle

Right-click anywhere in the document body, on the document tab, or on the file in the File Navigator to show or hide line numbers for that window independently of the global setting.

### Settings

**Settings → Reading View Line Numbers**

| Setting | Default | Description |
|---|---|---|
| Show line numbers in Reading View | On | Global enable/disable |
| Count from first content line | Off | When on, numbering starts at 1 from the first line after frontmatter |

## Building from source

```bash
npm install
npm run build
```

Output is `main.js`.

## Known behaviour

- Frontmatter/properties blocks are not numbered
- Transclusions and embeds from other files are not numbered (Obsidian returns no section info for them)
- Per-window disabled state is not persisted across sessions

## License

MIT
