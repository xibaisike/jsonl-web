import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { JsonlEntry, SessionInfo, ApiLinesResponse } from './types';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import OutlinePanel from './components/OutlinePanel';
import BottomBar from './components/BottomBar';
import { Icon } from './icons';

const S = {
  topbar: { display:'flex', alignItems:'center', height:'44px', padding:'0 12px', borderBottom:'1px solid var(--border)', gap:8, flexShrink:0 } as React.CSSProperties,
  sidebar: { width:'260px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' } as React.CSSProperties,
  content: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 } as React.CSSProperties,
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--meta)', gap:12 } as React.CSSProperties,
  outline: { width:'200px', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' } as React.CSSProperties,
  outlineHead: { padding:'8px 12px', fontSize:11, fontWeight:600, color:'var(--meta)', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid var(--border-soft)' } as React.CSSProperties,
};

export default function App() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null);
  const [lines, setLines] = useState<JsonlEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [activeAnchorIndex, setActiveAnchorIndex] = useState(0);
  const outlineRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: SessionInfo[]) => { setSessions(data); setLoadingSessions(false); })
      .catch(err => { setError(err.message); setLoadingSessions(false); });
  }, []);

  const loadSession = useCallback((session: SessionInfo, append = false) => {
    setLoading(true);
    setError(null);
    const offset = append ? offsetRef.current : 0;
    fetch(`/api/sessions/${session.source}/${session.project}/${session.id}?offset=${offset}&limit=200`)
      .then(r => r.json())
      .then((data: ApiLinesResponse) => {
        if (append) {
          setLines(prev => [...prev, ...data.lines]);
        } else {
          setLines(data.lines);
          setActiveSession(session);
          offsetRef.current = 0;
        }
        setHasMore(data.hasMore);
        offsetRef.current = offset + data.lines.length;
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleSessionClick = useCallback((session: SessionInfo) => {
    loadSession(session, false);
    if (chatRef.current) chatRef.current.scrollTop = 0;
  }, [loadSession]);

  const loadMore = useCallback(() => {
    if (activeSession && hasMore && !loading) {
      loadSession(activeSession, true);
    }
  }, [activeSession, hasMore, loading, loadSession]);

  const scrollToEntry = (index: number) => {
    const el = document.getElementById('entry-' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChatScroll = useCallback(() => {
    if (!chatRef.current) return;
    const entries = chatRef.current.querySelectorAll('[id^="entry-"]');
    const chatTop = chatRef.current.scrollTop;
    const chatHeight = chatRef.current.clientHeight;
    for (let i = entries.length - 1; i >= 0; i--) {
      const el = entries[i] as HTMLElement;
      if (el.offsetTop <= chatTop + chatHeight / 3) {
        setActiveAnchorIndex(i);
        break;
      }
    }
  }, []);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s =>
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.firstMessage && s.firstMessage.toLowerCase().includes(q)) ||
      (s.projectPath && s.projectPath.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <Topbar
        activeSession={activeSession}
        sidebarOpen={sidebarOpen}
        outlineOpen={outlineOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onToggleOutline={() => setOutlineOpen(o => !o)}
        onClose={() => { setActiveSession(null); setLines([]); }}
      />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {sidebarOpen && (
          <Sidebar
            sessions={filteredSessions}
            activeSession={activeSession}
            searchQuery={searchQuery}
            loading={loadingSessions}
            onSearchChange={setSearchQuery}
            onSessionClick={handleSessionClick}
          />
        )}
        <div style={S.content}>
          {!activeSession && (
            <div style={S.emptyState}>
              <div style={{ fontSize:40, opacity:0.15 }}>{Icon.terminal}</div>
              <div style={{ fontSize:14, fontFamily:'var(--font-mono)' }}>Select a session to view</div>
              <div style={{ fontSize:11, color:'var(--meta)' }}>Claude Code &amp; Qwen Code session transcripts</div>
            </div>
          )}
          {activeSession && (
            <ChatArea
              chatRef={chatRef}
              lines={lines}
              hasMore={hasMore}
              loading={loading}
              error={error}
              showSystem={showSystem}
              onScroll={handleChatScroll}
              onLoadMore={loadMore}
            />
          )}
        </div>
        {outlineOpen && activeSession && (
          <div style={S.outline}>
            <div style={S.outlineHead}>Outline</div>
            <div ref={outlineRef} style={{ flex:1, overflow:'auto' }}>
              <OutlinePanel lines={lines} onClick={scrollToEntry} activeIndex={activeAnchorIndex} />
            </div>
          </div>
        )}
      </div>
      {activeSession && (
        <BottomBar
          lines={lines}
          showSystem={showSystem}
          onToggleSystem={() => setShowSystem(s => !s)}
        />
      )}
    </div>
  );
}
