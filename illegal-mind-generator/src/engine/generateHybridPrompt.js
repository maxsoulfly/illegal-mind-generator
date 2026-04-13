export function generateHybridPrompt(
  formData,
  titles,
  thumbnails,
  descriptions,
  hashtags,
) {
  return `Refine the following YouTube content for the Illegal Mind project.

Keep the structure and tone controlled.
Do not reinvent the format.
Improve only the descriptions and hashtags so they sound more human, stronger, and less generic.

Project: ${formData.project}
Artist: ${formData.artist}
Song: ${formData.song}
Signal Number: ${formData.signalNumber}
Video Type: ${formData.videoType}
Changes Made: ${formData.changesMade}
Extra Vibe Note: ${formData.extraVibeNote}

Titles:
${titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

Thumbnail Text:
${thumbnails.map((thumbnail, index) => `${index + 1}. ${thumbnail}`).join('\n')}

Descriptions:
${descriptions.map((description, index) => `${index + 1}. ${description}`).join('\n')}

Hashtags:
${hashtags}`;
}
