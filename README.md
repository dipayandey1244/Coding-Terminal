# Coding Terminal (Minimal Web Stack)

A very small **web coding terminal** you can run locally and deploy quickly.

## Tech used (least possible)

- **Node.js + Express**: serve one HTML page.
- **WebSocket (`ws`)**: real-time terminal I/O.
- **`node-pty`**: spawn a real shell process (`bash`/`powershell`).
- **xterm.js (CDN)**: browser terminal UI.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy on the web (easy path: Render)

1. Push this project to GitHub.
2. Go to [render.com](https://render.com) and create a **New Web Service**.
3. Connect your repository.
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Deploy.

Render will expose your app publicly over HTTPS, and the app automatically uses `wss://` when needed.

## Project structure

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

## Notes

- This is a minimal demo and runs a shell process per browser session.
- Do **not** use as-is for untrusted public users without sandboxing/auth/rate limits.
