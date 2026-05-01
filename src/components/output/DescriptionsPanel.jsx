import CopyButton from '../CopyButton';
import ToggleButton from '../ToggleButton';

function DescriptionsPanel({
  panelVisibility,
  togglePanel,
  videoType,
  descriptions,
  longDescription,
  renderCopyFooter,
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Descriptions</h2>
      </div>
      <ToggleButton
        isOpen={panelVisibility.descriptions}
        onClick={() => togglePanel('descriptions')}
        label="Descriptions"
      />

      {panelVisibility.descriptions && (
        <div>
          {/* LONG */}
          {videoType === 'Long' && (
            <div className="output-item terminal-block">
              <p style={{ whiteSpace: 'pre-line' }}>{longDescription}</p>
              <CopyButton
                text={[longDescription, renderCopyFooter()]
                  .filter(Boolean)
                  .join('\n\n')}
              />
            </div>
          )}

          {/* SHORTS */}
          {videoType === 'Shorts' &&
            descriptions.map((description, index) => (
              <div key={index} className="output-item terminal-block">
                <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                <CopyButton
                  text={[description, renderCopyFooter()]
                    .filter(Boolean)
                    .join('\n\n')}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default DescriptionsPanel;
