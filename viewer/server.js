#!/usr/bin/env node
// Tiny local server for the viewers. Usage (from the repo root): node viewer/server.js
// Then open http://localhost:8765/viewer/live.html  (live)  or  /viewer/  (timeline).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8765;
const LOG = path.join(ROOT, '.claude', 'logs', 'events.jsonl');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css',
  '.json': 'application/json', '.jsonl': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

http.createServer((req, res) => {
  if (req.method !== 'GET') return send(res, 405, 'method not allowed', 'text/plain');
  const u = new URL(req.url, 'http://localhost');

  // Incremental tail of the event log: GET /__events?from=<byte offset>
  if (u.pathname === '/__events') {
    let from = Number(u.searchParams.get('from')) || 0;
    let size = 0;
    try { size = fs.statSync(LOG).size; } catch (_) {
      return send(res, 200, JSON.stringify({ next: 0, text: '', reset: from > 0 }));
    }
    let reset = false;
    if (from > size) { from = 0; reset = true; }
    const buf = Buffer.alloc(size - from);
    const fd = fs.openSync(LOG, 'r');
    fs.readSync(fd, buf, 0, buf.length, from);
    fs.closeSync(fd);
    const nl = buf.lastIndexOf(10); // only return complete lines
    const chunk = nl < 0 ? Buffer.alloc(0) : buf.subarray(0, nl + 1);
    return send(res, 200, JSON.stringify({ next: from + chunk.length, text: chunk.toString('utf8'), reset }));
  }

  // Agents defined in .claude/agents/*.md, with their model
  if (u.pathname === '/__agents') {
    const dir = path.join(ROOT, '.claude', 'agents');
    let out = [];
    try {
      out = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
        const t = fs.readFileSync(path.join(dir, f), 'utf8');
        const name = (t.match(/^name:\s*(\S+)/m) || [])[1] || f.replace(/\.md$/, '');
        const model = (t.match(/^model:\s*(\S+)/m) || [])[1] || '';
        return { name, model };
      });
    } catch (_) {}
    return send(res, 200, JSON.stringify(out));
  }

  // Static files from the repo (never .git)
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(ROOT, '.' + p);
  const rel = path.relative(ROOT, file);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep)[0] === '.git') {
    return send(res, 403, 'forbidden', 'text/plain');
  }
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    send(res, 200, data, TYPES[path.extname(file)] || 'application/octet-stream');
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Viewer server running (Ctrl+C to stop):');
  console.log('  live:     http://localhost:' + PORT + '/viewer/live.html');
  console.log('  timeline: http://localhost:' + PORT + '/viewer/');
});
