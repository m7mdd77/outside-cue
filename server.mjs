import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { loadModel, modelId } from './lib/model.mjs';
import { createPlan, validateRequest } from './lib/planner.mjs';

const port = Number(process.env.PORT || 3271);
const model = await loadModel();
const assets = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
let busy = false;
const server = createServer(async (req, res) => {
  const base = `http://127.0.0.1:${port}`;
  const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.headers.host !== `127.0.0.1:${port}` && req.headers.host !== `localhost:${port}`) return send(403, { error: 'Host rejected.' });
  if (req.headers.origin && ![base, `http://localhost:${port}`].includes(req.headers.origin)) return send(403, { error: 'Origin rejected.' });
  if (req.method === 'GET' && req.url === '/api/status') return send(200, { modelId, localOnly: true, ready: true });
  if (req.method === 'POST' && req.url === '/api/plan') {
    if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'JSON required.' });
    if (busy) return send(429, { error: 'Please wait for the current request.' });
    busy = true;
    try {
      const chunks = []; let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 4096) { send(413, { error: 'Request too large.' }); return; }
        chunks.push(chunk);
      }
      let input;
      try { input = validateRequest(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (error) { return send(400, { error: error.message }); }
      const began = performance.now();
      const plan = await createPlan(input, model.embed, model.vectors);
      send(200, { ...plan, modelId, inferenceMs: Math.round(performance.now() - began) });
    } catch { send(503, { error: 'Local inference failed. Nothing was generated.' }); }
    finally { busy = false; }
    return;
  }
  if (req.method !== 'GET' || !assets[req.url]) return send(404, { error: 'Not found.' });
  const [file, type] = assets[req.url];
  try { res.writeHead(200, { 'Content-Type': type }); res.end(await readFile(new URL(`./public/${file}`, import.meta.url))); }
  catch { res.end(); }
});
server.requestTimeout = 15000;
server.listen(port, '127.0.0.1', () => console.log(`Outside Cue ready: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await model.dispose(); process.exit(0); }));
