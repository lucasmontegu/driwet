// apps/native/lib/i18n.ts
import { initI18n, type SupportedLanguage } from '@advia/i18n';
import * as Localization from 'expo-localization';

export function setupI18n() {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  const lng: SupportedLanguage = deviceLocale === 'es' ? 'es' : 'en';
  return initI18n(lng);
}

export { useTranslation, i18n } from '@advia/i18n';
