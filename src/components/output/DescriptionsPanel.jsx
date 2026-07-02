import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

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
    <CollapsiblePanel
      label="Descriptions"
      visible={panelVisibility.descriptions}
      onToggle={() => togglePanel('descriptions')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('descriptions') : undefined}
    >
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
    </CollapsiblePanel>
  );
}

export default DescriptionsPanel;
