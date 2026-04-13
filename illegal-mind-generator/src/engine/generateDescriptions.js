export function generateDescriptions(formData) {
  return [
    `Recovered transmission: ${formData.artist} - ${formData.song}. Reconstructed under Signal ${formData.signalNumber}.`,
    `Archive log: This version of ${formData.song} by ${formData.artist} was rebuilt with a different weight and tone.`,
    `Signal reconstruction note: ${formData.song} has been reshaped for this Illegal Mind rework.`,
  ];
}
