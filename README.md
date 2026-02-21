# Live Repo Coding Terminal (Minimal Stack)

A small web app where you can:

- browse files in the current repository,
- open/edit/save files in-browser,
- run commands in a real terminal rooted at this repo.

## Tech (minimal)

- **Node.js + Express** for HTTP APIs and static hosting
- **WebSocket (`ws`) + `node-pty`** for a live shell terminal
- **xterm.js (CDN)** for terminal UI
- **Vanilla HTML/CSS/JS** for the file editor

## Features

- File list from repo root (`/api/files`)
- Read file (`/api/file?path=...`)
- Save file (`PUT /api/file`)
- Interactive shell in repo root

## Run locally

```bash
npm install
npm start
```

Then open: `http://localhost:3000`

## Deploy (Render)

1. Push this repo to GitHub.
2. In Render, create **New Web Service**.
3. Set:
   - Build command: `npm install`
   - Start command: `npm start`
4. Deploy.

## Structure

```txt
.
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
├── package.json
├── Procfile
└── README.md
```

## Important security note

This project is intentionally minimal. It exposes a real shell and file editing.
Do **not** run it publicly for untrusted users without authentication, authorization,
process/file sandboxing, and rate limits.
