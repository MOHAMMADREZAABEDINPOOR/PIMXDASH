import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({ entryPoints: ['src/services/bookmark-workspace.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const source = result.outputFiles[0].text;
const { cleanTrackingUrl, canonicalBookmarkUrl, duplicateBookmarkIds } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

assert.equal(cleanTrackingUrl('https://www.example.com/story?utm_source=mail&id=42#part'), 'https://www.example.com/story?id=42#part');
assert.equal(cleanTrackingUrl('https://www.example.com/story?id=42#part'), 'https://www.example.com/story?id=42#part');
assert.equal(canonicalBookmarkUrl('https://www.example.com/story/?utm_source=mail#part'), 'https://example.com/story');
assert.deepEqual([...duplicateBookmarkIds([
  { id: 'first', url: 'https://example.com/story/' },
  { id: 'second', url: 'https://www.example.com/story?utm_source=mail' },
  { id: 'third', url: 'https://example.com/other' },
])], ['second']);

console.log('Bookmark normalization and duplicate checks passed.');
