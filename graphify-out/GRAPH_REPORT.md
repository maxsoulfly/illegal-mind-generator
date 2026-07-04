# Graph Report - .  (2026-07-05)

## Corpus Check
- 3 files · ~97,569 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 704 nodes · 1215 edges · 61 communities (31 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.81)
- Token cost: 153,104 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Block Editor UI Forms|Block Editor UI Forms]]
- [[_COMMUNITY_Generator Results & Entry Settings|Generator Results & Entry Settings]]
- [[_COMMUNITY_Project Settings Sections|Project Settings Sections]]
- [[_COMMUNITY_Tag-Category Placeholder Resolution|Tag-Category Placeholder Resolution]]
- [[_COMMUNITY_Graphify Pipeline Steps|Graphify Pipeline Steps]]
- [[_COMMUNITY_App Shell State & Defaults|App Shell State & Defaults]]
- [[_COMMUNITY_Input Form & Saved Entries|Input Form & Saved Entries]]
- [[_COMMUNITY_Text Block & Tag Editor UI|Text Block & Tag Editor UI]]
- [[_COMMUNITY_Major Systems & Storage Docs|Major Systems & Storage Docs]]
- [[_COMMUNITY_Core Architecture & Custom Blocks Engine|Core Architecture & Custom Blocks Engine]]
- [[_COMMUNITY_Tag Library Data & Overrides|Tag Library Data & Overrides]]
- [[_COMMUNITY_Title Generation Engine|Title Generation Engine]]
- [[_COMMUNITY_UI Primitives Catalog Docs|UI Primitives Catalog Docs]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Block Type Hook Blocks & Scope|Block Type: Hook Blocks & Scope]]
- [[_COMMUNITY_Graphify Skill Reference Docs|Graphify Skill Reference Docs]]
- [[_COMMUNITY_Block Type System ListTextGenerated|Block Type System: List/Text/Generated]]
- [[_COMMUNITY_ViteReact Build Tooling|Vite/React Build Tooling]]
- [[_COMMUNITY_Input Form Refresh & Placeholder Engine Docs|Input Form Refresh & Placeholder Engine Docs]]
- [[_COMMUNITY_Fallout Terminal CRT Atmosphere Pass|Fallout Terminal CRT Atmosphere Pass]]
- [[_COMMUNITY_CLAUDE.mdAGENTS.md Sync Docs|CLAUDE.md/AGENTS.md Sync Docs]]
- [[_COMMUNITY_TypeScriptESLint Template|TypeScript/ESLint Template]]
- [[_COMMUNITY_Legacy Tag Registry Migration|Legacy Tag Registry Migration]]
- [[_COMMUNITY_AppHeader Sticky Behavior|AppHeader Sticky Behavior]]
- [[_COMMUNITY_Session Protocol & Graphify Docs|Session Protocol & Graphify Docs]]
- [[_COMMUNITY_Title Object Shape Docs|Title Object Shape Docs]]
- [[_COMMUNITY_AppHeader Component|AppHeader Component]]
- [[_COMMUNITY_Project Overview Docs|Project Overview Docs]]
- [[_COMMUNITY_Roadmap & Technical Debt Docs|Roadmap & Technical Debt Docs]]
- [[_COMMUNITY_Resolved Project Config Builder|Resolved Project Config Builder]]
- [[_COMMUNITY_Early MVP Spec Docs|Early MVP Spec Docs]]
- [[_COMMUNITY_Hero Image Asset|Hero Image Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Shorts Description Engine|Shorts Description Engine]]
- [[_COMMUNITY_Thumbnail Engine (top-level)|Thumbnail Engine (top-level)]]
- [[_COMMUNITY_Generator Page|Generator Page]]
- [[_COMMUNITY_Project Settings Page|Project Settings Page]]
- [[_COMMUNITY_Shorts Queue Page|Shorts Queue Page]]
- [[_COMMUNITY_Tag Library Page|Tag Library Page]]
- [[_COMMUNITY_Todo Page|Todo Page]]
- [[_COMMUNITY_Config-Driven Principle|Config-Driven Principle]]
- [[_COMMUNITY_Architectural Layer Rules|Architectural Layer Rules]]
- [[_COMMUNITY_onBlur Save Pattern|onBlur Save Pattern]]
- [[_COMMUNITY_Reuse Before Creating Principle|Reuse Before Creating Principle]]
- [[_COMMUNITY_Vite Entry HTML|Vite Entry HTML]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]
- [[_COMMUNITY_Lightning Bolt Icon Shape|Lightning Bolt Icon Shape]]
- [[_COMMUNITY_Brand Color Token|Brand Color Token]]
- [[_COMMUNITY_Bluesky Icon Asset|Bluesky Icon Asset]]
- [[_COMMUNITY_Discord Icon Asset|Discord Icon Asset]]
- [[_COMMUNITY_Documentation Icon Asset|Documentation Icon Asset]]
- [[_COMMUNITY_GitHub Icon Asset|GitHub Icon Asset]]
- [[_COMMUNITY_Icons Sprite Sheet|Icons Sprite Sheet]]
- [[_COMMUNITY_Profile Icon Asset|Profile Icon Asset]]
- [[_COMMUNITY_TwitterX Icon Asset|Twitter/X Icon Asset]]

## God Nodes (most connected - your core abstractions)
1. `UI Primitives Catalog` - 28 edges
2. `IconButton()` - 22 edges
3. `Illegal Mind Generator Architecture Document` - 19 edges
4. `graphify SKILL.md (/graphify pipeline)` - 15 edges
5. `fillPlaceholders()` - 15 edges
6. `updateAppStorage()` - 14 edges
7. `generateDescriptions()` - 13 edges
8. `Illegal Mind Generator (App)` - 12 edges
9. `Illegal Mind Generator Data Model Document` - 11 edges
10. `loadAppStorage()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Illegal Mind Generator Early Roadmap (v1.3 era)` --semantically_similar_to--> `Roadmap Document`  [INFERRED] [semantically similar]
  illegal_mind_generator_roadmap.md → docs/roadmap.md
- `YouTube Content Generator MVP Spec` --semantically_similar_to--> `Illegal Mind Generator MVP / Early Project Overview`  [INFERRED] [semantically similar]
  illegal_mind_generator_mvp_spec.md → illegal-mind-generator-project-overview.md
- `Shorts Queue Stores Id References` --semantically_similar_to--> `handleSaveEntry/handleLoadEntry Field Lists Gotcha`  [INFERRED] [semantically similar]
  docs/current-context.md → CLAUDE.md
- `Shorts Title Count Respects Slider` --conceptually_related_to--> `Generator (Major System)`  [INFERRED]
  docs/current-context.md → CLAUDE.md
- `Tag Library Card Too Complex (flagged)` --conceptually_related_to--> `Tag Library (Major System)`  [EXTRACTED]
  docs/current-context.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Block Type System Components** — claude_md_list_block_type, claude_md_text_block_type, claude_md_hook_block_type, claude_md_generated_block_type, claude_md_blockeditorcard, claude_md_blockinfocard [EXTRACTED 1.00]
- **Placeholder Autocomplete Component Family** — claude_md_placeholderfield, claude_md_phraserow, claude_md_toggleinputrow, claude_md_bulktextarea, claude_md_hooktemplateeditor [INFERRED 0.85]
- **Storage Unification Cleanup TODO Items** — claude_md_priority_todo_storage_cleanup, claude_md_illegalmindgeneratordata, claude_md_tagvisibilityoverrides_legacy_gotcha, docs_current_context_storage_cleanup_debt [EXTRACTED 1.00]

## Communities (61 total, 30 thin omitted)

### Community 0 - "Block Editor UI Forms"
Cohesion: 0.09
Nodes (40): AddBlockForm(), AddTextBlockForm(), BlockActions(), BlockEditorCard(), KNOWN_BLOCK_META, LongDescriptionSettings(), MOBILE_COLUMN_TABS, KNOWN_SHORTS_BLOCK_META (+32 more)

### Community 1 - "Generator Results & Entry Settings"
Cohesion: 0.07
Nodes (29): CopyButton(), EntrySettings(), QueueSettings(), DescriptionsPanel(), GeneratedTitle(), HashtagsPanel(), buildMixedShortHooks(), ShortHooksPanel() (+21 more)

### Community 2 - "Project Settings Sections"
Cohesion: 0.06
Nodes (31): AppBackupControls(), getProjectSettingsSectionSummary(), PROJECT_SETTING_SECTIONS, PrimaryTagSection(), LinksRegistryEditor(), ProjectSettingsContent(), ProjectSettingsDescriptions(), ProjectSettingsGeneral() (+23 more)

### Community 3 - "Tag-Category Placeholder Resolution"
Cohesion: 0.10
Nodes (35): buildTagLine(), buildTagPhrase(), pickRandom(), resolveTagCategoryValue(), resolveTagLabel(), TAG_CATEGORY_ALIASES, toTitleCase(), generateBroadcastBlock() (+27 more)

### Community 4 - "Graphify Pipeline Steps"
Cohesion: 0.05
Nodes (45): Step 5: label communities, Step 9: manifest + cumulative cost tracker, graphify SKILL.md (/graphify pipeline), Semantic extraction cache check (Step B0), Fast path for existing graph.json, Step 4: build graph, cluster, analyze, Honesty rules (never invent an edge), Step 6: Obsidian vault + HTML export (+37 more)

### Community 5 - "App Shell State & Defaults"
Cohesion: 0.09
Nodes (25): defaultFormData, defaultPanelVisibility, getStoredProjectOverrides(), buildQueue(), getCoverId(), getRandomEntry(), getStoredQueues(), getValidReplacement() (+17 more)

### Community 6 - "Input Form & Saved Entries"
Cohesion: 0.08
Nodes (20): InputForm(), useSavedEntries(), AdvancedDescriptionFields(), PHRASE_BLOCK_OVERRIDES, BasicSongFields(), InputFormActions(), TransformationTagSelector(), GeneratorPage() (+12 more)

### Community 7 - "Text Block & Tag Editor UI"
Cohesion: 0.09
Nodes (21): TextBlockEditor(), TagBasicsTab(), TagDescriptionsTab(), TAG_EDITOR_TABS, TagEditorTabs(), TagHashtagsTab(), HOOK_TYPES, TagShortHooksTab() (+13 more)

### Community 8 - "Major Systems & Storage Docs"
Cohesion: 0.06
Nodes (37): Backup System (Major System), CollapsiblePanel, Config-Driven Behavior Decision, originalGenre Stages 1-3, Project Settings Thumbnail Templates, Thumbnails Split Into Own Panel, Generator (Major System), handleSaveEntry/handleLoadEntry Field Lists Gotcha (+29 more)

### Community 9 - "Core Architecture & Custom Blocks Engine"
Cohesion: 0.10
Nodes (36): appBackup.js (export/import backup), App.jsx (root state coordinator), Illegal Mind Generator Architecture Document, customBlocks.js (shared block utilities), formData (generator form state), generateCustomBlocks.js (shared block rendering), generateDescriptions.js (Long description engine), generateHashtags.js (hashtag engine) (+28 more)

### Community 10 - "Tag Library Data & Overrides"
Cohesion: 0.10
Nodes (20): useInputFormLogic(), useTagLibraryData(), useTagOverrides(), TagLibraryPage(), TagActions(), TagCard(), TagControls(), TagDetails() (+12 more)

### Community 11 - "Title Generation Engine"
Cohesion: 0.14
Nodes (19): generateHashtags(), toHashtag(), buildGeneratedArtistShort(), buildThumbnailVariations(), dedupeByPhrase(), generateThumbnails(), shuffleArray(), attemptTransformationTitles() (+11 more)

### Community 12 - "UI Primitives Catalog Docs"
Cohesion: 0.11
Nodes (23): AddBulkRow, BulkTextarea, CopyButton, FormSelect, HookTemplateEditor, IconButton, LabelInputRow, LabelSliderRow (+15 more)

### Community 13 - "Package Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 14 - "Block Type: Hook Blocks & Scope"
Cohesion: 0.17
Nodes (12): Block Scope (Project/Song), Block Targets (Long/Shorts/Both), Hook Block Lines Count Gotcha, Hook Block Type, Per-Song Block Overrides, coverLabel Not Editable From UI (Known Issue), customHashtags Hardcoded (Known Issue), descriptionLayout.js Utility Extraction (+4 more)

### Community 15 - "Graphify Skill Reference Docs"
Cohesion: 0.20
Nodes (10): graphify Skill Definition, graphify Skill Trigger (slash command), Graphify Add URL and Watch Folder, Graphify Extra Exports and Benchmark, Graphify Extraction Subagent Prompt Spec, Graphify GitHub Clone and Cross-Repo Merge, Graphify Commit Hook and CLAUDE.md Integration, Graphify Query / Path / Explain Flow (+2 more)

### Community 16 - "Block Type System: List/Text/Generated"
Cohesion: 0.22
Nodes (10): Block Label Overrides (two keys), Block Type System, BlockEditorCard, BlockInfoCard, Generated Block Type, List Block Type, Text Block Type, Block Renaming Feature (+2 more)

### Community 17 - "Vite/React Build Tooling"
Cohesion: 0.22
Nodes (9): HMR (Hot Module Replacement), Oxc, @vitejs/plugin-react, @vitejs/plugin-react-swc, React, React Compiler, React Compiler not enabled due to dev/build performance impact, SWC (+1 more)

### Community 18 - "Input Form Refresh & Placeholder Engine Docs"
Cohesion: 0.32
Nodes (8): Generator Input Form Visual Refresh, Placeholder Engine Consolidation, FormField, Placeholder Engine (src/engine/placeholders.js), ToggleField, Input Form Visual Refresh Implementation Detail, Placeholder Engine Consolidation Detail, Session Summary

### Community 19 - "Fallout Terminal CRT Atmosphere Pass"
Cohesion: 0.29
Nodes (7): Fallout Terminal CRT Atmosphere Pass, SubTabNav, Tag Category Placeholders ({tags.*}) Gotcha, Tag Library (Major System), CRT Atmosphere Pass Implementation Detail, Tag-Category Placeholders Detail, Tag Editor Sub-Tabs Fix

### Community 21 - "TypeScript/ESLint Template"
Cohesion: 0.67
Nodes (4): ESLint, TS template (create-vite template-react-ts), TypeScript, typescript-eslint

### Community 23 - "AppHeader Sticky Behavior"
Cohesion: 0.67
Nodes (3): AppHeader, Sticky AppHeader Implementation, Sticky Header Transparency

### Community 24 - "Session Protocol & Graphify Docs"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph Usage, Session Protocol, Step-by-Step Workflow Preference

### Community 25 - "Title Object Shape Docs"
Cohesion: 0.67
Nodes (3): NavLinkButton, Title Object Shape, Title Output Polish

### Community 27 - "Project Overview Docs"
Cohesion: 0.67
Nodes (3): Generator Workflow (artist/song/tags → metadata output), Project Overview Document (onboarding guide), Tag System Overview (controls titles, descriptions, hooks, hashtags)

### Community 28 - "Roadmap & Technical Debt Docs"
Cohesion: 0.67
Nodes (3): Roadmap Document, Technical Debt Items (appBackup legacy, storageMigration.js, CSS refactor), Illegal Mind Generator Early Roadmap (v1.3 era)

## Knowledge Gaps
- **147 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `IconButton()` connect `Block Editor UI Forms` to `Project Settings Sections`, `Tag Library Data & Overrides`, `App Shell State & Defaults`, `Text Block & Tag Editor UI`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `updateAppStorage()` connect `App Shell State & Defaults` to `Input Form & Saved Entries`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `isListBlock()` connect `Block Editor UI Forms` to `Tag-Category Placeholder Resolution`, `Input Form & Saved Entries`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _164 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Block Editor UI Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.08514013749338974 - nodes in this community are weakly interconnected._
- **Should `Generator Results & Entry Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.06957047791893527 - nodes in this community are weakly interconnected._
- **Should `Project Settings Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.06298701298701298 - nodes in this community are weakly interconnected._