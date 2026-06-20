# Illegal Mind Generator — Project Overview

A developer onboarding guide. Covers what the app does, who uses it, main workflows, and the rules that matter most when contributing.

---

## What Is This App?

Illegal Mind Generator is a local-first React app that automates YouTube content packaging for two independent music cover channels. It generates and manages titles, descriptions, hashtags, thumbnail suggestions, and tags — and also handles content planning, upload queue management, and production tracking.

There is no backend, no cloud sync, and no database. All data lives in localStorage. The app runs fully offline.

### The Two Projects

The app supports two YouTube channels, which are called "projects" internally:

**Illegal Mind Covers** — post-apocalyptic SIGNAL series. Covers are reframed as "signal reworks" within a dystopian lore universe. Titles, descriptions, and hooks are written in-character as system transmissions and operator logs. Transformation-focused (darker, heavier, punk, etc.).

**Maxx Dee Covers** — traditional faithful covers. Modernized home studio recordings, performance-focused. Less lore, more authenticity. Tone is direct and production-aware.

Both projects share the same app architecture and tag system, but the generated content looks and sounds completely different. Configuration drives almost all of that difference.

---

## The Problem It Solves

Publishing YouTube covers manually means writing metadata for every video — and for each song there might be multiple versions (a punk cover, a heavier cover, a slower cover, etc.). Each version needs consistent but unique titles, descriptions, hooks, and hashtags. Doing this by hand is slow and produces inconsistent results over time.

This app automates that process. The user enters an artist name, song title, signal number, and one or more transformation tags. The app generates all YouTube metadata output instantly, based on rules defined in config and overrides stored in localStorage.

Beyond generation, the app also tracks:

- Which songs have been saved to the library
- Which covers are planned, recorded, or waiting on video edit
- Which Shorts are queued for upload
- Which transformation tags are in use and what they contribute

---

## Main User Workflows

### Generate content for a song

1. Open the Generator page
2. Enter artist name, song name, and signal number (Illegal Mind only)
3. Select one or more transformation tags (e.g. Heavier, Darker, Punk)
4. Optionally add song-specific details: story notes, gear list, custom hashtags
5. Output generates automatically: titles, short hooks, long and Shorts descriptions, hashtags, tags, thumbnail suggestions
6. Click any output field to copy it
7. Save the entry to the library

### Build and manage a Shorts upload queue

1. Open the Shorts Queue page
2. Click Randomize — generates a ~20-item queue from saved entries
3. Queue avoids duplicate songs in adjacent slots and respects per-entry exclusion flags
4. Mark an entry as uploaded — it's removed and a valid replacement is appended automatically

### Track cover production status

1. Open the Todo page
2. Covers are grouped by production stage: Wishlist, Needs Re-record, Needs Remaster, Needs Video
3. Update a cover's status via dropdown; add notes when needed
4. Bulk-add songs to Wishlist from a text input

### Browse and edit tags

1. Open the Tag Library page
2. Browse all transformation tags with usage counts, categories, and visibility status
3. Edit any tag's title phrases, hashtags, description lines, hook phrases, or thumbnail words
4. Create, duplicate, or sync tags between projects

### Configure project behavior

1. Open the Project Settings page
2. Select a section: General, Shorts Hooks, Titles, Descriptions, Links, Blocks, Thumbnails, Hashtags, or Todo Settings
3. Edit overrides — all changes are stored in localStorage against the base config in `projects.json`

### Back up and restore

1. Open the App Menu
2. Export Backup — downloads a single JSON with all app data
3. Import Backup — restores fully from that JSON (overwrites current localStorage)

---

## Major Features

### Generator

The central workflow. Input (left panel) feeds into engine output (right panel). Output updates automatically when inputs change. A Regenerate button re-randomizes random-pick outputs (hooks, description variants) without clearing form inputs.

Output panels:
- **Titles** — 3 options with source attribution (which tag/template each came from)
- **Shorts Hooks** — 6 hook categories (nostalgia, emotion, musician, discussion, transformation, progress)
- **Descriptions** — Long description + 5 Shorts description variants
- **Hashtags & Tags** — project hashtags + tag-specific hashtags + YouTube tags

### Saved Library

Per-project database of saved song entries. Each entry stores: artist, song, signal number, tags, custom fields, todo status, queue exclusion flag, and any song-level block overrides. Supports search, sort, export/import, and loading back into the generator.

### Tag Library

Full CRUD for transformation tags. Each tag carries title phrases, description lines (technical, log, status), hook phrases (per hook type), hashtags, thumbnail words, visibility flag, and exclusion flags. Changes to a tag immediately affect all generated output that references it. Tags can be synced between projects (copy all overrides from one project to the other).

### Shorts Queue

Upload planning for YouTube Shorts. Maintains a ~20-item queue drawn from saved entries. Randomization enforces duplicate spacing (same song can't appear in adjacent slots). Marking an item as uploaded auto-rotates the queue.

### Todo System

Production pipeline with configurable statuses. Default flow: Wishlist → Needs Re-record → Needs Remaster → Needs Video. Entries can carry notes (e.g. "waiting on vocal comp"). Statuses are editable per project in Project Settings → Todo Settings.

### Description Block System

Descriptions are composed from configurable blocks. Three block types are user-editable from the UI. Block layout is configurable per project. See [Block Types](#block-types) below.

### Backup System

Export all app data to a single JSON file. Import to fully restore. This is the only safety net for data loss — no cloud backup exists. The backup must stay reliable; it's the anchor for all storage refactoring work.

### Project Settings

Nine-tab settings page where users configure project behavior:

| Tab | What you configure |
|-----|-------------------|
| General | Project name |
| Shorts Hooks | Hook categories and preset phrases per category |
| Titles | Prefix/suffix templates, title templates, "but it's" rules |
| Descriptions | Block layout order for Long and Shorts descriptions |
| Links | Channel links (YouTube, Bandcamp, support, linktree) |
| Blocks | Create and edit List, Text, and Hook blocks |
| Thumbnails | Word pools, fallback words, text pattern templates |
| Hashtags | Project-level hashtags and YouTube tags |
| Todo Settings | Custom statuses for the production pipeline |

All settings are stored as overrides against the base `projects.json` config.

---

## The Tag System

Tags are the primary creative differentiator. They describe how a cover differs from the original: Heavier, Darker, Punk, Hebrew, Slower, etc. Each tag carries metadata that directly shapes generated output.

**What a tag controls:**

- **Title phrases** — mixed into generated titles (up to N per project config)
- **Description lines** — fills technical, log, and status block slots in descriptions
- **Hook phrases** — supplies hook text for each Shorts hook category
- **Hashtags** — added to the hashtag output for that video
- **Thumbnail words** — shown as thumbnail text suggestions
- **Visibility** — hidden tags are excluded from the tag selector but still exist in config
- **Exclusion flags** — `excludeFromHashtags`, `excludeFromButIts` for fine-grained control

Tags exist in `projects.json` (base config) and can be overridden per project via localStorage. Custom tags can be created from the Tag Library UI.

The tag system is deeply interconnected. Editing a tag affects titles, descriptions, hooks, and hashtags simultaneously. Changes are reflected in generated output immediately.

---

## Block Types

The description system is built from blocks. Each block has a **scope** (project-wide or song-specific) and a **target** (Long description, Shorts description, or both).

### List Block

A structured list with a title and items (`label + text|link`). Good for gear lists, playlists, support links. `displayMode: 'all'` renders every item; `displayMode: 'random'` picks one per generation. Song-scope blocks get a mini list editor in the generator's Advanced panel.

### Text Block

A single paragraph. Supports `{placeholder}` interpolation (artist, song, tagLine, links). Song-scope blocks get a plain-text override field in the generator. Example: Custom CTA, Mixing CTA.

### Hook Block

An array of strings — the engine picks one randomly per generation. All phrase-template arrays across Long and Shorts descriptions are Hook Blocks (story lines, broadcast headers, status lines, log notes, etc.). Song-scope blocks show a plain-text override field in the generator; when set, it wins over the random pick.

### Generated Block

Engine-driven. Takes parameters, produces output. No user-side editor. Examples: the tag line (auto-derived from selected tags), the support block (assembled from project links config).

### Song-level overrides

Any Text, List, or Hook Block with `scope: 'song'` shows an override field in the generator's Advanced panel. Overrides are stored per-entry in `formData.songBlockOverrides[blockKey]` and are saved with the entry.

---

## Current State of Development

### Done

- Full generator workflow (titles, descriptions, hooks, hashtags, thumbnails)
- Saved library with search, sort, export/import
- Tag library with full editing, visibility, and sync
- Shorts queue with randomization, duplicate spacing, and mark-as-uploaded
- Todo system with configurable statuses and notes
- All nine Project Settings tabs
- Description layout builder (two-column: Available palette + Active Layout)
- All three block types editable from the UI
- Block scope (project/song) and target (long/shorts/both) systems
- Per-song block overrides with mini editors
- Backup export/import
- Storage unified under one localStorage key

### In Progress

- Description layout visual refresh (columns should be equal width)
- Block renaming (inline edit in Project Settings → Blocks)

### Known Issues

- Some blocks in description layouts have no edit target — the nav arrow does nothing (Renovation Block in Maxx Dee, Hook and Header blocks in Shorts)
- Technical Lines block appears duplicated in Maxx Dee with no delete option
- Description layout columns have asymmetric widths (Active is wider than Available)

### Near-Term Planned

- Generic/no-tags title mode (bypass transformation system)
- Queue-hidden indicator in Todo rows
- Todo status badges in Saved Library
- Saved Library Todo filtering
- `customHashtags` field cleanup (last hardcoded per-song field in generator)
- Block Group block type
- Drag-and-drop block reordering (currently up/down buttons only)
- Shorts descriptions with tag-specific phrases

### Long-Term Roadmap

- Content calendar (upload scheduling)
- Project dashboard (completion stats, queue status)
- Metadata expansion (release year, re-record flags)
- Database migration (IndexedDB or SQLite) — only after storage is proven stable
- Desktop app (Electron or Tauri)

---

## Important Business Rules

These rules affect how the app behaves and how you should approach changes.

### Storage

All live app state reads and writes a single localStorage key: `illegalMindGeneratorData`. The old standalone keys (`savedEntries`, `shortsQueueByProject`, `tagOverrides`, etc.) are inert leftovers from before unification — nothing reads them anymore. Don't write new code that targets them.

The exception: `tagVisibilityOverrides` as a *field inside* the unified object must stay. It's a data-shape compatibility requirement, not a live key.

Storage changes are high-risk. Before touching anything storage-related: take a backup, verify the data shape, add safe fallbacks, test export/import, and test that data survives a page refresh.

When migrating a hook off a legacy key, don't assume the unified field is authoritative. It may be a stale one-time snapshot. Verify which source has live data before preferring it.

### Title engine keys

For Illegal Mind, the title config uses the key `longPrefix` (legacy) instead of `prefix`. The engine reads `config.title?.prefix || config.title?.longPrefix`. Do not consolidate these — the legacy key must stay.

### Shorts hooks vs Shorts titles

These are two different systems:

- `generateShortHooks.js` — hook-based Shorts titles, reads `shortsPrefix`/`shortsSuffix` (fallback: `shortHookSuffix`)
- `generateTitles.js` Shorts mode — transformation-based Shorts titles, same keys

Both are editable via Project Settings → Titles. The `shortHookSuffix` key in `projects.json` is a legacy fallback — do not remove it.

### Title object shape

Generated titles are objects: `{ text, sourceHook, sourceTemplate }`. Both fields can be null for plain-text titles. This shape is load-bearing for the source attribution UI — don't flatten titles to strings.

### Block collision detection

`generateBlockKey` must check every `customBlocks` key regardless of type. List and Text blocks share one namespace. Missing a key in the collision check produces silent key conflicts.

### Config is a bootstrap template

`projects.json` is the starting point, not the source of truth. All real per-project configuration lives in localStorage overrides. The resolved config (base + overrides merged) is what the engine and UI actually use. Don't hardcode values the config already controls.

### No automatic migration

Storage schema migration is intentionally paused. Each hook does a one-time fallback read of its old key on first load, then writes to the unified key from that point forward. Don't add a global migration step — follow the per-hook pattern instead.

### Backup reliability

The backup system is the safety net for all storage work. It must export everything and import everything correctly. Test export/import after any storage change.

---

## Known Limitations

- **No cloud sync** — data lives only in localStorage on the machine where it was entered
- **No multi-device support** — desktop sync testing is incomplete; laptop is source of truth
- **No backend** — everything runs in the browser with no server
- **No drag-and-drop** — description block reordering uses up/down buttons only
- **`coverLabel` not editable from UI** — the Shorts Description cover label is only editable by hand-editing `projects.json`
- **`customHashtags` is hardcoded** — the per-song custom hashtag field in the generator is not part of the block system and needs separate handling
- **No error recovery UI** — corrupted localStorage requires a backup import to recover
- **No real-time output** — generation runs synchronously on input change; no streaming or background computation
