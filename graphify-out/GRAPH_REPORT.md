# Graph Report - .  (2026-06-21)

## Corpus Check
- 166 files · ~72,898 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 510 nodes · 980 edges · 37 communities (20 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.9)
- Token cost: 500 input · 120 output

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

## God Nodes (most connected - your core abstractions)
1. `IconButton()` - 20 edges
2. `Illegal Mind Generator Architecture Document` - 19 edges
3. `updateAppStorage()` - 15 edges
4. `ToggleButton()` - 12 edges
5. `generateDescriptions()` - 11 edges
6. `loadAppStorage()` - 11 edges
7. `Illegal Mind Generator Data Model Document` - 11 edges
8. `Illegal Mind Generator — CLAUDE.md Instructions` - 10 edges
9. `graphify Skill Definition` - 9 edges
10. `App.jsx (root state coordinator)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Tag System Overview (controls titles, descriptions, hooks, hashtags)` --semantically_similar_to--> `Tag System (transformation tags, deeply connected)`  [INFERRED] [semantically similar]
  docs/project-overview.md → CLAUDE.md
- `Illegal Mind Generator Early Roadmap (v1.3 era)` --semantically_similar_to--> `Roadmap Document`  [INFERRED] [semantically similar]
  illegal_mind_generator_roadmap.md → docs/roadmap.md
- `YouTube Content Generator MVP Spec` --semantically_similar_to--> `Illegal Mind Generator MVP / Early Project Overview`  [INFERRED] [semantically similar]
  illegal_mind_generator_mvp_spec.md → illegal-mind-generator-project-overview.md
- `Per-Song Block Overrides (songBlockOverrides)` --shares_data_with--> `generateDescriptions.js (Long description engine)`  [INFERRED]
  CLAUDE.md → docs/architecture.md
- `Storage Unification (illegalMindGeneratorData)` --references--> `storage.js (single storage API)`  [INFERRED]
  CLAUDE.md → docs/architecture.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Generation Engine Pipeline (formData + resolvedProjectConfig → all outputs)** — docs_architecture_form_data, docs_architecture_resolved_project_config, docs_architecture_generate_short_hooks, docs_architecture_generate_titles, docs_architecture_generate_descriptions, docs_architecture_generate_hashtags, docs_architecture_generate_thumbnails [EXTRACTED 0.95]
- **Config Merge Pipeline (projects.json + tagOverrides + projectOverrides → resolvedProjectConfig)** — docs_architecture_projects_json, docs_architecture_use_tag_overrides, docs_architecture_use_project_overrides, docs_architecture_build_resolved_project_config, docs_architecture_resolved_project_config [EXTRACTED 0.95]
- **Block Type Ecosystem (List / Text / Hook blocks with scope, target, song overrides)** — docs_data_model_list_block, docs_data_model_text_block, docs_data_model_hook_block_type, claude_md_song_block_overrides, docs_architecture_custom_blocks_js [EXTRACTED 0.90]

## Communities (37 total, 17 thin omitted)

### Community 0 - "Block System UI"
Cohesion: 0.06
Nodes (51): AddBlockForm(), AddTextBlockForm(), BlockActions(), BlockEditorCard(), TextBlockEditor(), KNOWN_BLOCK_META, LongDescriptionSettings(), MOBILE_COLUMN_TABS (+43 more)

### Community 1 - "App Shell & State Hooks"
Cohesion: 0.06
Nodes (39): defaultFormData, defaultPanelVisibility, useAppShellState(), useGeneratedOutput(), getStoredProjectOverrides(), useProjectOverrides(), useSavedEntries(), buildQueue() (+31 more)

### Community 2 - "Architecture Documentation"
Cohesion: 0.06
Nodes (58): Block Type System (List / Text / Hook / Generated), buildResolvedProjectConfig (config merge layer), Description Layout Builder (Available + Active columns), Dynamic Hook Blocks (user-created, customHookBlocks), Hook Blocks (phrase-template arrays, random pick), Illegal Mind Generator — CLAUDE.md Instructions, PlaceholderField (autocomplete input/textarea), Per-Song Block Overrides (songBlockOverrides) (+50 more)

### Community 3 - "Generator Output & Saved Entries"
Cohesion: 0.08
Nodes (26): CopyButton(), EntrySettings(), GeneratorResultsPanel(), QueueSettings(), DescriptionsPanel(), GeneratedTitlePair(), HashtagsPanel(), buildMixedShortHooks() (+18 more)

### Community 4 - "Generator Input & Tag Editor"
Cohesion: 0.11
Nodes (20): InputForm(), TagBasicsTab(), useInputFormLogic(), useTagOverrides(), AdvancedDescriptionFields(), BasicSongFields(), InputFormActions(), TransformationTagSelector() (+12 more)

### Community 5 - "Hashtag & Hook Generation"
Cohesion: 0.11
Nodes (22): generateHashtags(), toHashtag(), createBaseHook(), createTagHook(), fillHookTemplate(), generateShortHooks(), resolveDecade(), resolvePrimaryTag() (+14 more)

### Community 6 - "Description Generation Engine"
Cohesion: 0.15
Nodes (21): buildTagLine(), buildTagPhrase(), pickRandom(), resolveTagLabel(), toTitleCase(), generateBroadcastBlock(), pickRandom(), generateCustomBlocks() (+13 more)

### Community 7 - "Tag Library"
Cohesion: 0.12
Nodes (13): useTagLibraryData(), TagLibraryPage(), TagActions(), TagCard(), TagControls(), TagDetails(), TagFilters(), TagHeader() (+5 more)

### Community 8 - "Project Settings"
Cohesion: 0.12
Nodes (14): getProjectSettingsSectionSummary(), PROJECT_SETTING_SECTIONS, LinksRegistryEditor(), ProjectSettingsPage(), ProjectSettingsContent(), ProjectSettingsLinks(), ProjectSettingsShortHooks(), GENERATION_SETTINGS_KEYS (+6 more)

### Community 9 - "Project Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 10 - "Tag Editor UI"
Cohesion: 0.14
Nodes (11): TagDescriptionsTab(), TAG_EDITOR_TABS, TagEditorTabs(), TagHashtagsTab(), HOOK_TYPES, TagShortHooksTab(), TagTitlesTab(), shouldOpenEditor() (+3 more)

### Community 11 - "Graphify Tooling"
Cohesion: 0.20
Nodes (10): graphify Skill Definition, graphify Skill Trigger (slash command), Graphify Add URL and Watch Folder, Graphify Extra Exports and Benchmark, Graphify Extraction Subagent Prompt Spec, Graphify GitHub Clone and Cross-Repo Merge, Graphify Commit Hook and CLAUDE.md Integration, Graphify Query / Path / Explain Flow (+2 more)

### Community 12 - "App Navigation & Backup"
Cohesion: 0.31
Nodes (7): AppBackupControls(), AppMenu(), buildAppBackup(), downloadAppBackup(), LEGACY_KEYS, readLegacyData(), restoreAppBackup()

### Community 13 - "UI Icon Assets"
Cohesion: 0.29
Nodes (7): Bluesky Icon Symbol, Discord Icon Symbol, Documentation Icon Symbol, GitHub Icon Symbol, Icons SVG Sprite Sheet, Social / User Profile Icon Symbol, X (Twitter) Icon Symbol

### Community 15 - "Brand Assets"
Cohesion: 0.67
Nodes (3): App Favicon Icon, Lightning Bolt Shape, Purple Brand Color (#863bff)

## Knowledge Gaps
- **80 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ToggleButton()` connect `Generator Output & Saved Entries` to `Block System UI`, `App Shell & State Hooks`, `Generator Input & Tag Editor`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `IconButton()` connect `Block System UI` to `Project Settings`, `App Shell & State Hooks`, `Generator Input & Tag Editor`, `Tag Library`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Block System UI` be split into smaller, more focused modules?**
  _Cohesion score 0.058050645007166744 - nodes in this community are weakly interconnected._
- **Should `App Shell & State Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Should `Architecture Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.055051421657592255 - nodes in this community are weakly interconnected._
- **Should `Generator Output & Saved Entries` be split into smaller, more focused modules?**
  _Cohesion score 0.08421985815602837 - nodes in this community are weakly interconnected._