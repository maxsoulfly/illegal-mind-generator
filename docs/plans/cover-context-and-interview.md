# Cover Context field + Interview prompt + revised Cover-Specific Short Hooks prompt

**STATUS: APPROVED — NOT IMPLEMENTED (2026-09-06).**
Approval authorized documentation only. No code has been written. Build next session.

This file is the authoritative spec. It lives in the repo (git-tracked) so it is
available on every machine. All path references are repo-relative.

Related context: [../current-context.md](../current-context.md) ("In Progress"),
`CLAUDE.md` / `AGENTS.md` Current Focus (compact pointer entries).

---

## Next-session action (exact)

1. Re-read this file.
2. Check the next free migration number in `server/migrations/` (assumed `0008`
   at approval time; verify — do not hardcode from memory).
3. Start with **Step 1 (data layer)**: write the migration SQL + the
   `server/routes/savedEntries.js` / `server/savedEntryMerge.js` wiring. Present
   it, stop for review (step-by-step protocol — one step at a time).
4. Run `npm run migrate` **once** against the shared Neon `dev` branch (see
   "Migration is per-database, not per-PC" below).

Grouped step order: **1** data layer → **2** client lifecycle → **3** UI →
**4** interview prompt module → **5** cover-hooks prompt revision (+ mirror the
A/B test in the same commit) → **6** tests → **7** verification.

---

## Goal

Three connected pieces:

1. **Cover Context field** — an optional, manually-editable per-cover textarea
   holding the *real, factual* story behind one specific cover (why it was
   covered, memories, emotions, recording/arrangement/mix decisions,
   section-specific notes, anecdotes). Reusable context — not a hook, not a
   published description. Independent of description blocks (Illegal Mind's
   blocks carry fictional SIGNAL/wasteland lore, which must never be treated as
   evidence of a real recording event).
2. **Interview prompt button** — beside the textarea. Copies a paste-into-an-
   external-AI prompt that runs an adaptive, one-question-at-a-time interview to
   help the user *remember and articulate* the cover's story, then produces
   first-person editable prose to paste back into the textarea. External
   copy/paste only — no API, no in-app chat. Works independently of hook
   generation and never produces hooks.
3. **Revised Cover-Specific Short Hooks prompt** — consume the Cover Context
   field as the primary factual source, drop the forced 8–12 minimum, shift the
   objective from "compress the story" to "select worthwhile audience-facing
   angles", and define a zero-hook sentinel so explanatory prose can't leak into
   the bulk-add pool.

---

## Approved decisions

- **UI:** a dedicated collapsible **Cover Context** section, placed directly
  **above** the existing Cover-Specific Hooks section in the Generator Input
  form. Its own `panelVisibility.coverContext` (default `false`).
- **Persistence:** auto-persist for an already-saved entry, following the
  existing Cover-Specific Hooks pattern (`onBlur` → column-scoped
  `handleUpdateEntry(id, { coverContext })`). For a **new / unsaved** entry it is
  a no-op — the value rides `formData` and is written by the explicit **Save**
  (which creates the row). No implicit insert.
- **Interview prompt:** a standalone module (`src/utils/coverInterviewPrompt.js`),
  not an `authorPromptContexts.js` adapter (that file is scoped to "fresh
  candidate lines for one phrase pool"; the interview is a conversational-session
  setup with different output rules).
- **Interview input:** **exclude** existing `formData.coverShortHooks`. Include
  only an explicit allowlist of relevant fields (see Step 4).
- **No per-field reset button.** Clear Form already resets `coverContext` to `''`.
- **Examples:** the Cover-Specific Short Hooks prompt ships with **no
  illustrative examples**. Do not invent weak ones. (The previously drafted
  examples over-weighted recording-history/progress and one contradicted the
  Way Away simulation facts — dropped entirely.)
- **`NONE` sentinel is actively handled, not prompt-only.** When the AI's reply
  is the zero-hook sentinel `NONE`, the cover-hooks bulk-add path drops it (a
  line whose trimmed value is exactly `NONE`, case-insensitive), so a reply of
  just `NONE` adds zero hooks and is never saved as a hook. Scoped to
  `CoverShortHooksEditor.jsx` — no `TagPhraseEditor` change. See Step 3 item 12a
  and Step 5 rule 25.

---

## Migration is per-database, not per-PC

Per `docs/current-context.md`: both machines run a local Node/Express server, and
**both connect to the same shared remote Neon database, `dev` branch**. Therefore
the schema migration runs **once** (from either machine) and both PCs see the
`cover_context` column immediately. There is **no "run the migration on each PC"
step.** The only per-PC prerequisite is that `server/.env` exists on that machine
(a git-ignored file, already covered by the persistence plan —
`one-signal-many-terminals.md`), which is unrelated to this feature.

---

## Step 1 — Data layer: the `coverContext` field

New: `formData.coverContext` — an optional string. New DB column.

1. **`server/migrations/00NN_saved_entries_cover_context.sql`** (new; confirm
   `NN` = next free number at implementation time):
   ```sql
   ALTER TABLE saved_entries
     ADD COLUMN IF NOT EXISTS cover_context text NOT NULL DEFAULT '';
   ```
   Header comment: factual, reusable per-cover backstory; independent of
   description blocks; never shown in generated output; not backfilled or
   migrated from any existing field.
2. **`server/routes/savedEntries.js`:**
   - `rowToEntry`: add `coverContext: row.cover_context`.
   - `upsertEntry`: add `cover_context` to the INSERT column list, a new
     positional param, the `ON CONFLICT … DO UPDATE SET` list, and
     `entry.coverContext || ''` to the values array.
   - `PATCH /:id` needs no change — its `{ ...existing, ...updates, id }` spread
     already flows a column-scoped `{ coverContext }` patch through once
     `upsertEntry` / `rowToEntry` know the column.
3. **`server/savedEntryMerge.js`** — `mergeImportedEntry`: add
   `coverContext: preferNonEmpty(String(item.coverContext || '').trim(), existing?.coverContext)`
   (non-destructive, same shape as `customCta`). This covers Library JSON import
   (`POST /saved-entries/import`) and is the documented data-loss regression
   guard.

No `server/imports/00NN_*.js` script — there is no existing data to backfill; the
column default is `''`.

---

## Step 2 — Client lifecycle: form state, save / update / load / reset

4. **`src/constants/defaultFormData.js`** — add `coverContext: ''` next to
   `coverShortHooks`, with a one-line comment (factual reusable backstory; feeds
   the AI prompts only, never generation).
5. **`src/utils/savedEntries.js`:**
   - `buildEntryFromFormData` (SAVE): `coverContext: formData.coverContext?.trim() || ''`
   - `buildFormDataPatchFromEntry` (LOAD): `coverContext: entry.coverContext || ''`
6. **Auto-persist** — mirror `persistCoverHooks`:
   - `src/pages/GeneratorPage.jsx`: add
     `persistCoverContext = (value) => { if (isCurrentEntrySaved) handleUpdateEntry(currentEntryId, { coverContext: value }); }`,
     passed to `InputForm` as `onPersistCoverContext`.
   - Unsaved song → no-op; value rides `formData` → next explicit SAVE.
   - No new guard needed in `src/hooks/useInputFormLogic.js` — the `signalNumber`
     "only when non-empty" autofill guard (added 2026-09-03) already absorbs the
     `savedEntries` identity churn from `handleUpdateEntry`.
7. **Reset / Clear** — `handleClearForm` (`src/hooks/useAppShellState.js`) spreads
   `defaultFormData`, so `coverContext` resets to `''` for free. No per-field
   reset button.
8. **Backup / export / import** — no code beyond Steps 1, 3, 5:
   - Library export (`handleExportEntries`): entry objects already carry
     `coverContext` via `rowToEntry`.
   - Library import: covered by `mergeImportedEntry` (Step 3).
   - App backup (`src/utils/appBackup.js`): backs up only the localStorage blob
     (`ui` + `generator.formData`); `formData.coverContext` rides it
     automatically. No change.
   - Bulk add (Todo → `POST /saved-entries/bulk` → `upsertEntry`): writes `''`
     when unset.

### Textarea state model (amendment 6 — "latest content on click")

The Cover Context textarea must keep `formData.coverContext` **live on every
keystroke** (`value={formData.coverContext}` + `onChange` → `setFormData`), so
that **Copy Interview Prompt**, **Copy Hooks Prompt**, and **Save** all read the
just-typed text even when clicked immediately, before any blur.

The **DB write** still happens `onBlur` only (respects the "onBlur saves"
preference — that rule is about DB writes, not form state; artist/song already
work exactly this way: live in `formData`, DB write on explicit Save). So:

- `onChange` → `setFormData(prev => ({ ...prev, coverContext: e.target.value }))`
- `onBlur` → `onPersistCoverContext?.(formData.coverContext)` (no-op for an
  unsaved entry)
- Controlled `value`, so no `key={...}` remount trick is needed for external
  resets (load / Clear update `formData` directly).

---

## Step 3 — UI

9. **`src/components/input/CoverContextEditor.jsx`** (new):
   - `FormField` label **"Cover Context"** + a dim helper line: *"The real,
     factual story behind this cover — reasons, memories, recording/arrangement
     decisions. Not shown in any description. SIGNAL/wasteland text in
     description blocks is fiction; keep this factual."*
   - `<textarea className="form-input" rows={6}>`, controlled (`value` +
     `onChange` live, `onBlur` DB persist — see Step 2).
   - Actions row: `<CopyPromptButton getPrompt={() => buildCoverInterviewPrompt(formData, projectConfig)} label="Copy Interview Prompt" disabled={!artistAndSongSet} disabledTooltip="Enter an artist and song first" />`.
10. **`src/components/InputForm.jsx`** — a new collapsible section directly
    **above** the existing Cover-Specific Hooks section, wrapped in
    `.cover-context-section` (mirror `.cover-hooks-section`'s `margin-top`,
    `src/index.css`). Its own `ToggleButton` labeled `Cover Context`. Thread
    `onPersistCoverContext` alongside the existing `onPersistCoverHooks`.
11. **`src/hooks/useAppShellState.js`** — `defaultPanelVisibility`: add
    `coverContext: false`.
12. Threading: `App.jsx` → `GeneratorPage.jsx` → `InputForm.jsx` →
    `CoverContextEditor.jsx`. `panelVisibility.coverContext` flows through the
    existing `panelVisibility` prop.
12a. **`NONE` sentinel drop in the cover-hooks bulk-add path** (amendment —
    supports Step 5 rule 25). In `src/components/input/CoverShortHooksEditor.jsx`'s
    `handleUpdate`, sanitise `update.coverShortHooks` before it is applied /
    persisted: filter out any entry whose trimmed value is exactly `NONE`
    (case-insensitive). This covers bulk paste, single `+ Add`, and edit. A reply
    of just `NONE` therefore adds zero hooks and is never stored. Scoped to this
    one editor's adapter — no change to `TagPhraseEditor` and no effect on the
    ~15 Tag Editor call sites. Verify in Step 7: paste `NONE` alone → nothing
    added; paste a real list containing a stray `NONE` line → that line dropped,
    the rest added.

---

## Step 4 — Interview prompt module

13. **`src/utils/coverInterviewPrompt.js`** (new) →
    `buildCoverInterviewPrompt(formData, projectConfig)`. Standalone, one-way
    (no parse-back; the textarea is the return path). May reuse
    `buildAuthorPrompt` from `src/utils/authorPrompt.js` for section assembly.

**KNOWN — from the app** (each line omitted when its field is empty). Explicit
allowlist only — **no generic sweep of `songBlockOverrides`** (amendment 3):
- Channel / project context (`projectConfig.promptContext`), flagged *"channel
  style — not a fact about this recording"*.
- Artist, Song, Original release year, Original genre(s).
- Selected transformation tags (label + category) + the resolved transformation
  summary (`buildTagPhrase(formData, projectConfig)`), framed as *"how I've
  tagged this cover's style"*.
- Existing **Cover Context** (`formData.coverContext`) if non-empty — flagged
  *"what I've written so far — build on it, don't re-ask what it already
  covers"*.
- Existing notes, **named fields only**: `songBlockOverrides.storyBlock`,
  `songBlockOverrides.renovationBlock`, `songBlockOverrides.logBlock`, and the
  legacy `formData.customStory` / `formData.customLogNote` (same fallback pairing
  the cover-hooks prompt already uses). Flagged *"draft notes — some are
  factual, some may be in-universe SIGNAL fiction; use them as leads to ask
  about, not as confirmed facts"* (amendment 4 — not a blanket "all fiction"
  caveat).

**Excluded** (administrative / irrelevant): signal number, hashtags, artist
short name, `useCustomArtistShort`, video type, todo, `excludeFromRandomizer`,
`entryLoadToken`, and **`coverShortHooks`** (amendment: excluded).

**Fact vs lore** — one short paragraph, naming the channel: this channel
sometimes wraps covers in a fictional post-apocalyptic "SIGNAL" storyline; treat
any dramatic or in-universe line in the notes above as fiction unless I confirm
it; do not treat lore as evidence of a real recording event; do not invent
emotional interpretations or a dramatic story. (Reads sensibly for Maxx Dee,
which carries little/no lore.)

**Interview behavior** (preserve the simulation-validated behavior — near-verbatim
from the spec):
- Ask ONE question at a time, then wait for my answer.
- Adapt each question to my previous answers and to what is already known.
- Never ask me to repeat a fact already provided or shown above.
- Explore: why I chose this song; memories attached to it; what it means to me
  personally; emotions; and recording / arrangement / mix decisions where useful.
- No mandatory questionnaire; you do not have to cover every topic.
- No leading questions; do not invent feelings for me; do not treat lore as fact.
- Accept "I don't remember", simple / mundane motivations, and uncertainty as
  complete answers. Do not push for drama or a section-specific moment that isn't
  there. Do not force a dramatic story.
- Stop when you have enough useful material and offer to produce the context. I
  can also ask for the final context at any point.
- When I ask (or you propose it and I agree), output the final **Cover Context**
  as clear, editable, first-person prose — a few short paragraphs — preserving
  factual details, my subjective impressions, and emotional nuance, with no
  invented facts and no lore-as-fact. Plain paragraphs only: no headings, no
  bullets, nothing but the prose, so I can paste it straight into a textarea.
- Do NOT generate hooks, titles, or taglines at any point in this interview.

**Start:** "Begin now with your first question."

14. Wiring: the `CopyPromptButton` in `CoverContextEditor.jsx` (Step 9).
    Independent of the hooks prompt.

---

## Step 5 — Revise the Cover-Specific Short Hooks prompt

All changes in `coverShortHooksContext` (`src/utils/authorPromptContexts.js`).
**Every edited constant must be mirrored into `referenceBuildCoverHookPrompt` and
its constant copies in `src/utils/coverPrompt.test.js` in the same commit** — that
test is the A/B structural-equivalence guard (wrapper == inline reference).

15. **Cover Context as primary factual source.** New CONTEXT line, placed *first*
    among the factual lines (ahead of the existing-notes lines):
    `Cover context (factual — the personal & recording story behind THIS cover; the primary source of truth for anything specific): <coverContext>`.
    Omitted entirely when `coverContext` is blank.
16. **Existing notes: supplement, don't fictionalize** (amendment 4). Reframe the
    Story / Renovation / Log lines as `Existing notes (mixed — some factual, some
    may be in-universe SIGNAL fiction)`, with the rule:
    *"Cover context above is the primary source of truth. You may use clearly
    factual details from these existing notes to supplement it. Do not treat a
    fictional or ambiguous line as an established fact. Do not assume a note is
    fiction just because this channel uses lore."*
17. **Empty-context behavior.** Explicit: with no Cover context set, rely on the
    plainly factual fields (artist / song / original year / genre / tags) and
    only the unambiguously factual parts of the existing notes; never promote an
    ambiguous or lore line to a factual claim; returning fewer hooks — or none
    (see rule 25) — is correct.
18. **Drop the forced 8–12.** `COVER_TASK_BULLETS[0]`: "…a flat list of Short
    Hooks, one per line — as many as are genuinely strong and distinct. A handful
    of sharp ones beats a padded list; never invent filler to reach a number."
    Preserve the plain-line / no-numbering / no-headers / paste-into-bulk-add
    wording.
19. **Objective shift: select angles, not compress the story.** Remove "Compress
    a Story or Log idea down into a hook; do not summarize it." Add bullets:
    - Pick the few genuinely worth-saying angles from the context — a true detail
      is not automatically a good hook.
    - A hook earns its place only if it gives a viewer a concrete reason to
      watch: a specific curiosity the context supports, a recognizable feeling,
      or a musical detail someone would want to hear.
    - Don't turn one feeling into several reworded lines. Adding the song's name
      does not make a generic statement cover-specific.
    - Avoid abstract therapy/lore slogans and overblown drama.
    - Recording history, DAW/software upgrades, and personal-progress notes are
      useful context but rarely good hooks on their own — use one only if it
      genuinely intrigues.
20. **No invented performance/arrangement detail; no implied payoff.** Strengthen
    the no-invention bullet: do not imply a before/after comparison, a reveal, or
    a payoff unless the context explicitly says the video delivers it.
21. **Faithful + real changes coexist.** Note: a faithful cover can still have
    mentionable production or performance changes (re-recorded vocals, new drums,
    a new mix) — legitimate hook material when the context states them; "faithful"
    does not forbid naming them.
22. **Per-Short song-part scope.** A hook may be tied to a specific section (e.g.
    the chorus) only if the context supports it; never generalize a
    section-specific detail into a whole-song claim.
23. **Keep generic transformation hooks out** — existing bullet unchanged; the
    `{transformation}` ban unchanged; the tag/global system still owns those.
24. **No examples** (amendment 2). Remove `COVER_EXAMPLES` and
    `COVER_EXAMPLES_HEADING` from the assembled output entirely — the examples
    section must not appear at all (not just an empty heading). Mirror the
    removal in the test reference.
25. **Zero-supported-hook sentinel** (amendment 7). Add a rule to the prompt:
    *"If the context does not support even one worthwhile cover-specific hook,
    reply with exactly `NONE` on a single line and nothing else — no explanation,
    no apology, no placeholder line."*
    Rationale: the bulk-add box pastes lines verbatim; an explanatory sentence
    ("There isn't enough information…") would otherwise become a "hook".
    **This is not prompt-only — the cover-hooks bulk-add path must actively drop
    the sentinel** (see Step 3 item 12a): a line whose trimmed value is exactly
    `NONE` (case-insensitive) is removed before the array is written, so a reply
    of just `NONE` results in zero hooks added and is never saved as a hook.
    Paste-the-whole-reply stays the intended workflow; the user does not have to
    manually strip `NONE`.

Engine, `src/engine/hooks/generateShortHooks.js`, and the tag/global hook pools
are **untouched**. `coverContext` never enters generation — it only enriches the
prompt text.

---

## Step 6 — Tests

26. **`src/utils/coverPrompt.test.js`** — mirror every Step 5 wording change into
    `referenceBuildCoverHookPrompt` + its constant copies, same commit. New
    fixtures:
    - `coverContext` set → appears as the primary factual line, ahead of the
      existing-notes lines.
    - `coverContext` blank → that line omitted; the empty-context guidance
      (rule 17) present.
    - lore-heavy `storyBlock` + blank `coverContext` → the "mixed — some factual,
      some may be fiction" framing present; no `8-12` substring anywhere;
      `NONE` sentinel rule present.
    - no `COVER_EXAMPLES_HEADING` / examples block in any output.
    Update the sanity asserts accordingly.
27. **`src/utils/coverInterviewPrompt.test.js`** (new; rolldown + node, same
    runner pattern as the other prompt smoke tests). Assert:
    - artist / song / year / genre / tags present when set; omitted when empty.
    - "one question at a time", "do not generate hooks", and the channel-named
      fact-vs-lore caveat all present.
    - signal number / hashtags / artist short / `coverShortHooks` **absent**.
    - only the named `songBlockOverrides` keys (`storyBlock` / `renovationBlock` /
      `logBlock`) + legacy `customStory` / `customLogNote` are surfaced — a
      spurious extra override key is NOT swept in.
    - existing `coverContext` included with the "build on what's there" wording.
28. Re-run `authorPromptContexts.test.js` / `authorPrompt.test.js` /
    `tagPromptContext.test.js` — expected green and unchanged (cover is frozen
    separately by `coverPrompt.test.js`).

---

## Step 7 — Verification (focused; both channels)

1. **Migration:** run `npm run migrate` once against the shared Neon `dev`
   branch; confirm `\d saved_entries` shows `cover_context`. Confirm the second
   PC sees the column too **without** re-running (shared database).
2. **Persistence round-trip** (Illegal Mind + Maxx Dee):
   - Load a saved entry → type Cover Context → click elsewhere (blur) → reload →
     value persists (PATCH path).
   - Edit + explicit **Save** → reload → persists.
   - New unsaved song → type context → **Save** (creates the row) → reload →
     persists. Before Save, confirm nothing was written (no implicit insert).
   - Confirm `localStorage.generator.formData.coverContext` holds the value
     mid-session (app-backup blob path).
3. **Latest-content-on-click** (amendment 6): type text into the textarea and,
   **without clicking elsewhere first**, click each of — Copy Interview Prompt,
   Copy Hooks Prompt (in the adjacent Cover-Specific Hooks section), and Save —
   and confirm each one used the just-typed text (prompt clipboard contains it;
   Save persists it).
4. **Older entries / no `coverContext`:**
   - An entry created before the migration loads with an empty Cover Context
     field, no error; app behaves normally; saving it once writes `''`.
   - Import a pre-feature Library JSON (no `coverContext` key) → rows get `''`;
     every already-populated field (Todo status, hashtags, tags, song-block
     overrides) is untouched — the non-destructive-merge regression guard.
5. **Interview prompt contents** (both projects): with artist/song/tags/year/
   genre set → Copy Interview Prompt → inspect the clipboard text:
   - contains artist / song / year / genre / tags;
   - contains "one question at a time", "do not generate hooks", and the
     channel-named fact-vs-lore caveat;
   - does **not** contain signal number, hashtags, artist short, or any
     `coverShortHooks` line;
   - only the named story/renovation/log fields are surfaced (add a throwaway
     unrelated `songBlockOverrides` key and confirm it is NOT included);
   - with `coverContext` pre-filled, it is included with "build on what's there".
   - Sanity-check the caveat still reads fine for Maxx Dee.
6. **Cover-hooks prompt contents** (both projects): Copy AI Prompt from
   Cover-Specific Hooks with `coverContext` set →
   - Cover context appears as the primary factual source, ahead of the
     existing-notes lines;
   - no `8-12` wording; the new selection-criteria bullets present; the `NONE`
     sentinel rule present; no examples block;
   - existing notes framed as "mixed — some factual, some may be fiction".
   Then clear `coverContext` → the empty-context guidance appears; no note is
   treated as an established fact.
6a. **`NONE` sentinel drop** (Step 3 item 12a): in the Cover-Specific Hooks
   editor, bulk-paste a body that is exactly `NONE` → nothing is added, no hook
   stored, `formData.coverShortHooks` unchanged. Then bulk-paste a real list with
   a stray `NONE` line among real hooks → the `NONE` line is dropped, every real
   line added. Confirm a single `+ Add` of `NONE` is also dropped. Confirm the
   ~15 Tag Editor phrase editors are unaffected (a tag phrase literally `NONE`
   still saves there).
7. **Generation regression (randomization-aware)** (amendment 8): `coverContext`
   is **not** a `useGeneratedOutput` dependency. Verify by holding the generation
   seed constant (do **not** click Regenerate between the two reads): toggle
   `coverContext` between empty and filled and confirm the Titles / Short Hooks /
   Descriptions output does not change. If a comparison spans a Regenerate,
   expect different random picks and instead assert structurally: the `cover`
   hook group still draws only from `formData.coverShortHooks`, and the
   `coverContext` text never appears anywhere in generated output.
8. `eslint` + `vite build` clean (expect the 4 known pre-existing unrelated
   errors). Smoke tests: updated `coverPrompt.test.js` (A/B guard) + new
   `coverInterviewPrompt.test.js` + unchanged `authorPromptContexts.test.js` all
   pass.
9. **Manual quality comparison (future, not a metric):** feed the OLD vs NEW
   cover-hooks prompt — context = the Yellowcard — *Way Away* notes from the
   completed simulation — to the same external AI and compare the candidate
   lists by hand: fewer synonymous lines, less poetic filler, more concrete
   audience-facing angles, correct handling when the context genuinely supports
   nothing (`NONE`). **No click-through / performance claim is made or implied.**

---

## Simulation reference (Yellowcard — *Way Away*, interview validated)

The interview flow was tested manually and confirmed by the user to capture what
he feels. Four adaptive questions covered: (1) why he chose it, (2) what the
lyrics mean to him, (3) why he revisited the recording, (4) whether one section
or the overall result satisfied him. Confirmed facts from that run (kept here so
the future manual A/B comparison in Step 7.9 has real input):

- Loved the song's energy, motivational feeling, and lyrics for years; wanted to
  cover it but felt he lacked the skills, especially guitar.
- Recording it in November 2023 showed his guitar playing had improved — it now
  felt easy.
- The lyrics connect personally to continuing despite other people's opinions and
  the odds; he keeps making music because he loves it, even when it feels like
  almost nobody listens; music helps release pain, frustration, and negative
  thoughts, and singing this song helps express them.
- Kept the original guitars and bass. The old vocals were good but something felt
  off that he couldn't pinpoint; he re-recorded them and prefers the new
  performance. Redid the drums — they feel more alive to him.
- Used his then-new Cubase 14 and a new mastering program from the same company
  (name unconfirmed). The finished version feels punchier and more complete —
  **do not claim the software itself objectively caused that.**
- It was a **partial renovation, not a full re-recording.** Satisfaction is about
  the overall result, not a particular section.

Only the interview flow is validated. The revised hooks prompt is **not** yet
validated — Step 7.9 is the future manual check.

---

## Open item deferred to implementation

- Confirm the next free `server/migrations/` number (assumed `0008`).
