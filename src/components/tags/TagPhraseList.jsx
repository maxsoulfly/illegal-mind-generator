export default function TagPhraseList({ title, phrases }) {
  return (
    <>
      <h4>{title}</h4>

      {phrases.length > 0 ? (
        <ul>
          {phrases.map((phrase) => (
            <li key={phrase}>{phrase}</li>
          ))}
        </ul>
      ) : (
        <p>No {title.toLowerCase()} phrases.</p>
      )}
    </>
  );
}
