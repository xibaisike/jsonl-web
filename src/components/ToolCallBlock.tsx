import React, { useState } from 'react';
import { Icon } from '../icons';

interface ToolCallBlockProps {
  fc: {
    id: string;
    name: string;
    args: Record<string, unknown>;
  };
}

export default function ToolCallBlock({ fc }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const args = fc.args || {};
  const argsStr = typeof args === 'string' ? args : JSON.stringify(args, null, 2);

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'8px 12px', marginBottom:8, fontFamily:'var(--font-mono)', fontSize:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }} onClick={() => setExpanded(e => !e)}>
        {expanded ? Icon.chevronDown : Icon.chevronRight}
        <span style={{ color:'var(--warn)', fontWeight:500 }}>{fc.name}</span>
        <span style={{ color:'var(--meta)', fontSize:10 }}>{fc.id?.slice(0, 8)}</span>
      </div>
      {expanded && (
        <pre style={{ marginTop:6, fontSize:11, color:'var(--fg-2)', whiteSpace:'pre-wrap', wordBreak:'break-all', maxHeight:200, overflow:'auto' }}>
          {argsStr}
        </pre>
      )}
    </div>
  );
}
