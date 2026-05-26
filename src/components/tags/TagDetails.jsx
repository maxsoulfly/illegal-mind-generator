import TagMapStatus from './TagMapStatus';
import TagUsedSongList from './TagUsedSongList';

export default function TagDetails({ tag, onLoadEntry }) {
  return (
    <details className="tag-section">
      <summary>Tag info</summary>

      <div className="tag-editor-nested-section">
        <TagMapStatus existsIn={tag.existsIn} tag={tag} />

        <TagUsedSongList songs={tag.usedBySongs} onLoadEntry={onLoadEntry} />
      </div>
    </details>
  );
}
