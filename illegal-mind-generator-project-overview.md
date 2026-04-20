# Illegal Mind Generator - Project Overview

## Project Goal
A small React web app for generating structured YouTube upload content for creative projects, starting with **Illegal Mind**.

The app is **not** a chatbot.
It is a **form-driven, config-driven generator** with predictable output and controlled variation.

---

## Current Stack
- React
- JavaScript
- JSON config
- localStorage
- VS Code
- No backend
- No database
- No built-in AI integration in v1

---

## Current Workflow
User fills a form with:
- Project
- Artist
- Song
- Signal Number
- Video Type
- Changes Made
- Extra Vibe Note
- Transformation Tags

The app generates:
- 5 Titles
- 5 matched Thumbnail Text variations
- 3 Descriptions
- Hashtags
- Hybrid Prompt for copy/paste into a working AI chat

---

## Done Features

### Foundation
- [x] React app initialized with Vite
- [x] Starter files cleaned
- [x] Project structure created
- [x] State lifted to `App`
- [x] Controlled input form created

### Input Form
- [x] Project field
- [x] Artist field
- [x] Song field
- [x] Signal Number field
- [x] Video Type field
- [x] Changes Made field
- [x] Extra Vibe Note field
- [x] Transformation Tags field
- [x] Clear Form button

### Generator Engine
- [x] Title generator
- [x] Thumbnail generator
- [x] Description generator
- [x] Hashtag generator
- [x] Hybrid prompt generator

### Output / UX
- [x] Generated titles rendered in UI
- [x] Thumbnails paired with titles
- [x] Descriptions rendered in UI
- [x] Hashtags rendered in UI
- [x] Hybrid prompt rendered in UI
- [x] Copy button component
- [x] Copy per title + thumbnail pair
- [x] Copy per description
- [x] Copy hashtags
- [x] Copy hybrid prompt

### Persistence
- [x] Form data saved to localStorage
- [x] Form data restored on reload
- [x] Clear form updates localStorage correctly
- [x] Safe fallback handling for new fields added later

### UI / Styling
- [x] Dark Fallout / New Vegas inspired visual theme
- [x] Terminal-like panel layout
- [x] Styled inputs, selects, textareas, and buttons
- [x] Styled output blocks
- [x] Styled copy buttons
- [x] Monospace terminal-style font across UI
- [x] Unified terminal-block styling for outputs

### Tags System
- [x] `transformationTags` added to form state
- [x] Clickable tag chips UI
- [x] Tag toggle logic
- [x] Safe handling of undefined tag arrays
- [x] Tags influence titles
- [x] Tags influence thumbnails
- [x] Tags influence descriptions
- [x] Tags influence hashtags

### Config-Driven Refactor
- [x] `projects.json` created
- [x] `availableTags` moved to config
- [x] `titleVariationSuffixes` moved to config
- [x] `thumbnailFallbacks` moved to config
- [x] `thumbnailTagMap` moved to config
- [x] `titleTagMap` moved to config
- [x] Title generator updated to use config
- [x] Thumbnail generator updated to use config
- [x] Title phrasing improved from robotic `+` joins to natural comma / `&` joins

### Project Structure / Cleanup
- [x] Nested duplicate project folder removed
- [x] Project files flattened into one root project folder

---

## Current Config Areas
The config currently supports:

- `name`
- `titleTemplates`
- `transformations`
- `thumbnailWords`
- `hashtags`
- `availableTags`
- `titleVariationSuffixes`
- `thumbnailFallbacks`
- `thumbnailTagMap`
- `titleTagMap`

This means the project is already moving toward:
- easy future editing
- easy future expansion
- adding more projects mostly through config

---

## Current Known Limitations
- Only one project is implemented (`illegalMind`)
- Tag system is still flat, not separated by category
- Descriptions are still simpler than titles/thumbnails in terms of config control
- Hashtag logic is partly config-driven, but not yet as rich as it could be
- No copy-all/export option yet
- No presets yet
- No second project yet
- No built-in AI call yet
- No responsive/mobile polish focus yet

---

## Recommended Next Features

### High Priority
- [ ] Add a second project to prove multi-project architecture
- [ ] Add copy-all output button
- [ ] Add export block / combined output view
- [ ] Move more description logic into config
- [ ] Move more hashtag logic into config

### Medium Priority
- [ ] Add presets / saved favorite setups
- [ ] Add smarter title variation patterns
- [ ] Add smarter thumbnail phrase weighting / ordering
- [ ] Add richer description blocks from config
- [ ] Add banned phrase rules per project
- [ ] Add project-specific AI refinement prompt settings

### Future Architecture Improvements
- [ ] Split tags into categories:
  - genre tags
  - mood / energy tags
  - treatment tags
- [ ] Add second and third project configs
- [ ] Add per-project vocabulary pools
- [ ] Add per-project description blocks
- [ ] Add better validation layer
- [ ] Add output locking / regenerate only one section
- [ ] Add preset manager
- [ ] Add history
- [ ] Add import/export config support

### Optional Later
- [ ] Built-in AI refinement toggle
- [ ] Backend
- [ ] Database
- [ ] User accounts
- [ ] Responsive/mobile polish

---

## Important Workflow Rule for Future Chats
The user prefers:
- **small steps only**
- **no long overwhelming walls of text**
- proceed with one step at a time
- assistant should ask user to write:
  - `continue`
  - or `commit`
- user wants Conventional Commit help when relevant

---

## Current Development Style
- Step-by-step guidance
- Minimal code per step
- User implements in VS Code
- Assistant gives:
  - one small task
  - then waits for `continue`
  - commit message when asked

---

## Suggested Immediate Next Step
Best recommended next step:
- Add a second project to prove the architecture really scales

Alternative next steps:
- Copy-all button
- Export block
- Description config refactor
- Hashtag config refactor
