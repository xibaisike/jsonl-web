const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const app = express();
const PORT = 8456;

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'dist')));

// Configuration: where to find Qwen and Claude sessions
const HOME = process.env.HOME || '/home/tea';
const QWEN_CHATS_BASE = path.join(HOME, '.qwen', 'projects');
const CLAUDE_CHATS_BASE = path.join(HOME, '.claude', 'projects');

// ---- helpers ----

function listJsonlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.name.endsWith('.jsonl')) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

function parseFirstLine(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    rl.on('line', (line) => {
      rl.close();
      stream.destroy();
      try { resolve(JSON.parse(line)); } catch { resolve(null); }
    });
    rl.on('close', () => resolve(null));
    stream.on('error', () => resolve(null));
  });
}

function countLines(filePath) {
  return new Promise((resolve) => {
    let count = 0;
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    rl.on('line', () => { count++; });
    rl.on('close', () => resolve(count));
    stream.on('error', () => resolve(0));
  });
}

/**
 * Scan a Claude JSONL file for the first user-type entry.
 * Returns { timestamp, firstMessage } or null if none found.
 */
function findFirstUserMessageClaude(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    rl.on('line', (line) => {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'user' && entry.message) {
          const content = entry.message.content;
          let text = '';
          if (typeof content === 'string') {
            text = content;
          } else if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'text' && block.text) {
                text = block.text;
                break;
              }
            }
          }
          rl.close();
          stream.destroy();
          resolve({
            timestamp: entry.timestamp || null,
            firstMessage: text
          });
          return;
        }
      } catch { /* skip malformed */ }
    });
    rl.on('close', () => resolve(null));
    stream.on('error', () => resolve(null));
  });
}

function readLinesRange(filePath, offset, limit) {
  return new Promise((resolve) => {
    const lines = [];
    let current = 0;
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    rl.on('line', (line) => {
      if (current >= offset && current < offset + limit) {
        try { lines.push(JSON.parse(line)); } catch { /* skip malformed */ }
      }
      current++;
      if (current >= offset + limit) {
        rl.close();
        stream.destroy();
      }
    });
    rl.on('close', () => resolve({ lines, total: current }));
    stream.on('error', () => resolve({ lines, total: current }));
  });
}

// ---- API: list sessions ----

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = [];

    // Qwen sessions
    const qwenFiles = listJsonlFiles(QWEN_CHATS_BASE);
    for (const file of qwenFiles) {
      const rel = path.relative(QWEN_CHATS_BASE, file);
      const parts = rel.split(path.sep); // e.g. "-home-tea-jsonl/chats/uuid.jsonl"
      if (parts.length >= 3 && parts[1] === 'chats') {
        const project = parts[0];
        const sessionId = path.basename(file, '.jsonl');
        const first = await parseFirstLine(file);
        const messageCount = await countLines(file);

        let firstMessage = '';
        let timestamp = null;
        if (first) {
          timestamp = first.timestamp || null;
          if (first.message && first.message.parts && first.message.parts[0]) {
            firstMessage = first.message.parts[0].text || '';
          }
        }
        // Use file mtime as fallback
        if (!timestamp) {
          try { timestamp = fs.statSync(file).mtime.toISOString(); } catch { }
        }

        sessions.push({
          id: sessionId,
          source: 'qwen',
          project: project,
          projectPath: project.replace(/-/g, '/').replace(/\/home\/tea\//, '/home/tea/'),
          firstMessage: firstMessage.slice(0, 100) || sessionId.slice(0, 12),
          timestamp: timestamp || new Date().toISOString(),
          messageCount: messageCount
        });
      }
    }

    // Claude sessions
    const claudeFiles = listJsonlFiles(CLAUDE_CHATS_BASE);
    for (const file of claudeFiles) {
      const rel = path.relative(CLAUDE_CHATS_BASE, file);
      const parts = rel.split(path.sep);
      // Claude structure: <project>/<uuid>.jsonl (no chats/ subdir)
      if (parts.length >= 2 && !parts[0].startsWith('chats')) {
        const project = parts[0];
        const sessionId = path.basename(file, '.jsonl');
        const msgInfo = await findFirstUserMessageClaude(file);
        const messageCount = await countLines(file);

        let firstMessage = '';
        let timestamp = null;
        if (msgInfo) {
          timestamp = msgInfo.timestamp;
          firstMessage = msgInfo.firstMessage;
        }
        if (!timestamp) {
          try { timestamp = fs.statSync(file).mtime.toISOString(); } catch { }
        }
        sessions.push({
          id: sessionId,
          source: 'claude',
          project: project,
          projectPath: project.replace(/-/g, '/'),
          firstMessage: firstMessage.slice(0, 100) || sessionId.slice(0, 12),
          timestamp: timestamp || new Date().toISOString(),
          messageCount: messageCount
        });
      }
    }

    // Sort by timestamp descending
    sessions.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    res.json(sessions);
  } catch (err) {
    console.error('Error listing sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- API: get session lines ----

app.get('/api/sessions/:source/:project/:sessionId', async (req, res) => {
  try {
    const { source, project, sessionId } = req.params;
    const offset = parseInt(req.query.offset) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 200, 1000);

    let filePath;
    if (source === 'qwen') {
      filePath = path.join(QWEN_CHATS_BASE, project, 'chats', sessionId + '.jsonl');
    } else if (source === 'claude') {
      filePath = path.join(CLAUDE_CHATS_BASE, project, sessionId + '.jsonl');
    } else {
      return res.status(400).json({ error: 'Unknown source: ' + source });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found', path: filePath });
    }

    const { lines, total } = await readLinesRange(filePath, offset, limit);
    res.json({
      lines: lines,
      hasMore: offset + lines.length < total,
      total: total,
      offset: offset,
      limit: limit
    });
  } catch (err) {
    console.error('Error reading session:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- start ----

app.listen(PORT, () => {
  console.log('AgentView server listening on http://localhost:' + PORT);
});