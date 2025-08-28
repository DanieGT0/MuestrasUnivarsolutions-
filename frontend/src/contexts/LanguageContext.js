import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../languages';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Obtener idioma inicial del localStorage o usar español por defecto
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('univar-language');
    return saved || 'es';
  });

  // Función para cambiar idioma
  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('univar-language', languageCode);
    
    // Emitir evento personalizado para notificar el cambio
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    }));
  };

  // Función para obtener traducción
  const t = (key, variables = {}) => {
    try {
      // Navegación por el objeto de traducciones usando la clave con puntos
      const keys = key.split('.');
      let translation = translations[currentLanguage];
      
      for (const k of keys) {
        translation = translation?.[k];
      }
      
      // Si no encuentra la traducción, usar la clave en inglés como fallback
      if (!translation && currentLanguage !== 'en') {
        let fallback = translations.en;
        for (const k of keys) {
          fallback = fallback?.[k];
        }
        translation = fallback;
      }
      
      // Si aún no encuentra traducción, devolver la clave original
      if (!translation) {
        console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
        return key;
      }
      
      // Reemplazar variables en la traducción
      let result = translation;
      Object.keys(variables).forEach(variable => {
        result = result.replace(`{{${variable}}}`, variables[variable]);
      });
      
      return result;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  // Obtener información del idioma actual
  const getCurrentLanguageInfo = () => {
    const languages = {
      es: {
        code: 'es',
        name: 'Español',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr'
      },
      en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr'
      }
    };
    
    return languages[currentLanguage] || languages.es;
  };

  // Obtener lista de idiomas disponibles
  const getAvailableLanguages = () => [
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' }
  ];

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguageInfo,
    getAvailableLanguages,
    isRTL: getCurrentLanguageInfo().direction === 'rtl'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};