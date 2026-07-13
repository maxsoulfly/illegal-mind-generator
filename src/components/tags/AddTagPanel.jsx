import { useState } from 'react';

import FormField from '../ui/FormField';
import { getTagCategories } from '../../utils/tagRegistry';
import { buildTagPrompt, parseTagResponse } from '../../utils/tagPrompt';

// Inline "+ Add tag" panel — lets a new tag be created with all its
// phrase pools pre-filled via an AI round-trip (Copy Prompt / Paste
// Response, same pattern as SavedLibrary's missing-data feature) instead
// of filling every Tag Editor tab by hand one phrase at a time. Pasting a
// response is optional — leaving the textarea empty still creates a tag
// with all-empty pools, same as the old window.prompt flow did.
export default function AddTagPanel({ projectConfig, onCreate, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [result, setResult] = useState(null);

  const categories = getTagCategories(projectConfig);
  const shortHookTypes = projectConfig?.shortHookTypes || {};

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildTagPrompt(name.trim(), category.trim(), shortHookTypes));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  const handleCreate = () => {
    const rawName = name.trim();
    if (!rawName) return;

    const tagName = rawName.toLowerCase();
    const parsed = pasteText.trim() ? parseTagResponse(pasteText, shortHookTypes) : null;

    onCreate(tagName, {
      label: rawName,
      category: category.trim() || 'custom',
      visible: true,
      isCustom: true,
      excludeFromHashtags: false,
      excludeFromButIts: false,
      title: parsed?.title || [],
      thumbnail: parsed?.thumbnail || [],
      description: parsed?.description || { technical: [], log: [], status: [] },
      hashtags: parsed?.hashtags || [],
      shortHooks: parsed?.shortHooks || {},
    });

    if (parsed) {
      const phraseCount =
        parsed.title.length +
        parsed.thumbnail.length +
        parsed.description.technical.length +
        parsed.description.log.length +
        parsed.description.status.length +
        parsed.hashtags.length +
        Object.values(parsed.shortHooks).reduce((sum, arr) => sum + arr.length, 0);

      setResult({ phraseCount, unrecognized: parsed.unrecognized });
    } else {
      setResult(null);
    }

    setName('');
    setCategory('');
    setPasteText('');
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Add Tag</h3>

      <FormField label="Name">
        <input
          className="form-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Melodic Hardcore"
        />
      </FormField>

      <FormField label="Category">
        <input
          className="form-input"
          type="text"
          list="add-tag-category-options"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="genre"
        />
        <datalist id="add-tag-category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </FormField>

      <div className="button-row">
        <button
          type="button"
          className="button-secondary"
          onClick={handleCopyPrompt}
          disabled={!name.trim()}
        >
          {promptCopied ? 'Copied ✔️' : 'Copy AI Prompt'}
        </button>
      </div>

      <FormField label="Paste AI Response (optional)">
        <textarea
          className="form-input"
          rows={6}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste the AI's reply here, or leave empty to create a blank tag..."
        />
      </FormField>

      <div className="button-row">
        <button
          type="button"
          className="button-primary"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          Create Tag
        </button>
        <button type="button" className="button-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>

      {result && (
        <p className="output-text">
          Added {result.phraseCount} phrase{result.phraseCount === 1 ? '' : 's'}.
          {result.unrecognized.length > 0 &&
            ` Unrecognized: ${result.unrecognized.join(' | ')}`}
        </p>
      )}
    </div>
  );
}
