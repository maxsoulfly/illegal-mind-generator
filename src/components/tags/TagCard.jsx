import TagMapStatus from './TagMapStatus';
import TagPhraseList from './TagPhraseList';
import DescriptionMap from './DescriptionMap';

export default function TagCard({ tag, onToggleVisibility }) {
  return (
    <article
      className={`tag-card 
        ${tag.hasMissingMappings ? 'tag-issue' : ''}
        ${!tag.hasMissingMappings && tag.isUnused ? 'tag-unused' : ''}
        ${tag.isPopular ? 'tag-used' : ''}
      `}
    >
      <div className="tag-card-header">
        <div>
          <h3>{tag.label}</h3>
          <div className="tag-category">{tag.category} </div>
        </div>

        <span className="tag-usage">{tag.usageCount} saved</span>
        <span className="tag-status">
          {tag.hasMissingMappings ? 'Issue' : tag.isUnused ? 'Unused' : 'Used'}
        </span>
        {!tag.isVisible && <span className="tag-hidden">Hidden</span>}
      </div>

      <details>
        <TagMapStatus existsIn={tag.existsIn} />

        <summary>View details</summary>

        <div className="tag-phrases">
          <TagPhraseList title="Title" phrases={tag.maps.title} />
          <TagPhraseList title="Thumbnail" phrases={tag.maps.thumbnail} />
          <DescriptionMap description={tag.maps.description} />
          <button
            type="button"
            className="button-secondary tag-visibility-toggle"
            onClick={() => onToggleVisibility(tag.name, tag.isVisible)}
          >
            {tag.isVisible ? 'Hide from Generator' : 'Show in Generator'}
          </button>
        </div>
      </details>
    </article>
  );
}
