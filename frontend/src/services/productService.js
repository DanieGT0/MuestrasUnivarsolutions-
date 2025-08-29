// src/services/productService.js
import authService from './authService';
import ProductAdapter from '../adapters/productAdapter';
import { buildApiUrl } from '../config/api';

class ProductService {
  async getProducts(params = {}) {
    try {
      const token = authService.getToken();
      console.log('Token from authService:', token ? 'EXISTS' : 'MISSING');
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.categoria_id) queryParams.append('categoria_id', params.categoria_id);
      if (params.estado_vencimiento) queryParams.append('estado_vencimiento', params.estado_vencimiento);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${buildApiUrl('/products')}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener productos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl(`/products/${productId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener producto');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      // Transform data using ProductAdapter to fix timezone issues
      console.log('[ProductService] Original product data:', productData);
      const transformedData = ProductAdapter.toBackendCreate(productData);
      console.log('[ProductService] Transformed product data:', transformedData);

      const response = await fetch(buildApiUrl('/products'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear producto');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      // Transform data using ProductAdapter to fix timezone issues
      console.log('[ProductService] Original update data:', productData);
      const transformedData = ProductAdapter.toBackendUpdate(productData);
      console.log('[ProductService] Transformed update data:', transformedData);

      const response = await fetch(buildApiUrl(`/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar producto');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl(`/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar producto');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async getProductStats() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl('/products/stats/summary'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener estad�sticas');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async generateProductCode() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl('/products/generate-code'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al generar c�digo');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getAvailableCountries() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl('/products/available-countries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener países disponibles');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();