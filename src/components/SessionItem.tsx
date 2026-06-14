import React, { useState } from 'react';
import type { SessionInfo } from '../types';

interface SessionItemProps {
  session: SessionInfo;
  active: boolean;
  onClick: () => void;
}

export default function SessionItem({ session, active, onClick }: SessionItemProps) {
  const [hover, setHover] = useState(false);
  const time = new Date(session.timestamp);
  const timeStr = time.toLocaleDateString('en-US', { month:'short', day:'numeric' });

  return (
    <div
      style={{
        display:'flex', alignItems:'center', gap:8, padding:'6px 12px', cursor:'pointer',
        background: active ? 'var(--surface-warm)' : hover ? 'var(--surface)' : 'transparent',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition:'background var(--motion-base)', fontSize:12, fontFamily:'var(--font-mono)',
        color: active ? 'var(--fg)' : 'var(--fg-2)'
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ width:6, height:6, borderRadius:0, flexShrink:0, background: session.source === 'qwen' ? 'var(--warn)' : 'var(--exec)' }} />
      <div style={{ flex:1, overflow:'hidden' }}>
        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {session.firstMessage || session.id.slice(0, 12)}
        </div>
        <div style={{ fontSize:10, color:'var(--meta)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {(session.projectPath || session.project) + ' \u00b7 ' + timeStr}
        </div>
      </div>
      <div style={{ fontSize:10, color:'var(--meta)', flexShrink:0 }}>
        {session.messageCount > 0 ? 'E' + session.messageCount : ''}
      </div>
    </div>
  );
}
