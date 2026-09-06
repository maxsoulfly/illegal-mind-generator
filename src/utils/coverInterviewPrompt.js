// Builds a paste-into-an-external-AI-chat prompt that runs an adaptive,
// one-question-at-a-time interview to help the user remember and articulate
// the real story behind ONE specific cover — independent of hook generation.
// No API integration, no parse-back: the app never calls an AI itself, and
// the user pastes the AI's final first-person prose back into the Cover
// Context textarea by hand, same one-way convention as coverPrompt.js /
// tagPrompt.js / calendarImportPrompt.js.
//
// Deliberately standalone — NOT an authorPromptContexts.js adapter. That
// file's adapters each produce a fresh batch of candidate lines for ONE
// phrase pool (hooks, titles, templates); this is a conversational-session
// setup with different output rules (prose, not a bulk-add list) and a
// different job (help recall a story, not generate marketing copy). It does
// reuse buildAuthorPrompt (authorPrompt.js) for section assembly, since that
// part — drop empty sections, join with a blank line — is generic.
//
// Input is an explicit allowlist, not a generic sweep of formData/overrides:
// channel context, artist/song/year/genre, selected tags + the resolved
// transformation summary, the existing Cover Context (if any), and only the
// named story/renovation/log draft notes (+ their legacy field fallbacks).
// Deliberately excluded: coverShortHooks (existing hooks would bias the
// interview toward summarizing them rather than surfacing new material),
// customCta, and every administrative/session field (signal number,
// hashtags, artist short name, video type, todo, excludeFromRandomizer,
// entryLoadToken) — none of it is part of "the story," and surfacing it
// would just invite the AI to reference it.

import { buildTagPhrase } from '../engine/descriptions/descriptionTagHelpers';
import { buildAuthorPrompt } from './authorPrompt';

function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) return trimmed;
  }
  return '';
}

// Exported for the AI Prompts settings editor (src/utils/aiPromptRegistry.js)
// — these are the "restore defaults" values. The editor's saved override is
// read via projectConfig.aiPromptOverrides.coverInterview below; see
// src/utils/aiPromptOverrides.js.
export const INTRO =
  "I want you to run an adaptive interview with me to help me remember and put into words the real story behind ONE specific cover-song video — why I made it, what it means to me, and any real recording or arrangement details worth keeping. This is separate from writing hooks, titles, or taglines; you will never be asked to produce those here, no matter what comes up in the conversation.";

export const FACT_VS_LORE =
  'This channel sometimes wraps a cover in a fictional post-apocalyptic "SIGNAL" storyline as part of its video descriptions, so the provided notes may mix real facts with invented lore. Don\'t assume something is fiction just because it sounds dramatic or emotional — a real experience can be described dramatically too. Ask about a detail only when it is ambiguous, contradictory, or reads as likely in-universe SIGNAL fiction (broadcast/signal/wasteland-style language) rather than something that actually happened. Never invent an emotional interpretation or a dramatic story of your own to fill a gap.';

export const INTERVIEW_BEHAVIOR_BULLETS = [
  "If little is known yet about why I covered this song, start broadly and don't assume a reason. If the context above already explains part of the motivation, don't re-ask it — open instead with a specific question about a real gap.",
  'Ask ONE question at a time, then wait for my answer before asking the next one.',
  "Adapt each question to what I've just said and to everything already known above — never ask me to repeat a fact you already have.",
  "A cover's real motivation can be almost anything: a riff, a groove, a melody, a vocal part, a particular sound, a memory, a personal challenge, an arrangement idea, or simply that I love the song. Don't assume lyrics, emotional struggles, personal growth, or re-recording are relevant — these are possible things to explore if my answers point that way, not required stages of the interview.",
  'Explore memories, reasons, emotions, and recording/arrangement/mix decisions only where it actually seems useful — skip anything that doesn\'t apply to this cover.',
  'Ask open, non-leading questions — don\'t phrase a question so it assumes an answer (for example, don\'t ask what made this "personally challenging" unless I\'ve already said it was).',
  'Accept uncertainty and simple answers as complete. If I say "I just love playing this song," that is a sufficient answer on its own — only ask a follow-up if what I said suggests there\'s something more worth asking about, never to manufacture a deeper reason that isn\'t there.',
  "Never invent feelings, a struggle, or a dramatic story for me. Treat a clearly factual detail in the provided notes as established, without asking about it again — only ask for clarification when something is ambiguous, contradictory, or reads as likely SIGNAL lore; dramatic or emotional wording alone is not a reason to doubt it.",
  'There is no fixed questionnaire — you do not have to cover every possible topic, and there is no required order or required kind of story.',
  'Stop asking questions once you have enough real material, and offer to write the final context. I can also ask for it myself at any point before that.',
  'When I ask for it (or you offer and I agree), write the final Cover Context as a few short first-person paragraphs — plain prose only, no headings, no bullet points, nothing but the paragraphs, so I can paste it straight into a textarea — preserving my actual meaning, the factual details, and my subjective impressions, without inventing anything I did not say.',
  'Never generate hooks, titles, or taglines at any point in this conversation — that happens elsewhere in the app.',
];

// Editable too, like everything above — it's prompt wording (a closing
// instruction to the external AI), not application control logic.
export const START_LINE = 'Begin now with your first question.';

export function buildCoverInterviewPrompt(formData = {}, projectConfig = {}) {
  // User-editable via the AI Prompts settings editor (Content Setup ->
  // Project). Falls back to the hardcoded defaults above when no override is
  // saved for this project, so unoverridden output stays byte-identical.
  const promptOverride = projectConfig?.aiPromptOverrides?.coverInterview;
  const intro = promptOverride?.intro ?? INTRO;
  const factVsLore = promptOverride?.factVsLore ?? FACT_VS_LORE;
  const behaviorBullets = promptOverride?.behaviorBullets ?? INTERVIEW_BEHAVIOR_BULLETS;
  const startLine = promptOverride?.closingInstruction ?? START_LINE;

  const artist = (formData.artist || '').trim();
  const song = (formData.song || '').trim();
  const overrides = formData.songBlockOverrides || {};

  const tagLines = (formData.transformationTags || []).map((tag) => {
    const tagConfig = projectConfig?.tags?.[tag] || {};
    const label = tagConfig.label || tag;
    return tagConfig.category ? `${label} (${tagConfig.category})` : label;
  });

  const transformationSummary = tagLines.length ? buildTagPhrase(formData, projectConfig) : '';

  const coverContext = (formData.coverContext || '').trim();
  const story = firstNonEmpty(overrides.storyBlock, formData.customStory);
  const renovation = firstNonEmpty(overrides.renovationBlock);
  const logNote = firstNonEmpty(overrides.logBlock, formData.customLogNote);

  const notesLines = [
    story ? `- Story: ${story}` : '',
    renovation ? `- Renovation / what changed: ${renovation}` : '',
    logNote ? `- Log / notes: ${logNote}` : '',
  ].filter(Boolean);

  const context = [
    projectConfig?.promptContext
      ? `Channel: ${projectConfig.promptContext} (channel style — not a fact about this specific recording)`
      : '',
    artist ? `Artist: ${artist}` : '',
    song ? `Song: ${song}` : '',
    formData.originalYear ? `Original release year: ${String(formData.originalYear).trim()}` : '',
    formData.originalGenre ? `Original genre(s): ${String(formData.originalGenre).trim()}` : '',
    tagLines.length ? `Selected tags (with category): ${tagLines.join(', ')}` : '',
    transformationSummary ? `How I've tagged this cover's style: ${transformationSummary}` : '',
    coverContext
      ? `What I've written so far about this cover (the primary source of truth — build on this, don't re-ask what it already covers): ${coverContext}`
      : '',
    notesLines.length
      ? [
          "Existing draft notes for this cover (clearly factual details here may be treated as established and used to supplement what's in Cover Context above — no need to ask about them again; ask about anything that is ambiguous, contradictory, or reads as likely in-universe SIGNAL fiction; dramatic or emotional wording alone does not mean it isn't real):",
          ...notesLines,
        ].join('\n')
      : '',
  ].filter(Boolean);

  return buildAuthorPrompt([
    intro,
    ['CONTEXT', ...context].join('\n'),
    factVsLore,
    ['INTERVIEW BEHAVIOR', ...behaviorBullets.map((bullet) => `- ${bullet}`)].join('\n'),
    startLine,
  ]);
}
