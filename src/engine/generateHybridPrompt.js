export function generateHybridPrompt(longDescription, hashtags) {
  return `${longDescription}\n\n---\n\n${hashtags}`;
}
