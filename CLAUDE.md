# Reading View Line Numbers — Obsidian Plugin

## Project
Obsidian plugin that displays source-line numbers in the Reading View gutter.
Numbers map rendered blocks back to their source line positions (matching Editing View line numbers).

## Key Files
- `main.ts` — Plugin class, post-processor registration, settings load/save
- `settings.ts` — PluginSettingTab and ReadingLineNumbersSettings interface
- `styles.css` — Gutter styling using Obsidian CSS variables
- `manifest.json` — Plugin metadata
- `package.json` / `tsconfig.json` / `esbuild.config.mjs` — Build toolchain

## Core Mechanism
- `registerMarkdownPostProcessor` is the only Obsidian API hook used
- `context.getSectionInfo()` returns `{ lineStart, lineEnd, text } | null`
- `lineStart` is zero-indexed; display as `lineStart + 1`
- Null return = skip (transclusions, embeds, etc.)

## Settings
- Single setting: `enabled: boolean` (default: true)
- On change: iterate `app.workspace.iterateAllLeaves()`, rerender preview-mode MarkdownViews

## Constraints
- No CodeMirror / Editor Extensions — Reading View only
- No Live Preview support (intentional)
- No extra dependencies beyond Obsidian API
- One toggle only for v1

## Build
```bash
npm install
npm run build   # esbuild output to main.js
```

## Plan Reference
See `reading-view-line-numbers-plan.md` for full spec and testing checklist.
