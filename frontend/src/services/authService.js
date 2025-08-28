// src/services/authService.js
import { buildApiUrl, API_CONFIG } from '../config/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Guardar token y datos del usuario
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(buildApiUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await fetch(buildApiUrl('/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return await response.json();
    } catch (error) {
      this.logout(); // Limpiar si hay error
      throw error;
    }
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token no ha expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        this.logout(); // Token expirado
        return false;
      }
      
      return true;
    } catch (error) {
      this.logout(); // Token malformado
      return false;
    }
  }
}

export default new AuthService();