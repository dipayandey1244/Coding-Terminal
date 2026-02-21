const terminalEl = document.getElementById('terminal');
const filesListEl = document.getElementById('files-list');
const editorEl = document.getElementById('editor');
const editorFilenameEl = document.getElementById('editor-filename');
const saveFileBtn = document.getElementById('save-file');
const refreshFilesBtn = document.getElementById('refresh-files');

let selectedFile = '';

const term = new Terminal({
  cursorBlink: true,
  fontSize: 13,
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

refreshFilesBtn.addEventListener('click', loadFiles);
saveFileBtn.addEventListener('click', saveCurrentFile);

async function loadFiles() {
  const res = await fetch('/api/files');
  const data = await res.json();

  filesListEl.innerHTML = '';

  for (const file of data.files) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = file;

    if (file === selectedFile) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => loadFile(file));
    li.appendChild(btn);
    filesListEl.appendChild(li);
  }
}

async function loadFile(filePath) {
  const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);

  if (!res.ok) {
    alert('Failed to load file');
    return;
  }

  const data = await res.json();
  selectedFile = filePath;
  editorFilenameEl.textContent = filePath;
  editorEl.value = data.content;
  saveFileBtn.disabled = false;

  for (const button of filesListEl.querySelectorAll('button')) {
    button.classList.toggle('active', button.textContent === filePath);
  }
}

async function saveCurrentFile() {
  if (!selectedFile) {
    return;
  }

  const res = await fetch('/api/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: selectedFile, content: editorEl.value }),
  });

  if (!res.ok) {
    alert('Failed to save file');
    return;
  }

  editorFilenameEl.textContent = `${selectedFile} (saved)`;
  setTimeout(() => {
    if (selectedFile) {
      editorFilenameEl.textContent = selectedFile;
    }
  }, 1000);
}

function sendResize() {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(
    JSON.stringify({
      type: 'resize',
      cols: term.cols,
      rows: term.rows,
    }),
  );
}

loadFiles();
