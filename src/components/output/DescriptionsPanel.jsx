import { Fragment } from 'react';

import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

// Mirrors GeneratedTitle/ThumbnailsPanel's inline nav-link pattern: branch on
// the segment's source shape, fall back to plain (non-interactive) text when
// there's nothing to navigate to.
function DescriptionLineLink({ segment, onOpenSourceTag, onOpenSourceHook, onOpenBlocksEditor }) {
  const { text, source } = segment;

  if (source?.type === 'block') {
    return (
      <span
        className="description-line-link"
        onClick={() =>
          onOpenBlocksEditor?.({
            subTab: source.blockType === 'hook' ? 'hooks' : source.blockType,
            blockKey: source.blockKey,
          })
        }
      >
        {text}
      </span>
    );
  }

  if (source?.sourceType === 'tag') {
    return (
      <span
        className="description-line-link"
        onClick={() =>
          onOpenSourceTag?.({
            tagName: source.sourceTag,
            hookType: source.hookType,
            hookText: source.sourceText,
          })
        }
      >
        {text}
      </span>
    );
  }

  if (source?.sourceType === 'base') {
    return (
      <span
        className="description-line-link"
        onClick={() => onOpenSourceHook?.({ hookType: source.hookType, sourceText: source.sourceText })}
      >
        {text}
      </span>
    );
  }

  return <span>{text}</span>;
}

function DescriptionsPanel({
  panelVisibility,
  togglePanel,
  videoType,
  descriptions,
  descriptionSegments,
  longDescription,
  renderCopyFooter,
  onNavigateToSettings,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenBlocksEditor,
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
          descriptions.map((description, index) => {
            const segments = descriptionSegments?.[index];

            return (
              <OutputItem
                key={index}
                textClassName={undefined}
                textStyle={{ whiteSpace: 'pre-line' }}
                copyText={[description, renderCopyFooter()].filter(Boolean).join('\n\n')}
              >
                {segments
                  ? segments.map((segment, segIndex) => (
                      <Fragment key={segIndex}>
                        {segIndex > 0 && '\n'}
                        <DescriptionLineLink
                          segment={segment}
                          onOpenSourceTag={onOpenSourceTag}
                          onOpenSourceHook={onOpenSourceHook}
                          onOpenBlocksEditor={onOpenBlocksEditor}
                        />
                      </Fragment>
                    ))
                  : description}
              </OutputItem>
            );
          })}
      </div>
    </CollapsiblePanel>
  );
}

export default DescriptionsPanel;
