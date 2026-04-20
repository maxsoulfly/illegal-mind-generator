# YouTube Content Generator - MVP / V1 Spec

## Goal
A small web app that generates structured YouTube upload content from a form.

This is not a chatbot.
This is not open-ended AI creativity.
The goal is fast, repeatable, low-randomness output based on fixed project rules.

## Main Use Case
User selects a project and enters song/video info.
The app generates:
- 5 titles
- matching thumbnail text for each title
- 3 descriptions
- hashtags
- optional hybrid prompt text to copy into a chat for refinement

## First Project
Project name: Illegal Mind

Content type:
YouTube covers in a lore-based signal transmission / reconstruction style.

## Stack for MVP
- React
- JavaScript
- JSON config
- browser storage (sessionStorage and/or localStorage)
- built in VS Code
- no backend
- no database
- no built-in AI integration in v1

## Input Fields
- Project
- Artist
- Song
- Signal number / release number
- Video type (Long / Shorts)
- Changes made
- Extra vibe note
- Transformation tags (optional chips such as slower, heavier, darker, alt metal, punk, modernized, faithful, hardcore)

## Output Sections
- Titles (5)
- Thumbnail text matched to each title
- Descriptions (3)
- Hashtags
- Hybrid prompt text

## App Behavior
- Form-driven only
- Deterministic or semi-deterministic output
- Controlled variation only
- Same input style should produce same style of output
- Copy button for each section
- Clean output cards / sections

## Illegal Mind Rules for MVP

### Title Style
Use a fixed branded lore format.
Example pattern:
[SIGNAL ##] // Artist - Song (Transformation Hook) // Illegal Mind Rework

Title rules:
- include signal number
- include artist and/or song name
- include concise transformation hook
- preserve Illegal Mind branding
- generate about 5 variations inside the same style

Example transformation phrases:
- Slower & Heavier
- Alt Metal Version
- Heavy Rework
- Darker Version
- Punk Reconstruction
- Modern Mix

### Thumbnail Text Style
- short
- punchy
- readable
- ideally 2-5 words
- matched to the title angle
- repetition is acceptable if strong

### Description Style
- modular and rules-based first
- readable and human
- lore-based tone: recovered transmission / archive log / reconstruction note
- mention what changed in the song
- avoid generic AI filler
- controlled and branded tone

### Hashtag Logic
Combine:
- default project hashtags
- artist hashtags
- song hashtags
- genre hashtags
- transformation hashtags
- video type hashtags when relevant

## Architecture for MVP

### 1. Config Layer
Project rules stored in JSON.
Each project should be configurable.

### 2. Generator Layer
Pure JavaScript functions generate output from form data + project config.

### 3. UI Layer
Form input + output cards + copy buttons.

### 4. Storage Layer
Use browser storage to remember recent inputs and/or last output.

## Project Structure (Suggested)
src/
  components/
  config/
  engine/
  utils/
  data/

## Rules-Based vs Hybrid

### Rules-Based in MVP
- titles
- thumbnail text
- descriptions
- hashtags

### Hybrid in MVP
The app can generate a copyable prompt block for external chat refinement.
This is only text for copy/paste into a working AI chat.
No built-in AI call is required in v1.

## What the Hybrid Prompt Is For
Optional use only.
If the user wants stronger wording, they can copy generated output into a chat using the prompt block.
The refinement should improve wording, not reinvent structure.

## MVP Scope
Build only what is needed for a working first version:
- one project: Illegal Mind
- one form
- generator logic
- output rendering
- copy buttons
- storage for convenience
- hybrid prompt generator

## Out of Scope for MVP
- backend
- database
- accounts/auth
- multi-user features
- built-in LLM/API integration
- complex history system
- advanced project editor UI

## Build Order
1. Set up React app with Vite
2. Clean starter files
3. Create basic page layout
4. Build input form
5. Create Illegal Mind JSON config
6. Build generator functions
7. Render output sections
8. Add copy buttons
9. Add browser storage
10. Add hybrid prompt block

## Success Criteria for MVP
The app is successful if:
- user can input song + artist + changes quickly
- app generates consistent formatted output fast
- output matches Illegal Mind project style
- user can copy the results immediately for YouTube upload workflow
- user can optionally copy a hybrid refinement prompt into another chat

