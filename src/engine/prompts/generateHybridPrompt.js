export function generateHybridPrompt(longDescription, hashtags, fileId) {
  return `${longDescription}\n\n/// FILE ${fileId}: ${hashtags}`;
}
