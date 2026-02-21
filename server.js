const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const pty = require('node-pty');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const SHELL = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (socket) => {
  const term = pty.spawn(SHELL, [], {
    name: 'xterm-color',
    cols: 100,
    rows: 30,
    cwd: process.env.HOME || process.cwd(),
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
