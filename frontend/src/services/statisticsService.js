import { buildApiUrl } from '../config/api';

export const statisticsService = {
  // Obtener estadísticas de un país específico
  async getCountryStatistics(countryCode) {
    try {
      const response = await fetch(buildApiUrl(`/statistics/country/${countryCode}`));
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching country statistics:', error);
      throw error;
    }
  },

  // Obtener estadísticas de todos los países
  async getAllCountriesStatistics() {
    try {
      const response = await fetch(buildApiUrl('/statistics/all-countries'));
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all countries statistics:', error);
      throw error;
    }
  },

  // Eliminar productos de un país
  async deleteCountryProducts(countryCode, includeMovements = false) {
    try {
      const url = `${buildApiUrl(`/statistics/country/${countryCode}/products`)}?include_movements=${includeMovements}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting country products:', error);
      throw error;
    }
  },

  // Eliminar movimientos de un país
  async deleteCountryMovements(countryCode) {
    try {
      const response = await fetch(buildApiUrl(`/statistics/country/${countryCode}/movements`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting country movements:', error);
      throw error;
    }
  },

  // Eliminar todos los datos de un país
  async deleteAllCountryData(countryCode) {
    try {
      const response = await fetch(buildApiUrl(`/statistics/country/${countryCode}/all`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting all country data:', error);
      throw error;
    }
  }
};