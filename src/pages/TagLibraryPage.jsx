import { buildTagExplorerData } from '../utils/buildTagExplorerData';
import TagCard from '../components/tags/TagCard';

export default function TagLibraryPage({
  projectConfig,
  savedEntries,
  projectName,
}) {
  const tagData = buildTagExplorerData(projectConfig, savedEntries);

  return (
    <main>
      <h1 className="app-title">
        Tag Library — <span className="project-name">{projectName}</span>
      </h1>

      <div className="tag-library">
        {tagData.map((tag) => (
          <TagCard key={tag.name} tag={tag} />
        ))}
      </div>
    </main>
  );
}
