# Graph Report - .  (2026-07-04)

## Corpus Check
- 185 files · ~93,740 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 624 nodes · 1209 edges · 49 communities (22 shown, 27 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.89)
- Token cost: 75,072 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Block Editor UI Components|Block Editor UI Components]]
- [[_COMMUNITY_Tag Editor & Text Block UI|Tag Editor & Text Block UI]]
- [[_COMMUNITY_Graphify Pipeline Steps & Rules|Graphify Pipeline Steps & Rules]]
- [[_COMMUNITY_Project Settings & Backup|Project Settings & Backup]]
- [[_COMMUNITY_Project Docs Current Focus & Block System|Project Docs: Current Focus & Block System]]
- [[_COMMUNITY_Hooks & Hashtags Engine|Hooks & Hashtags Engine]]
- [[_COMMUNITY_Generator Output Panels|Generator Output Panels]]
- [[_COMMUNITY_Tag-Category Placeholder Resolution|Tag-Category Placeholder Resolution]]
- [[_COMMUNITY_Core Architecture & Description Engine|Core Architecture & Description Engine]]
- [[_COMMUNITY_Generator Input Form|Generator Input Form]]
- [[_COMMUNITY_Tag Library Page & Hooks|Tag Library Page & Hooks]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Graphify Skill Reference Docs|Graphify Skill Reference Docs]]
- [[_COMMUNITY_ViteReact Build Tooling|Vite/React Build Tooling]]
- [[_COMMUNITY_TypeScriptESLint Template Boilerplate|TypeScript/ESLint Template Boilerplate]]
- [[_COMMUNITY_Legacy Tag Registry Migration|Legacy Tag Registry Migration]]
- [[_COMMUNITY_Project Overview Docs|Project Overview Docs]]
- [[_COMMUNITY_Early MVP Spec Docs|Early MVP Spec Docs]]
- [[_COMMUNITY_Hero Image Asset|Hero Image Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Shorts Description Engine|Shorts Description Engine]]
- [[_COMMUNITY_Thumbnail Engine|Thumbnail Engine]]
- [[_COMMUNITY_Generator Page|Generator Page]]
- [[_COMMUNITY_Project Settings Page|Project Settings Page]]
- [[_COMMUNITY_Shorts Queue Page|Shorts Queue Page]]
- [[_COMMUNITY_Tag Library Page|Tag Library Page]]
- [[_COMMUNITY_Todo Page|Todo Page]]
- [[_COMMUNITY_Config-Driven Architecture Principle|Config-Driven Architecture Principle]]
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
1. `IconButton()` - 24 edges
2. `Illegal Mind Generator Architecture Document` - 19 edges
3. `graphify SKILL.md (/graphify pipeline)` - 17 edges
4. `updateAppStorage()` - 15 edges
5. `generateDescriptions()` - 13 edges
6. `renderTextTemplate()` - 11 edges
7. `loadAppStorage()` - 11 edges
8. `Illegal Mind Generator Data Model Document` - 11 edges
9. `docs/current-context.md (developer handoff)` - 10 edges
10. `FormField()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AGENTS.md Current Focus: blocks with no nav target` --semantically_similar_to--> `Current Focus: tag-category placeholders, title polish, hook-block lines (2026-07-04)`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `AGENTS.md Priority TODO: storage cleanup` --semantically_similar_to--> `Priority TODO: storage-unification cleanup pass`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `AGENTS.md UI Primitives catalog` --semantically_similar_to--> `UI Primitives catalog (src/components/ui)`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `Known Issues: storage cleanup debt` --semantically_similar_to--> `Priority TODO: storage-unification cleanup pass`  [INFERRED] [semantically similar]
  docs/current-context.md → CLAUDE.md
- `Hook block Lines count only works via resolveHookBlockOutput` --semantically_similar_to--> `Hook blocks honor configured Lines count (generic fix)`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/current-context.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify build -> query -> update lifecycle** — graphify_skill_doc, references_extraction_spec_doc, references_query_doc, references_update_doc [INFERRED 0.85]
- **Project documentation set kept in sync (CLAUDE.md, AGENTS.md, current-context.md)** — claude_doc, agents_doc, docs_current_context_doc [INFERRED 0.85]
- **Generation Engine Pipeline (formData + resolvedProjectConfig → all outputs)** — docs_architecture_form_data, docs_architecture_resolved_project_config, docs_architecture_generate_short_hooks, docs_architecture_generate_titles, docs_architecture_generate_descriptions, docs_architecture_generate_hashtags, docs_architecture_generate_thumbnails [EXTRACTED 0.95]
- **Config Merge Pipeline (projects.json + tagOverrides + projectOverrides → resolvedProjectConfig)** — docs_architecture_projects_json, docs_architecture_use_tag_overrides, docs_architecture_use_project_overrides, docs_architecture_build_resolved_project_config, docs_architecture_resolved_project_config [EXTRACTED 0.95]
- **Shorts Queue id-reference storage fix across storage architecture and code** — claude_storage_architecture, docs_current_context_shorts_queue_id_refs, docs_current_context_useshortsqueue_js, docs_current_context_shortsqueuepage_jsx [INFERRED 0.85]

## Communities (49 total, 27 thin omitted)

### Community 0 - "App Shell & Navigation"
Cohesion: 0.06
Nodes (44): AppHeader(), PAGE_LABELS, InputForm(), defaultFormData, GeneratorResultsPanel(), defaultPanelVisibility, useAppShellState(), useGeneratedOutput() (+36 more)

### Community 1 - "Block Editor UI Components"
Cohesion: 0.08
Nodes (43): AddBlockForm(), AddTextBlockForm(), BlockActions(), BlockEditorCard(), KNOWN_BLOCK_META, LongDescriptionSettings(), MOBILE_COLUMN_TABS, KNOWN_SHORTS_BLOCK_META (+35 more)

### Community 2 - "Tag Editor & Text Block UI"
Cohesion: 0.06
Nodes (31): TextBlockEditor(), TagBasicsTab(), TagDescriptionsTab(), TAG_EDITOR_TABS, TagEditorTabs(), TagHashtagsTab(), HOOK_TYPES, TagShortHooksTab() (+23 more)

### Community 3 - "Graphify Pipeline Steps & Rules"
Cohesion: 0.05
Nodes (45): Step 5: label communities, Step 9: manifest + cumulative cost tracker, graphify SKILL.md (/graphify pipeline), Semantic extraction cache check (Step B0), Fast path for existing graph.json, Step 4: build graph, cluster, analyze, Honesty rules (never invent an edge), Step 6: Obsidian vault + HTML export (+37 more)

### Community 4 - "Project Settings & Backup"
Cohesion: 0.07
Nodes (25): AppBackupControls(), getProjectSettingsSectionSummary(), PROJECT_SETTING_SECTIONS, LinksRegistryEditor(), ProjectSettingsPage(), ProjectSettingsBlocks(), ProjectSettingsContent(), ProjectSettingsDescriptions() (+17 more)

### Community 5 - "Project Docs: Current Focus & Block System"
Cohesion: 0.07
Nodes (38): AGENTS.md Current Focus: blocks with no nav target, AGENTS.md (Illegal Mind Generator project instructions), AGENTS.md Priority TODO: storage cleanup, AGENTS.md UI Primitives catalog, Block label overrides (two separate override keys), Description Block Type System (List/Text/Hook/Generated), Current Focus: tag-category placeholders, title polish, hook-block lines (2026-07-04), CLAUDE.md (Illegal Mind Generator project instructions) (+30 more)

### Community 6 - "Hooks & Hashtags Engine"
Cohesion: 0.10
Nodes (29): resolveTagCategoryPlaceholders(), generateHashtags(), toHashtag(), createBaseHook(), createTagHook(), fillHookTemplate(), generateShortHooks(), pickOneGenre() (+21 more)

### Community 7 - "Generator Output Panels"
Cohesion: 0.12
Nodes (19): CopyButton(), DescriptionsPanel(), GeneratedTitle(), HashtagsPanel(), buildMixedShortHooks(), ShortHooksPanel(), shuffleArray(), formatHookType() (+11 more)

### Community 8 - "Tag-Category Placeholder Resolution"
Cohesion: 0.15
Nodes (28): buildTagLine(), buildTagPhrase(), pickRandom(), resolveTagCategoryValue(), resolveTagLabel(), TAG_CATEGORY_ALIASES, toTitleCase(), generateBroadcastBlock() (+20 more)

### Community 9 - "Core Architecture & Description Engine"
Cohesion: 0.10
Nodes (36): appBackup.js (export/import backup), App.jsx (root state coordinator), Illegal Mind Generator Architecture Document, customBlocks.js (shared block utilities), formData (generator form state), generateCustomBlocks.js (shared block rendering), generateDescriptions.js (Long description engine), generateHashtags.js (hashtag engine) (+28 more)

### Community 10 - "Generator Input Form"
Cohesion: 0.13
Nodes (16): EntrySettings(), BasicSongFields(), InputFormActions(), QueueSettings(), TransformationTagSelector(), TodoPage(), BulkSongEntry(), parseSongLines() (+8 more)

### Community 11 - "Tag Library Page & Hooks"
Cohesion: 0.12
Nodes (17): useInputFormLogic(), useTagLibraryData(), useTagOverrides(), TagLibraryPage(), TagCard(), TagDetails(), TagHeader(), TagMapStatus() (+9 more)

### Community 12 - "Package Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 13 - "Graphify Skill Reference Docs"
Cohesion: 0.20
Nodes (10): graphify Skill Definition, graphify Skill Trigger (slash command), Graphify Add URL and Watch Folder, Graphify Extra Exports and Benchmark, Graphify Extraction Subagent Prompt Spec, Graphify GitHub Clone and Cross-Repo Merge, Graphify Commit Hook and CLAUDE.md Integration, Graphify Query / Path / Explain Flow (+2 more)

### Community 14 - "Vite/React Build Tooling"
Cohesion: 0.22
Nodes (9): HMR (Hot Module Replacement), Oxc, @vitejs/plugin-react, @vitejs/plugin-react-swc, React, React Compiler, React Compiler not enabled due to dev/build performance impact, SWC (+1 more)

### Community 15 - "TypeScript/ESLint Template Boilerplate"
Cohesion: 0.67
Nodes (4): ESLint, TS template (create-vite template-react-ts), TypeScript, typescript-eslint

### Community 17 - "Project Overview Docs"
Cohesion: 0.67
Nodes (3): Generator Workflow (artist/song/tags → metadata output), Project Overview Document (onboarding guide), Tag System Overview (controls titles, descriptions, hooks, hashtags)

## Knowledge Gaps
- **117 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `IconButton()` connect `Block Editor UI Components` to `App Shell & Navigation`, `Tag Editor & Text Block UI`, `Tag Library Page & Hooks`, `Project Settings & Backup`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `graphify SKILL.md (/graphify pipeline)` connect `Graphify Pipeline Steps & Rules` to `Project Docs: Current Focus & Block System`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `isListBlock()` connect `Block Editor UI Components` to `Tag-Category Placeholder Resolution`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Block Editor UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07960199004975124 - nodes in this community are weakly interconnected._
- **Should `Tag Editor & Text Block UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._