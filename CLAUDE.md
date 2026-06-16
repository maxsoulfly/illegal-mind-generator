# CLAUDE.md

# PRIORITY TODO (fix on laptop)

**Backup system is broken or incomplete.** A backup exported at end of last laptop session was missing: Saved Library, full tag library (tags incomplete), Todos, Shorts Queue. Investigate what keys are being written to the export and compare against the full storage shape in `illegalMindGeneratorData`. Likely a subset of keys is being exported or the backup was taken before data was flushed. Fix export to capture all keys reliably before any other storage work.

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
- **Project Settings** — per-project config overrides for hooks, titles, descriptions, general settings.

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
- Never delete legacy keys even if they seem redundant
- No automatic migration — migration is intentionally paused
- Storage changes are high risk: backup → verify shape → add safe fallbacks → test export/import → test refresh persistence

---

# UI Primitives (`src/components/ui/`)

- `TemplateGroupCard` — generic card: label + templates + reset + count + optional subtitle. Base for ShortHookCard and description cards.
- `ShortHookCard` — adapter over TemplateGroupCard for hook-specific data shape (`hookConfig` object + `hookType`). **TODO:** evaluate collapsing adapter once hook data shape is refactored.
- **TODO:** extract `CardHeader` component (h3 + reset button + optional remove button + count badge) — then refactor TemplateGroupCard and ShortHookCard to use it.
- `HookTemplateEditor` — searchable template list with add/bulk/highlight+scroll support
- `SubTabNav` — lightweight tab nav (underline active, no pill borders). Takes `tabs: [{id, label}]`.
- `NavLinkButton` — clickable text for source navigation. `muted` prop for base hooks.
- `PhraseRow` — forwardRef row, onBlur save, `highlighted` prop for scroll target
- `ToggleInputRow` — checkbox + label + input (clicking label toggles checkbox)
- `LabelInputRow` — label + input, `compact` mode via `form-input--compact`
- `LabelSliderRow` — label + range slider + value display
- `AddBulkRow` — + Add / + Bulk button row
- `BulkTextarea` — textarea + Apply/Cancel

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
| **List** | `{ title, items: [{ label, text\|link }] }` | Yes | `gearBlock`, `supportBlock`, `playlistBlock` |
| **Text** | Single paragraph, optional `{placeholders}` | Yes | `storyBlock`, `introBlock`, CTA, static text |
| **Block Group** | Multiple template lines forming a section | Yes | `broadcastBlock`, `logBlock` |
| **Generated** | Engine-driven output, parameters only | No (engine code required) | `technicalBlock`, hook blocks |

Types 1–3 are pure data — no engine code needed to add new blocks of these types from the UI. Generated blocks are system-provided and configurable but not user-creatable.

## Block scope

Each block has a **scope** field (stored in overrides, user-set in the editor):

- **Project** — same value across all songs (links, playlists, support info)
- **Song** — has a project default, overridable per song (gear, custom notes)

`customGear` in the generator form is an existing ad-hoc song-level override — eventually replaced by a proper song-scoped List editor.

## Block targets

Each block can target **Long Description**, **Shorts Description**, or both. This is set per block and drives which layout palette the block appears in.

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
* [ ] Step 3: Mobile — stack into Layout/Available sub-tabs below breakpoint
* [ ] Step 4: Wire `layout` array override (add/remove blocks between columns)
* [ ] Step 5: Add missing editable blocks (broadcastHeader, operatorStatuses, statusLines, logNotes)
* [ ] Step 6: Shorts Description (coverLabel, secondary, count)
* [ ] Step 7: Drag-and-drop reordering (future)
* [ ] Step 8: Add new blocks from UI (List → Text → Block Group, in that order)

---

## Next — Structured List Editor (Project Settings → Links)

First implementation of the **List** block type. Lives in `src/components/projectSettings/ProjectSettingsLinks.jsx` (placeholder exists).

Reusable `StructuredListEditor` component — one editor covers all List blocks:

| Block | Item shape | Scope | Target |
|---|---|---|---|
| `gearBlock` | label + text | Song | Long |
| `supportBlock` | label + link | Project | Long + Shorts |
| `playlistBlock` | label + link | Project | Long |

Each block has: title, items (add/edit/remove/reorder), scope badge (Project / Song), target (Long / Shorts / Both).

Saves to `projectSettingsOverrides`. `customGear` form field remains as song-level override — eventually replaced by a song-scoped List editor in the generator form.

---

## Other Active Goals

- Generic / no-tags title mode (bypass transformation tags)
- Queue-hidden indicator in Todo rows
- Todo status badges in Saved Library
- Saved Library Todo filtering
- CSS refactor (consolidate index.css, clean up class naming)
- **List block target not wired to engine** — `target` (long/shorts/both) is saved per block in overrides but the shorts description generator does not yet read it. List blocks with target "shorts" or "both" will not appear in Shorts Description until the shorts generator is updated to include blocks based on their `target` field.

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
