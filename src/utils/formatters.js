/**
 * Utility functions for formatting dates and currency
 */

/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Default options
    const defaultOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date and time to a human-readable string
 * @param {string|Date} dateTime - The date and time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (dateTime, options = {}) => {
  if (!dateTime) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Date(dateTime).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a number as currency (default: INR)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: INR)
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR', options = {}) => {
  if (amount === undefined || amount === null) return '₹0';
  
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Default options
    const defaultOptions = {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      ...options
    };
    
    return new Intl.NumberFormat('en-IN', defaultOptions).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${amount}`;
  }
};

/**
 * Format a number with commas for better readability
 * @param {number} number - The number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  try {
    return new Intl.NumberFormat('en-IN').format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

/**
 * Format a phone number to a readable format
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on the length of digits
  if (digits.length === 10) {
    // For 10-digit Indian numbers
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length > 10) {
    // For international numbers, use a simple grouping
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  // If it doesn't match expected patterns, return as is
  return phone;
};

/**
 * Format a time string to 12-hour format with AM/PM
 * @param {string} time - Time string in 24-hour format (HH:MM)
 * @returns {string} Formatted time in 12-hour format
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    // For a simple HH:MM format
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time;
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @param {string} locale - The locale code (default: 'en-IN')
 * @returns {string} The formatted number string
 */
export const formatCount = (number, locale = 'en-IN') => {
  if (number === null || number === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return `${number}`;
  }
};

/**
 * Format a time duration in minutes to hours and minutes
 * @param {number} minutes - The number of minutes
 * @returns {string} The formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return 'N/A';
  
  try {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min${mins !== 1 ? 's' : ''}`;
    } else if (mins === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return `${minutes} min`;
  }
};

/**
 * Format a file size in bytes to human-readable format
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - The number of decimal places (default: 2)
 * @returns {string} The formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === null || bytes === undefined) return 'N/A';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} The title-cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats percentage values
 * @param {number} value - Percentage value to format
 * @param {number} decimalPlaces - Number of decimal places to include
 * @return {string} Formatted percentage string
 */
export const formatPercentage = (value, decimalPlaces = 0) => {
  if (value === null || value === undefined) return '';
  return value.toFixed(decimalPlaces) + '%';
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length to allow
 * @return {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}; 