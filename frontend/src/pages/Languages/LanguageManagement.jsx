import React, { useState, useEffect } from 'react';
import { Globe, Check, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

const LanguageManagement = () => {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Definir idiomas con información detallada
  const languages = [
    {
      code: 'es',
      name: 'Español',
      nativeName: 'Español',
      flag: '🇪🇸',
      region: 'Guatemala',
      description: 'Interfaz completa en español adaptada para el mercado latinoamericano',
      features: ['Formato de fecha DD/MM/YYYY', 'Moneda en USD', 'Terminología comercial regional']
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      region: 'United States',
      description: 'Complete English interface for international operations',
      features: ['Date format MM/DD/YYYY', 'Currency in USD', 'International business terminology']
    }
  ];

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === currentLanguage) return;
    
    setIsChanging(true);
    
    try {
      // Simular pequeño delay para UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      changeLanguage(languageCode);
      setShowSuccess(true);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-lg ${
              isDarkMode 
                ? 'bg-blue-900/20 border border-blue-600/30' 
                : 'bg-blue-50'
            }`}>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t('languages.title')}
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('languages.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className={`mb-6 rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-green-900/20 border-green-600/30 text-green-300'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">{t('languages.languageChanged')}</span>
            </div>
          </div>
        )}

        {/* Current Language Info */}
        <div className={`rounded-lg shadow-lg p-6 mb-8 ${
          isDarkMode ? 'glass-card' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {t('languages.currentLanguage')}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </span>
              <div>
                <div className={`text-xl font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {languages.find(lang => lang.code === currentLanguage)?.nativeName}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {languages.find(lang => lang.code === currentLanguage)?.region}
                </div>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode
                ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                : 'bg-green-100 text-green-700'
            }`}>
              {t('common.active')}
            </div>
          </div>
        </div>

        {/* Available Languages */}
        <div className={`rounded-lg shadow-lg p-6 mb-8 ${
          isDarkMode ? 'glass-card' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {t('languages.availableLanguages')}
          </h3>

          <div className="space-y-4">
            {languages.map((language) => {
              const isActive = language.code === currentLanguage;
              const isChangingThis = isChanging && language.code !== currentLanguage;
              
              return (
                <div
                  key={language.code}
                  className={`rounded-lg border transition-all duration-200 ${
                    isActive 
                      ? isDarkMode
                        ? 'border-blue-600/50 bg-blue-900/10'
                        : 'border-blue-200 bg-blue-50'
                      : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{language.flag}</span>
                        <div>
                          <div className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {language.nativeName}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {language.name} • {language.region}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleLanguageChange(language.code)}
                        disabled={isActive || isChangingThis}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? isDarkMode
                              ? 'bg-green-900/30 text-green-400 cursor-default'
                              : 'bg-green-100 text-green-700 cursor-default'
                            : isChangingThis
                              ? isDarkMode
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDarkMode
                                ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-600/30'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isChangingThis && (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        )}
                        {isActive && (
                          <Check className="h-4 w-4" />
                        )}
                        <span>
                          {isActive 
                            ? t('common.active')
                            : isChangingThis 
                              ? t('common.loading')
                              : t('languages.changeLanguage')
                          }
                        </span>
                      </button>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {language.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {language.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Information Panel */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode
            ? 'bg-blue-900/10 border-blue-600/30'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Información Importante
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                {t('languages.description')}
              </p>
              {showSuccess && (
                <p className={`text-sm mt-2 font-medium ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  {t('languages.restartRequired')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageManagement;