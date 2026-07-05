import CopyButton from '../CopyButton';

// Shared output-item shape: generated text + a CopyButton. textClassName/textStyle
// let callers opt out of the default .output-text styling (see DescriptionsPanel,
// which intentionally uses inline pre-line instead of the monospace pre-wrap default).
export default function OutputItem({ text, textClassName = 'output-text', textStyle, copyText, children }) {
  return (
    <div className="output-item terminal-block">
      <p className={textClassName} style={textStyle}>{children ?? text}</p>
      <CopyButton text={copyText ?? text} />
    </div>
  );
}
