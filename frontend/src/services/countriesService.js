import api from './api';

export const countriesService = {
  // Obtener todos los países
  async getAll(params = {}) {
    try {
      const response = await fetch('http://localhost:8000/api/v1/countries');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  // Obtener países activos solamente
  async getActive() {
    try {
      const { data } = await api.get('/countries', { 
        params: { active_only: true } 
      });
      return data;
    } catch (error) {
      console.error('Error fetching active countries:', error);
      throw error;
    }
  },

  // Obtener país por ID
  async getById(id) {
    try {
      const { data } = await api.get(`/countries/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching country:', error);
      throw error;
    }
  },

  // Crear nuevo país
  async create(countryData) {
    try {
      const { data } = await api.post('/countries', countryData);
      return data;
    } catch (error) {
      console.error('Error creating country:', error);
      throw error;
    }
  },

  // Actualizar país
  async update(id, countryData) {
    try {
      const { data } = await api.put(`/countries/${id}`, countryData);
      return data;
    } catch (error) {
      console.error('Error updating country:', error);
      throw error;
    }
  },

  // Eliminar país
  async delete(id) {
    try {
      const { data } = await api.delete(`/countries/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting country:', error);
      throw error;
    }
  },

  // Cambiar estado activo/inactivo
  async toggleActive(id) {
    try {
      const { data } = await api.patch(`/countries/${id}/toggle-active`);
      return data;
    } catch (error) {
      console.error('Error toggling country status:', error);
      throw error;
    }
  }
};

export default countriesService;