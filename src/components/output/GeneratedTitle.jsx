import CopyButton from '../CopyButton';
import NavLinkButton from '../ui/NavLinkButton';

function TitleNavLink({
  titleText,
  sourceHook,
  sourceTemplate,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
  onOpenCoverHook,
}) {
  const label = titleText;

  if (sourceHook?.sourceType === 'cover') {
    return (
      <NavLinkButton
        title={`Cover-specific hook: "${sourceHook.sourceText}"`}
        onClick={() => onOpenCoverHook?.({ hookText: sourceHook.sourceText })}
      >
        {label}
      </NavLinkButton>
    );
  }

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
  onOpenCoverHook,
  uppercase,
}) {
  const titleText = uppercase ? title.text.toUpperCase() : title.text;
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
          onOpenCoverHook={onOpenCoverHook}
        />
        <CopyButton text={titleText} />
      </div>
    </div>
  );
}

export default GeneratedTitle;
