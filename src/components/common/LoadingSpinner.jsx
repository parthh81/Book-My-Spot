import React from 'react';

/**
 * LoadingSpinner - A reusable loading indicator component
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {string} props.color - Color of the spinner (primary, secondary, white)
 * @param {string} props.text - Optional text to display below the spinner
 * @param {boolean} props.fullPage - Whether the spinner should take the full page
 * @returns {JSX.Element} The loading spinner component
 */
export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading...',
  fullPage = false
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  // Container classes based on fullPage prop
  const containerClasses = fullPage 
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50' 
    : 'flex flex-col items-center justify-center py-4';
  
  return (
    <div className={containerClasses}>
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} 
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className={`mt-3 text-${color === 'white' ? 'white' : 'gray-700'}`}>
          {text}
        </p>
      )}
    </div>
  );
}; 