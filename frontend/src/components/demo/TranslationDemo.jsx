import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, Info } from 'lucide-react';

/**
 * Componente de demostración para mostrar cómo usar el sistema de traducción
 * Este componente se puede usar como referencia para implementar traducciones
 */
const TranslationDemo = () => {
  const { t, currentLanguage, changeLanguage, language } = useTranslation();
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Sistema de Traducción - Demo
        </h3>
      </div>

      <div className="space-y-4">
        {/* Mostrar idioma actual */}
        <div className={`p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-blue-900/20 border-blue-600/30'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-blue-200' : 'text-blue-700'
          }`}>
            <strong>{t('languages.currentLanguage')}:</strong> {language.flag} {language.nativeName}
          </p>
        </div>

        {/* Ejemplos de traducciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className={`font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Navegación:
            </h4>
            <ul className={`space-y-1 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>• {t('navigation.dashboard')}</li>
              <li>• {t('navigation.products')}</li>
              <li>• {t('navigation.movements')}</li>
              <li>• {t('navigation.reports')}</li>
            </ul>
          </div>

          <div>
            <h4 className={`font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Acciones Comunes:
            </h4>
            <ul className={`space-y-1 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>• {t('common.save')}</li>
              <li>• {t('common.edit')}</li>
              <li>• {t('common.delete')}</li>
              <li>• {t('common.export')}</li>
            </ul>
          </div>
        </div>

        {/* Botones de cambio de idioma */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('languages.changeLanguage')}:
          </span>
          <button
            onClick={() => changeLanguage('es')}
            disabled={currentLanguage === 'es'}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              currentLanguage === 'es'
                ? isDarkMode
                  ? 'bg-green-900/30 text-green-400 cursor-default'
                  : 'bg-green-100 text-green-700 cursor-default'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇪🇸 Español
          </button>
          <button
            onClick={() => changeLanguage('en')}
            disabled={currentLanguage === 'en'}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              currentLanguage === 'en'
                ? isDarkMode
                  ? 'bg-green-900/30 text-green-400 cursor-default'
                  : 'bg-green-100 text-green-700 cursor-default'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇺🇸 English
          </button>
        </div>

        {/* Información de implementación */}
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-yellow-900/20 border-yellow-600/30'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className={`font-medium mb-1 ${
                isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                Cómo usar en tus componentes:
              </h4>
              <pre className={`text-xs ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
{`import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t('navigation.dashboard')}</h1>
  );
};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDemo;