// Builds a paste-into-an-AI-chat prompt requesting a full set of phrase
// pools for a brand-new transformation tag, and parses the AI's reply back
// into the exact shape updateTagOverride expects. Same build-prompt/
// parse-response pairing as searchQuery.js's missing-data round-trip, but
// for tag creation instead of saved-song metadata — this app is
// local-first/no-backend by design, so it never calls an AI itself.
//
// Brought in line with the shared "Copy AI Prompt" authoring system
// (authorPromptContexts.js) 2026-09-03: generates the tag's promptContext
// ("What this tag means"), asks for much shorter TITLE / Short Hook entries,
// forbids invented facts, and applies the placeholder rules (no
// {transformation}, {primaryTag} is type-unsafe, no placeholder quota).

const SECTION_FIELD_MAP = {
  TITLE: 'title',
  THUMBNAIL: 'thumbnail',
  DESCRIPTION_TECHNICAL: 'description.technical',
  DESCRIPTION_LOG: 'description.log',
  DESCRIPTION_STATUS: 'description.status',
  HASHTAGS: 'hashtags',
};

export function buildTagPrompt(label, category, shortHookTypes = {}) {
  const hookTypeEntries = Object.entries(shortHookTypes);

  const lines = [
    `I'm adding a new content tag called "${label}"${category ? ` (category: ${category})` : ''} to a YouTube cover-song generator. Reply with each section header below on its own line, then one entry per line. Give as many good entries as a section genuinely supports — a few is fine; never pad to a number with filler or forced synonyms. Omit a section's header entirely if it doesn't apply.`,
    '',
    `Every entry must be SPECIFIC to "${label}" — name an actual sonic / genre / scene trait (instrumentation, production, vocal style, song structure, scene culture) so it wouldn't make sense reused for a different tag. Reject vague lines that name no real trait, e.g. "Pure ${label} energy", "Heavier heart", "Sing it loud".`,
    '',
    `You only know what the tag MEANS. You do NOT know anything about any specific cover, the creator's musical history, the recording or production process, or how any particular song was arranged. Never write an entry that asserts such a fact — "It took me {years} to get riffs this tight against programmed drums" and "${label} taught me to treat percussion like part of the riff" are both inventions. If a Short Hook angle — especially Musician or Progress — cannot be filled with true, tag-specific lines without inventing facts, omit that whole section. Skipping is correct.`,
    '',
    'PLACEHOLDERS: some entries can use {tokens} the app fills in at generation time. Use one only where it genuinely fits and reads naturally — never to hit a quota, and an entry with no placeholder is fine.',
    '- Do NOT use {transformation} — it only produces repetitive "{song} + connector + {transformation}" lines.',
    '- {primaryTag} is NOT type-safe: it becomes whichever tag is first for a given cover, which may be a genre, a tempo word, an adjective, a mood, a language or an era — so never put it in a slot that assumes a type ("goes {primaryTag}", "a {primaryTag} version").',
    '- When you need a word of a specific kind, use a typed token where its type actually fits: {tags.genre}, {tags.energy}, {tags.tempo}, {tags.mood}, {tags.production}, {tags.era}, {tags.lang}. Each resolves to nothing (and the line is dropped) when no tag of that category is selected, so only use one where the line is pointless without it.',
    '- {artist}, {song}, {year}, {years}, {decade}, {currentYear} are always safe.',
    '',
    'PROMPT_CONTEXT:',
    `(One or two sentences defining what "${label}" actually means AND what it does NOT necessarily imply — tempo, vocal style, arrangement, era, etc. This is saved as the tag's definition and used to steer future AI prompts. Example: "Industrial metal combines heavy guitar riffing with mechanical rhythms, programmed or electronic percussion and industrial textures; emphasise a rigid, machine-like groove without assuming a specific tempo, vocal style, or arrangement unless stated.")`,
    '',
    'TITLE:',
    `(very compact fragments that name this style — ideally 1-3 words, e.g. "Industrial", "Machine Metal", "${label}". These are reusable pieces dropped into a title, not full titles. Only add ones that read well.)`,
    '',
    'THUMBNAIL:',
    `(short punchy thumbnail text naming this specific style, all caps works well, e.g. "${label.toUpperCase()}")`,
    '',
    'DESCRIPTION_TECHNICAL:',
    `(short technical-sounding lines naming what actually changes musically for ${label}, e.g. "Arrangement: rebuilt around breakdowns and gang vocals.")`,
    '',
    'DESCRIPTION_LOG:',
    `(short "log entry" style lines describing what was done, specific to ${label})`,
    '',
    'DESCRIPTION_STATUS:',
    '(short status-report style lines, e.g. "Deviation: Significant.")',
    '',
    'HASHTAGS:',
    '(one hashtag word per line, no # prefix, no spaces)',
    '',
    `SHORT HOOKS (the SHORTHOOKS_* sections): each is a single line read aloud as a short-form-video hook and also mixed into a title, so keep each one roughly 5-12 words, natural to say, and title-ready. Let the specificity come from ONE meaningful trait of "${label}" per line — do not cram several genre characteristics into one hook. Too long / stuffed: "{decade} nostalgia, now running through distorted guitars and mechanical percussion". Good: "{decade} riffs with a machine pulse". Each SHORTHOOKS_* section names its angle and shows 1-2 real in-app examples — match the angle's THEME, not the exact wording; if a shown example uses {transformation} or {primaryTag}, follow its theme but not that token.`,
    '',
  ];

  hookTypeEntries.forEach(([key, hookType]) => {
    const examples = (hookType?.templates || []).slice(0, 2);
    lines.push(`SHORTHOOKS_${key.toUpperCase()}:`);
    lines.push(
      examples.length > 0
        ? `(angle: ${hookType?.label || key} — theme reference: ${examples.map((e) => `"${e}"`).join(' / ')})`
        : `(short-form video hook angle: ${hookType?.label || key})`,
    );
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

const normalizeHeader = (line) => {
  const match = line.trim().match(/^([A-Za-z_]+):\s*$/);
  return match ? match[1].toUpperCase() : null;
};

function getFieldArray(result, path) {
  return path.split('.').reduce((acc, key) => acc[key], result);
}

export function parseTagResponse(text, shortHookTypes = {}) {
  const result = {
    title: [],
    thumbnail: [],
    description: { technical: [], log: [], status: [] },
    hashtags: [],
    shortHooks: {},
    // "What this tag means (for AI prompts)" — a single string, saved as the
    // tag's promptContext. Absent in older responses -> stays ''.
    promptContext: '',
    unrecognized: [],
  };

  const validHookKeys = new Set(Object.keys(shortHookTypes).map((k) => k.toUpperCase()));

  const lines = (text || '').split('\n').map((line) => line.trim());

  let currentSection = null;

  lines.forEach((line) => {
    if (!line) return;

    // Tolerate an inline "PROMPT_CONTEXT: <definition>" (AIs often put a
    // one-sentence value right after a label). A parenthetical — the
    // prompt's own hint pasted back — opens the section but is not stored.
    const inlineContext = line.match(/^PROMPT_CONTEXT:\s*(.+)$/i);
    if (inlineContext) {
      currentSection = { type: 'text', key: 'promptContext' };
      const seed = inlineContext[1].trim();
      if (!(seed.startsWith('(') && seed.endsWith(')'))) {
        result.promptContext = seed;
      }
      return;
    }

    const header = normalizeHeader(line);
    if (header) {
      if (header === 'PROMPT_CONTEXT') {
        currentSection = { type: 'text', key: 'promptContext' };
      } else if (SECTION_FIELD_MAP[header]) {
        currentSection = { type: 'field', path: SECTION_FIELD_MAP[header] };
      } else if (header.startsWith('SHORTHOOKS_') && validHookKeys.has(header.slice('SHORTHOOKS_'.length))) {
        currentSection = { type: 'hook', key: header.slice('SHORTHOOKS_'.length).toLowerCase() };
      } else {
        currentSection = null;
        result.unrecognized.push(line);
      }
      return;
    }

    // A stray "(...)" hint line left in place by the user pasting the
    // prompt's own placeholder text back — skip, not real content.
    if (line.startsWith('(') && line.endsWith(')')) return;

    if (!currentSection) {
      result.unrecognized.push(line);
      return;
    }

    if (currentSection.type === 'field') {
      if (currentSection.path === 'hashtags') {
        line.split(',').map((part) => part.trim().replace(/^#/, '')).filter(Boolean)
          .forEach((tag) => result.hashtags.push(tag));
      } else {
        getFieldArray(result, currentSection.path).push(line);
      }
    } else if (currentSection.type === 'hook') {
      if (!result.shortHooks[currentSection.key]) result.shortHooks[currentSection.key] = [];
      result.shortHooks[currentSection.key].push(line);
    } else if (currentSection.type === 'text') {
      result[currentSection.key] = result[currentSection.key]
        ? `${result[currentSection.key]} ${line}`
        : line;
    }
  });

  result.promptContext = result.promptContext.trim();

  return result;
}
