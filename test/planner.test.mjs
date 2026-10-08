import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, dot, selectCues, createPlan } from '../lib/planner.mjs';
import { cues } from '../lib/catalog.mjs';

test('request trims text without storing it', () => assert.deepEqual(validateRequest({ wish: ' clouds ', place: 'any', minutes: 5 }), { wish: 'clouds', place: 'any', minutes: 5 }));
for (const wish of ['', '   ', 'x'.repeat(301), null, 123]) test(`reject invalid wish ${String(wish).slice(0, 10)}`, () => assert.throws(() => validateRequest({ wish, place: 'any', minutes: 5 })));
test('reject invalid setting', () => assert.throws(() => validateRequest({ wish: 'sky', place: 'private', minutes: 5 })));
test('reject invalid time', () => assert.throws(() => validateRequest({ wish: 'sky', place: 'any', minutes: 6 })));
test('dot product', () => assert.equal(dot([1, 0], [0.5, 0.5]), 0.5));
test('reject shape mismatch', () => assert.throws(() => dot([1], [1, 2])));
test('reject NaN', () => assert.throws(() => dot([NaN], [1])));
test('select actual catalog IDs by ranked vectors', () => { const v = cues.map((_, i) => [i / 20, 0]); assert.equal(selectCues([1, 0], v, 'any')[0].id, cues.at(-1).id); });
test('street excludes park-only prompts', () => { const v = cues.map(() => [1]); assert.ok(selectCues([1], v, 'street', 12).every(x => x.place !== 'park')); });
test('catalog vectors must align', () => assert.throws(() => selectCues([1], [], 'any')));
test('failed inference stays failure, no fallback', async () => assert.rejects(() => createPlan({ wish: 'sky', place: 'any', minutes: 5 }, async () => { throw Error('disconnected'); }, [])));
test('successful plan preserves evidence and safety notice', async () => { const p = await createPlan({ wish: 'sky', place: 'any', minutes: 5 }, async () => [1], cues.map(() => [1])); assert.equal(p.cues.length, 3); assert.match(p.note, /No route or weather/); });
