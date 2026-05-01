export default function DescriptionMap({ description }) {
  return (
    <>
      <h4>Description</h4>

      {description ? (
        <div className="description-map">
          {Object.entries(description).map(([groupName, phrases]) => (
            <div className="description-map-group" key={groupName}>
              <strong>{groupName}</strong>

              <ul>
                {phrases.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No description phrases.</p>
      )}
    </>
  );
}
