const terminalEl = document.getElementById('terminal');
const term = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  theme: {
    background: '#0b0d11',
    foreground: '#e5e7eb',
  },
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminalEl);
fitAddon.fit();

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${window.location.host}`);

socket.addEventListener('open', () => {
  term.focus();
  sendResize();
});

socket.addEventListener('message', (event) => {
  term.write(event.data);
});

term.onData((data) => {
  socket.send(JSON.stringify({ type: 'input', data }));
});

window.addEventListener('resize', () => {
  fitAddon.fit();
  sendResize();
});

function sendResize() {
  socket.send(
    JSON.stringify({
      type: 'resize',
      cols: term.cols,
      rows: term.rows,
    }),
  );
}
