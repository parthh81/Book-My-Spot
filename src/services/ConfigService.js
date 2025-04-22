import ApiService from './ApiService';

/**
 * ConfigService provides methods for interacting with the configuration API endpoints
 */
class ConfigService {
  /**
   * Get API base URL
   * @returns {string} API base URL
   */
  static getApiUrl() {
    return import.meta.env?.VITE_API_URL || 'http://localhost:3200';
  }

  /**
   * Get current configuration
   * @returns {Promise<Object>} Configuration data
   */
  static async getConfig() {
    try {
      const response = await ApiService.get('/api/config');
      return response || { initializeSampleData: true };
    } catch (error) {
      console.error('Error fetching configuration:', error);
      return { initializeSampleData: true };
    }
  }

  /**
   * Toggle sample data initialization
   * @param {boolean} enable Whether to enable sample data initialization
   * @returns {Promise<Object>} Updated configuration
   */
  static async toggleSampleData(enable) {
    try {
      const response = await ApiService.post('/api/config/toggleSampleData', { enable });
      return response || { initializeSampleData: enable };
    } catch (error) {
      console.error('Error updating sample data configuration:', error);
      
      // If the endpoint doesn't exist (404), update localStorage as a fallback
      if (error.response && error.response.status === 404) {
        console.log('Config API not available, using localStorage fallback');
        localStorage.setItem('sampleDataEnabled', enable ? 'true' : 'false');
        return { initializeSampleData: enable, source: 'localStorage' };
      }
      
      throw error;
    }
  }
  
  /**
   * Check if sample data is enabled
   * @returns {boolean} Whether sample data is enabled
   */
  static isSampleDataEnabled() {
    // First check localStorage (client-side setting)
    const localSetting = localStorage.getItem('sampleDataEnabled');
    if (localSetting !== null) {
      return localSetting === 'true';
    }
    
    // Default is enabled if no setting found
    return true;
  }
}

export default ConfigService;
