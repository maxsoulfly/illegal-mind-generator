import { useState } from 'react';

import IconButton from '../components/ui/IconButton';
import SubTabNav from '../components/ui/SubTabNav';
import FormSelect from '../components/ui/FormSelect';
import ToggleField from '../components/ui/ToggleField';
import ToggleInputRow from '../components/ui/ToggleInputRow';
import LabelInputRow from '../components/ui/LabelInputRow';
import LabelSliderRow from '../components/ui/LabelSliderRow';
import BlockInfoCard from '../components/ui/BlockInfoCard';
import MoveControls from '../components/ui/MoveControls';
import AddBulkRow from '../components/ui/AddBulkRow';
import NavLinkButton from '../components/ui/NavLinkButton';
import TemplateGroupCard from '../components/ui/TemplateGroupCard';
import PlaceholderField from '../components/ui/PlaceholderField';
import PhraseRow from '../components/ui/PhraseRow';
import BulkTextarea from '../components/ui/BulkTextarea';
import TagStatusChip from '../components/tags/TagStatusChip';
import ToggleButton from '../components/ui/ToggleButton';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children }) {
  return (
    <section className="uikit-section">
      <h2 className="uikit-section-title">{title}</h2>
      {description && <p className="uikit-section-desc">{description}</p>}
      <div className="uikit-section-body">{children}</div>
    </section>
  );
}

// ─── Component example block ──────────────────────────────────────────────────

function Example({ name, props, usage, children }) {
  return (
    <div className="uikit-example">
      <div className="uikit-example-header">
        <code className="uikit-example-name">{name}</code>
        {props && <span className="uikit-example-props">{props}</span>}
      </div>
      <div className="uikit-example-preview">{children}</div>
      {usage && <p className="uikit-example-usage">{usage}</p>}
    </div>
  );
}

// ─── UIKit page ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'tags', label: 'Tags & Chips' },
  { id: 'data', label: 'Data Displays' },
  { id: 'cards', label: 'Cards' },
];

export default function UIKitPage() {
  const [activeTab, setActiveTab] = useState('layout');

  // demo state
  const [sliderVal, setSliderVal] = useState(3);
  const [selectVal, setSelectVal] = useState('option1');
  const [toggleChecked, setToggleChecked] = useState(true);
  const [toggleInputChecked, setToggleInputChecked] = useState(false);
  const [toggleInputVal, setToggleInputVal] = useState('');
  const [labelInputVal, setLabelInputVal] = useState('');
  const [subTab, setSubTab] = useState('long');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkVal, setBulkVal] = useState('');
  const [phrases, setPhrases] = useState(['Phrase one', 'Phrase two']);
  const [templateExpanded, setTemplateExpanded] = useState(false);
  const [cardExpanded, setCardExpanded] = useState(false);

  return (
    <div className="app-shell uikit-page">
      <p className="uikit-intro">
        Living component catalog. Reuse these before creating anything new. Every
        pattern here exists in production — find it here first.
      </p>

      <SubTabNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── LAYOUT ── */}
      {activeTab === 'layout' && (
        <>
          <Section
            title="app-shell"
            description="Root page container. Max-width 1400px, centered, fluid padding. All pages live inside one .app-shell div."
          >
            <Example
              name=".app-shell"
              usage="Wrap every page root in this. Already applied on this page."
            >
              <div className="terminal-block" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                max-width: 1400px · centered · clamp padding
              </div>
            </Example>
          </Section>

          <Section
            title="layout-grid"
            description="Two-column grid used by the Generator page. Left col (inputs) 2fr, right col (output) 3fr."
          >
            <Example
              name=".layout-grid"
              usage="Use for generator-style left/right splits. Stacks to single column on mobile."
            >
              <div className="layout-grid" style={{ gap: '8px' }}>
                <div className="terminal-block" style={{ textAlign: 'center' }}>2fr — inputs</div>
                <div className="terminal-block" style={{ textAlign: 'center' }}>3fr — output</div>
              </div>
            </Example>
          </Section>

          <Section
            title="panel"
            description="Bordered, shadowed panel. Standard container for all major content blocks."
          >
            <Example
              name=".panel + .panel-title"
              usage="Use for any grouping of related controls. panel-title is the h2/h3 inside."
            >
              <div className="panel" style={{ marginTop: 0 }}>
                <h2 className="panel-title">Panel Title</h2>
                <p style={{ color: 'var(--color-text-soft)', margin: 0 }}>Panel content goes here.</p>
              </div>
            </Example>
          </Section>

          <Section
            title="terminal-block"
            description="Dark inset block for output rows, queue items, and saved entry rows."
          >
            <Example
              name=".terminal-block"
              usage="Output display, list items, queue rows. Not for inputs."
            >
              <div className="terminal-block">
                Output or read-only content sits in terminal-block.
              </div>
            </Example>
          </Section>

          <Section
            title="output-stack"
            description="Flex column with tight gap. Groups multiple terminal-block items in output panels."
          >
            <Example name=".output-stack" usage="Wrap a list of terminal-block rows.">
              <div className="output-stack">
                <div className="terminal-block">Item one</div>
                <div className="terminal-block">Item two</div>
                <div className="terminal-block">Item three</div>
              </div>
            </Example>
          </Section>

          <Section
            title="button-row"
            description="Flex row with gap and margin-top. Used wherever two or more secondary buttons sit side by side."
          >
            <Example name=".button-row" usage="Pair Add + Bulk buttons, Apply + Cancel, etc.">
              <div className="button-row" style={{ marginTop: 0 }}>
                <button className="button-secondary">Action A</button>
                <button className="button-secondary">Action B</button>
              </div>
            </Example>
          </Section>

          <Section title="SubTabNav" description="Underline-style sub-tab navigation. Used inside Project Settings and Description layout builder.">
            <Example
              name="SubTabNav"
              props="tabs[{id,label}] activeTab onTabChange className?"
              usage="Use for lightweight in-page sub-sections. Not the main AppMenu nav."
            >
              <SubTabNav
                tabs={[{ id: 'long', label: 'Long Description' }, { id: 'shorts', label: 'Shorts Description' }]}
                activeTab={subTab}
                onTabChange={setSubTab}
              />
              <div className="terminal-block" style={{ marginTop: 8 }}>Active: {subTab}</div>
            </Example>
          </Section>
        </>
      )}

      {/* ── INPUTS ── */}
      {activeTab === 'inputs' && (
        <>
          <Section title="PlaceholderField" description="Input or textarea with {placeholder} autocomplete. Typing '{' opens a dropdown of matching tokens. Two save modes: onBlur (default) or onChange (controlled).">
            <Example
              name="PlaceholderField"
              props="defaultValue onBlur? onChange? placeholders? multiline? rows? disabled? placeholder?"
              usage="Use whenever a field should support {artist}, {song}, {num}, or custom placeholders. Pass the relevant placeholder list from hookPlaceholders.js or define inline."
            >
              <PlaceholderField
                defaultValue=""
                placeholder="Type { to trigger autocomplete..."
                placeholders={['{artist}', '{song}', '{tagLine}']}
                onBlur={(v) => v}
              />
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 4 }}>
                Multiline variant uses multiline prop + rows prop.
              </p>
              <PlaceholderField
                multiline
                rows={3}
                defaultValue=""
                placeholder="Multiline with {placeholder} support..."
                placeholders={['{artist}', '{song}']}
                onBlur={(v) => v}
              />
            </Example>
          </Section>

          <Section title="LabelInputRow" description="Paired label + input in a tag-phrase-row flex layout. compact mode uses smaller padding.">
            <Example
              name="LabelInputRow"
              props="label value onChange placeholder compact?"
              usage="Settings fields where a fixed label lives left of an input. compact for tight sections."
            >
              <LabelInputRow
                label="Suffix"
                value={labelInputVal}
                onChange={setLabelInputVal}
                placeholder="e.g. (Cover)"
              />
              <LabelInputRow
                label="Compact"
                value={labelInputVal}
                onChange={setLabelInputVal}
                placeholder="compact mode"
                compact
              />
            </Example>
          </Section>

          <Section title="LabelSliderRow" description="Label + range slider + live value readout. Amber fill uses CSS --val custom property — always set it.">
            <Example
              name="LabelSliderRow"
              props="label value min max onChange"
              usage="Lines count sliders in Hook Block editors, any numeric preference. Always bind value/onChange."
            >
              <LabelSliderRow
                label="Lines"
                value={sliderVal}
                min={1}
                max={6}
                onChange={setSliderVal}
              />
            </Example>
          </Section>

          <Section title="ToggleField" description="Uncontrolled checkbox + label. Uses defaultChecked, not checked. Clicking the label toggles the checkbox.">
            <Example
              name="ToggleField"
              props="label checked onChange"
              usage="Settings toggles that don't need external state sync. If you need controlled behavior use ToggleInputRow instead."
            >
              <ToggleField
                label="Show hidden tags"
                checked={toggleChecked}
                onChange={setToggleChecked}
              />
            </Example>
          </Section>

          <Section title="ToggleInputRow" description="Checkbox + label + PlaceholderField in one row. Input is live-controlled (onChange mode). Clicking label toggles checkbox.">
            <Example
              name="ToggleInputRow"
              props="id label checked onToggle value onChange placeholder placeholders?"
              usage="Title prefix/suffix fields in Project Settings → Titles. Any 'enable + configure' pattern."
            >
              <ToggleInputRow
                id="demo-toggle-input"
                label="Custom prefix"
                checked={toggleInputChecked}
                onToggle={setToggleInputChecked}
                value={toggleInputVal}
                onChange={setToggleInputVal}
                placeholder="e.g. SIGNAL {num} ·"
                placeholders={['{num}']}
              />
            </Example>
          </Section>

          <Section title="FormSelect" description="Standard form-select dropdown. Stops click propagation by default — safe to put inside clickable card headers.">
            <Example
              name="FormSelect"
              props="value onChange options[{value,label}]"
              usage="Any dropdown inside a card header (scope, target, status selects). Stops propagation so clicking the select doesn't toggle the card."
            >
              <FormSelect
                value={selectVal}
                onChange={setSelectVal}
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
            </Example>
          </Section>

          <Section title="PhraseRow" description="Single editable phrase with delete button. Saves on blur. Highlighted prop scrolls to and visually marks the row after add.">
            <Example
              name="PhraseRow (forwardRef)"
              props="value onCommit onRemove highlighted? placeholders?"
              usage="Template list rows inside HookTemplateEditor. Always use via HookTemplateEditor — don't render PhraseRow directly in feature components."
            >
              {phrases.map((p, i) => (
                <PhraseRow
                  key={i}
                  value={p}
                  onCommit={(v) => {
                    const next = [...phrases];
                    next[i] = v;
                    setPhrases(next);
                  }}
                  onRemove={() => setPhrases(phrases.filter((_, j) => j !== i))}
                />
              ))}
            </Example>
          </Section>

          <Section title="BulkTextarea" description="Multiline textarea + Apply/Cancel for pasting multiple phrases at once. Shows after user clicks + Bulk.">
            <Example
              name="BulkTextarea"
              props="value onChange onApply onCancel placeholders?"
              usage="Always paired with AddBulkRow. Show/hide based on local state. One phrase per line, Apply splits on newline."
            >
              {showBulk ? (
                <BulkTextarea
                  value={bulkVal}
                  onChange={setBulkVal}
                  onApply={() => {
                    const lines = bulkVal.split('\n').map((l) => l.trim()).filter(Boolean);
                    setPhrases([...phrases, ...lines]);
                    setBulkVal('');
                    setShowBulk(false);
                  }}
                  onCancel={() => { setBulkVal(''); setShowBulk(false); }}
                />
              ) : (
                <AddBulkRow onAdd={() => setPhrases([...phrases, ''])} onBulk={() => setShowBulk(true)} />
              )}
            </Example>
          </Section>
        </>
      )}

      {/* ── BUTTONS ── */}
      {activeTab === 'buttons' && (
        <>
          <Section title="button-primary" description="Amber gradient. Use for the single most important action on a page (Generate, Save, Apply). One per view.">
            <Example name=".button-primary" usage="Generate button, Save entry, Import action.">
              <button className="button-primary">Generate</button>
            </Example>
          </Section>

          <Section title="button-secondary" description="Dark background, bordered. Default for all supporting actions — Reset, Delete, Export, Cancel, + Add.">
            <Example name=".button-secondary" usage="Everything that isn't the primary action. Most buttons in the app are this class.">
              <div className="button-row" style={{ marginTop: 0 }}>
                <button className="button-secondary">Export</button>
                <button className="button-secondary">Reset</button>
                <button className="button-secondary" disabled>Disabled</button>
              </div>
            </Example>
          </Section>

          <Section title="IconButton" description="Shell for every small action button. Default class is tag-reset-button (small, borderless). Pass button-secondary for a bordered look. onClick is optional.">
            <Example
              name="IconButton"
              props="icon title onClick? disabled? stopPropagation? className?"
              usage="Reset (↺), Remove (×), Move (↑↓), Lock (🔒), labeled buttons (+ Add, Apply, Cancel). className='button-secondary' for bordered variant."
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <IconButton icon="↺" title="Reset to defaults" onClick={() => {}} />
                <IconButton icon="×" title="Remove" onClick={() => {}} />
                <IconButton icon="🔒" title="Lock" onClick={() => {}} />
                <IconButton icon="+ Add" className="button-secondary" onClick={() => {}} />
                <IconButton icon="Apply" className="button-secondary" onClick={() => {}} />
                <IconButton icon="Cancel" className="button-secondary" onClick={() => {}} />
                <IconButton icon="×" className="button-secondary" onClick={() => {}} disabled />
              </div>
            </Example>
          </Section>

          <Section title="MoveControls" description="Up/down reorder pair built from two IconButtons. Automatically disables at list boundaries.">
            <Example
              name="MoveControls"
              props="disabledUp disabledDown onMoveUp onMoveDown className?"
              usage="Description block reordering. List item reordering in Block editors. Pass className for context-specific flex layout."
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <MoveControls disabledUp onMoveUp={() => {}} onMoveDown={() => {}} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>first item (up disabled)</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                <MoveControls onMoveUp={() => {}} onMoveDown={() => {}} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>middle item</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                <MoveControls disabledDown onMoveUp={() => {}} onMoveDown={() => {}} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>last item (down disabled)</span>
              </div>
            </Example>
          </Section>

          <Section title="AddBulkRow" description="+ Add and + Bulk side by side. Always shown below a phrase list, above BulkTextarea when expanded.">
            <Example
              name="AddBulkRow"
              props="onAdd onBulk"
              usage="Footer of every HookTemplateEditor list. Replace with BulkTextarea when showBulk is true."
            >
              <AddBulkRow onAdd={() => {}} onBulk={() => {}} />
            </Example>
          </Section>

          <Section title="ToggleButton" description="+ Show / − Hide toggle. compact mode shows just + Show / − Hide without the label.">
            <Example
              name="ToggleButton"
              props="isOpen onClick label compact?"
              usage="Expand/collapse secondary panels like Todo notes, saved library. compact for tight rows."
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <ToggleButton isOpen={false} label="Notes" onClick={() => {}} />
                <ToggleButton isOpen={true} label="Notes" onClick={() => {}} />
                <ToggleButton isOpen={false} label="Notes" compact onClick={() => {}} />
                <ToggleButton isOpen={true} label="Notes" compact onClick={() => {}} />
              </div>
            </Example>
          </Section>

          <Section title="copy-button" description="Compact copy-to-clipboard button. Gains .copied class temporarily after a successful copy.">
            <Example name=".copy-button" usage="Output panels: copy title, copy description, copy hashtags.">
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="copy-button">Copy</button>
                <button className="copy-button copied">Copied!</button>
              </div>
            </Example>
          </Section>

          <Section title="NavLinkButton" description="Inline clickable text — looks like body text, underlines on hover. Used to link generated output back to its source.">
            <Example
              name="NavLinkButton"
              props="onClick title muted?"
              usage="Source attribution in generated title pairs and short hook lists. muted for base hook sources (less prominent). Children are the display text."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <NavLinkButton title="Go to source tag" onClick={() => {}}>
                  Heavier — tag phrase
                </NavLinkButton>
                <NavLinkButton title="Go to base hook" onClick={() => {}} muted>
                  Base hook source (muted)
                </NavLinkButton>
              </div>
            </Example>
          </Section>
        </>
      )}

      {/* ── TAGS & CHIPS ── */}
      {activeTab === 'tags' && (
        <>
          <Section title="tag-chip" description="Pill-style toggle for transformation tag selection. Active state has amber gradient fill.">
            <Example
              name=".tag-chip / .tag-chip.active"
              usage="Tag selector in the Generator form. Each chip represents one transformation tag."
            >
              <div className="tag-list">
                <button className="tag-chip">Heavier</button>
                <button className="tag-chip active">Darker</button>
                <button className="tag-chip">Punk</button>
                <button className="tag-chip">Hebrew</button>
                <button className="tag-chip active">Slower</button>
              </div>
            </Example>
          </Section>

          <Section title="TagStatusChip" description="Inline colored badge showing a mapped/missing/custom state. Used in tag detail rows.">
            <Example
              name="TagStatusChip"
              props="label active? activeText? inactiveText? variant?"
              usage="Tag detail summaries — show if a tag has phrases, hashtags, thumbnail words. variant overrides the automatic mapped/missing class."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <TagStatusChip label="Phrases" active activeText="6" />
                <TagStatusChip label="Hashtags" active={false} />
                <TagStatusChip label="Thumbnails" active activeText="3" />
                <TagStatusChip label="Custom" active variant="migrated" activeText="✓" />
              </div>
            </Example>
          </Section>

          <Section title="tag-status" description="Inline count / status text. Used below collapsed card headers to show item counts.">
            <Example
              name=".tag-status"
              usage="Count badges: '6 phrases', '3 templates'. Sits inside a card body, not a header."
            >
              <span className="tag-status">6 phrases</span>
              {' '}
              <span className="tag-status">3 templates</span>
            </Example>
          </Section>

          <Section title="tag-card states" description="article.tag-card is the standard collapsible card. Modifier classes flag issues or popularity.">
            <Example
              name=".tag-card / .tag-issue / .tag-unused / .tag-used"
              usage="TagCard.jsx wraps these. Don't apply modifiers manually — they come from tag metadata (hasMissingMappings, isUnused, isPopular)."
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="terminal-block" style={{ padding: '4px 10px' }}>tag-card (normal)</span>
                <span className="terminal-block tag-issue" style={{ padding: '4px 10px' }}>tag-issue</span>
                <span className="terminal-block tag-unused" style={{ padding: '4px 10px' }}>tag-unused</span>
                <span className="terminal-block tag-used" style={{ padding: '4px 10px' }}>tag-used</span>
              </div>
            </Example>
          </Section>

          <Section title="radio-option" description="Styled radio input for video type / generation mode selection.">
            <Example
              name=".radio-option"
              usage="Video type selector in the Generator form (Long / Shorts). Wrap in .radio-group."
            >
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="demo-radio" defaultChecked />
                  Long
                </label>
                <label className="radio-option">
                  <input type="radio" name="demo-radio" />
                  Shorts
                </label>
              </div>
            </Example>
          </Section>
        </>
      )}

      {/* ── DATA DISPLAYS ── */}
      {activeTab === 'data' && (
        <>
          <Section title="saved-entry-row pattern" description="Flex row for saved library, todo, and shorts queue items. Use terminal-block + saved-entry-row together.">
            <Example
              name=".saved-entry-row.terminal-block"
              usage="All list item rows across SavedLibrary, ShortsQueue, and Todo pages. The signal number, clickable title, tags span, and action buttons follow the same layout."
            >
              <div className="saved-entry-row terminal-block">
                <div className="saved-entry-main">
                  <span className="saved-entry-signal">01.</span>
                  <button type="button" className="queue-entry-link saved-entry-text">
                    <strong>Metallica</strong> — Nothing Else Matters
                  </button>
                  <span className="saved-entry-tags">[Heavier, Darker]</span>
                </div>
                <div className="saved-entry-actions">
                  <IconButton icon="×" className="button-secondary" onClick={() => {}} />
                </div>
              </div>
              <div className="saved-entry-row terminal-block">
                <div className="saved-entry-main">
                  <span className="saved-entry-signal">02.</span>
                  <button type="button" className="queue-entry-link saved-entry-text">
                    <strong>Radiohead</strong> — Creep
                  </button>
                  <span className="saved-entry-hidden">[hidden]</span>
                </div>
                <div className="saved-entry-actions">
                  <IconButton icon="×" className="button-secondary" onClick={() => {}} />
                </div>
              </div>
            </Example>
          </Section>

          <Section title="form-group" description="Standard form field group with label above input. Use form-label + form-input/form-select/form-textarea.">
            <Example
              name=".form-group → .form-label + .form-input"
              usage="Generator input fields. Song name, artist name, signal number."
            >
              <div className="form-group">
                <label className="form-label">Artist</label>
                <input className="form-input" placeholder="e.g. Metallica" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows={3} placeholder="Song story notes..." />
              </div>
            </Example>
          </Section>

          <Section title="form-row" description="Side-by-side form fields. Wraps two or more .form-group divs in a flex row with equal width. Each child fills its slot; margin-bottom is cleared on the inner groups.">
            <Example
              name=".form-row > .form-group"
              usage="Signal Number + Year in BasicSongFields. Use when two short fields belong together and share horizontal space."
            >
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Signal Number</label>
                  <input className="form-input" placeholder="e.g. 042" />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" placeholder="e.g. 1983" />
                </div>
              </div>
            </Example>
          </Section>

          <Section title="output-item" description="Rendered output block. White-space pre-wrap, monospace. Copy button sits below.">
            <Example name=".output-item + .output-text" usage="Wrap generated description text in .output-item. Use .output-text for the pre-wrap paragraph.">
              <div className="output-item">
                <p className="output-text">SIGNAL 47 · NOTHING ELSE MATTERS
[STATUS: ACTIVE · TRANSFORMATION: DARKER · HEAVIER]

Broadcast from the ruins of a former concert hall...</p>
                <button className="copy-button">Copy</button>
              </div>
            </Example>
          </Section>

          <Section title="tag-phrase-row" description="Flex row for label + input or checkbox + input pairings. Used by LabelInputRow, ToggleInputRow, PhraseRow.">
            <Example
              name=".tag-phrase-row"
              usage="Don't use raw — LabelInputRow / ToggleInputRow / PhraseRow already apply it."
            >
              <div className="tag-phrase-row">
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  label-input-row and phrase-row both use this class
                </span>
              </div>
            </Example>
          </Section>

          <Section title="Color tokens" description="Key design tokens. Use CSS vars in inline styles or new CSS rules — never hardcode hex values.">
            <Example name="CSS custom properties" usage="Reference these in all new styles. Never use raw hex.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {[
                  ['--color-text-main', '#f3e6c8'],
                  ['--color-text-muted', '#d9b77a'],
                  ['--color-text-accent', '#ffcc73'],
                  ['--color-text-alert', '#c95a3a'],
                  ['--color-status-success', '#7bc47f'],
                  ['--color-bg-page', '#1a1714'],
                  ['--color-bg-input', '#16120f'],
                  ['--color-border-main', '#5a4632'],
                  ['--color-border-hover', '#ffb347'],
                  ['--color-accent-strong', '#c8843d'],
                ].map(([token, hex]) => (
                  <div key={token} className="terminal-block" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, background: `var(${token})`, border: '1px solid var(--color-border-soft)', borderRadius: 3, flexShrink: 0 }} />
                    <code style={{ fontSize: 11, color: 'var(--color-text-soft)' }}>{token}</code>
                  </div>
                ))}
              </div>
            </Example>
          </Section>
        </>
      )}

      {/* ── CARDS ── */}
      {activeTab === 'cards' && (
        <>
          <Section title="TemplateGroupCard" description="Collapsible card with label, template count, reset button, optional slider, and HookTemplateEditor inside. Base for hook phrase lists.">
            <Example
              name="TemplateGroupCard"
              props="label templates onUpdateTemplates onReset onRemove? highlightText? subtitle? countLabel? initialCollapsed? sliderConfig?"
              usage="Hook phrase editing cards in Project Settings → Shorts Hooks and Tag Library editors. ShortHookCard is a thin adapter over this."
            >
              <TemplateGroupCard
                label="Nostalgia Hook"
                subtitle="nostalgia"
                templates={['This hit different growing up...', 'The song that defined a generation.']}
                countLabel="phrases"
                onReset={() => {}}
                onUpdateTemplates={() => {}}
                initialCollapsed={!templateExpanded}
              />
              <button
                className="button-secondary"
                style={{ marginTop: 8 }}
                onClick={() => setTemplateExpanded((v) => !v)}
              >
                {templateExpanded ? 'Collapse' : 'Expand'} above
              </button>
            </Example>
          </Section>

          <Section title="BlockInfoCard" description="Non-editable card for description layout builder. Shows block label + optional nav arrow. Used in Available palette and Active Layout columns.">
            <Example
              name="BlockInfoCard"
              props="label onRemove? onNavigate?"
              usage="Descriptions tab layout columns. onNavigate makes the header a nav shortcut (→ arrow). Generated blocks omit onNavigate and are non-interactive."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <BlockInfoCard
                  label="Story Block"
                  onNavigate={() => {}}
                  onRemove={() => {}}
                />
                <BlockInfoCard
                  label="Tag Line (generated)"
                />
              </div>
            </Example>
          </Section>

          <Section title="tag-card pattern (manual)" description="The collapsible card shell used by TagCard and TemplateGroupCard. Copy this pattern when building a new collapsible card — or extend TemplateGroupCard if it fits.">
            <Example
              name="article.tag-card + .tag-card-header + .tag-card-toggle"
              usage="Any collapsible section in Tag Library or Project Settings. Use TemplateGroupCard to avoid hand-rolling this."
            >
              <article className={`tag-card${cardExpanded ? '' : ' tag-card--collapsed'}`}>
                <header className="tag-card-header">
                  <div className="tag-card-label-row">
                    <h3
                      className="tag-card-toggle"
                      onClick={() => setCardExpanded((v) => !v)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="tag-card-collapse-icon">{cardExpanded ? '▼' : '▶'}</span>
                      Card Label
                    </h3>
                    <IconButton icon="↺" title="Reset" onClick={() => {}} stopPropagation />
                  </div>
                </header>
                {cardExpanded && (
                  <div style={{ padding: '8px 0' }}>
                    <span className="tag-status">3 items</span>
                    <p style={{ color: 'var(--color-text-soft)', marginTop: 8 }}>Card body content here.</p>
                  </div>
                )}
              </article>
            </Example>
          </Section>
        </>
      )}
    </div>
  );
}
