# Conventions

**Start here.** This is the authoritative development guide for Illegal Mind Generator. Read this before touching any code. Every rule here is derived from the existing codebase, not invented for this document.

Also read before starting work:
- `docs/current-context.md` — what is being worked on right now
- `docs/architecture.md` — how the systems connect
- `docs/data-model.md` — all data structures

---

## Project Philosophy

### Core principles

**Local-first.** No backend, no cloud sync, no database. Everything lives in localStorage. All decisions about data structures and persistence must work in that constraint.

**Config-driven.** Behavior comes from configuration, not hardcoded logic. The goal is that a user can build a new project from scratch — different language, different goals, original songs — without editing any JavaScript. When you find yourself hardcoding something that logically belongs in config, put it in config.

**Reuse before creating.** Before building any component, hook, or utility, check whether something already covers the need. The UIKit page (`/uikit` nav route) is the first stop. The `src/components/ui/` folder is the second. Creating a new component when an existing one fits is a mistake, not a choice.

**Simple architecture.** Single developer, no enterprise patterns, no premature abstraction. Three similar lines is better than a premature helper function. Don't design for hypothetical future requirements.

**Step-by-step development.** Present each step, implement it, stop, and wait for review before continuing. Never chain multiple steps autonomously. Never batch work into an unsupervised pass unless explicitly told to.

### Design goals

- Every YouTube channel metadata workflow should be automatable from one UI
- All configuration should be editable from the UI without touching JSON files
- The backup/export system is the safety net — it must always work
- Generated output should be deterministic given the same inputs and seed

### Maintainability goals

- The engine stays pure (no React, no storage). This makes logic verifiable by inspection.
- State ownership is explicit — every piece of state belongs to one named hook.
- Nothing reads from `projects.json` at runtime except `App.jsx` (via the config resolution layer).
- Styles are global and class-based — no CSS-in-JS, no Tailwind, no scoped modules.

---

## Architecture Conventions

### The layer rules (non-negotiable)

| Layer | Purpose | Must not |
|-------|---------|---------|
| `pages/` | Orchestrate hooks, assemble props, render feature components | Contain logic that belongs in a hook or engine |
| `components/` | UI and feature components | Read/write localStorage directly (with two known exceptions) |
| `engine/` | Pure generation functions | Import from React, hooks, or components |
| `hooks/` | Own state and storage access | Contain rendering logic |
| `utils/` | Storage API, config builder, block utilities | Contain UI or React code |
| `config/` | Static project configuration | Be the source of truth at runtime (only the resolved config is authoritative) |

### Config resolution is the seam

`buildResolvedProjectConfig` is the single point where `projects.json` + `tagOverrides` + `projectSettingsOverrides` merge into `resolvedProjectConfig`. Everything downstream — engine, settings UI, tag library — consumes the resolved config. Nothing reads `projects.json` directly at runtime.

When adding a new configurable value:
1. Add it to `projects.json` with a sensible default
2. Merge it in `buildResolvedProjectConfig` (handle missing/undefined safely)
3. Read it from `resolvedProjectConfig` in the engine or UI

Never read `projects.json` from a component, hook, or engine file.

### State flows down via props

`App.jsx` is the sole state coordinator. All custom hooks are called there. State is passed to pages as props; pages pass relevant slices to feature components. There is no Context, no global store, no event bus.

Cross-page navigation targets (e.g. "jump to this hook type") are the one exception — they live in `useAppShellState` and are passed as named props to the destination page.

### Adding a new feature

1. **Config first** — if the feature is configurable, add it to `projects.json` and the override system before building UI.
2. **Engine second** — add pure functions to the appropriate `engine/` subfolder. Test by calling them with plain objects.
3. **Hook third** — if new state or persistence is needed, add it to the appropriate hook (or create a new one following the existing pattern).
4. **Component last** — build the UI to surface the engine output or hook state.

Never start with a component when the behavior isn't designed yet.

### Extending existing systems

- **New block type:** add to `customBlocks.js` type guards, add an editor card under `projectSettings/blocks/`, wire into `BlockEditorCard`.
- **New hook type:** add to `shortHookTypes` in `projects.json`, `ProjectSettingsShortHooks.jsx` will pick it up automatically.
- **New description block:** add the block key to the project's `description.templates.long.layout` in `projects.json` and add a render case to `generateDescriptions.js`.
- **New project settings tab:** add a section constant in `projectSettingsSections.js`, add a component in `projectSettings/`, wire into `ProjectSettingsContent.jsx`.
- **New per-song generator field:** use `songBlockOverrides[blockKey]`, not a new top-level `formData` field. The block override system already handles persistence, generator UI, and backup.

---

## Component Conventions

### Check UIKit first

Before building any UI element, open the UIKit page (`/uikit` in the running app). If a component there covers the pattern, use it.

### UI primitives (`src/components/ui/`)

These are the only generic building blocks. They know nothing about the domain. Every component in the app that needs a button, input, card, or tab should start here.

**Reuse table:**

| Need | Use |
|------|-----|
| Any small action button (reset, remove, move, add, apply) | `IconButton` |
| Up/down reorder | `MoveControls` |
| Input or textarea with `{placeholder}` autocomplete | `PlaceholderField` |
| Editable phrase with delete button | `PhraseRow` |
| List of phrases with add/bulk/search | `HookTemplateEditor` |
| Collapsible card with phrase list and reset button | `TemplateGroupCard` |
| Read-only layout card with optional nav arrow | `BlockInfoCard` |
| In-page underline tab navigation | `SubTabNav` |
| Dropdown inside a clickable card header | `FormSelect` |
| Checkbox + label + optional input | `ToggleInputRow` or `ToggleField` |
| Label + range slider | `LabelSliderRow` |
| Label + text input | `LabelInputRow` |
| Add / Bulk button pair | `AddBulkRow` |
| Multi-line bulk paste | `BulkTextarea` |
| Clickable text that navigates to a source | `NavLinkButton` |

### Page structure

A page file (`pages/`) should only:
- Call hooks (or receive props from `App.jsx`)
- Assemble layout
- Pass props to feature components

If you're writing domain logic in a page file, move it to a hook or engine function.

### Panel pattern

Content sections use `.panel` with a `.panel-title` heading inside. Panels have a dark amber-bordered background and box shadow. Use `.panel` for grouping related controls. Do not invent new container styles.

### Form pattern

Generator inputs use `.form-group` → `.form-label` + `.form-input` / `.form-select` / `.form-textarea`. Settings rows use `LabelInputRow`, `ToggleInputRow`, or `ToggleField` depending on the control type.

All phrase/template edits save on `onBlur`, not on every keystroke. This is intentional for future database compatibility. Don't add `onChange` persistence to phrase editors.

### Card pattern

Collapsible content cards use the `article.tag-card` shell with a `.tag-card-header` and toggle state. Use `TemplateGroupCard` instead of hand-rolling this pattern. Use `BlockEditorCard` for block editors. Only build a raw `tag-card` article if neither wrapper fits.

### UI composition

- `ShortHookCard` is a thin adapter over `TemplateGroupCard` for the hook data shape. Use `ShortHookCard` for hook type cards; use `TemplateGroupCard` for anything else with the same pattern.
- `BlockEditorCard` wraps all three block type editors (List, Text, Hook Block). Always use it as the shell when building a block editor.
- `HookTemplateEditor` is the only way to render a phrase list with add/bulk/search. Don't build an equivalent manually.
- `PlaceholderField` is the only way to render an input with `{placeholder}` autocomplete. If a field needs autocomplete, use `PlaceholderField` — pass the relevant placeholder list from `hookPlaceholders.js` or define it inline.

---

## Styling Conventions

### Global stylesheet

All styles live in `src/index.css`. There are no CSS modules, no styled-components, no Tailwind. New styles go at the bottom of `index.css`, logically grouped with a `/* ===== Section name ===== */` comment.

### CSS custom properties

Never use raw hex colors or hard-coded pixel values in new styles. Use the tokens from the `:root` block:

| Category | Tokens |
|----------|--------|
| Text | `--color-text-main`, `--color-text-muted`, `--color-text-accent`, `--color-text-alert` |
| Backgrounds | `--color-bg-page`, `--color-bg-input`, `--color-bg-panel`, `--color-bg-button-secondary` |
| Borders | `--color-border-main`, `--color-border-soft`, `--color-border-hover` |
| Spacing | `--space-1` (6px) through `--space-9` (32px) |
| Radii | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill` |
| Typography | `--font-mono`, `--font-size-label`, `--font-size-toggle` |
| Transitions | `--transition-fast` |

### Layout patterns

- **Generator two-column:** `.layout-grid` (`2fr 3fr`). Do not apply this class elsewhere.
- **Description layout builder:** `.desc-layout` (`1fr 1fr`). Already defined.
- **Output list rows:** `.saved-entry-row.terminal-block`. This pattern is used for saved library items, queue items, and todo items. Reuse it for any new list row.
- **Button rows:** `.button-row` (flex with gap and margin-top). Wrap multiple secondary buttons in this.

### Responsive design

The only documented breakpoint is a mobile collapse for the description layout builder (two columns → sub-tabs). No other responsive rules are formally defined. Do not add responsive rules for desktop-only screens.

### Visual consistency

- Amber (`--color-text-accent`) is the highlight/active color. Active nav buttons, active tag chips, and copied copy-buttons all use amber.
- Dark inset blocks (`.terminal-block`) are for output and read-only content.
- `.panel` is for editable content groups.
- Do not mix these — don't put an input inside a `.terminal-block`.
- Range sliders require a `--val` CSS custom property set via inline style to get the amber fill. See `LabelSliderRow` for the pattern.

---

## Data Conventions

### Single storage key

All live app state reads and writes `illegalMindGeneratorData`. Never write to any other localStorage key. The old standalone keys (`savedEntries`, `shortsQueueByProject`, `tagOverrides`, etc.) are inert — don't read or write them.

### Storage API

Always use `storage.js`. Never call `localStorage.getItem`/`setItem` directly from a hook or component, except in `appBackup.js` (which has a documented reason). Use `updateAppStorage(updater)` for all writes — it reads, merges, and writes atomically.

Two known exceptions where components read storage directly: `SavedLibrary.jsx` (`ui.hideQueueHidden`) and `GeneratorPage.jsx` (`ui.showSavedLibrary`). These are acknowledged debt, not patterns to follow.

### Data ownership

Each piece of state belongs to exactly one hook. If you need to share data between features, pass it as a prop from `App.jsx`, where both hooks are called.

| Data | Owner hook |
|------|------------|
| Form inputs, active page, project ID, panel visibility | `useAppShellState` |
| Saved song entries | `useSavedEntries` |
| Transformation tag overrides | `useTagOverrides` |
| Project settings overrides | `useProjectOverrides` |
| Shorts upload queue | `useShortsQueue` |
| Generated output | `useGeneratedOutput` (derived, not persisted) |

### Persisting new state

When adding a new persistent value:
1. Add it to the storage shape in `storage.js` `defaultStorage` with a safe default
2. Read it in the appropriate hook via `loadAppStorage()` on mount
3. Write it via `updateAppStorage()`
4. Test that the value survives a page refresh and a backup/import cycle

Do not add new top-level keys to the storage object without also updating `appBackup.js` to include them in the export.

### Config vs. override

`projects.json` is the bootstrap template. Users configure the app through `projectSettingsOverrides` (stored in localStorage under `projectOverrides[projectId]`). `buildResolvedProjectConfig` deep-merges them. Never hardcode a value in a component that a user might reasonably want to change.

### Per-song overrides

Song-specific data lives in `formData.songBlockOverrides[blockKey]`, not in new named `formData` fields. The block override system persists through save/load, backup/import, and the generator UI automatically. Adding a new hardcoded per-song `formData` field is the wrong pattern — use `songBlockOverrides` instead.

### Legacy field migration

When migrating a hook off an old standalone key:
1. On first mount, check if the unified field is empty and the legacy key has data
2. If so, seed the unified field from the legacy key
3. Write the unified field and never read the legacy key again

Do not add a global migration step. Do not assume the unified field is authoritative if it was seeded from a one-time snapshot.

### Backup safety

`appBackup.js` exports the complete unified storage object. After any change to the storage shape, verify that backup export contains all new data and that import correctly restores it. This is the only data recovery path.

---

## File Organization

### Folder responsibilities

| Folder | What goes here |
|--------|---------------|
| `src/pages/` | One file per navigable page. Orchestration only. |
| `src/components/ui/` | Reusable domain-agnostic UI primitives. No business logic. |
| `src/components/input/` | Generator input form sub-components |
| `src/components/output/` | Generator output panel sub-components |
| `src/components/tags/` | Tag Library components |
| `src/components/todo/` | Todo page components |
| `src/components/savedLibrary/` | Saved Library components |
| `src/components/shortsQueue/` | Shorts Queue components |
| `src/components/projectSettings/` | All Project Settings tab components |
| `src/components/projectSettings/blocks/` | Block editor components (BlockEditorCard, editors, add forms) |
| `src/components/projectSettings/descriptions/` | Description layout builder components |
| `src/engine/` | Pure generation functions, organized by output type |
| `src/hooks/` | Custom React hooks |
| `src/utils/` | Storage API, config builders, shared utilities |
| `src/config/` | Static JSON config and section constants |
| `src/constants/` | Shared constant values (default form data) |
| `docs/` | Project documentation |

### Component placement rules

- A component used in only one feature sub-system goes in that system's folder (`tags/`, `todo/`, etc.).
- A component used in two or more feature sub-systems goes in `components/ui/`.
- A component that is a direct child of a page goes in the page's related sub-folder.
- No component goes directly in `src/components/` — use a sub-folder.

### Utility placement

- **Storage access:** `utils/storage.js` only.
- **Config merging:** `utils/buildResolvedProjectConfig.js` only.
- **Block type guards and key generators:** `utils/customBlocks.js` only.
- **Tag registry operations:** `utils/tagRegistry.js`.
- **Placeholder token list for hooks:** `utils/hookPlaceholders.js`.
- A utility that is only used by one engine function goes in that engine subfolder, not in `utils/`.

### Documentation placement

All docs go in `docs/`. No subdirectories. Document type determines file name:

| File | Purpose |
|------|---------|
| `conventions.md` | This file — the primary development guide |
| `current-context.md` | Live state: what is done, in progress, and next |
| `architecture.md` | System structure and data flow |
| `data-model.md` | Storage schema and data shapes |
| `graph-report.md` | Dependency graph and bottleneck analysis |
| `project-overview.md` | Product-level onboarding for new developers |
| `roadmap.md` | Prioritized upcoming work |

---

## Naming Conventions

### Components

PascalCase. Names describe what the component is, not where it lives.

```
TemplateGroupCard     ✓   (describes the thing)
HookTemplateEditor    ✓   (describes the thing)
ProjectSettingsHookBlocks  ✓  (page + section — acceptable for page-level components)
BlockCard             ✗   (too generic — "block" of what?)
```

Tag component names are prefixed with `Tag`: `TagCard`, `TagHeader`, `TagEditor`, `TagDetails`, `TagStatusChip`.

Block editor component names describe the type: `BlockEditorCard`, `TextBlockEditor`, `StructuredListEditor`.

### Hooks

`use` prefix. Name describes what state or behavior is owned:

```
useAppShellState     ✓   (owns shell-level UI state)
useSavedEntries      ✓   (owns the saved entry list)
useTagOverrides      ✓   (owns tag override data)
useProjectOverrides  ✓   (owns project settings overrides)
useGeneratedOutput   ✓   (owns/derives generated output)
```

Hooks that derive computed values without owning state use a `use` + noun pattern: `useTagLibraryData`, `useInputFormLogic`.

### Utilities

camelCase. Name is a verb phrase or noun that describes the function's action or product:

```
buildResolvedProjectConfig   ✓  (verb phrase)
generateBlockKey             ✓  (verb phrase)
isListBlock                  ✓  (predicate: is + description)
getBlockLabel                ✓  (verb phrase)
updateLongKey                ✓  (verb phrase)
```

### Constants

SCREAMING_SNAKE_CASE for exported constants:

```
HOOK_PLACEHOLDERS     ✓
QUEUE_LENGTH          ✓
DEFAULT_PROJECT_KEY   ✓
SCOPE_OPTIONS         ✓
TARGET_OPTIONS        ✓
```

### Storage keys

camelCase paths inside the `illegalMindGeneratorData` object. No abbreviations.

```
savedEntries         ✓
tagOverrides         ✓
shortsQueues         ✓
projectOverrides     ✓
```

Top-level key for the entire object: `illegalMindGeneratorData` (unchanged — do not rename).

### Configuration object keys

Follow existing conventions in `projects.json`. When adding new keys, match the style of adjacent keys in the same section:

- `longPrefix` remains `longPrefix` for Illegal Mind (legacy — do not rename to `prefix` to match Maxx Dee)
- Hook type keys in `shortHookTypes` use camelCase: `nostalgia`, `emotion`, `musician`
- Block keys use camelCase: `storyBlock`, `customCtaBlock`, `gearBlock`
- Layout keys may differ from block keys when the layout was established first (use `descriptionLayoutKey` in the hookBlocks config to handle this)

---

## Documentation Conventions

### When to update `current-context.md`

Update at the end of every development session. It represents the project's current state, not its history:
- Move completed items out of "In Progress" and into nothing (they're done)
- Update "Current Focus" to reflect what's actually being worked on
- Update "Next Recommended Tasks" based on what just finished
- Add newly discovered issues to "Known Issues"
- Do not leave stale items — remove or update them

### When to update `roadmap.md`

Update when the project direction changes:
- When a "Current Focus" item is completed, remove it
- When a new goal is identified and agreed upon, add it to the appropriate section
- When a "Next" item is promoted to active work, move it to "Current Focus"
- Do not turn the roadmap into a changelog — remove completed items, don't mark them done

### When to update `architecture.md`

Update when structural changes occur:
- A new page is added
- A new hook is introduced with storage ownership
- The config resolution pipeline changes
- A new system is wired into the cross-system interaction model

Do not update it for routine feature additions that don't change the architecture.

### When to update `CLAUDE.md`

Update `CLAUDE.md` when:
- The current focus changes (replace the section content — don't append)
- A new architectural rule or gotcha is discovered
- A new UI primitive is added that others should reuse
- The block type system gains a new capability

`CLAUDE.md` is not a changelog. Keep it current, not cumulative.

### Documentation maintenance expectations

- Never endlessly append — remove stale information
- `docs/current-context.md` is the only file expected to change every session
- `docs/conventions.md` (this file) changes only when a new convention is established or an old one is proven wrong
- All documentation files represent current state, not historical state

---

## AI Assistant Rules

These rules apply to Claude Code, Cursor, Codex, Gemini CLI, and any other AI coding tool working on this project.

### Before writing any code

1. **Read `docs/conventions.md` (this file) first.**
2. **Read `docs/current-context.md`** to know what is in progress and what not to break.
3. **Check the UIKit page** (`/uikit`) or `src/components/ui/` for any component that might already exist before building a new one.
4. **Check `docs/architecture.md`** before making any change that touches multiple systems.

### Search before creating

- Before adding a new utility function, grep `src/utils/` for similar functions.
- Before adding a new component, grep `src/components/ui/` and the relevant feature folder.
- Before adding a new hook, check `src/hooks/` — the existing hooks may already own the state you need.
- `customBlocks.js`, `storage.js`, `hookPlaceholders.js`, and `buildResolvedProjectConfig.js` are highly shared. Read them before adding anything that touches blocks, storage, placeholders, or config.

### Reuse before building

- If `IconButton` fits, use it. Don't write a raw `<button>` with icon styling.
- If `TemplateGroupCard` fits, use it. Don't build a new collapsible card.
- If `PlaceholderField` fits, use it. Don't build a custom autocomplete input.
- If `BlockEditorCard` fits, use it. Don't build a new block editor shell.
- If `HookTemplateEditor` fits, use it. Don't build a new phrase list.

### Extend before duplicating

- Extend `BlockEditorCard` for a new block type editor rather than copying its markup.
- Extend `buildResolvedProjectConfig` for a new override type rather than adding a separate merge step elsewhere.
- Extend the existing hook for a data domain rather than adding a parallel hook for the same storage path.

### Keep changes minimal and focused

- Fix the bug. Don't also refactor the surrounding code.
- Add the feature. Don't also clean up unrelated styles.
- One change at a time. Present it, stop, wait for review.

### Respect existing architecture

- Don't add React imports to `src/engine/` files.
- Don't read `localStorage` directly from components or hooks — use `storage.js`.
- Don't read `projects.json` from runtime code — read from `resolvedProjectConfig`.
- Don't add new top-level `formData` fields for per-song data — use `songBlockOverrides`.
- Don't add global migration steps — follow the per-hook one-time fallback pattern.

### Storage changes require a safety check

Before touching storage:
1. Export a backup from the running app.
2. Make the change.
3. Test that existing data is still accessible.
4. Test that backup export → import restores everything.
5. Test that a page refresh preserves the data.

### After making changes

- Update `docs/current-context.md` to reflect what changed.
- If the change affects architecture, update `docs/architecture.md`.
- If a convention was added or changed, update this file.

---

## Anti-Patterns

These are patterns that have been explicitly rejected or that conflict with the project's architecture. Do not introduce them.

### Component anti-patterns

**Duplicate UI components.** Don't build a new reset button, a new collapsible card, a new phrase list, or a new tab nav. These all exist in `src/components/ui/`. Using a raw `<button>` where `IconButton` fits is a duplicate. Building a new card shell where `TemplateGroupCard` fits is a duplicate.

**Business logic in pages.** Page files orchestrate — they call hooks and render components. Logic that transforms data, filters lists, or makes decisions belongs in a hook or engine function.

**Inline style overrides for layout.** Using `style={{ margin: '10px' }}` to fix layout instead of a CSS class is not the pattern. Add a modifier class or a new CSS rule.

**Reading `resolvedProjectConfig` from inside an engine function.** Engine functions receive their inputs as arguments. They don't import config — the caller passes it.

### State anti-patterns

**Parallel state structures.** Don't create a second hook that owns data overlapping with an existing hook. `useSavedEntries` owns all entry data. `useProjectOverrides` owns all project config overrides. If you need to read something they own, get it from `App.jsx` via props.

**Reading localStorage directly.** Only `storage.js` and `appBackup.js` touch `localStorage`. A component or hook that calls `localStorage.getItem` directly is a bug, not a pattern. The two existing exceptions (`SavedLibrary.jsx`, `GeneratorPage.jsx`) are acknowledged tech debt.

**New standalone localStorage keys.** All app state goes under `illegalMindGeneratorData`. A new top-level localStorage key is never the answer.

**Hardcoded per-song `formData` fields.** `customHashtags` is the last remaining example of this pattern — acknowledged as tech debt. Don't add more. Use `songBlockOverrides[blockKey]`.

### Config anti-patterns

**Reading `projects.json` at runtime outside of `App.jsx`.** The config file is imported once in `App.jsx` and immediately passed to `buildResolvedProjectConfig`. Nothing else should import it.

**Hardcoding values that belong in config.** If a user might reasonably want to change a phrase, a label, a count, or an order, it belongs in `projects.json` (and therefore in the override system). Hardcoding it in component code means the user can never change it without editing source.

**Consolidating legacy config keys.** Illegal Mind uses `longPrefix`; Maxx Dee uses `prefix`. These are different keys for a historical reason. The engine reads `config.title?.prefix || config.title?.longPrefix`. Do not rename `longPrefix` to `prefix` to make them match — it will break existing stored data.

### Architecture anti-patterns

**Side effects in the engine.** Engine functions must remain pure. If an engine function reads from storage, calls a React hook, or writes to any external state, it is broken. Engine functions take objects and return objects.

**Skipping the config resolution layer.** Any code that needs project configuration should receive `resolvedProjectConfig` as an argument or prop, not read from `projects.json` or from overrides separately and try to merge them manually.

**Global migration steps.** The project intentionally avoids global data migrations. Each hook handles its own one-time legacy fallback on first mount. A `useEffect` in `App.jsx` that runs a migration across all data at startup is not the pattern.

**Premature abstraction.** Three similar functions do not automatically need to be collapsed into a generic helper. Don't create a utility wrapper for something used in two places if the "abstraction" makes either usage harder to understand.

**Touching the backup system without testing it.** `appBackup.js` is the safety net. Any change that affects storage shape, adds new keys, or modifies what gets exported must be tested with a full backup → import → verify cycle before committing.
