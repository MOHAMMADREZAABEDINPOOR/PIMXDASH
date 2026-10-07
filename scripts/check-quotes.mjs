import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/services/quotes.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  write: false,
});

const data = new Map();
globalThis.localStorage = {
  getItem: (key) => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, value),
  removeItem: (key) => data.delete(key),
};

const { QuoteService } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
let calls = 0;
globalThis.fetch = async () => {
  calls += 1;
  return { ok: true, json: async () => [
    { q: 'A fresh quote.', a: 'Author One' },
    { q: 'Another fresh quote.', a: 'Author Two' },
  ] };
};

const live = await QuoteService.load(true);
assert.equal(live.source, 'zenquotes.io');
assert.equal(live.quotes.length, 2);
assert.equal(calls, 1);
await QuoteService.saveIndex(1);
const cached = await QuoteService.load(true);
assert.equal(cached.index, 1);
assert.equal(calls, 1, 'fresh cache should avoid another request');

const persisted = JSON.parse(data.get('pimxdash_wisdom_quotes_v2'));
persisted.fetchedAt = Date.now() - 2 * 24 * 60 * 60 * 1000;
data.set('pimxdash_wisdom_quotes_v2', JSON.stringify(persisted));
const paused = await QuoteService.load(false);
assert.equal(paused.index, 1);
assert.equal(calls, 1, 'disabled network must not fetch');

globalThis.fetch = async () => { calls += 1; throw new Error('offline'); };
const offlineWithCache = await QuoteService.load(true);
assert.equal(offlineWithCache.quotes[1].text, 'Another fresh quote.');
data.clear();
const offlineWithoutCache = await QuoteService.load(true);
assert.equal(offlineWithoutCache.source, 'offline-famous');
assert.ok(offlineWithoutCache.quotes.length > 0);

console.log('Quote feed checks passed.');
