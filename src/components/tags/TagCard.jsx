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
        <h3>{tag.name}</h3>
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
