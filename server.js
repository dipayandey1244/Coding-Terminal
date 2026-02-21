const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const pty = require('node-pty');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const SHELL = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');
const REPO_ROOT = process.cwd();
const BLOCKED_DIRS = new Set(['.git', 'node_modules']);

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function toRepoPath(inputPath = '') {
  const safePath = String(inputPath).replace(/\\/g, '/');
  const normalized = path.normalize(path.join(REPO_ROOT, safePath));

  if (!normalized.startsWith(REPO_ROOT)) {
    return null;
  }

  return normalized;
}

async function listFilesRecursively(dir, relBase = '') {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const dirent of dirents) {
    if (BLOCKED_DIRS.has(dirent.name)) {
      continue;
    }

    const fullPath = path.join(dir, dirent.name);
    const relPath = path.posix.join(relBase, dirent.name);

    if (dirent.isDirectory()) {
      const nestedFiles = await listFilesRecursively(fullPath, relPath);
      files.push(...nestedFiles);
    } else {
      files.push(relPath);
    }
  }

  return files.sort();
}

app.get('/api/files', async (_req, res) => {
  const files = await listFilesRecursively(REPO_ROOT);
  res.json({ files });
});

app.get('/api/file', async (req, res) => {
  const filePath = toRepoPath(req.query.path);

  if (!filePath) {
    res.status(400).json({ error: 'Invalid file path' });
    return;
  }

  const stat = await fs.stat(filePath).catch(() => null);

  if (!stat || !stat.isFile()) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const content = await fs.readFile(filePath, 'utf8');
  res.json({ content });
});

app.put('/api/file', async (req, res) => {
  const filePath = toRepoPath(req.body.path);
  const content = typeof req.body.content === 'string' ? req.body.content : '';

  if (!filePath) {
    res.status(400).json({ error: 'Invalid file path' });
    return;
  }

  await fs.writeFile(filePath, content, 'utf8');
  res.json({ ok: true });
});

wss.on('connection', (socket) => {
  const term = pty.spawn(SHELL, [], {
    name: 'xterm-color',
    cols: 100,
    rows: 30,
    cwd: REPO_ROOT,
    env: process.env,
  });

  term.onData((data) => socket.send(data));

  socket.on('message', (msg) => {
    let event;
    try {
      event = JSON.parse(msg.toString());
    } catch {
      return;
    }

    if (event.type === 'input') {
      term.write(event.data);
    }

    if (event.type === 'resize') {
      term.resize(event.cols, event.rows);
    }
  });

  socket.on('close', () => term.kill());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Coding terminal is running on http://localhost:${PORT}`);
});
