import locale_cs from '@angular/common/locales/cs';
import locale_de from '@angular/common/locales/de';
import locale_en from '@angular/common/locales/en';
import locale_es from '@angular/common/locales/es';
import locale_fr from '@angular/common/locales/fr';
import locale_id from '@angular/common/locales/id';
import locale_it from '@angular/common/locales/it';
import locale_ja from '@angular/common/locales/ja';
import locale_pl from '@angular/common/locales/pl';
import locale_pt from '@angular/common/locales/pt';
import locale_zh_Hans from '@angular/common/locales/zh-Hans';
import locale_zh_Hant from '@angular/common/locales/zh-Hant';
import { LOCALE_ID, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';

declare const require;

export class LocaleHelper {
  static getBrowserLang(): string {
    const lang = navigator.language;

    if (lang.includes('cs')) {
      return 'cs';
    } else if (lang.includes('de')) {
      return 'de-DE';
    } else if (lang.includes('en')) {
      return 'en-US';
    } else if (lang.includes('es')) {
      return 'es-ES';
    } else if (lang.includes('fr')) {
      return 'fr-FR';
    } else if (lang.includes('id')) {
      return 'id-ID';
    } else if (lang.includes('it')) {
      return 'it-IT';
    } else if (lang.includes('ja')) {
      return 'ja-JP';
    } else if (lang.includes('pl')) {
      return 'pl-PL';
    } else if (lang.includes('pt')) {
      return 'pt-BR';
    } else if (lang.includes('zh-TW')) {
      return 'zh-TW';
    } else if (lang.includes('zh')) {
      return 'zh-CN';
    } else {
      return undefined;
    }
  }

  static getLocale(): string {
    return window.localStorage.getItem('lang') || this.getBrowserLang() || 'en-US';
  }

  static setLocale(lang: string) {
    document.cookie = `cd-lang=${lang}`;
    window.localStorage.setItem('lang', lang);
  }

  static getLocaleData() {
    let localeData = locale_en;
    switch (this.getLocale()) {
      case 'cs':
        localeData = locale_cs;
        break;
      case 'de-DE':
        localeData = locale_de;
        break;
      case 'es-ES':
        localeData = locale_es;
        break;
      case 'fr-FR':
        localeData = locale_fr;
        break;
      case 'id-ID':
        localeData = locale_id;
        break;
      case 'it-IT':
        localeData = locale_it;
        break;
      case 'ja-JP':
        localeData = locale_ja;
        break;
      case 'pl-PL':
        localeData = locale_pl;
        break;
      case 'pt-BR':
        localeData = locale_pt;
        break;
      case 'zh-CN':
        localeData = locale_zh_Hans;
        break;
      case 'zh-TW':
        localeData = locale_zh_Hant;
        break;
    }
    return localeData;
  }
}

const i18nProviders = [
  { provide: LOCALE_ID, useValue: LocaleHelper.getLocale() },
  {
    provide: TRANSLATIONS,
    useFactory: (locale) => {
      locale = locale || 'en-US';
      try {
        return require(`raw-loader!locale/messages.${locale}.xlf`).default;
      } catch (error) {
        return [];
      }
    },
    deps: [LOCALE_ID]
  },
  { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }
];

export { i18nProviders };
