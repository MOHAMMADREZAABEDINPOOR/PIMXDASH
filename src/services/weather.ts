import { WeatherData, WeatherLocation } from '../types';
import { storage } from './storage';

const CACHE_KEY = 'cached_weather';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const hasCityName = (weather: WeatherData): boolean =>
  !!weather.city && !/^(current location|local|unknown)$/i.test(weather.city.trim());

export class WeatherService {
  static async getWeather(isCelsius: boolean = true, forcePrompt: boolean = false, location?: WeatherLocation | null, allowNetwork: boolean = true): Promise<WeatherData> {
    try {
      const cacheKey = `${CACHE_KEY}_${isCelsius ? 'c' : 'f'}_${location ? `${location.latitude}_${location.longitude}` : 'auto'}`;
      // Check cache first (unless forced)
      if (!forcePrompt) {
        const cached = await storage.get<WeatherData | null>(cacheKey, null);
        if (cached && hasCityName(cached) && Date.now() - cached.lastUpdated < CACHE_TTL_MS) {
          return cached;
        }
      }

      if (!allowNetwork) throw new Error('Online weather is paused');

      // Try geolocation safely without triggering Chrome permission block warnings
      const coords = location
        ? { lat: location.latitude, lon: location.longitude, name: location.name, source: 'city' as const }
        : await this.getCoordinates(forcePrompt);
      const [data, resolvedCity] = await Promise.all([
        this.fetchOpenMeteo(coords.lat, coords.lon, isCelsius),
        coords.source === 'location'
          ? this.reverseCurrentCity(coords.lat, coords.lon)
          : Promise.resolve(null),
      ]);
      data.city = coords.name || resolvedCity || data.city;
      data.source = coords.source;
      await storage.set(cacheKey, data);
      return data;
    } catch (e) {
      console.warn('Using cached or fallback weather data due to:', e);
      const cacheKey = `${CACHE_KEY}_${isCelsius ? 'c' : 'f'}_${location ? `${location.latitude}_${location.longitude}` : 'auto'}`;
      const cached = await storage.get<WeatherData | null>(cacheKey, null);
      if (cached && hasCityName(cached)) return cached;
      return { ...this.getFallbackWeather(), city: location?.name || 'Tehran', source: 'fallback' };
    }
  }

  static async searchCities(query: string): Promise<WeatherLocation[]> {
    if (query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error('City search failed');
    const data = await response.json();
    return (data.results || []).map((item: { name: string; latitude: number; longitude: number; country?: string; admin1?: string }) => ({
      name: item.admin1 ? `${item.name}, ${item.admin1}` : item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
    }));
  }

  private static async getCoordinates(forcePrompt: boolean = false): Promise<{ lat: number; lon: number; name?: string; source: 'location' | 'fallback' }> {
    const defaultCoords = { lat: 35.6892, lon: 51.3890, name: 'Tehran', source: 'fallback' as const };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return defaultCoords;
    }

    try {
      // Ask on first use so the default follows the user, then remember the choice.
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' }).catch(() => null);
        if (permission) {
          // If denied, do not attempt getCurrentPosition to prevent Chrome logging an error
          if (permission.state === 'denied') {
            return defaultCoords;
          }
          if (permission.state === 'prompt' && !forcePrompt && sessionStorage.getItem('pimxdash_geo_prompted')) return defaultCoords;
        }
      }
    } catch {
      // Permissions API may throw or be unsupported in some contexts
    }

    sessionStorage.setItem('pimxdash_geo_prompted', '1');
    return new Promise((resolve) => {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'location' });
          },
          () => {
            // Fallback on user decline or timeout
            resolve(defaultCoords);
          },
          { timeout: 4000, maximumAge: 1000 * 60 * 60 }
        );
      } catch {
        resolve(defaultCoords);
      }
    });
  }

  private static async reverseCurrentCity(lat: number, lon: number): Promise<string | null> {
    try {
      const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lon));
      url.searchParams.set('localityLanguage', 'en');
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const result = await response.json() as { city?: string; locality?: string };
      const city = result.city?.trim() || result.locality?.trim();
      return city && !/^(current location|local|unknown)$/i.test(city) ? city : null;
    } catch {
      return null;
    }
  }

  private static async fetchOpenMeteo(lat: number, lon: number, isCelsius: boolean): Promise<WeatherData> {
    const tempUnit = isCelsius ? 'celsius' : 'fahrenheit';
    const windUnit = isCelsius ? 'kmh' : 'mph';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&forecast_days=4&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Weather fetch failed with status ${res.status}`);

    const json = await res.json();
    const current = json.current;
    const daily = json.daily;

    const conditionCode = current.weather_code || 0;
    const condition = this.getConditionDescription(conditionCode);

    const forecast = daily?.time?.slice(1, 4).map((dateStr: string, i: number) => {
      const date = new Date(dateStr);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day,
        tempMax: Math.round(daily.temperature_2m_max[i + 1]),
        tempMin: Math.round(daily.temperature_2m_min[i + 1]),
        conditionCode: daily.weather_code[i + 1],
      };
    }) || [];

    return {
      temp: Math.round(current.temperature_2m),
      condition,
      conditionCode,
      city: json.timezone ? json.timezone.split('/').pop()?.replace(/_/g, ' ') || 'Local' : 'Local',
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      feelsLike: Math.round(current.apparent_temperature),
      isDay: current.is_day === 1,
      forecast,
      lastUpdated: Date.now(),
    };
  }

  static getConditionDescription(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Partly Cloudy';
  }

  static getConditionDescriptionFa(code: number): string {
    if (code === 0) return 'آسمان صاف';
    if (code >= 1 && code <= 3) return 'کمی ابری';
    if (code === 45 || code === 48) return 'مه‌آلود';
    if (code >= 51 && code <= 55) return 'نم‌نم باران';
    if (code >= 61 && code <= 67) return 'بارانی';
    if (code >= 71 && code <= 77) return 'برفی';
    if (code >= 80 && code <= 82) return 'رگبار باران';
    if (code >= 95) return 'رعد و برق';
    return 'آفتابی و ابری';
  }

  private static getFallbackWeather(): WeatherData {
    return {
      temp: 0,
      condition: 'Weather unavailable',
      conditionCode: 0,
      city: 'Tehran',
      humidity: 0,
      windSpeed: 0,
      feelsLike: 0,
      isDay: true,
      forecast: [],
      unavailable: true,
      lastUpdated: Date.now(),
    };
  }
}
