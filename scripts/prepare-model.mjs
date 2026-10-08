import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { modelId, modelDirectory } from '../lib/model.mjs';

const revision = '751bff37182d3f1213fa05d7196b954e230abad9';
const paths = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx'];
const tree = await fetch(`https://huggingface.co/api/models/${modelId}/tree/${revision}?recursive=true`).then(r => {
  if (!r.ok) throw new Error(`Model metadata HTTP ${r.status}`);
  return r.json();
});
const records = [];
for (const path of paths) {
  const entry = tree.find(item => item.path === path);
  if (!entry) throw new Error(`Missing pinned model file: ${path}`);
  const destination = `${modelDirectory}${modelId}/${path}`;
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), { recursive: true });
  let buffer;
  try { buffer = await readFile(destination); } catch { /* Download missing assets. */ }
  if (!buffer || buffer.length !== entry.size) {
    const response = await fetch(`https://huggingface.co/${modelId}/resolve/${revision}/${path}`, { signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw new Error(`Model download HTTP ${response.status}`);
    buffer = Buffer.from(await response.arrayBuffer());
  }
  if (buffer.length !== entry.size) throw new Error(`Size mismatch: ${path}`);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  if (entry.lfs?.oid && sha256 !== entry.lfs.oid) throw new Error(`SHA256 mismatch: ${path}`);
  await writeFile(destination, buffer);
  records.push({ path, bytes: buffer.length, sha256 });
  console.log(`Verified ${path} (${buffer.length} bytes)`);
}
await mkdir('evidence', { recursive: true });
await writeFile('evidence/model-provenance.json', JSON.stringify({ modelId, revision, preparedAt: new Date().toISOString(), records }, null, 2));
console.log('Model ready. Runtime inference is local-only.');
