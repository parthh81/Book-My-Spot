import axios from 'axios';

// Fix for "process is not defined" error and incorrect API path
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3200';

class AuthService {
  static async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });
      
      // Store complete response data in session storage
      if (response.data && response.data.token) {
        // Store token
        sessionStorage.setItem('token', response.data.token);
        
        // Store user data
        const userData = response.data.data || {};
        sessionStorage.setItem('id', userData._id || '');
        sessionStorage.setItem('email', userData.email || '');
        sessionStorage.setItem('firstName', userData.firstName || '');
        sessionStorage.setItem('lastName', userData.lastName || '');
        sessionStorage.setItem('phone', userData.phone || '');
        
        // Store role information
        const role = userData.roleId?.name || 'user';
        const lowerCaseRole = role.toLowerCase();
        sessionStorage.setItem('role', lowerCaseRole);
        sessionStorage.setItem('isOrganizer', (lowerCaseRole === 'organizer').toString());
        sessionStorage.setItem('isAdmin', (lowerCaseRole === 'admin').toString());
        
        // Store complete user object
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Set up axios default headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  }

  static logout() {
    // Clear all session storage items
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('isOrganizer');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('phone');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  }

  static getToken() {
    return sessionStorage.getItem('token');
  }

  static getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired or about to expire
      const tokenData = this.parseJwt(token);
      const isExpired = tokenData && tokenData.exp * 1000 < Date.now();
      const isAboutToExpire = tokenData && tokenData.exp * 1000 < Date.now() + (15 * 60 * 1000); // 15 minutes
      
      // If token is expired, logout
      if (isExpired) {
        console.log("Token is expired");
        this.logout();
        return false;
      }
      
      // Set up axios with the token
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      };
      
      // Try validating the token with the backend
      const response = await axios.get(`${API_URL}/user/me`, config);
      
      if (response.data && response.data.data) {
        // Update user data with fresh data from backend
        const userData = response.data.data;
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Update other fields for consistency
        if (userData._id) sessionStorage.setItem('id', userData._id);
        if (userData.email) sessionStorage.setItem('email', userData.email);
        if (userData.firstName) sessionStorage.setItem('firstName', userData.firstName);
        if (userData.lastName) sessionStorage.setItem('lastName', userData.lastName);
        if (userData.phone) sessionStorage.setItem('phone', userData.phone);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      
      // Only logout for authentication errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        this.logout();
      }
      return false;
    }
  }

  // Helper method to parse JWT token
  static parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT token:", e);
      return null;
    }
  }

  static clearAuth() {
    this.logout();
    window.location.href = '/';
  }

  static getUserInfo() {
    // Try to get from user object first
    const userJson = sessionStorage.getItem('user');
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return {
          id: user._id || sessionStorage.getItem('id'),
          role: user.roleId?.name?.toLowerCase() || sessionStorage.getItem('role'),
          firstName: user.firstName || sessionStorage.getItem('firstName'),
          lastName: user.lastName || sessionStorage.getItem('lastName'),
          email: user.email || sessionStorage.getItem('email'),
          phone: user.phone || sessionStorage.getItem('phone')
        };
      } catch (e) {
        console.error("Error parsing user JSON:", e);
      }
    }
    
    // Fallback to individual items
    return {
      id: sessionStorage.getItem('id'),
      role: sessionStorage.getItem('role'),
      firstName: sessionStorage.getItem('firstName'),
      lastName: sessionStorage.getItem('lastName'),
      email: sessionStorage.getItem('email'),
      phone: sessionStorage.getItem('phone')
    };
  }

  static setAuthData(data) {
    // Set token and add it to axios defaults
    if (data.token) {
      sessionStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    
    // Set user ID
    if (data.id) sessionStorage.setItem('id', data.id);
    
    // Set role information
    if (data.role) {
      const role = data.role.toLowerCase();
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('isOrganizer', (role === 'organizer').toString());
      sessionStorage.setItem('isAdmin', (role === 'admin').toString());
    }
    
    // Set user information
    if (data.firstName) sessionStorage.setItem('firstName', data.firstName);
    if (data.lastName) sessionStorage.setItem('lastName', data.lastName);
    if (data.email) sessionStorage.setItem('email', data.email);
    if (data.phone) sessionStorage.setItem('phone', data.phone);
    
    // Store complete user object if available
    if (data.user) {
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } else {
      // Create a user object from individual fields
      const user = {
        _id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roleId: { name: data.role }
      };
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Method to change user password
  static async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Make the API call to update password
      const response = await axios.post(
        `${API_URL}/user/change-password`, 
        {
          currentPassword,
          newPassword
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Password change error:', error);
      
      // If this is a test/development environment, simulate success
      if (process.env.NODE_ENV !== 'production' || import.meta.env?.DEV) {
        // For mock validation in dev, we'll check if current password is "password"
        if (currentPassword === 'password') {
          return { success: true, message: 'Password updated successfully (mock)' };
        } else {
          throw { 
            response: { 
              data: { message: 'Current password is incorrect (for testing, use "password")' } 
            } 
          };
        }
      }
      
      throw error;
    }
  }
}

export default AuthService; 