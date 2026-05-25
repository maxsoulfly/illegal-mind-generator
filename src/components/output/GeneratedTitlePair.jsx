import CopyButton from '../CopyButton';

function GeneratedTitlePair({ title, thumbnail }) {
  return (
    <div className="generated-pair terminal-block">
      <div className="generated-pair-row">
        <p className="generated-pair-text">
          <strong className="saved-entry-signal">Title:</strong>{' '}
          {title}
        </p>

        <CopyButton text={title} />
      </div>

      <div className="generated-pair-row">
        <p className="generated-pair-text">
          <strong className="saved-entry-signal">Thumb:</strong>{' '}
          {thumbnail}
        </p>

        <CopyButton text={thumbnail} />
      </div>
    </div>
  );
}

export default GeneratedTitlePair;