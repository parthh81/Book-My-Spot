import axios from 'axios';
import AuthService from './AuthService';

// This should match the URL in AuthService
const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3200';

/**
 * ApiService provides methods for making authenticated API requests
 */
class ApiService {
  /**
   * Get the JWT token from AuthService
   * @returns {string} The JWT token or empty string if not found
   */
  static getToken() {
    return AuthService.getToken() || '';
  }

  /**
   * Get headers for authenticated requests
   * @returns {Object} Headers object with Authorization if token exists
   */
  static getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Ensure axios is configured with the proper defaults
   */
  static configureAxios() {
    // Set base URL
    axios.defaults.baseURL = BASE_URL;
    
    // Set auth header if token exists
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Explicitly set the authorization token in axios headers
   * @param {string} token - The JWT token to set
   */
  static setAuthToken(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set with token');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Authorization header removed');
    }
  }

  /**
   * Check if the backend is available
   * @returns {Promise<boolean>} True if backend is available, false otherwise
   */
  static async isBackendAvailable() {
    try {
      await axios.get(`${BASE_URL}/healthcheck`, { timeout: 3000 });
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      return false;
    }
  }

  /**
   * Make a GET request to the API with retry logic
   * @param {string} endpoint - API endpoint to call
   * @param {Object} params - Query parameters
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async get(endpoint, params = {}, retries = 1) {
    this.configureAxios();
    try {
      console.log(`Making GET request to ${endpoint} with params:`, params);
      
      // Ensure params are properly converted to the right types
      const processedParams = {};
      for (const key in params) {
        // Skip null or undefined values
        if (params[key] === null || params[key] === undefined) continue;
        
        // Convert categoryId to number if it's a string and looks like a number
        if (key === 'categoryId' && typeof params[key] === 'string' && !isNaN(params[key])) {
          processedParams[key] = Number(params[key]);
        } else {
          processedParams[key] = params[key];
        }
      }
      
      console.log('Processed params:', processedParams);
      
      const response = await axios.get(endpoint, {
        params: processedParams
      });
      
      console.log(`Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${endpoint}:`, error);
      
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying GET request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.get(endpoint, params, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request to the API with retry logic
   * @param {string} endpoint - API endpoint to call
   * @param {Object} data - Data to send in request body
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async post(endpoint, data = {}, retries = 1) {
    this.configureAxios();
    try {
      const response = await axios.post(endpoint, data);
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying POST request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.post(endpoint, data, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request to the API with retry logic
   * @param {string} endpoint - API endpoint to call
   * @param {Object} data - Data to send in request body
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async put(endpoint, data = {}, retries = 1) {
    this.configureAxios();
    try {
      const response = await axios.put(endpoint, data);
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying PUT request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.put(endpoint, data, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request to the API with retry logic
   * @param {string} endpoint - API endpoint to call
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async delete(endpoint, retries = 1) {
    this.configureAxios();
    try {
      const response = await axios.delete(endpoint);
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying DELETE request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.delete(endpoint, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request with FormData to the API (for file uploads)
   * @param {string} endpoint - API endpoint to call
   * @param {FormData} formData - FormData object with fields and files
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async putFormData(endpoint, formData, retries = 1) {
    // Configure Axios
    this.configureAxios();
    
    try {
      // For FormData, we need to remove the Content-Type header so that
      // the browser can set the correct boundary for multipart/form-data
      const token = this.getToken();
      const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      console.log(`Making PUT FormData request to ${endpoint}`);
      const response = await axios.put(endpoint, formData, { headers });
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying FormData PUT request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.putFormData(endpoint, formData, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request with FormData to the API (for file uploads)
   * @param {string} endpoint - API endpoint to call
   * @param {FormData} formData - FormData object with fields and files
   * @param {number} retries - Number of retries, default 1
   * @returns {Promise} Promise with response data
   */
  static async postFormData(endpoint, formData, retries = 1) {
    // Configure Axios
    this.configureAxios();
    
    try {
      // For FormData, we need to remove the Content-Type header so that
      // the browser can set the correct boundary for multipart/form-data
      const token = this.getToken();
      const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      console.log(`Making POST FormData request to ${endpoint}`);
      const response = await axios.post(endpoint, formData, { headers });
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        console.log(`Retrying FormData POST request to ${endpoint}, ${retries} retries left`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.postFormData(endpoint, formData, retries - 1);
      }
      
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object from axios
   */
  static handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API request failed:', error);
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // If there's a specific validation error, log it
      if (error.response.data && error.response.data.error) {
        console.error('Validation error:', error.response.data.error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    // Check for network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network error: Could not connect to the backend server.');
      // Show notification to user if needed
    }
    
    // Handle token expiration
    else if (error.response && error.response.status === 401) {
      // Use AuthService to handle logout
      AuthService.logout();
      window.location.href = '/login';
    }
    
    // Log all API errors
    console.error('API request failed:', error);
  }
}

export default ApiService; 