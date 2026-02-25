# Reading View Line Numbers — Obsidian Plugin

## Project
Obsidian plugin that displays source-line numbers in the Reading View gutter.
Numbers map rendered blocks back to their source line positions (matching Editing View line numbers).

## Key Files
- `main.ts` — Plugin class, post-processor registration, context menus, settings load/save
- `settings.ts` — PluginSettingTab and ReadingLineNumbersSettings interface
- `styles.css` — Gutter styling using Obsidian CSS variables
- `manifest.json` — Plugin metadata (id: reading-view-line-numbers)
- `package.json` / `tsconfig.json` / `esbuild.config.mjs` — Build toolchain

## Core Mechanism
- `registerMarkdownPostProcessor` is the only Obsidian rendering hook used
- `context.getSectionInfo(element)` returns `{ lineStart, lineEnd, text } | null`
- `lineStart` is zero-indexed; display as `lineStart + 1`
- Null return = skip (transclusions, embeds, etc.)
- Always skip sections where `lineStart < frontmatterLineCount` — the frontmatter
  section fires the post-processor with lineStart=0 and produces a phantom gutter
  number that visually overlaps the first content block

## Settings
- `enabled: boolean` (default: true) — controls *default* state when opening a reading view
- `countFromContent: boolean` (default: false) — when true, subtract frontmatter
  line count so first content line = 1
- On change: iterate `app.workspace.iterateAllLeaves()`, rerender preview-mode MarkdownViews

## Per-Window Toggle
- `leafOverrides: WeakSet<HTMLElement>` keyed by `leaf.view.previewMode.containerEl`
- Presence means "opposite of the global default" (not simply "disabled")
- Visibility rule: `shouldShow = settings.enabled XOR leafOverrides.has(containerEl)`
- Toggle action: flip presence in `leafOverrides` (add if absent, delete if present)
- Three entry points: body contextmenu (DOM event), tab right-click and file navigator
  right-click (both via `workspace.on('file-menu', ...)`)
- File navigator case: finds all reading view leaves showing that file path, toggles all
- `isEnabled` passed to menu helper: `settings.enabled !== leafOverrides.has(containerEl)`

## Known Gotchas
- Obsidian plugin folder name MUST match the `id` field in manifest.json
  (folder was originally `line_numbers_for_reading_mode`, id is `reading-view-line-numbers`)
- `builtin-modules` must be in devDependencies — not included in Obsidian sample plugin
  but required by esbuild.config.mjs
- Post-processor fires for the frontmatter/properties section element; getSectionInfo()
  returns a valid result with lineStart=0, causing a phantom "1" gutter unless skipped
- Per-window disabled state is lost on app restart (WeakSet is in-memory only)

## Constraints
- No CodeMirror / Editor Extensions — Reading View only
- No Live Preview support (intentional)
- No extra dependencies beyond Obsidian API + builtin-modules (devDep)
- One global toggle + one counting mode toggle for v1

## Build & Deploy
```bash
npm install
npm run build   # esbuild output to main.js

# Deploy to vault (folder must be named reading-view-line-numbers)
cp main.js styles.css "/Users/rlarsen/Documents/Obsidian/rlarsen vault/.obsidian/plugins/reading-view-line-numbers/"
```

## Plan Reference
See `reading-view-line-numbers-plan.md` for original spec and testing checklist.
