import { buildTagExplorerData } from '../utils/buildTagExplorerData';

export default function TagLibraryPage({
  projectConfig,
  savedEntries,
  projectName,
}) {
  const tagData = buildTagExplorerData(projectConfig, savedEntries);

  return (
    <main className="panel">
      <h1 className="app-title">
        Tag Library — <span className="project-name">{projectName}</span>
      </h1>

      <div className="tag-library">
        {tagData.map((tag) => (
          <article
            className={`tag-card 
                            ${tag.hasMissingMappings ? 'tag-warning' : ''}
                            ${tag.isUnused ? 'tag-unused' : ''}
                            ${tag.isPopular ? 'tag-popular' : ''}
                        `}
          >
            <div className="tag-card-header">
              <h3>{tag.name}</h3>
              <span className="tag-usage">{tag.usageCount} saved</span>
            </div>

            <details>
              <div className="tag-map-status">
                <span className={tag.existsIn.title ? 'mapped' : 'missing'}>
                  Title: {tag.existsIn.title ? '✓' : '—'}
                </span>

                <span className={tag.existsIn.thumbnail ? 'mapped' : 'missing'}>
                  Thumbnail: {tag.existsIn.thumbnail ? '✓' : '—'}
                </span>

                <span
                  className={tag.existsIn.description ? 'mapped' : 'missing'}
                >
                  Description: {tag.existsIn.description ? '✓' : '—'}
                </span>
              </div>
              <summary>View details</summary>

              <div className="tag-phrases">
                <h4>Title</h4>
                {tag.maps.title.length > 0 ? (
                  <ul>
                    {tag.maps.title.map((phrase) => (
                      <li key={phrase}>{phrase}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No title phrases.</p>
                )}

                <h4>Thumbnail</h4>
                {tag.maps.thumbnail.length > 0 ? (
                  <ul>
                    {tag.maps.thumbnail.map((phrase) => (
                      <li key={phrase}>{phrase}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No thumbnail phrases.</p>
                )}

                <h4>Description</h4>

                {tag.maps.description ? (
                  <div className="description-map">
                    {Object.entries(tag.maps.description).map(
                      ([groupName, phrases]) => (
                        <div key={groupName}>
                          <strong>{groupName}</strong>

                          <ul>
                            {phrases.map((phrase) => (
                              <li key={phrase}>{phrase}</li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p>No description phrases.</p>
                )}
              </div>
            </details>
          </article>
        ))}
      </div>
    </main>
  );
}
