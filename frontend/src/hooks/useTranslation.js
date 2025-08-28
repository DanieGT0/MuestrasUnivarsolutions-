import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook personalizado para usar el sistema de traducción
 * Proporciona acceso fácil a las traducciones y funciones de idioma
 */
export const useTranslation = () => {
  const {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguageInfo,
    getAvailableLanguages,
    isRTL
  } = useLanguage();

  // Función helper para traducir arrays de opciones
  const translateOptions = (options, keyPath) => {
    return options.map(option => ({
      ...option,
      label: t(`${keyPath}.${option.value}`, option.variables)
    }));
  };

  // Función helper para formatear fechas según el idioma
  const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const languageInfo = getCurrentLanguageInfo();
    const locale = languageInfo.region ? `${languageInfo.code}-${languageInfo.region}` : languageInfo.code;
    
    try {
      return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toString();
    }
  };

  // Función helper para formatear números/moneda
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    
    const languageInfo = getCurrentLanguageInfo();
    const locale = languageInfo.region ? `${languageInfo.code}-${languageInfo.region}` : languageInfo.code;
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || languageInfo.currency || 'USD'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount}`;
    }
  };

  // Función helper para formatear números
  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return '';
    
    const languageInfo = getCurrentLanguageInfo();
    const locale = languageInfo.region ? `${languageInfo.code}-${languageInfo.region}` : languageInfo.code;
    
    try {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
        ...options
      }).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  };

  return {
    // Funciones principales
    t,
    currentLanguage,
    changeLanguage,
    
    // Información de idioma
    language: getCurrentLanguageInfo(),
    availableLanguages: getAvailableLanguages(),
    isRTL,
    
    // Helpers
    translateOptions,
    formatDate,
    formatCurrency,
    formatNumber
  };
};