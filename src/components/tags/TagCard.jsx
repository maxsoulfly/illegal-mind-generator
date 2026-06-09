import TagDetails from './TagDetails';
// import TagEditor from './TagEditor';
import TagEditor from './TagEditorV2';
import TagHeader from './TagHeader';

export default function TagCard({
  tag,
  categories = [],
  onToggleVisibility,
  onUpdateTag,
  projectOverrides,
  resetTagOverride,
  onLoadEntry,
  sourceTarget,
}) {
  return (
    <article
      className={`tag-card 
        ${tag.hasMissingMappings ? 'tag-issue' : ''}
        ${!tag.hasMissingMappings && tag.isUnused ? 'tag-unused' : ''}
        ${tag.isPopular ? 'tag-used' : ''}
      `}
    >
      <TagHeader
        tag={tag}
        resetTagOverride={resetTagOverride}
        projectOverrides={projectOverrides}
      />

      <TagDetails tag={tag} onLoadEntry={onLoadEntry} />

      <TagEditor
        tag={tag}
        categories={categories}
        onUpdateTag={onUpdateTag}
        onToggleVisibility={onToggleVisibility}
        projectOverrides={projectOverrides}
        resetTagOverride={resetTagOverride}
        sourceTarget={sourceTarget}
      />
    </article>
  );
}
