import projects from '../config/projects.json';

export const DEFAULT_PROJECT_KEY = Object.keys(projects)[0];

export const defaultFormData = {
  project: DEFAULT_PROJECT_KEY,
  // Immutable UUID of the saved entry currently loaded into the form, or null
  // for a brand-new unsaved song. Set on load, assigned once on first Save,
  // reset to null by Clear Form. This — not Artist+Song — is the identity the
  // Generator uses for "is this saved?", Cover Hooks/Context auto-persist,
  // Add to Calendar, and Save (a Save with a non-null id renames in place).
  id: null,
  artist: '',
  song: '',
  originalYear: '',
  originalGenre: '',
  signalNumber: '',
  videoType: 'Long',
  // Ephemeral, session-only counter — bumped whenever the form's entire
  // context is swapped (load a different entry, clear the form), so
  // useGeneratedOutput knows to regenerate even if nothing else it watches
  // (transformationTags) happens to differ from the previous song.
  entryLoadToken: 0,
  changesMade: '',
  extraVibeNote: '',
  transformationTags: [],
  useCustomArtistShort: false,
  artistShort: '',

  customHashtags: '',
  customCta: '',
  // Flat, uncategorized list of hooks unique to one specific cover — joins
  // the normal Short Hook candidate pool for the loaded cover (see
  // generateShortHooks.js). NOT the shelved Generation V2 composition engine.
  coverShortHooks: [],
  // Real, factual backstory for one specific cover (reasons, memories,
  // recording/arrangement decisions) — feeds the Interview and Cover-Specific
  // Hooks AI prompts only; never enters generation or shown output.
  coverContext: '',
  songBlockOverrides: {},
  excludeFromRandomizer: false,
  todo: {
    status: '',
    notes: '',
  },
};
