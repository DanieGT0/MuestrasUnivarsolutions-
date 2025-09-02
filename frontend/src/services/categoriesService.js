import api from './api';

export const categoriesService = {
  // Obtener todas las categorías
  async getAll(params = {}) {
    try {
      const { data } = await api.get('/categories/', { params });
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Obtener categorías activas solamente
  async getActive() {
    try {
      const { data } = await api.get('/categories/', { 
        params: { active_only: true } 
      });
      return data;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  async getById(id) {
    try {
      const { data } = await api.get(`/categories/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Crear nueva categoría
  async create(categoryData) {
    try {
      const { data } = await api.post('/categories/', categoryData);
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Actualizar categoría
  async update(id, categoryData) {
    try {
      const { data } = await api.put(`/categories/${id}`, categoryData);
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Eliminar categoría
  async delete(id) {
    try {
      const { data } = await api.delete(`/categories/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Cambiar estado activo/inactivo
  async toggleActive(id) {
    try {
      const { data } = await api.patch(`/categories/${id}/toggle-active`);
      return data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  }
};

export default categoriesService;