import TagMapStatus from './TagMapStatus';
import TagPhraseList from './TagPhraseList';
import DescriptionMap from './DescriptionMap';

export default function TagDetails({ tag }) {
  return (
    <details className="tag-section">
      <summary>View details</summary>

      <TagMapStatus existsIn={tag.existsIn} />

      <div className="tag-phrases">
        <TagPhraseList title="Title" phrases={tag.maps.title} />
        <TagPhraseList title="Thumbnail" phrases={tag.maps.thumbnail} />
        <DescriptionMap description={tag.maps.description} />
      </div>
    </details>
  );
}
