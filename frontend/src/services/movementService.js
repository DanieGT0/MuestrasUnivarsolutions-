import api from './api';

const movementService = {
  // Registrar entrada de inventario
  registrarEntrada: async (entradaData) => {
    try {
      const response = await api.post('/movements/entrada', entradaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar salida de inventario
  registrarSalida: async (salidaData) => {
    try {
      const response = await api.post('/movements/salida', salidaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar ajuste de inventario (solo admin)
  registrarAjuste: async (ajusteData) => {
    try {
      const response = await api.post('/movements/ajuste', ajusteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener lista de movimientos
  getMovements: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.product_id) queryParams.append('product_id', params.product_id);
      if (params.responsable) queryParams.append('responsable', params.responsable);
      if (params.country_id) queryParams.append('country_id', params.country_id);
      if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
      if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = `/movements/${queryString ? '?' + queryString : ''}`;
      
      // Debug log
      console.log('Calling API with URL:', url);
      console.log('Query params:', Object.fromEntries(queryParams));
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener movimiento por ID
  getMovementById: async (movementId) => {
    try {
      const response = await api.get(`/movements/${movementId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener Kardex de un producto
  getKardexByProduct: async (productId) => {
    try {
      const response = await api.get(`/movements/kardex/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadisticas de movimientos
  getMovementStats: async () => {
    try {
      const response = await api.get('/movements/stats/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tipos de movimiento
  MOVEMENT_TYPES: {
    ENTRADA: 'entrada',
    SALIDA: 'salida',
    AJUSTE: 'ajuste',
    INICIAL: 'inicial'
  },

  // Labels para tipos de movimiento (soporta tanto mayúsculas como minúsculas)
  MOVEMENT_TYPE_LABELS: {
    entrada: 'Entrada',
    salida: 'Salida', 
    ajuste: 'Ajuste',
    inicial: 'Stock Inicial',
    ENTRADA: 'Entrada',
    SALIDA: 'Salida', 
    AJUSTE: 'Ajuste',
    INICIAL: 'Stock Inicial'
  },

  // Colores para tipos de movimiento (soporta tanto mayúsculas como minúsculas)
  MOVEMENT_TYPE_COLORS: {
    entrada: 'green',
    salida: 'red',
    ajuste: 'blue',
    inicial: 'gray',
    ENTRADA: 'green',
    SALIDA: 'red',
    AJUSTE: 'blue',
    INICIAL: 'gray'
  }
};

export default movementService;