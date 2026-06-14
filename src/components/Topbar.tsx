import React from 'react';
import type { SessionInfo } from '../types';
import { Icon } from '../icons';

interface TopbarProps {
  activeSession: SessionInfo | null;
  sidebarOpen: boolean;
  outlineOpen: boolean;
  onToggleSidebar: () => void;
  onToggleOutline: () => void;
  onClose: () => void;
}

export default function Topbar({ activeSession, sidebarOpen, outlineOpen, onToggleSidebar, onToggleOutline, onClose }: TopbarProps) {
  return (
    <div style={{ display:'flex', alignItems:'center', height:'44px', padding:'0 12px', borderBottom:'1px solid var(--border)', gap:8, flexShrink:0 }}>
      <button onClick={onToggleSidebar} style={{ background:'none', border:'none', color:'var(--fg-2)', cursor:'pointer', padding:2, display:'flex' }}>
        {Icon.menu}
      </button>
      <span style={{ fontSize:14, fontWeight:600, fontFamily:'var(--font-mono)' }}>AgentView</span>
      {activeSession && (
        <>
          <span style={{ fontSize:11, color:'var(--meta)', fontFamily:'var(--font-mono)', marginLeft:8 }}>/</span>
          <span style={{ fontSize:11, color:'var(--fg-2)', fontFamily:'var(--font-mono)', marginLeft:8 }}>{activeSession.id.slice(0, 8)}</span>
          <span style={{
            fontSize:10, padding:'1px 6px', fontFamily:'var(--font-mono)',
            background: activeSession.source === 'qwen' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.08)',
            color: activeSession.source === 'qwen' ? 'var(--warn)' : 'var(--exec)'
          }}>
            {activeSession.source}
          </span>
        </>
      )}
      <div style={{ flex:1 }} />
      <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--meta)', cursor:'pointer', padding:4, display:'flex', fontSize:11, fontFamily:'var(--font-mono)', alignItems:'center', gap:4 }}>
        {Icon.refresh} Refresh
      </button>
      <button onClick={onToggleOutline} style={{ background:'none', border:'none', color: outlineOpen ? 'var(--fg-2)' : 'var(--meta)', cursor:'pointer', padding:4, display:'flex', fontSize:11, fontFamily:'var(--font-mono)', alignItems:'center', gap:4 }}>
        Outline
      </button>
    </div>
  );
}
