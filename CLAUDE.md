# CLAUDE.md

# Illegal Mind Generator

## Purpose

Illegal Mind Generator is a local-first React application used to generate and manage YouTube content packaging for music projects.

The goal is to reduce repetitive content creation work while preserving full creative control.

The application generates:

* YouTube Titles
* Shorts Titles
* Shorts Hooks
* Thumbnail Text
* Long Descriptions
* Shorts Descriptions
* Hashtags
* YouTube Tags

The application also manages:

* Saved cover/song entries
* Transformation tags
* Upload queues
* Cover planning workflows
* Todo tracking
* Project-specific settings
* Full backup/export/import

---

# Primary Users

Currently built for a single creator managing two music channels.

## Illegal Mind Covers

Post-apocalyptic cover project.

Characteristics:

* SIGNAL series
* Wasteland transmissions
* Transformation-based covers
* Alternative Metal
* Nu Metal
* Punk / Hardcore influences

Examples:

* Darker Version
* Slower & Heavier
* Hardcore Version
* Alternative Metal Version

This project contains more lore and worldbuilding.

---

## Maxx Dee Covers

Traditional cover channel.

Characteristics:

* Faithful covers
* Modernized recordings
* Music production showcase
* Performance-focused videos

Less lore-driven than Illegal Mind.

---

# Tech Stack

Current stack:

```txt
React
JavaScript
Vite
localStorage
JSON configuration
```

There is currently:

```txt
No backend
No database
No API server
No AI API integration
```

Everything runs locally.

---

# Development Environment

Assume:

```bash
npm run dev
```

is already running.

Vite live reload is the normal workflow.

Do not suggest restarting the dev server unless there is a real reason.

Typical workflow:

1. Discuss feature
2. Review architecture impact
3. Implement in small grouped steps
4. Test
5. Commit
6. Continue

---

# Core Architecture

The application is config-driven.

Base configuration:

```txt
src/config/projects.json
```

Runtime configuration:

```txt
projects.json
+
localStorage overrides
=
resolved project config
```

The resolved configuration is the source of truth used by:

* Generator
* Tags
* Hooks
* Titles
* Descriptions
* Hashtags
* Project-specific behavior

---

# Source Structure

```txt
src/
├── assets/
├── components/
├── config/
├── data/
├── engine/
├── hooks/
├── pages/
├── utils/
├── App.jsx
├── App.css
└── index.css
```

---

# High-Level Architecture Rules

Pages should focus on orchestration.

Reusable UI belongs in:

```txt
src/components/ui
```

Reusable feature components belong in:

```txt
src/components/<feature>
```

Generation logic belongs in:

```txt
src/engine
```

Storage helpers belong in:

```txt
src/utils
```

Avoid placing generation logic inside React components.

Avoid placing UI logic inside engine files.

---

# Major Systems

## Generator

Main workflow screen.

Inputs:

* Artist
* Song
* Signal Number
* Video Type
* Transformation Tags
* Story Notes
* Queue Settings
* Todo Metadata

Outputs:

* Long Titles
* Shorts Titles
* Shorts Hooks
* Thumbnail Text
* Long Descriptions
* Shorts Descriptions
* Hashtags
* YouTube Tags

This is the heart of the application.

---

## Saved Library

Project-specific song database.

Stores:

* Covers
* Metadata
* Todo Information
* Queue Settings
* Generator Settings

Supports:

* Search
* Sort
* Import
* Export
* Load into Generator
* Delete Entry

---

## Tag Library

Transformation-tag management system.

Supports:

* Custom Tags
* Tag Editing
* Visibility Controls
* Phrase Editing
* Hashtag Editing
* Hook Editing
* Usage Preview

Tag Library is heavily customized and is one of the most important systems in the app.

---

## Shorts Queue

Upload planning system.

Features:

* Project-specific queue
* Randomized queue generation
* Queue persistence
* Duplicate spacing protection
* Queue exclusion support
* Upload replacement logic

Queue target size is approximately 20 items.

---

## Todo System

Cover planning and progress tracking.

Current statuses:

* Wishlist
* Needs Re-record
* Needs Remaster
* Needs Video

Supports:

* Notes
* Status tracking
* Bulk imports
* Queue integration
* Entry-level settings

---

## Backup System

Full application export/import.

Purpose:

* Backups
* Cross-computer migration
* Recovery
* Storage testing

Must remain reliable.

---

# Storage Architecture

## Main Unified Storage Key

```txt
illegalMindGeneratorData
```

Structure:

```js
{
  version,
  savedEntries,
  tagOverrides,
  tagVisibilityOverrides,
  shortsQueues,
  ui,
  generator
}
```

---

## savedEntries

Stores project-specific cover entries.

Pattern:

```js
savedEntries[projectId]
```

Known projects:

```txt
illegalMindCovers
maxxDeeCovers
```

---

## tagOverrides

Stores user modifications to tags.

Pattern:

```js
tagOverrides[projectId][tagId]
```

Overrides are partial.

Missing values should fall back to projects.json.

---

## tagVisibilityOverrides

Legacy visibility storage.

Pattern:

```js
tagVisibilityOverrides[projectId][tagId]
```

Important:

Do not remove.

Treat as compatibility-sensitive.

---

## shortsQueues

Stores project upload queues.

Pattern:

```js
shortsQueues[projectId]
```

---

## ui

Stores:

* Current project
* Current page
* Panel visibility
* Saved Library visibility
* Advanced Options visibility
* Active Project Settings section

---

## generator

Stores current Generator form state.

Used for persistence across refreshes.

---

# Storage Rules

These rules are important.

## Never Delete Legacy Keys

Even if they appear redundant.

Compatibility matters.

---

## No Automatic Migration

Do not introduce automatic cleanup or migration.

Migration work is intentionally paused.

---

## Storage Changes Are High Risk

Before changing storage:

1. Backup
2. Verify shape
3. Add safe fallbacks
4. Test export/import
5. Test refresh persistence

---

# Current Completed Features

## Core App

* [x] React/Vite application
* [x] Project switching
* [x] Page persistence
* [x] Generator page
* [x] Tag Library page
* [x] Shorts Queue page
* [x] Todo page

---

## Generator

* [x] Title generation
* [x] Shorts title generation
* [x] Shorts hook generation
* [x] Thumbnail generation
* [x] Long descriptions
* [x] Shorts descriptions
* [x] Hashtags
* [x] YouTube tags
* [x] Copy actions
* [x] Regeneration

---

## Saved Library

* [x] Search
* [x] Sort
* [x] Delete
* [x] Import
* [x] Export
* [x] Queue-hidden support
* [x] Metadata persistence

---

## Tag Library

* [x] Editable tags
* [x] Custom tags
* [x] Tag visibility
* [x] Phrase editing
* [x] Hashtag editing
* [x] Hook editing
* [x] Usage preview
* [x] Reset support

---

## Shorts Queue

* [x] Queue generation
* [x] Queue persistence
* [x] Queue exclusions
* [x] Upload replacement
* [x] Duplicate spacing rules

---

## Todo System

* [x] Status tracking
* [x] Notes
* [x] Bulk Wishlist import
* [x] Status grouping
* [x] Queue integration
* [x] Entry integration

---

## Backup

* [x] Full export
* [x] Full import
* [x] Unified storage support

---

## Project Settings

* [x] General section (project name override)
* [x] Short Hooks section — cards, edit/add/remove templates, reset per hook, 3-col layout
* [x] Navigation from generator base hooks → source template in Short Hooks editor
* [x] Titles section — edit standard and But It's template groups
* [x] Titles generation settings — prefix/suffix per long/shorts with enable toggles
* [x] Titles generation settings — connector, list separator, max phrases slider
* [x] Active section persists across navigation and refresh
* [ ] Descriptions section
* [ ] Option to use shorts hooks for long video titles
* [ ] Navigation link from generated long title → source hook

---

# Current Focus

Highest priority work:

## Project Settings — Titles (remaining)

Goals:

* Option to pull from shorts hook templates when generating long video titles
* Navigation from generated long title to the source hook template
* Generic / no-tags mode (slider or toggle to bypass transformation tags)

---

Highest priority work:

## Saved Library + Todo Integration

Goals:

* Todo visibility improvements
* Better Saved Library filtering
* Better status visibility

---

## Queue Visibility Improvements

Goals:

* Queue-hidden indicators
* Consistent visibility state across pages

---

## Saved Library + Todo Integration

Goals:

* Todo visibility improvements
* Better Saved Library filtering
* Better status visibility

---

## Queue Visibility Improvements

Goals:

* Queue-hidden indicators
* Consistent visibility state across pages

---

# Next Likely Tasks

1. Long title option to use shorts hooks (with navigation link back to source)
2. Generic / no-tags title mode
3. Project Settings — Descriptions section
4. Queue-hidden indicator in Todo rows
5. Todo status badges in Saved Library
6. Saved Library Todo filtering

---

# Post-Upload Session Todos

Discovered during real upload workflow. Work on these after Project Settings is complete.

## Shorts Descriptions — Tag Awareness

Current shorts descriptions are generic and not affected by transformation tags.

Goals:

* Pull tag-specific phrases into shorts description blocks
* More variation across outputs based on selected tags
* Mirror the same tag-driven approach used in titles and hooks

---

## Generator Output — Source Navigation

Like titles, description blocks should be clickable and navigate back to the source that generated them.

Goals:

* Click a description block segment → jump to the source template or tag that produced it
* Consistent with existing title → hook navigation pattern

---

## Generator — Selective Regeneration

Switching tabs or making any input change currently regenerates all output.

Some input changes should trigger regeneration. Others should not.

Should regenerate:

* Changing artist or song
* Adding or removing transformation tags
* Changing signal number or video type

Should NOT regenerate:

* Adding or editing story notes
* Toggling Hide from Queue
* Switching between pages/tabs

This needs careful design before implementation.

---

# Long-Term Roadmap

## Content Calendar

Potential features:

* Upload planning
* Release scheduling
* Shorts scheduling

---

## Project Dashboard

Potential metrics:

* Covers completed
* Wishlist size
* Queue status
* Progress tracking

---

## Metadata Expansion

Potential fields:

* Original Release Year
* Cover Release Year
* Re-recorded Flag
* Remastered Flag
* Recording Notes

---

## Queue Enhancements

Potential features:

* Queue history
* Upload frequency rules
* Upload date tracking

---

## Hook System Expansion

Potential features:

* Metadata-aware hooks
* Year-based hooks
* Progress-based hooks
* Artist-specific templates

---

## Database Migration

Not active.

Potential future targets:

```txt
IndexedDB
SQLite
Local file database
```

Only begin after storage architecture is considered stable.

---

## Desktop Application

Potential future targets:

```txt
Electron
Tauri
```

Benefits:

* Local database
* Better backups
* Native filesystem access

---

# Important Decisions Already Made

## Local-First

The application intentionally works without a backend.

---

## Config-Driven

Most behavior should come from configuration rather than hardcoded logic.

---

## Reuse Before Creating

Prefer reusing existing components before creating new abstractions.

---

## Simple Architecture

The project is maintained by a single developer.

Avoid enterprise patterns.

Avoid unnecessary abstraction.

Choose the simplest solution that remains maintainable.

---

## Page Responsibilities

Pages should orchestrate.

Feature logic should live in feature components.

Generation logic should live in engine files.

Storage logic should live in utils/hooks.

---

# Known Gotchas

## Storage Is Sensitive

Many systems depend on existing localStorage structures.

Changing storage casually can break:

* Saved entries
* Queues
* Todo data
* Backup import/export

Be cautious.

---

## Legacy Keys Still Exist

Even if unified storage is present.

Do not remove them.

---

## Laptop Is Source Of Truth

Historically the laptop contains the authoritative data set.

Desktop synchronization testing is still considered incomplete.

---

## Backup System Must Stay Reliable

Export/import is currently the safety net for storage work.

Always test it after significant storage changes.

---

## Tag System Is Deeply Connected

Tags affect:

* Titles
* Descriptions
* Hooks
* Hashtags
* Usage tracking

Tag changes often have wider effects than expected.

---

## Avoid Premature Database Work

Database migration is intentionally postponed.

Current priority is feature completeness and storage stability.

---

## Title Engine Key Names

`projects.json` for Illegal Mind uses `longPrefix` (legacy) instead of `prefix`.

The engine reads `config.title?.prefix || config.title?.longPrefix` to support both.

Do not consolidate these keys — legacy key must remain for storage compatibility.

---

## Short Hooks vs Shorts Titles

Two separate systems generate shorts output:

* `generateShortHooks.js` — generates hook-based shorts titles, reads `shortsPrefix` / `shortsSuffix` (with fallback to `shortHookSuffix`)
* `generateTitles.js` in Shorts mode — generates transformation-based shorts titles, also reads `shortsPrefix` / `shortsSuffix`

Both are editable via Project Settings → Titles → Generation card.

`shortHookSuffix` in `projects.json` is the legacy fallback — do not remove it.

---

# Development Preferences

When implementing features:

* Work in grouped steps
* Keep changes focused
* Prefer code examples over theory
* Explain exact file placement
* Ask for files instead of guessing structure
* Provide Conventional Commit messages when asked
* Continue incrementally

When uncertain:

Choose the simpler solution.
