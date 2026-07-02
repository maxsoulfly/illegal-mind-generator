# Graph Report - illegal-mind-generator  (2026-07-02)

## Corpus Check
- 175 files · ~90,461 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1048 nodes · 1569 edges · 86 communities (66 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d91f8ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Block System UI|Block System UI]]
- [[_COMMUNITY_App Shell & State Hooks|App Shell & State Hooks]]
- [[_COMMUNITY_Architecture Documentation|Architecture Documentation]]
- [[_COMMUNITY_Generator Output & Saved Entries|Generator Output & Saved Entries]]
- [[_COMMUNITY_Generator Input & Tag Editor|Generator Input & Tag Editor]]
- [[_COMMUNITY_Hashtag & Hook Generation|Hashtag & Hook Generation]]
- [[_COMMUNITY_Description Generation Engine|Description Generation Engine]]
- [[_COMMUNITY_Tag Library|Tag Library]]
- [[_COMMUNITY_Project Settings|Project Settings]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Tag Editor UI|Tag Editor UI]]
- [[_COMMUNITY_Graphify Tooling|Graphify Tooling]]
- [[_COMMUNITY_App Navigation & Backup|App Navigation & Backup]]
- [[_COMMUNITY_UI Icon Assets|UI Icon Assets]]
- [[_COMMUNITY_Tag Registry Migration|Tag Registry Migration]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_MVP Documentation|MVP Documentation]]
- [[_COMMUNITY_Hero Image|Hero Image]]
- [[_COMMUNITY_React Logo|React Logo]]
- [[_COMMUNITY_Vite Logo|Vite Logo]]
- [[_COMMUNITY_Project Identity|Project Identity]]
- [[_COMMUNITY_Short Description Architecture|Short Description Architecture]]
- [[_COMMUNITY_Thumbnail Architecture|Thumbnail Architecture]]
- [[_COMMUNITY_Generator Page Architecture|Generator Page Architecture]]
- [[_COMMUNITY_Project Settings Architecture|Project Settings Architecture]]
- [[_COMMUNITY_Shorts Queue Architecture|Shorts Queue Architecture]]
- [[_COMMUNITY_Tag Library Architecture|Tag Library Architecture]]
- [[_COMMUNITY_Todo Architecture|Todo Architecture]]
- [[_COMMUNITY_Config-Driven Principle|Config-Driven Principle]]
- [[_COMMUNITY_Layer Architecture Rules|Layer Architecture Rules]]
- [[_COMMUNITY_Reuse Principle|Reuse Principle]]
- [[_COMMUNITY_HTML Entry Point|HTML Entry Point]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `IconButton()` - 23 edges
2. `Illegal Mind Generator Architecture Document` - 19 edges
3. `YouTube Content Generator - MVP / V1 Spec` - 17 edges
4. `Illegal Mind Generator — Data Model` - 16 edges
5. `updateAppStorage()` - 15 edges
6. `Illegal Mind Generator — Architecture` - 14 edges
7. `Conventions` - 14 edges
8. `Current Context` - 14 edges
9. `generateDescriptions()` - 13 edges
10. `ToggleButton()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Illegal Mind Generator Early Roadmap (v1.3 era)` --semantically_similar_to--> `Roadmap`  [INFERRED] [semantically similar]
  illegal_mind_generator_roadmap.md → docs/roadmap.md
- `Tag System Overview (controls titles, descriptions, hooks, hashtags)` --semantically_similar_to--> `Tag System (transformation tags, deeply connected)`  [INFERRED] [semantically similar]
  docs/project-overview.md → CLAUDE.md
- `YouTube Content Generator MVP Spec` --semantically_similar_to--> `Illegal Mind Generator MVP / Early Project Overview`  [INFERRED] [semantically similar]
  illegal_mind_generator_mvp_spec.md → illegal-mind-generator-project-overview.md
- `Per-Song Block Overrides (songBlockOverrides)` --shares_data_with--> `generateDescriptions.js (Long description engine)`  [INFERRED]
  CLAUDE.md → docs/architecture.md
- `Tag System (transformation tags, deeply connected)` --references--> `Tag Registry`  [INFERRED]
  CLAUDE.md → docs/data-model.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Generation Engine Pipeline (formData + resolvedProjectConfig → all outputs)** — docs_architecture_form_data, docs_architecture_resolved_project_config, docs_architecture_generate_short_hooks, docs_architecture_generate_titles, docs_architecture_generate_descriptions, docs_architecture_generate_hashtags, docs_architecture_generate_thumbnails [EXTRACTED 0.95]
- **Config Merge Pipeline (projects.json + tagOverrides + projectOverrides → resolvedProjectConfig)** — docs_architecture_projects_json, docs_architecture_use_tag_overrides, docs_architecture_use_project_overrides, docs_architecture_build_resolved_project_config, docs_architecture_resolved_project_config [EXTRACTED 0.95]
- **Block Type Ecosystem (List / Text / Hook blocks with scope, target, song overrides)** — docs_data_model_list_block, docs_data_model_text_block, docs_data_model_hook_block_type, claude_md_song_block_overrides, docs_architecture_custom_blocks_js [EXTRACTED 0.90]

## Communities (86 total, 20 thin omitted)

### Community 0 - "Block System UI"
Cohesion: 0.24
Nodes (11): BlockActions(), AddListBlockForm(), TYPE_OPTIONS, ListItemRow(), DISPLAY_MODE_OPTIONS, FormSelect(), IconButton(), MoveControls() (+3 more)

### Community 1 - "App Shell & State Hooks"
Cohesion: 0.05
Nodes (46): AppHeader(), PAGE_LABELS, getProjectSettingsSectionSummary(), PROJECT_SETTING_SECTIONS, defaultFormData, defaultPanelVisibility, useAppShellState(), useGeneratedOutput() (+38 more)

### Community 2 - "Architecture Documentation"
Cohesion: 0.10
Nodes (19): Blast radius map, Component Dependency Graph, customBlocks.js consumers, customBlocks.js consumers, Generation Engine Dependencies, Hook dependency on each other, hookPlaceholders.js consumers, Illegal Mind Generator — Graph Report (+11 more)

### Community 3 - "Generator Output & Saved Entries"
Cohesion: 0.09
Nodes (24): CopyButton(), GeneratorResultsPanel(), DescriptionsPanel(), GeneratedTitlePair(), HashtagsPanel(), buildMixedShortHooks(), ShortHooksPanel(), shuffleArray() (+16 more)

### Community 4 - "Generator Input & Tag Editor"
Cohesion: 0.06
Nodes (51): buildResolvedProjectConfig (config merge layer), Description Layout Builder (Available + Active columns), Dynamic Hook Blocks (user-created, customHookBlocks), Hook Blocks (phrase-template arrays, random pick), Illegal Mind Generator — CLAUDE.md Instructions, PlaceholderField (autocomplete input/textarea), Per-Song Block Overrides (songBlockOverrides), Storage Unification (illegalMindGeneratorData) (+43 more)

### Community 5 - "Hashtag & Hook Generation"
Cohesion: 0.11
Nodes (26): generateHashtags(), toHashtag(), createBaseHook(), createTagHook(), fillHookTemplate(), generateShortHooks(), pickOneGenre(), resolveDecade() (+18 more)

### Community 6 - "Description Generation Engine"
Cohesion: 0.16
Nodes (24): buildTagLine(), buildTagPhrase(), pickRandom(), resolveTagLabel(), toTitleCase(), generateBroadcastBlock(), pickRandom(), generateCustomBlocks() (+16 more)

### Community 7 - "Tag Library"
Cohesion: 0.13
Nodes (12): useTagLibraryData(), TagLibraryPage(), TagActions(), TagCard(), TagControls(), TagDetails(), TagFilters(), TagHeader() (+4 more)

### Community 8 - "Project Settings"
Cohesion: 0.08
Nodes (24): Block scope, Block targets, Block Type System, Block types, Core Architecture, Current Focus, Development Environment, Development Preferences (+16 more)

### Community 9 - "Project Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 10 - "Tag Editor UI"
Cohesion: 0.05
Nodes (43): Back up and restore, Backup reliability, Backup System, Block collision detection, Block Types, Browse and edit tags, Build and manage a Shorts upload queue, Config is a bootstrap template (+35 more)

### Community 11 - "Graphify Tooling"
Cohesion: 0.20
Nodes (10): graphify Skill Definition, graphify Skill Trigger (slash command), Graphify Add URL and Watch Folder, Graphify Extra Exports and Benchmark, Graphify Extraction Subagent Prompt Spec, Graphify GitHub Clone and Cross-Repo Merge, Graphify Commit Hook and CLAUDE.md Integration, Graphify Query / Path / Explain Flow (+2 more)

### Community 12 - "App Navigation & Backup"
Cohesion: 0.23
Nodes (13): AddBlockForm(), AddTextBlockForm(), PHRASE_BLOCK_OVERRIDES, SongBlockOverrideFields(), StructuredListEditor(), detectItemType(), getBlockLabel(), isListBlock() (+5 more)

### Community 13 - "UI Icon Assets"
Cohesion: 0.29
Nodes (7): Bluesky Icon Symbol, Discord Icon Symbol, Documentation Icon Symbol, GitHub Icon Symbol, Icons SVG Sprite Sheet, Social / User Profile Icon Symbol, X (Twitter) Icon Symbol

### Community 15 - "Brand Assets"
Cohesion: 0.67
Nodes (3): App Favicon Icon, Lightning Bolt Shape, Purple Brand Color (#863bff)

### Community 26 - "Generator Page Architecture"
Cohesion: 0.05
Nodes (40): Architectural rules, Backup, Block editor shared shell, Component Architecture, Config Resolution, Cross-page navigation (output → settings), Cross-System Interactions, Data Flow (+32 more)

### Community 27 - "Project Settings Architecture"
Cohesion: 0.06
Nodes (34): 10. Project Config Expansion, 1. Regenerate System, 2. Variation Count Control (Finish Integration), 3. Output Selection System, 4. Export Final Output Block, 5. Library UX Upgrade (Modal), 6. Autocomplete System, 7. Button Visual System (Lore Styling) (+26 more)

### Community 28 - "Shorts Queue Architecture"
Cohesion: 0.07
Nodes (27): 1. Config Layer, 2. Generator Layer, 3. UI Layer, 4. Storage Layer, App Behavior, Architecture for MVP, Build Order, Description Style (+19 more)

### Community 29 - "Tag Library Architecture"
Cohesion: 0.10
Nodes (22): AI Notes, Architectural Notes, Block Renaming (Active Focus), `coverLabel` not editable from UI, Current Context, Current Focus, `customHashtags` is hardcoded, Description Layout Column Parity (Active Focus) (+14 more)

### Community 30 - "Todo Architecture"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents) (+17 more)

### Community 37 - "Community 37"
Cohesion: 0.08
Nodes (24): Block scope, Block targets, Block Type System, Block types, Core Architecture, Current Focus, Development Environment, Development Preferences (+16 more)

### Community 38 - "Community 38"
Cohesion: 0.08
Nodes (24): Config-Driven Refactor, Current Config Areas, Current Development Style, Current Known Limitations, Current Stack, Current Workflow, Done Features, Foundation (+16 more)

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (8): Block Type System (List / Text / Hook / Generated), Block key namespace, Block Types, Illegal Mind Generator Data Model Document, Hook Block, Hook Block Type (phrase array, random pick), List Block, Text Block

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (8): Entity Relationships, Example, Fields, Illegal Mind Generator — Data Model, Key relationships, Root Storage Object, Storage Overview, Table of Contents

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (11): Tag System (transformation tags, deeply connected), shortHooks Fields, Tag Categories, Tag — Example (Illegal Mind, "heavier"), Tag — Example (Maxx Dee, "heavier" — with shortHooks), Tag — Example (with flags, "chorus"), Tag Fields, Tag Registry (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (10): Description Config, Hook Block Definitions, Links Registry, Long Description Templates, Project Configuration (projects.json), Short Hook Types, Shorts Description Templates, Thumbnail Config (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents) (+17 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (9): After making changes, AI Assistant Rules, Before writing any code, Extend before duplicating, Keep changes minimal and focused, Respect existing architecture, Reuse before building, Search before creating (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (9): Backup safety, Config vs. override, Data Conventions, Data ownership, Legacy field migration, Per-song overrides, Persisting new state, Single storage key (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (19): InputForm(), EntrySettings(), useInputFormLogic(), useTagOverrides(), AdvancedDescriptionFields(), BasicSongFields(), InputFormActions(), QueueSettings() (+11 more)

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (8): Card pattern, Check UIKit first, Component Conventions, Form pattern, Page structure, Panel pattern, UI composition, UI primitives (`src/components/ui/`)

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (7): Components, Configuration object keys, Constants, Hooks, Naming Conventions, Storage keys, Utilities

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (7): Entry ID, Example — full entry, Fields, Relationships, Saved Entries, Song Block Overrides, Todo

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (5): Conventions, Core principles, Design goals, Maintainability goals, Project Philosophy

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (6): Adding a new feature, Architecture Conventions, Config resolution is the seam, Extending existing systems, State flows down via props, The layer rules (non-negotiable)

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (6): CSS custom properties, Global stylesheet, Layout patterns, Responsive design, Styling Conventions, Visual consistency

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (6): Documentation Conventions, Documentation maintenance expectations, When to update `architecture.md`, When to update `CLAUDE.md`, When to update `current-context.md`, When to update `roadmap.md`

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (6): Deep merge behavior (from `buildResolvedProjectConfig.js`), Example, `hookBlockTargets`, `phraseBlockScopes`, Project Settings Overrides, Structure

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 56 - "Community 56"
Cohesion: 0.40
Nodes (5): Anti-Patterns, Architecture anti-patterns, Component anti-patterns, Config anti-patterns, State anti-patterns

### Community 57 - "Community 57"
Cohesion: 0.40
Nodes (5): Component placement rules, Documentation placement, File Organization, Folder responsibilities, Utility placement

### Community 58 - "Community 58"
Cohesion: 0.26
Nodes (11): KNOWN_BLOCK_META, LongDescriptionSettings(), MOBILE_COLUMN_TABS, KNOWN_SHORTS_BLOCK_META, MOBILE_COLUMN_TABS, ShortsDescriptionSettings(), DESCRIPTION_SUBTABS, BlockInfoCard() (+3 more)

### Community 59 - "Community 59"
Cohesion: 0.40
Nodes (5): Custom tags, Example, Merge behavior, Structure, Tag Overrides

### Community 60 - "Community 60"
Cohesion: 0.50
Nodes (4): Example, Fields, panelVisibility defaults, UI State

### Community 61 - "Community 61"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 65 - "Community 65"
Cohesion: 0.39
Nodes (6): AppBackupControls(), buildAppBackup(), downloadAppBackup(), LEGACY_KEYS, readLegacyData(), restoreAppBackup()

### Community 66 - "Community 66"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 70 - "Community 70"
Cohesion: 0.12
Nodes (13): TagBasicsTab(), TagDescriptionsTab(), TAG_EDITOR_TABS, TagEditorTabs(), TagHashtagsTab(), HOOK_TYPES, TagShortHooksTab(), TagTitlesTab() (+5 more)

### Community 71 - "Community 71"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (5): Example, Queue constraints, Saved Entry Data Structure, Shorts Queue, Structure

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 81 - "Community 81"
Cohesion: 0.27
Nodes (6): TABS, AddBulkRow(), BulkTextarea(), PhraseRow, PlaceholderField(), ToggleInputRow()

### Community 82 - "Community 82"
Cohesion: 0.16
Nodes (10): PrimaryTagSection(), ProjectSettingsShortHooks(), TagSyncControls(), TitlePrefixSuffixSection(), TitleTransformationSection(), LabelInputRow(), LabelSelectRow(), LabelSliderRow() (+2 more)

### Community 83 - "Community 83"
Cohesion: 0.11
Nodes (15): LinksRegistryEditor(), BLOCKS_SUBTABS, ProjectSettingsBlocks(), ProjectSettingsDescriptions(), ProjectSettingsGeneral(), OVERRIDE_TYPE_OPTIONS, ProjectSettingsHookBlocks(), ProjectSettingsLinks() (+7 more)

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (4): Example, Fields, Fields not persisted to saved entries, Generator Form State

## Knowledge Gaps
- **484 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+479 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Conventions` connect `Community 50` to `Generator Input & Tag Editor`, `Community 39`, `Community 44`, `Community 45`, `Community 47`, `Community 48`, `Community 51`, `Community 52`, `Community 53`, `Community 56`, `Community 57`, `Tag Library Architecture`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Illegal Mind Generator — Data Model` connect `Community 40` to `Generator Input & Tag Editor`, `Community 39`, `Community 72`, `Community 41`, `Community 42`, `Community 49`, `Community 54`, `Community 87`, `Community 59`, `Community 60`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Illegal Mind Generator Data Model Document` connect `Community 39` to `Generator Input & Tag Editor`, `Community 72`, `Community 41`, `Community 50`, `Community 54`, `Community 59`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _489 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & State Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.05261261261261261 - nodes in this community are weakly interconnected._
- **Should `Architecture Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Generator Output & Saved Entries` be split into smaller, more focused modules?**
  _Cohesion score 0.09191583610188261 - nodes in this community are weakly interconnected._