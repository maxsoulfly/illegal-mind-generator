import TagMapStatus from './TagMapStatus';
import TagPhraseList from './TagPhraseList';
import DescriptionMap from './DescriptionMap';

export default function TagCard({ tag }) {
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
          {tag.isRegistryDriven && (
            <span className="tag-badge migrated">Registry</span>
          )}
          <div className="tag-category">{tag.category}</div>
        </div>

        <span className="tag-usage">{tag.usageCount} saved</span>
        <span className="tag-status">
          {tag.hasMissingMappings ? 'Issue' : tag.isUnused ? 'Unused' : 'Used'}
        </span>
      </div>

      <details>
        <TagMapStatus existsIn={tag.existsIn} />

        <summary>View details</summary>

        <div className="tag-phrases">
          <TagPhraseList title="Title" phrases={tag.maps.title} />
          <TagPhraseList title="Thumbnail" phrases={tag.maps.thumbnail} />
          <DescriptionMap description={tag.maps.description} />
        </div>
      </details>
    </article>
  );
}
