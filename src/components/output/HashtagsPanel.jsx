import { Fragment } from 'react';

import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';
import HashtagLink from './HashtagLink';

function HashtagsPanel({
  hashtags,
  panelVisibility,
  togglePanel,
  onNavigateToSettings,
  onOpenSourceTag,
  onOpenSourceHashtag,
  onOpenSongOverride,
}) {
  return (
    <CollapsiblePanel
      label="Hashtags"
      visible={panelVisibility.hashtags}
      onToggle={() => togglePanel('hashtags')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('hashtags') : undefined}
    >
      <OutputItem copyText={hashtags.map((entry) => entry.text).join(' ')}>
        {hashtags.map((entry, index) => (
          <Fragment key={index}>
            <HashtagLink
              entry={entry}
              onOpenSourceTag={onOpenSourceTag}
              onOpenSourceHashtag={onOpenSourceHashtag}
              onOpenSongOverride={onOpenSongOverride}
            />
            {index < hashtags.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </OutputItem>
    </CollapsiblePanel>
  );
}

export default HashtagsPanel;
