/**
 * Configuration constants for the application
 */

// API base URL for all API requests
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

// Other constants can be added here as needed
export const APP_NAME = 'BookMySpot';

// Authentication related constants
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_INFO_KEY = 'user_info';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// File upload limits (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Timeout durations (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds 