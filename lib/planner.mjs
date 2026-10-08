import { cues } from './catalog.mjs';

export function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.');
  const { wish, place, minutes } = value;
  if (typeof wish !== 'string' || !wish.trim() || wish.length > 300) throw new Error('Use 1 to 300 characters.');
  if (!['any', 'park', 'street'].includes(place)) throw new Error('Choose a setting.');
  if (![5, 10, 15].includes(minutes)) throw new Error('Choose 5, 10, or 15 minutes.');
  return { wish: wish.trim(), place, minutes };
}

export function dot(a, b) {
  if (a.length !== b.length || !a.length) throw new Error('Invalid embedding shape.');
  const result = a.reduce((sum, x, i) => sum + x * b[i], 0);
  if (!Number.isFinite(result)) throw new Error('Invalid embedding value.');
  return result;
}

export function selectCues(query, vectors, place, count = 3) {
  if (vectors.length !== cues.length) throw new Error('Invalid catalog embeddings.');
  return cues.map((cue, i) => ({ ...cue, similarity: dot(query, vectors[i]) }))
    .filter(cue => place === 'any' || cue.place === 'any' || cue.place === place)
    .sort((a, b) => b.similarity - a.similarity || a.id.localeCompare(b.id))
    .slice(0, count);
}

export async function createPlan(input, embed, catalogVectors) {
  const request = validateRequest(input);
  const query = await embed(request.wish);
  return { ...request, cues: selectCues(query, catalogVectors, request.place),
    note: 'Choose a familiar public place and comfortable conditions. You can stay seated outdoors. Stop whenever you prefer. No route or weather assessment is provided.' };
}
