// The single extension point for the AI Prompts settings editor
// (AiPromptsSettings.jsx). Each entry describes one editable prompt: its
// user-facing label, the real builder function used for the "Full Prompt
// Preview," an ordered list of editable fields (each backed by a real
// exported constant from the prompt's own module — no literal text
// duplicated here), and a small sample formData fixture used for the preview
// when no real song is loaded in the Generator.
//
// Adding prompt 3-6 later (tag short hooks, global short hook types, title
// template pools, hook blocks) is adding another entry here — the editor
// component and the clipboard copy/parse logic are both generic over
// `fields` and need no changes.
//
// `type: 'paragraph'` fields are a single block of free text; `type: 'list'`
// fields are one item per line (no bullet dash needed when editing — the
// real builder adds "- " when assembling the actual prompt). Every field
// across every registered prompt is one of these two types on purpose, which
// keeps aiPromptClipboard.js's copy/paste logic simple and fully generic.

import { buildCoverHookPrompt } from './coverPrompt';
import { COVER_INTRO, COVER_TASK_BULLETS } from './authorPromptContexts';
import {
  buildCoverInterviewPrompt,
  INTRO as COVER_INTERVIEW_INTRO,
  FACT_VS_LORE,
  INTERVIEW_BEHAVIOR_BULLETS,
  START_LINE,
} from './coverInterviewPrompt';

export const AI_PROMPTS = [
  {
    id: 'coverHooks',
    label: 'Cover-Specific Short Hooks',
    buildFullPrompt: buildCoverHookPrompt,
    fields: [
      { key: 'intro', label: 'Introduction', type: 'paragraph', default: COVER_INTRO },
      { key: 'taskBullets', label: 'Task Rules', type: 'list', default: COVER_TASK_BULLETS },
    ],
    sampleFormData: {
      artist: 'Sample Artist',
      song: 'Sample Song',
      originalYear: '1999',
      originalGenre: 'Sample Genre',
      transformationTags: [],
      coverContext: 'Sample cover context — this is where your real story would appear.',
    },
  },
  {
    id: 'coverInterview',
    label: 'Cover Interview',
    buildFullPrompt: buildCoverInterviewPrompt,
    fields: [
      { key: 'intro', label: 'Introduction', type: 'paragraph', default: COVER_INTERVIEW_INTRO },
      { key: 'factVsLore', label: 'Fact vs. Lore Framing', type: 'paragraph', default: FACT_VS_LORE },
      { key: 'behaviorBullets', label: 'Interview Behavior', type: 'list', default: INTERVIEW_BEHAVIOR_BULLETS },
      { key: 'closingInstruction', label: 'Closing Instruction', type: 'paragraph', default: START_LINE },
    ],
    sampleFormData: {
      artist: 'Sample Artist',
      song: 'Sample Song',
    },
  },
];

export function getPromptDef(promptId) {
  return AI_PROMPTS.find((p) => p.id === promptId) || null;
}
