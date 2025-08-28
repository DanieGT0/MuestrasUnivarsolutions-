import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, FileSpreadsheet, Trash2, 
  Globe, FolderOpen, Upload, Download, Shield 
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import ImportProducts from './ImportProducts';
import DeleteData from './DeleteData';
import Countries from './Countries';
import Categories from './Categories';
import SystemConfig from './SystemConfig';

const Settings = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('import');

  const tabs = [
    {
      id: 'import',
      name: t('settings.tabs.import.name'),
      icon: Upload,
      component: ImportProducts,
      description: t('settings.tabs.import.description')
    },
    {
      id: 'delete',
      name: t('settings.tabs.delete.name'),
      icon: Trash2,
      component: DeleteData,
      description: t('settings.tabs.delete.description')
    },
    {
      id: 'countries',
      name: t('settings.tabs.countries.name'),
      icon: Globe,
      component: Countries,
      description: t('settings.tabs.countries.description')
    },
    {
      id: 'categories',
      name: t('settings.tabs.categories.name'),
      icon: FolderOpen,
      component: Categories,
      description: t('settings.tabs.categories.description')
    },
    {
      id: 'system',
      name: t('settings.tabs.system.name'),
      icon: Shield,
      component: SystemConfig,
      description: t('settings.tabs.system.description')
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className={`min-h-screen p-6 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t('settings.title')}
            </h1>
          </div>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Navegación de tabs */}
        <div className={`rounded-lg shadow-lg mb-6 ${
          isDarkMode ? 'glass-card' : 'bg-white'
        }`}>
          <div className={`border-b ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    style={activeTab === tab.id ? {
                      color: 'var(--color-primary)',
                      borderBottomColor: 'var(--color-primary)',
                      backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'
                    } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Descripción del tab activo */}
          <div className={`px-6 py-3 border-b ${
            isDarkMode 
              ? 'bg-gray-700/30 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {activeTabData?.description}
            </p>
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className={`rounded-lg shadow-lg p-6 ${
          isDarkMode ? 'glass-card' : 'bg-white'
        }`}>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default Settings;