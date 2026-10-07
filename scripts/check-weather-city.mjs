import assert from 'node:assert/strict';
import { build } from 'esbuild';

const cache = new Map();
globalThis.localStorage = {
  getItem: (key) => cache.get(key) ?? null,
  setItem: (key, value) => { cache.set(key, value); },
  removeItem: (key) => { cache.delete(key); },
};
globalThis.sessionStorage = {
  getItem: (key) => cache.get(`session:${key}`) ?? null,
  setItem: (key, value) => { cache.set(`session:${key}`, value); },
};
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    permissions: { query: async () => ({ state: 'granted' }) },
    geolocation: { getCurrentPosition: (success) => success({ coords: { latitude: 34.6416, longitude: 50.8746 } }) },
  },
});

const calls = [];
globalThis.fetch = async (input) => {
  const url = String(input);
  calls.push(url);
  if (url.startsWith('https://api.bigdatacloud.net/')) {
    return { ok: true, json: async () => ({ city: 'Qom', locality: 'Safashahr' }) };
  }
  if (url.startsWith('https://api.open-meteo.com/')) {
    return {
      ok: true,
      json: async () => ({
        timezone: 'Asia/Tehran',
        current: { temperature_2m: 29, relative_humidity_2m: 40, apparent_temperature: 31, is_day: 1, weather_code: 0, wind_speed_10m: 7 },
        daily: { time: ['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'], temperature_2m_max: [30, 31, 29, 28], temperature_2m_min: [20, 21, 19, 18], weather_code: [0, 1, 2, 3] },
      }),
    };
  }
  throw new Error(`Unexpected weather request: ${url}`);
};

const output = await build({ entryPoints: ['src/services/weather.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { WeatherService } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);

cache.set('pimxdash_cached_weather_c_auto', JSON.stringify({ city: 'Current location', source: 'location', lastUpdated: Date.now(), temp: 29 }));
const current = await WeatherService.getWeather(true, false, null, true);
assert.equal(current.city, 'Qom', 'the current location should resolve to its actual city');
assert.equal(current.source, 'location');
assert.equal(calls.filter((url) => url.startsWith('https://api.bigdatacloud.net/')).length, 1, 'old placeholder cache must be refreshed');

const selected = await WeatherService.getWeather(true, true, { name: 'Shiraz', latitude: 29.5918, longitude: 52.5837 }, true);
assert.equal(selected.city, 'Shiraz', 'a manually selected city must remain authoritative');
assert.equal(calls.filter((url) => url.startsWith('https://api.bigdatacloud.net/')).length, 1, 'manual city coordinates must not be sent for reverse lookup');

console.log('Weather city resolution and stale cache checks passed.');
