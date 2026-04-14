function CopyButton({ text }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <button className="copy-button" onClick={handleCopy}>
      Copy
    </button>
  );
}

export default CopyButton;
