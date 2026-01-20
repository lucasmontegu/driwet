// apps/web/src/lib/i18n.ts
import { initI18n, type SupportedLanguage } from '@advia/i18n';

export function setupI18n() {
  const browserLang = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';
  const lng: SupportedLanguage = browserLang === 'es' ? 'es' : 'en';
  return initI18n(lng);
}

export { useTranslation, i18n } from '@advia/i18n';
