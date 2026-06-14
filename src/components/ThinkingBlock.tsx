import React, { useState } from 'react';
import { Icon } from '../icons';

interface ThinkingBlockProps {
  text: string;
}

export default function ThinkingBlock({ text }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border-soft)', padding:'8px 12px', marginBottom:8, cursor:'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--muted)' }}>
        {expanded ? Icon.chevronDown : Icon.chevronRight}
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontStyle:'italic' }}>Thinking</span>
      </div>
      {expanded && (
        <div style={{ marginTop:6, whiteSpace:'pre-wrap', color:'var(--muted)', fontStyle:'italic', fontSize:12 }}>
          {text}
        </div>
      )}
    </div>
  );
}
