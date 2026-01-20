// apps/web/src/lib/i18n.ts
"use client";
import { initI18n, i18n, type SupportedLanguage } from '@advia/i18n';
import { I18nextProvider, useTranslation } from 'react-i18next';

export function setupI18n() {
  const browserLang = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';
  const lng: SupportedLanguage = browserLang === 'es' ? 'es' : 'en';
  return initI18n(lng);
}

export function getI18nInstance() {
  return i18n;
}

export { I18nextProvider, useTranslation };
