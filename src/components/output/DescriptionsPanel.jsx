import ToggleButton from '../ui/ToggleButton';
import OutputItem from '../ui/OutputItem';

function DescriptionsPanel({
  panelVisibility,
  togglePanel,
  videoType,
  descriptions,
  longDescription,
  renderCopyFooter,
  onNavigateToSettings,
}) {
  return (
    <div
      className={`panel ${panelVisibility.descriptions ? '' : 'panel-collapsed'}`}
    >
      <div className="panel-header">
        {onNavigateToSettings ? (
          <button type="button" className="panel-title panel-title--nav" onClick={() => onNavigateToSettings('descriptions')}>Descriptions</button>
        ) : (
          <h2 className="panel-title">Descriptions</h2>
        )}
        <ToggleButton
          isOpen={panelVisibility.descriptions}
          onClick={() => togglePanel('descriptions')}
          label="Descriptions"
          compact
        />
      </div>

      {panelVisibility.descriptions && (
        <div>
          {/* LONG */}
          {videoType === 'Long' && (
            <OutputItem
              text={longDescription}
              textClassName={undefined}
              textStyle={{ whiteSpace: 'pre-line' }}
              copyText={[longDescription, renderCopyFooter()].filter(Boolean).join('\n\n')}
            />
          )}

          {/* SHORTS */}
          {videoType === 'Shorts' &&
            descriptions.map((description, index) => (
              <OutputItem
                key={index}
                text={description}
                textClassName={undefined}
                textStyle={{ whiteSpace: 'pre-line' }}
                copyText={[description, renderCopyFooter()].filter(Boolean).join('\n\n')}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default DescriptionsPanel;
