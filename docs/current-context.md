# Current Context

Developer handoff file. Updated end of session. Describes what is actually done, in progress, and next — not plans or history.

---

## Current Focus

**Block renaming** — no inline label-edit field exists yet in Project Settings → Blocks (Lists, Text Blocks, Hook Blocks sub-tabs). Users can't rename blocks from the UI. Applies to both JSON-default blocks (should store label override in `projectSettingsOverrides`) and user-created blocks (update `label` in `customHookBlocks` / `customBlocks`).

---

## Recently Completed

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

- **Block renaming** — no UI yet. Needs inline edit in `BlockEditorCard` header. JSON-default blocks: store label override in `projectSettingsOverrides`. User-created: update stored `label` field.

---

## Next Recommended Tasks

1. **Add block renaming** — inline name-edit field in `BlockEditorCard` header. Applies to all three block type sub-tabs.
2. **Fix blocks with no nav target** — three blocks in description layouts have non-interactive cards (arrow does nothing):
   - `renovationBlock` (Maxx Dee Long Desc) — not in `hookBlocks` config, not a custom block; needs an editor or hardcoded nav target
   - `hook` and `header` (Shorts Description) — are hook blocks but need a special nav case (currently `onNavigateToBlock` only handles the three Blocks sub-tabs, not Shorts Hooks)
3. **Remove duplicated Technical Lines block in Maxx Dee** — appears as a `hookBlock` entry with no delete option. Check `projectSettingsOverrides` for Maxx Dee and remove the stale entry.
4. **Generic / no-tags title mode** — bypass transformation tags, generate plain titles. New generation path in `generateTitles.js`.
5. **Queue-hidden indicator in Todo rows** — show `[hidden]` badge on Todo items whose entry has `excludeFromRandomizer: true`.
6. **Todo status badges in Saved Library** — show the entry's `todo.status` inline in `SavedLibraryItem`.
7. **Storage cleanup** (low urgency, after a few stable sessions):
   - Remove legacy key capture/restore from `appBackup.js`
   - Remove `storageMigration.js` and its `window.*` exposure in `App.jsx`

---

## Known Issues

### Blocks with no editor nav
- `renovationBlock` in Maxx Dee's Long Description layout — exists in the Active Layout but has no `onNavigate` because it's neither in `hookBlocks` config nor `customBlocks`. `KNOWN_BLOCK_META` in `LongDescriptionSettings.jsx` labels it but can't route to an editor.
- `hook` and `header` in Shorts Description — these map to Shorts Hooks config, not the Blocks tab. `onNavigateToBlock` only handles `subTab: 'hooks'|'lists'|'text'`, which points to Project Settings → Blocks sub-tabs, not Project Settings → Shorts Hooks.

### Duplicate block (Maxx Dee)
Technical · Lines appears twice in Maxx Dee's Project Settings → Blocks → Hook Blocks. Delete button is unavailable (likely `isCore` guard or wrong path). Root in `projectSettingsOverrides` for Maxx Dee — needs manual inspection and removal.

### Description layout column asymmetry
`.desc-layout` grid: `220px 1fr`. Available column is too narrow; Active is too wide. Visually inconsistent.

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
| `src/utils/customBlocks.js` | Shared utilities for all block types: `isListBlock`, `isTextBlock`, `getBlockLabel`, `generateBlockKey`, `SCOPE_OPTIONS`, `TARGET_OPTIONS`. All block editors import from here. |
| `src/utils/storage.js` | Single storage API. All reads/writes go through `readAppStorage` / `updateAppStorage`. |
| `src/utils/appBackup.js` | Export/import. The safety net for all storage work. Must stay reliable. |
| `src/hooks/useProjectOverrides.js` | All project settings overrides (descriptions, blocks, titles, links, etc.) live here. |
| `src/hooks/useAppShellState.js` | Top-level UI state: activePage, formData, panelVisibility, navigation targets (tagLibrarySearchTarget, etc.). |
| `src/components/projectSettings/descriptions/LongDescriptionSettings.jsx` | Description layout builder for Long descriptions. Block nav wiring lives here. |
| `src/components/projectSettings/descriptions/ShortsDescriptionSettings.jsx` | Same for Shorts. Hook/Header nav gap is here. |
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

**Hook Blocks vs description layout keys.** A hook block's `key` is its config/storage key; `descriptionLayoutKey` is its key in the layout array (may differ, e.g. `introHook` → `introBlock`). Both are needed. `LongDescriptionSettings` derives `layoutKeyToBlockKey` to map back from layout to config key for nav.

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

**Do not duplicate:**
- `customBlocks.js` — single source of truth for block utilities. All block type editors import from here.
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

The app is functionally complete for its core feature set. The generator, tag library, shorts queue, todo system, all nine project settings tabs, and the description block system (Lists, Text Blocks, Hook Blocks with scope/target/layout builder) are all working. The most recent session added a documentation layer (`docs/`) and a living UIKit page cataloging all reusable components. Active development focus is finishing the description layout visual polish (equal column widths) and adding block renaming. Three known nav gaps in the description layout builder remain unfixed (renovationBlock, hook, header blocks have non-interactive cards), and a duplicated Technical Lines block in Maxx Dee needs to be removed. Storage cleanup (dead `storageMigration.js`, legacy keys in `appBackup.js`) is deferred until a few more sessions confirm nothing regressed.
