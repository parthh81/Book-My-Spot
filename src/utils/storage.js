/**
 * Storage utilities for managing local storage, session storage, and cookies
 */

// Local Storage Utilities
/**
 * Store data in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export const setLocalItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Retrieve data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Retrieved value or defaultValue if not found
 */
export const getLocalItem = (key, defaultValue = null) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    }
    return defaultValue;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key to remove
 */
export const removeLocalItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};

// Session Storage Utilities
/**
 * Store data in sessionStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export const setSessionItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error setting sessionStorage item:', error);
  }
};

/**
 * Retrieve data from sessionStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Retrieved value or defaultValue if not found
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    }
    return defaultValue;
  } catch (error) {
    console.error('Error getting sessionStorage item:', error);
    return defaultValue;
  }
};

/**
 * Remove item from sessionStorage
 * @param {string} key - Storage key to remove
 */
export const removeSessionItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing sessionStorage item:', error);
  }
};

// Cookie Utilities
/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Cookie expiration in days
 */
export const setCookie = (name, value, days = 7) => {
  try {
    if (typeof window !== 'undefined' && window.document) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      window.document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  try {
    if (typeof window !== 'undefined' && window.document) {
      const nameEQ = `${name}=`;
      const ca = window.document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name to delete
 */
export const deleteCookie = (name) => {
  try {
    if (typeof window !== 'undefined' && window.document) {
      window.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  } catch (error) {
    console.error('Error deleting cookie:', error);
  }
};

/**
 * Clear all storage (localStorage, sessionStorage, and cookies)
 * @param {Array} excludeKeys - Keys to exclude from clearing
 */
export const clearAllStorage = (excludeKeys = []) => {
  try {
    if (typeof window !== 'undefined') {
      // Clear localStorage except excluded keys
      if (window.localStorage) {
        Object.keys(window.localStorage).forEach(key => {
          if (!excludeKeys.includes(key)) {
            window.localStorage.removeItem(key);
          }
        });
      }
      
      // Clear sessionStorage except excluded keys
      if (window.sessionStorage) {
        Object.keys(window.sessionStorage).forEach(key => {
          if (!excludeKeys.includes(key)) {
            window.sessionStorage.removeItem(key);
          }
        });
      }
      
      // Clear cookies except excluded keys
      if (window.document) {
        const cookies = window.document.cookie.split(';');
        cookies.forEach(cookie => {
          const cookieName = cookie.split('=')[0].trim();
          if (!excludeKeys.includes(cookieName)) {
            deleteCookie(cookieName);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error clearing all storage:', error);
  }
}; 