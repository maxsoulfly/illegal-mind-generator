# CLAUDE.md

# PRIORITY TODO (cleanup, not urgent)

**Storage unification is functionally done — cleanup pass still needed.** Saved entries, shorts queue, tag overrides, tag visibility overrides, form data, panel visibility, active page, selected project, saved-library visibility, and hide-queue-hidden all now read/write `illegalMindGeneratorData` exclusively. What's left:
- `appBackup.js` still captures/restores the old standalone legacy keys via a `legacy` field — no longer needed since the unified key has everything live. Safe to remove.
- `storageMigration.js` and its `window.previewUnifiedStorageMigration` / `writeUnifiedStorageMigration` exposure in `App.jsx` are obsolete — each hook now does its own one-time fallback-and-migrate instead.
- The old standalone localStorage keys (`savedEntries`, `shortsQueueByProject`, `tagOverrides`, `tagVisibilityOverrides`, `formData`, `panelVisibility`, `activePage`, `selectedProject`, `showSavedLibrary`, `hideQueueHidden`) are now inert — nothing reads or writes them anymore. Safe to delete from localStorage once confident nothing regressed.

Do this cleanup only after a few real sessions confirm nothing else was silently relying on stale legacy data (a stale unified `savedEntries` snapshot once shadowed live Todo statuses — recovered, but be alert for similar surprises in shorts queue / tag overrides / tag visibility).

---

# Illegal Mind Generator

Local-first React app for generating and managing YouTube content packaging for two music channels. Generates titles, hooks, thumbnails, descriptions, hashtags, and tags. Also manages saved entries, tag library, upload queues, todo tracking, and project settings.

---

# Projects

**Illegal Mind Covers** — post-apocalyptic SIGNAL series. Transformation-based (Darker, Heavier, Hardcore, etc.). Heavy lore and worldbuilding.

**Maxx Dee Covers** — traditional faithful covers. Modernized recordings, performance-focused. Less lore.

---

# Tech Stack

React · JavaScript · Vite · localStorage · JSON config. No backend, no database, no API.

---

# Development Environment

`npm run dev` is always running. Vite live reload is the workflow. Do not suggest restarting unless there is a real reason.

Workflow: Discuss → Review architecture impact → Small grouped steps → Test → Commit → Continue.

---

# Core Architecture

Config-driven. `src/config/projects.json` + localStorage overrides = resolved project config. The resolved config is the source of truth for all generation.

```
src/
├── components/   UI and feature components
├── config/       projects.json
├── engine/       generation logic (no React)
├── hooks/        custom React hooks
├── pages/        page-level orchestration only
└── utils/        storage helpers
```

**Rules:** Pages orchestrate. Feature logic in feature components. Generation in `src/engine`. Storage in `src/utils`. No generation logic in components. No UI logic in engine files.

---

# Major Systems

- **Generator** — main workflow. Inputs: artist, song, signal number, video type, tags, notes. Outputs: titles, hooks, thumbnails, descriptions, hashtags, tags.
- **Saved Library** — per-project song database. Search, sort, import/export, load into generator.
- **Tag Library** — transformation tag management. Editable phrases, hashtags, hooks, visibility. Deeply connected — tag changes affect titles, descriptions, hooks, hashtags.
- **Shorts Queue** — upload planning. ~20-item queue with randomization, duplicate spacing, exclusions.
- **Todo System** — cover planning. Statuses: Wishlist, Needs Re-record, Needs Remaster, Needs Video.
- **Backup System** — full export/import. Must remain reliable — it's the safety net for storage work.
- **Project Settings** — per-project config overrides for hooks, titles, descriptions, links, blocks (Lists / Text Blocks), general settings.
- **UIKit** — living component catalog at the `/uikit` nav route. Browse before building anything new. Covers all reusable UI primitives with interactive examples.

---

# Storage Architecture

**Main key:** `illegalMindGeneratorData`

```js
{
  version,
  savedEntries,        // [projectId] → entries array
  tagOverrides,        // [projectId][tagId] → partial override
  tagVisibilityOverrides, // legacy — do NOT remove
  shortsQueues,        // [projectId] → queue array
  ui,                  // activePage, selectedProject, panelVisibility, projectSettingsSection
  generator            // formData
}
```

**Rules — these matter:**
- All live app state now reads/writes `illegalMindGeneratorData` exclusively (unification completed — see PRIORITY TODO for remaining cleanup). The standalone legacy localStorage keys are inert leftovers, not active data sources — don't assume code still reads them.
- `tagVisibilityOverrides` as a *field inside* the unified object must stay — that's a data-shape compatibility concern, separate from the now-dead standalone legacy key of the same name.
- No automatic migration — migration is intentionally paused
- Storage changes are high risk: backup → verify shape → add safe fallbacks → test export/import → test refresh persistence
- When migrating a hook off a legacy key, don't assume a populated unified field is authoritative — it may be a stale one-time snapshot. Verify which source actually has live data before preferring it.

---

# UI Primitives (`src/components/ui/`)

- `TemplateGroupCard` — generic collapsible card: label + reset + optional subtitle/slider + `children`. The template list (count line + `HookTemplateEditor`) only renders when `onUpdateTemplates` is passed — omit it to use the card as a plain content shell (see `ProjectSettingsGeneral`'s Project Info/Actions/Backup cards). Optional `placeholders` prop passes through to `HookTemplateEditor` (see below); omit it to keep the default `HOOK_PLACEHOLDERS` autocomplete. Base for `ShortHookCard` and description cards.
- `ShortHookCard` — adapter over TemplateGroupCard for hook-specific data shape (`hookConfig` object + `hookType`). **TODO:** evaluate collapsing adapter once hook data shape is refactored.
- **TODO:** extract `CardHeader` component (h3 + reset button + optional remove button + count badge) — then refactor TemplateGroupCard and ShortHookCard to use it.
- `HookTemplateEditor` — searchable template list with add/bulk/highlight+scroll support. `noWrapper` prop skips the `<details>` collapse wrapper (used by Hook Blocks tab where the parent card already collapses). Optional `placeholders` prop (default `HOOK_PLACEHOLDERS`) controls the `{placeholder}` autocomplete — pass `[]` to disable it entirely (literal-text fields like Thumbnail words/fallbacks) or a smaller list like `THUMBNAIL_TAG_PLACEHOLDER` (`src/utils/hookPlaceholders.js`) for fields that only support one substitution.
- `SubTabNav` — lightweight tab nav (underline active, no pill borders). Takes `tabs: [{id, label}]`. Scrolls horizontally instead of wrapping when tabs don't fit the container (`overflow-x: auto`, `flex-wrap: nowrap`) — this matters in narrow contexts like a `tag-library` grid cell, not just small viewports. Used by `TagEditorTabs.jsx` (Tag Library's Basics/Titles/Descriptions/Short Hooks/Hashtags tabs) as well as Description Long/Shorts and Blocks sub-tabs.
- `NavLinkButton` — clickable text for source navigation. `muted` prop for base hooks.
- `PhraseRow` — forwardRef row, onBlur save, `highlighted` prop for scroll target. Optional `placeholders` prop enables the `{placeholder}` autocomplete on its field (see `PlaceholderField`); used by `HookTemplateEditor` (project-level hooks) and `TagShortHooksTab`/`TagPhraseEditor` (per-tag hooks) via the shared `HOOK_PLACEHOLDERS` in `src/utils/hookPlaceholders.js`. `TagPhraseEditor`'s title/hashtag phrase editors don't pass any yet. CSS: flex lives on `.placeholder-field` wrapper (not `.form-input` directly) so the input fills its flex slot responsively.
- `PlaceholderField` — input or textarea (`multiline` prop) with a `{placeholder}` autocomplete dropdown: typing `{` starts tracking a query, filters the passed-in `placeholders` array (braces included, e.g. `'{artist}'`), arrow keys + Enter to select, Escape/click-away to dismiss, inserts at cursor. Two save modes — `onBlur` (commit only on blur; `PhraseRow`/`TextBlockEditor`) or `onChange` (live, every keystroke and every insert; `ToggleInputRow`'s prefix/suffix fields, which are fully-controlled). Resyncs on external `defaultValue` change (e.g. reset) without needing a remount. Each caller supplies its own contextually-correct placeholder list — Text Blocks: `artist`/`song`/`year`/`tagLine`/`links.*` (matches `generateCustomBlocks.js`'s `renderTextTemplate`); Hooks: `HOOK_PLACEHOLDERS` from `src/utils/hookPlaceholders.js` (matches `generateShortHooks.js`'s `fillHookTemplate`); Title prefix/suffix: `{num}` only (matches `generateTitles.js`). Keep these in sync if the underlying engine substitutions change.
- `ToggleInputRow` — checkbox + label + input (clicking label toggles checkbox). Input is a `PlaceholderField` in `onChange` (live) mode; optional `placeholders` prop enables the autocomplete (used by Title prefix/suffix fields).
- `LabelInputRow` — label + input, `compact` mode via `form-input--compact`
- `LabelSliderRow` — label + range slider + value display. Passes `--val` CSS custom property to the `<input type="range">` so the global slider theme (amber fill, amber thumb) works via a linear-gradient background.
- `AddBulkRow` — + Add / + Bulk button row
- `BulkTextarea` — textarea + Apply/Cancel. Input is a `PlaceholderField` (`multiline`, `onChange` live mode); optional `placeholders` prop enables the autocomplete (wired in `HookTemplateEditor`/`TagPhraseEditor`).
- `IconButton` — shared shell for every small action button, icon or text (reset ↺, remove ×, lock 🔒/🔓, move ↑/↓, add +, or labeled buttons like "+ Add"/"Apply"/"Cancel"/"Duplicate Project" — `icon` is just rendered as children, no icon required). Takes `icon, title, onClick, disabled, stopPropagation, className`. `onClick` is optional (no-op if omitted — used by not-yet-wired placeholder buttons). Default `className` is `tag-reset-button`; pass `button-secondary` (or another) to reuse the click/disabled wiring with a different look.
- `MoveControls` — up/down reorder button pair built on `IconButton`. Used by list items and description block reordering; pass `className` for context-specific layout (see `.desc-block-move-controls`).
- `SavedEntryRow` — shared row shape (`saved-entry-row terminal-block` → signal number + artist/song title button + tags) used by `SavedLibraryItem`, `ShortsQueueItem`, `TodoItem`. `middle` slot for extra content between the main row and actions (Todo's note preview); `actions`/`actionsClassName` for the differing per-page controls. Don't hand-roll this markup — extend the props if a new caller needs something different.
- `OutputItem` (`src/components/ui/OutputItem.jsx`) — generated output block: text + `CopyButton`, used by `HashtagsPanel`, `YouTubeTagsPanel`, `DescriptionsPanel`. Default `textClassName='output-text'` gives pre-wrap monospace styling (single-line output like hashtags/tags). `DescriptionsPanel` passes `textClassName={undefined}` + `textStyle={{whiteSpace:'pre-line'}}` — deliberately different styling for multi-paragraph descriptions, not an oversight, don't "fix" it to match the default. `copyText` lets the copied text differ from displayed text (Descriptions appends a footer via `renderCopyFooter()`).
- `CollapsiblePanel` (`src/components/ui/CollapsiblePanel.jsx`) — the `panel`/`panel-collapsed` + `panel-header` + `ToggleButton` shell shared by every Generator output panel (`HashtagsPanel`, `YouTubeTagsPanel`, `TitlesPanel`, `ThumbnailsPanel`, `ShortHooksPanel`, `DescriptionsPanel`). Takes `label, visible, onToggle, onNavigate?, headerExtra?, children`. `onNavigate` swaps the plain `<h2 className="panel-title">` for a clickable `panel-title--nav` button (Titles/Descriptions/Thumbnails link back to Project Settings). `headerExtra` renders between the title and the `ToggleButton` — currently unused by any panel (Titles moved its Hooks toggle out of the header into a body-level options row instead, see below); the slot still exists for a future header-level control. Plain `.panel` (no header/toggle — `ProjectSettingsPage`, `GeneratorPage`, `GeneratorResultsPanel`, `SavedLibrary`) is a separate, still-valid bare-wrapper usage — not every `.panel` needs to become a `CollapsiblePanel`.
- `FormSelect` — the standard `form-select` dropdown (same look as `TodoStatusSelect`) wrapped with `stopPropagation` for use inside clickable card headers. Takes `value, onChange(value), options: [{value, label}]`.
- `FormField` (`src/components/ui/FormField.jsx`) — `{ label, children, className? }` wrapper around the `form-group`/`form-label` pattern. Used in `InputForm`, `BasicSongFields`, `AdvancedDescriptionFields`, `TagBasicsTab`, `TagPhraseEditor`, `ProjectTextField`, `TodoFields`. Don't hand-roll `<div className="form-group"><label className="form-label">`. Optional `className` is appended to `form-group` for scoped tweaks (e.g. `BasicSongFields`' `basic-song-fields__artist-group` tightens spacing across the Artist/toggle/Artist-Short cluster) — don't use it to reimplement spacing that a shared descendant rule should own instead.
- `ToggleField` (`src/components/ui/ToggleField.jsx`) — `{ label, checked, onChange, title? }` controlled checkbox + label (clicking the label toggles it too). Use for any settings toggle, including ones backed by state that can change out from under the component (e.g. loading a different saved entry) — it's controlled (`checked`, not `defaultChecked`) specifically so that resyncs correctly. Optional `title` forwards to the wrapping `<label>` as a native tooltip (e.g. Titles panel's Hooks toggle: "Mix shorts hooks into long title candidates"). For a checkbox + label + text input in one row, use `ToggleInputRow` instead (it requires the input; it's not a bare checkbox+label alternative).
- `CopyButton` (`src/components/CopyButton.jsx`) — clipboard copy with a temporary "Copied ✔️" state (500ms). Takes `text`. Used in every output panel (Descriptions, Hashtags, YouTube Tags, titles/hooks).
- `BlockEditorCard` — collapsible card shell for all three block type editors (Lists, Text Blocks, Hook Blocks). Props: `label`, `badge`, `scope`, `target`, `onScopeChange`, `onTargetChange`, `hasOverride`, `onReset`, `onDelete`, `onRename`, `open`, `children`. `onRename` enables an inline ✏ rename button in the header — clicking switches to an input; Enter/blur saves, Escape cancels.
- `BlockInfoCard` — non-collapsible card used in Description layouts. Props: `label`, `onRemove`, `onAdd`, `onNavigate`. When `onNavigate` is set, the header becomes a clickable nav shortcut (`tag-card-toggle` style, `→` indicator) that jumps to the block's editor tab and auto-expands it — Hook blocks → Blocks → Hook Blocks, List blocks → Blocks → Lists, Text blocks → Blocks → Text Blocks. `onAdd` renders a `+` button (Available column); `onRemove` renders a `×` button (Active Layout column). Generated blocks (no editor) omit `onNavigate` and are non-interactive. Descriptions tab is layout-only; no inline editing of any block type.
- `AppHeader` (`src/components/AppHeader.jsx`) — sticky app-level header. Contains nav tabs (looped from `PAGE_LABELS`), project selector, page `<h1>` (derived from `activePage` + `projectConfig.name`), and optional `actions` slot for page-specific buttons (currently only the Regenerate button on Generator page). Replaces the deleted `AppMenu.jsx`. Do not add page titles (`<h1 className="app-title">`) in individual pages — they belong here. `uikit` is intentionally excluded from `PAGE_LABELS` (not a top nav tab) — reachable only via the "Open UIKit" button in `ProjectSettingsGeneral`'s Actions card, wired through `onOpenUIKit`.

---

# Known Gotchas

**Storage is sensitive.** Changing storage casually can break saved entries, queues, todos, backup import/export.

**`handleSaveEntry` / `handleLoadEntry` have explicit field lists.** Adding a new `formData` field does NOT automatically persist it per-entry — you must add it to both functions in `useSavedEntries.js`. Fields currently saved/loaded: `artist`, `song`, `signalNumber`, `originalYear`, `originalGenre`, `useCustomArtistShort`, `artistShort`, `transformationTags`, `customHashtags`, `customCta`, `songBlockOverrides`, `excludeFromRandomizer`, `todo`. `videoType` is intentionally omitted (session/UI state). `changesMade`/`extraVibeNote` are reserved but unused.

**Laptop is source of truth.** Desktop sync testing is incomplete.

**Tag system is deeply connected.** Tags affect titles, descriptions, hooks, hashtags, usage tracking.

**Tag `description`/`shortHooks` must be deep-merged, not shallow-spread, wherever base config meets override.** Both are nested objects (`description: {technical, log, status}`, `shortHooks: {hookType: [...]}`) — a plain `{...baseTag, ...override}` lets the override's key wholesale-replace the base's, silently dropping every sub-key the override doesn't happen to cover (e.g. an override touching only `shortHooks.nostalgia` wipes `emotion`/`transformation`/etc. from display *and* generation, since `buildResolvedProjectConfig.js` feeds `generateShortHooks.js` directly). Both `buildResolvedProjectConfig.js` (tag-override merge loop) and `buildTagExplorerData.js` (`registryTag` construction, feeds the Tag Editor's `tag.maps`) now explicitly merge `description`/`shortHooks` one level deep, matching `useTagOverrides.js`'s `syncProjectTags` (which already did this correctly via `mergeDescription`/`mergeShortHooks` — the bug was only in the two *resolution* points, not the sync logic itself). `title`/`thumbnail`/`hashtags` are flat arrays with no sub-keys, so a plain shallow spread is correct for those — don't add merge logic there. If you add another nested per-field object to a tag, give it the same one-level-deep treatment in both places.

**`{tags.<category>}` placeholders resolve from tag `category`, not tag key.** `{tags.era}`/`{genre}`/`{intent}`/`{mood}`/`{lang}`/`{energy}`/`{production}`/`{tempo}` each map to a tag `category` value (only `lang` is aliased — it maps to the `language` category; all others match the category name exactly). If multiple selected tags share a category, one is picked at random; if none match, resolves to `''`, not the literal placeholder text. Add a new category alias in `TAG_CATEGORY_ALIASES` (`descriptionTagHelpers.js`) and the matching token in `TAG_CATEGORY_PLACEHOLDERS` (`hookPlaceholders.js`) together — they must stay in sync.

**Hook block "Lines" count only works through `resolveHookBlockOutput`.** Every generic hook block (including custom ones) resolves its multi-line output through `pickRandomLines`/`resolveHookBlockOutput` in `generateCustomBlocks.js`, which reads `hookBlockCounts`/`hookBlockMaxLines` for that block's key. `statusLines` and `technicalLines` have their own dedicated functions (`generateBroadcastBlock.js`/`generateTechnicalBlock.js`) because they merge per-tag lines with project-level lines before picking — they reuse `pickRandomLines` for the final random selection, but not `resolveHookBlockOutput`. A new hardcoded multi-line block that needs tag-specific merging should follow that same pattern (own function + `pickRandomLines`), not `resolveHookBlockOutput` (which assumes a flat template array from `hookBlocks` config).

**All placeholder resolution goes through `src/engine/placeholders.js`.** `fillPlaceholders(template, ctx)` / `pickViableTemplate(templates, ctx)` are the single implementation used by hooks, titles, and every description block (custom text/hook blocks, broadcast/technical/log blocks) — don't hand-roll a `.replace()` chain for a new placeholder token, add a resolver to the `REGISTRY` object instead (it auto-propagates to `HOOK_PLACEHOLDERS`, the UI autocomplete list, via `REGISTRY_TOKENS`). **Any candidate whose placeholders would resolve empty is dropped before picking, not shown with a gap** — e.g. a hook/line using `{tags.genre}` simply won't be selected when no genre-category tag is chosen. There is no "fall back to showing it anyway" safety net; if a whole pool is empty-valued, that block/hook/title slot silently produces nothing for that generation. `num` and `transformation` are handled specially (not plain `REGISTRY` entries) — `num`'s fallback text differs per caller (hooks/titles use `'XX'`, descriptions use `'00'`), and `transformation` fills its own nested `transformationBlock` template via `ctx.overrides.transformation` (hooks/titles, computed once per batch) or resolved fresh per-call (descriptions).

**Shorts description blocks must carry a `source` to be clickable.** `generateShortDescriptions.js`'s `renderShortLine` returns `{ text, source }` per block — a new block-resolution branch that doesn't set `source` (or sets it to `undefined`) silently renders as inert plain text in `DescriptionsPanel`, no error. `source` is one of: `{ type: 'block', blockKey, blockType: 'hook'|'list'|'text', template?, pickedItem? }` (resolve `blockKey` through `buildHookBlockMaps(...).layoutKeyToBlockKey` for hook blocks, since layout key and config key can differ — e.g. `coverLine` → `shortsHeader`; `template`/`pickedItem` come from `resolveHookBlockOutput`/`renderStructuredBlock`'s enriched return and drive exact-highlighting — omit them and clicking still opens the right block, it just won't highlight a specific row), or the hook object itself (`{ sourceType, sourceTag, hookType, sourceText }`) for hook-pool-sourced text — `sourceText` already doubles as the highlight target, no extra field needed there. This only covers Shorts — Long descriptions don't have this mechanism. **`resolveHookBlockOutput`/`renderStructuredBlock` return `{ text, ... }` objects, not plain strings** — every caller must extract `.text`; a new caller that forgets this will get an always-truthy object where it expects a string/falsy-empty check (this exact bug existed transiently in `generateShortDescriptions.js`'s list-block branch during development). **`source.blockType` (`'hook'|'list'|'text'`) is not the same string as the Blocks tab's subTab id** — `ProjectSettingsBlocks.jsx`'s `SubTabNav` ids are `'hooks'`/`'lists'`/`'text'` (`'list'`→`'lists'` and `'hook'`→`'hooks'` don't match directly). Always go through `BLOCK_TYPE_SUBTABS` (`customBlocks.js`) to convert a `blockType` to its `{ subTab, label }` pair — don't hand-roll the mapping (a `blockType === 'hook' ? 'hooks' : blockType` one-off ternary shipped as a real bug: it silently sent `subTab: 'list'` for list blocks, which matches none of `ProjectSettingsBlocks.jsx`'s three branches and renders an empty Blocks panel on click).

**Title engine key names.** `projects.json` for Illegal Mind uses `longPrefix` (legacy) instead of `prefix`. Engine reads `config.title?.prefix || config.title?.longPrefix`. Do not consolidate — legacy key must stay.

**Short Hooks vs Shorts Titles.** Two separate systems:
- `generateShortHooks.js` — hook-based shorts titles, reads `shortsPrefix`/`shortsSuffix` (fallback: `shortHookSuffix`)
- `generateTitles.js` Shorts mode — transformation-based shorts titles, same keys

Both editable via Project Settings → Titles → Generation card. `shortHookSuffix` in `projects.json` is legacy fallback — do not remove.

**`generateShortHooks.js`'s hook objects carry both `text` (Shorts-wrapped) and `rawText` (unwrapped).** `text` has the Shorts prefix/suffix baked in — that's what the Shorts Hooks panel, Shorts-mode titles (`ShortHookTitles.jsx`), and the Shorts description "hook" block all correctly want. But this same hook array is reused by `generateTitles.js`'s `buildHookTitles` (the "mix hooks into Long titles" feature) — it must use `hook.rawText` and wrap it with the *Long* prefix/suffix instead, or the Shorts suffix ends up trapped inside the Long-wrapped title (double-wrapped). Any new consumer of this hook pool needs to pick the right field depending on which prefix/suffix scheme it's rendering for — don't default to `.text` without checking which context you're in.

**Title object shape.** Generated titles are objects: `{ text, sourceHook, sourceTemplate }`.
- `sourceHook` → `{ sourceType: 'tag'|'base', sourceTag, hookType, sourceText }`
- `sourceTemplate` → `{ template, groupName }`
- Both null for plain text titles.
- `NavLinkButton` in `GeneratedTitle` (`src/components/output/GeneratedTitle.jsx`, renamed from `GeneratedTitlePair` when thumbnails were split into their own panel) handles all four cases.

**`tagVisibilityOverrides` is legacy.** Do not remove. Treat as compatibility-sensitive.

**Block label overrides live in two separate keys** inside `projectSettingsOverrides.description`:
- `blockLabelOverrides[blockKey]` — overrides display label for JSON-default List/Text blocks (from `KNOWN_CUSTOM_BLOCKS`)
- `hookBlockLabelOverrides[blockKey]` — overrides display label for JSON-default Hook blocks (from `projects.json`)
- User-created blocks store their label directly (`blockData.name` for List/Text, `customHookBlocks[i].label` for Hook) — no separate override key needed.
- `LongDescriptionSettings` and `ShortsDescriptionSettings` use `getLayoutBlockLabel(blockKey)` which checks both override maps before falling back to config labels. If you add a new place that displays block labels, make sure it also checks these overrides.

**A new block's key must avoid three namespaces, not one.** `generateBlockKey(name, existingKeys)` only guards against whatever `existingKeys` it's given — it has no built-in awareness of any other namespace. A block's key can collide with: (1) other `customBlocks` keys (List/Text share one namespace), (2) any hook block's own `key`, or (3) any hook block's `descriptionLayoutKey` (its *layout* key, which can differ from `key`). All three "Add block" forms (`ProjectSettingsTextBlocks.jsx`, `ProjectSettingsLists.jsx`, `ProjectSettingsHookBlocks.jsx`) must pass a combined `existingKeys` covering all three. A collision is **silent, not an error, and worse than just a display bug** — `resolveBlockSource`/`makeLayoutLabelResolver` (`descriptionLayout.js`) check the hook-layout-key namespace before `customBlocks` (orphaning the colliding block from the Descriptions layout builder), *and* `generateDescriptions.js`'s `blocks` map spreads `renderedCustomBlocks` last (silently overwriting the hook block's actual generated output) — a real case (Text block "Intro Block" → key `introBlock`, colliding with `introHook`'s `descriptionLayoutKey: 'introBlock'`) shipped exactly this way before being fixed 2026-07-10. Existing colliding data self-repairs via `resolveCustomBlockCollisions` (`customBlocks.js`, run from `App.jsx`) for Project-scoped blocks — Song-scoped collisions still need manual resolution (see Current Focus above).

**Avoid premature database work.** Migration is postponed. Current priority is feature completeness.

---

# Block Type System

The description block system is designed to be fully UI-configurable. The goal: a user should be able to build a new project from scratch — different language, different goals, original songs — without editing any JSON.

`projects.json` is a **bootstrap template only**. All real configuration lives in localStorage overrides (backed up/restored via Backup System), eventually migrated to a DB once feature-complete.

## Block types

| Type | What it is | User-creatable | Examples |
|---|---|---|---|
| **List** | `{ title, items: [{ label, text\|link }], scope, target, itemType, isCore, name, displayMode }` | **Yes — built** | `gearBlock`, `supportBlock`, `playlistBlock` |
| **Text** | Single paragraph, optional `{placeholders}`. Legacy blocks are a plain string; UI-created ones are `{ text, scope, target, isCore, name }` | **Yes — built** | `mixingCtaBlock`, `customCtaBlock` |
| **Hook Block** | Array of strings, one picked at random per generation. ALL phrase-template arrays across Long and Shorts descriptions are now Hook Blocks. Song-scoped ones get per-song override fields in the generator. Edited in Project Settings → Blocks → Hook Blocks. | **Yes — built** | `storyBlock`, `logBlock`, `introHook`, `broadcastHeader`, `statusLines`, `technicalLines`, `closingSignal`, `philosophyLine`, `shortsHeader`, etc. |
| **Generated** | Engine-driven output, parameters only | No (engine code required) | `supportBlock`, `tagLine` |

All List/Text blocks live together in `customBlocks` under `templates.long` regardless of which description(s) they `target` — `target` decides eligibility for Long/Shorts, not storage location. `src/utils/customBlocks.js` is the shared home for `isListBlock`/`isTextBlock`/`getBlockLabel`/`generateBlockKey`/`updateLongKey`/`removeLongKey` AND `SCOPE_OPTIONS`/`TARGET_OPTIONS` — all block-type editors (List, Text, Hook) import from here. `generateBlockKey` collision checks must see *every* `customBlocks` key regardless of type (List and Text share one namespace).

**List `displayMode`** (`'all'` default, or `'random'`): `renderStructuredBlock` either joins every item (current behavior, unchanged) or picks one item at random per generation. Useful for CTA-style lists where you want variety instead of always showing every line.

**`customCtaBlock` is Text, not List**, as of the migration that combined its two CTA lines into one paragraph (joined with `\n`) — this matches the shape of the per-song override mechanism below, removing a structural mismatch where the project default was a List but the override was always plain text. If a project's stored override for `customCtaBlock` predates this (still List-shaped), it'll keep showing in the Lists tab until "Reset to default" (↺) is clicked once, after which it resolves to the new Text default and moves to the Text Blocks tab.

## Per-song block overrides (`formData.songBlockOverrides`)

Any Text or List block with `scope: 'song'` gets a collapsible override field automatically in the generator's Advanced panel (`AdvancedDescriptionFields.jsx`'s `SongBlockOverrideFields` — a generic loop, not per-block code). Text overrides are plain strings; List overrides are `{ items: [...] }` objects — the mini list editor (`SongListBlockEditor`) initializes from the project-default items so the user edits from a known baseline, and a ↺ button removes the override entirely. Writes to `formData.songBlockOverrides[blockKey]`, persisted with the saved entry (`useSavedEntries.js`) — and since `formData`/`savedEntries` already live in the unified storage that `appBackup.js` exports wholesale, this is automatically included in backups, no separate backup code.

Engine: `renderCustomBlock(block, projectConfig, formData, tagLine, songOverride)` takes the override as its last param — when it is `{ items: [...] }`, renders as a structured block using the project-level block's `title`/`displayMode`; when a non-empty string, renders as plain text — used by both `generateDescriptions.js` (Long) and `generateShortDescriptions.js` (Shorts) via `getEffectiveSongOverrides(formData)`, which merges in one **legacy field that predates this mechanism**: `formData.customCta` (→ `customCtaBlock`). `songBlockOverrides` wins when both are set — `useSavedEntries.js`'s `handleLoadEntry` seeds `songBlockOverrides.customCtaBlock` from legacy `entry.customCta` on load (if not already set), so old saved data shows up in the new field and migrates forward on next save, with no manual migration step.

**Project Settings → Blocks** has three sub-tabs (`ProjectSettingsBlocks.jsx`): Lists, Text Blocks, and Hook Blocks. All three use `BlockEditorCard` (shared card shell: collapse, Scope/Target selects, `BlockActions`). List/Text editors (`StructuredListEditor` / `TextBlockEditor`) use `BlockActions` (Reset for JSON-default blocks; Lock + Delete for user-created ones). Hook Blocks (`ProjectSettingsHookBlocks.jsx`) is fully config-driven from `description.hookBlocks` per project — covers ALL phrase-template arrays across Long and Shorts, plus user-created ones (see below). Each card shows: Target dropdown (Long/Shorts/Long+Shorts), Scope dropdown (Project/Song), ↺ reset (JSON-default blocks) or × delete (user-created). Expanded body: Lines row with slider + max number input (slider only appears when max > 1); template editor via `HookTemplateEditor noWrapper`. All three tabs share `AddBlockForm` (name + scope + target + add button); Lists additionally has a Type dropdown via `AddListBlockForm`.

**Dynamic Hook Blocks** — user-created hook blocks are stored as `description.customHookBlocks: [{ key, label }]` in overrides. Templates stored in `description.templates.long[key]` (same as `path: 'long'` static blocks). `buildResolvedProjectConfig.js` appends these to `projectConfig.description.hookBlocks` during resolution, so all downstream code (engine, Descriptions tab palette, `resolveHookBlockTemplates`) sees them automatically. Collision checking uses both existing hookBlock keys and customBlocks keys.

**`hookBlocks` config shape** (in `projects.json description.hookBlocks`): `{ key, label, path, templateKey, descriptionLayoutKey?, scope?, countMax?, countDefault? }`
- `path`: `'long'` (→ `templates.long[templateKey]`), `'top'` (→ `description[templateKey]`), `'shorts'` (→ `templates.shorts[templateKey]`)
- `descriptionLayoutKey`: layout key when it differs from `key` (e.g. `introHook` → `introBlock`, `broadcastHeader`/`operatorStatuses`/`statusLines` → `broadcastBlock`)
- `scope: true` flag in JSON is legacy — scope is now always shown and stored in `phraseBlockScopes`
- `countMax`/`countDefault`: initial max and default for the Lines slider

## Block scope

Each block has a **scope** field (stored in overrides, user-set in the editor):

- **Project** — same value across all songs (links, playlists, support info)
- **Song** — has a project default, overridable per song (gear, custom notes)

Migration progress for old hardcoded per-song generator fields:
- `customCta` → `customCtaBlock` (Text, `scope: 'song'`) ✓
- `customGear` → `gearBlock` (List, `scope: 'song'`, mini list editor) ✓
- `customStory` → `storyBlock` (Hook Block, `scope: 'song'`) ✓
- `customLogNote` → `logBlock` (Hook Block, `scope: 'song'`) ✓
- `customHashtags` — not a description block, still hardcoded (see Other Active Goals)

Legacy `formData.customStory`/`customLogNote` fields are still supported via `getEffectiveSongOverrides` fallbacks and seeded into `songBlockOverrides` on entry load, so old saved entries migrate forward automatically on next save.

## Hook Block song overrides and scope

Hook Blocks (`storyBlock`, `logBlock`, etc.) are phrase-template arrays — the engine picks one at random per generation. When scope is `'song'`, a per-song override text field appears in the generator's Advanced panel, rendered generically by `songScopeHookBlocks` in `AdvancedDescriptionFields.jsx`'s `SongBlockOverrideFields` — every song-scoped hook block goes through this one loop, no exceptions. (`storyBlock`/`logBlock` used to have their own hardcoded `PHRASE_BLOCK_OVERRIDES` array/render path predating the generic hookBlocks system — removed 2026-07-10; they're now ordinary hookBlocks entries like any other.) The override is a plain string stored in `formData.songBlockOverrides[blockKey]` and wins over the randomly-picked project template.

Scope for Hook Blocks is stored in `description.templates.long.phraseBlockScopes` (a map of `blockKey → 'song'|'project'`). When scope is `'project'`, no override field appears in the generator. Editable in Project Settings → Blocks → Hook Blocks. **Default scope (when no explicit override exists) is data-driven, not hardcoded**: each hookBlocks config entry may declare `"defaultScope": "song"` in `projects.json` (only `storyBlock`/`logBlock` do, matching their historical default — everything else implicitly falls back to `'project'`). Both `ProjectSettingsHookBlocks.jsx`'s scope dropdown and `AdvancedDescriptionFields.jsx`'s override-field visibility check must resolve scope with the exact same precedence (`phraseBlockScopes[key] ?? block.defaultScope ?? 'project'`) — they used to disagree (the dropdown defaulted absent-key display to `'project'` while the override field defaulted `storyBlock`/`logBlock` specifically to `'song'` via a hardcoded key check), which meant the Scope toggle silently didn't control the Generator field until a user explicitly touched it. Fixed by moving the default into config instead of code.

## Block targets

Each block can target **Long Description**, **Shorts Description**, or both, via a `target` field (`long`/`shorts`/`both`). Both `generateDescriptions.js` (Long) and `generateShortDescriptions.js` (Shorts) render List/Text blocks via the shared `renderCustomBlock` (in `generateCustomBlocks.js`) — Shorts list-block output is padded with blank lines so it stands apart from the single-newline-joined surrounding lines.

Hook Block target is stored in `description.hookBlockTargets[key]` in overrides. Default is derived from `block.path` (`'shorts'` → `'shorts'`, anything else → `'long'`). The engine reads this via the Descriptions tab Active Layout — a hook block with target `'shorts'` or `'both'` appears in the Shorts Available palette and can be added to the Shorts layout; the engine resolves its templates via `resolveHookBlockTemplates(layoutKey, projectConfig)` in `generateCustomBlocks.js` (shared helper used by both `generateDescriptions.js` and `generateShortDescriptions.js`). Same helper covers the Long engine for any Shorts-path hook block added to the Long layout.

Dynamic blocks (no JSON default, created from the Blocks tab) have no position in the static layout array — they're appended at the end when added to a layout, and sort to the end on "Reset Order". Both Description settings pages (`LongDescriptionSettings.jsx` / `ShortsDescriptionSettings.jsx`) are now **layout-only** — all block types render as `BlockInfoCard` pointing to their editing location. No inline template editing in the Descriptions tab. Hook blocks are detected by deriving `allHookBlockLayoutKeys` from `projectConfig.description.hookBlocks` at runtime (using `descriptionLayoutKey ?? key` on each entry) — no hardcoded lists.

---

# Current Focus

**Exposed the hidden `templates.long.logBlock` wrapper template + relabeled the misgrouped Tag Line blocks (2026-07-10).** Follow-up question after the collision-overwrite fix (below): is a Log Notes segment's "Modification: ..." line hardcoded, and why does clicking an overridden Log Notes segment still point at "Log · Notes"? `generateLogBlock.js` joins two independently-sourced pieces: (1) `baseLogBlock` — a wrapping template (`templates.long.logBlock`, e.g. `"Production Note:\n {logNote}"`) with `{logNote}` filled from the song override or the `logNotes` pool; (2) `tagLogBlock` — a random line from the *selected tag's own* `description.log` array, **not hardcoded**, editable per-tag in Tag Library → Descriptions, just not yet tooltip-attributed (documented block-level-not-per-line limitation). Piece (1) *was* genuinely hardcoded, though — no hookBlocks entry anywhere referenced `templateKey: 'logBlock'`; the existing "Log · Notes" card only ever edited the fallback pool (`logNotes`), never the wrapper that actually produces the "Production Note:" prefix. Fixed: new hookBlocks entry per project, `{ key: 'logFormat', label: 'Log · Format', path: 'long', templateKey: 'logBlock' }` — no `descriptionLayoutKey` (not joined to the `'logBlock'` collision group; it has no layout slot of its own, same category as the Tag Line blocks; Log Notes segment navigation unchanged). Also relabeled `tagLineFallbacks`/`tagLineTemplates` (feed the shared `{tagLine}` placeholder used across many templates — correctly absent from the Descriptions layout builder, by design, not a bug) from "Log · Tag Fallbacks"/"Log · Tag Templates" to "Tag Line · Fallbacks"/"Tag Line · Templates" — they have nothing specifically to do with Log Notes. Config-only (`projects.json`), no code changed. Follow-up to the key-collision-prevention fix (below): reported as "Intro · Hook" (3 templates) never varying — always the same static line. Root cause, more severe than the earlier navigation-orphaning bug: `generateDescriptions.js`'s `blocks` object is `{ broadcastBlock, introBlock, storyBlock, technicalBlock, logBlock, closingBlock, supportBlock, ...renderedCustomBlocks }` — spreading `renderedCustomBlocks` *last* means a colliding `customBlocks` key silently overwrites the explicitly-computed value in the actual generation map, not just in Settings-tab display. A colliding Text block's static content always won over the Hook Block's random template pick, with no error anywhere. Fixed via `resolveCustomBlockCollisions(projectSettingsOverrides, hookBlocks)` in `customBlocks.js`, run as a `useEffect` in `App.jsx` on every resolved-config change: detects `customBlocks` keys colliding with a hook block's `key`/`descriptionLayoutKey`; Project-scoped ones are renamed automatically (suffixed key + matching `blockLabelOverrides` entry moved together), self-stabilizing after one repair pass. Deliberately leaves the saved `layout` array untouched — a colliding key can never win its own `layout` slot (`dynamicBlockKeys` excludes any key already in `defaultLayout`), so any matching `layout` entry unambiguously belongs to the hook block, not the renamed customBlocks entry; the renamed block just becomes available (not auto-added) like any new block. Song-scoped collisions are deliberately *not* auto-renamed (returned in `skipped`, `console.warn`'d) since a safe rename can't also migrate per-song override data scattered across `formData`/every saved entry — that needs a human. Successful renames also `console.warn`, so this stays visible rather than a silent background data mutation.

**Block system: fixed a real key-collision gap, unified storyBlock/logBlock onto the dynamic hook-block path (2026-07-10).** User flagged that Project Settings → Blocks / Descriptions / Generator's Advanced Options don't always agree on which blocks exist or where they're reachable, and that some Generator override fields were hardcoded rather than config-driven ("as dynamic as possible, not hardcoded"). A research-only Explore investigation confirmed four separate root causes, code-grounded not guessed:

1. **Key-collision gap** — all three "Add block" forms passed an incomplete `existingKeys` set to the shared `generateBlockKey()`; Text/List forms never checked the Hook Blocks layout-key namespace (`key`/`descriptionLayoutKey`) at all. Real case found: a Text block named "Intro Block" generated key `introBlock`, colliding with the Hook block `introHook`'s `descriptionLayoutKey: 'introBlock'` — since `resolveBlockSource`/`makeLayoutLabelResolver` check the hook-layout-key namespace *before* `customBlocks`, and `LongDescriptionSettings.jsx`'s `dynamicBlockKeys` filter excludes any customBlocks key already in `defaultLayout`, the Text block became permanently orphaned from the Descriptions layout builder while staying fully editable (and invisible-collision) in Blocks → Text Blocks. Fixed: all three Add forms now build one combined `existingKeys` set (`customBlocks` keys + hook blocks' `key`s + `descriptionLayoutKey`s). See Known Gotchas below.
2. **Scope-toggle default mismatch** — not a storage-path bug (both sides read/write the identical `description.templates.long.phraseBlockScopes[key]`); the dropdown *displayed* `'project'` when absent while the Advanced panel *treated* `storyBlock`/`logBlock` as `'song'` by default via a hardcoded key check — silently disagreeing until a user explicitly touched the dropdown once.
3. **`PHRASE_BLOCK_OVERRIDES` was genuinely hardcoded** — `storyBlock`/`logBlock` had their own dedicated array + render loop in `AdvancedDescriptionFields.jsx`, excluded from the generic `songScopeHookBlocks` loop via a `hardcodedPhraseKeys` set, despite being ordinary `hookBlocks` entries everywhere else.
4. **"Cover Summary"** (a stale layout entry with no backing block) confirmed as saved-data cruft from before a prior cleanup, not a code bug — `coverSummaryBlock` has zero references anywhere in current `projects.json`/`src/`; a project's already-persisted layout override array is used verbatim forever with nothing pruning stale keys. No code fix — remove via the existing "×" button.

Fixed #1–#3 (④ needed no code, user-actionable). Added an optional `defaultScope` field to hookBlocks config entries in `projects.json` — `storyBlock`/`logBlock` get `"defaultScope": "song"` (both projects, replacing the vestigial unread `"scope": true` legacy flag), everything else implicitly defaults to `'project'`. Both `ProjectSettingsHookBlocks.jsx`'s `getScope(key, defaultScope)` and `AdvancedDescriptionFields.jsx`'s `songScopeHookBlocks` filter now resolve with the identical precedence (`phraseBlockScopes[key] ?? defaultScope ?? 'project'`), closing the mismatch generically. With that in place, `PHRASE_BLOCK_OVERRIDES`/`hardcodedPhraseKeys` were deleted outright (net −47 lines) — `storyBlock`/`logBlock` now flow through the same dynamic render loop as any other song-scoped hook block. Verified safe: `overrideKey` resolves to the same storage keys as before, so no data migration; they also gain the reset-to-default icon, full placeholder autocomplete, and the Override Type control — parity gains, only cosmetic regression is Story's textarea shrinking from `rows={5}` to the generic path's `rows={3}`. See Hook Block song overrides and scope below.

**Fix: song-overridden description blocks — misattribution, a real hook-block collision, and click-to-scroll (2026-07-10).** Reported right after the Long description block tooltip feature (below) shipped, in three rounds:

- **Round 1 — override misattribution.** A block with an active per-song override (e.g. Story Block, overridden via the Generator's Advanced Options panel) still tooltipped/linked to "Blocks → Hook Blocks → Story Block," landing on the project-default template card — which has nothing to do with the override text actually shown. Root cause: `resolveBlockSource()` only read *config shape* (is this key a hook/list/text block?), blind to whether a song override had actually replaced that pool's output. New `isSongOverrideActive(songOverrides, blockKey)` in `generateCustomBlocks.js` mirrors `renderCustomBlock`/`resolveHookOverride`'s exact truthiness. `resolveBlockSource` gained an `overridden` param (default `false` — Long/Shorts *settings* pages' nav-arrow callers don't pass it); when true it returns `{ type: 'override', blockKey }` — deliberately the *layout* key, not the resolved Hook Blocks config key, since `formData.songBlockOverrides` is keyed by layout key (can differ from a hook block's own config key, e.g. `introBlock` vs `introHook`). Both engines pass this per-segment. `logBlock` excluded — its override only fills `{logNote}` inside a still-pool-picked template, so the pool stays accurate. Shorts' list-block branch doesn't apply song overrides at all today (pre-existing, separate gap) — not touched.
- **Round 2 — a real config collision the tooltip surfaced.** A `logBlock` segment tooltipped to "Log · Tag Templates" instead of "Log · Notes," and the generated text visibly matched a Log · Notes template. Three `hookBlocks` entries (`logBlock`, `tagLineFallbacks`, `tagLineTemplates`) share `descriptionLayoutKey: 'logBlock'`, but `generateLogBlock.js` only ever reads the pool behind the `logBlock` entry — the other two are unused by it entirely. `buildHookBlockMaps`'s plain last-one-wins collision resolution landed on `tagLineTemplates` (array order), a pool with zero relation to the content — flatly wrong, not just imprecise like `broadcastBlock`/`closingBlock`'s multi-pool merges (whose "last wins" picks are at least real contributors). Fixed generically: `buildHookBlockMaps` now prefers the hookBlocks entry whose own `key` equals the shared layout key when one exists (a "self-named" entry); groups with no self-named entry keep the unchanged last-one-wins fallback. This also fixed a pre-existing, previously-unnoticed bug in `LongDescriptionSettings.jsx`'s own `logBlock` nav arrow, which shared the same collision.
- **Round 3 — overrides made clickable after all.** Shipped as tooltip-only first (explicit choice) — after seeing it live, wanted it to lead somewhere and highlight it. Since the override lives inline in the Generator's own Advanced Options panel (same page, not Project Settings), "leading" means scroll-to + auto-expand + highlight. New `songOverrideTarget`/`openSongOverride`/`clearSongOverrideTarget` in `useAppShellState.js` (same `{blockKey}`-target shape as `blocksTarget`, but same-page — no `setActivePage`; `openSongOverride` force-opens `panelVisibility.advanced`). Threaded through `App.jsx` → `GeneratorPage.jsx` → `InputForm.jsx`/`AdvancedDescriptionFields.jsx` (consumer) and `GeneratorResultsPanel.jsx`/`DescriptionsPanel.jsx` (producer, `onClick` on the `'override'` segment). `AdvancedDescriptionFields.jsx` gained a stable `id="song-override-{key}"` per field across its three override-rendering loops, a `useEffect` doing `el.open = true; el.scrollIntoView(...)` on target change (plain `getElementById`, simpler than refs across three separate `.map()` calls), and a `tag-section--highlight` CSS class (same amber-glow tokens as `.description-block-link`) — cleared the moment the user actually edits or resets that field, not on a timer.

**Long description block tooltips + glowing-border hover (2026-07-10).** Extends the Shorts-only source tooltip/click-nav feature (below) to Long descriptions, which previously rendered as one flat unsegmented string with no navigation at all. Granularity is block-level (one segment per `layout` entry) rather than per-line — `broadcastBlock`/`technicalBlock`/`logBlock` are each built by `generateBroadcastBlock.js`/`generateTechnicalBlock.js`/`generateLogBlock.js` merging several tag-specific and project-level pools into one multi-line paragraph, and re-architecting those three engine files for per-line attribution was judged out of proportion to the ask. This matches the granularity `LongDescriptionSettings.jsx`'s existing nav arrows already use, and mirrors how Shorts itself first shipped block-level nav before exact-template highlighting was added as a later, separate pass. New `resolveBlockSource(blockKey, { hookBlockMaps, customBlocks, supportBlockConfig })` in `descriptionLayout.js` is the single place this block→source resolution now lives, extracted from `LongDescriptionSettings.jsx`'s `getNavigateHandler` (previously hardcoded there) so the engine and the settings UI's nav arrows can't drift apart; `ShortsDescriptionSettings.jsx`'s near-identical `getNavigateHandler` was refactored onto the same function (its `key === 'hook'` → Shorts-hook-pool special case, unrelated to block resolution, stays first). `generateDescriptions.js` now builds `longDescriptionSegments` (`{text, source}[]`) in the same pass that produces the joined `longDescription` string, so the two can't disagree. `DescriptionsPanel.jsx`'s `DescriptionLineLink` gained a `className` prop (default `'description-line-link'`, Shorts' inline style) so Long passes a new `'description-block-link'` class — same tooltip/label/click logic as Shorts' block branch, since Long segments never hit the tag/base hook-pool branches. New CSS: `.description-block-link` is `display:block` with a transparent resting border that turns into an amber glow (`border-color` + `box-shadow`, same `--color-border-hover`/`--color-shadow-accent`/`--radius-terminal` tokens as `.button-primary`/`.tag-used`) on hover — a bordered box reads better for paragraph-length blocks than Shorts' inline text-shadow-only treatment. Known limitation, inherited not introduced: blocks built from multiple merged hook-block pools sharing one layout key (`broadcastBlock`, `closingBlock`, `logBlock` — see "Hook Blocks vs description layout keys" in `docs/current-context.md`'s Architectural Notes) resolve their tooltip/link to whichever pool's key wins (last one in the array), identical to what clicking that block's existing nav arrow already did before this change.

**Shorts description line tooltips: source-of-truth navigation labels + a real subTab-id bug fix (2026-07-10).** Follow-up to the existing Shorts description click-to-navigate feature — hovering a generated line now shows a native tooltip describing where it came from, matching the `title=` convention already used by `GeneratedTitle.jsx`/`ThumbnailsPanel.jsx` (`"Blocks → Hook Blocks → Story Log: \"template text\""` for block-sourced lines, `"{tagName} ({hookType}): \"{text}\""` for tag-sourced hooks, `"Project preset ({hookType}): \"{text}\""` for base-preset hooks). Block-sourced tooltips need a human-readable block label that respects user renames — reused the existing override-aware resolution (`hookBlockLabelOverrides`/`blockLabelOverrides`/`getBlockLabel`) rather than hardcoding a parallel label lookup, via a new `makeBlockKeyLabelResolver` in `descriptionLayout.js`. This is a *config-key* resolver, distinct from the existing `makeLayoutLabelResolver` (which resolves *layout-slot* keys for `LongDescriptionSettings`/`ShortsDescriptionSettings`) — `generateShortDescriptions.js`'s `source.blockKey` is already resolved to the config key before it reaches the UI, so the layout-key resolver's `layoutKeyToBlockKey` translation doesn't apply here. `projectConfig`/`projectSettingsOverrides` threaded down through `App.jsx` → `GeneratorPage.jsx` → `GeneratorResultsPanel.jsx` → `DescriptionsPanel.jsx` to build the resolver. Along the way, found and fixed a real latent bug: the block-nav-on-click code computed `subTab: source.blockType === 'hook' ? 'hooks' : source.blockType`, which for list blocks sent `subTab: 'list'` — but `ProjectSettingsBlocks.jsx`'s actual subtab id is `'lists'` (plural), so clicking a list-block-sourced description line navigated to Project Settings but matched none of the three subtab branches, silently rendering an empty Blocks panel. Fixed by extracting the block-type → subtab-id/label mapping into one shared constant, `BLOCK_TYPE_SUBTABS` in `customBlocks.js` (`{ list: {subTab:'lists', label:'Lists'}, text: {...}, hook: {...} }`) — both `ProjectSettingsBlocks.jsx`'s `SubTabNav` tabs array and `DescriptionsPanel.jsx`'s tooltip/nav logic now derive from this single source instead of each hardcoding its own copy, so the two can't drift out of sync again.

**Fix: Hooks toggle duplicated the Shorts suffix into Long titles (2026-07-09).** Reported as titles like `[SIGNAL 11] // Does I Won't Lie Down still hold up? // [SIGNAL 11]` when the Titles panel's Hooks checkbox mixed shorts hooks into Long titles — a trailing `[SIGNAL 11]` leaking in from the Shorts side. Root cause: `generateShortHooks.js` bakes the Shorts prefix/suffix directly into each hook's `.text` field (needed for the Shorts Hooks panel, Shorts-mode titles, and the Shorts description "hook" block, which all want that wrapped text) — but `generateTitles.js`'s `buildHookTitles` reused that same already-wrapped `.text` and wrapped it *again* with the Long prefix/suffix, trapping the Shorts suffix inside. Fix: `generateShortHooks.js` now also keeps the unwrapped text in a new `rawText` field; `buildHookTitles` uses `hook.rawText` instead. See Known Gotchas below. Verified: hook-derived Long titles now read cleanly (e.g. `[SIGNAL XX] // Most underrated Face to Face song? // Illegal Mind Rework`), Shorts mode unaffected, no console errors.

**Fix: tag `shortHooks`/`description` silently dropped by base+override resolution (2026-07-09).** Reported as "Sync Tags doesn't sync hooks between projects" — a shared tag (e.g. "Hardcore Punk") showed 0 phrases in every Short Hooks category after syncing. Traced through `syncProjectTags`/`mergeTagData`/`mergeShortHooks` (`useTagOverrides.js`) first — confirmed that sync logic already merges `shortHooks` correctly (union per hook-type). The actual bug was downstream, in the two places that combine a tag's base `projects.json` config with its stored override: `buildResolvedProjectConfig.js` (feeds `generateShortHooks.js` — a real generation-quality bug, not just cosmetic) and `buildTagExplorerData.js` (feeds the Tag Editor's `tag.maps`, exactly what the screenshot showed as "(0)"). Both did a flat `{...baseTag, ...override}` spread for `shortHooks` — see Known Gotchas below for the full mechanism and fix. Verified via headless-browser test against the real Tag Editor and the actual Sync Tags button: Maxx Dee's "Hardcore Punk" now shows its real counts (4/4/6/4/4/4) before *and* after syncing from Illegal Mind Covers (which has no base data for that tag) — sync no longer wipes it.

**Titles panel: functional Uppercase toggle + Hooks moved to a checkbox (2026-07-09).** The Titles panel's "Hooks: ON/OFF" toggle moved out of the `CollapsiblePanel` header (`headerExtra`) into a new `.titles-options-row` inside the panel body, above the generated titles — and was converted from a `button-secondary` pill to a `ToggleField` checkbox. A new "Uppercase" `ToggleField` sits alongside it (both modes — Long and Shorts — unlike Hooks, which stays Long-only). Uppercase does a real `.toUpperCase()` transform (not CSS `text-transform`) on the text used for both display and `CopyButton`'s `text` prop, in `GeneratedTitle.jsx` (Long) and `ShortHookTitles.jsx` (Shorts) — a first CSS-only pass was tried and rejected because it left Copy producing normal-case text. Fixed a latent bug the uppercase change surfaced: `ShortHookTitles.jsx`'s `onOpenSourceTag`/`onOpenSourceHook` calls fell back to the (now possibly-uppercased) display text when `hook.sourceText` was absent — switched to a separate `rawHookText` for those fallbacks so source-navigation matching isn't affected by the display toggle. `ToggleField` gained an optional `title` prop (forwarded to the wrapping `<label>`) to preserve Hooks' tooltip. `titleUppercase` persists via `illegalMindGeneratorData.ui.titleUppercase` (`useAppShellState.js`, same pattern as `panelVisibility`), threaded through `App.jsx` → `GeneratorPage.jsx` → `GeneratorResultsPanel.jsx` → `TitlesPanel.jsx`.

**Exact-template highlighting for description navigation (2026-07-05).** Follow-up to Shorts description source navigation below — clicking a line now scrolls to and highlights the specific winning template/item, not just its block's editor card. `resolveHookBlockOutput` returns `{ text, template }` (template only set when one line was picked); `renderStructuredBlock` returns `{ text, pickedItem }` (only set for `displayMode:'random'` lists) — both were plain strings before, so their 4 call sites all extract `.text` now. `blocksTarget` gained `highlightText` (string, for hook templates — also prefills `HookTemplateEditor`'s search box, benefiting existing Titles/Thumbnails nav too) and is passed as `highlightItem` (raw item object, content-matched since list items have no stable id) to `ProjectSettingsLists`. `ListItemRow.jsx` is now a `forwardRef` with a `highlighted` prop, mirroring `PhraseRow`. Text blocks excluded (one field, nothing to disambiguate).

**Shorts description line → source navigation (2026-07-05).** Clicking a line in a generated Shorts description now jumps to whatever block/tag produced it, reusing Titles/Thumbnails' existing navigation machinery — no new infrastructure. `generateShortDescriptions.js` returns `{ shortDescriptions, shortDescriptionSegments }`; each block carries a UI-agnostic `source` (`{ type: 'block', blockKey, blockType }`, or the hook object itself for the `'hook'` block — same shape Titles already use). `openBlocksEditor` now also switches pages (previously only worked from within Project Settings). New `.description-line-link` CSS: no permanent color, CRT glow only on hover. Long descriptions untouched — Shorts-only pass. See `docs/current-context.md` for full detail.

**CRT design polish round 3 (2026-07-05), `src/index.css` + `InputFormActions.jsx` + `UIKitPage.jsx`.** `.button-primary`/`.button-secondary`/`.form-select` gained the `font-size: var(--font-size-toggle)` fix round 2 gave other controls. Found a real CSS bug: `content: '\2212 '` (hex escape + space) has the space consumed as the escape terminator per spec, so the open-state `−` marker on `.tag-section`/`.tag-editor-section` rendered with no trailing space — fixed by using the literal `−` character instead of the escape. `.subtab-nav button` referenced `--font-size-sm`, a token never defined in `:root` (silently fell back to default `1rem`) — repointed to `--font-size-toggle`. Scoped (not global) size reductions on `.tag-edit-fields .form-input` and `.tag-phrase-row .form-input` (shared `PhraseRow`). `.tag-map-status span` sharpened+mono'd to match everything else. `InputFormActions.jsx` merged Save + Clear Form onto one row with the project select. See `docs/current-context.md` for full detail.

**CRT design polish round 2 (2026-07-05), `src/index.css` + `TemplateGroupCard.jsx` + `BlockEditorCard.jsx`.** Uppercase + mono now applied to `.button-primary`/`.button-secondary`/`.copy-button`/`.tag-chip`/`.tag-filters button`/`.form-select` (inputs/textareas stay sans for free-text). `.tag-chip`/`.tag-filters button`/`.tag-status`/`.copy-button` also got `font-size: var(--font-size-toggle)` (12px) — they inherited the default `1rem` and read oversized once uppercased. Every disclosure widget (`ToggleButton`, `.tag-section`/`.tag-editor-section` `<summary>` markers, `TemplateGroupCard`/`BlockEditorCard`'s custom collapse icons) now uses the same `+`/`−` convention — no triangle markers left anywhere. Known accepted gap: native `<select>` open-list chrome can't be restyled without a custom dropdown component. See `docs/current-context.md` for the full selector list.

**CRT design refinement: buttons & pills (2026-07-05), `src/index.css` only.** Follow-up to the CRT pass below — `.toggle-button` now uses `--font-size-toggle` (12px) instead of inheriting the default `1rem` (was reading oversized), and nav tabs/tag filter chips/radio options/transformation tag chips/primary+secondary buttons/`.toggle-button` all switched from `--radius-pill`/`--radius-md` to `--radius-terminal` to match the sharpened panels/cards. See `docs/current-context.md` for the full selector list.

**Fallout terminal CRT atmosphere pass shipped (2026-07-05), `src/index.css` only.** Adds the terminal identity around the prior day's sans-serif/lighter-border refresh rather than reverting it: (1) `body::before`/`::after` fixed overlay — scanlines (`repeating-linear-gradient` + `mix-blend-mode: overlay`), vignette (inset `box-shadow`), subtle `crt-flicker` animation disabled under `prefers-reduced-motion: reduce`; (2) monospace reintroduced on headers/nav/labels only (`.app-title`, `.panel-title`, `.form-label`, `.tag-category`, `.tag-card-header h3`, `.tag-selector-label`, `.subtab-nav button`, `.app-menu-pages button`) — inputs/buttons/selects stay sans-serif; (3) new `--radius-terminal: 2px` token sharpens `.panel`/`.tag-card`/`.terminal-block`/`.advanced-panel-content`/`.desc-generation-settings` to rectangular while buttons/chips/inputs/nav pills stay rounded; (4) corner-bracket accents + intensified amber glow on `.button-primary`/`.tag-chip.active`/active nav tab/`.tag-used`. All via shared primitives, so it applies app-wide with no per-page edits. See `docs/current-context.md` for full detail.

**Generator Input form visual refresh shipped (2026-07-05).** Fixed "bulky/90s programmer UI" feel: removed redundant double `.form-group` nesting, replaced hand-rolled checkboxes with `ToggleField` (now controlled — `checked`, not `defaultChecked`), unified Todo/Transformation Tags disclosure onto `ToggleButton` (was native `<details>`), and three global CSS changes — `.form-label` de-emphasized (12px normal-case, new `--font-size-field-label` token), monospace font removed from all UI chrome (buttons/inputs/selects now `--font-ui`; output areas keep their own explicit mono font), and inputs/tag-chips moved to a lighter bottom-border/background-driven style instead of a full 1px box border everywhere. Color palette unchanged. See `docs/current-context.md` for full detail.

**Placeholder engine consolidated (2026-07-04/05).** `src/engine/placeholders.js` is now the single registry for all template placeholder resolution (hooks, titles, descriptions) — see Known Gotchas below. Also added a save-to-any-project dropdown in `InputFormActions.jsx`.

Previously: tag-category placeholders (`{tags.*}`), title polish (no `"Title:"` label, consistent capitalization), and hook blocks generically honoring their configured "Lines" count (2026-07-04) — see `docs/current-context.md` for full detail.

`originalGenre` is now fully done through Stage 3. Stage 2 (2026-07-02): added a new `original` Shorts Hook type to both projects — `requiresGenre: true`, no `excludeForFaithful`, templates `"The best {originalGenre} song of {year}"` / `"{originalGenre} perfection since {year}"` / `"Still the greatest {originalGenre} track from {year}"`. Stage 3 (shipped earlier in `63ce426`): a `contrast` Shorts Hook type (`excludeForFaithful: true`, `requiresGenre: true`) using `{originalGenre}` + `{primaryTag}`, gated in `generateShortHooks.js`.

**Project Settings → Thumbnail Templates built** (2026-07-02) — the tab was registered in `projectSettingsSections.js` but fell through to "Coming Soon". New `ProjectSettingsThumbnails.jsx` edits `thumbnail.count`/`.words`/`.fallbacks`/`.genericTagTemplates`/`.patterns.long`/`.patterns.shorts` — the exact keys `generateThumbnails.js` reads, already correctly merged by `buildResolvedProjectConfig.js`.

**Thumbnails split into their own Generator panel with source nav** (2026-07-02) — thumbnails no longer render embedded in Titles (`GeneratedTitlePair.jsx` renamed to `GeneratedTitle.jsx`, title-only now); new `ThumbnailsPanel.jsx` shows them independently, visible for both Long and Shorts (the engine already generated Shorts-flavored thumbnails, just discarded before). `generateThumbnails.js` now returns `{ text, source }` instead of plain strings — `source.type` is `'words'|'fallbacks'|'genericTagTemplates'|'tag'`, carrying whichever raw phrase/template produced it. Clicking a thumbnail navigates to its source: Project Settings → Thumbnail Templates (via new `thumbnailsTarget`/`openThumbnailsSearch`, mirroring `titlesTarget`) for the first three, or Tag Library → that tag → Titles tab (via existing `onOpenSourceTag`/`openTagLibrarySearch`, now also wired through `TagEditor.jsx`/`TagTitlesTab.jsx` for `field: 'thumbnail'`/`'title'`) for tag-sourced phrases. `TemplateGroupCard` auto-expands when `highlightText` is set (via a derived `isCollapsed = collapsed && !highlightText`, not a `setState`-in-effect, which the project's `react-hooks/set-state-in-effect` lint rule forbids) — fixes a latent gap that also applied to the existing Shorts Hooks nav. Thumbnail count now has its own "Generation" slider (`thumbnail.count`, 1–10) instead of being tied to `titles.length`.

---

## Other Active Goals

- Queue-hidden indicator in Todo rows
- Todo status badges in Saved Library
- Saved Library Todo filtering
- CSS refactor (consolidate index.css, clean up class naming)
- `coverLabel` (Shorts Description) has no settings UI — only editable by hand-editing `projects.json`
- Block Group block type not started
- **`customHashtags`** — last remaining hardcoded per-song field in `AdvancedDescriptionFields.jsx`. It's not a description block at all, so it won't fit the block system — investigate separately.

---

# Post-Upload Session Todos

- **Shorts descriptions tag awareness** — pull tag-specific phrases into shorts description blocks
- **Generator selective regeneration** — changing story notes / hide-from-queue / switching tabs should NOT trigger regeneration. Changing artist/song/tags/signal/type should. Needs careful design first.

---

# Long-Term Roadmap

- Content Calendar (upload planning, release scheduling)
- Project Dashboard (covers completed, wishlist size, queue status)
- Metadata Expansion (release year, re-record/remaster flags, recording notes)
- Queue Enhancements (history, upload frequency rules, date tracking)
- Hook System Expansion (metadata-aware, year-based, artist-specific)
- Database Migration (IndexedDB / SQLite / local file) — only after storage is stable
- Desktop App (Electron / Tauri) — better backups, native filesystem

---

# Important Decisions

- **Local-first** — no backend by design
- **Config-driven** — behavior from config, not hardcoded logic
- **Reuse before creating** — before writing ANY new UI markup, CSS class, or component, check `/uikit` (UIKitPage) and the "UI Primitives" section above first. Prefer a small conditional tweak to an existing component over new markup or a new class. This applies every time, not just when reminded.
- **Simple architecture** — single developer, no enterprise patterns, no unnecessary abstraction
- **onBlur saves** — phrase/template edits save on blur, not on keystroke (future DB compatibility)

---

# Development Preferences

- **Step-by-step, one change at a time.** Present each step, implement it, then stop and wait for the user to review and approve before moving to the next. Never chain multiple steps autonomously.
- **Before writing any new UI element, check `/uikit` first.** Card, row, wrapper, CSS class — check the UIKitPage catalog and CLAUDE.md's UI Primitives list before writing new markup. Extend an existing component if it can fit; don't hand-roll a shape that duplicates one.
- Hands-on, file by file, small chunks
- Show the change, explain it, let the user review before moving on
- Do NOT batch into autonomous pass unless user says so
- Work in grouped steps, keep changes focused
- Prefer code examples over theory
- Ask for files instead of guessing structure
- Provide Conventional Commit messages when asked. Keep commit messages as short bullet points, not long prose paragraphs.
- When uncertain: choose the simpler solution

## Session Protocol

**Before every planning session:**
1. Read `docs/current-context.md` — current focus, recently completed, known issues, next tasks, key file pointers. Fastest way to get project state without reading code.
2. Run `graphify query "<question>"` for any codebase question. Use the knowledge graph first — avoids redundant file browsing and surfaces cross-file relationships instantly.
3. Only grep/read raw source files if docs and graphify don't answer the question.

**After each significant step (feature, fix, or refactor):**
1. Update `docs/current-context.md` — move completed items to Recently Completed, update In Progress and Next tasks, refresh Known Issues.
2. Update `CLAUDE.md` — update Current Focus, Known Gotchas, and UI Primitives entries if the step changed any of those.
3. Mirror the same edit into `AGENTS.md`. It's a manually-maintained copy of this file for non-Claude tools (Codex, etc.) that read `AGENTS.md` by convention instead of `CLAUDE.md` — there is no symlink or hook keeping them in sync (attempted a symlink, blocked by lack of admin/Developer Mode on this machine; a hard link was tried and confirmed unreliable — editors replace-on-save, which silently breaks it). Whatever changes in this file's Current Focus / Known Gotchas / UI Primitives / PRIORITY TODO sections must be copied into `AGENTS.md` too (only the top `# CLAUDE.md` vs `# AGENTS.md` header line differs between the two files).
4. Commit source + docs changes together.

**At the end of a work session or feature (not after every individual step):**
1. Run `graphify update .` to keep the knowledge graph current. Batch this — running it after every small step is unnecessary overhead (each doc-touching update dispatches a subagent), so do it once when a feature/session wraps up, not per-commit.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
