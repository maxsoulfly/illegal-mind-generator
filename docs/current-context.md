# Current Context

Developer handoff file. Updated end of session. Describes what is actually done, in progress, and next — not plans or history.

---

## Current Focus

Shorts Queue snapshot-staleness bug fixed. Next up: new tag-category-based placeholders (`{era}`, `{genre}`, `{intent}`, `{mood}`, `{lang}`, etc.) for hooks/titles/descriptions.

---

## Recently Completed

- **Shorts Queue stores id references, not entry snapshots** (2026-07-04) — the queue used to freeze full entry snapshots at randomize time, so editing a queued song's tags/notes afterward showed stale data until the next full randomize (the same class of bug as the stale-`savedEntries`-snapshot incident noted in CLAUDE.md, but in the shorts queue instead). `useShortsQueue.js`: `getCoverId` now prefers `entry.id` (falls back to the old `artist::song` composite key for legacy data); the queue state (`queueIds`) stores ids only; `queue` is derived by resolving each id against live `savedEntries` on every render, so downstream edits always show up. `normalizeQueueEntry` auto-migrates old snapshot-shaped queues (detected via `typeof item === 'object'`) to id-shape on load — no manual migration step. `ShortsQueuePage.jsx` skips rendering a slot when its id no longer resolves to any saved entry (e.g. the entry was deleted).
- **Tag Editor sub-tabs fixed** (2026-07-02) — `TagEditorTabs.jsx`'s pill-chip buttons (visually identical to filter chips elsewhere, and prone to wrapping into a broken multi-row grid at narrow tag-card widths — a container-width issue, not a viewport one) replaced with the existing `SubTabNav` component. `SubTabNav`'s CSS (`.subtab-nav`) now scrolls horizontally instead of wrapping (`overflow-x: auto`, `flex-wrap: nowrap`), fixing this for all 6 `SubTabNav` usages, not just Tag Editor. Dead `.tag-editor-tabs` CSS removed.
- **Thumbnails split into own Generator panel + source nav** (2026-07-02) — `GeneratedTitlePair.jsx` renamed to `GeneratedTitle.jsx` (title-only, no more embedded "Thumb:" row). New `ThumbnailsPanel.jsx` shows thumbnails independently via `CollapsiblePanel`, visible for both Long and Shorts (the engine already generated Shorts-flavored thumbnails, just discarded before — see `generateThumbnails.js`'s `patterns.shorts` pool). `generateThumbnails.js` now returns `{ text, source }` objects instead of plain strings, tracking which `words`/`fallbacks`/`genericTagTemplates` entry or per-tag `thumbnail` phrase produced each one. Clicking a thumbnail navigates to its source: new `thumbnailsTarget`/`openThumbnailsSearch`/`clearThumbnailsTarget` (mirrors `titlesTarget`) for Project Settings → Thumbnail Templates, or the existing `onOpenSourceTag`/`openTagLibrarySearch` (now wired through `TagEditor.jsx`/`TagTitlesTab.jsx` for `field: 'thumbnail'`/`'title'`) for tag-sourced phrases. `TemplateGroupCard` now auto-expands when `highlightText` is set, via a derived `isCollapsed = collapsed && !highlightText` (not `setState` in a `useEffect` — the project's ESLint config forbids that) — fixes a latent gap that also affected the existing Shorts Hooks nav. Thumbnail count is now its own "Generation" slider (`thumbnail.count`, 1–10, added to both projects' `projects.json`) instead of being tied to `titles.length`.
- **`originalGenre` Stage 2 — faithful hooks** (2026-07-02) — new `original` Shorts Hook type added to both projects' `projectOverrides.shortHookTypes` (`requiresGenre: true`, no `excludeForFaithful`), templates: `"The best {originalGenre} song of {year}"`, `"{originalGenre} perfection since {year}"`, `"Still the greatest {originalGenre} track from {year}"`. Content-only, no engine changes — uses the existing `requiresGenre` filter in `generateShortHooks.js`.
- **Maxx Dee `transformation` hook type — genre wording added** (2026-07-02) — it already had `requiresGenre: true` with no genre-referencing templates; added `"{originalGenre} turned {primaryTag}"` and `"From {originalGenre} to {primaryTag} in one cover"` so the flag is justified. Content-only.
- **`originalGenre` Stage 3 — contrast hooks engine** — `requiresGenre`/`excludeForFaithful` flags added to `generateShortHooks.js` hook-type filtering; a `contrast` Shorts Hook type added to both projects (`excludeForFaithful: true`, `requiresGenre: true`, templates using `{originalGenre}` + `{primaryTag}`, e.g. `"A {originalGenre} classic, but {primaryTag}"`). Fires only for non-faithful tags when a genre is set. (Commit `63ce426`, previously undocumented here.)
- **Hook Blocks scope sub-option + short desc placeholder fixes** — `resolveHookOverride` (`generateCustomBlocks.js`) handles string-or-array song overrides for all description engines. `ProjectSettingsHookBlocks` gained an Override Type dropdown (Textarea/One-line) per song-scoped hook block. `generateShortDescriptions` catch-all now uses `renderTextTemplate`, fixing `{transformation}`/`{originalGenre}`/`{year}`/`{links.*}` not substituting in Shorts descriptions. New `LabelSelectRow` UI primitive.
- **`{transformation}` capitalization + coverLine placeholder fix** — `resolveTransformation` capitalizes the first letter; Shorts `coverLine` now uses `renderTextTemplate` so all placeholders resolve.
- **Sticky header transparency** — `AppHeader` fades from transparent to the page background once scrolled past the top, via an `IntersectionObserver` sentinel.
- **Titles/Descriptions panel headers navigate to Project Settings** — clicking either panel title in the Generator jumps to the matching Project Settings section, via `onNavigateToSettings`/`openProjectSettings`.
- **Shorts title count respects the slider** — removed a hardcoded 5-title limit in `TitlesPanel`; `projectConfig.title?.count` now flows through.
- **Project Settings → Thumbnail Templates built** — new `src/components/projectSettings/ProjectSettingsThumbnails.jsx`, wired into `ProjectSettingsContent.jsx`. 5 cards (`tag-library tag-library--3col` grid, `TemplateGroupCard`): Generation (count slider), Words, Fallbacks, Generic Tag Templates, and a combined Patterns card (Long + Shorts as two `HookTemplateEditor noWrapper` instances in one card). Edits `thumbnail.count`/`.words`/`.fallbacks`/`.genericTagTemplates`/`.patterns.{long,shorts}` — the exact keys `generateThumbnails.js` reads; `buildResolvedProjectConfig.js` already merged these correctly, no engine changes needed. Added `placeholders` prop to `HookTemplateEditor`/`TemplateGroupCard` (default `HOOK_PLACEHOLDERS`, backward compatible) so Thumbnail fields can pass `[]` (words/fallbacks — no substitution at all in the engine) or the new `THUMBNAIL_TAG_PLACEHOLDER` (`{tag}` only, for Generic Tag Templates) instead of the misleading full hook-placeholder list. Click-to-source nav on generated thumbnails was added in a later pass (see above).
- **`CollapsiblePanel` extracted** — `HashtagsPanel`, `YouTubeTagsPanel`, `TitlesPanel`, `ShortHooksPanel`, `DescriptionsPanel` each hand-rolled the same `panel`/`panel-collapsed` + `panel-header` + `ToggleButton` shell. Now a shared `src/components/ui/CollapsiblePanel.jsx` (`label, visible, onToggle, onNavigate?, headerExtra?, children`). `onNavigate` covers Titles/Descriptions' clickable nav-title; `headerExtra` covers Titles' "Hooks: ON/OFF" toggle. Plain bare `.panel` usage (`ProjectSettingsPage`, `GeneratorPage`, `GeneratorResultsPanel`, `SavedLibrary`) is untouched — different, still-valid usage.
- **`OutputItem` extracted** — `HashtagsPanel`, `YouTubeTagsPanel`, `DescriptionsPanel` each hand-rolled `output-item terminal-block > text + CopyButton` (DescriptionsPanel had it twice, for Long and Shorts). Now a shared `src/components/ui/OutputItem.jsx`. `DescriptionsPanel` passes `textClassName={undefined}` + `textStyle={{whiteSpace:'pre-line'}}` to preserve its existing (deliberately different from the `output-text` default) visual style exactly — not unified.
- **UIKit audit: `CopyButton`/`FormField` documented** — both are real, actively-used components (`CopyButton` in every output panel; `FormField` in 7 files) that were completely missing from the UIKit catalog and CLAUDE.md. UIKitPage's Buttons tab now demos the real `CopyButton` instead of static markup; Inputs tab demos `FormField` alongside the raw `form-group` CSS reference.
- **`SavedEntryRow` extracted** — `SavedLibraryItem`, `ShortsQueueItem`, `TodoItem` each hand-rolled the same `saved-entry-row terminal-block` shape (signal number + artist/song title button + tags). Now a shared `src/components/ui/SavedEntryRow.jsx` with `middle`/`actions`/`actionsClassName` slots for the parts that differ. UIKit's "saved-entry-row pattern" Data Displays entry now demos the real component instead of duplicated markup.
- **Project Settings → General uses `TemplateGroupCard`** — Project Info / Actions / Backup cards now reuse `TemplateGroupCard` (made its template-list body conditional on `onUpdateTemplates` being passed, so it also works as a plain card shell) instead of hand-rolled `tag-card` markup. Actions card gained an "Open UIKit" button; `uikit` removed from the top `AppHeader` nav tabs, now reachable only from here via `onOpenUIKit`.
- **`originalGenre` field — Stage 1 complete** — `originalGenre` added to `defaultFormData` and generator input (below Signal Number / Year). `{originalGenre}` placeholder wired into `fillHookTemplate` (`generateShortHooks.js`), `fillTemplate` + `buildGenericTitles` (`generateTitles.js`), `renderTextTemplate` (`generateCustomBlocks.js`). Added to `HOOK_PLACEHOLDERS`, `TextBlockEditor` placeholder list, and `AdvancedDescriptionFields` text placeholder list. Also backfilled `{year}` in both editor placeholder lists (was in engine but missing from autocomplete).
- **Save/load audit + fixes** — `originalYear`, `originalGenre`, `useCustomArtistShort`, `artistShort` were missing from both `handleSaveEntry` and `handleLoadEntry` in `useSavedEntries.js` — now all persisted per entry. `useInputFormLogic` auto-fill effect guarded: only fills `artistShort` when the field is empty, preserving loaded/custom values.
- **Fix `useCustomArtistShort` in Long titles** — `buildTransformationTitles` and `buildGenericTitles` now use `artistShortFinal` when `useCustomArtistShort && artistShort` (not only in Shorts mode). `fillHookTemplate` also respects it so hook-sourced Long titles show the custom short.
- **Sticky AppHeader** — new `AppHeader.jsx` replaces deleted `AppMenu.jsx`. Contains nav (looped from `PAGE_LABELS`), project selector, and page title (`activePage` + `projectConfig.name`). Accepts `actions` prop for page-specific buttons (Regenerate on Generator page). `position: sticky; top: 0`. Removed `<h1 className="app-title">` from all 6 pages and `panel-header` wrappers where they only held the title. Mobile: `.app-header-title` stacks + Regenerate goes full-width.
- **`descriptionLayout.js` utility** — `buildHookBlockMaps(hookBlocks)` and `makeLayoutLabelResolver(...)` extracted from `LongDescriptionSettings` and `ShortsDescriptionSettings`. Both files had identical derivations for `allHookBlockLayoutKeys`, `hookBlockLabelMap`, `layoutKeyToBlockKey`, and `getLayoutBlockLabel`. Now shared from `src/utils/descriptionLayout.js`.
- **`detectItemType` extracted to `customBlocks.js`** — was duplicated in `AdvancedDescriptionFields.jsx` and `StructuredListEditor.jsx`. Now a shared export alongside `isListBlock`/`isTextBlock`.
- **`TitleGenerationCard` reset button** — replaced raw `<button className="tag-reset-button">` with `IconButton`.
- **Comments session** — documented non-obvious WHY in: `AdvancedDescriptionFields` (detectItemType fallback, phraseBlockScopes `?? 'song'` default, key-swap remount trick), `BasicSongFields` (song dedup asymmetry), `LongDescriptionSettings` (layoutIndex Infinity sentinel, findLastIndex insertion logic, supportBlock special case), `StructuredListEditor` (linkSuggestionsId scope, `_id` client key + strip-before-save), `LinksRegistryEditor` (isUserAdded/isOverridden states, --full class, onBlur skip-if-unchanged).
- **Generic / no-tags title mode** — `buildGenericTitles()` in `generateTitles.js`. Templates configurable from Project Settings → Titles → Generation card. Merged into the title pool alongside transformation and hook titles.
- **Title count slider** — `LabelSliderRow` in `TitleGenerationCard`, `count` field in title config, range 1–10.
- **Block cleanup (Maxx Dee)** — removed phantom `coverSummaryBlock` from Long layout + `KNOWN_BLOCK_META`; removed unused `tagLineFallbacks` hookBlock entry; added deduplication in `buildResolvedProjectConfig` to suppress stale `customHookBlocks` entries that duplicate JSON-defined blocks.
- **Fix blocks with no nav target** — `renovationBlock` (Maxx Dee Long) converted to a Text block in `customBlocks` (`scope: 'song'`, `target: 'long'`) so it has a nav arrow → Text Blocks tab and a per-song override field in the Generator. Illegal Mind Shorts layout key changed `"header"` → `"coverLine"` to match the `shortsHeader` hookBlock's `descriptionLayoutKey` — now navigable and consistent with Maxx Dee. `hook` in both projects' Shorts layouts now navigates to Shorts Hooks: `openShortHooksSearch` threaded from `App.jsx` down through `ProjectSettingsPage` → `ProjectSettingsContent` → `ProjectSettingsDescriptions` → `ShortsDescriptionSettings` as `onNavigateToShortHooks`; `getNavigateHandler` handles `'hook'` key as a special case.
- **Block renaming** — inline ✏ icon in `BlockEditorCard` header. Click to enter rename mode; Enter/blur saves, Escape cancels. Storage: `description.blockLabelOverrides[key]` for JSON-default List/Text blocks; `description.hookBlockLabelOverrides[key]` for JSON-default Hook blocks; direct `blockData.name` / `customHookBlocks[i].label` for user-created blocks. `hasOverride` and `onReset` updated to cover label overrides. `LongDescriptionSettings` and `ShortsDescriptionSettings` gained `getLayoutBlockLabel()` helper that checks all override paths so renamed labels appear in description layout cards immediately.
- **Description layout parity** — Available and Active Layout columns are now equal width (`1fr 1fr`). Available blocks render as `BlockInfoCard` cards (same style as Active), with `→` nav arrow and `+` add button. `BlockInfoCard` gained `onAdd` prop. Both column labels moved into a shared `desc-layout-header` row above the grid so the first card in each column aligns at the same Y. New CSS: `.desc-layout-header`, `.desc-col-label`. Navigation logic extracted into `getNavigateHandler()` shared by both `renderAvailableBlock` and `renderActiveBlock` in Long/Shorts settings components.
- **UIKit page** — living component catalog at `/uikit` nav route. 5 tabs covering all reusable primitives.
- **Docs folder** — `architecture.md`, `data-model.md`, `graph-report.md`, `project-overview.md`, `roadmap.md` added.
- **Description layout builder** — both Long and Shorts. Two-column: Available palette + Active Layout. Mobile stacks to sub-tabs. Block cards are `BlockInfoCard` with nav arrows pointing to editors.
- **Hook Blocks sub-tab** — config-driven from `description.hookBlocks` in `projects.json`. Target (Long/Shorts/Both) and Scope (Project/Song) per block. Lines slider. Phrase editor via `HookTemplateEditor noWrapper`.
- **Dynamic Hook Block creation** — users can add/delete custom hook blocks from the Blocks tab. Stored in `description.customHookBlocks`. Resolved into `projectConfig.description.hookBlocks` by `buildResolvedProjectConfig`.
- **Block nav with auto-expand** — clicking `→` on a `BlockInfoCard` in the Descriptions tab navigates to the block's editor and auto-expands it. Hook blocks → Blocks → Hook Blocks; List blocks → Blocks → Lists; Text blocks → Blocks → Text Blocks.
- **`hookBlockTargets` wiring** — hook blocks appear in the Shorts layout palette based on their `target` field (`'shorts'` or `'both'`).
- **`BlockEditorCard` extraction** — shared card shell (collapse, Scope/Target selects, `BlockActions`) used by all three block type editors.
- **Song block overrides** — `storyBlock` and `logBlock` migrated to `songBlockOverrides`. Override fields appear in the generator's Advanced panel when scope is `'song'`.
- **`customGear` → `gearBlock`** — dynamic song-scoped List block with mini list editor in the generator.
- **`customCta` → `customCtaBlock`** — Text block, `scope: 'song'`, per-song override field in generator.
- **`PlaceholderField`** — unified input/textarea with `{placeholder}` autocomplete. Used in hooks, text blocks, title prefix/suffix, bulk textarea.
- **`IconButton` / `MoveControls` extraction** — all icon-only and reorder buttons unified.
- **Tag duplicate button** — duplicates a tag's full override data in the Tag Library.
- **Tag sync fix** — sync now reads raw state, not registry; A-Z sort fixed.
- **Layout widening** — output column is now 3fr (was 1fr) vs 2fr input column.
- **Tag label fix** — duplicated tags (e.g. `verse_copy_copy_copy`) now show their label in descriptions. `buildTagLine`/`buildTagPhrase` resolve `projectConfig.tags[key].label` instead of using the raw key.
- **`{year}` placeholder** — `originalYear` field added to `formData` and generator input (side by side with Signal Number). `renderTextTemplate` now substitutes `{year}` in text block templates. Hook templates already supported it via `fillHookTemplate`.
- **Graphify knowledge graph** — `graphify-out/graph.json` built (510 nodes, 980 edges). Use `graphify query "..."` for codebase questions instead of grepping files. `graphify update .` after code changes (AST-only, no token cost).
- **Backup moved to Project Settings → General** — `AppBackupControls` removed from `AppMenu`, now lives at the bottom of `ProjectSettingsGeneral`. Added description text. Project ID and Project Name are now side by side (`.form-row`), Project ID uses a disabled `form-input` to match height.

---

## In Progress

Nothing active — picking next feature.

---

## Next Recommended Tasks

1. **Tag Library card feels too complex** (2026-07-02, raised but not scoped) — user flagged the tag card (Tag info + Edit tag with 5 sub-tabs + Label/Category + 2 checkboxes + 2 buttons) as too complicated. Not yet discussed which fields/sections to cut or reorganize — needs its own conversation before any changes.
2. **Storage cleanup** (low urgency, after a few stable sessions):
   - Remove legacy key capture/restore from `appBackup.js`
   - Remove `storageMigration.js` and its `window.*` exposure in `App.jsx`

---

## Known Issues

### Storage cleanup debt
- `appBackup.js` still references old standalone localStorage keys in its `legacy` field export — no longer needed since the unified key has everything.
- `storageMigration.js` is dead production code (only exposed to `window.*` in DEV mode via `App.jsx`). Safe to delete.
- `useTagVisibilityOverrides.js` writes to a `tagVisibilityOverrides` field that nothing reads back through the hook interface — effectively dead. The field itself inside the unified storage object must stay for data-shape compatibility, but the hook may be removable.

### `coverLabel` not editable from UI
Shorts Description uses a `coverLabel` block that is only configurable by hand-editing `projects.json`. No settings field exists.

### `customHashtags` is hardcoded
The per-song custom hashtag field in `AdvancedDescriptionFields.jsx` is still a raw `formData.customHashtags` field, not part of the block override system. It predates the block system and needs separate design work.

---

## Important Files

| File | Why it matters |
|------|---------------|
| `src/config/projects.json` | Base config for both projects. All generation and block structure starts here. |
| `src/utils/buildResolvedProjectConfig.js` | Merges `projects.json` + `tagOverrides` + `projectSettingsOverrides` → resolved config. Called on every render. |
| `src/utils/customBlocks.js` | Shared utilities for all block types: `isListBlock`, `isTextBlock`, `detectItemType`, `getBlockLabel`, `generateBlockKey`, `SCOPE_OPTIONS`, `TARGET_OPTIONS`. All block editors import from here. |
| `src/utils/descriptionLayout.js` | Shared helpers for both description layout builders: `buildHookBlockMaps(hookBlocks)` and `makeLayoutLabelResolver(...)`. Import here before adding anything to Long/Shorts description settings. |
| `src/utils/storage.js` | Single storage API. All reads/writes go through `readAppStorage` / `updateAppStorage`. |
| `src/utils/appBackup.js` | Export/import. The safety net for all storage work. Must stay reliable. |
| `src/hooks/useProjectOverrides.js` | All project settings overrides (descriptions, blocks, titles, links, etc.) live here. |
| `src/hooks/useAppShellState.js` | Top-level UI state: activePage, formData, panelVisibility, navigation targets (tagLibrarySearchTarget, etc.). |
| `src/components/AppHeader.jsx` | Sticky app header: nav tabs (looped from `PAGE_LABELS`), project selector, page title, optional `actions` slot. Replaces deleted `AppMenu.jsx`. |
| `src/components/projectSettings/descriptions/LongDescriptionSettings.jsx` | Description layout builder for Long descriptions. Block nav wiring lives here. |
| `src/components/projectSettings/descriptions/ShortsDescriptionSettings.jsx` | Same for Shorts. |
| `src/components/projectSettings/ProjectSettingsHookBlocks.jsx` | Hook Blocks tab. Config-driven from `projectConfig.description.hookBlocks`. |
| `src/components/projectSettings/blocks/BlockEditorCard.jsx` | Shared card chrome for all block type editors. |
| `src/components/ui/BlockInfoCard.jsx` | Read-only card in description layout builder. `onNavigate` sets the `→` arrow. |
| `src/engine/descriptions/` | Long and Shorts description generation. Reads resolved config and formData only — no React, no storage. |
| `src/pages/UIKitPage.jsx` | Living component catalog. Check here before building any new UI pattern. |

---

## Architectural Notes

**Config-driven, not code-driven.** `projects.json` is the bootstrap template. All real per-project configuration lives in localStorage overrides merged by `buildResolvedProjectConfig`. Engine and UI consume the resolved config — never the raw JSON directly.

**Storage is a single key.** All live app state reads/writes `illegalMindGeneratorData`. The old standalone keys (`savedEntries`, `shortsQueueByProject`, `tagOverrides`, etc.) are inert. Do not write new code targeting them. `tagVisibilityOverrides` as a *field inside* the unified object must stay for data-shape compatibility.

**Pages orchestrate, components render, engine generates.** No generation logic in components. No UI logic in engine files. Storage access only through hooks or `storage.js` utils — the two known exceptions (`SavedLibrary.jsx` and `GeneratorPage.jsx` calling `updateAppStorage` directly) are acknowledged tech debt.

**`longPrefix` vs `prefix`.** Illegal Mind uses `longPrefix` (legacy). Engine reads `config.title?.prefix || config.title?.longPrefix`. Do not consolidate — both keys must stay.

**Block collision detection.** `generateBlockKey` must check all `customBlocks` keys regardless of block type. List and Text blocks share one key namespace. Missing a key produces silent collisions.

**Hook Blocks vs description layout keys.** A hook block's `key` is its config/storage key; `descriptionLayoutKey` is its key in the layout array (may differ, e.g. `introHook` → `introBlock`). Both are needed. `layoutKeyToBlockKey` (and the other hook block maps) are derived by `buildHookBlockMaps()` in `src/utils/descriptionLayout.js`, shared by both Long and Shorts settings.

**Song-scoped block overrides.** Song-scoped Text/List/Hook blocks get override fields in the generator's Advanced panel. Overrides stored in `formData.songBlockOverrides[blockKey]`. Wins over project-default template at engine time via `getEffectiveSongOverrides`. Legacy fields (`customCta`, `customStory`, `customLogNote`) are seeded into `songBlockOverrides` on entry load in `useSavedEntries`.

**Backup is the safety net.** Any storage change must be tested with export/import. The backup format is version 3: `{ version, exportedAt, data: {unified storage}, legacy: {old keys} }`.

---

## AI Notes

**Reuse before creating:**
- `IconButton` — every small action button (reset, remove, move, labeled). Default class `tag-reset-button`; pass `button-secondary` for bordered look.
- `TemplateGroupCard` — any collapsible card with a template list and reset button. `ShortHookCard` is a thin adapter over it.
- `BlockEditorCard` — card shell for block editors (collapse, scope/target selects, actions). All three block type editors use it.
- `BlockInfoCard` — read-only card in description layouts. Set `onNavigate` for the `→` arrow; omit for non-interactive generated blocks.
- `SubTabNav` — lightweight underline tab nav. Use inside pages for sub-sections.
- `PlaceholderField` — any input that should support `{placeholder}` autocomplete. Don't build a custom autocomplete.
- `MoveControls` — up/down reorder. Don't hand-roll `IconButton` pairs for this.
- `HookTemplateEditor` — searchable phrase list with add/bulk. Always use this inside `TemplateGroupCard`, not directly in feature components.
- `AppHeader` — the sticky app header. Do not add `<h1 className="app-title">` in individual pages; titles live here, derived from `activePage` + `projectConfig.name`.

**Do not duplicate:**
- `customBlocks.js` — single source of truth for block utilities (`isListBlock`, `isTextBlock`, `detectItemType`, `getBlockLabel`, etc.). All block editors import from here.
- `descriptionLayout.js` — shared helpers for both description layout builders (`buildHookBlockMaps`, `makeLayoutLabelResolver`). Do not re-derive these maps inline.
- `storage.js` — all reads/writes go through here. Don't call `localStorage` directly.
- Description layout logic — `LongDescriptionSettings` and `ShortsDescriptionSettings` share the same structural pattern. Keep them in sync when changing either.

**Side-effect-sensitive areas:**
- `buildResolvedProjectConfig` — runs on every render. Changes here affect every page simultaneously.
- Tag overrides — editing a tag immediately changes titles, descriptions, hooks, and hashtags. Test the full generator output after tag system changes.
- `appBackup.js` — must export the complete `illegalMindGeneratorData` object. Any new top-level storage key must be added here or it won't survive backup/restore.
- Description layout arrays — stored in `projectSettingsOverrides.description.layout` (Long) and `projectSettingsOverrides.description.shortsLayout` (Shorts). If you add a new block key to `projects.json`, it won't appear in existing user layouts until the user adds it from the Available palette.
- `hookBlocks` config shape — each entry needs `key`, `label`, `path`, `templateKey`. `descriptionLayoutKey` only when layout key differs from `key`. Don't add entries without checking all three places: config resolution, engine template reading, and the description layout builder.

**UIKit page** — navigate to it in the app (`/uikit`) to see live interactive examples of every UI primitive before building anything new.

---

## Session Summary

The app is functionally complete for its core feature set. Recent sessions cleaned up the description block system: fixed nav gaps (renovationBlock, hook, header), removed phantom/stale blocks in Maxx Dee (coverSummaryBlock, tagLineFallbacks hookBlock entry), and added deduplication to prevent stale localStorage entries from causing duplicate hook blocks. Next priority is new features: generic/no-tags title mode, queue-hidden indicators, or Todo status badges in the library.
