import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = 'http://127.0.0.1:3271';
const cases = [];
async function check(name, run) { await run(); cases.push({ name, passed: true }); }
await check('local ready status', async () => { const r = await fetch(base+'/api/status'); assert.equal(r.status,200); assert.equal((await r.json()).localOnly,true); });
await check('invalid request rejected', async () => { const r = await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}); assert.equal(r.status,400); });
await check('remote origin rejected', async () => { const r = await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com'},body:'{}'}); assert.equal(r.status,403); });
await check('wrong content type rejected', async () => { const r = await fetch(base+'/api/plan',{method:'POST',body:'{}'}); assert.equal(r.status,415); });
await check('oversized body rejected', async () => { const r = await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wish:'x'.repeat(4500)})}); assert.equal(r.status,413); });
await check('actual local inference and street filter', async () => { const r = await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wish:'interesting architecture and buildings',place:'street',minutes:5})}); assert.equal(r.status,200); const p = await r.json(); assert.equal(p.cues[0].id,'geometry'); assert.ok(p.cues.every(c=>c.place!=='park')); });
const result = { measuredAt:new Date().toISOString(), passed:cases.length, cases };
await writeFile('evidence/http-tests.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2));
