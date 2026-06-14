import React, { useMemo } from 'react';
import type { SessionInfo } from '../types';
import SessionItem from './SessionItem';

interface SidebarProps {
  sessions: SessionInfo[];
  activeSession: SessionInfo | null;
  searchQuery: string;
  loading: boolean;
  onSearchChange: (q: string) => void;
  onSessionClick: (s: SessionInfo) => void;
}

export default function Sidebar({ sessions, activeSession, searchQuery, loading, onSearchChange, onSessionClick }: SidebarProps) {
  const claudeSessions = useMemo(() => sessions.filter(s => s.source === 'claude'), [sessions]);
  const qwenSessions = useMemo(() => sessions.filter(s => s.source === 'qwen'), [sessions]);

  return (
    <div style={{ width:'260px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
      <div style={{ padding:'8px 12px', fontSize:11, fontWeight:600, color:'var(--meta)', textTransform:'uppercase', letterSpacing:'0.5px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span>Sessions</span>
        <span style={{ fontSize:10, padding:'1px 6px', background:'var(--surface-warm)', color:'var(--muted)', fontFamily:'var(--font-mono)' }}>{sessions.length}</span>
      </div>
      <div style={{ padding:'0 8px', marginBottom:4 }}>
        <input
          style={{ width:'100%', flex:1, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--fg)', padding:'6px 10px', fontSize:11, fontFamily:'var(--font-mono)', outline:'none' }}
          placeholder="Filter sessions..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {loading && <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:20, color:'var(--meta)', gap:8 }}>Loading...</div>}
        {!loading && sessions.length === 0 && (
          <div style={{ padding:12, color:'var(--meta)', fontSize:11, textAlign:'center' }}>No sessions found</div>
        )}
        {qwenSessions.length > 0 && (
          <>
            <div style={{ padding:'4px 12px', fontSize:10, fontWeight:600, color:'var(--meta)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:8 }}>Qwen Code</div>
            {qwenSessions.map(s => (
              <SessionItem key={s.source+s.project+s.id} session={s} active={activeSession?.id === s.id && activeSession?.source === s.source} onClick={() => onSessionClick(s)} />
            ))}
          </>
        )}
        {claudeSessions.length > 0 && (
          <>
            <div style={{ padding:'4px 12px', fontSize:10, fontWeight:600, color:'var(--meta)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:8 }}>Claude Code</div>
            {claudeSessions.map(s => (
              <SessionItem key={s.source+s.project+s.id} session={s} active={activeSession?.id === s.id && activeSession?.source === s.source} onClick={() => onSessionClick(s)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
