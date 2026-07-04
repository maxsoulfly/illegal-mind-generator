# Graph Report - .  (2026-07-05)

## Corpus Check
- 28 files · ~97,129 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 726 nodes · 1214 edges · 74 communities (37 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.9)
- Token cost: 126,852 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Block Editor UI Forms|Block Editor UI Forms]]
- [[_COMMUNITY_Generator Results & Entry Settings|Generator Results & Entry Settings]]
- [[_COMMUNITY_Tag-Category Placeholder Resolution|Tag-Category Placeholder Resolution]]
- [[_COMMUNITY_Project Settings Sections|Project Settings Sections]]
- [[_COMMUNITY_Graphify Pipeline Steps|Graphify Pipeline Steps]]
- [[_COMMUNITY_App Shell State & Defaults|App Shell State & Defaults]]
- [[_COMMUNITY_Input Form & Saved Entries|Input Form & Saved Entries]]
- [[_COMMUNITY_Text Block & Tag Editor UI|Text Block & Tag Editor UI]]
- [[_COMMUNITY_Core Architecture & Custom Blocks Engine|Core Architecture & Custom Blocks Engine]]
- [[_COMMUNITY_Tag Library Data & Overrides|Tag Library Data & Overrides]]
- [[_COMMUNITY_Visual Refresh & Placeholder Docs|Visual Refresh & Placeholder Docs]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Block Type System Docs|Block Type System Docs]]
- [[_COMMUNITY_Title Generation Engine|Title Generation Engine]]
- [[_COMMUNITY_UI Primitives Docs|UI Primitives Docs]]
- [[_COMMUNITY_Backup & Block Scope Docs|Backup & Block Scope Docs]]
- [[_COMMUNITY_Graphify Skill Reference Docs|Graphify Skill Reference Docs]]
- [[_COMMUNITY_Description Panels & Thumbnails|Description Panels & Thumbnails]]
- [[_COMMUNITY_ViteReact Build Tooling|Vite/React Build Tooling]]
- [[_COMMUNITY_Thumbnail Generation Engine|Thumbnail Generation Engine]]
- [[_COMMUNITY_Session Protocol & Graphify Docs|Session Protocol & Graphify Docs]]
- [[_COMMUNITY_Current Focus originalGenre Feature|Current Focus: originalGenre Feature]]
- [[_COMMUNITY_Hook Block Lines Count|Hook Block Lines Count]]
- [[_COMMUNITY_Other Active Goals Docs|Other Active Goals Docs]]
- [[_COMMUNITY_AppHeader & UIKit|AppHeader & UIKit]]
- [[_COMMUNITY_Config-Driven Architecture|Config-Driven Architecture]]
- [[_COMMUNITY_TypeScriptESLint Template|TypeScript/ESLint Template]]
- [[_COMMUNITY_Legacy Tag Registry Migration|Legacy Tag Registry Migration]]
- [[_COMMUNITY_Long-Term Roadmap Docs|Long-Term Roadmap Docs]]
- [[_COMMUNITY_Major Systems Docs|Major Systems Docs]]
- [[_COMMUNITY_OutputItem Component|OutputItem Component]]
- [[_COMMUNITY_AppHeader Component|AppHeader Component]]
- [[_COMMUNITY_Project Overview Docs|Project Overview Docs]]
- [[_COMMUNITY_Roadmap & Technical Debt Docs|Roadmap & Technical Debt Docs]]
- [[_COMMUNITY_Resolved Project Config Builder|Resolved Project Config Builder]]
- [[_COMMUNITY_Development Preferences Docs|Development Preferences Docs]]
- [[_COMMUNITY_App Overview Docs|App Overview Docs]]
- [[_COMMUNITY_Title Object Shape Docs|Title Object Shape Docs]]
- [[_COMMUNITY_Early MVP Spec Docs|Early MVP Spec Docs]]
- [[_COMMUNITY_Hero Image Asset|Hero Image Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_AddBulkRow Component|AddBulkRow Component]]
- [[_COMMUNITY_FormSelect Component|FormSelect Component]]
- [[_COMMUNITY_LabelInputRow Component|LabelInputRow Component]]
- [[_COMMUNITY_LabelSliderRow Component|LabelSliderRow Component]]
- [[_COMMUNITY_NavLinkButton Component|NavLinkButton Component]]
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
1. `IconButton()` - 22 edges
2. `Illegal Mind Generator Architecture Document` - 19 edges
3. `graphify SKILL.md (/graphify pipeline)` - 15 edges
4. `fillPlaceholders()` - 15 edges
5. `updateAppStorage()` - 14 edges
6. `generateDescriptions()` - 13 edges
7. `Illegal Mind Generator Data Model Document` - 11 edges
8. `Block Type System` - 11 edges
9. `loadAppStorage()` - 10 edges
10. `pickViableTemplate()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Storage Architecture (AGENTS.md)` --semantically_similar_to--> `illegalMindGeneratorData (Unified Storage Key)`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `UI Primitives section (AGENTS.md)` --semantically_similar_to--> `TemplateGroupCard`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `Block Type System (AGENTS.md)` --semantically_similar_to--> `Block Type System`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `AI Notes (reuse-before-creating list)` --semantically_similar_to--> `Important Decisions`  [INFERRED] [semantically similar]
  docs/current-context.md → CLAUDE.md
- `Illegal Mind Generator Early Roadmap (v1.3 era)` --semantically_similar_to--> `Roadmap Document`  [INFERRED] [semantically similar]
  illegal_mind_generator_roadmap.md → docs/roadmap.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Block Type System (List/Text/Hook/Generated)** — claude_block_type_system, claude_list_block, claude_text_block, claude_hook_block, claude_generated_block [INFERRED 0.90]
- **Storage unification and cleanup effort** — claude_illegalmindgeneratordata, claude_storage_unification_cleanup, docs_current_context_storage_cleanup_known_issue, docs_current_context_shorts_queue_id_refs [INFERRED 0.85]
- **AGENTS.md/CLAUDE.md manual sync process** — agents_agents_md_sync_process, agents_session_protocol, claude_session_protocol [INFERRED 0.85]

## Communities (74 total, 37 thin omitted)

### Community 0 - "Block Editor UI Forms"
Cohesion: 0.09
Nodes (40): AddBlockForm(), AddTextBlockForm(), BlockActions(), BlockEditorCard(), KNOWN_BLOCK_META, LongDescriptionSettings(), MOBILE_COLUMN_TABS, KNOWN_SHORTS_BLOCK_META (+32 more)

### Community 1 - "Generator Results & Entry Settings"
Cohesion: 0.07
Nodes (29): CopyButton(), EntrySettings(), QueueSettings(), DescriptionsPanel(), GeneratedTitle(), HashtagsPanel(), buildMixedShortHooks(), ShortHooksPanel() (+21 more)

### Community 2 - "Tag-Category Placeholder Resolution"
Cohesion: 0.09
Nodes (37): buildTagLine(), buildTagPhrase(), pickRandom(), resolveTagCategoryValue(), resolveTagLabel(), TAG_CATEGORY_ALIASES, toTitleCase(), generateBroadcastBlock() (+29 more)

### Community 3 - "Project Settings Sections"
Cohesion: 0.07
Nodes (29): AppBackupControls(), getProjectSettingsSectionSummary(), PROJECT_SETTING_SECTIONS, PrimaryTagSection(), LinksRegistryEditor(), ProjectSettingsContent(), ProjectSettingsDescriptions(), ProjectSettingsGeneral() (+21 more)

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
Cohesion: 0.08
Nodes (22): TextBlockEditor(), TagBasicsTab(), TagDescriptionsTab(), TAG_EDITOR_TABS, TagEditorTabs(), TagHashtagsTab(), HOOK_TYPES, TagShortHooksTab() (+14 more)

### Community 8 - "Core Architecture & Custom Blocks Engine"
Cohesion: 0.10
Nodes (36): appBackup.js (export/import backup), App.jsx (root state coordinator), Illegal Mind Generator Architecture Document, customBlocks.js (shared block utilities), formData (generator form state), generateCustomBlocks.js (shared block rendering), generateDescriptions.js (Long description engine), generateHashtags.js (hashtag engine) (+28 more)

### Community 9 - "Tag Library Data & Overrides"
Cohesion: 0.09
Nodes (21): useInputFormLogic(), useTagLibraryData(), useTagOverrides(), TagLibraryPage(), TagActions(), TagCard(), TagControls(), TagDetails() (+13 more)

### Community 10 - "Visual Refresh & Placeholder Docs"
Cohesion: 0.06
Nodes (35): FormField optional className prop, Generator Input form visual refresh (2026-07-05), Placeholder engine consolidated (2026-07-04/05), All placeholder resolution goes through src/engine/placeholders.js, Post-Upload Session Todos (AGENTS.md), Priority Todo (AGENTS.md), Storage Architecture (AGENTS.md), {tags.<category>} placeholder resolution gotcha (+27 more)

### Community 11 - "Package Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 12 - "Block Type System Docs"
Cohesion: 0.15
Nodes (13): Block Type System (AGENTS.md), BlockEditorCard, BlockInfoCard, Block label overrides (blockLabelOverrides/hookBlockLabelOverrides), Block targets (long/shorts/both), Block Type System, Generated Block type, BlockEditorCard extraction (current-context) (+5 more)

### Community 13 - "Title Generation Engine"
Cohesion: 0.36
Nodes (12): attemptTransformationTitles(), buildGeneratedArtistShort(), buildGenericTitles(), buildHookTitles(), buildTransformationTitles(), buildTransformationVariations(), capitalizeFirst(), generateTitles() (+4 more)

### Community 14 - "UI Primitives Docs"
Cohesion: 0.22
Nodes (11): Important Decisions (AGENTS.md), UI Primitives section (AGENTS.md), HookTemplateEditor, IconButton, Important Decisions, MoveControls, ShortHookCard, SubTabNav (+3 more)

### Community 15 - "Backup & Block Scope Docs"
Cohesion: 0.24
Nodes (11): Known Gotchas section (AGENTS.md), Backup System (Major System), Block scope (Project/Song), src/utils/customBlocks.js, handleSaveEntry/handleLoadEntry explicit field lists, List Block type, Per-song block overrides (formData.songBlockOverrides), Text Block type (+3 more)

### Community 16 - "Graphify Skill Reference Docs"
Cohesion: 0.20
Nodes (10): graphify Skill Definition, graphify Skill Trigger (slash command), Graphify Add URL and Watch Folder, Graphify Extra Exports and Benchmark, Graphify Extraction Subagent Prompt Spec, Graphify GitHub Clone and Cross-Repo Merge, Graphify Commit Hook and CLAUDE.md Integration, Graphify Query / Path / Explain Flow (+2 more)

### Community 17 - "Description Panels & Thumbnails"
Cohesion: 0.22
Nodes (9): CollapsiblePanel, Project Settings (Major System), Short Hooks vs Shorts Titles (two systems), Project Settings -> Thumbnail Templates, Thumbnails split into own Generator panel, CollapsiblePanel extracted (current-context), Project Settings -> Thumbnail Templates built (current-context), Thumbnails split into own panel + source nav (current-context) (+1 more)

### Community 18 - "Vite/React Build Tooling"
Cohesion: 0.22
Nodes (9): HMR (Hot Module Replacement), Oxc, @vitejs/plugin-react, @vitejs/plugin-react-swc, React, React Compiler, React Compiler not enabled due to dev/build performance impact, SWC (+1 more)

### Community 19 - "Thumbnail Generation Engine"
Cohesion: 0.39
Nodes (5): buildGeneratedArtistShort(), buildThumbnailVariations(), dedupeByPhrase(), generateThumbnails(), shuffleArray()

### Community 20 - "Session Protocol & Graphify Docs"
Cohesion: 0.40
Nodes (6): AGENTS.md manual mirror-sync process, graphify (AGENTS.md), Session Protocol (AGENTS.md), graphify knowledge graph tool, Session Protocol, Graphify knowledge graph built (current-context)

### Community 21 - "Current Focus: originalGenre Feature"
Cohesion: 0.33
Nodes (6): Current Focus (AGENTS.md), Illegal Mind Covers (Project), Maxx Dee Covers (Project), originalGenre feature (Stage 2/3), Title engine key names (longPrefix legacy), originalGenre Stage 2 - faithful hooks (current-context)

### Community 22 - "Hook Block Lines Count"
Cohesion: 0.33
Nodes (6): Hook block Lines count only via resolveHookBlockOutput, Hook Block type, Hook Block song overrides and scope, hookBlocks config shape, Hook blocks honor configured Lines count, ProjectSettingsHookBlocks.jsx

### Community 23 - "Other Active Goals Docs"
Cohesion: 0.33
Nodes (6): Other Active Goals (AGENTS.md), coverLabel has no settings UI, customHashtags still hardcoded, Other Active Goals, coverLabel not editable from UI (Known Issue), customHashtags is hardcoded (Known Issue)

### Community 24 - "AppHeader & UIKit"
Cohesion: 0.40
Nodes (5): AppHeader, UIKit (Component Catalog), src/components/AppHeader.jsx, Sticky AppHeader (current-context), src/pages/UIKitPage.jsx

### Community 25 - "Config-Driven Architecture"
Cohesion: 0.50
Nodes (4): Core Architecture (config-driven), src/utils/buildResolvedProjectConfig.js, src/engine/descriptions/, src/config/projects.json

### Community 26 - "TypeScript/ESLint Template"
Cohesion: 0.67
Nodes (4): ESLint, TS template (create-vite template-react-ts), TypeScript, typescript-eslint

### Community 28 - "Long-Term Roadmap Docs"
Cohesion: 0.67
Nodes (3): Long-Term Roadmap (AGENTS.md), Avoid premature database work, Long-Term Roadmap

### Community 29 - "Major Systems Docs"
Cohesion: 0.67
Nodes (3): Major Systems (AGENTS.md), Generator (Major System), Tag system is deeply connected

### Community 30 - "OutputItem Component"
Cohesion: 0.67
Nodes (3): CopyButton, OutputItem, OutputItem extracted (current-context)

### Community 32 - "Project Overview Docs"
Cohesion: 0.67
Nodes (3): Generator Workflow (artist/song/tags → metadata output), Project Overview Document (onboarding guide), Tag System Overview (controls titles, descriptions, hooks, hashtags)

### Community 33 - "Roadmap & Technical Debt Docs"
Cohesion: 0.67
Nodes (3): Roadmap Document, Technical Debt Items (appBackup legacy, storageMigration.js, CSS refactor), Illegal Mind Generator Early Roadmap (v1.3 era)

## Knowledge Gaps
- **174 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `IconButton()` connect `Block Editor UI Forms` to `Tag Library Data & Overrides`, `Project Settings Sections`, `App Shell State & Defaults`, `Text Block & Tag Editor UI`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `updateAppStorage()` connect `App Shell State & Defaults` to `Input Form & Saved Entries`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `isListBlock()` connect `Block Editor UI Forms` to `Tag-Category Placeholder Resolution`, `Input Form & Saved Entries`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _188 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Block Editor UI Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.08514013749338974 - nodes in this community are weakly interconnected._
- **Should `Generator Results & Entry Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.06957047791893527 - nodes in this community are weakly interconnected._
- **Should `Tag-Category Placeholder Resolution` be split into smaller, more focused modules?**
  _Cohesion score 0.08771929824561403 - nodes in this community are weakly interconnected._