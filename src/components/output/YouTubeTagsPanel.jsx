import { Fragment } from 'react';

import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';
import HashtagLink from './HashtagLink';

function YouTubeTagsPanel({
  youtubeTags,
  panelVisibility,
  togglePanel,
  onNavigateToSettings,
  onOpenSourceTag,
  onOpenSourceHashtag,
  onOpenSongOverride,
}) {
  return (
    <CollapsiblePanel
      label="YouTube Tags"
      visible={panelVisibility.youtubeTags}
      onToggle={() => togglePanel('youtubeTags')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('hashtags') : undefined}
    >
      <OutputItem copyText={youtubeTags.map((entry) => entry.text).join(', ')}>
        {youtubeTags.map((entry, index) => (
          <Fragment key={index}>
            <HashtagLink
              entry={entry}
              onOpenSourceTag={onOpenSourceTag}
              onOpenSourceHashtag={onOpenSourceHashtag}
              onOpenSongOverride={onOpenSongOverride}
            />
            {index < youtubeTags.length - 1 ? ', ' : ''}
          </Fragment>
        ))}
      </OutputItem>
    </CollapsiblePanel>
  );
}

export default YouTubeTagsPanel;
