import CopyButton from '../CopyButton';
import NavLinkButton from '../ui/NavLinkButton';

function TitleNavLink({
  titleText,
  sourceHook,
  sourceTemplate,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
}) {
  const label = titleText;

  if (sourceHook?.sourceType === 'tag') {
    return (
      <NavLinkButton
        title={`${sourceHook.sourceTag} (${sourceHook.hookType}): "${sourceHook.sourceText}"`}
        onClick={() =>
          onOpenSourceTag?.({
            tagName: sourceHook.sourceTag,
            hookType: sourceHook.hookType,
            hookText: sourceHook.sourceText,
          })
        }
      >
        {label}
      </NavLinkButton>
    );
  }

  if (sourceHook?.sourceType === 'base') {
    return (
      <NavLinkButton
        title={`Project preset (${sourceHook.hookType}): "${sourceHook.sourceText}"`}
        onClick={() =>
          onOpenSourceHook?.({
            hookType: sourceHook.hookType,
            sourceText: sourceHook.sourceText,
          })
        }
      >
        {label}
      </NavLinkButton>
    );
  }

  if (sourceTemplate) {
    return (
      <NavLinkButton
        muted
        title={`Template: ${sourceTemplate.template} (${sourceTemplate.groupName})`}
        onClick={() =>
          onOpenSourceTemplate?.({
            groupName: sourceTemplate.groupName,
            template: sourceTemplate.template,
          })
        }
      >
        {label}
      </NavLinkButton>
    );
  }

  return <p className="generated-pair-text"> {titleText} </p>;
}

function GeneratedTitle({
  title,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
}) {
  const titleText = title.text;
  const sourceHook = title.sourceHook;
  const sourceTemplate = title.sourceTemplate;

  return (
    <div className="generated-pair terminal-block">
      <div className="generated-pair-row">
        <TitleNavLink
          titleText={titleText}
          sourceHook={sourceHook}
          sourceTemplate={sourceTemplate}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenSourceTemplate={onOpenSourceTemplate}
        />
        <CopyButton text={titleText} />
      </div>
    </div>
  );
}

export default GeneratedTitle;
