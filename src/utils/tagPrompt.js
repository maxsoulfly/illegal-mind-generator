// Builds a paste-into-an-AI-chat prompt requesting a full set of phrase
// pools for a brand-new transformation tag, and parses the AI's reply back
// into the exact shape updateTagOverride expects. Same build-prompt/
// parse-response pairing as searchQuery.js's missing-data round-trip, but
// for tag creation instead of saved-song metadata — this app is
// local-first/no-backend by design, so it never calls an AI itself.

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
    `I'm adding a new content tag called "${label}"${category ? ` (category: ${category})` : ''} to a YouTube cover-song generator. For each section below, reply with that exact section header on its own line, followed by one phrase per line (4-6 phrases per section). Skip a section entirely (omit the header) if it genuinely doesn't apply — don't invent filler.`,
    '',
    'Phrases may use {artist} and {song} as placeholders where natural (e.g. "{song} didn\'t need changing").',
    '',
    'TITLE:',
    '(short title-suffix phrases describing this style, e.g. "Melodic Hardcore Rework")',
    '',
    'THUMBNAIL:',
    '(short punchy thumbnail text, all caps works well)',
    '',
    'DESCRIPTION_TECHNICAL:',
    '(short technical-sounding description lines, e.g. "Structure: reworked.")',
    '',
    'DESCRIPTION_LOG:',
    '(short "log entry" style lines describing what was done)',
    '',
    'DESCRIPTION_STATUS:',
    '(short status-report style lines, e.g. "Deviation: Significant.")',
    '',
    'HASHTAGS:',
    '(one hashtag word per line, no # prefix, no spaces)',
    '',
  ];

  hookTypeEntries.forEach(([key, hookType]) => {
    lines.push(`SHORTHOOKS_${key.toUpperCase()}:`);
    lines.push(`(short-form video hook angle: ${hookType?.label || key})`);
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
    unrecognized: [],
  };

  const validHookKeys = new Set(Object.keys(shortHookTypes).map((k) => k.toUpperCase()));

  const lines = (text || '').split('\n').map((line) => line.trim());

  let currentSection = null;

  lines.forEach((line) => {
    if (!line) return;

    const header = normalizeHeader(line);
    if (header) {
      if (SECTION_FIELD_MAP[header]) {
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
    }
  });

  return result;
}
