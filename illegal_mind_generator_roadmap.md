# Illegal Mind Generator – Project Roadmap

## 🧱 Current Status

Stable **V1.3 – Config-driven Generator + Saved Library**

The app is now:

* Multi-project capable
* Fully config-driven (titles, thumbnails, tags)
* Using derived state (React best practice)
* Equipped with a reusable saved songs library
* Export/import ready (JSON)

---

## ✅ Completed Features

### Core Generator

* [x] Form-driven generator (Artist, Song, Signal, Tags, etc.)
* [x] Titles generation (config-driven)
* [x] Thumbnails generation (config-driven + formatting layer)
* [x] Descriptions generation
* [x] Hashtags generation
* [x] Hybrid prompt generation

### Architecture

* [x] Multi-project support via `projects.json`
* [x] Config-driven templates (titles, thumbnails, tags)
* [x] Derived state (no redundant useState for outputs)
* [x] `useMemo` optimization for generators
* [x] Clean component separation:

  * `App` (orchestration)
  * `InputForm`
  * `GeneratedOutput`

### Tag System

* [x] Clickable transformation tags
* [x] Tag-based title/thumbnail logic
* [x] Config-driven tag mapping

### Video Type System

* [x] Long vs Shorts title behavior
* [x] Separate `shortTitleTemplates`
* [x] Template rotation system

### Thumbnails System

* [x] Phrase generation (from config)
* [x] Formatting layer (artist/song + phrase)
* [x] Uppercase formatting
* [x] Artist abbreviation logic
* [x] Custom artist short override

### Saved Songs Library

* [x] Save (artist + song + signal)
* [x] Load into form
* [x] Delete entries
* [x] Search/filter
* [x] Scrollable list
* [x] Sticky header
* [x] Empty state handling

### Persistence

* [x] `formData` saved in localStorage
* [x] `savedEntries` saved in localStorage

### Import / Export

* [x] Export library to JSON
* [x] Import JSON library
* [x] Data normalization on import

### Refactor

* [x] Extracted logic into `useSavedEntries` hook

---

## 🚧 Current Phase

**Polish + Power Features**

---

## 🔥 Next Features (Priority Order)

### 1. Regenerate System

* [ ] Add "Regenerate" button
* [ ] Introduce randomness in:

  * title template selection
  * transformation wording
* [ ] Keep deterministic mode optional

---

### 2. Variation Count Control (Finish Integration)

* [x] Input field added
* [ ] Apply `variationCount` to:

  * titles
  * thumbnails
  * descriptions
* [ ] Ensure safe limits (e.g. max 20)

---

### 3. Output Selection System

* [ ] Allow selecting:

  * preferred title
  * preferred thumbnail text
  * preferred description
* [ ] Visual selection UI (radio / highlight)

---

### 4. Export Final Output Block

* [ ] Generate final YouTube-ready block:

  * title
  * description
  * hashtags
* [ ] Copy all button
* [ ] Optional formatting presets

---

### 5. Library UX Upgrade (Modal)

* [ ] Replace inline panel with modal
* [ ] Add:

  * keyboard navigation
  * better list density
  * improved actions layout

---

### 6. Autocomplete System

* [ ] Artist autocomplete from saved library
* [ ] Song autocomplete from saved library
* [ ] Fast selection without opening library

---

### 7. Button Visual System (Lore Styling)

* [ ] Introduce button variants:

  * primary (generate / confirm)
  * utility (save/load)
  * destructive (delete)
* [ ] Apply Fallout / terminal color logic

---

### 8. Description Config System

* [ ] Move description generation into config
* [ ] Add:

  * templates
  * tone variations
  * structure control

---

### 9. Tag System Upgrade

* [ ] Split tags into categories:

  * genre
  * mood
  * transformation
* [ ] Allow combining categories

---

### 10. Project Config Expansion

* [ ] Add per-project:

  * description templates
  * hashtag strategies
  * thumbnail layouts

---

## 🧠 Advanced Features (Later)

### Presets System

* [ ] Save full form state (not just song)
* [ ] Load full presets

---

### AI Integration (Optional Future)

* [ ] Improve descriptions via AI
* [ ] Generate extra variations

---

### Batch Mode

* [ ] Generate multiple entries at once
* [ ] Useful for Shorts pipelines

---

### Analytics / Tracking (Optional)

* [ ] Track which titles were used
* [ ] Track performance manually

---

## 💾 Data Design

### Saved Entries (Current)

```json
{
  "id": "artist-song-signal",
  "artist": "System of a Down",
  "song": "Sonne",
  "signalNumber": "12"
}
```

---

## 🧭 Long-Term Vision

This evolves into:

> A **content production tool** for music creators

Not just a generator:

* fast workflow
* reusable assets
* scalable across projects
* AI-assisted (optional)

---

## 🚀 Development Style

* Small steps
* Frequent commits
* Config over hardcoding
* UI clarity over complexity
* Build → test → refine → extract

---

## 📌 Notes

* Titles = SEO → keep full artist names
* Thumbnails = visual → use abbreviations
* Library = reusable core asset system
* JSON = standard for portability

---
