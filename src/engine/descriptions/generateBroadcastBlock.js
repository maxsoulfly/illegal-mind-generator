import { fillPlaceholders, pickViableTemplate } from '../placeholders';
import { pickRandomLines } from './generateCustomBlocks';

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

  const resolvedStatus = combinedStatus.map((line) => ({ line, ...fillPlaceholders(line, ctx) }));
  const viableStatus = resolvedStatus.filter((r) => !r.hasEmpty);
  const statusPool = viableStatus.length > 0 ? viableStatus : resolvedStatus;
  const statusBlock = pickRandomLines(statusPool, Math.min(statusLineCount, statusPool.length))
    .map((r) => r.text)
    .join('\n');

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
