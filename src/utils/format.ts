import type { JsonlEntry } from '../types';

export function formatTime(ts: string | undefined): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return String(ts);
  }
}

export function getPreview(entry: JsonlEntry): string {
  const type = entry.type;
  let preview = '';

  if (type === 'user') {
    preview = entry.message?.parts?.[0]?.text ?? entry.message?.content ?? '';
  } else if (type === 'assistant') {
    const parts = entry.message?.parts ?? [];
    for (const part of parts) {
      if (part.text) { preview = part.text; break; }
      if (part.thought) { preview = '[thinking]'; break; }
      if (part.functionCall) { preview = part.functionCall.name; break; }
    }
  } else if (type === 'tool_result') {
    const result = entry.toolCallResult ?? entry.tool_result ?? {};
    preview = result.name ?? entry.toolName ?? 'tool';
  } else if (type === 'system' && entry.subtype === 'ui_telemetry') {
    const uiEvent = entry.systemPayload?.uiEvent;
    if (uiEvent) {
      const eventName = uiEvent['event.name'] ?? '';
      if (eventName === 'qwen-code.tool_call') {
        preview = (uiEvent.function_name as string) ?? 'tool call';
      } else if (eventName.includes('subagent')) {
        preview = eventName;
      }
    }
  }

  if (preview && preview.length > 60) preview = preview.slice(0, 60) + '...';
  return preview || '';
}

export type EntryIconKey = 'user' | 'assistant' | 'tool' | 'system';

export function getEntryIconKey(entry: JsonlEntry): EntryIconKey {
  const type = entry.type;
  if (type === 'user') return 'user';
  if (type === 'assistant') return 'assistant';
  if (type === 'tool_result') return 'tool';
  if (type === 'system' && entry.subtype === 'ui_telemetry') {
    const uiEvent = entry.systemPayload?.uiEvent;
    if (uiEvent) {
      const eventName = uiEvent['event.name'] ?? '';
      if (eventName === 'qwen-code.tool_call') return 'tool';
      if (eventName.includes('subagent')) return 'system';
    }
  }
  return 'system';
}
