import api from './api';

const BASE_URL = '/users';

export const userService = {
  // Obtener todos los usuarios con filtros y paginación
  getUsers: async (params = {}) => {
    const { skip = 0, limit = 100, roleId, countryId, isActive } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (roleId) queryParams.append('role_id', roleId);
    if (countryId) queryParams.append('country_id', countryId);
    if (isActive !== undefined) queryParams.append('is_active', isActive);
    
    const response = await api.get(`${BASE_URL}?${queryParams}`);
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    const response = await api.post(BASE_URL, userData);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await api.put(`${BASE_URL}/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Buscar usuarios
  searchUsers: async (query, limit = 50) => {
    const response = await api.get(`${BASE_URL}/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  },

  // Obtener usuarios por país
  getUsersByCountry: async (countryId) => {
    const response = await api.get(`${BASE_URL}/by-country/${countryId}`);
    return response.data;
  },

  // Obtener usuarios comerciales por categoría
  getCommercialUsersByCategory: async (categoryId) => {
    const response = await api.get(`${BASE_URL}/commercial/by-category/${categoryId}`);
    return response.data;
  },

  // Validar acceso de usuario a país
  validateUserCountryAccess: async (userId, countryId) => {
    const response = await api.get(`${BASE_URL}/${userId}/validate-country/${countryId}`);
    return response.data;
  },

  // Datos de referencia
  getRoles: async () => {
    const response = await api.get(`${BASE_URL}/reference/roles`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get(`${BASE_URL}/reference/categories`);
    return response.data;
  },

  getCountries: async () => {
    const response = await api.get(`${BASE_URL}/reference/countries`);
    return response.data;
  }
};

export default userService;