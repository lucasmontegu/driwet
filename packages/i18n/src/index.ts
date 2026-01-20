// packages/i18n/src/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

export const defaultNS = 'translation';
export const fallbackLng = 'en';
export const supportedLngs = ['en', 'es'] as const;

export type SupportedLanguage = (typeof supportedLngs)[number];

export function initI18n(lng: SupportedLanguage = 'es') {
  return i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });
}

export { i18n };
export { useTranslation, Trans } from 'react-i18next';
