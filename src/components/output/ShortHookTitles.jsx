import CopyButton from '../CopyButton';

function ShortHookTitles({ title, hooks }) {
  return (
    <div className="generated-pair terminal-block">
      <h3 className="saved-entry-signal">{title}</h3>

      {hooks.map((hook, index) => (
        <div key={index} className="generated-pair-row">
          <p className="generated-pair-text">{hook}</p>

          <CopyButton text={hook} />
        </div>
      ))}
    </div>
  );
}

export default ShortHookTitles;
