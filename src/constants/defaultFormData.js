import projects from '../config/projects.json';

export const DEFAULT_PROJECT_KEY = Object.keys(projects)[0];

export const defaultFormData = {
  project: DEFAULT_PROJECT_KEY,
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
  songBlockOverrides: {},
  excludeFromRandomizer: false,
  todo: {
    status: '',
    notes: '',
  },
};
