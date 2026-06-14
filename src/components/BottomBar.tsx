import React from 'react';
import type { JsonlEntry } from '../types';

interface BottomBarProps {
  lines: JsonlEntry[];
  showSystem: boolean;
  onToggleSystem: () => void;
}

export default function BottomBar({ lines, showSystem, onToggleSystem }: BottomBarProps) {
  return (
    <div style={{ display:'flex', alignItems:'center', padding:'8px 12px', borderTop:'1px solid var(--border)', gap:8, flexShrink:0, background:'var(--bg)' }}>
      <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--meta)', cursor:'pointer', fontFamily:'var(--font-mono)', userSelect:'none' }}>
        <input type="checkbox" checked={showSystem} onChange={onToggleSystem} style={{ cursor:'pointer' }} />
        System events
      </label>
      <div style={{ flex:1 }} />
      <span style={{ fontSize:11, color:'var(--meta)', fontFamily:'var(--font-mono)' }}>
        {lines.length} entries
      </span>
    </div>
  );
}
