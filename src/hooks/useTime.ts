import { useState, useEffect } from 'react';
import { Language } from '../types';
import { formatBilingualNumber } from '../i18n/useTranslation';

export interface SolarPhase {
  name: string;
  nameFa: string;
  progressPercent: number; // 0 to 100% of day
  color: string;
}

export function useTime(is24h: boolean = true, showSeconds: boolean = false, lang: Language = 'en') {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursRaw = now.getHours();
  const minutesRaw = now.getMinutes();
  const secondsRaw = now.getSeconds();

  let displayHours = hoursRaw;
  let ampm = '';

  if (!is24h) {
    ampm = hoursRaw >= 12 ? 'PM' : 'AM';
    displayHours = hoursRaw % 12 || 12;
  }

  const hoursStr = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  const minutesStr = minutesRaw < 10 ? `0${minutesRaw}` : `${minutesRaw}`;
  const secondsStr = secondsRaw < 10 ? `0${secondsRaw}` : `${secondsRaw}`;

  const timeString = `${formatBilingualNumber(hoursStr, lang)}:${formatBilingualNumber(minutesStr, lang)}${
    showSeconds ? `:${formatBilingualNumber(secondsStr, lang)}` : ''
  }${!is24h ? ` ${ampm}` : ''}`;

  // Date strings
  let dateString = '';
  if (lang === 'fa') {
    try {
      dateString = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(now);
    } catch {
      dateString = now.toLocaleDateString();
    }
  } else {
    dateString = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(now);
  }

  // Greeting based on hour
  let greetingKey: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  if (hoursRaw >= 5 && hoursRaw < 12) {
    greetingKey = 'morning';
  } else if (hoursRaw >= 12 && hoursRaw < 17) {
    greetingKey = 'afternoon';
  } else if (hoursRaw >= 17 && hoursRaw < 22) {
    greetingKey = 'evening';
  } else {
    greetingKey = 'night';
  }

  // Circadian Solar Phase Calculation (Day starts at 00:00 to 24:00)
  const totalSecondsToday = hoursRaw * 3600 + minutesRaw * 60 + secondsRaw;
  const progressPercent = Math.min(100, Math.max(0, (totalSecondsToday / 86400) * 100));

  let solarPhase: SolarPhase = {
    name: 'Day',
    nameFa: 'روز',
    progressPercent,
    color: '#38bdf8',
  };

  if (hoursRaw >= 5 && hoursRaw < 7) {
    solarPhase = { name: 'Dawn', nameFa: 'طلوع', progressPercent, color: '#fb923c' };
  } else if (hoursRaw >= 7 && hoursRaw < 17) {
    solarPhase = { name: 'Daylight', nameFa: 'روشنایی روز', progressPercent, color: '#38bdf8' };
  } else if (hoursRaw >= 17 && hoursRaw < 19) {
    solarPhase = { name: 'Golden Hour', nameFa: 'غروب آفتاب', progressPercent, color: '#f59e0b' };
  } else if (hoursRaw >= 19 && hoursRaw < 21) {
    solarPhase = { name: 'Dusk', nameFa: 'گرگ و میش', progressPercent, color: '#a855f7' };
  } else {
    solarPhase = { name: 'Night', nameFa: 'شب', progressPercent, color: '#6366f1' };
  }

  return {
    now,
    timeString,
    dateString,
    greetingKey,
    solarPhase,
  };
}
