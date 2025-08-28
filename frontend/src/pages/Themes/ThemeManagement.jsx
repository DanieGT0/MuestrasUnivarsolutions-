import React, { useState } from 'react';
import {
  Palette, Sun, Moon, Monitor, RefreshCw,
  Eye, Globe2, RotateCcw, Sparkles, Settings2, Brush
} from 'lucide-react';
import { useTheme, THEME_PALETTES } from '../../contexts/ThemeContext';
import { 
  Card, CardHeader, CardContent, Button, Badge, PageHeader
} from '../../components/ui';

// Component for color preview circle
const ColorCircle = ({ color, size = "w-8 h-8", className = "" }) => (
  <div 
    className={`${size} rounded-full border-2 border-white shadow-md ${className}`}
    style={{ backgroundColor: color }}
  />
);

// Component for dark mode toggle
const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  const modes = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor }
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings2 className="h-5 w-5 mr-2" />
          Display Mode
        </h3>
        <p className="text-sm text-gray-600">Choose your preferred display mode</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {modes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => key === 'dark' ? onToggle() : key === 'light' && onToggle()}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                (key === 'dark' && isDarkMode) || (key === 'light' && !isDarkMode)
                  ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              style={(key === 'dark' && isDarkMode) || (key === 'light' && !isDarkMode) ? 
                { 
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                  color: 'var(--color-primary)'
                } : {}
              }
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for live preview
const LivePreview = ({ colors, isDarkMode }) => (
  <Card>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Eye className="h-5 w-5 mr-2" />
        Live Preview
      </h3>
      <p className="text-sm text-gray-600">See how your theme looks in action</p>
    </CardHeader>
    <CardContent>
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'glass-card' : 'bg-gray-50 border-gray-200'}`}>
        {/* Mock header */}
        <div className={`flex items-center justify-between p-4 rounded-lg mb-4 shadow-sm ${
          isDarkMode ? 'bg-gray-700 border border-gray-600 glass-card' : 'bg-white border border-gray-200'
        }`} style={{ borderLeft: `4px solid ${colors.primary}` }}>
          <div>
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Sample Header
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This is how your interface will look
            </p>
          </div>
          <Globe2 className="h-6 w-6" style={{ color: colors.primary }} />
        </div>

        {/* Mock buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            Primary Action
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.secondary }}
          >
            Secondary Action
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.success }}
          >
            Success
          </button>
        </div>

        {/* Mock navigation */}
        <div className="flex space-x-2">
          {['Dashboard', 'Products', 'Reports'].map((item, index) => (
            <div
              key={item}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === 0 
                  ? 'text-white shadow-sm'
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600' 
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={index === 0 ? { backgroundColor: colors.primary } : {}}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Component for color customization
const ColorCustomizer = ({ colors, onColorChange }) => {
  const colorKeys = [
    { key: 'primary', label: 'Primary', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary actions' },
    { key: 'accent', label: 'Accent', description: 'Highlighting elements' },
    { key: 'success', label: 'Success', description: 'Success states' },
    { key: 'warning', label: 'Warning', description: 'Warning states' },
    { key: 'danger', label: 'Danger', description: 'Error states' }
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brush className="h-5 w-5 mr-2" />
          Custom Colors
        </h3>
        <p className="text-sm text-gray-600">Fine-tune your color palette</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorKeys.map(({ key, label, description }) => (
            <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <ColorCircle color={colors[key]} size="w-10 h-10" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ThemeManagement = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    updateCustomColor, 
    resetToDefault,
    getCurrentColors 
  } = useTheme();

  const currentColors = getCurrentColors();

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer todos los ajustes del tema por defecto?')) {
      resetToDefault();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50/50'}`}>
      {/* Professional Header */}
      <PageHeader
        title="Personalización de Tema"
        description="Personaliza los colores de tu aplicación y configura el modo de visualización"
        icon={Palette}
        badge={
          <Badge variant="info" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Personalizable</span>
          </Badge>
        }
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restablecer por Defecto</span>
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Display Mode Section */}
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />


          {/* Two Column Layout for Advanced Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Customization */}
            <ColorCustomizer 
              colors={currentColors}
              onColorChange={updateCustomColor}
            />

            {/* Live Preview */}
            <LivePreview 
              colors={currentColors}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Theme Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Current Theme Status</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {isDarkMode ? 'Dark' : 'Light'}
                  </div>
                  <p className="text-sm text-gray-600">Display Mode</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    Custom
                  </div>
                  <p className="text-sm text-gray-600">Theme Type</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeManagement;