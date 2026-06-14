import React, { useMemo } from 'react';
import type { JsonlEntry } from '../types';
import { Icon } from '../icons';
import { getPreview } from '../utils/format';
import { buildPromptGroups } from '../utils/promptGroups';

interface OutlinePanelProps {
  lines: JsonlEntry[];
  onClick: (index: number) => void;
  activeIndex: number;
}

export default function OutlinePanel({ lines, onClick, activeIndex }: OutlinePanelProps) {
  const groups = useMemo(() => buildPromptGroups(lines), [lines]);

  const userRowStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 12px',
    cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
    overflow: 'hidden', whiteSpace: 'nowrap',
    transition: 'background var(--motion-base)',
    background: active ? 'var(--surface-warm)' : 'transparent',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--fg)' : 'var(--muted)',
  });

  const childRowStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 12px',
    paddingLeft: '28px',
    cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
    overflow: 'hidden', whiteSpace: 'nowrap',
    background: active ? 'var(--surface-warm)' : 'transparent',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--fg)' : 'var(--muted)',
  });

  const iconMap: Record<string, React.ReactNode> = {
    user: Icon.user,
    assistant: Icon.bot,
    tool: Icon.tool,
    system: Icon.system,
  };

  function getIcon(entry: JsonlEntry): React.ReactNode {
    const type = entry.type;
    if (type === 'user') return iconMap.user;
    if (type === 'assistant') return iconMap.assistant;
    if (type === 'tool_result') return iconMap.tool;
    if (type === 'system' && entry.subtype === 'ui_telemetry') {
      const uiEvent = entry.systemPayload?.uiEvent;
      if (uiEvent) {
        const eventName = uiEvent['event.name'] ?? '';
        if (eventName === 'qwen-code.tool_call') return iconMap.tool;
        if (eventName.includes('subagent')) return iconMap.system;
      }
    }
    return iconMap.system;
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.user.uuid}>
          <div style={userRowStyle(activeIndex === group.userIndex)} onClick={() => onClick(group.userIndex)}>
            {iconMap.user}
            <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>
              {getPreview(group.user)}
            </span>
          </div>
          {group.children.map((child) => (
            <div key={child.entry.uuid} style={childRowStyle(activeIndex === child.index)} onClick={() => onClick(child.index)}>
              {getIcon(child.entry)}
              <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>
                {getPreview(child.entry)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
