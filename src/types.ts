// JSONL entry types matching both Qwen Code and Claude Code formats

export interface ContentPart {
  text?: string;
  thought?: boolean;
  functionCall?: {
    id: string;
    name: string;
    args: Record<string, unknown>;
  };
}

export interface Message {
  role: string;
  parts?: ContentPart[];
  content?: string;
}

export interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  totalTokenCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  cachedContentTokenCount?: number;
}

export interface UiEvent {
  'event.name'?: string;
  'event.timestamp'?: string;
  function_name?: string;
  function_args?: Record<string, unknown>;
  duration_ms?: number;
  status?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface SystemPayload {
  uiEvent?: UiEvent;
  snapshot?: unknown;
  snapshots?: unknown[];
}

export interface JsonlEntry {
  uuid: string;
  parentUuid: string | null;
  sessionId: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'system' | 'tool_result';
  cwd?: string;
  version?: string;
  subtype?: string;
  message?: Message;
  model?: string;
  usageMetadata?: UsageMetadata;
  systemPayload?: SystemPayload;
  toolCallResult?: {
    name?: string;
    result?: string;
    output?: string;
    content?: string | unknown;
    [key: string]: unknown;
  };
  tool_result?: {
    name?: string;
    result?: string;
    output?: string;
    [key: string]: unknown;
  };
  toolName?: string;
  contextWindowSize?: number;
}

export interface SessionInfo {
  id: string;
  source: 'qwen' | 'claude';
  project: string;
  projectPath: string;
  filePath: string;
  timestamp: string;
  firstMessage?: string;
  messageCount: number;
  workDir?: string;
}

export interface PromptGroup {
  user: JsonlEntry;
  userIndex: number;
  children: { entry: JsonlEntry; index: number }[];
}

export interface ApiLinesResponse {
  lines: JsonlEntry[];
  total: number;
  hasMore: boolean;
}