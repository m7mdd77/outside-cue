import { mkdir, writeFile } from 'node:fs/promises';
import { loadModel, modelId } from '../lib/model.mjs';
import { createPlan } from '../lib/planner.mjs';

const cases = [
  { wish: 'I want to notice interesting shapes in buildings', expected: 'geometry' },
  { wish: 'I would like to listen to the sounds around me', expected: 'sound' },
  { wish: 'I want to watch birds from a distance', expected: 'bird' },
  { wish: 'I want to notice leaves and the texture of tree bark', expected: 'texture' },
  { wish: 'I want to look at clouds in the sky', expected: 'sky' },
  { wish: 'I want to see colorful objects', expected: 'color' }
];
const start = performance.now();
const model = await loadModel();
const loadMs = performance.now() - start;
const results = [];
try {
  for (const item of cases) {
    const began = performance.now();
    const plan = await createPlan({ wish: item.wish, place: 'any', minutes: 5 }, model.embed, model.vectors);
    results.push({ ...item, ranked: plan.cues.map(c => ({ id: c.id, similarity: c.similarity })), passed: plan.cues[0].id === item.expected, inferenceMs: performance.now() - began });
  }
} finally { await model.dispose(); }
const evidence = { measuredAt: new Date().toISOString(), modelId, remoteModelsAllowed: false, loadMs, passed: results.filter(x => x.passed).length, total: results.length, cases: results };
await mkdir('evidence', { recursive: true });
await writeFile('evidence/live-inference.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
if (evidence.passed !== evidence.total) process.exitCode = 1;
