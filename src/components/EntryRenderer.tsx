import React from 'react';
import type { JsonlEntry } from '../types';
import { Icon } from '../icons';
import { formatTime } from '../utils/format';
import ThinkingBlock from './ThinkingBlock';
import ToolCallBlock from './ToolCallBlock';
import ToolResultBlock from './ToolResultBlock';

interface EntryRendererProps {
  entry: JsonlEntry;
  showSystem: boolean;
}

export default function EntryRenderer({ entry, showSystem }: EntryRendererProps) {
  const type = entry.type;

  if (type === 'system') {
    if (!showSystem) return null;
    const subtype = entry.subtype || '';
    const eventName = entry.systemPayload?.uiEvent?.['event.name'] || subtype;
    return (
      <div style={{ padding:'4px 0', marginBottom:4, fontSize:10, color:'var(--meta)', fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap:6 }}>
        {Icon.system}
        <span>{eventName || 'system'}</span>
        <span style={{ color:'var(--meta)' }}>{formatTime(entry.timestamp)}</span>
      </div>
    );
  }

  if (type === 'user') {
    const text = entry.message?.parts?.[0]?.text ?? entry.message?.content ?? '';
    return (
      <div style={{ display:'flex', gap:10, marginBottom:20, flexDirection:'row-reverse' }}>
        <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-warm)', flexShrink:0, color:'var(--fg-2)' }}>
          {Icon.user}
        </div>
        <div>
          <div style={{ maxWidth:'75%', padding:'8px 12px', background:'var(--surface-warm)', border:'1px solid var(--border-soft)', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'var(--font-body)' }}>
            {text}
          </div>
          <div style={{ fontSize:10, color:'var(--meta)', marginTop:4, fontFamily:'var(--font-mono)', textAlign:'right' }}>
            {formatTime(entry.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'assistant') {
    const parts = entry.message?.parts ?? [];
    const model = entry.model || '';
    return (
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', flexShrink:0, color:'var(--muted)' }}>
          {Icon.bot}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          {parts.map((part, i) => {
            if (part.thought) return <ThinkingBlock key={i} text={part.text || ''} />;
            if (part.functionCall) return <ToolCallBlock key={i} fc={part.functionCall} />;
            if (part.text) return (
              <div key={i} style={{ maxWidth:'75%', padding:'8px 12px', background:'var(--surface)', border:'1px solid var(--border-soft)', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'var(--font-body)' }}>
                {part.text}
              </div>
            );
            return null;
          })}
          <div style={{ fontSize:10, color:'var(--meta)', marginTop:4, fontFamily:'var(--font-mono)', display:'flex', gap:8 }}>
            <span>{formatTime(entry.timestamp)}</span>
            {model && <span style={{ color:'var(--meta)' }}>{model}</span>}
            {entry.usageMetadata && (
              <span style={{ color:'var(--meta)' }}>
                {entry.usageMetadata.totalTokenCount || entry.usageMetadata.inputTokens || ''} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'tool_result') {
    const result = entry.toolCallResult ?? entry.tool_result ?? {};
    const name = (result.name as string) ?? entry.toolName ?? 'tool';
    let output = '';
    if (typeof result.result === 'string') output = result.result;
    else if (result.output) output = result.output as string;
    else if (result.content) output = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
    else output = JSON.stringify(result, null, 2);

    return (
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', flexShrink:0, color:'var(--muted)' }}>
          {Icon.tool}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <ToolResultBlock name={name} output={output} />
          <div style={{ fontSize:10, color:'var(--meta)', marginTop:4, fontFamily:'var(--font-mono)' }}>
            {formatTime(entry.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'4px 0', marginBottom:4, fontSize:10, color:'var(--meta)', fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap:6 }}>
      {Icon.system}
      <span>{type || 'unknown'}</span>
      <span style={{ color:'var(--meta)' }}>{formatTime(entry.timestamp)}</span>
    </div>
  );
}
