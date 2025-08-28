import React, { createContext, useContext, useState, useEffect } from 'react';

// Color palettes profesionales para empresa internacional
export const THEME_PALETTES = {
  univar: {
    name: 'Univar Classic',
    description: 'Orange-blue corporate theme',
    colors: {
      primary: '#ea580c', // orange-600
      primaryHover: '#dc2626', // orange-700
      primaryLight: '#fed7aa', // orange-200
      secondary: '#2563eb', // blue-600
      secondaryHover: '#1d4ed8', // blue-700
      accent: '#f97316', // orange-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#0ea5e9', // sky-500
    }
  },
  professional: {
    name: 'Professional Blue',
    description: 'Clean blue corporate theme',
    colors: {
      primary: '#1e40af', // blue-800
      primaryHover: '#1e3a8a', // blue-900
      primaryLight: '#bfdbfe', // blue-200
      secondary: '#059669', // emerald-600
      secondaryHover: '#047857', // emerald-700
      accent: '#0ea5e9', // sky-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#3b82f6', // blue-500
    }
  },
  modern: {
    name: 'Modern Purple',
    description: 'Contemporary purple theme',
    colors: {
      primary: '#7c3aed', // violet-600
      primaryHover: '#6d28d9', // violet-700
      primaryLight: '#ddd6fe', // violet-200
      secondary: '#0891b2', // cyan-600
      secondaryHover: '#0e7490', // cyan-700
      accent: '#8b5cf6', // violet-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#06b6d4', // cyan-500
    }
  },
  forest: {
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    colors: {
      primary: '#059669', // emerald-600
      primaryHover: '#047857', // emerald-700
      primaryLight: '#a7f3d0', // emerald-200
      secondary: '#0891b2', // cyan-600
      secondaryHover: '#0e7490', // cyan-700
      accent: '#10b981', // emerald-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#06b6d4', // cyan-500
    }
  },
  corporate: {
    name: 'Corporate Gray',
    description: 'Professional gray theme',
    colors: {
      primary: '#374151', // gray-700
      primaryHover: '#1f2937', // gray-800
      primaryLight: '#d1d5db', // gray-300
      secondary: '#0891b2', // cyan-600
      secondaryHover: '#0e7490', // cyan-700
      accent: '#6b7280', // gray-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#3b82f6', // blue-500
    }
  },
  sunset: {
    name: 'Sunset Orange',
    description: 'Warm sunset theme',
    colors: {
      primary: '#dc2626', // red-600
      primaryHover: '#b91c1c', // red-700
      primaryLight: '#fecaca', // red-200
      secondary: '#d97706', // amber-600
      secondaryHover: '#b45309', // amber-700
      accent: '#f97316', // orange-500
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      danger: '#dc2626', // red-600
      info: '#0ea5e9', // sky-500
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('univar-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [currentPalette, setCurrentPalette] = useState(() => {
    const saved = localStorage.getItem('univar-theme-palette');
    return saved || 'univar';
  });

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('univar-custom-colors');
    return saved ? JSON.parse(saved) : {};
  });

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : null;
  };

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const palette = THEME_PALETTES[currentPalette];
    
    if (palette) {
      // Apply color variables
      Object.entries(palette.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
        // Also set RGB version for rgba() usage
        const rgbValue = hexToRgb(value);
        if (rgbValue) {
          root.style.setProperty(`--color-${key}-rgb`, rgbValue);
        }
      });
    }

    // Apply custom colors if any
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      // Also set RGB version for rgba() usage
      const rgbValue = hexToRgb(value);
      if (rgbValue) {
        root.style.setProperty(`--color-${key}-rgb`, rgbValue);
      }
    });

    // Apply dark mode class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('univar-dark-mode', JSON.stringify(isDarkMode));
    localStorage.setItem('univar-theme-palette', currentPalette);
    localStorage.setItem('univar-custom-colors', JSON.stringify(customColors));
  }, [isDarkMode, currentPalette, customColors]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const changePalette = (paletteKey) => {
    if (THEME_PALETTES[paletteKey]) {
      setCurrentPalette(paletteKey);
    }
  };

  const updateCustomColor = (colorKey, colorValue) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: colorValue
    }));
  };

  const resetToDefault = () => {
    setCurrentPalette('univar');
    setCustomColors({});
    setIsDarkMode(false);
  };

  const getCurrentColors = () => {
    const palette = THEME_PALETTES[currentPalette];
    return {
      ...palette?.colors,
      ...customColors
    };
  };

  const value = {
    isDarkMode,
    currentPalette,
    customColors,
    palettes: THEME_PALETTES,
    toggleDarkMode,
    changePalette,
    updateCustomColor,
    resetToDefault,
    getCurrentColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;