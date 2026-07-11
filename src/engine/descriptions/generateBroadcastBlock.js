import { fillPlaceholders, pickViableTemplate } from '../placeholders';
import { resolvePooledOutput } from '../pooling';

export function generateBroadcastBlock(formData, projectConfig, selectedTags) {
  const tagRegistry = projectConfig?.tags || {};
  const ctx = { formData, projectConfig };

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  const operatorStatuses = projectConfig?.description.operatorStatuses || [];
  const operatorStatus = pickViableTemplate(operatorStatuses, ctx)?.text || 'unstable cycle';

  const fileCore =
    (formData.song || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('') || 'SIG';

  const fileId = `${fileCore}-${formData.signalNumber || '00'}`;

  const tagStatusLines = selectedTags.flatMap(
    (tag) => getDescriptionTag(tag).status || [],
  );

  const baseStatusLines =
    projectConfig?.description.templates?.long?.statusLines || [];

  const combinedStatus = [...tagStatusLines, ...baseStatusLines];

  const statusLineCount =
    projectConfig?.description?.hookBlockCounts?.statusLines ??
    projectConfig?.description?.statusLineCount ??
    2;

  const statusBlock = resolvePooledOutput(combinedStatus, ctx, fillPlaceholders, { count: statusLineCount })?.text ?? '';

  const broadcastPicked = pickViableTemplate(
    projectConfig?.description.templates?.long?.broadcastHeader || [],
    ctx,
  );

  const broadcastHeader = (broadcastPicked?.text || '')
    .replace(/\{fileId\}/g, fileId)
    .replace(/\{operatorStatus\}/g, operatorStatus);

  const broadcastBlock = [broadcastHeader, statusBlock]
    .filter(Boolean)
    .join('\n');

  return {
    broadcastBlock,
    fileId,
  };
}
