// Configuración central de API para desarrollo y producción
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Función para obtener headers con autorización
  getAuthHeaders: () => {
    const token = localStorage.getItem('access_token');
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
};

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Configuración por defecto
export default API_CONFIG;