export function generateTitles(formData, config) {
    const template = config.titleTemplates[0];

    const titles = config.transformations.slice(0, 5).map((t) => {
        return template
            .replace("{num}", formData.signalNumber || "XX")
            .replace("{artist}", formData.artist || "Artist")
            .replace("{song}", formData.song || "Song")
            .replace("{transformation}", t);
    });

    return titles;
}
