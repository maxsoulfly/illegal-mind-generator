import projects from '../config/projects.json';

export const DEFAULT_PROJECT_KEY = Object.keys(projects)[0];

export const defaultFormData = {
  project: DEFAULT_PROJECT_KEY,
  artist: '',
  song: '',
  signalNumber: '',
  videoType: 'Long',
  changesMade: '',
  extraVibeNote: '',
  transformationTags: [],
  useCustomArtistShort: false,
  artistShort: '',

  customStory: '',
  customLogNote: '',
  customGear: '',
  customHashtags: '',
  customCta: '',
  excludeFromRandomizer: false,
  todo: {
    status: '',
    notes: '',
  },
};
