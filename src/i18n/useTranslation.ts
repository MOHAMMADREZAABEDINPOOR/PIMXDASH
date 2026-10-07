import { translations, TranslationKey } from './translations';
import { Language } from '../types';

export function getTranslations(lang: Language): TranslationKey {
  return translations[lang] || translations.en;
}

export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatBilingualNumber(num: number | string, lang: Language): string {
  if (lang === 'fa') {
    return toPersianDigits(num);
  }
  return String(num);
}
