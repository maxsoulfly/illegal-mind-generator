import TagMapStatus from './TagMapStatus';
import TagPhraseList from './TagPhraseList';
import DescriptionMap from './DescriptionMap';
import TagDetails from './TagDetails';
import TagEditor from './TagEditor';

export default function TagCard({
  tag,
  categories = [],
  onToggleVisibility,
  onUpdateTag,
}) {
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

      <TagDetails tag={tag} />
      
      <TagEditor
        tag={tag}
        categories={categories}
        onUpdateTag={onUpdateTag}
        onToggleVisibility={onToggleVisibility}
      />
    </article>
  );
}
