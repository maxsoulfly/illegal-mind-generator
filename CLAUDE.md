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

- `TemplateGroupCard` — generic card: label + templates + reset + count + optional subtitle. Base for ShortHookCard and description cards.
- `ShortHookCard` — adapter over TemplateGroupCard for hook-specific data shape (`hookConfig` object + `hookType`). **TODO:** evaluate collapsing adapter once hook data shape is refactored.
- **TODO:** extract `CardHeader` component (h3 + reset button + optional remove button + count badge) — then refactor TemplateGroupCard and ShortHookCard to use it.
- `HookTemplateEditor` — searchable template list with add/bulk/highlight+scroll support
- `SubTabNav` — lightweight tab nav (underline active, no pill borders). Takes `tabs: [{id, label}]`.
- `NavLinkButton` — clickable text for source navigation. `muted` prop for base hooks.
- `PhraseRow` — forwardRef row, onBlur save, `highlighted` prop for scroll target. Optional `placeholders` prop enables the `{placeholder}` autocomplete on its field (see `PlaceholderField`); omit it to keep a plain input (e.g. `TagPhraseEditor` doesn't pass one yet).
- `PlaceholderField` — input or textarea (`multiline` prop) with a `{placeholder}` autocomplete dropdown: typing `{` starts tracking a query, filters the passed-in `placeholders` array (braces included, e.g. `'{artist}'`), arrow keys + Enter to select, Escape/click-away to dismiss, inserts at cursor. Each caller supplies its own contextually-correct placeholder list (Text Blocks: `artist`/`song`/`tagLine`/`links.*`; Hooks: `artist`/`song`/`signalNumber`/`num`/`decade`/`year`/`years`/`currentYear`/`primaryTag` — matches what each engine function actually replaces, so keep these two lists in sync with `generateCustomBlocks.js`'s `renderTextTemplate` and `generateShortHooks.js`'s `fillHookTemplate` respectively if those change). `defaultValue`-driven with onBlur save, but resyncs on external `defaultValue` change (e.g. reset) without needing a remount.
- `ToggleInputRow` — checkbox + label + input (clicking label toggles checkbox)
- `LabelInputRow` — label + input, `compact` mode via `form-input--compact`
- `LabelSliderRow` — label + range slider + value display
- `AddBulkRow` — + Add / + Bulk button row
- `BulkTextarea` — textarea + Apply/Cancel
- `IconButton` — shared shell for every icon-only action (reset ↺, remove ×, lock 🔒/🔓, move ↑/↓, add +). Takes `icon, title, onClick, disabled, stopPropagation, className`. Default `className` is `tag-reset-button`; pass a different one (e.g. `button-secondary`) to reuse the click/disabled wiring with a different look.
- `MoveControls` — up/down reorder button pair built on `IconButton`. Used by list items and description block reordering; pass `className` for context-specific layout (see `.desc-block-move-controls`).
- `FormSelect` — the standard `form-select` dropdown (same look as `TodoStatusSelect`) wrapped with `stopPropagation` for use inside clickable card headers. Takes `value, onChange(value), options: [{value, label}]`.
- `BlockInfoCard` — structural-only card (label + optional remove + optional collapsible body). Used in Description layouts for blocks that aren't edited inline (e.g. List/Text blocks point here to "Edit content in Project Settings → Blocks").

---

# Known Gotchas

**Storage is sensitive.** Changing storage casually can break saved entries, queues, todos, backup import/export.

**Laptop is source of truth.** Desktop sync testing is incomplete.

**Tag system is deeply connected.** Tags affect titles, descriptions, hooks, hashtags, usage tracking.

**Title engine key names.** `projects.json` for Illegal Mind uses `longPrefix` (legacy) instead of `prefix`. Engine reads `config.title?.prefix || config.title?.longPrefix`. Do not consolidate — legacy key must stay.

**Short Hooks vs Shorts Titles.** Two separate systems:
- `generateShortHooks.js` — hook-based shorts titles, reads `shortsPrefix`/`shortsSuffix` (fallback: `shortHookSuffix`)
- `generateTitles.js` Shorts mode — transformation-based shorts titles, same keys

Both editable via Project Settings → Titles → Generation card. `shortHookSuffix` in `projects.json` is legacy fallback — do not remove.

**Title object shape.** Generated titles are objects: `{ text, sourceHook, sourceTemplate }`.
- `sourceHook` → `{ sourceType: 'tag'|'base', sourceTag, hookType, sourceText }`
- `sourceTemplate` → `{ template, groupName }`
- Both null for plain text titles.
- `NavLinkButton` in `GeneratedTitlePair` handles all four cases.

**`tagVisibilityOverrides` is legacy.** Do not remove. Treat as compatibility-sensitive.

**Avoid premature database work.** Migration is postponed. Current priority is feature completeness.

---

# Block Type System

The description block system is designed to be fully UI-configurable. The goal: a user should be able to build a new project from scratch — different language, different goals, original songs — without editing any JSON.

`projects.json` is a **bootstrap template only**. All real configuration lives in localStorage overrides (backed up/restored via Backup System), eventually migrated to a DB once feature-complete.

## Four block types

| Type | What it is | User-creatable | Examples |
|---|---|---|---|
| **List** | `{ title, items: [{ label, text\|link }], scope, target, itemType, isCore, name }` | **Yes — built** | `gearBlock`, `supportBlock`, `playlistBlock`, `customCtaBlock` |
| **Text** | Single paragraph, optional `{placeholders}`. Legacy blocks are a plain string; UI-created ones are `{ text, scope, target, isCore, name }` | **Yes — built** | `mixingCtaBlock` |
| **Block Group** | Multiple template lines forming a section | Not started | `broadcastBlock`, `logBlock` |
| **Generated** | Engine-driven output, parameters only | No (engine code required) | `technicalBlock`, hook blocks |

All List/Text blocks live together in `customBlocks` under `templates.long` regardless of which description(s) they `target` — `target` decides eligibility for Long/Shorts, not storage location. `src/utils/customBlocks.js` is the shared home for `isListBlock`/`isTextBlock`/`getBlockLabel`/`generateBlockKey`/`updateLongKey`/`removeLongKey` — both block-type editors and both Description settings pages import from here so List and Text stay consistent. `generateBlockKey` collision checks must see *every* `customBlocks` key regardless of type (List and Text share one namespace).

**Project Settings → Blocks** has Lists / Text Blocks sub-tabs (`ProjectSettingsBlocks.jsx`). Each block type's editor (`StructuredListEditor` / `TextBlockEditor`) shares: header with Scope/Target `FormSelect`s, `BlockActions` (Reset for blocks with a JSON default; Lock 🔒/🔓 + Delete for blocks without one — deletion is blocked while locked), and an "+ Add" form at the bottom (`AddListBlockForm` / `AddTextBlockForm`).

## Block scope

Each block has a **scope** field (stored in overrides, user-set in the editor):

- **Project** — same value across all songs (links, playlists, support info)
- **Song** — has a project default, overridable per song (gear, custom notes)

`customGear` in the generator form is an existing ad-hoc song-level override — eventually replaced by a proper song-scoped List editor.

## Block targets

Each block can target **Long Description**, **Shorts Description**, or both, via a `target` field (`long`/`shorts`/`both`). Both `generateDescriptions.js` (Long) and `generateShortDescriptions.js` (Shorts) render List/Text blocks via the shared `renderCustomBlock` (in `generateCustomBlocks.js`) — Shorts list-block output is padded with blank lines so it stands apart from the single-newline-joined surrounding lines.

Dynamic blocks (no JSON default, created from the Blocks tab) have no position in the static layout array — they're appended at the end when added to a layout, and sort to the end on "Reset Order". In each Description settings page (`LongDescriptionSettings.jsx` / `ShortsDescriptionSettings.jsx`), an active List/Text block renders as a structural-only `BlockInfoCard` pointing to "Project Settings → Blocks → Lists/Text Blocks" — Descriptions never shows a List/Text content editor inline, only structure (order, scope, target). Phrase-template blocks (`introBlock`, `header`, etc.) are the exception — those still edit inline via `TemplateGroupCard`, matching how they worked before this system existed.

---

# Current Focus

## Project Settings — Descriptions (in progress)

Description layout builder. Two-column: Available palette (left) + Active Layout (right).

**Sub-tabs:** Long Description / Shorts Description — lighter style (`SubTabNav`, underline active).
**Desktop:** two columns. **Mobile:** Option C — sub-tabs replace columns (Layout / Available tabs).

### Editable long description blocks

| Layout block | Config key | Location |
|---|---|---|
| `broadcastBlock` | `broadcastHeader`, `operatorStatuses`, `statusLines` | `templates.long` / `description` |
| `introBlock` | `introHook` | `templates.long` |
| `storyBlock` | `storyBlock` | `templates.long` |
| `logBlock` | `logNotes` | `templates.long` |
| `closingBlock` | `closingSignal`, `philosophyLine` | `templates.long` |

`technicalBlock` and `supportBlock` are tag-driven or link-structured — not template-editable.

### Steps

* [x] Step 1: Long/Shorts sub-tabs (`SubTabNav`, lighter style)
* [x] Step 2: Two-column skeleton (Available + Active Layout) + `TemplateGroupCard` for cards
* [x] Step 3: Mobile — stack into Layout/Available sub-tabs below breakpoint
* [x] Step 4: Wire `layout` array override (add/remove blocks between columns) — both Long and Shorts; Shorts previously had a disconnected editor-only arrangement (`shortsEditorLayout`) that didn't affect generation at all, now replaced by the real thing
* [x] Step 5: Add missing editable blocks (broadcastHeader, operatorStatuses, statusLines, logNotes)
* [~] Step 6: Shorts Description — `secondary`/`count`/layout done; `coverLabel` still has no settings field anywhere, only read by the engine
* [ ] Step 7: Drag-and-drop reordering (future) — currently up/down buttons (`MoveControls`) only
* [x] Step 8: Add new blocks from UI — List done, Text done, Block Group not started

---

## Other Active Goals

- Generic / no-tags title mode (bypass transformation tags)
- Queue-hidden indicator in Todo rows
- Todo status badges in Saved Library
- Saved Library Todo filtering
- CSS refactor (consolidate index.css, clean up class naming)
- `coverLabel` (Shorts Description) has no settings UI — only editable by hand-editing `projects.json`
- Block Group block type not started (Step 8 above)

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
- **Reuse before creating** — check existing components before adding new ones
- **Simple architecture** — single developer, no enterprise patterns, no unnecessary abstraction
- **onBlur saves** — phrase/template edits save on blur, not on keystroke (future DB compatibility)

---

# Development Preferences

- **Step-by-step, one change at a time.** Present each step, implement it, then stop and wait for the user to review and approve before moving to the next. Never chain multiple steps autonomously.
- Hands-on, file by file, small chunks
- Show the change, explain it, let the user review before moving on
- Do NOT batch into autonomous pass unless user says so
- Work in grouped steps, keep changes focused
- Prefer code examples over theory
- Ask for files instead of guessing structure
- Provide Conventional Commit messages when asked
- When uncertain: choose the simpler solution
