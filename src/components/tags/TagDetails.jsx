import TagMapStatus from './TagMapStatus';
import TagPhraseList from './TagPhraseList';
import DescriptionMap from './DescriptionMap';

export default function TagDetails({ tag }) {
  return (
    <details className="tag-section">
      <summary>Tag info</summary>

      <TagMapStatus existsIn={tag.existsIn} tag={tag} />
    </details>
  );
}
