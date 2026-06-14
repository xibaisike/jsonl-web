import type { JsonlEntry, PromptGroup } from '../types';

export function buildPromptGroups(lines: JsonlEntry[]): PromptGroup[] {
  const groups: PromptGroup[] = [];
  let currentGroup: PromptGroup | null = null;

  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i];
    if (entry.type === 'user') {
      currentGroup = { user: entry, userIndex: i, children: [] };
      groups.push(currentGroup);
    } else if (currentGroup) {
      const isToolCall =
        entry.subtype === 'ui_telemetry' &&
        entry.systemPayload?.uiEvent?.['event.name'] === 'qwen-code.tool_call';
      const isSubagent =
        entry.subtype === 'ui_telemetry' &&
        (entry.systemPayload?.uiEvent?.['event.name'] ?? '').includes('subagent');

      if (entry.type === 'assistant' || entry.type === 'tool_result' || isToolCall || isSubagent) {
        currentGroup.children.push({ entry, index: i });
      }
    }
  }
  return groups;
}
