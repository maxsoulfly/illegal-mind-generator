# Roadmap

---

# Current Focus

Active work. These are in progress or blocking the next session.

- **Description layout column parity** — Available and Active Layout columns in Project Settings → Descriptions should be equal width. Currently 220px vs 1fr.
- **Block renaming** — inline label-edit field in Project Settings → Blocks (Lists, Text Blocks, Hook Blocks). Applies to JSON-default and user-created blocks.
- **Fix blocks with no nav target** — three description layout cards have non-interactive `→` arrows:
  - `renovationBlock` (Maxx Dee Long Description) — not in `hookBlocks` config, needs an editor or hardcoded nav target
  - `hook` and `header` (Shorts Description) — route to Shorts Hooks, not Blocks; needs a special nav case
- **Remove duplicated Technical Lines block** — appears twice in Maxx Dee's Hook Blocks tab with no delete option. Fix in `projectSettingsOverrides`.

---

# Next

Logical next steps after current focus is done.

- **Generic / no-tags title mode** — bypass transformation tags, generate plain titles
- **Queue-hidden indicator in Todo rows** — show `[hidden]` badge on entries with `excludeFromRandomizer: true`
- **Todo status badges in Saved Library** — show `todo.status` inline on each saved library entry
- **Saved Library Todo filtering** — filter library by todo status
- **`coverLabel` settings UI** — Shorts Description cover label is currently only editable by hand-editing `projects.json`
- **`customHashtags` cleanup** — last remaining hardcoded per-song field in the generator; not part of the block system, needs separate design
- **Block Group block type** — fourth block type (groups of blocks), UI not started
- **Shorts descriptions tag awareness** — pull tag-specific phrases into Shorts description blocks
- **Generator selective regeneration** — input changes (story notes, hide-from-queue, tab switch) should not trigger regeneration. Only artist, song, tags, signal number, and video type should.

---

# Future

Planned features. Not immediate priorities.

- **Content Calendar** — upload planning and release scheduling
- **Project Dashboard** — covers completed, wishlist size, queue status at a glance
- **Metadata Expansion** — release year, re-record/remaster flags, recording notes per entry
- **Queue Enhancements** — upload history, frequency rules, date tracking
- **Hook System Expansion** — metadata-aware hooks, year-based hooks, artist-specific hooks
- **Database Migration** — IndexedDB or SQLite, only after storage is proven stable over many sessions
- **Desktop App** — Electron or Tauri, for better backups and native filesystem access

---

# Technical Debt

Cleanup, refactors, and maintenance. Not urgent but should not be forgotten.

- **`appBackup.js` legacy cleanup** — still captures/restores old standalone localStorage keys via a `legacy` field; no longer needed since the unified key has everything
- **Remove `storageMigration.js`** — dead production code; only exposed to `window.*` in DEV mode via `App.jsx`. Both the file and the `useEffect` in `App.jsx` can be deleted.
- **CSS refactor** — consolidate `index.css`, clean up class naming, reduce duplication
- **`useTagVisibilityOverrides` hook** — writes to a field that nothing reads back through its hook interface; likely dead code. The field inside the unified storage object must stay for data-shape compatibility, but the hook may be removable.
- **Old standalone localStorage keys** — `savedEntries`, `shortsQueueByProject`, `tagOverrides`, etc. are inert. Safe to purge from localStorage once confident nothing regressed.

---

# Ideas Parking Lot

Interesting but not part of the current roadmap. Not mentioned in CLAUDE.md.

- Multi-user support
- Cloud sync
- AI-assisted generation
