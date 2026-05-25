import TagStatusChip from './TagStatusChip';

export default function TagMapStatus({ existsIn, tag }) {
  return (
    <div className="tag-map-status">
      <TagStatusChip label="Title" active={existsIn.title} />
      <TagStatusChip label="Thumbnail" active={existsIn.thumbnail} />
      <TagStatusChip label="Description" active={existsIn.description} />

      {tag?.excludeFromHashtags && (
        <TagStatusChip label="No hashtags" variant="mapped" />
      )}
    </div>
  );
}
