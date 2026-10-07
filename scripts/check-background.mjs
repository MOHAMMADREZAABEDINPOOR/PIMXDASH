import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

let listener;
let installed;
let alarmListener;
let storageListener;
let shield = { enabled: true, strictMode: false, blocklist: ['example.com'] };
let reminders = [];
const calls = [];
globalThis.chrome = {
  tabs: {
    onUpdated: { addListener(callback) { listener = callback; } },
    update(id, options) { calls.push(['update', id, options.url]); },
    remove(id) { calls.push(['remove', id]); },
  },
  storage: {
    local: { get(key, callback) { const result = key === 'focus_shield' ? { focus_shield: shield } : { calendar_reminders: reminders }; if (callback) callback(result); else return Promise.resolve(result); } },
    onChanged: { addListener(callback) { storageListener = callback; } },
  },
  alarms: {
    onAlarm: { addListener(callback) { alarmListener = callback; } },
    getAll: async () => [],
    create: async (name, options) => { calls.push(['alarm', name, options.when]); },
    clear: async () => {},
  },
  notifications: {
    onClicked: { addListener() {} },
    create: async (id, options) => { calls.push(['notification', id, options.message]); },
  },
  runtime: {
    lastError: null,
    getURL(path) { return `chrome-extension://test/${path}`; },
    onInstalled: { addListener(callback) { installed = callback; } },
    onStartup: { addListener() {} },
  },
};

await import(pathToFileURL(resolve('dist/assets/background.js')).href);
assert.equal(typeof listener, 'function');
listener(1, { url: 'https://sub.example.com/page' });
assert.deepEqual(calls.pop(), ['update', 1, 'chrome-extension://test/newtab.html']);
listener(2, { url: 'https://notexample.com/' });
assert.equal(calls.length, 0);
shield = { enabled: true, strictMode: true, blocklist: ['example.com'] };
listener(3, { url: 'https://example.com/' });
assert.deepEqual(calls.pop(), ['remove', 3]);
shield = { enabled: true, pauseUntil: Date.now() + 60_000, blocklist: ['example.com'] };
listener(4, { url: 'https://example.com/' });
assert.equal(calls.length, 0);
shield = { enabled: false, sessionUntil: Date.now() + 60_000, blocklist: ['example.com'] };
listener(5, { url: 'https://example.com/' });
assert.deepEqual(calls.pop(), ['update', 5, 'chrome-extension://test/newtab.html']);
assert.equal(typeof installed, 'function');
assert.equal(typeof storageListener, 'function');
reminders = [{ id: 'one', date: '2099-01-01', time: '10:30', title: 'Important meeting' }];
installed();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.deepEqual(calls.pop().slice(0, 2), ['alarm', 'calendar:one']);
await alarmListener({ name: 'calendar:one' });
assert.deepEqual(calls.pop(), ['notification', 'reminder:one', 'Important meeting']);
console.log('Background Focus Shield checks passed.');
