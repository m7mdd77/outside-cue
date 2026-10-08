import { pipeline, env } from '@huggingface/transformers';
import { fileURLToPath } from 'node:url';
import { cues } from './catalog.mjs';

export const modelId = 'Xenova/all-MiniLM-L6-v2';
export const modelDirectory = fileURLToPath(new URL('../models/', import.meta.url));

export async function loadModel() {
  env.allowRemoteModels = false;
  env.localModelPath = modelDirectory;
  env.useFSCache = false;
  const extractor = await pipeline('feature-extraction', modelId, { dtype: 'q8', device: 'cpu', local_files_only: true });
  const embed = async text => (await extractor(text, { pooling: 'mean', normalize: true })).tolist()[0];
  const vectors = (await extractor(cues.map(cue => `${cue.title}. ${cue.meaning}`), { pooling: 'mean', normalize: true })).tolist();
  return { embed, vectors, dispose: () => extractor.dispose() };
}
