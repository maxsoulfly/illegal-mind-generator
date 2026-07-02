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

- `TemplateGroupCard` — generic card: label + templates + reset + count + optional subtitle. Base for ShortHookCard and description cards.
- `ShortHookCard` — adapter over TemplateGroupCard for hook-specific data shape (`hookConfig` object + `hookType`). **TODO:** evaluate collapsing adapter once hook data shape is refactored.
- **TODO:** extract `CardHeader` component (h3 + reset button + optional remove button + count badge) — then refactor TemplateGroupCard and ShortHookCard to use it.
- `HookTemplateEditor` — searchable template list with add/bulk/highlight+scroll support. `noWrapper` prop skips the `<details>` collapse wrapper (used by Hook Blocks tab where the parent card already collapses).
- `SubTabNav` — lightweight tab nav (underline active, no pill borders). Takes `tabs: [{id, label}]`.
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
- `FormSelect` — the standard `form-select` dropdown (same look as `TodoStatusSelect`) wrapped with `stopPropagation` for use inside clickable card headers. Takes `value, onChange(value), options: [{value, label}]`.
- `BlockEditorCard` — collapsible card shell for all three block type editors (Lists, Text Blocks, Hook Blocks). Props: `label`, `badge`, `scope`, `target`, `onScopeChange`, `onTargetChange`, `hasOverride`, `onReset`, `onDelete`, `onRename`, `open`, `children`. `onRename` enables an inline ✏ rename button in the header — clicking switches to an input; Enter/blur saves, Escape cancels.
- `BlockInfoCard` — non-collapsible card used in Description layouts. Props: `label`, `onRemove`, `onAdd`, `onNavigate`. When `onNavigate` is set, the header becomes a clickable nav shortcut (`tag-card-toggle` style, `→` indicator) that jumps to the block's editor tab and auto-expands it — Hook blocks → Blocks → Hook Blocks, List blocks → Blocks → Lists, Text blocks → Blocks → Text Blocks. `onAdd` renders a `+` button (Available column); `onRemove` renders a `×` button (Active Layout column). Generated blocks (no editor) omit `onNavigate` and are non-interactive. Descriptions tab is layout-only; no inline editing of any block type.
- `AppHeader` (`src/components/AppHeader.jsx`) — sticky app-level header. Contains nav tabs (looped from `PAGE_LABELS`), project selector, page `<h1>` (derived from `activePage` + `projectConfig.name`), and optional `actions` slot for page-specific buttons (currently only the Regenerate button on Generator page). Replaces the deleted `AppMenu.jsx`. Do not add page titles (`<h1 className="app-title">`) in individual pages — they belong here. `uikit` is intentionally excluded from `PAGE_LABELS` (not a top nav tab) — reachable only via the "Open UIKit" button in `ProjectSettingsGeneral`'s Actions card, wired through `onOpenUIKit`.

---

# Known Gotchas

**Storage is sensitive.** Changing storage casually can break saved entries, queues, todos, backup import/export.

**`handleSaveEntry` / `handleLoadEntry` have explicit field lists.** Adding a new `formData` field does NOT automatically persist it per-entry — you must add it to both functions in `useSavedEntries.js`. Fields currently saved/loaded: `artist`, `song`, `signalNumber`, `originalYear`, `originalGenre`, `useCustomArtistShort`, `artistShort`, `transformationTags`, `customHashtags`, `customCta`, `songBlockOverrides`, `excludeFromRandomizer`, `todo`. `videoType` is intentionally omitted (session/UI state). `changesMade`/`extraVibeNote` are reserved but unused.

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

**Block label overrides live in two separate keys** inside `projectSettingsOverrides.description`:
- `blockLabelOverrides[blockKey]` — overrides display label for JSON-default List/Text blocks (from `KNOWN_CUSTOM_BLOCKS`)
- `hookBlockLabelOverrides[blockKey]` — overrides display label for JSON-default Hook blocks (from `projects.json`)
- User-created blocks store their label directly (`blockData.name` for List/Text, `customHookBlocks[i].label` for Hook) — no separate override key needed.
- `LongDescriptionSettings` and `ShortsDescriptionSettings` use `getLayoutBlockLabel(blockKey)` which checks both override maps before falling back to config labels. If you add a new place that displays block labels, make sure it also checks these overrides.

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

Hook Blocks (`storyBlock`, `logBlock`) are phrase-template arrays — the engine picks one at random per generation. When `scope: 'song'`, a per-song override text field appears in the generator's Advanced panel (rendered by `PHRASE_BLOCK_OVERRIDES` in `AdvancedDescriptionFields.jsx`'s `SongBlockOverrideFields`). The override is a plain string stored in `formData.songBlockOverrides[blockKey]` and wins over the randomly-picked project template.

Scope for Hook Blocks is stored in `description.templates.long.phraseBlockScopes` (a map of `blockKey → 'song'|'project'`). When scope is `'project'`, no override field appears in the generator. Editable in Project Settings → Blocks → Hook Blocks. Default scope (when no override exists) is `'project'`.

## Block targets

Each block can target **Long Description**, **Shorts Description**, or both, via a `target` field (`long`/`shorts`/`both`). Both `generateDescriptions.js` (Long) and `generateShortDescriptions.js` (Shorts) render List/Text blocks via the shared `renderCustomBlock` (in `generateCustomBlocks.js`) — Shorts list-block output is padded with blank lines so it stands apart from the single-newline-joined surrounding lines.

Hook Block target is stored in `description.hookBlockTargets[key]` in overrides. Default is derived from `block.path` (`'shorts'` → `'shorts'`, anything else → `'long'`). The engine reads this via the Descriptions tab Active Layout — a hook block with target `'shorts'` or `'both'` appears in the Shorts Available palette and can be added to the Shorts layout; the engine resolves its templates via `resolveHookBlockTemplates(layoutKey, projectConfig)` in `generateCustomBlocks.js` (shared helper used by both `generateDescriptions.js` and `generateShortDescriptions.js`). Same helper covers the Long engine for any Shorts-path hook block added to the Long layout.

Dynamic blocks (no JSON default, created from the Blocks tab) have no position in the static layout array — they're appended at the end when added to a layout, and sort to the end on "Reset Order". Both Description settings pages (`LongDescriptionSettings.jsx` / `ShortsDescriptionSettings.jsx`) are now **layout-only** — all block types render as `BlockInfoCard` pointing to their editing location. No inline template editing in the Descriptions tab. Hook blocks are detected by deriving `allHookBlockLayoutKeys` from `projectConfig.description.hookBlocks` at runtime (using `descriptionLayoutKey ?? key` on each entry) — no hardcoded lists.

---

# Current Focus

`originalGenre` is now fully done through Stage 3. Stage 2 (2026-07-02): added a new `original` Shorts Hook type to both projects — `requiresGenre: true`, no `excludeForFaithful`, templates `"The best {originalGenre} song of {year}"` / `"{originalGenre} perfection since {year}"` / `"Still the greatest {originalGenre} track from {year}"`. Stage 3 (shipped earlier in `63ce426`): a `contrast` Shorts Hook type (`excludeForFaithful: true`, `requiresGenre: true`) using `{originalGenre}` + `{primaryTag}`, gated in `generateShortHooks.js`.

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
3. Run `graphify update .` to keep the knowledge graph current (AST-only, no token cost).
4. Commit all source + docs changes together.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
