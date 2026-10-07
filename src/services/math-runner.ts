/**
 * Inline Command Pipe & Quick Evaluator
 * Safely parses and evaluates mathematical expressions, units, and color conversions.
 * Zero external dependencies, pure local evaluation.
 */

export interface EvaluationResult {
  type: 'math' | 'unit' | 'color' | 'time' | 'crypto';
  label: string;
  result: string;
  subtext?: string;
}

export class QueryRunner {
  static evaluate(query: string): EvaluationResult | null {
    const q = query.trim();
    if (!q) return null;

    // 1. Math Expression (starts with '=' or contains obvious math operators)
    const mathMatch = this.tryMath(q);
    if (mathMatch) return mathMatch;

    // 2. Color conversion (starts with # or rgb)
    const colorMatch = this.tryColor(q);
    if (colorMatch) return colorMatch;

    // 3. Unit conversion (e.g., "100 km to miles", "75 kg in lbs", "25 c in f")
    const unitMatch = this.tryUnit(q);
    if (unitMatch) return unitMatch;

    // 4. Time query (e.g., "time tokyo", "time london", "time tehran", "time new york")
    const timeMatch = this.tryTime(q);
    if (timeMatch) return timeMatch;

    return null;
  }

  private static tryMath(q: string): EvaluationResult | null {
    let expr = q;
    let explicit = false;

    if (expr.startsWith('=')) {
      expr = expr.substring(1).trim();
      explicit = true;
    }

    // Only allow safe characters: digits, operators, parens, decimal, spaces, pi, e
    if (!/^[0-9+\-*/^(). %piePIE]+$/.test(expr)) return null;

    // If not explicit '=', check if it looks like a real math equation (e.g., "45 * 2" or "1024 / 8")
    if (!explicit && !/[+\-*/^%]/.test(expr)) return null;

    try {
      // Replace power operator
      const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E');

      // Safe evaluation using Function with no access to window or globals
      const fn = new Function(`"use strict"; return (${sanitized});`);
      const val = fn();

      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const formatted = Number.isInteger(val) ? val.toLocaleString() : parseFloat(val.toFixed(6)).toString();
        return {
          type: 'math',
          label: 'Calculation Result',
          result: formatted,
          subtext: `${expr} = ${formatted}`,
        };
      }
    } catch {
      // Not a valid math expression
    }

    return null;
  }

  private static tryColor(q: string): EvaluationResult | null {
    // Hex code: #ffffff or #fff or ffffff
    const hexPattern = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const match = q.match(hexPattern);
    if (match) {
      let hex = match[1];
      if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
      }
      hex = hex.toLowerCase();

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Convert to HSL
      const rRel = r / 255;
      const gRel = g / 255;
      const bRel = b / 255;
      const max = Math.max(rRel, gRel, bRel);
      const min = Math.min(rRel, gRel, bRel);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rRel: h = (gRel - bRel) / d + (gRel < bRel ? 6 : 0); break;
          case gRel: h = (bRel - rRel) / d + 2; break;
          case bRel: h = (rRel - gRel) / d + 4; break;
        }
        h /= 6;
      }

      const hDeg = Math.round(h * 360);
      const sPct = Math.round(s * 100);
      const lPct = Math.round(l * 100);

      return {
        type: 'color',
        label: 'Color Conversion',
        result: `rgb(${r}, ${g}, ${b})`,
        subtext: `HEX: #${hex}  •  HSL: hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
      };
    }
    return null;
  }

  private static tryUnit(q: string): EvaluationResult | null {
    const unitRegex = /^([\d.]+)\s*([a-zA-Z]+)\s*(?:to|in)\s*([a-zA-Z]+)$/i;
    const match = q.match(unitRegex);
    if (!match) return null;

    const val = parseFloat(match[1]);
    const from = match[2].toLowerCase();
    const to = match[3].toLowerCase();
    if (isNaN(val)) return null;

    // Length
    if ((from === 'km' || from === 'kilometers') && (to === 'miles' || to === 'mi')) {
      const res = (val * 0.621371).toFixed(2);
      return { type: 'unit', label: 'Unit Conversion', result: `${res} miles`, subtext: `${val} km = ${res} mi` };
    }
    if ((from === 'miles' || from === 'mi') && (to === 'km' || to === 'kilometers')) {
      const res = (val / 0.621371).toFixed(2);
      return { type: 'unit', label: 'Unit Conversion', result: `${res} km`, subtext: `${val} mi = ${res} km` };
    }

    // Weight
    if ((from === 'kg' || from === 'kilos') && (to === 'lbs' || to === 'pounds')) {
      const res = (val * 2.20462).toFixed(2);
      return { type: 'unit', label: 'Unit Conversion', result: `${res} lbs`, subtext: `${val} kg = ${res} lbs` };
    }
    if ((from === 'lbs' || from === 'pounds') && (to === 'kg' || to === 'kilos')) {
      const res = (val / 2.20462).toFixed(2);
      return { type: 'unit', label: 'Unit Conversion', result: `${res} kg`, subtext: `${val} lbs = ${res} kg` };
    }

    // Temperature
    if (from === 'c' && to === 'f') {
      const res = ((val * 9) / 5 + 32).toFixed(1);
      return { type: 'unit', label: 'Temperature', result: `${res} °F`, subtext: `${val}°C = ${res}°F` };
    }
    if (from === 'f' && to === 'c') {
      const res = (((val - 32) * 5) / 9).toFixed(1);
      return { type: 'unit', label: 'Temperature', result: `${res} °C`, subtext: `${val}°F = ${res}°C` };
    }

    return null;
  }

  private static tryTime(q: string): EvaluationResult | null {
    if (!q.toLowerCase().startsWith('time ')) return null;
    const city = q.substring(5).trim().toLowerCase();

    const timezones: Record<string, string> = {
      tehran: 'Asia/Tehran',
      tokyo: 'Asia/Tokyo',
      london: 'Europe/London',
      'new york': 'America/New_York',
      ny: 'America/New_York',
      paris: 'Europe/Paris',
      berlin: 'Europe/Berlin',
      dubai: 'Asia/Dubai',
      sydney: 'Australia/Sydney',
      'san francisco': 'America/Los_Angeles',
      sf: 'America/Los_Angeles',
    };

    const tz = timezones[city];
    if (!tz) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });

    return {
      type: 'time',
      label: `Current Time in ${city.charAt(0).toUpperCase() + city.slice(1)}`,
      result: timeStr,
      subtext: `${dateStr} (${tz})`,
    };
  }
}
