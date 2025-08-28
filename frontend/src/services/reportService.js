import api from './api';

const reportService = {
  // Stock por categoria
  getStockByCategory: async (categoryId = null) => {
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const response = await api.get('/reports/commercial/stock-by-category', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock by category:', error);
      throw error;
    }
  },

  // Resumen de movimientos
  getMovementsSummary: async (fechaDesde = null, fechaHasta = null, categoryId = null) => {
    try {
      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      if (categoryId) params.category_id = categoryId;
      
      const response = await api.get('/reports/commercial/movements-summary', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movements summary:', error);
      throw error;
    }
  },

  // Timeline de movimientos
  getMovementsTimeline: async (fechaDesde = null, fechaHasta = null, groupBy = 'day') => {
    try {
      const params = { group_by: groupBy };
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      
      const response = await api.get('/reports/commercial/movements-timeline', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movements timeline:', error);
      throw error;
    }
  },

  // Resumen por paises
  getCountriesSummary: async () => {
    try {
      const response = await api.get('/reports/commercial/countries-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries summary:', error);
      throw error;
    }
  },

  // Alertas de stock bajo
  getLowStockAlerts: async (minStockThreshold = 10) => {
    try {
      const params = { min_stock_threshold: minStockThreshold };
      const response = await api.get('/reports/commercial/low-stock-alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw error;
    }
  },

  // Dashboard completo
  getCommercialDashboard: async () => {
    try {
      const response = await api.get('/reports/commercial/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching commercial dashboard:', error);
      throw error;
    }
  },

  // Tabla de inventarios
  getInventoryTable: async (categoryId = null, limit = 100, offset = 0) => {
    try {
      const params = { limit, offset };
      if (categoryId) params.category_id = categoryId;
      
      const response = await api.get('/reports/commercial/inventory-table', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory table:', error);
      throw error;
    }
  },

  // Utilidades para fechas
  formatDateForAPI: (date) => {
    if (!date) return null;
    return date.toISOString();
  },

  getLastMonthRange: () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return {
      fechaDesde: reportService.formatDateForAPI(lastMonth),
      fechaHasta: reportService.formatDateForAPI(now)
    };
  },

  getLastWeekRange: () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      fechaDesde: reportService.formatDateForAPI(lastWeek),
      fechaHasta: reportService.formatDateForAPI(now)
    };
  },

  getThisMonthRange: () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      fechaDesde: reportService.formatDateForAPI(startOfMonth),
      fechaHasta: reportService.formatDateForAPI(now)
    };
  },

  // Métricas de rotación de inventario
  getInventoryRotationMetrics: async (categoryId = null, daysBack = 90) => {
    try {
      const params = { days_back: daysBack };
      if (categoryId) params.category_id = categoryId;
      
      const response = await api.get('/reports/commercial/inventory-rotation', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory rotation metrics:', error);
      
      // Si hay error, retornar datos vacíos para no romper la UI
      return {
        products: [],
        category_averages: [],
        age_distribution: {
          '0-30': 0,
          '31-60': 0,
          '61-90': 0,
          '90+': 0
        },
        global_stats: {
          total_products: 0,
          fast_moving_products: 0,
          slow_moving_products: 0,
          fast_moving_percentage: 0,
          avg_days_permanence: 0,
          avg_velocity_per_day: 0
        },
        analysis_period_days: daysBack,
        generated_at: new Date().toISOString()
      };
    }
  }
};

export default reportService;