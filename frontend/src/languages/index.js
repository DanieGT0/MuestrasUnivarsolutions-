import { es } from './es';
import { en } from './en';

export const translations = {
  es,
  en
};

export const defaultLanguage = 'es';

// Validar que existe una traducción
export const hasTranslation = (language) => {
  return translations.hasOwnProperty(language);
};

// Obtener idiomas disponibles
export const getAvailableLanguages = () => {
  return Object.keys(translations);
};

// Obtener información de idioma
export const getLanguageInfo = (languageCode) => {
  const languagesInfo = {
    es: {
      code: 'es',
      name: 'Español',
      nativeName: 'Español',
      flag: '🇪🇸',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      currency: 'USD',
      region: 'GT'
    },
    en: {
      code: 'en',
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      region: 'US'
    }
  };
  
  return languagesInfo[languageCode] || languagesInfo.es;
};