import React, { RefObject } from 'react';
import type { JsonlEntry } from '../types';
import EntryRenderer from './EntryRenderer';

interface ChatAreaProps {
  chatRef: RefObject<HTMLDivElement>;
  lines: JsonlEntry[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  showSystem: boolean;
  onScroll: () => void;
  onLoadMore: () => void;
}

export default function ChatArea({ chatRef, lines, hasMore, loading, error, showSystem, onScroll, onLoadMore }: ChatAreaProps) {
  return (
    <div ref={chatRef as React.RefObject<HTMLDivElement>} style={{ flex:1, overflow:'auto', padding:'16px 20px' }} onScroll={onScroll}>
      {error && (
        <div style={{ padding:10, color:'var(--warn)', fontSize:12, fontFamily:'var(--font-mono)' }}>Error: {error}</div>
      )}
      {lines.map((entry, i) => (
        <div id={'entry-' + i} key={entry.uuid || i}>
          <EntryRenderer entry={entry} showSystem={showSystem} />
        </div>
      ))}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:20, color:'var(--meta)', gap:8 }}>Loading...</div>
      )}
      {hasMore && !loading && (
        <div style={{ textAlign:'center', padding:'12px', cursor:'pointer', color:'var(--muted)', fontSize:12, fontFamily:'var(--font-mono)', borderTop:'1px solid var(--border-soft)' }} onClick={onLoadMore}>
          Load more entries...
        </div>
      )}
      {!hasMore && lines.length > 0 && (
        <div style={{ textAlign:'center', padding:20, color:'var(--meta)', fontSize:11, fontFamily:'var(--font-mono)' }}>
          {'\u2014'} End of session {'\u2014'}
        </div>
      )}
    </div>
  );
}
