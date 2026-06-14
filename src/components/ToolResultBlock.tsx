import React, { useState } from 'react';
import { Icon } from '../icons';

interface ToolResultBlockProps {
  name: string;
  output: string;
}

export default function ToolResultBlock({ name, output }: ToolResultBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const preview = output.slice(0, 300);

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border-soft)', padding:'8px 12px', marginBottom:8, fontSize:12, maxHeight:200, overflow:'auto', color:'var(--fg-2)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', marginBottom: expanded ? 6 : 0 }} onClick={() => setExpanded(e => !e)}>
        {expanded ? Icon.chevronDown : Icon.chevronRight}
        <span style={{ color:'var(--exec)', fontFamily:'var(--font-mono)', fontSize:11 }}>{name}</span>
        <span style={{ color:'var(--meta)', fontSize:10 }}>result</span>
      </div>
      {expanded && (
        <pre style={{ fontSize:11, whiteSpace:'pre-wrap', wordBreak:'break-all', fontFamily:'var(--font-mono)' }}>
          {output}
        </pre>
      )}
      {!expanded && (
        <div style={{ fontSize:11, color:'var(--muted)', whiteSpace:'pre-wrap', wordBreak:'break-all', fontFamily:'var(--font-mono)', maxHeight:40, overflow:'hidden' }}>
          {preview}{output.length > 300 ? '...' : ''}
        </div>
      )}
    </div>
  );
}
