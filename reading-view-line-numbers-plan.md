# Reading View Line Numbers — Obsidian Plugin

## Goal

Build an Obsidian plugin that displays source-line numbers in the Reading View gutter. The numbers must correspond to the starting source line of each rendered block, matching the line numbers shown in Editing View. The gutter will show non-sequential numbers (e.g. 1, 4, 12, 15) that map rendered blocks back to their position in the markdown source.

## Setup

Scaffold from the official Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin

Use TypeScript. Target the Obsidian API as declared in the sample plugin's dependencies. Do not add unnecessary dependencies.

## File Structure

```
reading-view-line-numbers/
├── main.ts          # Plugin class, post-processor registration, settings
├── settings.ts      # PluginSettingTab subclass and settings interface
├── styles.css       # Gutter styling
├── manifest.json    # Plugin metadata
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

## Core Mechanism

Use `registerMarkdownPostProcessor` in the plugin's `onload()` method. This is the only hook needed — it fires when markdown is rendered to HTML for Reading View.

The callback signature is:

```
(element: HTMLElement, context: MarkdownPostProcessorContext) => void
```

### For each rendered section:

1. Call `context.getSectionInfo()` to get the source line information.
2. If it returns `null`, skip this section (no gutter number). Do not throw or log excessively.
3. If it returns a `MarkdownSectionInformation` object, read `lineStart` (zero-indexed).
4. Create a gutter element — a `div` or `span` with class `rv-line-number` — containing the value `lineStart + 1` (to match the editor's one-indexed display).
5. Prepend or position this gutter element relative to the section's container element.

### Important API detail

`getSectionInfo()` returns `{ lineStart: number, lineEnd: number, text: string } | null`. The `lineStart` and `lineEnd` are zero-indexed positions in the full document source. The `text` field is the full document text.

## Styling (styles.css)

The gutter numbers should:

- Sit in the left margin of the reading view content area.
- Be right-aligned within a fixed-width gutter column.
- Use a monospace font.
- Use a muted colour (match Obsidian's `--text-faint` CSS variable).
- Not interfere with the content layout or readable line length setting.
- Visually resemble the editor's native line number gutter as closely as possible.

Use Obsidian's CSS custom properties where available for theme compatibility. The reading view content container has class `.markdown-reading-view`. Each rendered section is a child within `.markdown-preview-section`.

Position the gutter numbers using `position: relative` on the section container and `position: absolute` on the gutter element, placed to the left of the content.

## Settings

### Interface

```typescript
interface ReadingLineNumbersSettings {
  enabled: boolean;
}
```

Default: `enabled: true`.

### Settings Tab

A single toggle: "Show line numbers in Reading View".

When the setting changes, the plugin must force a re-render of all open reading views. Do this by iterating through `app.workspace.iterateAllLeaves()`, finding leaves with `MarkdownView` instances in "preview" mode, and calling their `previewMode.rerender(true)` method.

### Persistence

Use `this.loadData()` and `this.saveData()` as per standard Obsidian plugin patterns.

## Edge Cases to Handle

1. **Frontmatter (YAML):** `getSectionInfo()` line numbers should already account for frontmatter. Verify this during testing — if frontmatter occupies lines 0–3, the first content block should report `lineStart: 4`.
2. **Callouts and blockquotes:** These may or may not receive their own `getSectionInfo()` call. Test and document behaviour.
3. **Transclusions/embeds:** Content rendered from other files. `getSectionInfo()` may return null for these. The null check handles this — no gutter number shown.
4. **Code blocks:** These render as `<pre>` elements. They should receive a single gutter number for the opening line of the code fence in the source.
5. **Empty documents:** No sections rendered, no gutter numbers. Nothing to handle.
6. **Plugin disabled:** When `enabled` is `false`, the post-processor should return immediately without injecting any elements.

## What Not To Do

- Do not use Editor Extensions or CodeMirror. This plugin operates exclusively in Reading View.
- Do not attempt to number every visual line after soft-wrapping. Only number by source-line position.
- Do not add complexity around Live Preview. The post-processor does not fire in Live Preview and that is correct — the editor handles its own line numbers there.
- Do not add excessive configuration. One toggle is sufficient for v1.

## Testing Checklist

- [ ] Line numbers appear in Reading View when enabled
- [ ] Line numbers disappear when disabled via settings
- [ ] Numbers match the editor's line numbers for the same blocks
- [ ] Frontmatter offset is correct
- [ ] Documents with headings, paragraphs, lists, code blocks, blockquotes all show correct numbers
- [ ] Toggling between Reading View and Editing View shows consistent numbering at block boundaries
- [ ] Theme switching doesn't break the gutter styling
- [ ] Long documents perform acceptably (no visible lag)
- [ ] Readable line length setting (on/off) doesn't misalign the gutter
